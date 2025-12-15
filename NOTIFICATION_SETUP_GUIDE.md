# 📧 Site Visit Notification Setup Guide

## Overview
Automatically receive email and SMS notifications when customers book site visits for your properties.

**Admin Contact:**
- Email: nakulagrawal987@gmail.com
- Mobile: 7984371588

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Install Dependencies
```bash
npm install nodemailer axios
```

### Step 2: Configure Gmail App Password

#### A. Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Follow the setup process

#### B. Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter name: "Bada Builder Notifications"
4. Click "Generate"
5. Copy the 16-character password

### Step 3: Create Environment File
Create `.env.notification` file in root directory:

```env
# Email Configuration
EMAIL_USER=nakulagrawal987@gmail.com
EMAIL_PASSWORD=your-16-char-app-password-here

# SMS Configuration (Optional)
FAST2SMS_API_KEY=your-fast2sms-api-key

# Server Port
NOTIFICATION_PORT=3002
```

---

## 🎯 How to Run

### Terminal 1: Start Notification Server
```bash
node notification-server.js
```

You should see:
```
🚀 Notification Server running on port 3002
📧 Email notifications will be sent to: nakulagrawal987@gmail.com
📱 SMS notifications will be sent to: 7984371588
```

### Terminal 2: Start Main Backend (if using)
```bash
node server.js
```

### Terminal 3: Start Frontend
```bash
npm run dev
```

---

## 📧 Email Notification Features

### What You'll Receive:
✅ **Professional HTML Email** with:
- Property details (name, ID, location)
- Customer information (email, ID)
- Visit schedule (date, time, duration)
- All visitor names (up to 3 people)
- Pickup address
- Payment method
- Booking timestamp
- Next steps checklist

### Email Subject Format:
```
🏠 New Site Visit Booking - [Property Name] - [Date]
```

### Example:
```
🏠 New Site Visit Booking - Skyline Towers - 2025-12-20
```

---

## 📱 SMS Notification Features

### What You'll Receive:
✅ **Instant SMS** with:
- Property name
- Visit date and time
- Number of people
- First visitor name
- Pickup address (truncated)
- Payment method
- Prompt to check email for full details

### SMS Format:
```
New Site Visit Booking!
Property: Skyline Towers
Date: 2025-12-20
Time: 14:00
People: 2
Visitor: John Doe
Pickup: 123 Main Street...
Payment: previsit
Check email for full details.
```

---

## 🔧 SMS Service Setup (Optional)

### Option A: Fast2SMS (Recommended for India)

#### 1. Sign Up
- Visit: https://www.fast2sms.com/
- Create account
- Verify phone number

#### 2. Get API Key
- Go to Dashboard
- Navigate to "API Keys"
- Copy your API key

#### 3. Add to .env
```env
FAST2SMS_API_KEY=your-api-key-here
```

#### 4. Pricing
- Free: 50 SMS
- Paid: ₹0.10-0.20 per SMS

### Option B: MSG91

#### 1. Sign Up
- Visit: https://msg91.com/
- Create account

#### 2. Get Credentials
- Auth Key
- Template ID (if required)

#### 3. Update Code
Modify `notification-server.js` to use MSG91 API

---

## 📊 Notification Data Structure

### Complete Booking Data Sent:
```javascript
{
  // Property Information
  property_id: "abc123",
  property_title: "Skyline Towers - Group Buy",
  property_location: "Waghodia Road, Vadodara",
  
  // Customer Information
  user_id: "firebase-user-id",
  user_email: "customer@example.com",
  
  // Visit Schedule
  visit_date: "2025-12-20",
  visit_time: "14:00",
  
  // Visitors
  number_of_people: 2,
  person1_name: "John Doe",
  person2_name: "Jane Doe",
  person3_name: null,
  
  // Pickup Details
  pickup_address: "123 Main Street, Vadodara",
  
  // Payment
  payment_method: "previsit", // or "postvisit"
  
  // Metadata
  booking_id: "firestore-doc-id",
  created_at: "2025-12-15T10:30:00.000Z",
  status: "pending"
}
```

---

## 🧪 Testing

### Test Email Notification:
```bash
curl -X POST http://localhost:3002/api/notify-booking \
  -H "Content-Type: application/json" \
  -d '{
    "property_title": "Test Property",
    "property_id": "test123",
    "property_location": "Test Location",
    "user_email": "test@example.com",
    "user_id": "test-user",
    "visit_date": "2025-12-20",
    "visit_time": "14:00",
    "number_of_people": 2,
    "person1_name": "John Doe",
    "person2_name": "Jane Doe",
    "person3_name": null,
    "pickup_address": "123 Test Street",
    "payment_method": "previsit",
    "created_at": "2025-12-15T10:00:00.000Z"
  }'
```

