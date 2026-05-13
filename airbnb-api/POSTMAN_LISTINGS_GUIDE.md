# Creating Listings as HOST - Postman Guide

## Prerequisites
✅ You have Sarah's HOST token from login
✅ Server is running on http://localhost:3000

---

## Listing Types Available
- `APARTMENT` - City apartments
- `HOUSE` - Full houses
- `VILLA` - Luxury villas
- `CONDO` - Condominiums
- `STUDIO` - Studio apartments

---

## Step 1: Create Listing #1 - Luxury Beach House

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/listings`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_HOST_TOKEN_HERE`

### Body (raw JSON):
```json
{
  "title": "Luxury Beach House with Ocean View",
  "description": "Wake up to stunning ocean views in this beautiful 3-bedroom beach house. Features include a private pool, outdoor deck, and direct beach access. Perfect for families or groups looking for a relaxing getaway.",
  "location": "Miami Beach, Florida",
  "pricePerNight": 350,
  "guests": 6,
  "type": "HOUSE",
  "amenities": ["WiFi", "Pool", "Beach Access", "Parking", "Kitchen", "Air Conditioning", "TV", "Washer"],
  "rating": 4.8
}
```

### Expected Response (201 Created):
```json
{
  "id": 1,
  "title": "Luxury Beach House with Ocean View",
  "description": "Wake up to stunning ocean views...",
  "location": "Miami Beach, Florida",
  "pricePerNight": 350,
  "guests": 6,
  "type": "HOUSE",
  "amenities": ["WiFi", "Pool", "Beach Access", "Parking", "Kitchen", "Air Conditioning", "TV", "Washer"],
  "rating": 4.8,
  "hostId": 1,
  "createdAt": "2026-04-27T...",
  "updatedAt": "2026-04-27T..."
}
```

✅ **Success!** Your first listing is created!

---

## Step 2: Create Listing #2 - Downtown Studio

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/listings`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_HOST_TOKEN_HERE`

### Body (raw JSON):
```json
{
  "title": "Modern Downtown Studio - Walk to Everything",
  "description": "Cozy studio apartment in the heart of downtown Miami. Walking distance to restaurants, shops, and nightlife. Perfect for solo travelers or couples. Features a full kitchen and comfortable workspace.",
  "location": "Downtown Miami, Florida",
  "pricePerNight": 120,
  "guests": 2,
  "type": "STUDIO",
  "amenities": ["WiFi", "Kitchen", "Air Conditioning", "Workspace", "TV", "Coffee Maker"],
  "rating": 4.5
}
```

### Expected Response (201 Created):
```json
{
  "id": 2,
  "title": "Modern Downtown Studio - Walk to Everything",
  "description": "Cozy studio apartment in the heart of downtown Miami...",
  "location": "Downtown Miami, Florida",
  "pricePerNight": 120,
  "guests": 2,
  "type": "STUDIO",
  "amenities": ["WiFi", "Kitchen", "Air Conditioning", "Workspace", "TV", "Coffee Maker"],
  "rating": 4.5,
  "hostId": 1,
  "createdAt": "2026-04-27T...",
  "updatedAt": "2026-04-27T..."
}
```

---

## Step 3: Create Listing #3 - Family Villa

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/listings`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_HOST_TOKEN_HERE`

### Body (raw JSON):
```json
{
  "title": "Spacious Family Villa with Private Garden",
  "description": "Beautiful 4-bedroom villa perfect for large families or groups. Features include a private garden, BBQ area, game room, and fully equipped kitchen. Located in a quiet residential area, 15 minutes from the beach.",
  "location": "Coral Gables, Florida",
  "pricePerNight": 280,
  "guests": 8,
  "type": "VILLA",
  "amenities": ["WiFi", "Parking", "Kitchen", "Air Conditioning", "TV", "Washer", "BBQ Grill", "Garden", "Game Room"],
  "rating": 4.9
}
```

---

## Step 4: Create Listing #4 - Waterfront Condo

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/listings`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_HOST_TOKEN_HERE`

### Body (raw JSON):
```json
{
  "title": "Waterfront Condo with Marina Views",
  "description": "Elegant 2-bedroom condo overlooking the marina. Enjoy sunset views from your private balcony. Building amenities include gym, pool, and 24/7 security. Close to shopping and dining.",
  "location": "Brickell, Miami",
  "pricePerNight": 200,
  "guests": 4,
  "type": "CONDO",
  "amenities": ["WiFi", "Pool", "Gym", "Parking", "Kitchen", "Air Conditioning", "TV", "Balcony", "Security"],
  "rating": 4.7
}
```

