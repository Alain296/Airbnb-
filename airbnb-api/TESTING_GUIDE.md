# Testing Guide for Airbnb API

## Setup

1. Make sure your `.env` file has:
```env
DATABASE_URL="your-database-url"
JWT_SECRET="your-long-random-secret-key"
JWT_EXPIRES_IN="7d"
```

2. Run migrations:
```bash
npm run prisma:migrate
```

3. Start the server:
```bash
npm run dev
```

## Test Scenarios

### 1. Authentication Flow

#### Register as Guest
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "username": "johndoe",
  "phone": "1234567890",
  "password": "password123",
  "role": "GUEST"
}
```
✅ Should return 201 with user (no password field)

#### Register as Host
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Jane Host",
  "email": "jane@example.com",
  "username": "janehost",
  "phone": "0987654321",
  "password": "password123",
  "role": "HOST"
}
```
✅ Should return 201 with user

#### Try to Register as Admin (Should Fail)
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Bad Actor",
  "email": "bad@example.com",
  "username": "badactor",
  "phone": "1111111111",
  "password": "password123",
  "role": "ADMIN"
}
```
❌ Should return 403: "You cannot self-assign ADMIN role"

#### Login
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```
✅ Should return 200 with token and user
💾 Save the token for next requests!

### 2. Protected Routes

#### Get My Profile
```bash
GET http://localhost:3000/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```
✅ Should return user with listings (if HOST) or bookings (if GUEST)

#### Try Without Token (Should Fail)
```bash
GET http://localhost:3000/auth/me
```
❌ Should return 401: "No token provided"

### 3. Listings (HOST Only)

#### Create Listing (as HOST)
```bash
POST http://localhost:3000/listings
Authorization: Bearer HOST_TOKEN_HERE
Content-Type: application/json

{
  "title": "Cozy Beach House",
  "description": "Beautiful beach house with ocean view",
  "location": "Miami, FL",
  "pricePerNight": 150,
  "guests": 4,
  "type": "HOUSE",
  "amenities": ["WiFi", "Pool", "Beach Access"]
}
```
✅ Should return 201 with listing

#### Try Creating Listing as GUEST (Should Fail)
```bash
POST http://localhost:3000/listings
Authorization: Bearer GUEST_TOKEN_HERE
Content-Type: application/json

{
  "title": "Test",
  "description": "Test listing",
  "location": "Test",
  "pricePerNight": 100,
  "guests": 2,
  "type": "APARTMENT",
  "amenities": ["WiFi"]
}
```
❌ Should return 403: "Only hosts can perform this action"

#### Get All Listings (Public)
```bash
GET http://localhost:3000/listings
```
✅ Should return 200 with array of listings

#### Get Listings with Filters
```bash
GET http://localhost:3000/listings?location=Miami&maxPrice=200&type=HOUSE
```
✅ Should return filtered listings

### 4. Bookings (GUEST Only)

#### Create Booking (as GUEST)
```bash
POST http://localhost:3000/bookings
Authorization: Bearer GUEST_TOKEN_HERE
Content-Type: application/json

{
  "listingId": 1,
  "checkIn": "2026-05-01T14:00:00.000Z",
  "checkOut": "2026-05-05T10:00:00.000Z"
}
```
✅ Should return 201 with booking

#### Try Booking in the Past (Should Fail)
```bash
POST http://localhost:3000/bookings
Authorization: Bearer GUEST_TOKEN_HERE
Content-Type: application/json

{
  "listingId": 1,
  "checkIn": "2024-01-01T14:00:00.000Z",
  "checkOut": "2024-01-05T10:00:00.000Z"
}
```
❌ Should return 400: "checkIn must be in the future"

#### Try Overlapping Booking (Should Fail)
First, update the first booking status to CONFIRMED in Prisma Studio, then:
```bash
POST http://localhost:3000/bookings
Authorization: Bearer GUEST_TOKEN_HERE
Content-Type: application/json

{
  "listingId": 1,
  "checkIn": "2026-05-03T14:00:00.000Z",
  "checkOut": "2026-05-07T10:00:00.000Z"
}
```
❌ Should return 409: "Listing is already booked for these dates"

#### Cancel Booking
```bash
DELETE http://localhost:3000/bookings/1
Authorization: Bearer GUEST_TOKEN_HERE
```
✅ Should return 200: "Booking cancelled successfully"
📝 Note: Booking is not deleted, status is set to CANCELLED

#### Try Cancelling Again (Should Fail)
```bash
DELETE http://localhost:3000/bookings/1
Authorization: Bearer GUEST_TOKEN_HERE
```
❌ Should return 400: "Booking is already cancelled"

### 5. Password Management

#### Change Password
```bash
POST http://localhost:3000/auth/change-password
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```
✅ Should return 200: "Password changed successfully"

#### Forgot Password
```bash
POST http://localhost:3000/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```
✅ Should return 200 (check console for reset token)
📝 Copy the token from console logs

#### Reset Password
```bash
POST http://localhost:3000/auth/reset-password/TOKEN_FROM_CONSOLE
Content-Type: application/json

{
  "password": "resetpassword123"
}
```
✅ Should return 200: "Password reset successfully"

### 6. Validation Tests

#### Invalid Email Format
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Test",
  "email": "not-an-email",
  "username": "test",
  "phone": "1234567890",
  "password": "password123"
}
```
❌ Should return 400 with validation errors

#### Short Password
```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Test",
  "email": "test@example.com",
  "username": "test",
  "phone": "1234567890",
  "password": "short"
}
```
❌ Should return 400: "Password must be at least 8 characters"

#### Invalid Listing Type
```bash
POST http://localhost:3000/listings
Authorization: Bearer HOST_TOKEN_HERE
Content-Type: application/json

{
  "title": "Test",
  "description": "Test listing",
  "location": "Test",
  "pricePerNight": 100,
  "guests": 2,
  "type": "INVALID_TYPE",
  "amenities": ["WiFi"]
}
```
❌ Should return 400 with validation error

## Admin Testing

To test ADMIN features:
1. Create a user through registration
2. Manually set their role to ADMIN in Prisma Studio
3. Login to get an ADMIN token
4. Test that ADMIN can:
   - Create/edit/delete any listing
   - Cancel any booking
   - Update booking status
   - Access all user routes

## Tools for Testing

### Using cURL
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Using Postman
1. Import the endpoints
2. Set up environment variables for tokens
3. Use Collections to organize tests

### Using VS Code REST Client
Create a `.http` file with all requests and use the REST Client extension.

## Expected Status Codes

- **200**: Success (GET, PUT, PATCH)
- **201**: Created (POST)
- **400**: Bad Request (validation errors, invalid data)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (valid token, wrong role/not owner)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate email, overlapping booking)
- **500**: Internal Server Error

## Common Issues

1. **"JWT_SECRET is not configured"**: Add JWT_SECRET to .env
2. **"Invalid or expired token"**: Token expired or malformed, login again
3. **"Only hosts can perform this action"**: Using GUEST token for HOST route
4. **Validation errors**: Check request body matches schema requirements
