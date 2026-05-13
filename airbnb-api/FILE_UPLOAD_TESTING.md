# File Upload Testing Guide

## 🚀 Quick Start

**Ready to test? Follow these steps in order:**

1. **Test Avatar Upload** (as GUEST - alain.test@example.com)
   - Login to get token
   - Upload an avatar image
   - Check Cloudinary dashboard

2. **Test Listing Photos** (as HOST - sarah.host@airbnb.com)
   - Login as Sarah to get HOST token
   - Find Sarah's listing ID
   - Upload 2-3 photos to the listing
   - Delete one photo
   - Check Cloudinary dashboard

3. **Test Security** (try to upload to Sarah's listing with GUEST token)
   - Should get 403 Forbidden error

---

## ✅ What's Ready

Your API now supports:
- User avatar uploads
- Listing photo uploads (up to 5 per listing)
- Image deletion from Cloudinary
- Automatic cleanup of old images

## 🔑 Test Users

- **GUEST:** alain.test@example.com (User ID: 8) - Password: password123
- **HOST:** sarah.host@airbnb.com - Password: SecurePass123

---

## 🧪 Test 1: Upload User Avatar (GUEST)

### Step 1: Get Your GUEST Token

Login as GUEST to get a token:
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "alain.test@example.com",
  "password": "password123"
}
```

Copy the token from the response. Your user ID is 8.

### Step 2: Upload Avatar

**In Postman:**
1. Create new request: **POST** `http://localhost:3000/users/8/avatar`
   (Replace `8` with your actual user ID)

2. **Headers:**
   - `Authorization: Bearer YOUR_TOKEN_HERE`

3. **Body:**
   - Select **"form-data"** (not raw!)
   - Add a field:
     - Key: `image` (must be exactly "image")
     - Type: Change from "Text" to **"File"**
     - Value: Click "Select Files" and choose an image (JPG, PNG, or WebP)

4. **Click Send**

### Expected Response (200 OK):
```json
{
  "id": 8,
  "name": "Alain Test",
  "email": "alain.test@example.com",
  "avatar": "https://res.cloudinary.com/dqvgjp2cx/image/upload/v1234567890/airbnb/avatars/abc123.jpg",
  "avatarPublicId": "airbnb/avatars/abc123",
  ...
}
```

✅ Check Cloudinary dashboard - you should see the image uploaded!

---

## 🧪 Test 2: Delete User Avatar

**In Postman:**
```
DELETE http://localhost:3000/users/8/avatar
Authorization: Bearer YOUR_TOKEN_HERE
```

### Expected Response (200 OK):
```json
{
  "message": "Avatar removed successfully",
  "user": {
    "id": 8,
    "avatar": null,
    "avatarPublicId": null,
    ...
  }
}
```

✅ Image should be deleted from Cloudinary!

---

## 🧪 Test 3: Upload Listing Photos (HOST)

### Step 1: Login as HOST

Login as Sarah (HOST) to get a HOST token:
```
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "sarah.host@airbnb.com",
  "password": "SecurePass123"
}
```

Copy the HOST token from the response.

### Step 2: Find Sarah's Listing IDs

Get all listings to find Sarah's listing IDs:
```
GET http://localhost:3000/listings
```

Look for listings where `hostId` matches Sarah's user ID (should be 6). Note down a listing ID.

### Step 3: Upload Photos

