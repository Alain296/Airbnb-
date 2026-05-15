import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
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

const LISTING_TYPES = ["APARTMENT", "HOUSE", "VILLA", "CABIN", "CONDO", "STUDIO"];

const PLATFORM_TOPIC_PATTERN =
  /\b(listings?|stays?|properties|apartments?|houses?|villas?|cabins?|condos?|studios?|book|booking|reserve|reservation|pay|payment|card|refund|cancel|cancellation|check[-\s]?in|check[-\s]?out|host|guest|message|review|rating|saved|wishlist|account|profile|photo|amenit(?:y|ies)|price|fees?|support|dashboard|availability|dates?|location|search|filter|approve|approval|publish|published|pending)\b/i;

const GREETING_PATTERN = /\b(hi|hello|hey|good morning|good afternoon|good evening|how are you|how are things|are you okay)\b/i;

const isSmallTalkGreeting = (message: string) =>
  /\b(hi|hello|hey|good morning|good afternoon|good evening|how are you|how are things|are you okay)\b/i.test(message) &&
  !PLATFORM_TOPIC_PATTERN.test(message);

const isPlatformRelatedQuestion = (message: string) =>
  PLATFORM_TOPIC_PATTERN.test(message) || GREETING_PATTERN.test(message);

const createConversationId = () =>
  `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const extractFiltersFromQuery = (query: string): SearchFilters => {
  const q = query.toLowerCase();
  const filters: SearchFilters = {
    location: null,
    type: null,
    minPrice: null,
    maxPrice: null,
    guests: null,
  };

  const type = LISTING_TYPES.find((value) => q.includes(value.toLowerCase()));
  if (type) filters.type = type;

  const under = q.match(/(?:under|below|less than|max(?:imum)?|up to)\s*\$?\s*(\d+)/);
  if (under) filters.maxPrice = Number(under[1]);
  const over = q.match(/(?:over|above|more than|min(?:imum)?|from)\s*\$?\s*(\d+)/);
  if (over) filters.minPrice = Number(over[1]);
  const guests = q.match(/(\d+)\s*(?:guests?|people|persons?)/);
  if (guests) filters.guests = Number(guests[1]);

  const locationPatterns = [
    /\b(?:in|at|near|around)\s+([a-z][a-z\s,.-]{1,60}?)(?=\s+(?:under|below|over|above|for|with|that|which|and)\b|$)/i,
    /\blocated\s+in\s+([a-z][a-z\s,.-]{1,60})/i,
    /\b([a-z][a-z\s,.-]{1,60})\s+location\b/i,
  ];
  for (const pattern of locationPatterns) {
    const match = query.match(pattern);
    if (match?.[1]) {
      filters.location = match[1]
        .replace(/\b(?:apartments?|houses?|villas?|cabins?|condos?|studios?|listings?|located|that|are|is|the)\b/gi, "")
        .trim()
        .replace(/[,.]$/, "");
      break;
    }
  }

  return filters;
};

const hasAnyFilter = (filters: SearchFilters) =>
  Object.values(filters).some(value => value !== null && value !== undefined && value !== "");

const STOP_WORDS = new Set([
  "what", "which", "where", "when", "how", "does", "do", "did", "give", "gives",
  "have", "has", "with", "from", "for", "the", "and", "are", "you", "can",
  "service", "services", "amenity", "amenities", "hotel", "listing", "property",
  "book", "booking", "about", "tell", "me", "please", "is", "it", "its", "type",
]);

const getListingKeywords = (message: string) =>
  message
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 8);

const buildListingContext = (listings: any[]) => listings.map((listing, index) => {
  const photos = listing.photos?.map((photo: { url: string }) => photo.url).filter(Boolean).slice(0, 3) ?? [];
  const reviewCount = listing._count?.reviews ?? listing.reviews?.length ?? 0;
  return `
