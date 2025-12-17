import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Cache for user profiles to avoid unnecessary fetches
const profileCache = new Map();

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Optimized profile fetcher with caching
  const fetchUserProfile = useCallback(async (uid) => {
    if (!uid) return null;
    
    // Check cache first
    if (profileCache.has(uid)) {
      const cachedProfile = profileCache.get(uid);
      setUserProfile(cachedProfile);
      return cachedProfile;
    }
    
    try {
      setProfileLoading(true);
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        // Cache the profile
        profileCache.set(uid, profileData);
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
    let profileFetchTimeout;
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if we have cached profile first
        if (profileCache.has(user.uid)) {
          const cachedProfile = profileCache.get(user.uid);
          setUserProfile(cachedProfile);
        } else {
          // Fetch profile asynchronously without blocking auth state
          profileFetchTimeout = setTimeout(() => {
            fetchUserProfile(user.uid);
          }, 100); // Small delay to prioritize auth state update
        }
      } else {
        setUserProfile(null);
        // Clear any pending profile fetch
        if (profileFetchTimeout) {
          clearTimeout(profileFetchTimeout);
        }
      }
      
      // Set loading to false immediately after auth state is determined
      if (!authInitialized) {
        setAuthInitialized(true);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
    };
  }, [fetchUserProfile, authInitialized]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      // Clear profile cache on logout
      profileCache.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const isSubscribed = useCallback(() => {
    if (!userProfile) return false;
    if (!userProfile.is_subscribed) return false;
    
    // Check if subscription is still valid
    if (userProfile.subscription_expiry) {
      const expiryDate = new Date(userProfile.subscription_expiry);
      return expiryDate > new Date();
    }
    
    return false;
  }, [userProfile]);

  const refreshProfile = useCallback(() => {
    if (currentUser) {
      // Clear cache for this user and refetch
      profileCache.delete(currentUser.uid);
      return fetchUserProfile(currentUser.uid);
    }
    return Promise.resolve(null);
  }, [currentUser, fetchUserProfile]);

  const value = {
    currentUser,
    userProfile,
    loading,
    profileLoading,
    logout,
    isSubscribed: isSubscribed(),
    isAuthenticated: !!currentUser,
    refreshProfile,
    userData: userProfile // Alias for backward compatibility
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};