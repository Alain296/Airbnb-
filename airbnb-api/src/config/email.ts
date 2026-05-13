import nodemailer from "nodemailer";

const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || "Airbnb <noreply@airbnb.com>";

// Create transporter once at module load
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, // Use TLS
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Verify connection on startup (optional but helpful for debugging)
if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error("Email configuration error:", error.message);
    } else {
      console.log("Email server is ready to send messages");
    }
  });
} else {
  console.warn("Email credentials not configured. Emails will not be sent.");
}

/**
 * Send an email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - HTML content of the email
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("Email not sent - credentials not configured");
    return;
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
};