Listing ${index + 1}:
- ID: ${listing.id}
- Name: ${listing.title}
- Location: ${listing.location}
- Type: ${listing.type}
- Description: ${listing.description}
- Price: $${listing.pricePerNight}/night
- Guest capacity: ${listing.guests}
- Amenities/services shown for guests: ${listing.amenities?.length ? listing.amenities.join(", ") : "No amenities listed yet"}
- Cancellation policy: ${listing.cancellationPolicy}
- Minimum nights: ${listing.minNights}
- Host: ${listing.host?.name ?? "Host"}
- Rating: ${listing.rating ?? "No rating yet"} from ${reviewCount} review${reviewCount === 1 ? "" : "s"}
- Photos: ${photos.length ? photos.join(", ") : "No photos listed yet"}`;
}).join("\n");

const findListingsMentionedInMessage = async (message: string, listingId?: string | null) => {
  if (listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        host: { select: { name: true, email: true, avatar: true } },
        photos: { select: { url: true }, take: 3 },
        _count: { select: { reviews: true, bookings: true } },
      },
    });
    return listing?.isPublished ? [listing] : [];
  }

  const keywords = getListingKeywords(message);
  if (!keywords.length) return [];

  return prisma.listing.findMany({
    where: {
      isPublished: true,
      OR: keywords.flatMap((keyword) => [
        { title: { contains: keyword, mode: "insensitive" } },
        { location: { contains: keyword, mode: "insensitive" } },
        { description: { contains: keyword, mode: "insensitive" } },
        { amenities: { has: keyword } },
      ]),
    },
    include: {
      host: { select: { name: true, email: true, avatar: true } },
      photos: { select: { url: true }, take: 3 },
      _count: { select: { reviews: true, bookings: true } },
    },
    orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
    take: 5,
  });
};

const isServiceQuestion = (message: string) =>
  /\b(services?|amenities|facilities|provide|offers?|include|available|features?)\b/i.test(message);

const isBookingQuestion = (message: string) =>
  /\b(book|booking|reserve|reservation|how to pay|payment|check[-\s]?in|check[-\s]?out)\b/i.test(message);

const isBookingHowToQuestion = (message: string) =>
  /\b(how|steps?|process|someone|guest)\b/i.test(message) &&
  /\b(book|booking|reserve|reservation)\b/i.test(message) &&
  !/\b(cancel|cancellation|refund)\b/i.test(message);

const isCancellationHowToQuestion = (message: string) =>
  /\b(how|steps?|process|someone|guest)\b/i.test(message) &&
  /\b(cancel|cancellation|refund)\b/i.test(message);

const isPlaceDiscoveryQuestion = (message: string) =>
  /\b(which|what|where|show|find|available|places?|stays?|listings?|properties|accommodation)\b/i.test(message) &&
  /\b(stay|sleep|book|available|find|place|listing|property|apartment|house|villa|cabin|condo|studio)\b/i.test(message);

const extractLocationFilters = (message: string) => {
  const normalized = message.replace(/[?!.]/g, " ");
  const match = normalized.match(/\b(?:in|at|near|around)\s+([a-z][a-z\s,.-]*?)(?=\s+(?:under|below|over|above|for|with|that|which|and has|where|available|to stay)\b|$)/i);
  if (!match?.[1]) return [];

  return match[1]
    .split(/\s+(?:or|and)\s+|[,/]/i)
    .map((part) =>
      part
        .replace(/\b(?:apartments?|houses?|villas?|cabins?|condos?|studios?|listings?|places?|stays?|properties|are|is|the|there|available)\b/gi, "")
        .trim(),
    )
    .filter(Boolean)
    .slice(0, 4);
};

const getListingTypeFromMessage = (message: string) => {
  const q = message.toLowerCase();
  return LISTING_TYPES.find((value) => q.includes(value.toLowerCase())) ?? null;
};

const formatListingSummary = (listing: any) =>
  `${listing.title} in ${listing.location}: $${listing.pricePerNight}/night, ${listing.guests} guest${listing.guests === 1 ? "" : "s"}, ${String(listing.type).toLowerCase()}`;

const answerListingDiscoveryQuestion = async (message: string) => {
  const type = getListingTypeFromMessage(message);
  const locations = extractLocationFilters(message);
  const countQuestion = /\b(how many|count|number of)\b/i.test(message);

  const where: Prisma.ListingWhereInput = { isPublished: true };
  if (type) where.type = type as any;
  if (locations.length === 1) {
    where.location = { contains: locations[0], mode: "insensitive" };
  } else if (locations.length > 1) {
    where.OR = locations.map((location) => ({ location: { contains: location, mode: "insensitive" } }));
  }

  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      include: {
        host: { select: { id: true, name: true, email: true, avatar: true } },
        photos: { select: { url: true }, take: 3 },
        _count: { select: { reviews: true } },
      },
      take: 5,
    }),
    prisma.listing.count({ where }),
  ]);

  const placeText = locations.length ? ` in ${locations.join(" or ")}` : "";
  const typeText = type ? String(type).toLowerCase() : "stay";
  const details = listings.length
    ? listings.map(formatListingSummary).join("\n")
    : "I could not find any approved stays matching that search right now.";

  return {
    response: countQuestion
      ? `I found ${totalCount} approved ${typeText}${totalCount === 1 ? "" : "s"}${placeText}.\n\n${details}`
      : `Here are approved places guests can stay${placeText}:\n\n${details}`,
    results: listings,
    filters: { type, locations },
  };
};

const queryListingsFromFilters = async (filters: SearchFilters, page: number, limit: number) => {
  const whereClause: any = { isPublished: true };

  if (filters.location) {
    whereClause.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.type && LISTING_TYPES.includes(filters.type)) {
    whereClause.type = filters.type;
  }
  if (filters.minPrice || filters.maxPrice) {
    whereClause.pricePerNight = {};
    if (filters.minPrice) whereClause.pricePerNight.gte = filters.minPrice;
    if (filters.maxPrice) whereClause.pricePerNight.lte = filters.maxPrice;
  }
  if (filters.guests) {
    whereClause.guests = { gte: filters.guests };
  }

  const [listings, totalCount] = await Promise.all([
    prisma.listing.findMany({
      where: whereClause,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ rating: "desc" }, { createdAt: "desc" }],
      include: {
        host: { select: { id: true, name: true, email: true, avatar: true } },
        photos: { select: { url: true }, take: 3 },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.listing.count({ where: whereClause }),
  ]);

  return {
    listings,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
};

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

    const parsedFilters = extractFiltersFromQuery(query);
    if (hasAnyFilter(parsedFilters)) {
      const { listings, totalCount, totalPages } = await queryListingsFromFilters(parsedFilters, page, limit);
      res.status(200).json({
        filters: parsedFilters,
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
      return;
    }

    // Create prompt for AI to extract search filters when the deterministic parser cannot.
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
      const hasFilters = hasAnyFilter(filters);
      
      if (!hasFilters) {
        res.status(400).json({ 
          message: "Could not extract any filters from your query, please be more specific" 
        });
        return;
      }

      const { listings, totalCount, totalPages } = await queryListingsFromFilters(filters, page, limit);

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
    const userMessage = String(message ?? "").trim();

    if (!userMessage) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    const lowerMessage = userMessage.toLowerCase();

    if (isSmallTalkGreeting(userMessage)) {
      res.status(200).json({
        response: "I am doing well, thank you for asking. I am here to help you with this booking platform, like finding a place to stay, booking a listing, cancelling a booking, payments, reviews, or messaging a host.",
        conversationId: conversationId || createConversationId(),
        timestamp: new Date().toISOString(),
        hasListingContext: false,
      });
      return;
    }

    if (!isPlatformRelatedQuestion(userMessage)) {
      res.status(200).json({
        response: "I can help with this booking platform: finding stays, booking steps, payments, cancellations, host messages, reviews, saved listings, and account questions. Please ask me about one of those areas and I will guide you clearly.",
        conversationId: conversationId || createConversationId(),
        timestamp: new Date().toISOString(),
        hasListingContext: false,
      });
      return;
    }

    const searchLike =
      lowerMessage.includes("listing") ||
      lowerMessage.includes("apartment") ||
      lowerMessage.includes("house") ||
      lowerMessage.includes("villa") ||
      lowerMessage.includes("cabin") ||
      lowerMessage.includes("condo") ||
      lowerMessage.includes("studio") ||
      /\b(in|near|around)\b/.test(lowerMessage);

    if (isCancellationHowToQuestion(userMessage)) {
      res.status(200).json({
        response: "To cancel a booking, go to My Bookings or My Trips, open the booking you want to cancel, then choose Cancel Booking and confirm. The app will mark the booking as cancelled. If the stay is less than 24 hours away, cancellation may be blocked, so the guest should cancel as early as possible.",
        conversationId: conversationId || createConversationId(),
        timestamp: new Date().toISOString(),
        hasListingContext: false,
      });
      return;
    }

    if (isBookingHowToQuestion(userMessage)) {
      res.status(200).json({
        response: "To book a stay, first open an approved listing from the listings page. Choose your check-in and check-out dates, enter the number of guests, then review the total price. After that, click the booking button to confirm. The app will create your booking and show it under My Trips or My Bookings.",
        conversationId: conversationId || createConversationId(),
        timestamp: new Date().toISOString(),
        hasListingContext: false,
      });
      return;
    }

    if (isPlaceDiscoveryQuestion(userMessage)) {
      const { response, results, filters } = await answerListingDiscoveryQuestion(userMessage);
      res.status(200).json({
        response,
        conversationId: conversationId || createConversationId(),
        timestamp: new Date().toISOString(),
        hasListingContext: false,
        results,
        filters,
      });
      return;
    }

    if (searchLike) {
      const filters = extractFiltersFromQuery(userMessage);
      if (hasAnyFilter(filters)) {
        const { listings, totalCount } = await queryListingsFromFilters(filters, 1, 5);
        const countQuestion = /\b(how many|count|number of)\b/i.test(userMessage);
        const details = listings.length
          ? listings.map((listing) => `${listing.title} in ${listing.location}: $${listing.pricePerNight}/night, ${listing.guests} guest${listing.guests === 1 ? "" : "s"}, ${listing.type}`).join("\n")
          : "I could not find any matching stays right now.";

        res.status(200).json({
          response: countQuestion
            ? `I found ${totalCount} matching ${filters.type ? filters.type.toLowerCase() : "stay"}${totalCount === 1 ? "" : "s"}${filters.location ? ` in ${filters.location}` : ""}.\n\n${details}`
            : `I found ${totalCount} matching stay${totalCount === 1 ? "" : "s"}.\n\n${details}`,
          conversationId: conversationId || createConversationId(),
          timestamp: new Date().toISOString(),
          hasListingContext: false,
          results: listings,
          filters,
        });
        return;
      }
    }

    let matchedListings: any[] = [];
    try {
      matchedListings = await findListingsMentionedInMessage(userMessage, listingId);
    } catch (dbError) {
      console.error("Error fetching listing context:", dbError);
    }

    const [publishedListingCount, savedPaymentMethodCount] = await Promise.all([
      prisma.listing.count({ where: { isPublished: true } }),
      prisma.paymentMethod.count().catch(() => 0),
    ]);

    const platformContext = `
