# EmailJS Template Variables Guide - Contact Form

## 🐛 Issue: Email Address Not Showing in Template

### Problem
The contact form is sending emails successfully, but the user's email address is not appearing in the received email. This happens when the EmailJS template variable names don't match the form field names.

### ✅ Solution: Update Your EmailJS Template

Your EmailJS template (`template_h5bldc9`) should use these exact variable names:

#### 📧 Form Field Names Being Sent:
```javascript
{
  first_name: "User's first name",
  last_name: "User's last name", 
  company: "User's company (optional)",
  user_email: "user@email.com",    // ← This is the key field
  country: "Selected country (US/IND/EU)",
  phone: "User's phone number",
  message: "User's inquiry message"
}
```

### 🔧 Correct EmailJS Template HTML

**Update your EmailJS template to use these variables:**

```html
<!DOCTYPE html>
<html>
<head>
    <title>New Contact Form Submission - Bada Builder</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #58335e; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #58335e; }
        .value { margin-left: 10px; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #58335e; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🏠 New Contact Form Submission</h2>
            <p>Bada Builder - Real Estate</p>
        </div>
        
        <div class="content">
            <h3>Contact Details:</h3>
            
            <div class="field">
                <span class="label">👤 Name:</span>
                <span class="value">{{first_name}} {{last_name}}</span>
            </div>
            
            <div class="field">
                <span class="label">📧 Email:</span>
                <span class="value">{{user_email}}</span>
            </div>
            
            <div class="field">
                <span class="label">📱 Phone:</span>
                <span class="value">{{phone}} ({{country}})</span>
            </div>
            
            <div class="field">
                <span class="label">🏢 Company:</span>
                <span class="value">{{company}}</span>
            </div>
            
            <div class="message-box">
                <h4>💬 Message:</h4>
                <p>{{message}}</p>
            </div>
            
            <hr style="margin: 20px 0; border: 1px solid #ddd;">
            <p style="font-size: 12px; color: #666;">
                <em>This email was sent from the Bada Builder contact form on your website.</em><br>
                <em>Timestamp: {{timestamp}} (if you add this variable)</em>
            </p>
        </div>
    </div>
</body>
</html>
```

### 🔍 Key Variable Names to Use

**Make sure your EmailJS template uses these exact names:**

| Form Field | EmailJS Variable | Description |
|------------|------------------|-------------|
| `first_name` | `{{first_name}}` | User's first name |
| `last_name` | `{{last_name}}` | User's last name |
| `company` | `{{company}}` | User's company (optional) |
| `user_email` | `{{user_email}}` | **User's email address** ⭐ |
| `country` | `{{country}}` | Country code (US/IND/EU) |
| `phone` | `{{phone}}` | User's phone number |
| `message` | `{{message}}` | User's inquiry message |

### ⚠️ Common Mistakes

**Don't use these (they won't work):**
- `{{email}}` ❌ (should be `{{user_email}}`)
- `{{name}}` ❌ (should be `{{first_name}} {{last_name}}`)
- `{{from_email}}` ❌ (should be `{{user_email}}`)
- `{{sender_email}}` ❌ (should be `{{user_email}}`)

### 🧪 Testing the Fix

#### Step 1: Update Your EmailJS Template
1. **Login to EmailJS Dashboard**: https://dashboard.emailjs.com/
2. **Go to Email Templates**
3. **Edit template**: `template_h5bldc9`
4. **Replace the template content** with the HTML above
5. **Save the template**

#### Step 2: Test the Contact Form
1. **Fill out the contact form** on your website
2. **Submit the form**
3. **Check the received email** - the email address should now appear

#### Step 3: Debug if Still Not Working
1. **Open browser console** (F12)
2. **Submit the form**
3. **Look for logs**:
   ```
   📧 Sending contact form with EmailJS...
   📋 Form data being sent:
     first_name: John
     last_name: Doe
     user_email: john@example.com  ← This should be logged
     phone: 1234567890
     message: Test message
   ```

### 🔧 Alternative Solution: Change Form Field Name

**If you prefer to keep your template as `{{email}}`, you can change the form field:**

```jsx
// In Connect.jsx, change this:
<input
    type="email"
    name="user_email"  // ← Change this
    id="user_email"
    // ... other props
/>

// To this:
<input
    type="email"
    name="email"       // ← New name
    id="email"
    // ... other props
/>
```

**But I recommend updating the template instead** since `user_email` is more descriptive.

### 📧 Simple Template (Minimal Version)

**If you want a simple template:**

```html
<h2>New Contact Form Submission</h2>

<p><strong>Name:</strong> {{first_name}} {{last_name}}</p>
<p><strong>Email:</strong> {{user_email}}</p>
<p><strong>Phone:</strong> {{phone}} ({{country}})</p>
<p><strong>Company:</strong> {{company}}</p>

<h3>Message:</h3>
<p>{{message}}</p>

<hr>
<p><em>Sent from Bada Builder contact form</em></p>
```

### 🔍 Troubleshooting Checklist

**If email still doesn't show:**

1. **Check Template Variables**:
   - ✅ Template uses `{{user_email}}` not `{{email}}`
   - ✅ Template is saved in EmailJS dashboard
   - ✅ Using correct template ID: `template_h5bldc9`

2. **Check Form Data**:
   - ✅ Form field has `name="user_email"`
   - ✅ Email field is filled out when testing
   - ✅ Form validation passes

3. **Check Console Logs**:
   - ✅ Form data shows `user_email: actual@email.com`
   - ✅ EmailJS sends successfully
   - ✅ No JavaScript errors

4. **Check EmailJS Dashboard**:
   - ✅ Login to dashboard and check email history
   - ✅ Verify template preview shows variables correctly
   - ✅ Test template with sample data

### 📋 Quick Fix Summary

**The most likely fix:**
1. **Go to EmailJS Dashboard**
2. **Edit template `template_h5bldc9`**
3. **Change `{{email}}` to `{{user_email}}`**
4. **Save template**
5. **Test contact form again**

---

## ✅ Expected Result

After updating your EmailJS template to use `{{user_email}}`, the received emails should show:

```
Name: John Doe
Email: john@example.com  ← This should now appear
Phone: 1234567890 (US)
Company: ABC Corp
Message: I'm interested in your properties...
```

**The email address will now be visible in your received contact form emails!**