**In Postman:**
1. Create new request: **POST** `http://localhost:3000/listings/{LISTING_ID}/photos`
   (Replace `{LISTING_ID}` with Sarah's actual listing ID from Step 2)

2. **Headers:**
   - `Authorization: Bearer YOUR_HOST_TOKEN_HERE`

3. **Body:**
   - Select **"form-data"**
   - Add fields for multiple photos:
     - Key: `photos` (must be exactly "photos")
     - Type: Change to **"File"**
     - Value: Select an image file
   - Click "Add row" to add more photos (you can add up to 5)
   - For each row, use the same key name `photos` and select different images

4. **Click Send**

### Expected Response (200 OK):
```json
{
  "id": 9,
  "title": "Spacious Family Villa",
  "photos": [
    {
      "id": 1,
      "url": "https://res.cloudinary.com/dqvgjp2cx/image/upload/v1234567890/airbnb/listings/photo1.jpg",
      "publicId": "airbnb/listings/photo1",
      "listingId": 9
    },
    {
      "id": 2,
      "url": "https://res.cloudinary.com/dqvgjp2cx/image/upload/v1234567890/airbnb/listings/photo2.jpg",
      "publicId": "airbnb/listings/photo2",
      "listingId": 9
    }
  ],
  ...
}
```

✅ Check Cloudinary dashboard at https://cloudinary.com/console/media_library - all photos should be in the `airbnb/listings` folder!

---

## 🧪 Test 4: Delete Listing Photo (HOST)

**In Postman:**
```
DELETE http://localhost:3000/listings/{LISTING_ID}/photos/{PHOTO_ID}
Authorization: Bearer YOUR_HOST_TOKEN_HERE
```
(Replace `{LISTING_ID}` with the listing ID and `{PHOTO_ID}` with the photo ID from the previous response)

### Expected Response (200 OK):
```json
{
  "message": "Photo deleted successfully"
}
```

✅ Photo should be deleted from Cloudinary dashboard!

---

## 🧪 Test 5: Security Check (Should Fail)

Try to upload a photo to Sarah's listing using your GUEST token:

**In Postman:**
```
POST http://localhost:3000/listings/{SARAH_LISTING_ID}/photos
Authorization: Bearer YOUR_GUEST_TOKEN_HERE
Body: form-data with photos field
```

### Expected Response (403 Forbidden):
```json
{
  "message": "You can only upload photos to your own listings"
}
```

✅ This should fail - guests can't upload photos to host listings!

---

## 🐛 Common Errors

### "No file uploaded" (400)
**Problem:** Didn't select a file or wrong field name

**Solution:**
- Make sure Body type is "form-data" (not raw, not x-www-form-urlencoded)
- Field name must be exactly "image" for avatar or "photos" for listings
- Change field type from "Text" to "File" using the dropdown
- Select an actual image file

**Postman Setup:**
1. Click "Body" tab
2. Select "form-data" radio button
3. In the key field, type: `image` (for avatar) or `photos` (for listings)
4. Hover over the key field - you'll see a dropdown appear on the right
5. Click the dropdown and change from "Text" to "File"
6. Now the value field shows "Select Files" button
7. Click "Select Files" and choose your image

### "Only JPEG, PNG, and WebP images are allowed" (400)
**Problem:** Wrong file type

**Solution:**
- Use only .jpg, .jpeg, .png, or .webp files
- Don't use .gif, .bmp, .svg, or other formats

### "File too large" (400)
**Problem:** Image is bigger than 5MB

**Solution:**
- Compress the image
- Use a smaller image
- Max size is 5MB per file

### "You can only update your own avatar" (403)
**Problem:** Trying to upload avatar for another user

**Solution:**
- Make sure the user ID in the URL matches your logged-in user ID
- Use your own token

### "Maximum of 5 photos allowed per listing" (400)
**Problem:** Listing already has 5 photos

**Solution:**
- Delete some photos first
- Each listing can have max 5 photos

### "Photo does not belong to this listing" (403)
**Problem:** Trying to delete a photo from wrong listing

**Solution:**
- Make sure photo ID belongs to the listing ID in the URL

---

## 📊 What to Check

After uploading:

1. **In Postman Response:**
   - ✅ Status 200 or 201
   - ✅ URL starts with `https://res.cloudinary.com/`
   - ✅ `publicId` is present

2. **In Cloudinary Dashboard:**
   - ✅ Go to https://cloudinary.com/console/media_library
   - ✅ See your uploaded images
   - ✅ Check folders: `airbnb/avatars` and `airbnb/listings`

3. **In Database:**
   - ✅ User has `avatar` and `avatarPublicId` fields populated
   - ✅ ListingPhoto records created with URLs

---

## 🎯 Success Criteria

You've successfully completed file uploads when:

1. ✅ Avatar upload works
2. ✅ Avatar delete works
3. ✅ Listing photos upload works (multiple files)
4. ✅ Listing photo delete works
5. ✅ Images appear in Cloudinary dashboard
6. ✅ Old images are deleted when uploading new ones
7. ✅ Max 5 photos per listing enforced
8. ✅ Only image files accepted
9. ✅ File size limit enforced (5MB)
10. ✅ Ownership checks work (can't upload to others' resources)

---

## 🚀 Next Steps

Once file uploads are working:
1. Test all scenarios above
2. Verify images in Cloudinary
3. Try uploading different file types (should reject non-images)
4. Try uploading large files (should reject >5MB)
5. Celebrate! 🎉

You've completed the entire Lesson 4 assignment!

---

## 💡 Tips

- Use small test images (100-500KB) for faster uploads
- You can use free stock photos from https://unsplash.com/
- Cloudinary automatically optimizes images
- URLs are permanent - save them in your database
- Always store `publicId` - you need it to delete images

Happy uploading! 📸