LIVE PLATFORM DETAILS:
- Guests can currently browse ${publishedListingCount} admin-approved published listing${publishedListingCount === 1 ? "" : "s"}.
- New host listings are held for admin review first. Guests only see them after an admin approves and publishes them.
- Payment methods are saved in the account area; ${savedPaymentMethodCount} saved payment method${savedPaymentMethodCount === 1 ? "" : "s"} exist in the system right now.
- Bookings use listing price, selected dates, guest count, availability, and booking status.
`;

    const listingContext = matchedListings.length
      ? `LISTING DETAILS - use only these details when answering property questions:\n${buildListingContext(matchedListings)}`
      : "";

    if (matchedListings.length && isServiceQuestion(userMessage)) {
      const primary = matchedListings[0];
      const amenities = primary.amenities?.length ? primary.amenities.join(", ") : "No amenities are listed for this stay yet";
      res.status(200).json({
        response: `${primary.title} in ${primary.location} offers these services and amenities: ${amenities}. It is a ${String(primary.type).toLowerCase()} for up to ${primary.guests} guest${primary.guests === 1 ? "" : "s"} at $${primary.pricePerNight}/night. To book it, open the listing, choose your check-in and check-out dates, review the total price, then send your booking request.`,
        conversationId: conversationId || createConversationId(),
        timestamp: new Date().toISOString(),
        hasListingContext: true,
        results: matchedListings,
      });
      return;
    }

    // Create support chatbot prompt with comprehensive platform knowledge
    const supportPrompt = `
