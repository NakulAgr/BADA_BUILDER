# Razorpay Pre-Visit Payment Testing Guide

## ✅ RAZORPAY CREDENTIALS UPDATED

### 🔑 Updated Configuration
**Your Razorpay credentials have been successfully added:**
- **Key ID**: `rzp_test_Rt8mnuQxtS0eotu9vHfRKAba`
- **Key Secret**: `twQBRVWT33Ykst`
- **Environment**: Test Mode (safe for testing)

### 🎯 Pre-Visit Payment Flow

#### Complete Payment Process:
1. **User selects "Previsit" payment method**
2. **Razorpay payment section appears** with ₹300 amount breakdown
3. **User clicks "💳 Pay ₹300 & Book Visit" button**
4. **Razorpay checkout modal opens** with your branding
5. **User completes payment** using test cards/UPI/wallets
6. **Payment success** → Booking + Payment details saved to Firebase
7. **Email notification** sent to admin with payment info
8. **Success overlay** shows with auto-redirect to home
9. **Success message** displays on home page

### 🧪 Testing Instructions

#### Step-by-Step Testing:
1. **Start the application**: `npm run dev`
2. **Login to your account** (required for booking)
3. **Navigate to any property** and click "Book Site Visit"
4. **Fill out the booking form**:
   - Select visit date (Monday-Saturday)
   - Select time slot (10:00 AM - 5:00 PM)
   - Enter visitor names (1-3 people)
   - Enter pickup address
   - **Select "Previsit" payment method**
5. **Verify payment section appears** with ₹300 breakdown
6. **Click "💳 Pay ₹300 & Book Visit" button**
7. **Razorpay checkout opens** - Use test payment methods below

#### 🧪 Test Payment Methods

**Test Credit Cards:**
- **Success Card**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry**: Any future date (e.g., `12/25`)
- **Name**: Any name

**Test UPI IDs:**
- **Success**: `success@razorpay`
- **Failure**: `failure@razorpay`

**Test Wallets:**
- **Paytm**: Use test wallet option
- **PhonePe**: Use test wallet option

### ✅ Success Verification

#### What to Check After Payment:
1. **Payment Success Response**:
   ```javascript
   {
     razorpay_payment_id: "pay_xxxxxxxxxxxxx",
     razorpay_order_id: "order_xxxxxxxxxxxxx", // if applicable
     razorpay_signature: "xxxxxxxxxxxxx" // if applicable
   }
   ```

2. **Console Logs**:
   ```
   ✅ Razorpay script loaded successfully
   ✅ Payment successful: {payment_id}
   ✅ Admin email sent successfully
   ✅ Booking successful! Redirecting to home...
   ```

3. **Firebase Database**:
   - New document in `bookings` collection
   - Contains payment details:
     ```javascript
     {
       payment_status: "completed",
       payment_method: "razorpay_previsit",
       razorpay_payment_id: "pay_xxxxx",
       payment_amount: 300,
       payment_currency: "INR",
       payment_timestamp: "2025-12-18T..."
     }
     ```

4. **Email Notification**:
   - Admin receives email with booking details
   - Includes payment information
   - Shows "razorpay_previsit" as payment method

5. **User Experience**:
   - Success overlay with green checkmark
   - Auto-redirect to home after 3 seconds
   - Success message on home page
   - No manual OK clicks required

### 🔧 Technical Implementation Details

#### Environment Variables:
```bash
# .env file (updated)
VITE_RAZORPAY_KEY_ID=rzp_test_Rt8mnuQxtS0eotu9vHfRKAba
VITE_RAZORPAY_KEY_SECRET=twQBRVWT33Ykst
```

#### Razorpay Configuration:
```javascript
const options = {
  key: 'rzp_test_Rt8mnuQxtS0eotu9vHfRKAba',
  amount: 30000, // ₹300 in paise
  currency: 'INR',
  name: 'Bada Builder',
  description: 'Site Visit Booking - Property Name',
  theme: { color: '#58335e' },
  // ... other options
};
```

#### Payment Data Stored:
```javascript
{
  // Standard booking fields
  property_id: 'prop_123',
  user_id: 'user_456',
  visit_date: '2025-12-20',
  visit_time: '14:00',
  
  // Payment specific fields
  payment_status: 'completed',
  payment_method: 'razorpay_previsit',
  razorpay_payment_id: 'pay_xxxxxxxxxxxxx',
  payment_amount: 300,
  payment_currency: 'INR',
  payment_timestamp: '2025-12-18T10:30:00.000Z'
}
```

