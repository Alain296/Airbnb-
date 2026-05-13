import { ChatGroq } from "@langchain/groq";

// Enable mock mode if models are not working
const ENABLE_MOCK_MODE = true; // Set to false when models work

// Mock AI for testing when real models fail
const mockAI = {
  invoke: async (prompt: string) => {
    console.log("🤖 MOCK MODE: Processing AI request");
    
    if (prompt.includes("Extract search filters")) {
      return {
        content: JSON.stringify({
          location: "downtown",
          type: "APARTMENT",
          minPrice: null,
          maxPrice: 200,
          guests: 2
        })
      };
    }
    
    if (prompt.includes("Generate a compelling")) {
      return {
        content: "Welcome to this stunning property! This beautifully appointed space offers modern amenities and comfort in a prime location. Perfect for travelers seeking convenience and style. The space features thoughtful design elements and everything you need for a memorable stay. Book now for an exceptional experience!"
      };
    }
    
    if (prompt.includes("guest support assistant") || prompt.includes("AI assistant for an Airbnb-style")) {
      // Extract the actual user question from the prompt
      const questionMatch = prompt.match(/Guest Message: "(.+?)"/);
      const userQuestion = questionMatch ? questionMatch[1].toLowerCase() : "";
      
      // Provide context-aware responses based on the question
      if (userQuestion.includes("book") && userQuestion.includes("listing")) {
        return {
          content: "To book a listing, follow these steps:\n\n1. Browse listings by searching for your destination, dates, and number of guests\n2. Click on a listing that interests you to view full details\n3. Select your check-in and check-out dates on the calendar\n4. Review the total price (nightly rate × nights + fees)\n5. Click 'Book Now' and confirm your payment method\n6. Your booking will be PENDING until the host confirms it\n7. Once confirmed, you'll receive an email with check-in details and host contact information\n\nStandard check-in is at 3:00 PM and check-out at 11:00 AM. Need help with anything else?"
        };
      }
      
      if (userQuestion.includes("after") && userQuestion.includes("book")) {
        return {
          content: "After you book a listing, here's what happens:\n\n1. **Immediate**: Your payment is processed and held securely\n2. **Within 24 hours**: The host reviews and confirms your booking (status changes from PENDING to CONFIRMED)\n3. **Email confirmation**: You'll receive booking details, host contact info, and check-in instructions\n4. **Before check-in**: You can message the host through Dashboard → Messages for any questions\n5. **Check-in day**: Arrive at 3:00 PM (or time specified by host) and follow the provided instructions\n6. **During stay**: Contact host for any issues or questions\n7. **After check-out**: You can leave a review to help future guests\n\nYou can view all your bookings anytime in Dashboard → My Bookings. Need more details about any step?"
        };
      }
      
      if (userQuestion.includes("cancel")) {
        return {
          content: "Our cancellation policies vary by listing:\n\n**FLEXIBLE**: Full refund if cancelled 24+ hours before check-in\n**MODERATE**: Full refund if cancelled 5+ days before; 50% refund if 2-5 days before\n**STRICT**: Full refund if cancelled 7+ days before; 50% refund if 7-14 days before; No refund within 7 days\n\nTo cancel a booking:\n1. Go to Dashboard → My Bookings\n2. Select the booking you want to cancel\n3. Click 'Cancel Booking' button\n4. Confirm the cancellation\n5. Refunds are processed to your original payment method within 5-10 business days\n\nThe specific policy for your booking is shown in your booking confirmation. Need help with anything else?"
        };
      }
      
      if (userQuestion.includes("payment") || userQuestion.includes("pay")) {
        return {
          content: "Here's everything about payments:\n\n**Accepted Methods**: Credit cards, debit cards, and PayPal\n\n**When you're charged**: Immediately upon booking confirmation\n\n**Total price includes**:\n- Nightly rate × number of nights\n- Service fees\n- Cleaning fees (if applicable)\n\n**Refunds**: Processed within 5-10 business days to your original payment method\n\n**Managing payment methods**:\n1. Go to Dashboard → Account Settings\n2. Click 'Payment Methods'\n3. Add, edit, or remove payment methods\n\n**Security**: All payments are processed securely. Never pay outside the platform. Need help with a specific payment issue?"
        };
      }
      
      if (userQuestion.includes("review")) {
        return {
          content: "To leave a review after your stay:\n\n1. Go to Dashboard → My Bookings\n2. Find your completed trip\n3. Click 'Write a Review' button\n4. Rate the listing (1-5 stars) - click on the big stars\n5. Write your detailed comment (10-1000 characters)\n6. Submit your review\n\n**Review criteria**:\n- Cleanliness\n- Accuracy (listing matched description)\n- Communication (host responsiveness)\n- Location\n- Check-in process\n- Overall value\n\nYour review helps other guests make informed decisions and helps hosts improve. Reviews are visible to everyone, and hosts can respond to them. Want to know more about the review system?"
        };
      }
      
      if (userQuestion.includes("host") && (userQuestion.includes("contact") || userQuestion.includes("message"))) {
        return {
          content: "To contact your host:\n\n1. Go to Dashboard → Messages\n2. Select the conversation with your host (or start a new one)\n3. Type your message and send\n\n**Response time**: Hosts typically respond within 24 hours\n\n**Before booking**: You can message hosts to ask questions about the property\n\n**After booking**: You'll receive the host's contact information in your confirmation email\n\n**During your stay**: For urgent matters, use the emergency contact number provided in your booking confirmation\n\n**What to ask hosts about**:\n- Check-in procedures and key pickup\n- Parking availability\n- Local recommendations\n- House rules clarification\n- Special requests\n\nNeed help with anything else?"
        };
      }
      
      if (userQuestion.includes("become") && userQuestion.includes("host")) {
        return {
          content: "Ready to become a host? Here's how:\n\n1. Click 'Become a Host' button in your dashboard\n2. Complete the 7-step wizard:\n   - **Step 1**: Choose property type (Apartment, House, Studio, Condo)\n   - **Step 2**: Select place type (Entire place, Private room, Shared room)\n   - **Step 3**: Enter location details\n   - **Step 4**: Add basics (guests, bedrooms, bathrooms)\n   - **Step 5**: Select amenities (WiFi, Kitchen, Parking, etc.)\n   - **Step 6**: Upload photos (at least 5 high-quality images)\n   - **Step 7**: Add title, description, and set your price\n3. Submit for review\n4. Once approved, your listing goes live!\n\n**Benefits of hosting**:\n- Earn extra income from your property\n- Meet travelers from around the world\n- Full control over your calendar and pricing\n- Secure payment processing\n\nYour guest account will be upgraded to a host account. Ready to get started?"
        };
      }
      
      if (userQuestion.includes("search") || userQuestion.includes("find")) {
        return {
          content: "Finding the perfect listing is easy:\n\n**Smart Search** (AI-powered):\n- Use natural language like \"2 bedroom apartment in Paris under $150\"\n- Our AI understands your preferences and finds matching listings\n\n**Filter Options**:\n- Location (city, neighborhood, address)\n- Property type (Apartment, House, Studio, Condo)\n- Price range (min/max per night)\n- Guest capacity\n- Amenities (WiFi, Kitchen, Pool, Parking, etc.)\n- Dates (check availability)\n\n**View Options**:\n- Grid view: See listings as cards with photos and key details\n- Map view: Explore listings by location on an interactive map\n\n**Each listing shows**:\n- Photos, price per night, ratings, reviews\n- Amenities, host information, location\n- Availability calendar\n\nTry our smart search at the top of the page! What type of place are you looking for?"
        };
      }
      
      // Default helpful response
      return {
        content: "I'm here to help you with:\n\n• **Booking**: How to book, payment, confirmation process\n• **Cancellations**: Policies, refunds, how to cancel\n• **Reviews**: Leaving reviews, rating criteria\n• **Host Communication**: Messaging, response times, emergency contacts\n• **Account**: Becoming a host, profile settings, payment methods\n• **Search**: Finding listings, filters, smart search\n• **Support**: General questions, troubleshooting\n\nWhat would you like to know more about? Feel free to ask specific questions!"
      };
    }
    
    if (prompt.includes("Analyze these top Airbnb recommendations")) {
      return {
        content: "These recommendations are carefully selected based on your preferences for location, budget, and guest capacity. The top choices offer excellent value with high ratings from previous guests and competitive pricing within your specified range."
      };
    }
    
    if (prompt.includes("Analyze these Airbnb reviews")) {
      return {
        content: JSON.stringify({
          summary: "Guests consistently praise this property for its cleanliness, location, and host responsiveness. Most reviews highlight comfortable accommodations and smooth check-in process.",
          highlights: ["Excellent location", "Very clean", "Responsive host", "Easy check-in", "Great value"],
          concerns: ["Minor street noise", "Limited parking"],
          sentiment: "positive"
        })
      };
    }
    
    return { content: "Hello, AI is working!" };
  }
};

