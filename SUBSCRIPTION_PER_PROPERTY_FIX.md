# Subscription Per Property Fix

## Problem
When users purchased different subscription packages for different properties (e.g., 1 month for one property, 6 months for another), all properties showed the same expiry date - the most recent subscription purchased.

## Root Cause
The system was using the user's **global** `subscription_expiry` field from the users collection, which gets updated every time they purchase a new subscription. This meant:
- User buys 1-month package → all properties show 1 month
- User buys 6-month package → all properties now show 6 months (including the old one)

## Solution
Store the subscription expiry date **per property** when the property is created, not globally.

### Changes Made

#### 1. PostProperty.jsx - Property Creation
When a property is created, we now:
1. Fetch the user's current `subscription_expiry` from their profile
2. Store it directly in the property document as `subscription_expiry`
3. Each property now has its own independent expiry date

```javascript
// Fetch user's current subscription expiry and add to property
const userDocRef = doc(db, 'users', currentUser.uid);
const userDoc = await getDoc(userDocRef);
if (userDoc.exists()) {
  const userData = userDoc.data();
  if (userData.subscription_expiry) {
    propertyData.subscription_expiry = userData.subscription_expiry;
  }
}
```

#### 2. MyProperties.jsx - Display Logic
Updated to use property's own expiry date:

```javascript
const getSubscriptionTimeRemaining = (property) => {
  // Use property's own subscription expiry if available
  const expiryDate = property.subscription_expiry 
    ? new Date(property.subscription_expiry) 
    : (subscriptionExpiry ? new Date(subscriptionExpiry) : null);
  
  // Calculate remaining time...
}
```

**Fallback**: If a property doesn't have its own `subscription_expiry` (old properties), it falls back to the user's global subscription.

## How It Works Now

### Scenario 1: User buys 1-month package
1. User purchases 1-month subscription
2. User's profile: `subscription_expiry` = 1 month from now
3. User creates Property A
4. Property A document: `subscription_expiry` = 1 month from now
5. **Property A will expire in 1 month**

### Scenario 2: Same user buys 6-month package
1. User purchases 6-month subscription
2. User's profile: `subscription_expiry` = 6 months from now (updated)
3. User creates Property B
4. Property B document: `subscription_expiry` = 6 months from now
5. **Property A still shows 1 month** (uses its own expiry)
6. **Property B shows 6 months** (uses its own expiry)

## Data Structure

### Before (Wrong):
```
users/{userId}
  - subscription_expiry: "2025-06-20" (global, changes with each purchase)

properties/{propertyId}
  - created_at: "2025-01-20"
  - (no subscription_expiry field)
  
// All properties use the same global expiry date
```

### After (Correct):
```
users/{userId}
  - subscription_expiry: "2025-06-20" (latest subscription)

properties/{propertyId_1}
  - created_at: "2025-01-20"
  - subscription_expiry: "2025-02-20" (1 month from creation)

properties/{propertyId_2}
  - created_at: "2025-02-15"
  - subscription_expiry: "2025-08-15" (6 months from creation)
  
// Each property has its own independent expiry date
```

## Benefits
1. ✅ Each property maintains its own subscription duration
2. ✅ Users can buy different packages for different properties
3. ✅ Accurate expiry dates per property
4. ✅ No confusion about which property expires when
5. ✅ Backward compatible (falls back to global expiry for old properties)

## Testing
To verify the fix:
1. Buy a 1-month subscription
2. Create Property A
3. Buy a 6-month subscription
4. Create Property B
5. Go to My Properties page
6. Property A should show ~1 month remaining
7. Property B should show ~6 months remaining

## Files Modified
- `src/pages/PostProperty.jsx` - Added subscription_expiry to property data
- `src/pages/MyProperties.jsx` - Updated to use property's own expiry date

## Status: FIXED ✅
Each property now correctly displays its own subscription timeline based on the package purchased at the time of property creation.
