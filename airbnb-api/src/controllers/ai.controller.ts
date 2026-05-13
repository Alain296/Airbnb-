import { Request, Response } from "express";
import { model, deterministicModel } from "../config/ai";
import prisma from "../config/prisma";
import { handleControllerError } from "../utils/error-handler";
import { getParamAsString } from "../utils/params";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getCache as getCachedData, setCache as setCachedData } from "../config/cache";

interface SearchFilters {
  location?: string | null;
  type?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  guests?: number | null;
}

/**
 * Smart Listing Search with AI-powered filter extraction
 * POST /api/v1/ai/search
 */
export const smartSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body as { query?: string };
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ message: "Query is required and must be a non-empty string" });
      return;
    }

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be 1-50" 
      });
      return;
    }

    // Create prompt for AI to extract search filters
    const extractionPrompt = `
Extract search filters from this user query for an Airbnb-like platform. Return ONLY valid JSON with these exact fields:

{
  "location": "string or null",
  "type": "APARTMENT, HOUSE, STUDIO, CONDO or null", 
  "minPrice": "number or null",
  "maxPrice": "number or null",
  "guests": "number or null"
}

Rules:
- Only extract information explicitly mentioned in the query
- For type, use exact values: APARTMENT, HOUSE, STUDIO, CONDO
- For price, extract numbers mentioned with currency symbols or words like "under", "below", "max"
- For guests, look for numbers with words like "people", "guests", "person"
- If something is not mentioned, use null
- Return only the JSON object, no other text

User query: "${query}"`;

    try {
      // Get AI response for filter extraction
      const aiResponse = await deterministicModel.invoke(extractionPrompt);
      let filters: SearchFilters;

      try {
        // Parse AI response as JSON
        filters = JSON.parse(aiResponse.content as string);
      } catch (parseError) {
        console.error("AI returned invalid JSON:", aiResponse.content);
        res.status(500).json({ message: "AI service returned invalid response format" });
        return;
      }

      // Check if AI extracted any filters at all
      const hasFilters = Object.values(filters).some(value => value !== null && value !== undefined);
      
      if (!hasFilters) {
        res.status(400).json({ 
          message: "Could not extract any filters from your query, please be more specific" 
        });
        return;
      }

      // Build Prisma where clause from extracted filters
      const whereClause: any = {};
      
      if (filters.location) {
        whereClause.location = {
          contains: filters.location,
          mode: 'insensitive'
        };
      }
      
      if (filters.type) {
        whereClause.type = filters.type;
      }
      
      if (filters.minPrice || filters.maxPrice) {
        whereClause.pricePerNight = {};
        if (filters.minPrice) whereClause.pricePerNight.gte = filters.minPrice;
        if (filters.maxPrice) whereClause.pricePerNight.lte = filters.maxPrice;
      }
      
      if (filters.guests) {
        whereClause.guests = {
          gte: filters.guests
        };
      }

      // Execute parallel queries for listings and count
      const [listings, totalCount] = await Promise.all([
        prisma.listing.findMany({
          where: whereClause,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            host: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true
              }
            },
            photos: {
              select: { url: true },
              take: 1
            },
            _count: {
              select: { reviews: true }
            }
          }
        }),
        prisma.listing.count({
          where: whereClause
        })
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        filters,
        data: listings,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });

    } catch (aiError: any) {
      console.error("AI service error:", aiError);
      console.error("Error details:", {
        message: aiError.message,
        status: aiError.status,
        code: aiError.code,
        response: aiError.response?.data
      });
      
      // Handle specific Groq API errors
      if (aiError.status === 429) {
        res.status(429).json({ message: "AI service is busy, please try again in a moment" });
        return;
      }
      
      if (aiError.status === 401) {
        res.status(500).json({ message: "AI service configuration error" });
        return;
      }

      if (aiError.message?.includes('API key')) {
        res.status(500).json({ message: "AI service configuration error" });
        return;
      }
      
      res.status(500).json({ 
        message: "AI service temporarily unavailable",
        error: process.env.NODE_ENV === 'development' ? aiError.message : undefined
      });
    }

  } catch (error) {
    handleControllerError(error, res, "ai.smartSearch");
  }
};

/**
 * Generate AI-powered listing description
 * POST /api/v1/ai/generate-description
 */