### Check Server Health:
```bash
curl http://localhost:3002/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Notification server is running"
}
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.notification` to Git
- ✅ Use strong app passwords
- ✅ Rotate passwords regularly

### 2. Email Security
- ✅ Use Gmail App Passwords (not regular password)
- ✅ Enable 2-Factor Authentication
- ✅ Monitor login activity

### 3. SMS Security
- ✅ Keep API keys secret
- ✅ Monitor SMS usage
- ✅ Set spending limits

---

## 🐛 Troubleshooting

### Email Not Sending

**Problem:** "Invalid login" error
**Solution:**
1. Verify 2FA is enabled
2. Generate new App Password
3. Use 16-character password (no spaces)
4. Check EMAIL_USER matches Gmail account

**Problem:** "Connection timeout"
**Solution:**
1. Check internet connection
2. Verify Gmail SMTP is not blocked
3. Try different network

### SMS Not Sending

**Problem:** SMS not received
**Solution:**
1. Check API key is correct
2. Verify SMS service has credits
3. Check phone number format (10 digits)
4. Review SMS service dashboard

### Server Not Starting

**Problem:** Port already in use
**Solution:**
```bash
# Kill process on port 3002
# Windows:
netstat -ano | findstr :3002
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3002 | xargs kill -9
```

**Problem:** Module not found
**Solution:**
```bash
npm install nodemailer axios dotenv
```

---

## 📈 Production Deployment

### Option 1: Vercel (Serverless)

#### 1. Create API Route
Create `api/notify-booking.js`:
```javascript
const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Your notification logic here
  // Use environment variables from Vercel
}
```

#### 2. Deploy
```bash
vercel
```

#### 3. Set Environment Variables
- Go to Vercel Dashboard
- Project Settings → Environment Variables
- Add EMAIL_USER, EMAIL_PASSWORD, etc.

### Option 2: Heroku

#### 1. Create Procfile
```
web: node notification-server.js
```

#### 2. Deploy
```bash
heroku create bada-builder-notifications
heroku config:set EMAIL_USER=nakulagrawal987@gmail.com
heroku config:set EMAIL_PASSWORD=your-app-password
git push heroku main
```

### Option 3: Railway

#### 1. Connect GitHub Repo
- Go to Railway.app
- Connect repository

#### 2. Add Environment Variables
- Add all variables from `.env.notification`

#### 3. Deploy
- Automatic deployment on push

### Update Frontend API URL

After deployment, update `src/pages/BookSiteVisit.jsx`:
```javascript
const NOTIFICATION_API = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-url.com/api/notify-booking'
  : 'http://localhost:3002/api/notify-booking';

// Use NOTIFICATION_API in fetch call
```

---

## 📊 Monitoring

### Email Delivery
- Check Gmail "Sent" folder
- Monitor bounce rates
- Review spam reports

### SMS Delivery
- Check Fast2SMS dashboard
- Monitor delivery reports
- Track credit usage

### Server Logs
```bash
# View logs
tail -f notification-server.log

# Or use PM2
pm2 logs notification-server
```

---

## 💰 Cost Estimation

### Email (Gmail)
- **Free:** Unlimited emails
- **Cost:** $0

### SMS (Fast2SMS)
- **Free Trial:** 50 SMS
- **Paid:** ₹0.10-0.20 per SMS
- **Monthly (100 bookings):** ₹10-20

### Total Monthly Cost
- **Email:** Free
- **SMS:** ₹10-20
- **Total:** ₹10-20 per month

---

## 📞 Support

### Issues?
1. Check server logs
2. Verify environment variables
3. Test with curl command
4. Check email spam folder
5. Verify SMS credits

### Contact
- Email: nakulagrawal987@gmail.com
- Phone: 7984371588

---

## ✅ Checklist

Before going live:
- [ ] Gmail App Password generated
- [ ] `.env.notification` file created
- [ ] Dependencies installed
- [ ] Notification server tested
- [ ] Email received successfully
- [ ] SMS received (if configured)
- [ ] Frontend updated with API URL
- [ ] Production deployment configured
- [ ] Environment variables set in production
- [ ] Monitoring setup

---

**Last Updated:** December 15, 2025
**Version:** 1.0.0
