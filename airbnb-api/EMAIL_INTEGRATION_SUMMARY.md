# Email Integration Summary

## ✅ What We've Built So Far

### 1. Email Configuration (`src/config/email.ts`)
- Nodemailer transporter configured for Gmail SMTP
- `sendEmail()` function to send emails
- Automatic verification on startup
- Graceful handling when credentials not configured

### 2. Email Templates (`src/templates/emails.ts`)
- **welcomeEmail()** - Welcome message with role-specific content
- **bookingConfirmationEmail()** - Booking details and cancellation policy
- **bookingCancellationEmail()** - Cancellation confirmation
- **passwordResetEmail()** - Secure reset link with expiry warning
- All templates use Airbnb brand color (#FF5A5F)
- Responsive HTML design

### 3. Environment Variables (`.env`)
- EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
- API_URL for building reset links

## 📋 Next Steps: Integrate into Controllers

### Part 3: Welcome Email on Registration
**File**: `src/controllers/auth.controller.ts`
**Function**: `register`
**What to add**:
```typescript
// After user is created successfully
try {
  await sendEmail(
    user.email,
    "Welcome to Airbnb!",
    welcomeEmail(user.name, user.role)
  );
} catch (error) {
  console.error("Failed to send welcome email:", error);
  // Don't fail the registration if email fails
}
```

### Part 4: Booking Emails
**File**: `src/controllers/bookings.controller.ts`

**Function**: `createBooking`
**What to add**:
```typescript
// After booking is created
try {
  const guest = await prisma.user.findUnique({ where: { id: req.userId } });
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  
  await sendEmail(
    guest.email,
    "Booking Confirmed!",
    bookingConfirmationEmail(
      guest.name,
      listing.title,
      listing.location,
      checkInDate.toLocaleDateString(),
      checkOutDate.toLocaleDateString(),
      totalPrice
    )
  );
} catch (error) {
  console.error("Failed to send booking confirmation email:", error);
}
```

**Function**: `deleteBooking` (cancel)
**What to add**:
```typescript
// After status updated to CANCELLED
try {
  const guest = await prisma.user.findUnique({ where: { id: existingBooking.guestId } });
  const listing = await prisma.listing.findUnique({ where: { id: existingBooking.listingId } });
  
  await sendEmail(
    guest.email,
    "Booking Cancelled",
    bookingCancellationEmail(
      guest.name,
      listing.title,
      existingBooking.checkIn.toLocaleDateString(),
      existingBooking.checkOut.toLocaleDateString()
    )
  );
} catch (error) {
  console.error("Failed to send cancellation email:", error);
}
```

### Part 5: Password Reset Email
**File**: `src/controllers/auth.controller.ts`
**Function**: `forgotPassword`
**What to add**:
```typescript
// After saving reset token
try {
  const resetLink = `${process.env.API_URL || "http://localhost:3000"}/auth/reset-password/${rawToken}`;
  
  await sendEmail(
    user.email,
    "Password Reset Request",
    passwordResetEmail(user.name, resetLink)
  );
} catch (error) {
  console.error("Failed to send password reset email:", error);
}
```

## 🔑 Key Principles

1. **Always use try/catch** - Email failures should never crash the API
2. **Send response first** - Don't make users wait for email to send
3. **Log errors** - But don't expose them to users
4. **Graceful degradation** - API works even if email is not configured

## 🧪 Testing

### Test Welcome Email:
1. Register a new user (POST /auth/register)
2. Check your email inbox
3. Verify role-specific message (HOST vs GUEST)

### Test Booking Emails:
1. Create a booking (POST /bookings)
2. Check email for confirmation
3. Cancel the booking (DELETE /bookings/:id)
4. Check email for cancellation

### Test Password Reset:
1. Request reset (POST /auth/forgot-password)
2. Check email for reset link
3. Click link (or copy token)
4. Reset password (POST /auth/reset-password/:token)

## 📊 Email Flow Diagram

```
User Action → API Response → Background Email
     ↓              ↓                ↓
  Register    → 201 Created  → Welcome Email
  Book        → 201 Created  → Confirmation Email
  Cancel      → 200 OK       → Cancellation Email
  Forgot Pwd  → 200 OK       → Reset Link Email
```

## 🚀 Ready to Integrate!

Now we'll add the email calls to your existing controllers. The code is already working - we just need to add the email notifications!

Should we start integrating into the controllers now?