---

## Step 5: Create Listing #5 - Cozy Apartment

### Request Details:
- **Method**: POST
- **URL**: `http://localhost:3000/listings`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_HOST_TOKEN_HERE`

### Body (raw JSON):
```json
{
  "title": "Cozy Apartment Near Airport",
  "description": "Convenient 1-bedroom apartment just 10 minutes from Miami International Airport. Perfect for business travelers or early morning flights. Quiet neighborhood with easy highway access.",
  "location": "Doral, Florida",
  "pricePerNight": 95,
  "guests": 3,
  "type": "APARTMENT",
  "amenities": ["WiFi", "Parking", "Kitchen", "Air Conditioning", "TV", "Workspace"],
  "rating": 4.3
}
```

---

## Step 6: Verify Your Listings

### Get All Listings (Public - No Auth Required)
- **Method**: GET
- **URL**: `http://localhost:3000/listings`
- **Headers**: None needed

### Expected Response (200 OK):
```json
[
  {
    "id": 1,
    "title": "Luxury Beach House with Ocean View",
    "location": "Miami Beach, Florida",
    "pricePerNight": 350,
    "host": {
      "name": "Sarah Johnson",
      "avatar": "https://i.pravatar.cc/150?img=5"
    }
  },
  {
    "id": 2,
    "title": "Modern Downtown Studio - Walk to Everything",
    "location": "Downtown Miami, Florida",
    "pricePerNight": 120,
    "host": {
      "name": "Sarah Johnson",
      "avatar": "https://i.pravatar.cc/150?img=5"
    }
  },
  // ... more listings
]
```

---

## Step 7: Get Your Profile (See Your Listings)

### Request Details:
- **Method**: GET
- **URL**: `http://localhost:3000/auth/me`
- **Headers**: 
  - `Authorization: Bearer YOUR_HOST_TOKEN_HERE`

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
  "listings": [
    {
      "id": 1,
      "title": "Luxury Beach House with Ocean View",
      "location": "Miami Beach, Florida",
      "pricePerNight": 350,
      "guests": 6,
      "type": "HOUSE",
      "rating": 4.8
    },
    {
      "id": 2,
      "title": "Modern Downtown Studio - Walk to Everything",
      "location": "Downtown Miami, Florida",
      "pricePerNight": 120,
      "guests": 2,
      "type": "STUDIO",
      "rating": 4.5
    }
    // ... all your listings
  ]
}
```

---

## Step 8: Get Single Listing Details

### Request Details:
- **Method**: GET
- **URL**: `http://localhost:3000/listings/1`
- **Headers**: None needed (public endpoint)

### Expected Response (200 OK):
```json
{
  "id": 1,
  "title": "Luxury Beach House with Ocean View",
  "description": "Wake up to stunning ocean views in this beautiful 3-bedroom beach house...",
  "location": "Miami Beach, Florida",
  "pricePerNight": 350,
  "guests": 6,
  "type": "HOUSE",
  "amenities": ["WiFi", "Pool", "Beach Access", "Parking", "Kitchen", "Air Conditioning", "TV", "Washer"],
  "rating": 4.8,
  "hostId": 1,
  "createdAt": "2026-04-27T...",
  "updatedAt": "2026-04-27T...",
  "host": {
    "id": 1,
    "name": "Sarah Johnson",
    "email": "sarah.host@airbnb.com",
    "username": "sarahhost",
    "phone": "1234567890",
    "role": "HOST",
    "avatar": "https://i.pravatar.cc/150?img=5",
    "bio": "Experienced host with 5 properties in Miami",
    "password": "...",
    "createdAt": "2026-04-27T...",
    "updatedAt": "2026-04-27T...",
    "resetToken": null,
    "resetTokenExpiry": null
  },
  "bookings": []
}
```

---

## Step 9: Filter Listings (Test Query Parameters)

### Filter by Location:
- **Method**: GET
- **URL**: `http://localhost:3000/listings?location=Miami`

### Filter by Type:
- **Method**: GET
- **URL**: `http://localhost:3000/listings?type=HOUSE`

### Filter by Max Price:
- **Method**: GET
- **URL**: `http://localhost:3000/listings?maxPrice=200`