You are a professional AI assistant for an Airbnb-style vacation rental platform. You have comprehensive knowledge about how the platform works and can provide specific, accurate information about features and processes.

${listingContext}
${platformContext}

CRITICAL PROJECT RULES:
- Answer like a real helpful person in conversation, not like a static FAQ.
- If the guest asks about a specific property, service, amenity, price, location, host, or booking details, use the LISTING DETAILS above.
- Never invent amenities, services, prices, policies, photos, or host details that are not shown in the listing details.
- If no listing details are provided for a named property, say you cannot find that stay right now and suggest searching the listings page.
- When explaining how to book, connect the steps to the actual listing if listing details are available.
- Do not use technical words with guests such as "database", "backend", "record", "query", "API", or "context". Use simple words such as "listing details", "your booking", "the stay", and "the app".
- Keep the answer related to this project: listings, bookings, reviews, payments, messages, host/guest accounts, and support.
- If the user asks something outside this project, politely say you can only help with this booking platform and suggest a related question.
- Explain listing approval simply: a host submits a place, an admin checks it, then the admin publishes it so guests can see and book it.

PLATFORM FEATURES & PROCESSES YOU MUST KNOW:

1. BOOKING PROCESS:
   - Guests browse only admin-approved listings by location, type (APARTMENT, HOUSE, VILLA, CABIN, STUDIO, CONDO), price, and guest capacity
   - To book: Select dates → Review total price → Confirm booking → Payment processed
   - After a guest requests a booking, the host confirms it or cancels it
   - Guests receive email confirmation with booking details
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
   - Manage payment methods from Account Settings, then Payment Methods

