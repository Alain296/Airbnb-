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
          content: "To book a stay, follow these steps:\n\n1. Search for your destination, dates, and number of guests\n2. Open a place you like to view the full details\n3. Select your check-in and check-out dates\n4. Review the total price\n5. Click 'Book Now' and confirm your payment\n6. Your booking will wait for the host to confirm it\n7. Once confirmed, you will receive the check-in details and host contact information\n\nStandard check-in is 3:00 PM and check-out is 11:00 AM. Need help with anything else?"
        };
      }
      
      if (userQuestion.includes("after") && userQuestion.includes("book")) {
        return {
          content: "After you book a stay, here's what happens:\n\n1. Your payment is handled safely\n2. The host reviews and confirms your booking\n3. You receive the booking details, host contact info, and check-in instructions\n4. Before check-in, you can message the host from Messages\n5. On check-in day, arrive at the time shared by the host\n6. During your stay, contact the host if you need help\n7. After check-out, you can leave a review\n\nYou can view your bookings anytime in My Bookings. Need more details about any step?"
        };
      }
      
      if (userQuestion.includes("cancel")) {
        return {
          content: "Cancellation rules can be different for each stay:\n\nFlexible: full refund if you cancel at least 24 hours before check-in.\nModerate: full refund if you cancel at least 5 days before check-in.\nStrict: refund rules are tighter, especially close to check-in.\n\nTo cancel, open My Bookings, choose the booking, click 'Cancel Booking', and confirm. Any refund usually returns to your original payment method within 5-10 business days."
        };
      }
      
      if (userQuestion.includes("payment") || userQuestion.includes("pay")) {
        return {
          content: "Here is what to know about payments:\n\nAccepted methods: credit cards, debit cards, and PayPal.\n\nYou are charged when the booking is confirmed.\n\nThe total price includes the nightly price, the number of nights, and any extra fees shown before you pay.\n\nRefunds usually return to your original payment method within 5-10 business days.\n\nFor safety, always pay inside the app and never send money directly to a host."
        };
      }
      
      if (userQuestion.includes("review")) {
        return {
          content: "To leave a review after your stay:\n\n1. Open My Bookings\n2. Find your completed trip\n3. Click 'Write a Review'\n4. Choose your star rating\n5. Write your comment\n6. Submit your review\n\nYou can rate cleanliness, accuracy, communication, location, check-in, and value. Your review helps other guests choose the right place."
        };
      }
      
      if (userQuestion.includes("host") && (userQuestion.includes("contact") || userQuestion.includes("message"))) {
        return {
          content: "To contact your host:\n\n1. Open Messages\n2. Choose the conversation for your booking\n3. Type your message and send\n\nHosts usually reply within 24 hours. You can ask about check-in, parking, local tips, house rules, or special requests. After booking, important contact details are also shared in your confirmation."
        };
      }
      
      if (userQuestion.includes("become") && userQuestion.includes("host")) {
        return {
          content: "Ready to become a host? Here's how:\n\n1. Click 'Become a Host' button in your dashboard\n2. Complete the 7-step wizard:\n   - **Step 1**: Choose property type (Apartment, House, Studio, Condo)\n   - **Step 2**: Select place type (Entire place, Private room, Shared room)\n   - **Step 3**: Enter location details\n   - **Step 4**: Add basics (guests, bedrooms, bathrooms)\n   - **Step 5**: Select amenities (WiFi, Kitchen, Parking, etc.)\n   - **Step 6**: Upload photos (at least 5 high-quality images)\n   - **Step 7**: Add title, description, and set your price\n3. Submit for review\n4. Once approved, your listing goes live!\n\n**Benefits of hosting**:\n- Earn extra income from your property\n- Meet travelers from around the world\n- Full control over your calendar and pricing\n- Secure payment processing\n\nYour guest account will be upgraded to a host account. Ready to get started?"
        };
      }
      
      if (userQuestion.includes("search") || userQuestion.includes("find")) {
        return {
          content: "Finding a place is easy:\n\nUse the search box to type what you need, for example: \"2 bedroom apartment in Paris under $150\".\n\nYou can filter by location, place type, price, number of guests, amenities, and dates.\n\nEach listing shows photos, price per night, reviews, amenities, host information, location, and available dates.\n\nWhat type of place are you looking for?"
        };
      }
      
      // Default helpful response
      return {
        content: "I can help you with bookings, cancellations, payments, reviews, messaging your host, account settings, and finding a place to stay.\n\nWhat would you like to know?"
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
