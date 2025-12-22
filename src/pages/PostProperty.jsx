import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc, increment, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import PropertyForm from '../components/PropertyForm/PropertyForm';
import SubscriptionGuard from '../components/SubscriptionGuard/SubscriptionGuard';
import SubscriptionService from '../services/subscriptionService';
import { formatDate } from '../utils/dateFormatter';
import './PostProperty.css';

// --- Cloudinary Configuration ---
const CLOUDINARY_CLOUD_NAME = "dooamkdih";
const CLOUDINARY_UPLOAD_PRESET = "property_images";

/**
 * Uploads an image file to Cloudinary using an unsigned preset.
 * @param {File} file The image file to upload.
 * @returns {Promise<string>} A promise that resolves to the secure URL of the uploaded image.
 */
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Cloudinary upload failed: ${errorData.error.message}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};


const PostProperty = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Get userType from navigation state or location state
  const locationState = location.state || window.history.state?.usr;
  const [userType, setUserType] = useState(locationState?.userType || null);
  const [selectedPropertyFlow, setSelectedPropertyFlow] = useState(null);
  const [existingProperties, setExistingProperties] = useState([]);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [subscriptionVerified, setSubscriptionVerified] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [developerCredits, setDeveloperCredits] = useState(null); // Add developer credits state
  const [timerRefresh, setTimerRefresh] = useState(0); // For refreshing timers

  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    price: '',
    bhk: '',
    description: '',
    facilities: '',
    // Developer specific fields
    companyName: '',
    projectName: '',
    totalUnits: '',
    completionDate: '',
    reraNumber: ''
  });

  useEffect(() => {
    console.log('🔍 Checking authentication...');
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Current User:', currentUser);

    if (!isAuthenticated) {
      console.warn('⚠️ User not authenticated, redirecting to login');
      alert('Please login to post a property');
      navigate('/login');
      return;
    }

    // Note: Subscription check is now handled only when user clicks "Create New Property"
  }, [isAuthenticated, navigate, currentUser]);

  // Effect to fetch developer credits
  useEffect(() => {
    if (userType === 'developer' && currentUser?.uid) {
      const userDocRef = doc(db, 'users', currentUser.uid);

      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot && typeof onSnapshot === 'function' ? onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setDeveloperCredits(userData.property_credits || 0);
        }
      }) : null;

      // Fallback if onSnapshot is not imported (though it should be added to imports)
      if (!unsubscribe) {
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setDeveloperCredits(userData.property_credits || 0);
          }
        });
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [userType, currentUser]);

  // Effect to fetch existing properties
  useEffect(() => {
    const fetchExistingProperties = async () => {
      if (selectedPropertyFlow === 'existing' && currentUser?.uid) {
        setFetchingProperties(true);
        try {
          const propertiesRef = collection(db, 'properties');
          const q = query(propertiesRef, where('user_id', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const propertiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setExistingProperties(propertiesData);
        } catch (error) {
          console.error("Error fetching existing properties:", error);
          alert("Failed to fetch your properties. Please try again.");
        } finally {
          setFetchingProperties(false);
        }
      }
    };

    fetchExistingProperties();
  }, [selectedPropertyFlow, currentUser]);

  // Effect to refresh timer display every minute
  useEffect(() => {
    if (selectedPropertyFlow === 'existing' && existingProperties.length > 0) {
      const interval = setInterval(() => {
        setTimerRefresh(prev => prev + 1);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [selectedPropertyFlow, existingProperties]);

  const handleCreateNewProperty = async () => {
    console.log('🔍 User wants to create new property...');

    if (userType === "developer") {
      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const credits = userData.property_credits || 0;

          // Also check for active status just in case
          // const isActive = userData.subscription_status === 'active' || userData.plan_status === 'active';

          if (credits <= 0) {
            alert('You do not have enough credits to post a property. Please purchase a developer subscription plan.');
            navigate('/developer-plan');
            return;
          }
        } else {
          alert('User profile not found. Please contact support.');
          return;
        }
      } catch (error) {
        console.error('Error verifying developer credits:', error);
        alert('Failed to verify subscription. Please try again.');
        return;
      } finally {
        setLoading(false);
      }
    }

    // Always proceed to the property creation flow
    // SubscriptionGuard will handle subscription verification for individual users
    console.log('✅ Proceeding to property creation flow');
    setSelectedPropertyFlow('new');
  };

  const handleSubscriptionVerified = (subscription) => {
    console.log('✅ Subscription verified:', subscription);
    setSubscriptionVerified(true);
    setCurrentSubscription(subscription);
  };

  const isEditable = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();
    return now < threeDaysLater;
  };

  const getTimeRemaining = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();

    const diffMs = threeDaysLater - now;

    if (diffMs <= 0) {
      return { expired: true, text: 'Edit period expired' };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return {
        expired: false,
        text: `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours}h remaining`,
        urgent: diffDays === 0
      };
    } else if (diffHours > 0) {
      return {
        expired: false,
        text: `${diffHours}h ${diffMinutes}m remaining`,
        urgent: true
      };
    } else {
      return {
        expired: false,
        text: `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} remaining`,
        urgent: true
      };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If property type changes, reset BHK if not applicable
    if (name === 'type') {
      const newFormData = { ...formData, [name]: value };
      // Reset BHK if property type doesn't support it
      if (!['Flat/Apartment', 'Independent House/Villa'].includes(value)) {
        newFormData.bhk = '';
      }
      setFormData(newFormData);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Check if BHK type should be shown
  const showBhkType = ['Flat/Apartment', 'Independent House/Villa'].includes(formData.type);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditProperty = (property) => {
    // Double-check if property is still editable
    if (!isEditable(property.created_at)) {
      alert('⏰ Edit period has expired!\n\nThis property was posted more than 3 days ago and can no longer be edited.');
      return;
    }

    setEditingProperty(property);
    // Populate form with property data for editing
    setFormData({
      title: property.title || '',
      type: property.type || '',
      location: property.location || '',
      price: property.price || '',
      bhk: property.bhk || '',
      description: property.description || '',
      facilities: property.facilities ? property.facilities.join(', ') : '',
      companyName: property.company_name || '',
      projectName: property.project_name || '',
      totalUnits: property.total_units || '',
      completionDate: property.completion_date || '',
      reraNumber: property.rera_number || ''
    });
    setImagePreview(property.image_url || '');
    // Scroll to the form or open a modal for editing
  };

  const handleUpdateProperty = async (e) => {
    e.preventDefault();
    if (!editingProperty) return;

    // Validate edit period before allowing update
    if (!isEditable(editingProperty.created_at)) {
      alert('⏰ Edit period has expired!\n\nThis property was posted more than 3 days ago and can no longer be edited.\n\nPlease refresh the page.');
      setLoading(false);
      // Reset editing state
      setEditingProperty(null);
      setSelectedPropertyFlow(null);
      return;
    }

    setLoading(true);

    try {
      let imageUrl = formData.image_url || ''; // Use existing image URL

      // Check if a new image file is selected
      if (imageFile) {
        console.log('📸 Uploading new image to Cloudinary...');
        imageUrl = await uploadToCloudinary(imageFile);
        console.log('✅ New image uploaded successfully:', imageUrl);
      }

      const propertyData = {
        title: formData.title,
        type: formData.type,
        location: formData.location,
        price: formData.price,
        description: formData.description,
        facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()).filter(f => f) : [],
        image_url: imageUrl,
        user_type: userType, // Keep user type
        // created_at should not change
        status: 'active'
      };

      if (showBhkType && formData.bhk) {
        propertyData.bhk = formData.bhk;
      } else {
        propertyData.bhk = ''; // Clear BHK if property type no longer supports it
      }

      if (userType === 'developer') {
        propertyData.company_name = formData.companyName || '';
        propertyData.project_name = formData.projectName || '';
        propertyData.total_units = formData.totalUnits || '';
        propertyData.completion_date = formData.completionDate || '';
        propertyData.rera_number = formData.reraNumber || '';
      } else {
        // Clear developer specific fields if user type changed from developer
        propertyData.company_name = '';
        propertyData.project_name = '';
        propertyData.total_units = '';
        propertyData.completion_date = '';
        propertyData.rera_number = '';
      }

      const propertyRef = doc(db, 'properties', editingProperty.id);
      await updateDoc(propertyRef, propertyData);

      alert(`Property updated successfully! You can view it in the ${userType === 'developer' ? 'Developer' : 'Individual'} Exhibition.`);
      setLoading(false);
      setEditingProperty(null); // Exit editing mode
      setFormData({ // Reset form data
        title: '', type: '', location: '', price: '', bhk: '', description: '', facilities: '',
        companyName: '', projectName: '', totalUnits: '', completionDate: '', reraNumber: ''
      });
      setImageFile(null);
      setImagePreview('');

      // Re-fetch properties to show updated list
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, where('user_id', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const updatedPropertiesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExistingProperties(updatedPropertiesData);

      // Navigate to exhibition page after a delay
      setTimeout(() => {
        if (userType === 'developer') {
          navigate('/exhibition/developer');
        } else {
          navigate('/exhibition/individual');
        }
      }, 1500);

    } catch (error) {
      console.error("Error updating property:", error);
      alert("Failed to update property. " + (error.message.includes('Cloudinary') ? 'Image upload failed.' : ''));
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If we are editing, call update function
    if (editingProperty) {
      handleUpdateProperty(e);
      return;
    }

    console.log('🚀 Starting property submission...');
    console.log('Current User:', currentUser);
    console.log('User Type:', userType);
    console.log('Form Data:', formData);
    console.log('Selected Property Flow:', selectedPropertyFlow);

    // Validate required fields
    const requiredFields = ['title', 'type', 'location', 'price', 'description'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Validate developer fields if user is developer
    if (userType === 'developer') {
      const developerRequiredFields = ['companyName', 'projectName'];
      const missingDeveloperFields = developerRequiredFields.filter(field => !formData[field]?.trim());

      if (missingDeveloperFields.length > 0) {
        alert(`Please fill in required developer fields: ${missingDeveloperFields.join(', ')}`);
        return;
      }
    }

    // Note: Subscription validation is now handled by SubscriptionGuard component
    // No need to check subscription here as the form is only accessible after verification

    setLoading(true);

    try {
      let imageUrl = '';

      // Upload image to Cloudinary if a file is selected
      if (imageFile) {
        console.log('📸 Uploading image to Cloudinary...');
        imageUrl = await uploadToCloudinary(imageFile);
        console.log('✅ Image uploaded successfully:', imageUrl);
      }

      // Prepare property data for Firestore
      const propertyData = {
        title: formData.title,
        type: formData.type,
        location: formData.location,
        price: formData.price,
        description: formData.description,
        facilities: formData.facilities ? formData.facilities.split(',').map(f => f.trim()).filter(f => f) : [],
        image_url: imageUrl, // Save the Cloudinary URL
        user_id: currentUser.uid,
        user_type: userType,
        created_at: new Date().toISOString(),
        status: 'active'
      };

      // Fetch user's current subscription expiry and add to property
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.subscription_expiry) {
            propertyData.subscription_expiry = userData.subscription_expiry;
            console.log('📅 Property subscription expiry set to:', userData.subscription_expiry);
          }
        }
      } catch (error) {
        console.error('Error fetching user subscription:', error);
      }

      // Only add BHK if applicable
      if (showBhkType && formData.bhk) {
        propertyData.bhk = formData.bhk;
      }

      if (userType === 'developer') {
        propertyData.company_name = formData.companyName || '';
        propertyData.project_name = formData.projectName || '';
        propertyData.total_units = formData.totalUnits || '';
        propertyData.completion_date = formData.completionDate || '';
        propertyData.rera_number = formData.reraNumber || '';

        // Developer Property Logic: 12 months validity
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        propertyData.expiry_date = expiryDate.toISOString();
      }

      console.log('💾 Saving to Firestore...', propertyData);

      // Save document to Firestore
      const docRef = await addDoc(collection(db, 'properties'), propertyData);
      const propertyId = docRef.id;

      console.log('✅ Property posted successfully with ID:', propertyId);

      // Trigger user notification (non-blocking)
      fetch('/api/notify-property-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...propertyData,
          user_email: currentUser.email
        })
      }).catch(err => console.error('Failed to send property notification:', err));

      // Handle post-creation updates (Credits/Subscription)
      if (userType === 'developer') {
        console.log('📉 Deducting developer credit...');
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          property_credits: increment(-1)
        });
        console.log('✅ Credit deducted');
      } else if (userType === 'individual' && currentUser?.uid) {
        // For individual users, mark subscription as used
        console.log('📝 Marking subscription as used...');
        const subscriptionMarked = await SubscriptionService.markSubscriptionUsed(
          currentUser.uid,
          propertyId
        );

        if (subscriptionMarked) {
          console.log('✅ Subscription marked as used successfully');
        } else {
          console.warn('⚠️ Failed to mark subscription as used, but property was posted');
        }
      }

      setLoading(false);
      // alert(`Property posted successfully! You can now view it in the ${userType === 'developer' ? 'Developer' : 'Individual'} Exhibition.`);

      // Navigate to the appropriate exhibition page based on user type
      setTimeout(() => {
        if (userType === 'developer') {
          navigate('/exhibition/developer');
        } else {
          navigate('/exhibition/individual');
        }
      }, 500);

    } catch (error) {
      console.error('❌ Error posting property:', error);

      setLoading(false);

      let errorMessage = 'Failed to post property. ';
      if (error.message.includes('Cloudinary')) {
        errorMessage += 'The image upload failed. Please try again or use a different image.';
      } else {
        errorMessage += 'Please check your connection and try again.';
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="post-property-page">
      <motion.div
        className="post-property-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1>{editingProperty ? 'Edit Property' : 'Post Your Property'}</h1>
        <p className="subtitle">{editingProperty ? 'Modify the details of your property' : 'Fill in the details to list your property'}</p>

        {/* Step 1: User Type Selection */}
        {!userType && (
          <div className="user-type-selection">
            <h2>I am a...</h2>
            <div className="user-type-cards">
              <motion.div
                className="user-type-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setUserType('individual')}
              >
                <div className="card-icon">👤</div>
                <h3>Individual Owner</h3>
                <p>Selling or renting your own property</p>
                <ul className="card-features">
                  <li>✓ Direct listing</li>
                  <li>✓ No commission</li>
                  <li>✓ Quick posting</li>
                </ul>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>

              <motion.div
                className="user-type-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setUserType('developer')}
              >
                <div className="card-icon">🏢</div>
                <h3>Developer / Builder</h3>
                <p>Listing projects or multiple units</p>
                <ul className="card-features">
                  <li>✓ Project listing</li>
                  <li>✓ Multiple units</li>
                  <li>✓ RERA verified</li>
                </ul>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Step 2: Property Flow Selection (New or Existing) */}
        {userType && !selectedPropertyFlow && (
          <div className="property-flow-selection">
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => setUserType(null)}
              >
                Change User Type
              </button>
            </div>
            <h2>What would you like to do?</h2>
            <div className="property-flow-cards">
              <motion.div
                className="property-flow-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={handleCreateNewProperty}
              >
                <div className="card-icon">✨</div>
                <h3>Create New Property</h3>
                <p>List a brand new property or project</p>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>

              <motion.div
                className="property-flow-card"
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => setSelectedPropertyFlow('existing')}
              >
                <div className="card-icon">📝</div>
                <h3>Existing Property</h3>
                <p>View, edit, or update your listed properties</p>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Step 3: Property Creation Form */}
        {(userType && selectedPropertyFlow === 'new') || (editingProperty && selectedPropertyFlow === 'existing') ? (
          <>
            {/* For Individual users creating new properties, enforce subscription */}
            {userType === 'individual' && selectedPropertyFlow === 'new' && !editingProperty ? (
              <SubscriptionGuard
                userType={userType}
                action="post a property"
                onSubscriptionVerified={handleSubscriptionVerified}
              >
                <div className="selected-type-badge">
                  <span>👤 Individual Owner</span>
                  <button
                    type="button"
                    className="change-type-btn"
                    onClick={() => { setUserType(null); setSelectedPropertyFlow(null); setEditingProperty(null); }}
                  >
                    Change User Type
                  </button>
                </div>
                <div className="selected-flow-badge">
                  <span>✨ Create New Property</span>
                  <button
                    type="button"
                    className="change-type-btn"
                    onClick={() => { setSelectedPropertyFlow(null); setEditingProperty(null); }}
                  >
                    Change Flow
                  </button>
                </div>
                <p className="subtitle">Fill in the details to list your property</p>
                <PropertyForm
                  formData={formData}
                  handleChange={handleChange}
                  handleImageChange={handleImageChange}
                  imagePreview={imagePreview}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  userType={userType}
                  showBhkType={showBhkType}
                  editingProperty={editingProperty}
                />
              </SubscriptionGuard>
            ) : (
              <>
                <div className="selected-type-badge">
                  <span>
                    {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
                  </span>
                  <button
                    type="button"
                    className="change-type-btn"
                    onClick={() => { setUserType(null); setSelectedPropertyFlow(null); setEditingProperty(null); }}
                  >
                    Change User Type
                  </button>
                </div>
                <div className="selected-flow-badge">
                  <span>
                    {selectedPropertyFlow === 'new' ? '✨ Create New Property' : '📝 Editing Existing Property'}
                  </span>
                  <button
                    type="button"
                    className="change-type-btn"
                    onClick={() => { setSelectedPropertyFlow(null); setEditingProperty(null); }}
                  >
                    Change Flow
                  </button>
                </div>
                <p className="subtitle">Fill in the details to list your property</p>

                {/* Developer Credit Display */}
                {userType === 'developer' && developerCredits !== null && (
                  <div style={{
                    background: developerCredits > 0 ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${developerCredits > 0 ? '#86efac' : '#fecaca'}`,
                    color: developerCredits > 0 ? '#166534' : '#991b1b',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.2em' }}>🏢</span>
                    {developerCredits > 0 ? (
                      <span>You have <strong>{developerCredits}</strong> out of <strong>20</strong> properties remaining</span>
                    ) : (
                      <span>You have reached your posting limit. <a href="#" style={{ textDecoration: 'underline', color: 'inherit', fontWeight: 'bold' }} onClick={(e) => { e.preventDefault(); navigate('/developer-plan'); }}>Purchase plan to continue</a></span>
                    )}
                  </div>
                )}

                <PropertyForm
                  formData={formData}
                  handleChange={handleChange}
                  handleImageChange={handleImageChange}
                  imagePreview={imagePreview}
                  handleSubmit={handleSubmit}
                  loading={loading}
                  userType={userType}
                  showBhkType={showBhkType}
                  editingProperty={editingProperty}
                  disabled={userType === 'developer' && developerCredits !== null && developerCredits <= 0}
                />
              </>
            )}

            {/* Loading Overlay */}
            {loading && (
              <div className="loading-overlay">
                <div className="loading-content">
                  <div className="spinner-large"></div>
                  <h3>{editingProperty ? 'Updating Your Property...' : 'Posting Your Property...'}</h3>
                  <p>Please wait while we save your property details</p>
                </div>
              </div>
            )}
          </>
        ) : null}

        {/* Step 3 (Existing Property Flow): Display Existing Properties */}
        {userType && selectedPropertyFlow === 'existing' && !editingProperty && (
          <>
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => { setUserType(null); setSelectedPropertyFlow(null); }} // Reset both
              >
                Change User Type
              </button>
            </div>
            <div className="selected-flow-badge">
              <span>
                📝 Existing Property
              </span>
              <button
                type="button"
                className="change-type-btn"
                onClick={() => setSelectedPropertyFlow(null)}
              >
                Change Flow
              </button>
            </div>
            <h2>Your Existing Properties</h2>
            {fetchingProperties ? (
              <p>Loading your properties...</p>
            ) : existingProperties.length > 0 ? (
              <div className="existing-properties-list">
                {existingProperties.map((property) => {
                  const timeRemaining = getTimeRemaining(property.created_at);
                  const editable = isEditable(property.created_at);
                  return (
                    <motion.div
                      key={property.id}
                      className={`property-card ${!editable ? 'expired-property' : ''}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {property.image_url && <img src={property.image_url} alt={property.title} className="property-card-image" />}
                      <div className="property-card-details">
                        <h3>{property.title}</h3>
                        <p><strong>Type:</strong> {property.type}</p>
                        <p><strong>Location:</strong> {property.location}</p>
                        <p><strong>Price:</strong> {property.price}</p>
                        <p><strong>Posted On:</strong> {formatDate(property.created_at)}</p>

                        {/* Time Remaining Display */}
                        <div className={`edit-timer ${timeRemaining.expired ? 'expired' : timeRemaining.urgent ? 'urgent' : 'active'}`}>
                          <span className="timer-icon">⏱️</span>
                          <span className="timer-text">{timeRemaining.text}</span>
                        </div>

                        {editable ? (
                          <button
                            className="edit-property-btn"
                            onClick={() => handleEditProperty(property)}
                          >
                            ✏️ Edit Property
                          </button>
                        ) : (
                          <div className="edit-locked-section">
                            <p className="edit-restriction-message">
                              🔒 Editing Locked
                            </p>
                            <p className="edit-restriction-detail">
                              This property can no longer be edited as the 3-day edit window has expired.
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <p>You have not posted any properties yet.</p>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PostProperty;