import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Memoized function to fetch user profile
  const fetchUserProfile = useCallback(async (uid) => {
    if (!uid) return null;
    
    try {
      setProfileLoading(true);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        return profileData;
      } else {
        setUserProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Only fetch profile if we don't have it or if it's a different user
        if (!userProfile || userProfile.email !== user.email) {
          // Fetch profile in background - don't block auth state
          fetchUserProfile(user.uid);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserProfile, userProfile]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const isSubscribed = useCallback(() => {
    console.log('🔍 Checking subscription status...');
    console.log('User Profile:', userProfile);
    
    if (!userProfile) {
      console.log('❌ No user profile found');
      return false;
    }
    
    if (!userProfile.is_subscribed) {
      console.log('❌ User is not subscribed');
      return false;
    }
    
    // Check if subscription is still valid
    if (userProfile.subscription_expiry) {
      const expiryDate = new Date(userProfile.subscription_expiry);
      const isValid = expiryDate > new Date();
      console.log('📅 Subscription expiry:', userProfile.subscription_expiry);
      console.log('📅 Is valid:', isValid);
      return isValid;
    }
    
    // If no expiry date, assume it's valid (lifetime subscription)
    console.log('✅ No expiry date, assuming valid subscription');
    return true;
  }, [userProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    logout,
    isSubscribed,
    isAuthenticated: !!currentUser,
    refreshProfile: () => currentUser && fetchUserProfile(currentUser.uid)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};