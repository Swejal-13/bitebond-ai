/**
 * Email Service
 * Sends transactional emails: verification, password reset, welcome
 * Uses Nodemailer — configure with Gmail App Password or SendGrid SMTP
 */

const nodemailer = require('nodemailer');

// ─── Transporter ─────────────────────────────────────────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// ─── Base HTML wrapper ────────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BiteBond AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
           background: #f9fafb; color: #111827; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #fff;
               border-radius: 20px; overflow: hidden;
               box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #f43f5e, #f97316);
              padding: 36px 40px; text-align: center; }
    .header-logo { font-size: 28px; font-weight: 800; color: #fff;
                   letter-spacing: -0.5px; }
    .header-tagline { color: rgba(255,255,255,0.85); font-size: 13px; margin-top: 4px; }
    .body { padding: 40px; }
    .greeting { font-size: 22px; font-weight: 700; color: #111827; margin-bottom: 12px; }
    .text { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #f43f5e, #f97316);
           color: #fff; text-decoration: none; font-weight: 700; font-size: 15px;
           padding: 14px 36px; border-radius: 12px; margin: 20px 0; }
    .otp { font-size: 40px; font-weight: 900; letter-spacing: 12px;
           color: #f43f5e; text-align: center; padding: 24px 0; }
    .divider { border: none; border-top: 1px solid #f3f4f6; margin: 24px 0; }
    .note { font-size: 13px; color: #9ca3af; line-height: 1.6; }
    .footer { background: #f9fafb; padding: 24px 40px; text-align: center;
              font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="header-logo">❤️ BiteBond AI</div>
      <div class="header-tagline">Connecting hearts through food</div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © 2025 BiteBond AI · All rights reserved<br/>
      You're receiving this because you signed up at BiteBond AI.
    </div>
  </div>
</body>
</html>
`;

// ─── Send helper ─────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'BiteBond AI <noreply@bitebond.app>',
    to,
    subject,
    html,
  });
  console.log(`✉️  Email sent to ${to}: ${info.messageId}`);
  return info;
};

// ─── Templates ────────────────────────────────────────────────────────────────

/**
 * Send OTP for email verification
 */
const sendVerificationEmail = async (user, otp) => {
  const html = baseTemplate(`
    <div class="greeting">Verify your email 📬</div>
    <p class="text">Hey ${user.name}! Welcome to BiteBond AI. Use the code below to verify your email address.</p>
    <div class="otp">${otp}</div>
    <p class="text" style="text-align:center; font-size:13px; color:#9ca3af;">
      This code expires in <strong>10 minutes</strong>.
    </p>
    <hr class="divider"/>
    <p class="note">If you didn't create a BiteBond account, you can safely ignore this email.</p>
  `);
  await sendEmail({ to: user.email, subject: `${otp} is your BiteBond verification code`, html });
};

/**
 * Send OTP for password reset
 */
const sendPasswordResetEmail = async (user, otp) => {
  const html = baseTemplate(`
    <div class="greeting">Reset your password 🔐</div>
    <p class="text">Hey ${user.name}! We received a request to reset your BiteBond password. Use the code below:</p>
    <div class="otp">${otp}</div>
    <p class="text" style="text-align:center; font-size:13px; color:#9ca3af;">
      This code expires in <strong>10 minutes</strong>.
    </p>
    <hr class="divider"/>
    <p class="note">
      If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
    </p>
  `);
  await sendEmail({ to: user.email, subject: 'Reset your BiteBond password', html });
};

/**
 * Welcome email after verification
 */
const sendWelcomeEmail = async (user) => {
  const html = baseTemplate(`
    <div class="greeting">Welcome to BiteBond! ❤️</div>
    <p class="text">
      Hey ${user.name}, your email is verified and your account is all set!
      You can now order food, send surprise gifts, and celebrate every moment with the people you love.
    </p>
    <div style="text-align:center;">
      <a class="btn" href="${process.env.CLIENT_URL || 'http://localhost:3000'}">
        Start Exploring 🍕
      </a>
    </div>
    <hr class="divider"/>
    <p class="note">
      Need help? Reach out to us at <a href="mailto:support@bitebond.app" style="color:#f43f5e;">support@bitebond.app</a>
    </p>
  `);
  await sendEmail({ to: user.email, subject: 'Welcome to BiteBond AI ❤️', html });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail };
