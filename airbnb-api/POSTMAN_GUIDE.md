# Postman Testing Guide - Step by Step

## Setup Postman

1. Open Postman
2. Create a new Collection called "Airbnb API"
3. Set the base URL variable (optional but recommended):
   - Click on your collection → Variables tab
   - Add variable: `baseUrl` = `http://localhost:3000`

---

## Step 1: Register a HOST

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/auth/register`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "name": "Sarah Johnson",
  "email": "sarah.host@airbnb.com",
  "username": "sarahhost",
  "phone": "1234567890",
  "password": "SecurePass123",
  "role": "HOST",
  "avatar": "https://i.pravatar.cc/150?img=5",
  "bio": "Experienced host with 5 properties in Miami"
}
```

### Expected Response (201 Created):
```json
{
  "id": 1,
  "name": "Sarah Johnson",
  "email": "sarah.host@airbnb.com",
  "username": "sarahhost",
  "phone": "1234567890",
  "role": "HOST",
  "avatar": "https://i.pravatar.cc/150?img=5",
  "bio": "Experienced host with 5 properties in Miami",
  "createdAt": "2026-04-27T...",
  "updatedAt": "2026-04-27T...",
  "resetToken": null,
  "resetTokenExpiry": null
}
```

**Note**: Password is NOT returned (security feature)

---

## Step 2: Login as HOST

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "email": "sarah.host@airbnb.com",
  "password": "SecurePass123"
}
```

### Expected Response (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Sarah Johnson",
    "email": "sarah.host@airbnb.com",
    "username": "sarahhost",
    "phone": "1234567890",
    "role": "HOST",
    "avatar": "https://i.pravatar.cc/150?img=5",
    "bio": "Experienced host with 5 properties in Miami",
    "createdAt": "2026-04-27T...",
    "updatedAt": "2026-04-27T..."
  }
}
```

### 🔑 IMPORTANT: Save the Token!

**In Postman:**
1. Go to the "Tests" tab of this request
2. Add this script to automatically save the token:

```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("hostToken", response.token);
    console.log("Host token saved!");
}
```

3. Now you can use `{{hostToken}}` in other requests

**OR manually:**
- Copy the token value
- Go to Collection → Variables
- Create variable: `hostToken` = paste the token

---

## Step 3: Register a GUEST

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/auth/register`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "name": "Michael Chen",
  "email": "michael.guest@airbnb.com",
  "username": "michaelchen",
  "phone": "0987654321",
  "password": "GuestPass456",
  "role": "GUEST",
  "avatar": "https://i.pravatar.cc/150?img=12",
  "bio": "Travel enthusiast, love exploring new cities"
}
```

### Expected Response (201 Created):
```json
{
  "id": 2,
  "name": "Michael Chen",
  "email": "michael.guest@airbnb.com",
  "username": "michaelchen",
  "phone": "0987654321",
  "role": "GUEST",
  "avatar": "https://i.pravatar.cc/150?img=12",
  "bio": "Travel enthusiast, love exploring new cities",
  "createdAt": "2026-04-27T...",
  "updatedAt": "2026-04-27T...",
  "resetToken": null,
  "resetTokenExpiry": null
}
```

---

## Step 4: Login as GUEST

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):

```json
{
  "email": "michael.guest@airbnb.com",
  "password": "GuestPass456"
}
```

### Expected Response (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "name": "Michael Chen",
    "email": "michael.guest@airbnb.com",
    "username": "michaelchen",
    "phone": "0987654321",
    "role": "GUEST",
    "avatar": "https://i.pravatar.cc/150?img=12",
    "bio": "Travel enthusiast, love exploring new cities",
    "createdAt": "2026-04-27T...",
    "updatedAt": "2026-04-27T..."
  }
}
```

### 🔑 Save the Guest Token!

**In Postman Tests tab:**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.collectionVariables.set("guestToken", response.token);
    console.log("Guest token saved!");
}
```

---

## Step 5: Verify HOST Profile

### Request Details:
- **Method**: GET
- **URL**: `http://localhost:3000/auth/me`
- **Headers**: 
  - `Authorization: Bearer {{hostToken}}`