export const generateDescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, location, type, guests, pricePerNight, amenities = [], tone = "friendly" } = req.body;

    // Create description generation prompt
    const descriptionPrompt = `
Generate a compelling Airbnb listing description with the following details:

Title: ${title}
Location: ${location}
Property Type: ${type}
Guests: ${guests}
Price: $${pricePerNight} per night
Amenities: ${amenities.length > 0 ? amenities.join(", ") : "Standard amenities"}
Tone: ${tone}

Requirements:
- Write in ${tone} tone
- 150-300 words
- Highlight unique features and location benefits
- Include amenities naturally in the description
- Make it engaging and bookable
- Use proper formatting with paragraphs
- End with a call-to-action

Return only the description text, no additional formatting or labels.`;

    try {
      const aiResponse = await model.invoke(descriptionPrompt);
      const description = (aiResponse.content as string).trim();

      if (!description || description.length < 50) {
        res.status(500).json({ message: "AI generated insufficient description content" });
        return;
      }

      res.status(200).json({
        description,
        metadata: {
          tone,
          wordCount: description.split(/\s+/).length,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (aiError: any) {
      console.error("AI description generation error:", aiError);
      
      if (aiError.status === 429) {
        res.status(429).json({ message: "AI service is busy, please try again in a moment" });
        return;
      }
      
      res.status(500).json({ message: "Description generation temporarily unavailable" });
    }

  } catch (error) {
    handleControllerError(error, res, "ai.generateDescription");
  }
};

/**
 * AI-powered guest support chatbot
 * POST /api/v1/ai/support
 */
export const guestSupport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, listingId, conversationId } = req.body;

    // Get listing context if provided
    let listingContext = "";
    if (listingId) {
      try {
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          include: {
            host: {
              select: { name: true, email: true }
            }
          }
        });

        if (listing) {
          listingContext = `
Listing Context:
- Property: ${listing.title}
- Location: ${listing.location}
- Type: ${listing.type}
- Guests: ${listing.guests}
- Price: $${listing.pricePerNight}/night
- Host: ${listing.host.name}
- Check-in: 3:00 PM
- Check-out: 11:00 AM`;
        }
      } catch (dbError) {
        console.error("Error fetching listing context:", dbError);
        // Continue without context
      }
    }

    // Create support chatbot prompt with comprehensive platform knowledge
    const supportPrompt = `
You are a professional AI assistant for an Airbnb-style vacation rental platform. You have comprehensive knowledge about how the platform works and can provide specific, accurate information about features and processes.

${listingContext}

PLATFORM FEATURES & PROCESSES YOU MUST KNOW:

1. BOOKING PROCESS:
   - Guests browse listings by location, type (APARTMENT, HOUSE, STUDIO, CONDO), price, and guest capacity
   - To book: Select dates → Review total price → Confirm booking → Payment processed
   - Booking statuses: PENDING (awaiting host confirmation) → CONFIRMED (approved by host) → CANCELLED (if cancelled)
   - Guests receive email confirmation with booking details and host contact information
   - Check-in time: 3:00 PM | Check-out time: 11:00 AM (standard, may vary by listing)

2. CANCELLATION POLICIES:
   - FLEXIBLE: Full refund if cancelled 24+ hours before check-in
   - MODERATE: Full refund if cancelled 5+ days before check-in; 50% refund if 2-5 days before
   - STRICT: Full refund if cancelled 7+ days before check-in; 50% refund if 7-14 days before; No refund within 7 days
   - To cancel: Go to "My Bookings" → Select booking → Click "Cancel Booking" → Confirm cancellation
   - Refunds are processed to the original payment method within 5-10 business days

3. PAYMENT & PRICING:
   - Total price = (Price per night × Number of nights) + Service fees + Cleaning fees (if applicable)
   - Payment methods: Credit/debit cards, PayPal (secure payment processing)
   - Payment is charged immediately upon booking confirmation
   - Hosts receive payment 24 hours after guest check-in
   - Manage payment methods: Dashboard → Account Settings → Payment Methods

4. REVIEWS & RATINGS:
   - Guests can review listings after check-out (1-5 stars + written comment)
   - Reviews are visible to all users and help maintain quality
   - Hosts can respond to reviews
   - To leave a review: Go to "My Bookings" → Select completed trip → Click "Write a Review"
   - Review criteria: Cleanliness, Accuracy, Communication, Location, Check-in, Value

5. HOST COMMUNICATION:
   - Message hosts directly through the platform messaging system
   - Access messages: Dashboard → Messages
   - Hosts typically respond within 24 hours
   - For urgent matters during your stay, use the host's emergency contact number (provided after booking)

6. ACCOUNT FEATURES:
   - Guest Dashboard: View upcoming trips, booking history, total spending, quick actions
   - Become a Host: Guests can upgrade to host role through 7-step wizard (Property Type → Place Type → Location → Basics → Amenities → Photos → Details)
   - Profile Settings: Update personal info, avatar, password, notification preferences
   - Saved Listings: Bookmark favorite properties for later

7. SEARCH & DISCOVERY:
   - Smart AI search: Natural language queries like "2 bedroom apartment in Paris under $150"
   - Filter by: Location, property type, price range, guest capacity, amenities
   - View listings on map or grid layout
   - Each listing shows: Photos, price, ratings, amenities, host info, availability calendar

8. SAFETY & SUPPORT:
   - All hosts are verified with ID verification
   - Secure payment processing (never pay outside the platform)
   - 24/7 customer support for emergencies
   - Report issues: Dashboard → Help Center → Report a Problem
   - Emergency contact: Available in booking confirmation email

9. SPECIAL FEATURES:
   - AI-powered listing recommendations based on preferences
   - Smart search with natural language understanding
   - Automated email notifications for bookings, confirmations, reminders
   - Review summaries generated by AI
   - Multi-language support

Guest Message: "${message}"

RESPONSE GUIDELINES:
- Provide specific, step-by-step instructions referencing actual platform features
- Use professional, friendly tone
- Keep responses concise (under 250 words) but comprehensive
- Reference specific dashboard sections, buttons, or navigation paths when relevant
- If the question is about a feature that exists on the platform, explain exactly how to use it
- Only say "contact support" for issues requiring manual intervention (payment disputes, account suspension, etc.)
- Never give generic answers like "contact your host" without explaining the platform's messaging feature

Response:`;

    try {
      const aiResponse = await model.invoke(supportPrompt);
      const response = (aiResponse.content as string).trim();

      if (!response || response.length < 10) {
        res.status(500).json({ message: "AI generated insufficient response" });
        return;
      }

      res.status(200).json({
        response,
        conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        hasListingContext: !!listingId && !!listingContext
      });

    } catch (aiError: any) {
      console.error("AI support error:", aiError);
      
      if (aiError.status === 429) {
        res.status(429).json({ message: "Support chat is busy, please try again in a moment" });
        return;
      }
      
      res.status(500).json({ message: "Support chat temporarily unavailable" });
    }

  } catch (error) {
    handleControllerError(error, res, "ai.guestSupport");
  }
};

