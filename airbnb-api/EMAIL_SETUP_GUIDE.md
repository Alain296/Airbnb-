# Email Setup Guide - Gmail App Password

## Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Scroll down to "How you sign in to Google"
4. Click on **2-Step Verification**
5. Follow the prompts to enable it (you'll need your phone)

## Step 2: Generate App Password

1. After enabling 2-Step Verification, go back to **Security**
2. Scroll down and click on **App passwords** (or search for "App passwords")
3. You might need to sign in again
4. In the "Select app" dropdown, choose **Mail**
5. In the "Select device" dropdown, choose **Other (Custom name)**
6. Type: "Airbnb API"
7. Click **Generate**
8. Google will show you a 16-character password (like: `abcd efgh ijkl mnop`)
9. **Copy this password** - you won't see it again!

## Step 3: Update Your .env File

Open `airbnb-api/.env` and update these lines:

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=Airbnb <your-actual-email@gmail.com>
```

**Important:**
- Remove spaces from the app password (use `abcdefghijklmnop`, not `abcd efgh ijkl mnop`)
- Use your real Gmail address
- Don't use your regular Gmail password - use the app password!

## Step 4: Test It

After updating `.env`, restart your server:
```bash
npm run dev
```

You should see: `Email server is ready to send messages`

If you see an error, double-check:
- 2-Step Verification is enabled
- App password is correct (no spaces)
- Email address is correct

## Alternative: Use Mailtrap for Testing

If you don't want to use your real Gmail, use Mailtrap (fake SMTP for testing):

1. Sign up at https://mailtrap.io/ (free)
2. Go to Email Testing → Inboxes → My Inbox
3. Copy the SMTP credentials
4. Update `.env`:

```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASS=your-mailtrap-password
EMAIL_FROM=Airbnb <noreply@airbnb.com>
```

Mailtrap catches all emails so they don't actually send - perfect for testing!

## Troubleshooting

### "Invalid login" error
- Make sure 2-Step Verification is enabled
- Generate a new app password
- Remove any spaces from the password

### "Connection timeout" error
- Check your internet connection
- Try port 465 with `secure: true` instead of 587

### Emails not sending
- Check server console for errors
- Verify EMAIL_USER and EMAIL_PASS are set
- Try sending a test email manually

## Security Notes

- Never commit your `.env` file to Git
- App passwords are safer than your real password
- You can revoke app passwords anytime from Google Account settings
- Each app should have its own app password

## Next Steps

Once email is configured, the API will automatically send:
- Welcome emails on registration
- Booking confirmations
- Cancellation notifications  
- Password reset links

All emails are sent asynchronously - they won't slow down API responses!
