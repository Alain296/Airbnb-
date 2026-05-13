import { Request, Response } from "express";
import prisma from "../config/prisma";
import { handleControllerError } from "../utils/error-handler";
import { getCache, setCache, cacheKeys } from "../config/cache";

/**
 * Get comprehensive listing statistics
 * GET /listings/stats
 */
export const getListingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Try cache first
    const cacheKey = cacheKeys.listingStats();
    const cachedResult = getCache(cacheKey);
    
    if (cachedResult) {
      res.status(200).json(cachedResult);
      return;
    }

    // Execute all queries in parallel for better performance
    const [
      totalListings,
      averagePrice,
      byLocation,
      byType,
      priceRanges,
      topRatedListings
    ] = await Promise.all([
      // Total count of all listings
      prisma.listing.count(),
      
      // Average price per night across all listings
      prisma.listing.aggregate({
        _avg: { pricePerNight: true }
      }),
      
      // Count of listings grouped by location
      prisma.listing.groupBy({
        by: ['location'],
        _count: { location: true },
        orderBy: { _count: { location: 'desc' } },
        take: 10 // Top 10 locations
      }),
      
      // Count of listings grouped by type
      prisma.listing.groupBy({
        by: ['type'],
        _count: { type: true },
        orderBy: { _count: { type: 'desc' } }
      }),
      
      // Price range distribution
      Promise.all([
        prisma.listing.count({ where: { pricePerNight: { lt: 50 } } }),
        prisma.listing.count({ where: { pricePerNight: { gte: 50, lt: 100 } } }),
        prisma.listing.count({ where: { pricePerNight: { gte: 100, lt: 200 } } }),
        prisma.listing.count({ where: { pricePerNight: { gte: 200, lt: 500 } } }),
        prisma.listing.count({ where: { pricePerNight: { gte: 500 } } })
      ]),
      
      // Top rated listings (with at least 1 review)
      prisma.listing.findMany({
        where: { 
          rating: { not: null },
          reviews: { some: {} }
        },
        orderBy: { rating: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          location: true,
          rating: true,
          pricePerNight: true,
          _count: { select: { reviews: true } }
        }
      })
    ]);

    // Calculate additional metrics
    const [minPrice, maxPrice] = await Promise.all([
      prisma.listing.findFirst({
        orderBy: { pricePerNight: 'asc' },
        select: { pricePerNight: true }
      }),
      prisma.listing.findFirst({
        orderBy: { pricePerNight: 'desc' },
        select: { pricePerNight: true }
      })
    ]);

    const result = {
      totalListings,
      averagePrice: averagePrice._avg.pricePerNight ? 
        Math.round(averagePrice._avg.pricePerNight * 100) / 100 : 0,
      priceRange: {
        min: minPrice?.pricePerNight || 0,
        max: maxPrice?.pricePerNight || 0
      },
      byLocation: byLocation.map(item => ({
        location: item.location,
        count: item._count.location
      })),
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      priceDistribution: {
        under50: priceRanges[0],
        from50to100: priceRanges[1],
        from100to200: priceRanges[2],
        from200to500: priceRanges[3],
        over500: priceRanges[4]
      },
      topRated: topRatedListings,
      generatedAt: new Date().toISOString()
    };

    // Cache for 5 minutes
    setCache(cacheKey, result, 300);

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res, "stats.getListingStats");
  }
};

/**
 * Get comprehensive user statistics
 * GET /users/stats
 */
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Try cache first
    const cacheKey = cacheKeys.userStats();
    const cachedResult = getCache(cacheKey);
    
    if (cachedResult) {
      res.status(200).json(cachedResult);
      return;
    }

    // Execute all queries in parallel
    const [
      totalUsers,
      byRole,
      recentSignups,
      activeHosts,
      activeGuests
    ] = await Promise.all([
      // Total count of all users
      prisma.user.count(),
      
      // Count of users grouped by role
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      
      // Recent signups (last 30 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Active hosts (hosts with at least one listing)
      prisma.user.count({
        where: {
          role: 'HOST',
          listings: { some: {} }
        }
      }),
      
      // Active guests (guests with at least one booking)
      prisma.user.count({
        where: {
          role: 'GUEST',
          bookings: { some: {} }
        }
      })
    ]);

    // Get top hosts by number of listings
    const topHosts = await prisma.user.findMany({
      where: { role: 'HOST' },
      select: {
        id: true,
        name: true,
        avatar: true,
        _count: { 
          select: { 
            listings: true,
            bookings: true
          } 
        }
      },
      orderBy: { listings: { _count: 'desc' } },
      take: 5
    });

    // Get user growth over last 12 months
    const monthlyGrowth = await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return prisma.user.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        }).then(count => ({
          month: startOfMonth.toISOString().slice(0, 7), // YYYY-MM format
          newUsers: count
        }));
      })
    );

    const result = {
      totalUsers,
      byRole: byRole.map(item => ({
        role: item.role,
        count: item._count.role
      })),
      recentSignups,
      activeHosts,
      activeGuests,
      topHosts,
      monthlyGrowth: monthlyGrowth.reverse(), // Show oldest to newest
      generatedAt: new Date().toISOString()
    };

    // Cache for 5 minutes
    setCache(cacheKey, result, 300);

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res, "stats.getUserStats");
  }
};

/**
 * Get booking statistics
 * GET /bookings/stats
 */
export const getBookingStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // Execute all queries in parallel
    const [
      totalBookings,
      byStatus,
      totalRevenue,
      averageBookingValue,
      bookingsThisMonth,
      revenueThisMonth
    ] = await Promise.all([
      // Total bookings count
      prisma.booking.count(),
      
      // Bookings grouped by status
      prisma.booking.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      
      // Total revenue from confirmed bookings
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { totalPrice: true }
      }),
      
      // Average booking value
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED' },
        _avg: { totalPrice: true }
      }),
      
      // Bookings this month
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      
      // Revenue this month
      prisma.booking.aggregate({
        where: {
          status: 'CONFIRMED',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        },
        _sum: { totalPrice: true }
      })
    ]);

    // Get monthly booking trends (last 12 months)
    const monthlyTrends = await Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return Promise.all([
          prisma.booking.count({
            where: {
              createdAt: { gte: startOfMonth, lte: endOfMonth }
            }
          }),
          prisma.booking.aggregate({
            where: {
              status: 'CONFIRMED',
              createdAt: { gte: startOfMonth, lte: endOfMonth }
            },
            _sum: { totalPrice: true }
          })
        ]).then(([count, revenue]) => ({
          month: startOfMonth.toISOString().slice(0, 7),
          bookings: count,
          revenue: revenue._sum.totalPrice || 0
        }));
      })
    );

    const result = {
      totalBookings,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      revenue: {
        total: totalRevenue._sum.totalPrice || 0,
        average: averageBookingValue._avg.totalPrice ? 
          Math.round(averageBookingValue._avg.totalPrice * 100) / 100 : 0,
        thisMonth: revenueThisMonth._sum.totalPrice || 0
      },
      bookingsThisMonth,
      monthlyTrends: monthlyTrends.reverse(),
      generatedAt: new Date().toISOString()
    };

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res, "stats.getBookingStats");
  }
};