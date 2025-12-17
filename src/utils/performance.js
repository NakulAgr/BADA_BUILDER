// Performance monitoring utilities for auth operations

export const performanceMonitor = {
  // Track auth operation timing
  trackAuthOperation: (operationType, startTime) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`🚀 ${operationType} completed in ${duration.toFixed(2)}ms`);
    
    // Log performance warnings
    if (duration > 3000) {
      console.warn(`⚠️ ${operationType} took longer than expected (${duration.toFixed(2)}ms)`);
    } else if (duration < 1000) {
      console.log(`✅ ${operationType} completed quickly (${duration.toFixed(2)}ms)`);
    }
    
    return duration;
  },

  // Track network requests
  trackNetworkRequest: async (requestName, requestPromise) => {
    const startTime = performance.now();
    
    try {
      const result = await requestPromise;
      performanceMonitor.trackAuthOperation(requestName, startTime);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ ${requestName} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  },

  // Enhanced retry mechanism for failed operations
  retryOperation: async (operation, maxRetries = 2, delay = 500) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Don't retry certain errors
        if (error.code === 'auth/invalid-credential' || 
            error.code === 'auth/user-not-found' ||
            error.code === 'auth/wrong-password' ||
            error.code === 'auth/email-already-in-use') {
          throw error;
        }
        
        if (attempt <= maxRetries) {
          console.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms for:`, error.code || error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 1.2; // Moderate exponential backoff
        }
      }
    }
    
    throw lastError;
  },

  // Optimize network requests with timeout
  timeoutPromise: (promise, timeoutMs = 10000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
      )
    ]);
  },

  // Batch multiple operations to reduce overhead
  batchOperations: async (operations, batchSize = 3) => {
    const results = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(batch.map(op => op()));
      results.push(...batchResults);
    }
    
    return results;
  }
};