# Airbnb Clone

A full-stack Airbnb-style booking platform built with React, TypeScript, Node.js, Express, Prisma, and PostgreSQL. The project includes guest booking flows, host listing management, admin tools, image uploads, email workflows, OAuth/MFA authentication, and AI-powered listing support.

## Project Overview

This repository contains two applications:

- `airbnb-api` - Express API with Prisma, PostgreSQL, JWT auth, Swagger documentation, Cloudinary uploads, email integration, and AI endpoints.
- `airbnb-app` - React/Vite frontend with guest, host, and admin dashboards.

## Main Features

- User registration, login, JWT refresh tokens, Google OAuth, and MFA support
- Role-based access for guests, hosts, and admins
- Listing creation, editing, publishing, moderation, and photo upload
- Search and filtering by location, type, price, guests, and amenities
- Booking creation, guest booking management, and host booking management
- Reviews, ratings, and host responses
- Saved listings and guest wishlist features
- Admin dashboards for users, listings, bookings, and moderation
- AI chat support, smart search, description generation, recommendations, and review summaries
- Swagger API documentation
- Email setup for development and production providers

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- React Hot Toast
- React Icons

### Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT
- Passport Google OAuth
- Nodemailer
- Cloudinary
- Swagger
- LangChain and Groq

## Repository Structure

```text
Airbnb/
├── airbnb-api/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── templates/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── index.ts
│   ├── package.json
│   └── README.md
├── airbnb-app/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── data/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── shared/
│   │   ├── store/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── README.md
└── README.md
```

## Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL
- Git
- Optional service accounts for Cloudinary, Gmail/Mailtrap, Google OAuth, and Groq

## Getting Started

Clone the repository:

```bash
git clone https://github.com/Alain296/Airbnb-.git
cd Airbnb-
```

Install and run the backend:

```bash
cd airbnb-api
npm install
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs on:

```text
http://localhost:3000
```

Install and run the frontend in a second terminal:

```bash
cd airbnb-app
npm install
npm run dev
```

The frontend usually runs on:

```text
http://localhost:5173
```

## Environment Variables

Create `airbnb-api/.env` from `airbnb-api/.env.example`.

Common backend variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/airbnb_db"
JWT_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"

CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

EMAIL_HOST="sandbox.smtp.mailtrap.io"
EMAIL_PORT=2525
EMAIL_USER="your-email-user"
EMAIL_PASS="your-email-password"
EMAIL_FROM="noreply@airbnb-clone.com"

GROQ_API_KEY="your-groq-api-key"
ENABLE_MOCK_MODE=true

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

For the frontend, create `airbnb-app/.env` only when you need to override the default API URL:

```env
VITE_API_URL="http://localhost:3000/api/v1"
```

Never commit real `.env` files or API keys.

## Useful Commands

Backend:

```bash
cd airbnb-api
npm run dev
npm run build
npm start
npm run db:migrate
npm run db:seed
npm run db:studio
```

Frontend:

```bash
cd airbnb-app
npm run dev
npm run build
npm run lint
npm run preview
```

## API Documentation

Start the backend and open:

```text
http://localhost:3000/api-docs
```

Health check:

```text
http://localhost:3000/health
```

Main API base URL:

```text
http://localhost:3000/api/v1
```

## API Areas

- `auth` - registration, login, refresh token, password reset, OAuth, MFA, host onboarding
- `users` - profile, avatar, admin user actions
- `listings` - listing CRUD, search, photos, saved listings, approval workflows
- `bookings` - guest and host booking workflows
- `reviews` - guest reviews and host responses
- `stats` - dashboard analytics
- `upload` - file upload support
- `ai` - chatbot, smart search, generated descriptions, recommendations, review summaries

## Database

The backend uses Prisma with PostgreSQL. Core models include:

- `User`
- `Listing`
- `ListingPhoto`
- `Booking`
- `Review`
- `BlockedDate`

Run migrations during local setup:

```bash
cd airbnb-api
npm run db:migrate
```

Open Prisma Studio:

```bash
npm run db:studio
```

## Deployment Notes

Backend deployment:

- Use a Node.js host such as Render, Railway, Fly.io, or Heroku.
- Add all required environment variables in the hosting dashboard.
- Use a hosted PostgreSQL database.
- Run `npm run build`, then `npm start`.
- Run production migrations with `npm run migrate`.

Frontend deployment:

- Use Vercel, Netlify, or another static hosting provider.
- Set `VITE_API_URL` to the deployed API URL.
- Build with `npm run build`.
- Deploy the `dist` folder.

## Documentation

More detailed notes are available inside the app folders, including:

- `airbnb-api/ARCHITECTURE.md`
- `airbnb-api/QUICK_START.md`
- `airbnb-api/TESTING_GUIDE.md`
- `airbnb-api/EMAIL_SETUP_GUIDE.md`
- `airbnb-api/CLOUDINARY_SETUP.md`
- `airbnb-api/RENDER_DEPLOYMENT_GUIDE.md`
- `airbnb-app/TROUBLESHOOTING.md`

## Author

Created by [Alain296](https://github.com/Alain296).

