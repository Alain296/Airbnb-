# Lesson 3 Assignment Checklist: Authentication & Authorization

## ✅ Part 1 — Prisma Schema
- [x] Role enum added (ADMIN, HOST, GUEST)
- [x] User model has `role` field (default: GUEST)
- [x] User model has `password` field (String)
- [x] User model has `updatedAt` field (@updatedAt)
- [x] User model has `resetToken` field (String?)
- [x] User model has `resetTokenExpiry` field (DateTime?)
- [x] Migration `add_roles_and_auth_fields` created

## ✅ Part 2 — Register & Login
- [x] bcrypt and jsonwebtoken installed
- [x] JWT_SECRET in .env
- [x] register endpoint validates all required fields
- [x] register validates password length (min 8 chars)
- [x] register prevents ADMIN self-assignment
- [x] register checks for duplicate email/username
- [x] register hashes password with bcrypt
- [x] register returns user without password
- [x] login validates email and password
- [x] login returns generic "Invalid credentials" message
- [x] login compares password with bcrypt
- [x] login signs JWT with userId and role
- [x] login returns token and user (without password)

## ✅ Part 3 — Auth Middleware
- [x] AuthRequest interface extends Request
- [x] authenticate middleware reads Authorization header
- [x] authenticate validates Bearer token format
- [x] authenticate verifies JWT and attaches userId/role
- [x] authenticate returns 401 on invalid/expired token
- [x] requireHost allows HOST and ADMIN
- [x] requireHost returns 403 for other roles
- [x] requireGuest allows GUEST and ADMIN
- [x] requireGuest returns 403 for other roles
- [x] requireAdmin exists and checks for ADMIN role
- [x] 401 used for authentication failures
- [x] 403 used for authorization failures

## ✅ Part 4 — Protected Listing Routes
- [x] POST /listings requires authenticate + requireHost
- [x] PUT /listings/:id requires authenticate
- [x] DELETE /listings/:id requires authenticate
- [x] createListing uses req.userId as hostId
- [x] createListing never accepts hostId from request body
- [x] updateListing checks ownership (listing.hostId === req.userId)
- [x] updateListing allows ADMIN to bypass ownership check
- [x] updateListing returns 403 for non-owners
- [x] deleteListing checks ownership
- [x] deleteListing allows ADMIN to bypass ownership check

## ✅ Part 5 — Protected Booking Routes
- [x] POST /bookings requires authenticate + requireGuest
- [x] DELETE /bookings/:id requires authenticate
- [x] createBooking uses req.userId as guestId
- [x] createBooking validates required fields
- [x] createBooking parses dates correctly
- [x] createBooking validates checkOut > checkIn
- [x] createBooking validates checkIn is in the future ⭐ NEW
- [x] createBooking verifies listing exists
- [x] createBooking checks for overlapping bookings ⭐ NEW
- [x] createBooking returns 409 on conflict ⭐ NEW
- [x] createBooking calculates totalPrice server-side
- [x] createBooking sets status to PENDING
- [x] deleteBooking checks ownership
- [x] deleteBooking checks if already cancelled ⭐ NEW
- [x] deleteBooking updates status to CANCELLED (not delete) ⭐ NEW

## ✅ Part 6 — Profile & Password Management
- [x] GET /auth/me requires authenticate
- [x] GET /auth/me fetches user by req.userId
- [x] GET /auth/me includes listings for HOST
- [x] GET /auth/me includes bookings for GUEST
- [x] GET /auth/me returns user without password
- [x] POST /auth/change-password requires authenticate
- [x] change-password validates both fields present
- [x] change-password verifies current password
- [x] change-password validates new password length
- [x] change-password hashes new password
- [x] change-password returns success message

## ✅ Part 7 — Forgot Password & Reset
- [x] POST /auth/forgot-password accepts email
- [x] forgot-password returns same response regardless of email existence
- [x] forgot-password generates crypto.randomBytes token
- [x] forgot-password hashes token before storing
- [x] forgot-password sets 1-hour expiry
- [x] forgot-password logs reset link (email simulation)
- [x] POST /auth/reset-password/:token reads token from params
- [x] reset-password hashes incoming token
- [x] reset-password finds user by hashed token + expiry check
- [x] reset-password returns 400 for invalid/expired token
- [x] reset-password validates new password length
- [x] reset-password hashes new password
- [x] reset-password clears resetToken and resetTokenExpiry
- [x] reset-password returns success message

## ✅ Bonus — Validation (Not Required)
- [x] Zod validators created for all endpoints
- [x] validate middleware created
- [x] All routes use validation middleware
- [x] Validation errors return 400 with detailed messages

## 🎯 Key Concepts Verified

### Authentication vs Authorization
- **401 Unauthorized**: Missing or invalid token (authentication failure)
- **403 Forbidden**: Valid token but insufficient permissions (authorization failure)

### Security Best Practices
- ✅ Passwords hashed with bcrypt (never stored plain)
- ✅ JWT tokens include userId and role
- ✅ JWT payload is readable (no sensitive data stored)
- ✅ Reset tokens hashed before database storage
- ✅ Reset tokens expire after 1 hour
- ✅ Generic error messages prevent email enumeration
- ✅ Ownership checks prevent unauthorized access
- ✅ ADMIN role bypasses ownership restrictions

### Date Overlap Logic
The booking conflict check uses Prisma's date comparison:
```typescript
{
  checkIn: { lt: checkOutDate },  // Existing starts before new ends
  checkOut: { gt: checkInDate }   // Existing ends after new starts
}
```
This catches all overlapping scenarios.

## 📝 Testing Recommendations

1. **Register & Login**
   - Try registering with ADMIN role (should fail)
   - Try duplicate email/username (should return 409)
   - Try short password (should return 400)
   - Login with wrong password (should return 401)

2. **Protected Routes**
   - Try accessing without token (should return 401)
   - Try HOST creating booking (should return 403)
   - Try GUEST creating listing (should return 403)
   - Try editing another user's listing (should return 403)

3. **Bookings**
   - Try booking with past check-in date (should return 400)
   - Try booking with checkOut before checkIn (should return 400)
   - Try overlapping bookings (should return 409)
   - Try cancelling already cancelled booking (should return 400)

4. **Password Reset**
   - Request reset for non-existent email (should return 200)
   - Try using expired token (should return 400)
   - Try using token twice (should fail second time)

## 🚀 All Requirements Complete!

Your Airbnb API now has a complete authentication and authorization system with:
- Secure password handling
- JWT-based authentication
- Role-based access control
- Ownership verification
- Password reset functionality
- Booking conflict prevention
- Comprehensive validation
