import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
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
  const { currentUser, isSubscribed, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Get userType from navigation state if available
  const locationState = window.history.state?.usr;
  const [userType, setUserType] = useState(locationState?.userType || null); // 'individual' or 'developer'
  const [selectedPropertyFlow, setSelectedPropertyFlow] = useState(null); // 'new' or 'existing'
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [existingProperties, setExistingProperties] = useState([]);
  const [fetchingProperties, setFetchingProperties] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null); // State to hold property being edited
  
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
    console.log('🔍 Checking authentication and subscription...');
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Current User:', currentUser);
    
    if (!isAuthenticated) {
      console.warn('⚠️ User not authenticated, redirecting to login');
      alert('Please login to post a property');
      navigate('/login');
      return;
    }

    // Only check subscription after user profile is loaded
    if (currentUser && !loading) {
      const subscribed = isSubscribed();
      console.log('Is Subscribed:', subscribed);
      
      if (!subscribed && selectedPropertyFlow === 'new') { // Only enforce subscription for new properties
        console.warn('⚠️ User not subscribed, redirecting to subscription plans');
        alert('Please subscribe to a plan to post properties');
        navigate('/subscription-plans');
      }
    }
  }, [isAuthenticated, isSubscribed, navigate, currentUser, loading, selectedPropertyFlow]);

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

  const isEditable = (createdAt) => {
    const creationDate = new Date(createdAt);
    const threeDaysLater = new Date(creationDate);
    threeDaysLater.setDate(creationDate.getDate() + 3);
    const now = new Date();
    return now < threeDaysLater;
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

      alert('Property updated successfully!');
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
    
    // Validate required fields
    const requiredFields = ['title', 'type', 'location', 'price', 'description'];
    const missingFields = requiredFields.filter(field => !formData[field]?.trim());
    
    if (missingFields.length > 0) {
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
    
    // Validate subscription for new properties
    if (selectedPropertyFlow === 'new' && !isSubscribed()) {
      console.warn('⚠️ User not subscribed');
      alert('Your subscription has expired. Please renew to post properties.');
      navigate('/subscription-plans');
      return;
    }

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

      // Only add BHK if applicable
      if (showBhkType && formData.bhk) {
        propertyData.bhk = formData.bhk;
      }

      // Add developer-specific fields if user is a developer
      if (userType === 'developer') {
        propertyData.company_name = formData.companyName || '';
        propertyData.project_name = formData.projectName || '';
        propertyData.total_units = formData.totalUnits || '';
        propertyData.completion_date = formData.completionDate || '';
        propertyData.rera_number = formData.reraNumber || '';
      }

      console.log('💾 Saving to Firestore...', propertyData);

      // Save document to Firestore
      await addDoc(collection(db, 'properties'), propertyData);

      console.log('✅ Property posted successfully!');
      
      setLoading(false);
      alert('Property posted successfully!');
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/');
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
                onClick={() => setSelectedPropertyFlow('new')}
              >
                <div className="card-icon">✨</div>
                <h3>Post New Property</h3>
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
                <h3>Manage Existing Properties</h3>
                <p>View, edit, or update your listed properties</p>
                <button type="button" className="select-type-btn">
                  Select
                </button>
              </motion.div>
            </div>
          </div>
        )}

        {/* Step 3 (New Property Flow): Payment Section */}
        {userType && selectedPropertyFlow === 'new' && !paymentSuccessful && !editingProperty && (
          <div className="payment-section">
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button 
                type="button" 
                className="change-type-btn"
                onClick={() => {setUserType(null); setSelectedPropertyFlow(null);}} // Reset both
              >
                Change User Type
              </button>
            </div>
            <div className="selected-flow-badge">
              <span>
                ✨ Post New Property
              </span>
              <button 
                type="button" 
                className="change-type-btn"
                onClick={() => setSelectedPropertyFlow(null)}
              >
                Change Flow
              </button>
            </div>
            <h2>Payment Required to Post New Property</h2>
            <p>Please complete the payment to proceed with posting your property. This is a placeholder for the actual payment gateway integration.</p>
            <button 
              className="submit-btn" 
              onClick={() => setPaymentSuccessful(true)}
            >
              Proceed to Property Form (Simulate Payment)
            </button>
          </div>
        )}

import PropertyForm from '../components/PropertyForm/PropertyForm'; // Import the new component

// ... existing code ...

        {/* Step 4 (New Property Flow): Property Creation Form */}
        {(userType && selectedPropertyFlow === 'new' && paymentSuccessful) || (editingProperty && selectedPropertyFlow === 'existing') ? (
          <>
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button 
                type="button" 
                className="change-type-btn"
                onClick={() => {setUserType(null); setSelectedPropertyFlow(null); setPaymentSuccessful(false); setEditingProperty(null);}} // Reset all
              >
                Change User Type
              </button>
            </div>
            <div className="selected-flow-badge">
              <span>
                {selectedPropertyFlow === 'new' ? '✨ Post New Property' : '📝 Editing Existing Property'}
              </span>
              <button 
                type="button" 
                className="change-type-btn"
                onClick={() => {setSelectedPropertyFlow(null); setPaymentSuccessful(false); setEditingProperty(null);}} // Reset flow and editing
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
                onClick={() => {setUserType(null); setSelectedPropertyFlow(null);}} // Reset both
              >
                Change User Type
              </button>
            </div>
            <div className="selected-flow-badge">
              <span>
                📝 Manage Existing Properties
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
                {existingProperties.map((property) => (
                  <motion.div 
                    key={property.id} 
                    className="property-card"
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
                      <p><strong>Posted On:</strong> {new Date(property.created_at).toLocaleDateString()}</p>
                      {isEditable(property.created_at) ? (
                        <button 
                          className="edit-property-btn" 
                          onClick={() => handleEditProperty(property)}
                        >
                          Edit Property
                        </button>
                      ) : (
                        <p className="edit-restriction-message">
                          Editing is allowed only within 3 days of posting this property.
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
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