### 🎨 User Interface Features

#### Payment Section UI:
- **Amount Breakdown**: Clear display of ₹300 charge
- **Refund Note**: "If you purchase the property, this amount will be refunded"
- **Security Badge**: "Secure payment powered by Razorpay"
- **Payment Button**: "💳 Pay ₹300 & Book Visit"

#### Button States:
- **Default**: "💳 Pay ₹300 & Book Visit"
- **Loading**: Spinner + "Processing Payment..."
- **Disabled**: When Razorpay not loaded or form invalid

#### Razorpay Checkout:
- **Branded**: Shows "Bada Builder" as merchant name
- **Theme Color**: Purple (#58335e) matching your brand
- **Description**: "Site Visit Booking - [Property Name]"
- **Amount**: ₹300.00 clearly displayed

### 🚨 Error Handling

#### Common Error Scenarios:
1. **Payment Cancelled**: User closes Razorpay modal
2. **Payment Failed**: Invalid card or insufficient funds
3. **Network Error**: Connection issues during payment
4. **Booking Save Error**: Firebase write failure after payment

#### Error Messages:
- **Payment Cancelled**: Modal closes, user can retry
- **Payment Failed**: Razorpay shows error, user can retry
- **Booking Error**: Alert with payment ID for support reference

### 🔍 Troubleshooting

#### If Payment Button is Disabled:
- Check if Razorpay script loaded: Look for "✅ Razorpay script loaded successfully"
- Verify environment variables are set correctly
- Ensure form is filled out completely
- Check browser console for errors

#### If Payment Fails:
- Verify Razorpay key ID is correct
- Check if test mode is enabled in Razorpay dashboard
- Try different test payment methods
- Check network connectivity

#### If Booking Doesn't Save After Payment:
- Check Firebase connection and permissions
- Verify user is authenticated
- Check browser console for Firebase errors
- Look for payment ID in console logs for reference

### 📊 Razorpay Dashboard Monitoring

#### What to Check:
1. **Login to Razorpay Dashboard**: https://dashboard.razorpay.com/
2. **Navigate to Payments**: Check recent transactions
3. **Verify Test Payments**: Should show in test mode
4. **Check Payment Status**: Successful payments show as "Captured"
5. **View Payment Details**: Click on payment for full details

#### Dashboard Features:
- **Real-time Monitoring**: See payments as they happen
- **Payment Analytics**: Success rates, failure reasons
- **Refund Management**: Process refunds if needed
- **Settlement Reports**: Track money flow

### 🚀 Going Live (Production)

#### When Ready for Production:
1. **Get Live API Keys**: From Razorpay dashboard
2. **Update Environment Variables**:
   ```bash
   VITE_RAZORPAY_KEY_ID=rzp_live_your_live_key
   VITE_RAZORPAY_KEY_SECRET=your_live_secret
   ```
3. **Test with Small Amount**: Verify live payments work
4. **Enable Webhooks**: For payment confirmations (optional)
5. **Set Up Settlements**: Configure bank account for payouts

### 📋 Pre-Launch Checklist

#### Before Going Live:
- [ ] Test successful payment flow
- [ ] Test payment failure scenarios
- [ ] Verify booking saves to Firebase
- [ ] Check email notifications work
- [ ] Test on mobile devices
- [ ] Verify Razorpay dashboard shows payments
- [ ] Test refund process (if applicable)
- [ ] Check all error messages display correctly

---

## ✅ Status: READY FOR TESTING

Your Razorpay pre-visit payment system is now fully configured and ready for testing. Use the test credentials provided above to verify the complete payment flow.

**Next Steps:**
1. Test the payment flow using the instructions above
2. Verify payments appear in your Razorpay dashboard
3. Check that bookings are saved with payment details
4. Confirm email notifications include payment information

**Support**: If you encounter any issues, check the troubleshooting section or contact Razorpay support with your test payment details.

**Last Updated**: December 18, 2025
**Environment**: Test Mode
**Payment Amount**: ₹300 for 1-hour site visit
**Status**: ✅ READY FOR TESTING