# Gmail Setup for Real Email Sending

## ✅ What We're Doing

Switching from Mailtrap (testing) to Gmail (real email sending) so your API can send actual emails to real email addresses.

## 🔑 Gmail Account Details

- **Email:** mugaboalain56@gmail.com
- **Password:** Chemistry77+
- **Purpose:** Sending emails from your Airbnb API

## 📧 Gmail SMTP Configuration

Your `.env` file is now configured with:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mugaboalain58@gmail.com
EMAIL_PASS=kgxoppdhnsluedco
EMAIL_FROM=Airbnb <mugaboalain58@gmail.com>
```

## 🔐 Required: Generate App Password

**IMPORTANT:** You MUST generate an App Password to use Gmail SMTP. Regular password won't work.

### Steps to Generate App Password:

1. **Go to Google Account:** https://myaccount.google.com/
2. **Click "Security"** in left sidebar
3. **Enable 2-Step Verification** (if not already enabled):
   - Click "2-Step Verification"
   - Follow setup process with your phone number
4. **Generate App Password:**
   - Go back to Security → 2-Step Verification
   - Scroll down and click "App passwords"
   - Select "Mail" as the app
   - Select "Other (custom name)" as device
   - Enter name: "Airbnb API"
   - Click "Generate"
   - **Copy the 16-character password** (format: `abcd efgh ijkl mnop`)

5. **Update .env file:**
   - Replace `YOUR_16_CHAR_APP_PASSWORD_HERE` with the generated password
   - Remove spaces from the password (use: `abcdefghijklmnop`)

### Example:
```env
EMAIL_PASS=abcdefghijklmnop
```

## 🧪 Test Email Sending

After updating the App Password:

1. **Restart your server:**
   ```bash
   npm run dev
   ```

2. **Test registration email:**
   ```bash
   POST http://localhost:3000/auth/register
   Content-Type: application/json

   {
     "name": "Test User",
     "email": "your-test-email@gmail.com",
     "username": "testuser",
     "phone": "+1234567890",
     "password": "password123",
     "role": "GUEST"
   }
   ```

3. **Check your inbox** - you should receive a welcome email!

## 📨 Email Types Your API Will Send

1. **Welcome Email** - When users register
2. **Password Reset** - When users request password reset
3. **Booking Confirmation** - When bookings are created
4. **Booking Cancellation** - When bookings are cancelled

All emails will be sent from: **Airbnb <mugaboalain56@gmail.com>**

## 🔒 Security Notes

- ✅ App Password is more secure than regular password
- ✅ App Password only works for this specific application
- ✅ You can revoke App Password anytime from Google Account
- ✅ 2-Step Verification protects your main account

## 🐛 Troubleshooting

### "Invalid login" Error
- Make sure you're using App Password, not regular password
- Remove spaces from App Password
- Verify 2-Step Verification is enabled

### "Less secure app access" Error
- This shouldn't happen with App Password
- If it does, use App Password instead

### Emails not sending
- Check server logs for error messages
- Verify EMAIL_PASS in .env is correct
- Make sure no spaces in App Password

## ✅ Success Criteria

Gmail setup is working when:
- ✅ Server starts without email errors
- ✅ Registration sends welcome email to real inbox
- ✅ Password reset sends email to real inbox
- ✅ Booking emails work with real addresses

Ready to generate your App Password and test real email sending! 📧