// Authentication optimization utilities

export const authOptimizations = {
  // Preload critical auth resources
  preloadAuthResources: () => {
    // Preload Firebase auth scripts if not already loaded
    if (typeof window !== 'undefined' && !window.__firebaseAuthPreloaded) {
      window.__firebaseAuthPreloaded = true;
      
      // Warm up the auth connection
      import('../firebase').then(({ auth }) => {
        // Trigger auth state check early
        auth.onAuthStateChanged(() => {}, () => {});
      });
    }
  },

  // Debounce auth state changes to prevent rapid updates
  debounceAuthState: (callback, delay = 100) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback.apply(null, args), delay);
    };
  },

  // Cache auth tokens for faster subsequent requests
  cacheAuthToken: () => {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      try {
        // Firebase handles token caching automatically, but we can optimize it
        const authCache = localStorage.getItem('firebase:authUser:' + 
          'AIzaSyAruIz1wMmd6JXT3DAWVRym7N3vxPWo94A:[DEFAULT]');
        return authCache ? JSON.parse(authCache) : null;
      } catch (error) {
        console.warn('Auth cache read failed:', error);
        return null;
      }
    }
    return null;
  },

  // Optimize form submission to prevent double submissions
  preventDoubleSubmission: (submitFunction, cooldownMs = 1000) => {
    let lastSubmission = 0;
    
    return async (...args) => {
      const now = Date.now();
      if (now - lastSubmission < cooldownMs) {
        console.warn('Submission blocked - too frequent');
        return;
      }
      
      lastSubmission = now;
      return await submitFunction(...args);
    };
  },

  // Batch profile updates to reduce Firestore calls
  batchProfileUpdates: (() => {
    let updateQueue = [];
    let batchTimeout;
    
    return (userId, updates) => {
      updateQueue.push({ userId, updates });
      
      clearTimeout(batchTimeout);
      batchTimeout = setTimeout(async () => {
        if (updateQueue.length === 0) return;
        
        try {
          const { doc, updateDoc } = await import('firebase/firestore');
          const { db } = await import('../firebase');
          
          // Process all queued updates
          const promises = updateQueue.map(({ userId, updates }) => 
            updateDoc(doc(db, 'users', userId), updates)
          );
          
          await Promise.all(promises);
          updateQueue = [];
        } catch (error) {
          console.error('Batch profile update failed:', error);
          updateQueue = [];
        }
      }, 500);
    };
  })()
};

// Initialize optimizations on module load
if (typeof window !== 'undefined') {
  authOptimizations.preloadAuthResources();
}