// List of models to try (in order of preference)
const SUPPORTED_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant", 
  "gemma2-9b-it",
  "llama3-groq-70b-8192-tool-use-preview",
  "llama3-groq-8b-8192-tool-use-preview"
];

// Function to create model with fallback
const createGroqModel = (temperature: number = 0.7) => {
  if (ENABLE_MOCK_MODE) {
    return mockAI;
  }
  
  return new ChatGroq({
    model: SUPPORTED_MODELS[0],
    temperature,
    apiKey: process.env["GROQ_API_KEY"],
  });
};

// Default model for creative tasks (descriptions, chat)
export const model = createGroqModel(0.7);

// Deterministic model for data extraction (search filters)
export const deterministicModel = createGroqModel(0);

// Validate AI configuration
export const validateAIConfig = (): void => {
  if (ENABLE_MOCK_MODE) {
    console.log("🤖 AI MOCK MODE: Using simulated responses for testing");
    console.log("💡 Set ENABLE_MOCK_MODE = false when Groq models work");
  } else if (!process.env["GROQ_API_KEY"]) {
    console.warn("⚠️ GROQ_API_KEY not found in environment variables");
  } else {
    console.log("🤖 AI configuration loaded successfully with Groq API");
    console.log(`🎯 Using model: ${SUPPORTED_MODELS[0]}`);
  }
};