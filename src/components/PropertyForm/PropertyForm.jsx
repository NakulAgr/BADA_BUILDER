import React from 'react';
import { motion } from 'framer-motion';
import './PropertyForm.css'; // Import the CSS file

const PropertyForm = ({
  formData,
  handleChange,
  handleImageChange,
  imagePreview,
  handleSubmit,
  loading,
  userType,
  showBhkType,
  editingProperty,
  disabled
}) => {
  return (
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

      <button type="submit" className="submit-btn" disabled={loading || disabled}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="spinner"></span>
            {editingProperty ? 'Updating Property...' : 'Posting Property...'}
          </span>
        ) : (
          editingProperty ? 'Update Property' : 'Post Property'
        )}
      </button>
    </form>
  );
};

export default PropertyForm;
