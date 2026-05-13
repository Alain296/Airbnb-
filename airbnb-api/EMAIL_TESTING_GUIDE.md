# Email Testing Guide

## ✅ Email Integration Complete!

All email notifications are now integrated into your API:
- Welcome emails on registration
- Booking confirmation emails
- Booking cancellation emails
- Password reset emails

## 🔧 Setup Before Testing

### Option 1: Use Gmail (Real Emails)

1. Follow `EMAIL_SETUP_GUIDE.md` to get your Gmail app password
2. Update `.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM=Airbnb <your-email@gmail.com>
```

### Option 2: Use Mailtrap (Testing Only - Recommended)

1. Sign up at https://mailtrap.io/ (free)
2. Go to Email Testing → Inboxes → My Inbox
3. Copy SMTP credentials
4. Update `.env`:
```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=Airbnb <noreply@airbnb.com>
```

**Why Mailtrap?**
- Catches all emails (they don't actually send)
- Perfect for testing
- No risk of spamming real inboxes
- See all emails in one place

## 🧪 Test Each Email Type

### 1. Test Welcome Email (Registration)

**In Postman:**
```
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "username": "testuser",
  "phone": "1234567890",
  "password": "password123",
  "role": "GUEST"
}
```

**Expected:**
- API returns 201 Created
- Check your email inbox (or Mailtrap)
- Should see welcome email with GUEST-specific message

**Test HOST version:**
- Register another user with `"role": "HOST"`
- Email should have HOST-specific message about creating listings

---

### 2. Test Booking Confirmation Email

**In Postman:**
```
POST http://localhost:3000/bookings
Authorization: Bearer YOUR_GUEST_TOKEN
Content-Type: application/json

{
  "listingId": 9,
  "checkIn": "2026-07-01T14:00:00.000Z",
  "checkOut": "2026-07-05T10:00:00.000Z"
}
```

**Expected:**
- API returns 201 Created
- Check email inbox
- Should see booking confirmation with:
  - Listing title and location
  - Check-in and check-out dates (formatted nicely)
  - Total price
  - Cancellation policy

---

### 3. Test Booking Cancellation Email

**In Postman:**
```
DELETE http://localhost:3000/bookings/1
Authorization: Bearer YOUR_GUEST_TOKEN
```

**Expected:**
- API returns 200 OK
- Check email inbox
- Should see cancellation email with:
  - Listing title
  - Original check-in and check-out dates
  - Encouragement to book again

---

### 4. Test Password Reset Email

**Step 1: Request Reset**
```
POST http://localhost:3000/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Expected:**
- API returns 200 OK (always, even if email doesn't exist)
- Check email inbox
- Should see password reset email with:
  - Reset button/link
  - Warning that link expires in 1 hour
  - Note about ignoring if not requested

**Step 2: Use Reset Link**
- Copy the token from the email link
- Or check server console for the token
- Use it to reset password:

```
POST http://localhost:3000/auth/reset-password/TOKEN_HERE
Content-Type: application/json

{
  "password": "newpassword123"
}
```

---

## 📊 What to Check in Emails

### Visual Check:
- ✅ Airbnb logo/header in brand color (#FF5A5F)
- ✅ Proper formatting (not broken HTML)
- ✅ Buttons are clickable and styled
- ✅ Footer with copyright notice
- ✅ Responsive design (check on mobile if using real email)

### Content Check:
- ✅ Personalized with user's name
- ✅ All dynamic data is correct (dates, prices, listing names)
- ✅ Dates are formatted nicely (not ISO strings)
- ✅ Links work (for password reset)
- ✅ No typos or grammar errors

### Technical Check:
- ✅ Email arrives within seconds
- ✅ Not marked as spam
- ✅ Sender shows as "Airbnb <your-email>"
- ✅ Subject line is clear

---

## 🐛 Troubleshooting

### "Email not sent - credentials not configured"
- Check `.env` file has EMAIL_USER and EMAIL_PASS
- Restart server after updating `.env`

### "Email configuration error: Invalid login"
- Gmail: Make sure you're using app password, not regular password
- Gmail: Verify 2-Step Verification is enabled
- Mailtrap: Double-check username and password

### Email arrives but looks broken
- Check HTML in email templates
- Some email clients strip certain CSS
- Test in multiple email clients

### Email not arriving (Gmail)
- Check spam folder
- Check "All Mail" folder
- Wait a few minutes (sometimes delayed)

### API returns 500 error
- Check server console for detailed error
- Email errors should NOT cause 500 - they should be caught
- If you see 500, there's a bug in the integration

---

## 🎯 Success Criteria

You've successfully completed email integration when:

1. ✅ Welcome email arrives on registration
2. ✅ Booking confirmation arrives when booking created
3. ✅ Cancellation email arrives when booking cancelled
4. ✅ Password reset email arrives with working link
5. ✅ All emails look professional and branded
6. ✅ API never crashes if email fails
7. ✅ Server console shows "Email server is ready" on startup

---

## 📝 Notes

- Emails are sent asynchronously (don't block API response)
- Failed emails are logged but don't crash the server
- In production, use a proper email service (SendGrid, AWS SES, etc.)
- Consider adding email templates for:
  - Booking reminders (24 hours before check-in)
  - Review requests (after check-out)
  - Host notifications (when booking received)

---

## 🚀 Next Steps

Once emails are working:
1. Test all 4 email types
2. Verify emails look good
3. Move on to Part 6: File Uploads (Cloudinary & Multer)

Great job! Email notifications are a key feature of any modern API. 🎉
