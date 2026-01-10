import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // No need for separate fetchUserProfile with onSnapshot
  // We keep it for manual refresh if strictly needed, but onSnapshot handles it auto.
  const fetchUserProfile = useCallback(async (uid) => {
    // Legacy support or manual force if needed, but onSnapshot does the work.
    // We can just keep it as a no-op or simple getter if needed by other components.
    if (!uid) return null;
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) return userDoc.data();
      return null;
    } catch (e) { console.error(e); return null; }
  }, []);

  useEffect(() => {
    let profileUnsubscribe;

    const authUnsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        setProfileLoading(true);
        // Real-time listener for user profile
        profileUnsubscribe = onSnapshot(doc(db, 'users', user.uid),
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const data = docSnapshot.data();
              console.log("👤 User Profile Updated:", data); // Debug log
              setUserProfile(data);
            } else {
              console.log("⚠️ No User Profile Found");
              setUserProfile(null);
            }
            setProfileLoading(false);
          },
          (error) => {
            console.error("❌ Error listening to profile:", error);
            setUserProfile(null);
            setProfileLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        if (profileUnsubscribe) {
          profileUnsubscribe();
          profileUnsubscribe = null;
        }
      }

      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

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