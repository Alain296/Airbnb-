# Mailtrap Setup - Step by Step (5 Minutes)

## What is Mailtrap?
Mailtrap is a "fake" email server for testing. When your API sends an email, Mailtrap catches it so you can see it in their dashboard. The email never actually goes to a real inbox. Perfect for testing!

---

## Step 1: Create Free Account

1. Open your browser and go to: **https://mailtrap.io/**
2. Click the **"Sign Up"** button (top right corner)
3. Choose one of these options:
   - Sign up with Google (fastest)
   - Sign up with GitHub
   - Sign up with Email

4. If using email, verify your email address

---

## Step 2: Access Your Inbox

After signing up, you'll be automatically logged in:

1. You should see **"Email Testing"** in the left sidebar
2. Click on **"Inboxes"**
3. You'll see **"My Inbox"** - click on it
4. This is where all your test emails will appear!

---

## Step 3: Get SMTP Credentials

On the inbox page, you'll see:

1. A section called **"SMTP Settings"** or **"Integrations"**
2. Look for **"Show Credentials"** or it might already be visible
3. You'll see something like this:

```
Host: sandbox.smtp.mailtrap.io
Port: 2525 (or 587)
Username: a1b2c3d4e5f6g7
Password: x1y2z3a4b5c6d7
```

**Copy these values!** You'll need them in the next step.

---

## Step 4: Update Your .env File

1. Open your project in VS Code
2. Open the file: `airbnb-api/.env`
3. Find these lines:

```env
EMAIL_USER=PASTE_YOUR_MAILTRAP_USERNAME_HERE
EMAIL_PASS=PASTE_YOUR_MAILTRAP_PASSWORD_HERE
```

4. Replace with your actual Mailtrap credentials:

```env
EMAIL_USER=a1b2c3d4e5f6g7
EMAIL_PASS=x1y2z3a4b5c6d7
```

**Example of complete email section:**
```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=a1b2c3d4e5f6g7
EMAIL_PASS=x1y2z3a4b5c6d7
EMAIL_FROM=Airbnb <noreply@airbnb.com>
API_URL=http://localhost:3000
```

5. **Save the file** (Ctrl+S or Cmd+S)

---

## Step 5: Restart Your Server

1. Go to your terminal where the server is running
2. Press **Ctrl + C** to stop the server
3. Run: `npm run dev`
4. You should see:
   ```
   Email server is ready to send messages
   Server is running on http://localhost:3000
   ```

If you see "Email server is ready" - you're all set! ✅

---

## Step 6: Test It!

### Test 1: Register a New User

In Postman:
```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "username": "testuser123",
  "phone": "1234567890",
  "password": "password123",
  "role": "GUEST"
}
```

**What should happen:**
1. API returns 201 Created
2. Go to Mailtrap inbox
3. You should see a new email: "Welcome to Airbnb!"
4. Click on it to see the full email with styling

---

## 🎉 Success!

If you see the welcome email in Mailtrap, everything is working!

Now you can test:
- ✅ Registration emails
- ✅ Booking confirmations
- ✅ Booking cancellations
- ✅ Password reset emails

All emails will appear in your Mailtrap inbox instantly!

---

## 🐛 Troubleshooting

### "Email configuration error: Invalid login"
- Double-check username and password in `.env`
- Make sure there are no extra spaces
- Try copying credentials again from Mailtrap

### "Email not sent - credentials not configured"
- Make sure you saved the `.env` file
- Restart the server after updating `.env`

### Server won't start
- Check for syntax errors in `.env`
- Make sure all values are on one line
- No quotes needed around values

### Email not appearing in Mailtrap
- Wait a few seconds and refresh
- Check server console for errors
- Verify EMAIL_HOST is `sandbox.smtp.mailtrap.io`

---

## 📝 Notes

- Mailtrap is free forever for testing
- You can have multiple inboxes
- Emails are automatically deleted after 30 days
- You can share inbox access with team members
- Perfect for development - never use in production!

---

## 🚀 Next: Test All Email Types

Once you see the welcome email working, test:
1. Booking confirmation (create a booking)
2. Booking cancellation (cancel a booking)
3. Password reset (request password reset)

All emails will appear in your Mailtrap inbox!