### Expected Response (200 OK):
```json
{
  "id": 1,
  "name": "Sarah Johnson",
  "email": "sarah.host@airbnb.com",
  "username": "sarahhost",
  "phone": "1234567890",
  "role": "HOST",
  "avatar": "https://i.pravatar.cc/150?img=5",
  "bio": "Experienced host with 5 properties in Miami",
  "createdAt": "2026-04-27T...",
  "updatedAt": "2026-04-27T...",
  "listings": []
}
```

**Note**: Includes `listings` array because user is a HOST

---

## Step 6: Verify GUEST Profile

### Request Details:
- **Method**: GET
- **URL**: `http://localhost:3000/auth/me`
- **Headers**: 
  - `Authorization: Bearer {{guestToken}}`

### Expected Response (200 OK):
```json
{
  "id": 2,
  "name": "Michael Chen",
  "email": "michael.guest@airbnb.com",
  "username": "michaelchen",
  "phone": "0987654321",
  "role": "GUEST",
  "avatar": "https://i.pravatar.cc/150?img=12",
  "bio": "Travel enthusiast, love exploring new cities",
  "createdAt": "2026-04-27T...",
  "updatedAt": "2026-04-27T...",
  "bookings": []
}
```

**Note**: Includes `bookings` array because user is a GUEST

---

## Postman Collection Variables Summary

After completing the steps above, you should have these variables:

| Variable | Value | Usage |
|----------|-------|-------|
| `baseUrl` | `http://localhost:3000` | Base API URL |
| `hostToken` | `eyJhbGci...` | HOST authentication |
| `guestToken` | `eyJhbGci...` | GUEST authentication |

---

## Common Errors and Solutions

### ❌ "All fields are required"
**Problem**: Missing required fields in registration
**Solution**: Ensure all fields are present: name, email, username, phone, password

### ❌ "Email or username already in use"
**Problem**: User already exists
**Solution**: Use different email/username or delete existing user from database

### ❌ "Password must be at least 8 characters"
**Problem**: Password too short
**Solution**: Use password with 8+ characters

### ❌ "Invalid credentials"
**Problem**: Wrong email or password
**Solution**: Double-check email and password match registration

### ❌ "No token provided"
**Problem**: Missing Authorization header
**Solution**: Add header: `Authorization: Bearer {{token}}`

### ❌ "Invalid or expired token"
**Problem**: Token is invalid or expired (7 days)
**Solution**: Login again to get a new token

---

## Next Steps

Now that you have a HOST and GUEST created, you can:

1. **As HOST**: Create listings
2. **As GUEST**: Make bookings
3. Test authorization (try GUEST creating listing - should fail)
4. Test ownership (try editing another user's listing - should fail)

Continue to the next guide for creating listings and bookings!

---

## Quick Copy-Paste Data

### HOST Registration:
```json
{
  "name": "Sarah Johnson",
  "email": "sarah.host@airbnb.com",
  "username": "sarahhost",
  "phone": "1234567890",
  "password": "SecurePass123",
  "role": "HOST",
  "avatar": "https://i.pravatar.cc/150?img=5",
  "bio": "Experienced host with 5 properties in Miami"
}
```

### HOST Login:
```json
{
  "email": "sarah.host@airbnb.com",
  "password": "SecurePass123"
}
```

### GUEST Registration:
```json
{
  "name": "Michael Chen",
  "email": "michael.guest@airbnb.com",
  "username": "michaelchen",
  "phone": "0987654321",
  "password": "GuestPass456",
  "role": "GUEST",
  "avatar": "https://i.pravatar.cc/150?img=12",
  "bio": "Travel enthusiast, love exploring new cities"
}
```

### GUEST Login:
```json
{
  "email": "michael.guest@airbnb.com",
  "password": "GuestPass456"
}
```

---

## Postman Tips

1. **Organize Requests**: Create folders in your collection:
   - 📁 Auth (register, login, me, change-password, etc.)
   - 📁 Listings (create, get, update, delete)
   - 📁 Bookings (create, get, cancel)
   - 📁 Users (admin only)

2. **Use Environment Variables**: Create environments for:
   - Development (localhost:3000)
   - Production (your deployed URL)

3. **Save Examples**: After successful requests, save the response as an example

4. **Use Pre-request Scripts**: Automatically refresh tokens if needed

5. **Test Scripts**: Automatically validate responses and save tokens

Happy testing! 🚀
