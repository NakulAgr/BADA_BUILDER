import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
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
      
      if (!subscribed) {
        console.warn('⚠️ User not subscribed, redirecting to subscription plans');
        alert('Please subscribe to a plan to post properties');
        navigate('/subscription-plans');
      }
    }
  }, [isAuthenticated, isSubscribed, navigate, currentUser, loading]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    
    // Validate subscription
    if (!isSubscribed()) {
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
        <h1>Post Your Property</h1>
        <p className="subtitle">Fill in the details to list your property</p>

        {/* User Type Selection */}
        {!userType ? (
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
        ) : (
          <>
            <div className="selected-type-badge">
              <span>
                {userType === 'individual' ? '👤 Individual Owner' : '🏢 Developer'}
              </span>
              <button 
                type="button" 
                className="change-type-btn"
                onClick={() => setUserType(null)}
              >
                Change
              </button>
            </div>

            <form onSubmit={handleSubmit} className="property-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Property Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Luxury 3BHK Apartment"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Property Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="">Select type</option>
                <option value="Flat/Apartment">Flat/Apartment</option>
                <option value="Independent House/Villa">Independent House/Villa</option>
                <option value="Commercial Property">Commercial Property</option>
                <option value="Land">Land</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Vadodara, Gujarat"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price *</label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="e.g., 50 L - 75 L"
                required
              />
            </div>
          </div>

          {/* Developer Specific Fields */}
          {userType === 'developer' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g., ABC Developers"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="projectName">Project Name *</label>
                  <input
                    type="text"
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder="e.g., Green Valley Phase 2"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalUnits">Total Units</label>
                  <input
                    type="number"
                    id="totalUnits"
                    name="totalUnits"
                    value={formData.totalUnits}
                    onChange={handleChange}
                    placeholder="e.g., 120"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="completionDate">Expected Completion</label>
                  <input
                    type="month"
                    id="completionDate"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reraNumber">RERA Registration Number</label>
                <input
                  type="text"
                  id="reraNumber"
                  name="reraNumber"
                  value={formData.reraNumber}
                  onChange={handleChange}
                  placeholder="e.g., PR/GJ/VADODARA/..."
                />
              </div>
            </>
          )}

          <div className="form-row">
            {/* BHK Type - Only show for Flat/Apartment and Independent House/Villa */}
            {showBhkType && (
              <div className="form-group">
                <label htmlFor="bhk">BHK Type</label>
                <select
                  id="bhk"
                  name="bhk"
                  value={formData.bhk}
                  onChange={handleChange}
                >
                  <option value="">Select BHK type</option>
                  <option value="1 RK">1 RK</option>
                  <option value="1 BHK">1 BHK</option>
                  <option value="2 BHK">2 BHK</option>
                  <option value="3 BHK">3 BHK</option>
                  <option value="4 BHK">4 BHK</option>
                  <option value="5 BHK">5 BHK</option>
                  <option value="6+ BHK">6+ BHK</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="image">Property Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="facilities">Facilities (comma-separated)</label>
            <input
              type="text"
              id="facilities"
              name="facilities"
              value={formData.facilities}
              onChange={handleChange}
              placeholder="e.g., Swimming Pool, Gym, Parking"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property..."
              rows="5"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="spinner"></span>
                Posting Property...
              </span>
            ) : (
              'Post Property'
            )}
          </button>
        </form>
        
        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="spinner-large"></div>
              <h3>Posting Your Property...</h3>
              <p>Please wait while we save your property details</p>
            </div>
          </div>
        )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PostProperty;