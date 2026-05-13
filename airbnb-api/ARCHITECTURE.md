# Airbnb API Architecture

## Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXPRESS MIDDLEWARE                         │
│  1. express.json() - Parse JSON body                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTE MATCHING                          │
│  /auth/*     → authRouter                                      │
│  /users/*    → usersRouter (requires ADMIN)                    │
│  /listings/* → listingsRouter                                  │
│  /bookings/* → bookingsRouter                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION MIDDLEWARE                        │
│  validate(schema) - Zod validation                             │
│  ├─ Validates req.body                                         │
│  ├─ Validates req.query                                        │
│  └─ Validates req.params                                       │
│  ❌ Returns 400 if validation fails                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION MIDDLEWARE                      │
│  authenticate()                                                 │
│  ├─ Reads Authorization header                                 │
│  ├─ Verifies JWT token                                         │
│  ├─ Attaches userId and role to req                           │
│  └─ ❌ Returns 401 if token invalid/missing                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  AUTHORIZATION MIDDLEWARE                       │
│  requireHost() / requireGuest() / requireAdmin()               │
│  ├─ Checks req.role                                            │
│  ├─ ADMIN bypasses all role checks                            │
│  └─ ❌ Returns 403 if wrong role                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CONTROLLER                              │
│  Business Logic                                                 │
│  ├─ Ownership verification                                     │
│  ├─ Database operations (Prisma)                               │
│  ├─ Data transformation                                        │
│  └─ Response formatting                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (Prisma)                          │
│  PostgreSQL via Prisma ORM                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      JSON RESPONSE                              │
│  Success: 200/201 with data                                    │
│  Error: 400/401/403/404/409/500 with message                  │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────────┐
│   REGISTER   │
└──────┬───────┘
       │
       ├─► Validate input (Zod)
       ├─► Check email/username not taken
       ├─► Hash password (bcrypt)
       ├─► Create user in DB
       └─► Return user (without password)

┌──────────────┐
│    LOGIN     │
└──────┬───────┘
       │
       ├─► Validate input (Zod)
       ├─► Find user by email
       ├─► Compare password (bcrypt)
       ├─► Sign JWT (userId + role)
       └─► Return { token, user }

┌──────────────┐
│ PROTECTED    │
│   ROUTE      │
└──────┬───────┘
       │
       ├─► Extract Bearer token
       ├─► Verify JWT signature
       ├─► Check expiration
       ├─► Attach userId & role to req
       └─► Continue to controller
```

## Authorization Matrix

| Resource | Action | GUEST | HOST | ADMIN |
|----------|--------|-------|------|-------|
| Listings | View   | ✅    | ✅   | ✅    |
| Listings | Create | ❌    | ✅   | ✅    |
| Listings | Update Own | ❌ | ✅   | ✅    |
| Listings | Update Any | ❌ | ❌   | ✅    |
| Listings | Delete Own | ❌ | ✅   | ✅    |
| Listings | Delete Any | ❌ | ❌   | ✅    |
| Bookings | View   | ✅    | ✅   | ✅    |
| Bookings | Create | ✅    | ❌   | ✅    |
| Bookings | Cancel Own | ✅ | ❌   | ✅    |
| Bookings | Cancel Any | ❌ | ❌   | ✅    |
| Bookings | Update Status | ❌ | ❌ | ✅  |
| Users    | View All | ❌  | ❌   | ✅    |
| Users    | Manage | ❌    | ❌   | ✅    |

## Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                            USER                                 │
├─────────────────────────────────────────────────────────────────┤
│ id              Int       @id @default(autoincrement())        │
│ name            String                                          │
│ email           String    @unique                               │
│ username        String    @unique                               │
│ phone           String                                          │
│ password        String    (bcrypt hash)                         │
│ role            Role      @default(GUEST)                       │
│ avatar          String?                                         │
│ bio             String?                                         │
│ resetToken      String?   (SHA-256 hash)                        │
│ resetTokenExpiry DateTime?                                      │
│ createdAt       DateTime  @default(now())                       │
│ updatedAt       DateTime  @updatedAt                            │
│                                                                  │
│ listings        Listing[] (if HOST)                             │
│ bookings        Booking[] (if GUEST)                            │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    │                           │
        ┌───────────┘                           └───────────┐
        │                                                   │
        ▼                                                   ▼
┌─────────────────────────┐                   ┌─────────────────────────┐
│       LISTING           │                   │       BOOKING           │
├─────────────────────────┤                   ├─────────────────────────┤
│ id          Int         │                   │ id          Int         │
│ title       String      │                   │ guestId     Int         │
│ description String      │◄──────────────────┤ listingId   Int         │
│ location    String      │                   │ checkIn     DateTime    │
│ pricePerNight Decimal   │                   │ checkOut    DateTime    │
│ guests      Int         │                   │ totalPrice  Decimal     │
│ type        ListingType │                   │ status      BookingStatus│
│ amenities   String[]    │                   │ createdAt   DateTime    │
│ rating      Decimal?    │                   │ updatedAt   DateTime    │
│ hostId      Int         │                   └─────────────────────────┘
│ createdAt   DateTime    │
│ updatedAt   DateTime    │
└─────────────────────────┘

┌─────────────────────────┐     ┌─────────────────────────┐
│    ENUM: Role           │     │ ENUM: ListingType       │
├─────────────────────────┤     ├─────────────────────────┤
│ ADMIN                   │     │ APARTMENT               │
│ HOST                    │     │ HOUSE                   │
│ GUEST                   │     │ VILLA                   │
└─────────────────────────┘     │ CONDO                   │
                                │ STUDIO                  │
┌─────────────────────────┐     └─────────────────────────┘
│ ENUM: BookingStatus     │
├─────────────────────────┤
│ PENDING                 │
│ CONFIRMED               │
│ CANCELLED               │
│ COMPLETED               │
└─────────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
└─────────────────────────────────────────────────────────────────┘

Layer 1: INPUT VALIDATION
├─ Zod schemas validate all inputs
├─ Type checking (string, number, email, etc.)
├─ Format validation (dates, URLs, enums)
└─ Business rules (min length, positive numbers)

Layer 2: AUTHENTICATION
├─ JWT token verification
├─ Token expiration check (7 days)
├─ Signature validation
└─ User existence verification

Layer 3: AUTHORIZATION
├─ Role-based access control (RBAC)
├─ Ownership verification
├─ ADMIN bypass for all checks
└─ Resource-specific permissions

Layer 4: DATA PROTECTION
├─ Password hashing (bcrypt, 10 rounds)
├─ Reset token hashing (SHA-256)
├─ Password never returned in responses
└─ Sensitive data excluded from JWT payload

Layer 5: BUSINESS LOGIC
├─ Booking conflict detection
├─ Date validation (future dates only)
├─ Status-based operations (no double-cancel)
└─ Server-side price calculation
```

## Error Handling Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                      ERROR RESPONSES                            │
└─────────────────────────────────────────────────────────────────┘

400 BAD REQUEST
├─ Validation errors (Zod)
├─ Invalid date ranges
├─ Missing required fields
├─ Already cancelled booking
└─ Invalid/expired reset token

401 UNAUTHORIZED (Authentication)
├─ No token provided
├─ Invalid token signature
├─ Expired token
├─ Wrong password
└─ Invalid credentials

403 FORBIDDEN (Authorization)
├─ Wrong role for action
├─ Not resource owner
├─ Cannot self-assign ADMIN
└─ Insufficient permissions

404 NOT FOUND
├─ User not found
├─ Listing not found
├─ Booking not found
└─ Route not found

409 CONFLICT
├─ Email already exists
├─ Username already taken
└─ Booking date conflict

500 INTERNAL SERVER ERROR
├─ Database errors
├─ Unexpected exceptions
└─ Configuration errors (missing JWT_SECRET)
```

## Booking Conflict Detection

```
Scenario: Checking if new booking overlaps with existing bookings

Existing Booking:  [====CONFIRMED====]
                   ↑                 ↑
                checkIn           checkOut

New Booking Cases:

1. OVERLAP (409):  [====NEW====]
                   ↑           ↑
                checkIn     checkOut

2. OVERLAP (409):      [====NEW====]
                       ↑           ↑
                    checkIn     checkOut

3. OVERLAP (409):  [========NEW========]
                   ↑                   ↑
                checkIn             checkOut

4. NO OVERLAP (✅):                    [====NEW====]
                                       ↑           ↑
                                    checkIn     checkOut

5. NO OVERLAP (✅): [====NEW====]
                    ↑           ↑
                 checkIn     checkOut

Prisma Query:
WHERE listingId = X
  AND status = CONFIRMED
  AND checkIn < newCheckOut    ← Existing starts before new ends
  AND checkOut > newCheckIn    ← Existing ends after new starts
```

## Password Reset Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    PASSWORD RESET FLOW                       │
└──────────────────────────────────────────────────────────────┘

1. FORGOT PASSWORD
   ├─ User submits email
   ├─ Generate random token (crypto.randomBytes)
   ├─ Hash token (SHA-256)
   ├─ Store hash + expiry (1 hour) in DB
   ├─ Send raw token via email
   └─ Return generic success message

2. USER RECEIVES EMAIL
   ├─ Email contains: http://app.com/reset-password/RAW_TOKEN
   └─ User clicks link

3. RESET PASSWORD
   ├─ Extract raw token from URL
   ├─ Hash incoming token (SHA-256)
   ├─ Find user by hashed token + expiry > now
   ├─ Validate new password
   ├─ Hash new password (bcrypt)
   ├─ Update password
   ├─ Clear resetToken and resetTokenExpiry
   └─ Return success

Security Notes:
- Raw token only sent via email (never stored)
- Hashed token stored in DB (safe if DB compromised)
- Token expires after 1 hour
- Token is single-use (cleared after reset)
- Same response whether email exists or not
```

## Deployment Checklist

```
┌──────────────────────────────────────────────────────────────┐
│                   PRODUCTION READINESS                       │
└──────────────────────────────────────────────────────────────┘

✅ Environment Variables
   ├─ DATABASE_URL (production database)
   ├─ JWT_SECRET (long, random, secure)
   ├─ JWT_EXPIRES_IN (7d recommended)
   └─ NODE_ENV=production

✅ Security Headers
   ├─ helmet (security headers)
   ├─ cors (CORS configuration)
   ├─ express-rate-limit (rate limiting)
   └─ express-mongo-sanitize (NoSQL injection)

✅ Logging
   ├─ winston or pino (structured logging)
   ├─ Log all auth attempts
   ├─ Log all errors
   └─ Don't log sensitive data

✅ Monitoring
   ├─ Health check endpoint
   ├─ Performance monitoring
   ├─ Error tracking (Sentry)
   └─ Uptime monitoring

✅ Database
   ├─ Connection pooling
   ├─ Indexes on frequently queried fields
   ├─ Regular backups
   └─ Migration strategy

✅ Testing
   ├─ Unit tests (controllers)
   ├─ Integration tests (routes)
   ├─ E2E tests (full flows)
   └─ Load testing
```

This architecture provides a solid foundation for a secure, scalable Airbnb-style API!
