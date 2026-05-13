import "dotenv/config";
import bcrypt from "bcrypt";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env["DATABASE_URL"];

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🧹 Cleaning existing data...");
  
  // 1. Clean existing data (delete children before parents)
  await prisma.booking.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 Creating users...");
  
  // 2. Create users (2 hosts, 3 guests, 1 admin)
  const hashedPassword = await bcrypt.hash("password123", 10);

  // Create HOST users
  const sarah = await prisma.user.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah.host@airbnb.com",
      username: "sarah_host",
      phone: "+1-555-0101",
      password: hashedPassword,
      role: "HOST",
      bio: "Experienced host with a passion for hospitality. I love sharing my beautiful properties with travelers from around the world.",
    },
  });

  const mike = await prisma.user.create({
    data: {
      name: "Mike Chen",
      email: "mike.host@airbnb.com", 
      username: "mike_host",
      phone: "+1-555-0102",
      password: hashedPassword,
      role: "HOST",
      bio: "Property investor and host. I ensure all my guests have a comfortable and memorable stay.",
    },
  });

  // Create GUEST users
  const alain = await prisma.user.create({
    data: {
      name: "Alain Mugabo",
      email: "alain.test@example.com",
      username: "alain_guest",
      phone: "+1-555-0201",
      password: hashedPassword,
      role: "GUEST",
      bio: "Travel enthusiast who loves exploring new places and cultures.",
    },
  });

  const emma = await prisma.user.create({
    data: {
      name: "Emma Wilson",
      email: "emma.guest@example.com",
      username: "emma_guest", 
      phone: "+1-555-0202",
      password: hashedPassword,
      role: "GUEST",
      bio: "Digital nomad working remotely while traveling the world.",
    },
  });

  const john = await prisma.user.create({
    data: {
      name: "John Davis",
      email: "john.guest@example.com",
      username: "john_guest",
      phone: "+1-555-0203", 
      password: hashedPassword,
      role: "GUEST",
      bio: "Business traveler who appreciates comfortable and convenient accommodations.",
    },
  });

  // Create ADMIN user
  const admin = await prisma.user.create({
    data: {
      name: "Platform Admin",
      email: "admin@airbnb.com",
      username: "platform_admin",
      phone: "+1-555-0001",
      password: hashedPassword,
      role: "ADMIN",
      bio: "System administrator with full platform moderation access.",
    },
  });

  console.log("🏠 Creating listings...");

  // 3. Create listings (one of each type: APARTMENT, HOUSE, VILLA, CABIN)
  const beachVilla = await prisma.listing.create({
    data: {
      title: "Luxury Oceanfront Villa",
      description: "Stunning beachfront villa with panoramic ocean views, private pool, and direct beach access. Perfect for families and groups seeking luxury and relaxation.",
      location: "Malibu, California",
      pricePerNight: 450.00,
      guests: 8,
      type: "VILLA",
      amenities: ["WiFi", "Private Pool", "Beach Access", "Ocean Views", "Hot Tub", "Outdoor Kitchen", "Parking"],
      rating: 4.9,
      hostId: sarah.id,
    },
  });

  const mountainCabin = await prisma.listing.create({
    data: {
      title: "Cozy Mountain Cabin Retreat",
      description: "Rustic cabin nestled in the mountains with fireplace, hiking trails, and breathtaking views. Escape the city and reconnect with nature.",
      location: "Aspen, Colorado", 
      pricePerNight: 220.00,
      guests: 6,
      type: "CABIN",
      amenities: ["WiFi", "Fireplace", "Mountain Views", "Hiking Trails", "Kitchen", "Parking"],
      rating: 4.7,
      hostId: sarah.id,
    },
  });

  const downtownApartment = await prisma.listing.create({
    data: {
      title: "Modern Downtown Apartment",
      description: "Sleek apartment in the heart of downtown with city views, modern amenities, and walking distance to restaurants, shops, and attractions.",
      location: "New York, New York",
      pricePerNight: 180.00,
      guests: 4,
      type: "APARTMENT", 
      amenities: ["WiFi", "City Views", "Air Conditioning", "Gym Access", "Rooftop Terrace", "Kitchen"],
      rating: 4.6,
      hostId: mike.id,
    },
  });

  const countryHouse = await prisma.listing.create({
    data: {
      title: "Charming Country House",
      description: "Beautiful country house surrounded by rolling hills and gardens. Perfect for peaceful getaways with family and friends.",
      location: "Vermont, United States",
      pricePerNight: 160.00,
      guests: 6,
      type: "HOUSE",
      amenities: ["WiFi", "Garden", "Fireplace", "Kitchen", "Parking", "Country Views"],
      rating: 4.8,
      hostId: mike.id,
    },
  });

  console.log("📅 Creating bookings...");

  // 4. Create bookings (at least 3 bookings with correct calculations)
  
  // Booking 1: Alain books Beach Villa (5 nights)
  const checkIn1 = new Date("2024-07-15T15:00:00Z");
  const checkOut1 = new Date("2024-07-20T11:00:00Z");
  const nights1 = Math.ceil((checkOut1.getTime() - checkIn1.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice1 = nights1 * beachVilla.pricePerNight;

  await prisma.booking.create({
    data: {
      checkIn: checkIn1,
      checkOut: checkOut1,
      totalPrice: totalPrice1,
      status: "CONFIRMED",
      guestId: alain.id,
      listingId: beachVilla.id,
    },
  });

  // Booking 2: Emma books Mountain Cabin (3 nights)
  const checkIn2 = new Date("2024-08-10T15:00:00Z");
  const checkOut2 = new Date("2024-08-13T11:00:00Z");
  const nights2 = Math.ceil((checkOut2.getTime() - checkIn2.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice2 = nights2 * mountainCabin.pricePerNight;

  await prisma.booking.create({
    data: {
      checkIn: checkIn2,
      checkOut: checkOut2,
      totalPrice: totalPrice2,
      status: "PENDING",
      guestId: emma.id,
      listingId: mountainCabin.id,
    },
  });

  // Booking 3: John books Downtown Apartment (4 nights)
  const checkIn3 = new Date("2024-09-05T15:00:00Z");
  const checkOut3 = new Date("2024-09-09T11:00:00Z");
  const nights3 = Math.ceil((checkOut3.getTime() - checkIn3.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice3 = nights3 * downtownApartment.pricePerNight;

  await prisma.booking.create({
    data: {
      checkIn: checkIn3,
      checkOut: checkOut3,
      totalPrice: totalPrice3,
      status: "CONFIRMED",
      guestId: john.id,
      listingId: downtownApartment.id,
    },
  });

  console.log("✅ Seeding complete!");
  console.log(`
📊 Database seeded with:
👥 Users: 6 (2 hosts, 3 guests, 1 admin)
🏠 Listings: 4 (Villa, Cabin, Apartment, House)
📅 Bookings: 3 (2 confirmed, 1 pending)

🔐 All users have password: password123

👨‍💼 Hosts:
- sarah.host@airbnb.com (Sarah Johnson)
- mike.host@airbnb.com (Mike Chen)

👤 Guests:
- alain.test@example.com (Alain Mugabo)
- emma.guest@example.com (Emma Wilson)  
- john.guest@example.com (John Davis)

🛡️ Admin:
- admin@airbnb.com (${admin.name})
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });