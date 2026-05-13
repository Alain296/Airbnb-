# Cloudinary Setup Guide (5 Minutes)

## What is Cloudinary?
Cloudinary is a cloud service for storing and managing images. Instead of saving images on your server, you upload them to Cloudinary and get back a URL. Perfect for profile pictures and listing photos!

---

## Step 1: Create Free Account

1. Go to: **https://cloudinary.com/**
2. Click **"Sign Up Free"** (top right)
3. Choose one:
   - Sign up with Google (fastest)
   - Sign up with GitHub
   - Sign up with Email

4. Fill in the form:
   - Email
   - Password
   - Choose "Developer" as your role
   - Click "Create Account"

5. Verify your email if needed

---

## Step 2: Get Your Credentials

After signing up, you'll be taken to the **Dashboard**.

On the dashboard, you'll see a section called **"Account Details"** or **"Product Environment Credentials"**:

You'll see three important values:
- **Cloud Name:** (something like `dxyz123abc`)
- **API Key:** (a long number like `123456789012345`)
- **API Secret:** (a string like `AbCdEfGhIjKlMnOpQrStUvWxYz`)

**Copy these three values!** You'll need them in the next step.

---

## Step 3: Update Your .env File

1. Open your project in VS Code
2. Open the file: `airbnb-api/.env`
3. Add these lines at the bottom:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

4. Replace with your actual values:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz
```

5. **Save the file** (Ctrl+S)

---

## Step 4: Verify Setup

After updating `.env`, restart your server:
```bash
npm run dev
```

You should see:
```
Connected to PostgreSQL with Prisma
Server is running on http://localhost:3000
Email server is ready to send messages
```

No errors = Cloudinary is configured! ✅

---

## 🎯 What You'll Be Able to Do

Once Cloudinary is set up, users can:
- ✅ Upload profile pictures (avatars)
- ✅ Upload listing photos (up to 5 per listing)
- ✅ Delete old images automatically
- ✅ Images are stored in the cloud (not on your server)
- ✅ Fast image delivery via CDN

---

## 📊 Cloudinary Free Tier

The free plan includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth per month
- ✅ Unlimited transformations
- ✅ Perfect for development and small projects

---

## 🐛 Troubleshooting

### Can't find credentials
- Look for "Dashboard" after logging in
- Check "Product Environment Credentials" section
- Or go to: Settings → Account → Security

### Invalid credentials error
- Double-check Cloud Name (no spaces)
- Verify API Key is all numbers
- Make sure API Secret is copied correctly
- No quotes needed in `.env` file

---

## 🚀 Next Steps

Once you have your credentials:
1. Update `.env` file
2. We'll create the Cloudinary configuration
3. Set up Multer for file uploads
4. Add avatar upload endpoint
5. Add listing photos upload endpoint

Ready to get your Cloudinary credentials? Let's do it! 🎉
