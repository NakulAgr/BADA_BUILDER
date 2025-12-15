# Admin Panel Guide - Live Grouping Properties

## 🎯 Quick Start

### Access Admin Panel
```
URL: http://localhost:5173/admin/live-grouping
```

**Note:** You need to be logged in to access the admin panel.

---

## 📝 Adding a New Property

### Step 1: Click "Add New Property"
The form will open with all required fields.

### Step 2: Fill Basic Information
```
Property Title: Skyline Towers - Group Buy
Developer: Shree Balaji Builders
Location: Waghodia Road, Vadodara
Property Type: 3 BHK Apartment
Area: 1450 sq.ft
Possession: Dec 2025
RERA Number: PR/GJ/VADODARA/123456
```

### Step 3: Fill Pricing Details
```
Original Price: ₹75 Lakhs
Group Price: ₹68 Lakhs
Discount: 9% OFF
Token Amount: ₹50,000
```

### Step 4: Fill Group Details
```
Total Slots: 20
Filled Slots: 14
Minimum Buyers: 15
Time Left: 2 Days 5 Hours
Closing Date: Dec 20, 2025
Status: Active (or Closing Soon / Closed)
```

### Step 5: Add Description & Details

**Description:**
```
Skyline Towers offers premium 3 BHK apartments with modern amenities and excellent connectivity. Join the group buy to save ₹7 Lakhs and get exclusive benefits worth ₹5 Lakhs.
```

**Benefits (comma-separated):**
```
Free Modular Kitchen, 2 Years Maintenance Free, Premium Flooring, Free Club Membership
```

**Facilities (comma-separated):**
```
Swimming Pool, Gym, Parking, Security, Garden, Power Backup, Lift, Club House
```

**Location Advantages (format: Place: Distance | Place: Distance):**
```
Railway Station: 2.5 km | Airport: 8 km | School: 500 m | Mall: 3 km
```

### Step 6: Upload Images
- Click "Choose Files"
- Select up to 5 images
- First image will be the main display image
- Preview will show below

### Step 7: Submit
- Click "Add Property"
- Wait for success message
- Property will appear on Live Grouping page immediately!

---

## ✏️ Editing a Property

1. Find the property in the list
2. Click "Edit" button
3. Form opens with pre-filled data
4. Modify any fields
5. Upload new images (optional)
6. Click "Update Property"

---

## 🗑️ Deleting a Property

1. Find the property in the list
2. Click "Delete" button
3. Confirm deletion in popup
4. Property removed from website instantly

---

## 👁️ Viewing a Property

1. Click "View" button on any property
2. Opens the property details page
3. See how it looks to users

---

## 📋 Field Format Reference

### Benefits Format
```
Benefit 1, Benefit 2, Benefit 3
```
**Example:**
```
Free Modular Kitchen, 2 Years Maintenance Free, Premium Flooring
```

### Facilities Format
```
Facility 1, Facility 2, Facility 3
```
**Example:**
```
Swimming Pool, Gym, Parking, Security, Garden, Power Backup
```

### Location Advantages Format
```
Place: Distance | Place: Distance | Place: Distance
```
**Example:**
```
Railway Station: 2.5 km | Airport: 8 km | School: 500 m
```

---

## 🎨 Status Options

### Active
- Green badge
- Group is actively accepting buyers
- "Join This Group" button

### Closing Soon
- Orange badge
- Group is about to close
- "Join Now - Closing Soon!" button

### Closed
- Red badge
- Group is closed
- "Group Closed" button (disabled)

---

## 📸 Image Guidelines

### Best Practices:
- **Format:** JPG, PNG
- **Size:** Recommended 1920x1080px or similar
- **Quality:** High resolution
- **Count:** 1-5 images
- **Order:** First image is main image

### Image Types to Include:
1. Main exterior view
2. Interior/living room
3. Bedroom
4. Amenities (pool, gym, etc.)
5. Location/surroundings

---

## 💾 Database Structure

### Collection: `live_grouping_properties`