/**
 * Get AI-powered booking recommendations
 * POST /api/v1/ai/recommendations
 */
export const getBookingRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { preferences, userId } = req.body;
    const { location, budget, dates, guests, amenities = [], type } = preferences;

    // Parse dates
    const checkIn = new Date(dates.checkIn);
    const checkOut = new Date(dates.checkOut);
    
    if (checkIn >= checkOut) {
      res.status(400).json({ message: "Check-out date must be after check-in date" });
      return;
    }

    // Build search criteria
    const whereClause: any = {
      guests: { gte: guests }
    };

    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    if (budget?.min || budget?.max) {
      whereClause.pricePerNight = {};
      if (budget.min) whereClause.pricePerNight.gte = budget.min;
      if (budget.max) whereClause.pricePerNight.lte = budget.max;
    }

    if (type) {
      whereClause.type = type;
    }

    // Get available listings (simplified availability check)
    const availableListings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        host: {
          select: { id: true, name: true, avatar: true }
        },
        photos: {
          select: { url: true },
          take: 3
        },
        reviews: {
          select: { rating: true },
          take: 10
        },
        _count: {
          select: { reviews: true, bookings: true }
        }
      },
      take: 20
    });

    if (availableListings.length === 0) {
      res.status(200).json({
        recommendations: [],
        message: "No listings match your criteria. Try adjusting your preferences.",
        searchCriteria: preferences
      });
      return;
    }

    // Calculate average ratings and scores
    const listingsWithScores = availableListings.map(listing => {
      const avgRating = listing.reviews.length > 0 
        ? listing.reviews.reduce((sum, review) => sum + review.rating, 0) / listing.reviews.length 
        : 0;

      // Simple scoring algorithm
      let score = 0;
      
      // Rating score (0-40 points)
      score += avgRating * 8;
      
      // Review count score (0-20 points)
      score += Math.min(listing._count.reviews * 2, 20);
      
      // Booking popularity (0-20 points)
      score += Math.min(listing._count.bookings, 20);
      
      // Price competitiveness (0-20 points)
      const avgPrice = availableListings.reduce((sum, l) => sum + l.pricePerNight, 0) / availableListings.length;
      const priceScore = listing.pricePerNight <= avgPrice ? 20 : Math.max(0, 20 - ((listing.pricePerNight - avgPrice) / avgPrice) * 20);
      score += priceScore;

      return {
        ...listing,
        avgRating: Math.round(avgRating * 10) / 10,
        score: Math.round(score * 10) / 10
      };
    });

    // Sort by score and take top recommendations
    const topRecommendations = listingsWithScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Generate AI explanation for recommendations
    const recommendationPrompt = `
Analyze these top Airbnb recommendations and provide a brief explanation of why they're good matches:

User Preferences:
- Location: ${location || "Any"}
- Budget: $${budget?.min || 0} - $${budget?.max || "unlimited"} per night
- Guests: ${guests}
- Dates: ${checkIn.toDateString()} to ${checkOut.toDateString()}
- Amenities: ${amenities.join(", ") || "None specified"}
- Type: ${type || "Any"}

Top 3 Recommendations:
${topRecommendations.slice(0, 3).map((listing, index) => 
  `${index + 1}. ${listing.title} - $${listing.pricePerNight}/night, ${listing.avgRating}★ (${listing._count.reviews} reviews)`
).join("\n")}

Provide a 2-3 sentence explanation of why these are good matches for the user's preferences. Be specific and helpful.`;

    try {
      const aiResponse = await model.invoke(recommendationPrompt);
      const explanation = (aiResponse.content as string).trim();

      res.status(200).json({
        recommendations: topRecommendations,
        explanation,
        searchCriteria: preferences,
        totalFound: availableListings.length,
        generatedAt: new Date().toISOString()
      });

    } catch (aiError: any) {
      console.error("AI recommendation explanation error:", aiError);
      
      // Return recommendations without AI explanation
      res.status(200).json({
        recommendations: topRecommendations,
        explanation: "Recommendations based on ratings, reviews, and price competitiveness.",
        searchCriteria: preferences,
        totalFound: availableListings.length,
        generatedAt: new Date().toISOString()
      });
    }

  } catch (error) {
    handleControllerError(error, res, "ai.getBookingRecommendations");
  }
};

