# Profile Page Implementation Guide

## Overview
A clean, modern Profile Page UI that displays user information and activity summary in a professional real-estate style design with photo upload capability.

## Features

### 1. User Profile Section
- **Profile Photo**: 
  - 200x200px container with gradient border
  - Shows user icon if no photo uploaded
  - **Click to upload/change photo**
  - Hover overlay with camera icon and "Change Photo" text
  - Upload progress indicator with spinner
  - Success message after upload
  - Validates file type (images only) and size (max 5MB)
  - Stores in Firebase Storage
  - Updates Firestore user document
  
- **User Details** (Read-only):
  - Name
  - Email
  - Phone Number
  - User ID (8-character uppercase)
  - User Type (Individual/Developer badge)

### 2. Photo Upload Functionality
**How it works:**
1. User clicks on profile photo
2. File picker opens (accepts images only)
3. Validates file type and size
4. Shows uploading spinner overlay
5. Uploads to Firebase Storage at `profile_photos/{userId}/{timestamp}_{filename}`
6. Gets download URL
7. Updates Firestore user document with `profilePhoto` field
8. Refreshes profile data
9. Shows success message

**Validation:**
- File type: Must be an image (image/*)
- File size: Maximum 5MB
- Error alerts for invalid files

### 3. Activity Summary Section
Three clickable activity cards:
- **Properties Uploaded**: Links to `/my-properties`
- **Joined Live Groups**: Links to `/exhibition/live-grouping`
- **Booked Site Visits**: Links to `/my-bookings`

Each card shows:
- Colored icon with hover animation
- Title
- Count (currently 0, will be dynamic)
- Arrow on hover

## Design Enhancements

### Visual Features
- **Background**: Purple gradient with radial overlays
- **Cards**: White with 24px rounded corners, elevated shadows
- **Hover Effects**: Cards lift up, shadows intensify
- **Photo Hover**: Scales up, shows overlay with camera icon
- **Activity Cards**: Color-coded (Blue, Purple, Green) with gradient backgrounds on hover
- **Smooth Animations**: All transitions are smooth and professional

### Color Scheme
- Primary Purple: `#667eea` to `#764ba2`
- Blue (Individual): `#3b82f6`
- Purple (Developer): `#8b5cf6`
- Green (Site Visits): `#10b981`
- Icon backgrounds: Blue (email), Green (phone), Orange (user ID), Purple (account type)

## Routes

### Profile Page
- **URL**: `/profile`
- **Component**: `ProfilePage.jsx`
- **Access**: Available to logged-in users

### Navigation
- Access from Header dropdown: Click profile avatar → "View Profile"
- Direct URL: `/profile`

## Data Integration

### Firebase Services Used
```javascript
import { storage, db } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
```

### User Data Structure
```javascript
{
  name: userProfile?.name || 'John Doe',
  email: currentUser?.email || 'john.doe@example.com',
  phone: userProfile?.phone || '+91 9876543210',
  userId: currentUser?.uid?.substring(0, 8).toUpperCase(),
  userType: userProfile?.userType || 'Individual',
  profilePhoto: userProfile?.profilePhoto || null
}
```

### Photo Upload Process
1. User selects image file
2. Validates file (type and size)
3. Creates storage reference: `profile_photos/{userId}/{timestamp}_{filename}`
4. Uploads file to Firebase Storage
5. Gets download URL
6. Updates Firestore: `users/{userId}` with `profilePhoto: URL`
7. Calls `refreshProfile()` to update UI

## Responsive Design

### Desktop (lg+)
- Photo left, details right (side-by-side)
- Activity cards in 3-column grid
- Photo: 200x200px

### Tablet (sm-lg)
- Photo and details stacked
- Activity cards in 3-column grid
- Photo: 200x200px

### Mobile (<sm)
- All elements stacked
- Activity cards in 1-column grid
- Photo: 160px (centered)
- Name shows below photo

## Files Modified

### New Files
- `src/pages/ProfilePage.jsx` - Main profile page component
- `src/pages/ProfilePage.css` - Enhanced styling with animations

### Updated Files
- `src/App.jsx` - Added `/profile` route
- `src/components/Header/Header.jsx` - Added "View Profile" button in dropdown
- `src/components/Header/Header.css` - Added `.profile-dropdown-link` styles
- `src/firebase.jsx` - Added Firebase Storage export

## Usage

### For Users
1. Login to your account
2. Click your profile avatar in the header
3. Click "View Profile" in the dropdown
4. Click on profile photo to upload/change
5. Select an image (max 5MB)
6. Wait for upload to complete
7. See success message

### For Developers
```javascript
// Navigate to profile page
navigate('/profile');

// Access user data
const { currentUser, userProfile, refreshProfile } = useAuth();

// Upload photo
const storageRef = ref(storage, `profile_photos/${userId}/${timestamp}_${filename}`);
await uploadBytes(storageRef, file);
const photoURL = await getDownloadURL(storageRef);
await updateDoc(doc(db, 'users', userId), { profilePhoto: photoURL });
```

## Tech Stack
- React 19
- React Router DOM 7
- Firebase Storage (for photo uploads)
- Firebase Firestore (for user data)
- React Icons (Feather Icons)
- Custom CSS with animations

## Security Notes
- Only authenticated users can access profile page
- Users can only upload their own profile photo
- File validation prevents non-image uploads
- Size limit prevents large file uploads
- Storage path includes user ID for security

## Future Enhancements

### To Implement
1. **Image Cropping**: Allow users to crop/resize before upload
2. **Photo Preview**: Show preview before confirming upload
3. **Delete Photo**: Option to remove profile photo
4. **Dynamic Activity Counts**: Fetch real data from Firestore
5. **Activity Detail Pages**: 
   - `/my-properties`: List user's uploaded properties
   - `/my-bookings`: List user's site visit bookings
