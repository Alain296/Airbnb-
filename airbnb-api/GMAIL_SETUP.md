# Gmail Setup - Step by Step (10 Minutes)

## ⚠️ Important Notes

- You'll use: **mugaboalain58@gmail.com** (or mugaboalain56@gmail.com)
- Emails will actually send to real inboxes
- You need to enable 2-Step Verification
- You'll create an "App Password" (not your regular password)

---

## Step 1: Enable 2-Step Verification

1. Go to: **https://myaccount.google.com/**
2. Sign in with **mugaboalain58@gmail.com**
3. Click **"Security"** in the left sidebar
4. Scroll down to **"How you sign in to Google"**
5. Click on **"2-Step Verification"**
6. Click **"Get Started"**
7. Follow the prompts:
   - Enter your password
   - Add your phone number
   - Verify with SMS code
   - Click **"Turn On"**

✅ 2-Step Verification is now enabled!

---

## Step 2: Create App Password

1. Still in **Security** settings
2. Scroll down and click **"App passwords"**
   - If you don't see it, search for "App passwords" in the search bar
   - You might need to sign in again

3. You'll see a page: "App passwords"
4. Click the dropdown **"Select app"** → Choose **"Mail"**
5. Click the dropdown **"Select device"** → Choose **"Other (Custom name)"**
6. Type: **"Airbnb API"**
7. Click **"Generate"**

8. Google will show you a 16-character password like:
   ```
   abcd efgh ijkl mnop
   ```

9. **COPY THIS PASSWORD!** You won't see it again!
   - Remove the spaces: `abcdefghijklmnop`

---

## Step 3: Update Your .env File

1. Open your project in VS Code
2. Open the file: `airbnb-api/.env`
3. Update the email section:

```env
# Email Configuration (Using Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=mugaboalain58@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=Airbnb <mugaboalain58@gmail.com>
API_URL=http://localhost:3000
```

**Replace:**
- `EMAIL_USER` with your Gmail address
- `EMAIL_PASS` with the 16-character app password (no spaces!)
- `EMAIL_FROM` with your Gmail address

4. **Save the file** (Ctrl+S)

---

## Step 4: Restart Your Server

1. Go to your terminal
2. Press **Ctrl + C** to stop the server
3. Run: `npm run dev`
4. You should see:
   ```
   Email server is ready to send messages
   Server is running on http://localhost:3000
   ```

✅ If you see "Email server is ready" - you're all set!

---

## Step 5: Test It!

### Test 1: Send Welcome Email to Yourself

In Postman:
```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Alain Mugabo",
  "email": "mugaboalain56@gmail.com",
  "username": "alaintest",
  "phone": "1234567890",
  "password": "password123",
  "role": "GUEST"
}
```

**What should happen:**
1. API returns 201 Created
2. Check **mugaboalain56@gmail.com** inbox
3. You should see email: "Welcome to Airbnb!"
4. If not in inbox, check **Spam** folder

---

## 🎉 Success!

If you received the email, everything is working!

Now you can test:
- ✅ Registration emails
- ✅ Booking confirmations
- ✅ Booking cancellations
- ✅ Password reset emails

---

## 🐛 Troubleshooting

### "Invalid login: 535-5.7.8 Username and Password not accepted"
**Problem:** Wrong app password or using regular password

**Solution:**
1. Make sure you're using the **app password**, not your regular Gmail password
2. Remove all spaces from the app password
3. Generate a new app password if needed

### "Email configuration error: Connection timeout"
**Problem:** Port or host might be wrong

**Solution:**
1. Try changing `EMAIL_PORT` to `465`
2. Add `EMAIL_SECURE=true` to `.env`
3. Restart server

### Email goes to Spam
**Problem:** Gmail thinks it's spam

**Solution:**
1. Mark as "Not Spam" in Gmail
2. Add sender to contacts
3. This is normal for development - in production, use proper email service

### "2-Step Verification required"
**Problem:** 2-Step Verification not enabled

**Solution:**
1. Go back to Step 1
2. Enable 2-Step Verification first
3. Then create app password

---

## 📊 Gmail Sending Limits

Gmail has daily sending limits:
- **Free Gmail:** ~500 emails per day
- **Google Workspace:** ~2000 emails per day

For testing, this is plenty! But for production, use:
- SendGrid
- AWS SES
- Mailgun
- Postmark

---

## 🔒 Security Notes

- ✅ App passwords are safer than your real password
- ✅ You can revoke app passwords anytime
- ✅ Each app should have its own app password
- ✅ Never commit `.env` to Git (it's in `.gitignore`)

---

## 🚀 Next Steps

Once emails are working:
1. Test all 4 email types
2. Check email formatting
3. Verify links work (password reset)
4. Move on to file uploads!

---

## 💡 Tip: Use Both!

You can use:
- **Mailtrap** for development (unlimited testing)
- **Gmail** for final testing (see real inbox experience)

Just swap the credentials in `.env` and restart!
