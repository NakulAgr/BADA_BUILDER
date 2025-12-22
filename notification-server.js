// Notification Server for Site Visit Bookings
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import axios from 'axios';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Initialize Firebase Admin (Required for Password Reset)
// Tries to load 'serviceAccountKey.json' from the root directory
try {
  if (fs.existsSync('./serviceAccountKey.json')) {
    const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin Initialized successfully.");
  } else {
    console.warn("⚠️  WARNING: 'serviceAccountKey.json' not found!");
    console.warn("    Password Reset feature will NOT work.");
  }
} catch (error) {
  console.error("❌ Firebase Admin Initialization Failed:", error.message);
}

// Admin contact details
const ADMIN_EMAIL = 'nakulagrawal987@gmail.com';
const ADMIN_PHONE = '7984371588';

// Email configuration (using Gmail)
// Email configuration (using Gmail)
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.warn('⚠️  WARNING: EMAIL_USER or EMAIL_PASSWORD not found in .env file.');
  console.warn('    Email notifications and OTPs will NOT work.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD // Your Gmail App Password
  }
});


// Send Email Notification

// Send Email Notification
async function sendEmailNotification(bookingData) {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #58335e 0%, #6d4575 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 18px; font-weight: bold; color: #58335e; margin-bottom: 10px; border-bottom: 2px solid #58335e; padding-bottom: 5px; }
        .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { font-weight: 600; width: 180px; color: #666; }
        .detail-value { flex: 1; color: #1a1a1a; }
        .highlight { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 15px 0; border-radius: 4px; }
        .footer { background: #1a1a1a; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
        .badge { display: inline-block; padding: 4px 12px; background: #10b981; color: white; border-radius: 12px; font-size: 12px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 New Site Visit Booking</h1>
          <p style="margin: 5px 0;">Bada Builder - Property Management</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <strong>⚡ Action Required:</strong> A new site visit has been booked. Please review the details below and arrange the visit accordingly.
          </div>

          <div class="section">
            <div class="section-title">📍 Property Details</div>
            <div class="detail-row">
              <span class="detail-label">Property Name:</span>
              <span class="detail-value"><strong>${bookingData.property_title}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Property ID:</span>
              <span class="detail-value">${bookingData.property_id}</span>
            </div>
            ${bookingData.property_location ? `
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${bookingData.property_location}</span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">👤 Customer Details</div>
            <div class="detail-row">
              <span class="detail-label">Customer Email:</span>
              <span class="detail-value">${bookingData.user_email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Customer ID:</span>
              <span class="detail-value">${bookingData.user_id}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📅 Visit Schedule</div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value"><strong>${bookingData.visit_date}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value"><strong>${bookingData.visit_time}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Duration:</span>
              <span class="detail-value">1 Hour (₹300)</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">👥 Visitors (${bookingData.number_of_people} ${bookingData.number_of_people > 1 ? 'People' : 'Person'})</div>
            <div class="detail-row">
              <span class="detail-label">1st Person:</span>
              <span class="detail-value"><strong>${bookingData.person1_name}</strong></span>
            </div>
            ${bookingData.person2_name ? `
            <div class="detail-row">
              <span class="detail-label">2nd Person:</span>
              <span class="detail-value"><strong>${bookingData.person2_name}</strong></span>
            </div>
            ` : ''}
            ${bookingData.person3_name ? `
            <div class="detail-row">
              <span class="detail-label">3rd Person:</span>
              <span class="detail-value"><strong>${bookingData.person3_name}</strong></span>
            </div>
            ` : ''}
          </div>

          <div class="section">
            <div class="section-title">🚗 Pickup Details</div>
            <div class="detail-row">
              <span class="detail-label">Pickup Address:</span>
              <span class="detail-value">${bookingData.pickup_address}</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">💳 Payment Information</div>
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value">
                <span class="badge">${bookingData.payment_method === 'previsit' ? 'Pre-Visit' : 'Post-Visit'}</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Base Charge:</span>
              <span class="detail-value">₹300 (1 Hour)</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Additional:</span>
              <span class="detail-value">₹5 per minute after 1 hour</span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">ℹ️ Booking Information</div>
            <div class="detail-row">
              <span class="detail-label">Booking ID:</span>
              <span class="detail-value">${bookingData.booking_id || 'Auto-generated'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Booking Time:</span>
              <span class="detail-value">${new Date(bookingData.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value"><span class="badge" style="background: #f59e0b;">Pending</span></span>
            </div>
          </div>

          <div class="highlight" style="background: #dbeafe; border-left-color: #3b82f6;">
            <strong>📝 Next Steps:</strong>
            <ol style="margin: 10px 0 0 0; padding-left: 20px;">
              <li>Arrange car for pickup at the specified address</li>
              <li>Confirm availability of property for viewing</li>
              <li>Contact customer at: <strong>${bookingData.user_email}</strong></li>
              <li>Prepare property documents if needed</li>
            </ol>
          </div>
        </div>

        <div class="footer">
          <p style="margin: 5px 0;">Bada Builder - Real Estate Management System</p>
          <p style="margin: 5px 0; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: ADMIN_EMAIL,
    subject: `🏠 New Site Visit Booking - ${bookingData.property_title} - ${bookingData.visit_date}`,
    html: emailHTML,
    text: `
NEW SITE VISIT BOOKING

Property: ${bookingData.property_title}
Property ID: ${bookingData.property_id}

Customer: ${bookingData.user_email}

Visit Date: ${bookingData.visit_date}
Visit Time: ${bookingData.visit_time}

Number of People: ${bookingData.number_of_people}
1st Person: ${bookingData.person1_name}
${bookingData.person2_name ? `2nd Person: ${bookingData.person2_name}` : ''}
${bookingData.person3_name ? `3rd Person: ${bookingData.person3_name}` : ''}

Pickup Address: ${bookingData.pickup_address}

Payment Method: ${bookingData.payment_method}

Booking Time: ${new Date(bookingData.created_at).toLocaleString('en-IN')}
    `
  };

  await transporter.sendMail(mailOptions);
}

// Send Property Post Confirmation to User
async function sendUserPropertyPostEmail(propertyData) {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f7f6; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .section { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f3f4f6; }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 15px; }
        .detail-row { display: flex; margin-bottom: 8px; }
        .detail-label { font-weight: 600; width: 140px; color: #6b7280; }
        .detail-value { flex: 1; color: #111827; }
        .success-banner { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 25px; color: #065f46; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Property Posted Successfully!</h2>
          <p>Bada Builder - Real Estate</p>
        </div>
        <div class="content">
          <div class="success-banner">
            🎉 Your property listing is now live and visible to potential buyers/tenants!
          </div>

          <div class="section">
            <div class="section-title">🏠 Property Details</div>
            <div class="detail-row">
              <span class="detail-label">Property Name:</span>
              <span class="detail-value"><strong>${propertyData.title}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type:</span>
              <span class="detail-value">${propertyData.type}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${propertyData.location}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Price:</span>
              <span class="detail-value"><strong>${propertyData.price}</strong></span>
            </div>
          </div>

          <p>Thank you for choosing Bada Builder. We will notify you when someone shows interest in your property.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Bada Builder. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: propertyData.user_email,
    subject: `✅ Listing Confirmed: ${propertyData.title}`,
    html: emailHTML
  };

  await transporter.sendMail(mailOptions);
}

// Send Booking Confirmation to User
async function sendUserBookingConfirmationEmail(bookingData) {
  const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e2e8f0; border-top: none; }
        .section { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #f1f5f9; }
        .section:last-child { border-bottom: none; }
        .section-title { font-size: 18px; font-weight: bold; color: #4f46e5; margin-bottom: 15px; }
        .detail-row { display: flex; margin-bottom: 8px; }
        .detail-label { font-weight: 600; width: 140px; color: #64748b; }
        .detail-value { flex: 1; color: #1e293b; }
        .booking-banner { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 25px; color: #1e40af; font-weight: 500; }
        .footer { text-align: center; padding: 20px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Site Visit Booked!</h2>
          <p>Bada Builder - Verification Service</p>
        </div>
        <div class="content">
          <div class="booking-banner">
            📅 Your site visit has been scheduled successfully. Our team will arrange the pickup as per your details.
          </div>

          <div class="section">
            <div class="section-title">📍 Visit Details</div>
            <div class="detail-row">
              <span class="detail-label">Property:</span>
              <span class="detail-value"><strong>${bookingData.property_title}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date:</span>
              <span class="detail-value"><strong>${bookingData.visit_date}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time:</span>
              <span class="detail-value"><strong>${bookingData.visit_time}</strong></span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">🚗 Pickup Info</div>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span class="detail-value">${bookingData.pickup_address}</span>
            </div>
          </div>

          <p><strong>Note:</strong> Please be ready at the pickup location 10 minutes before the scheduled time.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Bada Builder. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: bookingData.user_email,
    subject: `🏠 Site Visit Confirmed: ${bookingData.property_title}`,
    html: emailHTML
  };

  await transporter.sendMail(mailOptions);
}

// Send SMS Notification
async function sendSMSNotification(bookingData) {
  // Shorter message for SMS to ensure delivery
  const message = `New Booking!
Prop: ${bookingData.property_title.substring(0, 20)}
Date: ${bookingData.visit_date}
Time: ${bookingData.visit_time}
Visitors: ${bookingData.number_of_people}
Payment: ${bookingData.payment_method}`;

  // Using 2Factor API for Booking Notifications
  const API_KEY = "de2e4248-df03-11f0-a6b2-0200cd936042";

  try {
    // 2Factor Open Template / Transactional SMS Endpoint
    // Note: In India, DLT registration is required for custom templates.
    // If this fails, it's likely due to template mismatch.
    const url = `https://2factor.in/API/V1/${API_KEY}/ADDON_SERVICES/SEND/TSMS`;

    await axios.post(url, {
      from: "BBUILD", // Sender ID (should be approved)
      to: ADMIN_PHONE,
      template_id: "", // If you have a specific template ID for bookings, put it here
      msg: message
    });

    console.log(`✅ SMS sent to ${ADMIN_PHONE} via 2Factor`);
  } catch (error) {
    console.error('❌ SMS sending failed via 2Factor:', error.message);
    if (error.response) {
      console.error('   API Response:', error.response.data);
    }
  }
}

// API Endpoint to send notifications for booking
app.post('/api/notify-booking', async (req, res) => {
  try {
    const bookingData = req.body;

    console.log(`📧 Processing notifications for booking ${bookingData.booking_id || 'new'}...`);

    const notifications = [
      // 1. Admin Email
      sendEmailNotification(bookingData).then(() => console.log('✅ Admin email sent')),
      // 2. User Confirmation Email
      sendUserBookingConfirmationEmail(bookingData).then(() => console.log('✅ User confirmation email sent')),
      // 3. Admin SMS
      sendSMSNotification(bookingData).then(() => console.log('✅ Admin SMS sent'))
    ];

    await Promise.allSettled(notifications);

    res.json({
      success: true,
      message: 'Notifications sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API Endpoint for Property Posting notification
app.post('/api/notify-property-post', async (req, res) => {
  try {
    const propertyData = req.body;

    if (!propertyData.user_email) {
      throw new Error('User email is required for notification');
    }

    console.log(`📧 Sending property post confirmation to ${propertyData.user_email}...`);
    await sendUserPropertyPostEmail(propertyData);
    console.log('✅ Property post email sent successfully');

    res.json({
      success: true,
      message: 'Property notification sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending property notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// -------------------- OTP SYSTEM --------------------

// OTP Store (InMemory)
// Format: phoneNumber -> { otp: string, expiresAt: number }
const otpStore = new Map();

// Generate 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// sendOTPvia2Factor removed as per request (Email-only registration)

// Send OTP via Email
async function sendOTPviaEmail(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '🔐 Your Verification Code - Bada Builder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #58335e; text-align: center;">Bada Builder Verification</h2>
        <p style="font-size: 16px; color: #333; text-align: center;">Use the code below to verify your account:</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1f2937;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 5 minutes.</p>
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ OTP Email sent to ${email}`);
}

// Endpoint: Send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { type, identifier } = req.body; // type: 'email' (sms removed), identifier: email

    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Identifier (email) is required' });
    }

    // Enforce email type if not provided, or strictly check
    // Since frontend sends 'email', we can just proceed with email logic.
    // If type is explicitly 'sms', we can reject or just ignore and use email implementation if identifier is email.
    // But better to just default to email or error if not email.

    // For now, ignoring 'type' parameter effectively and treating all as email requests
    // or strictly checking equality.

    // Generate and Store OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // Store uses identifier (email) as key
    otpStore.set(identifier, { otp, expiresAt });

    console.log(`🔐 Generated OTP for ${identifier} (email): ${otp}`);

    await sendOTPviaEmail(identifier, otp);

    res.json({
      success: true,
      message: `OTP sent successfully via email`
    });

  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint: Verify OTP
app.post('/api/verify-otp', async (req, res) => {
  try {
    const { identifier, otp } = req.body; // identifier: phone | email

    if (!identifier || !otp) {
      return res.status(400).json({ success: false, error: 'Identifier and OTP are required' });
    }

    const record = otpStore.get(identifier);

    if (!record) {
      return res.status(400).json({ success: false, error: 'OTP not found. Please request a new one.' });
    }

    // Check expiry
    if (Date.now() > record.expiresAt) {
      otpStore.delete(identifier);
      return res.status(400).json({ success: false, error: 'OTP expired. Please request a new one.' });
    }

    // Check match
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    // Success
    if (!req.body.checkOnly) {
      otpStore.delete(identifier);
    }

    console.log(`✅ OTP verified for ${identifier} (checkOnly: ${!!req.body.checkOnly})`);

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Endpoint: Reset Password (Forgot Password Flow)
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, and New Password are required' });
    }

    // 1. Verify OTP
    const record = otpStore.get(email);
    if (!record) {
      return res.status(400).json({ success: false, error: 'OTP not found or expired. Please request a new one.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ success: false, error: 'OTP expired. Please request a new one.' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    // 2. Update Password in Firebase Auth (Requires Admin SDK)
    if (admin.apps.length === 0) {
      throw new Error("Server misconfigured: Firebase Admin not initialized (missing serviceAccountKey.json?)");
    }

    // We need to find the user by email to get UID (Admin SDK can do this)
    const user = await admin.auth().getUserByEmail(email);

    // Update password
    await admin.auth().updateUser(user.uid, {
      password: newPassword
    });

    console.log(`✅ Password updated for user: ${email}`);

    // 3. Clear OTP
    otpStore.delete(email);

    res.json({
      success: true,
      message: 'Your password has been updated successfully. You can now login with the new password.'
    });

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No user found with this email address.';
    }

    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Notification server is running',
    config: {
      email_user: process.env.EMAIL_USER,
      email_pass_length: process.env.EMAIL_PASSWORD?.length || 0,
      has_spaces: process.env.EMAIL_PASSWORD?.includes(' ') || false
    }
  });
});

const PORT = process.env.NOTIFICATION_PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 Notification Server running on port ${PORT}`);
  console.log(`📧 Email notifications will be sent to: ${ADMIN_EMAIL}`);
  console.log(`📱 SMS notifications will be sent to: ${ADMIN_PHONE}`);

  console.log(`\n🔍 DEBUG CREDENTIALS:`);
  console.log(`   EMAIL_USER: [${process.env.EMAIL_USER}]`);
  console.log(`   EMAIL_PASSWORD Length: ${process.env.EMAIL_PASSWORD?.length || 0}`);
  if (process.env.EMAIL_PASSWORD?.includes(' ')) {
    console.warn('   ⚠️  WARNING: EMAIL_PASSWORD contains spaces!');
  }

  console.log(`\n📍 API Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/notify-booking`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
});