/**
 * Get AI-generated review summary for a listing
 * GET /api/v1/ai/reviews/:listingId/summary
 */
export const getReviewSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const listingId = getParamAsString(req.params.listingId);
    const refresh = req.query.refresh === "true";

    if (!listingId) {
      res.status(400).json({ message: "Listing ID is required" });
      return;
    }

    // Check cache first (unless refresh requested)
    const cacheKey = `review_summary_${listingId}`;
    if (!refresh) {
      try {
        const cachedSummary = getCachedData(cacheKey);
        if (cachedSummary) {
          res.status(200).json({
            ...cachedSummary,
            cached: true,
            cacheAge: Math.floor((Date.now() - new Date(cachedSummary.generatedAt).getTime()) / 1000 / 60) // minutes
          });
          return;
        }
      } catch (cacheError) {
        console.error("Cache read error:", cacheError);
        // Continue without cache
      }
    }

    // Get listing and reviews
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50 // Limit for AI processing
        }
      }
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (listing.reviews.length === 0) {
      res.status(404).json({ message: "No reviews found for this listing" });
      return;
    }

    // Calculate basic stats
    const totalReviews = listing.reviews.length;
    const avgRating = listing.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    const ratingDistribution = {
      5: listing.reviews.filter(r => r.rating === 5).length,
      4: listing.reviews.filter(r => r.rating === 4).length,
      3: listing.reviews.filter(r => r.rating === 3).length,
      2: listing.reviews.filter(r => r.rating === 2).length,
      1: listing.reviews.filter(r => r.rating === 1).length
    };

    // Prepare reviews for AI analysis (recent reviews with comments)
    const reviewsWithComments = listing.reviews
      .filter(review => review.comment && review.comment.trim().length > 10)
      .slice(0, 20); // Limit for AI processing

    if (reviewsWithComments.length === 0) {
      const basicSummary = {
        summary: `This listing has ${totalReviews} reviews with an average rating of ${avgRating.toFixed(1)} stars. However, most reviews don't include detailed comments for analysis.`,
        highlights: ["High rating average", "Multiple guest reviews"],
        concerns: ["Limited detailed feedback"],
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        ratingDistribution,
        generatedAt: new Date().toISOString()
      };

      res.status(200).json(basicSummary);
      return;
    }

    // Create AI analysis prompt
    const analysisPrompt = `
Analyze these Airbnb reviews and provide a comprehensive summary:

Property: ${listing.title}
Location: ${listing.location}
Average Rating: ${avgRating.toFixed(1)}/5 (${totalReviews} reviews)

Recent Reviews:
${reviewsWithComments.map((review, index) => 
  `${index + 1}. Rating: ${review.rating}/5 - "${review.comment}" (${review.user.name})`
).join("\n")}

Please provide:
1. A 2-3 sentence overall summary
2. Top 3-5 positive highlights mentioned by guests
3. Any concerns or areas for improvement (if mentioned)
4. Overall guest sentiment

Format as JSON:
{
  "summary": "Overall summary text",
  "highlights": ["highlight 1", "highlight 2", ...],
  "concerns": ["concern 1", "concern 2", ...],
  "sentiment": "positive/mixed/negative"
}

Return only valid JSON, no other text.`;

    try {
      const aiResponse = await deterministicModel.invoke(analysisPrompt);
      let analysis;

      try {
        analysis = JSON.parse(aiResponse.content as string);
      } catch (parseError) {
        console.error("AI returned invalid JSON for review analysis:", aiResponse.content);
        throw new Error("Invalid AI response format");
      }

      const result = {
        ...analysis,
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        ratingDistribution,
        reviewsAnalyzed: reviewsWithComments.length,
        generatedAt: new Date().toISOString(),
        cached: false
      };

      // Cache the result for 1 hour
      try {
        setCachedData(cacheKey, result, 3600);
      } catch (cacheError) {
        console.error("Cache write error:", cacheError);
        // Continue without caching
      }

      res.status(200).json(result);

    } catch (aiError: any) {
      console.error("AI review analysis error:", aiError);
      
      // Fallback to basic summary
      const fallbackSummary = {
        summary: `Based on ${totalReviews} reviews, this listing maintains a ${avgRating.toFixed(1)}-star average. Guests have shared ${reviewsWithComments.length} detailed comments about their experiences.`,
        highlights: ["Consistent guest satisfaction", "Multiple positive reviews"],
        concerns: reviewsWithComments.filter(r => r.rating <= 3).length > 0 ? ["Some mixed feedback"] : [],
        sentiment: avgRating >= 4.5 ? "positive" : avgRating >= 3.5 ? "mixed" : "negative",
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        ratingDistribution,
        reviewsAnalyzed: reviewsWithComments.length,
        generatedAt: new Date().toISOString(),
        cached: false,
        aiError: "Analysis generated with fallback method"
      };

      res.status(200).json(fallbackSummary);
    }

  } catch (error) {
    handleControllerError(error, res, "ai.getReviewSummary");
  }
};

