const BRAND_COLOR = "#FF5A5F";

const emailWrapper = (content: string): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Airbnb</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f7f7f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f7f7f7; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: ${BRAND_COLOR}; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px;">Airbnb</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f7f7f7; padding: 20px 30px; text-align: center; font-size: 12px; color: #999;">
              <p style="margin: 0 0 10px 0;">© 2026 Airbnb, Inc. All rights reserved.</p>
              <p style="margin: 0;">This is an automated message, please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const button = (text: string, url: string): string => `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
    <tr>
      <td align="center">
        <a href="${url}" style="display: inline-block; padding: 14px 40px; background-color: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
          ${text}
        </a>
      </td>
    </tr>
  </table>
`;

export const welcomeEmail = (name: string, role: string): string => {
  const isHost = role === "HOST";
  
  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0;">Welcome to Airbnb, ${name}! 🎉</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We're thrilled to have you join our community of ${isHost ? "hosts" : "travelers"}!
    </p>
    ${isHost ? `
      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        As a host, you can now share your space with guests from around the world. 
        Start by creating your first listing and watch the bookings roll in!
      </p>
      ${button("Create Your First Listing", "http://localhost:3000/listings")}
    ` : `
      <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Get ready to discover amazing places to stay around the world. 
        Browse our listings and book your next adventure today!
      </p>
      ${button("Explore Listings", "http://localhost:3000/listings")}
    `}
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
      If you have any questions, our support team is here to help.
    </p>
  `;
  
  return emailWrapper(content);
};

export const bookingConfirmationEmail = (
  guestName: string,
  listingTitle: string,
  location: string,
  checkIn: string,
  checkOut: string,
  totalPrice: number
): string => {
  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0;">Booking Confirmed! ✅</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Hi ${guestName}, your booking has been confirmed!
    </p>
    
    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 0 0 30px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">${listingTitle}</h3>
      <p style="color: #666; margin: 0 0 10px 0;">
        <strong>Location:</strong> ${location}
      </p>
      <p style="color: #666; margin: 0 0 10px 0;">
        <strong>Check-in:</strong> ${checkIn}
      </p>
      <p style="color: #666; margin: 0 0 10px 0;">
        <strong>Check-out:</strong> ${checkOut}
      </p>
      <p style="color: #666; margin: 0;">
        <strong>Total Price:</strong> $${totalPrice.toFixed(2)}
      </p>
    </div>
    
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
      <strong>Cancellation Policy:</strong> You can cancel your booking up to 24 hours before check-in for a full refund.
    </p>
    
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
      We hope you have a wonderful stay!
    </p>
  `;
  
  return emailWrapper(content);
};

export const bookingCancellationEmail = (
  guestName: string,
  listingTitle: string,
  checkIn: string,
  checkOut: string
): string => {
  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0;">Booking Cancelled</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      Hi ${guestName}, your booking has been cancelled.
    </p>
    
    <div style="background-color: #f7f7f7; padding: 20px; border-radius: 8px; margin: 0 0 30px 0;">
      <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">${listingTitle}</h3>
      <p style="color: #666; margin: 0 0 10px 0;">
        <strong>Check-in:</strong> ${checkIn}
      </p>
      <p style="color: #666; margin: 0;">
        <strong>Check-out:</strong> ${checkOut}
      </p>
    </div>
    
    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      We're sorry to see you cancel. If you change your mind, there are plenty of other amazing places waiting for you!
    </p>
    
    ${button("Browse Listings", "http://localhost:3000/listings")}
  `;
  
  return emailWrapper(content);
};

export const passwordResetEmail = (name: string, resetLink: string): string => {
  const content = `
    <h2 style="color: #333; margin: 0 0 20px 0;">Password Reset Request</h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
      Hi ${name},
    </p>
    <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
      We received a request to reset your password. Click the button below to create a new password:
    </p>
    
    ${button("Reset Password", resetLink)}
    
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 10px 0;">
      <strong>⚠️ This link will expire in 1 hour.</strong>
    </p>
    
    <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
      If you did not request a password reset, please ignore this email. Your password will remain unchanged.
    </p>
  `;
  
  return emailWrapper(content);
};
