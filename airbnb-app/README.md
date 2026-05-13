# 🏠 Airbnb Clone - Frontend Application

Modern, responsive React frontend for the Airbnb clone platform built with TypeScript, Vite, and TanStack Query.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠 Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **React Hot Toast** - Notifications
- **React Icons** - Feather Icons
- **Headless UI** - Accessible components

## 📁 Project Structure

```
src/
├── features/              # Feature-based modules
│   ├── auth/             # Authentication
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   ├── bookings/         # Booking management
│   ├── host/             # Host features
│   ├── listings/         # Listing management
│   └── home/             # Home page
├── shared/               # Shared components
│   ├── components/
│   │   ├── Chatbox.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   └── Spinner.tsx
│   └── hooks/
├── store/                # State management
├── lib/                  # Libraries
│   └── api.ts           # API client
├── App.tsx              # Root component
└── main.tsx             # Entry point
```

## 🎨 Features

### User Features
- Browse and search listings
- View listing details with photos and reviews
- Book listings with date selection
- Manage bookings (view, cancel)
- Leave reviews and ratings
- Save favorite listings
- AI chatbot support

### Host Features
- Create and manage listings
- Upload photos
- Set pricing and availability
- View and manage bookings
- Respond to reviews
- Dashboard with analytics

### Admin Features
- User management
- Listing moderation
- Booking oversight
- System analytics

## 🔧 Configuration

### API URL

Update the API URL in `src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

For production, change to your deployed API URL.

## 📦 Build

```bash
# Build for production
npm run build

# Output will be in /dist folder
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

## 🧪 Development

```bash
# Start dev server
npm run dev

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📝 Environment

No environment variables needed. API URL is configured in `src/lib/api.ts`.

## 🎯 Key Components

### Chatbox
AI-powered support chatbot with professional responses about platform features.

### Navbar
Responsive navigation with user menu, saved listings, and notifications.

### ListingCard
Reusable listing card with image, price, rating, and save functionality.

### BecomeHostPage
7-step wizard for guests to become hosts.

## 🔗 Links

- **Backend Repository**: [airbnb-api](../airbnb-api)
- **Main README**: [Root README](../README.md)

---

Made with ❤️ by [Alain296](https://github.com/Alain296)
