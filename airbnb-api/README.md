# 🏠 Airbnb Clone - Full Stack Application

A modern, feature-rich Airbnb clone built with **React**, **TypeScript**, **Node.js**, **Express**, and **PostgreSQL**. This project includes advanced features like AI-powered search, smart chatbot, real-time booking management, and comprehensive authentication.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://www.prisma.io/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [AI Features](#-ai-features)
- [Authentication](#-authentication)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Guest, Host, Admin)
- **OAuth integration** (Google, Facebook, GitHub)
- **Multi-factor authentication (MFA)** with TOTP
- **Email verification** and password reset
- **Account suspension** for policy violations

### 🏡 Listing Management
- **Create and manage listings** with multiple property types (Apartment, House, Studio, Condo)
- **Photo uploads** with Cloudinary integration
- **Advanced pricing** (weekend rates, weekly/monthly discounts, extra guest fees)
- **Availability calendar** with date blocking
- **Cancellation policies** (Flexible, Moderate, Strict)
- **Publish/unpublish** listings
- **Search and filter** by location, price, type, guests, amenities

### 📅 Booking System
- **Real-time booking** with instant confirmation
- **Booking statuses** (Pending, Confirmed, Cancelled, Completed)
- **Automatic price calculation** (nights, guests, fees, discounts)
- **Booking history** for guests and hosts
- **Cancellation management** with refund calculation
- **Email notifications** for bookings, confirmations, cancellations

### ⭐ Reviews & Ratings
- **5-star rating system** with written reviews
- **Review criteria** (Cleanliness, Accuracy, Communication, Location, Check-in, Value)
- **Host responses** to reviews
- **Average ratings** and review counts
- **AI-generated review summaries**

### 🤖 AI-Powered Features
- **Smart Search**: Natural language queries like "2 bedroom apartment in Paris under $150"
- **AI Chatbot**: Professional support assistant with comprehensive platform knowledge
- **Listing Description Generator**: AI-powered descriptions based on property details
- **Booking Recommendations**: Personalized suggestions based on preferences
- **Review Summarization**: AI-generated insights from guest reviews

### 👤 User Management
- **User profiles** with avatars and bios
- **Become a Host** wizard (7-step onboarding)
- **Dashboard** for guests and hosts
- **Saved listings** (wishlist/favorites)
- **Booking history** and statistics
- **Admin panel** for user management

### 📧 Email Integration
- **Automated emails** for bookings, confirmations, cancellations
- **Welcome emails** for new users
- **Password reset** emails
- **Email verification** links
- **Mailtrap** for development, **Gmail** for production

### 🎨 Modern UI/UX
- **Responsive design** for all devices
- **Professional icons** (Feather Icons)
- **Smooth animations** and transitions
- **Toast notifications** for user feedback
- **Loading states** and error handling
- **Dark mode support** (in progress)

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Hot Toast** - Notifications
- **React Icons** - Icon library
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email sending
- **Cloudinary** - Image hosting
- **Swagger** - API documentation
- **Langchain + Groq** - AI integration

### DevOps & Tools
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **tsx** - TypeScript execution
- **Postman** - API testing

---

## 📁 Project Structure

```
Airbnb/
├── airbnb-api/                 # Backend API
│   ├── prisma/
│   │   ├── migrations/         # Database migrations
│   │   ├── schema.prisma       # Database schema
│   │   └── seed.ts             # Seed data
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   ├── ai.ts           # AI/LLM configuration
│   │   │   ├── cache.ts        # Redis cache
│   │   │   ├── cloudinary.ts   # Image upload
│   │   │   ├── email.ts        # Email service
│   │   │   ├── prisma.ts       # Database client
│   │   │   └── swagger.ts      # API docs
│   │   ├── controllers/        # Route controllers
│   │   │   ├── ai.controller.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── bookings.controller.ts
│   │   │   ├── listings.controller.ts
│   │   │   ├── mfa.controller.ts
│   │   │   ├── oauth.controller.ts
│   │   │   ├── reviews.controller.ts
│   │   │   └── users.controller.ts
│   │   ├── middlewares/        # Express middlewares
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   ├── rate-limit.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── routes/             # API routes
│   │   │   └── v1/
│   │   │       ├── ai.routes.ts
│   │   │       ├── auth.routes.ts
│   │   │       ├── bookings.routes.ts
│   │   │       ├── listings.routes.ts
│   │   │       ├── reviews.routes.ts
│   │   │       └── users.routes.ts
│   │   ├── validators/         # Request validators
│   │   ├── utils/              # Utility functions
│   │   └── index.ts            # Entry point
│   ├── .env                    # Environment variables
│   ├── .env.example            # Example env file
│   ├── package.json
│   └── tsconfig.json
│
└── airbnb-app/                 # Frontend Application
    ├── public/
    │   └── liston-v2.3/        # Template assets
    ├── src/
    │   ├── features/           # Feature modules
    │   │   ├── auth/           # Authentication
    │   │   ├── bookings/       # Booking management
    │   │   ├── host/           # Host features
    │   │   ├── listings/       # Listing management
    │   │   └── home/           # Home page
    │   ├── shared/             # Shared components
    │   │   ├── components/
    │   │   │   ├── Chatbox.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   ├── Navbar.tsx
    │   │   │   └── Spinner.tsx
    │   │   └── hooks/
    │   ├── store/              # State management
    │   ├── lib/                # Libraries
    │   │   └── api.ts          # API client
    │   ├── App.tsx             # Root component
    │   └── main.tsx            # Entry point
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v14 or higher)
- **npm** or **yarn**
- **Git**

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Alain296/Airbnb-.git
cd Airbnb-
```

#### 2. Setup Backend (API)

```bash
cd airbnb-api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
# (See Environment Variables section below)

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed

# Start development server
npm run dev
```

The API will be running at **http://localhost:3000**

#### 3. Setup Frontend (App)

```bash
cd ../airbnb-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be running at **http://localhost:5173** or **http://localhost:5174**

---

## 🔐 Environment Variables

### Backend (.env)

Create a `.env` file in the `airbnb-api` folder:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/airbnb_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email (Mailtrap for development)
EMAIL_HOST="sandbox.smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USER="your-mailtrap-username"
EMAIL_PASS="your-mailtrap-password"
EMAIL_FROM="noreply@airbnb-clone.com"

# Email (Gmail for production)
# EMAIL_HOST="smtp.gmail.com"
# EMAIL_PORT=587
# EMAIL_USER="your-email@gmail.com"
# EMAIL_PASS="your-app-password"

# AI (Groq API)
GROQ_API_KEY="your-groq-api-key"
ENABLE_MOCK_MODE=true

# OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Redis (Optional - for caching)
REDIS_URL="redis://localhost:6379"
```

### Frontend

No environment variables needed for the frontend. The API URL is configured in `src/lib/api.ts`.

---

## 📚 API Documentation

### Swagger Documentation

Once the backend is running, visit:

**http://localhost:3000/api-docs**

This provides interactive API documentation with:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

### API Endpoints Overview

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/become-host` - Upgrade to host role

#### Listings
- `GET /api/v1/listings` - Get all listings (with filters)
- `GET /api/v1/listings/:id` - Get listing by ID
- `POST /api/v1/listings` - Create new listing (host only)
- `PUT /api/v1/listings/:id` - Update listing (host only)
- `DELETE /api/v1/listings/:id` - Delete listing (host only)
- `POST /api/v1/listings/:id/photos` - Upload photos

#### Bookings
- `GET /api/v1/bookings` - Get user's bookings
- `GET /api/v1/bookings/:id` - Get booking by ID
- `POST /api/v1/bookings` - Create new booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id` - Cancel booking
- `GET /api/v1/bookings/host/:hostId` - Get host's bookings

#### Reviews
- `GET /api/v1/reviews/listing/:listingId` - Get listing reviews
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review
- `POST /api/v1/reviews/:id/response` - Host response to review

#### AI Features
- `POST /api/v1/ai/search` - Smart search with natural language
- `POST /api/v1/ai/support` - AI chatbot support
- `POST /api/v1/ai/generate-description` - Generate listing description
- `POST /api/v1/ai/recommendations` - Get booking recommendations
- `GET /api/v1/ai/reviews/:listingId/summary` - Get review summary

#### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update profile
- `POST /api/v1/users/avatar` - Upload avatar
- `GET /api/v1/users/:id` - Get user by ID (admin only)
- `PUT /api/v1/users/:id/suspend` - Suspend user (admin only)

---

## 🗄 Database Schema

### Core Tables

#### Users
- `id` (UUID, Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `name`
- `role` (GUEST, HOST, ADMIN)
- `avatar`
- `bio`
- `emailVerified`
- `suspended`
- `createdAt`, `updatedAt`

#### Listings
- `id` (UUID, Primary Key)
- `title`
- `description`
- `location`
- `type` (APARTMENT, HOUSE, STUDIO, CONDO)
- `pricePerNight`
- `weekendPrice`
- `weeklyDiscount`, `monthlyDiscount`
- `guests`, `bedrooms`, `bathrooms`
- `amenities` (Array)
- `cancellationPolicy` (FLEXIBLE, MODERATE, STRICT)
- `isPublished`
- `hostId` (Foreign Key → Users)
- `createdAt`, `updatedAt`

#### Bookings
- `id` (UUID, Primary Key)
- `listingId` (Foreign Key → Listings)
- `userId` (Foreign Key → Users)
- `checkIn`, `checkOut`
- `guests`
- `totalPrice`
- `status` (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `createdAt`, `updatedAt`

#### Reviews
- `id` (UUID, Primary Key)
- `listingId` (Foreign Key → Listings)
- `userId` (Foreign Key → Users)
- `rating` (1-5)
- `comment`
- `hostResponse`
- `createdAt`, `updatedAt`

#### Photos
- `id` (UUID, Primary Key)
- `listingId` (Foreign Key → Listings)
- `url`
- `publicId` (Cloudinary)
- `createdAt`

### Relationships

- **User → Listings** (One-to-Many): A host can have multiple listings
- **User → Bookings** (One-to-Many): A guest can have multiple bookings
- **Listing → Bookings** (One-to-Many): A listing can have multiple bookings
- **Listing → Reviews** (One-to-Many): A listing can have multiple reviews
- **Listing → Photos** (One-to-Many): A listing can have multiple photos
- **User → Reviews** (One-to-Many): A user can write multiple reviews

---

## 🤖 AI Features

### 1. Smart Search
Natural language search that understands queries like:
- "2 bedroom apartment in downtown under $200"
- "Studio near beach with WiFi"
- "House for 6 people in Paris"

The AI extracts filters (location, type, price, guests) and returns matching listings.

### 2. AI Chatbot
Professional support assistant with comprehensive knowledge about:
- Booking process (step-by-step)
- Cancellation policies (all 3 types)
- Payment methods and timing
- Review system
- Host communication
- Account features
- Search functionality

**Example Questions**:
- "How do I book a listing?"
- "What is the cancellation policy?"
- "How do I become a host?"

### 3. Listing Description Generator
Generates compelling descriptions based on:
- Property details (type, location, guests)
- Amenities
- Price
- Desired tone (professional, friendly, luxury, casual)

### 4. Booking Recommendations
Personalized suggestions based on:
- User preferences (location, budget, dates)
- Guest capacity
- Amenities
- Ratings and reviews
- Price competitiveness

### 5. Review Summarization
AI-generated insights from guest reviews:
- Overall summary
- Top highlights
- Common concerns
- Sentiment analysis
- Rating distribution

---

## 🔒 Authentication

### JWT-Based Authentication

1. **Register/Login** → Receive access token (15min) and refresh token (7 days)
2. **Access Token** → Include in `Authorization: Bearer <token>` header
3. **Refresh Token** → Use `/auth/refresh` to get new access token
4. **Logout** → Invalidate refresh token

### Role-Based Access Control

- **GUEST**: Can browse, book, review listings
- **HOST**: Can create/manage listings + all guest features
- **ADMIN**: Full access to all features + user management

### OAuth Integration

Supports login with:
- Google
- Facebook
- GitHub

### Multi-Factor Authentication (MFA)

- TOTP-based (Google Authenticator, Authy)
- QR code generation
- Backup codes

---

## 📸 Screenshots

### Home Page
Modern landing page with hero section, search bar, and featured listings.

### Listings Page
Grid/map view with filters, sorting, and real-time search.

### Listing Detail
Comprehensive listing page with photos, amenities, reviews, and booking form.

### Booking Dashboard
Guest dashboard with upcoming trips, booking history, and quick actions.

### Host Dashboard
Host dashboard with listings, bookings, reviews, and earnings.

### AI Chatbot
Floating chatbot with professional, project-specific responses.

### Become a Host Wizard
7-step onboarding process for new hosts.

---

## 🧪 Testing

### Backend Testing

```bash
cd airbnb-api

# Run tests (if configured)
npm test

# Test with Postman
# Import the Postman collection from /docs/postman/
```

### Frontend Testing

```bash
cd airbnb-app

# Run tests (if configured)
npm test
```

---

## 🚢 Deployment

### Backend Deployment

**Recommended platforms**:
- **Railway** (PostgreSQL + Node.js)
- **Render** (PostgreSQL + Node.js)
- **Heroku** (PostgreSQL + Node.js)
- **AWS** (RDS + EC2/ECS)

**Steps**:
1. Set up PostgreSQL database
2. Configure environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Start server: `npm start`

### Frontend Deployment

**Recommended platforms**:
- **Vercel** (Recommended for Vite/React)
- **Netlify**
- **AWS S3 + CloudFront**

**Steps**:
1. Build: `npm run build`
2. Deploy `dist` folder
3. Configure API URL in `src/lib/api.ts`

---

## 📝 Documentation

Additional documentation files:
- `AI_FEATURES_COMPLETE.md` - AI features implementation
- `AI_CHATBOX_IMPROVEMENTS.md` - Chatbot enhancements
- `CHATBOX_COMPLETE.md` - Chatbox testing guide
- `CHATBOX_ERROR_FIX.md` - Chatbox error fixes
- `SAVED_LISTINGS_FIX.md` - Saved listings functionality
- `ARCHITECTURE.md` - System architecture
- `ASSIGNMENT_SUMMARY.md` - Project assignments
- `DEPLOYMENT_READY.md` - Deployment checklist
- `EMAIL_SETUP_GUIDE.md` - Email configuration
- `CLOUDINARY_SETUP.md` - Image upload setup
- `POSTMAN_GUIDE.md` - API testing guide

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Coding Standards

- Use TypeScript for type safety
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Alain296**
- GitHub: [@Alain296](https://github.com/Alain296)
- Repository: [Airbnb-](https://github.com/Alain296/Airbnb-)

---

## 🙏 Acknowledgments

- **ListOn Template** - UI/UX design inspiration
- **Groq** - AI/LLM API
- **Cloudinary** - Image hosting
- **Prisma** - Database ORM
- **React Community** - Amazing ecosystem

---

## 📞 Support

For support, email support@airbnb-clone.com or open an issue on GitHub.

---

## 🎯 Future Enhancements

- [ ] Real-time messaging between guests and hosts
- [ ] Payment integration (Stripe/PayPal)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Social features (follow hosts, share listings)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Progressive Web App (PWA)
- [ ] Push notifications
- [ ] Advanced search filters (map-based, radius)

---

**⭐ If you like this project, please give it a star on GitHub! ⭐**

---

Made with ❤️ by [Alain296](https://github.com/Alain296)