/**
 * Test AI connection
 * GET /api/v1/ai/test
 */
export const testAI = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("🧪 Testing AI connection...");
    console.log("API Key present:", !!process.env["GROQ_API_KEY"]);
    console.log("API Key starts with:", process.env["GROQ_API_KEY"]?.substring(0, 10) + "...");

    const testResponse = await deterministicModel.invoke("Say 'Hello, AI is working!' and nothing else.");
    
    res.status(200).json({
      success: true,
      message: "AI connection successful",
      response: testResponse.content,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("AI test failed:", error);
    res.status(500).json({
      success: false,
      message: "AI connection failed",
      error: error.message,
      details: {
        status: error.status,
        code: error.code,
        type: error.constructor.name
      }
    });
  }
};

/**
 * Smart Listing Search with AI-powered filter extraction (GET method)
 * GET /api/v1/ai/search?query=your_search_query
 */
export const smartSearchGET = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.query as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({ message: "Query parameter is required and must be a non-empty string" });
      return;
    }

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be 1-50" 
      });
      return;
    }

    // Create the same request object as POST method
    const mockReq = {
      ...req,
      body: { query }
    };

    // Call the existing POST method logic
    return smartSearch(mockReq as Request, res);

  } catch (error) {
    handleControllerError(error, res, "ai.smartSearchGET");
  }
};