### Combined Filters:
- **Method**: GET
- **URL**: `http://localhost:3000/listings?location=Miami&type=APARTMENT&maxPrice=150`

### With Sorting:
- **Method**: GET
- **URL**: `http://localhost:3000/listings?sortBy=pricePerNight&order=asc`

### With Pagination:
- **Method**: GET
- **URL**: `http://localhost:3000/listings?page=1&limit=3`

---

## Step 10: Update a Listing

### Request Details:
- **Method**: PUT
- **URL**: `http://localhost:3000/listings/1`
- **Headers**: 
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_HOST_TOKEN_HERE`

### Body (raw JSON) - Update price and rating:
```json
{
  "pricePerNight": 375,
  "rating": 4.9
}
```

### Expected Response (200 OK):
```json
{
  "id": 1,
  "title": "Luxury Beach House with Ocean View",
  "description": "Wake up to stunning ocean views...",
  "location": "Miami Beach, Florida",
  "pricePerNight": 375,
  "guests": 6,
  "type": "HOUSE",
  "amenities": ["WiFi", "Pool", "Beach Access", "Parking", "Kitchen", "Air Conditioning", "TV", "Washer"],
  "rating": 4.9,
  "hostId": 1,
  "createdAt": "2026-04-27T...",
  "updatedAt": "2026-04-27T..."
}
```

---

## Common Errors

### ❌ "Only hosts can perform this action" (403)
**Problem**: Using GUEST token or no token
**Solution**: Use HOST token in Authorization header

### ❌ "Missing required listing fields" (400)
**Problem**: Missing required fields
**Solution**: Ensure all required fields are present:
- title, description, location, pricePerNight, guests, type, amenities

### ❌ "Invalid listing type" (400)
**Problem**: Wrong type value
**Solution**: Use one of: APARTMENT, HOUSE, VILLA, CONDO, STUDIO

### ❌ "You can only edit your own listings" (403)
**Problem**: Trying to edit another host's listing
**Solution**: Only edit listings you created

---

## Quick Copy-Paste Listings

### Listing 1 - Beach House:
```json
{
  "title": "Luxury Beach House with Ocean View",
  "description": "Wake up to stunning ocean views in this beautiful 3-bedroom beach house. Features include a private pool, outdoor deck, and direct beach access. Perfect for families or groups looking for a relaxing getaway.",
  "location": "Miami Beach, Florida",
  "pricePerNight": 350,
  "guests": 6,
  "type": "HOUSE",
  "amenities": ["WiFi", "Pool", "Beach Access", "Parking", "Kitchen", "Air Conditioning", "TV", "Washer"],
  "rating": 4.8
}
```

### Listing 2 - Studio:
```json
{
  "title": "Modern Downtown Studio - Walk to Everything",
  "description": "Cozy studio apartment in the heart of downtown Miami. Walking distance to restaurants, shops, and nightlife. Perfect for solo travelers or couples.",
  "location": "Downtown Miami, Florida",
  "pricePerNight": 120,
  "guests": 2,
  "type": "STUDIO",
  "amenities": ["WiFi", "Kitchen", "Air Conditioning", "Workspace", "TV", "Coffee Maker"],
  "rating": 4.5
}
```

### Listing 3 - Villa:
```json
{
  "title": "Spacious Family Villa with Private Garden",
  "description": "Beautiful 4-bedroom villa perfect for large families or groups. Features include a private garden, BBQ area, game room, and fully equipped kitchen.",
  "location": "Coral Gables, Florida",
  "pricePerNight": 280,
  "guests": 8,
  "type": "VILLA",
  "amenities": ["WiFi", "Parking", "Kitchen", "Air Conditioning", "TV", "Washer", "BBQ Grill", "Garden", "Game Room"],
  "rating": 4.9
}
```

---

## ✅ Success Checklist

After completing these steps, you should have:
- [ ] Created 3-5 listings as Sarah (HOST)
- [ ] Verified listings appear in GET /listings
- [ ] Checked your profile shows all listings
- [ ] Tested filtering by location, type, and price
- [ ] Updated at least one listing
- [ ] Tested getting single listing details

---

## Next Steps

Now that Sarah has listings, you can:
1. **Make a booking** as Michael (GUEST)
2. **Test authorization** - try GUEST creating a listing (should fail)
3. **Test ownership** - create another HOST and try editing Sarah's listings (should fail)

Ready to make bookings? 🎉