**Document Fields:**
```javascript
{
  title: string,
  developer: string,
  location: string,
  originalPrice: string,
  groupPrice: string,
  discount: string,
  savings: string (auto-calculated),
  type: string,
  totalSlots: number,
  filledSlots: number,
  timeLeft: string,
  minBuyers: number,
  benefits: array,
  status: string,
  area: string,
  possession: string,
  reraNumber: string,
  facilities: array,
  description: string,
  advantages: array of objects,
  groupDetails: {
    tokenAmount: string,
    refundPolicy: string,
    closingDate: string,
    expectedCompletion: string
  },
  images: array,
  image: string,
  created_at: timestamp,
  created_by: string (user ID)
}
```

---

## 🔧 Troubleshooting

### Property Not Showing Up
1. Check if you're logged in
2. Refresh the Live Grouping page
3. Check browser console for errors
4. Verify all required fields were filled

### Images Not Uploading
1. Check file size (max 5MB recommended)
2. Verify file format (JPG, PNG)
3. Check internet connection
4. Try uploading one image at a time

### Can't Access Admin Panel
1. Make sure you're logged in
2. Navigate to `/admin/live-grouping`
3. Check if user has admin permissions

### Form Not Submitting
1. Check all required fields (marked with *)
2. Verify format of comma-separated fields
3. Check location advantages format
4. Look for error messages

---

## 📊 Example Property Data

### Complete Example:

```
=== BASIC INFORMATION ===
Property Title: Skyline Towers - Group Buy
Developer: Shree Balaji Builders
Location: Waghodia Road, Vadodara
Property Type: 3 BHK Apartment
Area: 1450 sq.ft
Possession: Dec 2025
RERA Number: PR/GJ/VADODARA/123456

=== PRICING ===
Original Price: ₹75 Lakhs
Group Price: ₹68 Lakhs
Discount: 9% OFF
Token Amount: ₹50,000

=== GROUP DETAILS ===
Total Slots: 20
Filled Slots: 14
Minimum Buyers: 15
Time Left: 2 Days 5 Hours
Closing Date: Dec 20, 2025
Status: Active

=== DESCRIPTION & DETAILS ===
Description:
Skyline Towers offers premium 3 BHK apartments with modern amenities and excellent connectivity. Located in the heart of Waghodia Road, this project combines luxury living with convenience. Join the group buy to save ₹7 Lakhs and get exclusive benefits worth ₹5 Lakhs.

Benefits:
Free Modular Kitchen, 2 Years Maintenance Free, Premium Flooring, Free Club Membership

Facilities:
Swimming Pool, Gym, Parking, Security, Garden, Power Backup, Lift, Club House, Kids Play Area, Jogging Track

Location Advantages:
Railway Station: 2.5 km | Airport: 8 km | School: 500 m | Mall: 3 km | Hospital: 1.5 km
```

---

## 🚀 Tips for Success

### 1. Use Clear Titles
- Include property type and unique identifier
- Example: "Skyline Towers - Group Buy" not just "Skyline"

### 2. Accurate Pricing
- Always use ₹ symbol
- Include "Lakhs" or "Cr" for clarity
- Example: ₹75 Lakhs, ₹1.2 Cr

### 3. Realistic Time Left
- Update regularly
- Use format: "X Days Y Hours"
- Example: "2 Days 5 Hours"

### 4. Compelling Benefits
- List 3-5 key benefits
- Focus on value-adds
- Be specific

### 5. Complete Facilities List
- Include all amenities
- Use standard names
- Separate with commas

### 6. Accurate Location Advantages
- Use actual distances
- Include important landmarks
- Format: Place: Distance

### 7. High-Quality Images
- Use professional photos
- Show different angles
- Include amenities

---

## 📞 Support

### Need Help?
- Check this guide first
- Review example property data
- Test with one property first
- Contact technical support if issues persist

---

## ✅ Checklist Before Publishing

- [ ] All required fields filled
- [ ] Pricing is accurate
- [ ] Benefits listed (comma-separated)
- [ ] Facilities listed (comma-separated)
- [ ] Location advantages formatted correctly
- [ ] Images uploaded (at least 1)
- [ ] Description is clear and compelling
- [ ] RERA number is correct
- [ ] Status is appropriate
- [ ] Preview looks good

---

**Last Updated:** December 15, 2025
**Version:** 1.0.0
