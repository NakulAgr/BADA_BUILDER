import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiHash, FiBriefcase, FiHome, FiUsers, FiCalendar, FiCamera, FiUpload } from 'react-icons/fi';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Placeholder data - will be replaced with actual Firebase data
  const userData = {
    name: userProfile?.name || 'John Doe',
    email: currentUser?.email || 'john.doe@example.com',
    phone: userProfile?.phone || '+91 9876543210',
    userId: currentUser?.uid?.substring(0, 8).toUpperCase() || 'USER1234',
    userType: userProfile?.userType || 'Individual',
    profilePhoto: userProfile?.profilePhoto || null
  };

  const activityItems = [
    {
      id: 1,
      title: 'Properties Uploaded',
      icon: <FiHome className="activity-icon" />,
      count: 0,
      path: '/my-properties',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Joined Live Groups',
      icon: <FiUsers className="activity-icon" />,
      count: 0,
      path: '/exhibition/live-grouping',
      color: 'purple'
    },
    {
      id: 3,
      title: 'Booked Site Visits',
      icon: <FiCalendar className="activity-icon" />,
      count: 0,
      path: '/my-bookings',
      color: 'green'
    }
  ];

  const handleActivityClick = (path) => {
    navigate(path);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadSuccess(false);

      // Create a reference to the storage location
      const storageRef = ref(storage, `profile_photos/${currentUser.uid}/${Date.now()}_${file.name}`);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const photoURL = await getDownloadURL(storageRef);

      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        profilePhoto: photoURL
      });

      // Refresh profile to get updated data
      await refreshProfile();

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Page Header */}
        <div className="profile-header">
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">View your account information and activity</p>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-content">
            {/* Profile Photo */}
            <div className="profile-photo-section">
              <div className="profile-photo-wrapper" onClick={handlePhotoClick}>
                {userData.profilePhoto ? (
                  <img 
                    src={userData.profilePhoto} 
                    alt="Profile" 
                    className="profile-photo"
                  />
                ) : (
                  <div className="profile-photo-placeholder">
                    <FiUser className="profile-photo-icon" />
                  </div>
                )}
                <div className="photo-overlay">
                  {uploading ? (
                    <div className="photo-uploading">
                      <div className="spinner"></div>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <FiCamera className="camera-icon" />
                      <span>Change Photo</span>
                    </>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              {uploadSuccess && (
                <div className="upload-success">
                  <FiUpload className="success-icon" />
                  Photo updated successfully!
                </div>
              )}
              <div className="profile-name-mobile">
                <h2>{userData.name}</h2>
                <span className={`user-type-badge ${userData.userType.toLowerCase()}`}>
                  {userData.userType}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="profile-details">
              <div className="profile-name-desktop">
                <h2>{userData.name}</h2>
                <span className={`user-type-badge ${userData.userType.toLowerCase()}`}>
                  {userData.userType}
                </span>
              </div>

              <div className="details-grid">
                {/* Email */}
                <div className="detail-item">
                  <div className="detail-icon-wrapper email">
                    <FiMail className="detail-icon" />
                  </div>
                  <div className="detail-content">
                    <p className="detail-label">Email Address</p>
                    <p className="detail-value">{userData.email}</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="detail-item">
                  <div className="detail-icon-wrapper phone">
                    <FiPhone className="detail-icon" />
                  </div>
                  <div className="detail-content">
                    <p className="detail-label">Phone Number</p>
                    <p className="detail-value">{userData.phone}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="detail-item">
                  <div className="detail-icon-wrapper userid">
                    <FiHash className="detail-icon" />
                  </div>
                  <div className="detail-content">
                    <p className="detail-label">User ID</p>
                    <p className="detail-value user-id">{userData.userId}</p>
                  </div>
                </div>

                {/* User Type */}
                <div className="detail-item">
                  <div className="detail-icon-wrapper usertype">
                    <FiBriefcase className="detail-icon" />
                  </div>
                  <div className="detail-content">
                    <p className="detail-label">Account Type</p>
                    <p className="detail-value">{userData.userType} Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="activity-section">
          <div className="activity-header">
            <h2 className="activity-title">Activity Overview</h2>
            <p className="activity-subtitle">Track your engagement and contributions</p>
          </div>
          
          <div className="activity-grid">
            {activityItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleActivityClick(item.path)}
                className={`activity-card ${item.color}`}
              >
                <div className="activity-icon-wrapper">
                  {item.icon}
                </div>
                <h3 className="activity-card-title">{item.title}</h3>
                <p className="activity-count">{item.count}</p>
                <div className="activity-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