4. REVIEWS & RATINGS:
   - Guests can review listings after check-out (1-5 stars + written comment)
   - Reviews are visible to all users and help maintain quality
   - Hosts can respond to reviews
   - To leave a review: Go to "My Bookings" → Select completed trip → Click "Write a Review"
   - Review criteria: Cleanliness, Accuracy, Communication, Location, Check-in, Value

5. HOST COMMUNICATION:
   - Message hosts directly through the platform messaging system
   - Access messages from the Messages page
   - Hosts can reply to guest messages for their bookings
   - If the guest needs a call or urgent manual help, explain that support/admin can use the contact details on the user account or booking

6. ACCOUNT FEATURES:
   - Guest home area: View upcoming trips, booking history, total spending, and quick actions
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
   - Report issues from the Help Center, then Report a Problem
   - Emergency contact: Available in booking confirmation email

9. SPECIAL FEATURES:
   - Listing recommendations based on guest preferences
   - Search using normal everyday language
   - Automated email notifications for bookings, confirmations, reminders
   - Review summaries generated by AI
   - Multi-language support

Guest Message: "${message}"

RESPONSE GUIDELINES:
- Provide specific, step-by-step instructions referencing actual platform features
- Use professional, friendly tone
- Keep responses concise (under 250 words) but comprehensive
- Prioritize the exact listing details over general advice whenever listing details are available
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
        conversationId: conversationId || createConversationId(),
        timestamp: new Date().toISOString(),
        hasListingContext: matchedListings.length > 0,
        results: matchedListings.length ? matchedListings : undefined
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
      isPublished: true,
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
