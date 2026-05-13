# Quick Start Guide

## Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm or yarn

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd airbnb-api
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/airbnb_db"
JWT_SECRET="your-super-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Run Database Migrations
```bash
npm run prisma:migrate
```

### 4. Start the Server
```bash
npm run dev
```

Server runs at: `http://localhost:3000`

## First API Calls

### 1. Register a Host
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Host",
    "email": "jane@example.com",
    "username": "janehost",
    "phone": "1234567890",
    "password": "password123",
    "role": "HOST"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

Copy the `token` from the response!

### 3. Create a Listing
```bash
curl -X POST http://localhost:3000/listings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Cozy Beach House",
    "description": "Beautiful beach house with ocean view",
    "location": "Miami, FL",
    "pricePerNight": 150,
    "guests": 4,
    "type": "HOUSE",
    "amenities": ["WiFi", "Pool", "Beach Access"]
  }'
```

### 4. Register a Guest
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Guest",
    "email": "john@example.com",
    "username": "johnguest",
    "phone": "0987654321",
    "password": "password123",
    "role": "GUEST"
  }'
```

### 5. Login as Guest
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 6. Create a Booking
```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer GUEST_TOKEN_HERE" \
  -d '{
    "listingId": 1,
    "checkIn": "2026-06-01T14:00:00.000Z",
    "checkOut": "2026-06-05T10:00:00.000Z"
  }'
```

## Create an Admin User

1. Register a regular user
2. Open Prisma Studio:
```bash
npm run prisma:studio
```
3. Find the user in the `User` table
4. Change their `role` to `ADMIN`
5. Login to get an admin token

## Common Commands

```bash
# Development server with auto-reload
npm run dev

# Production server
npm run start

# Generate Prisma client
npm run prisma:generate

# Create new migration
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## Project Structure

```
airbnb-api/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Business logic
│   ├── middlewares/     # Auth & validation
│   ├── routes/          # API routes
│   ├── validators/      # Zod schemas
│   ├── utils/           # Helper functions
│   └── index.ts         # App entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## Documentation

- **ASSIGNMENT_CHECKLIST.md** - Complete feature checklist
- **TESTING_GUIDE.md** - Detailed testing scenarios
- **ARCHITECTURE.md** - System architecture diagrams
- **ASSIGNMENT_SUMMARY.md** - Project overview

## Troubleshooting

### "JWT_SECRET is not configured"
Add `JWT_SECRET` to your `.env` file

### "Invalid or expired token"
Token expired or malformed. Login again to get a new token.

### "Only hosts can perform this action"
You're using a GUEST token for a HOST-only route. Login as a HOST.

### Database connection errors
Check your `DATABASE_URL` in `.env` and ensure PostgreSQL is running.

### Port already in use
Change `PORT` in `.env` or kill the process using port 3000:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## Next Steps

1. Read `TESTING_GUIDE.md` for comprehensive testing
2. Review `ARCHITECTURE.md` to understand the system
3. Check `ASSIGNMENT_CHECKLIST.md` to verify all features
4. Start building your frontend!

## Support

If you encounter issues:
1. Check the error message carefully
2. Review the relevant documentation file
3. Verify your `.env` configuration
4. Check database connection
5. Ensure migrations are up to date

Happy coding! 🚀
