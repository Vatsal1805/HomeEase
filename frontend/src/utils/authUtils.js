// Utility to clean up invalid tokens and reset auth state
export const cleanupAuthState = () => {
  const token = localStorage.getItem('homeease_token');
  
  if (token) {
    // Basic JWT format validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('Invalid token format detected, clearing auth state');
      localStorage.removeItem('homeease_token');
      return false;
    }
    
    // Check if token is expired or malformed by trying to decode
    try {
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('Token expired, clearing auth state');
        localStorage.removeItem('homeease_token');
        return false;
      }
      
      return true; // Token appears valid
    } catch (error) {
      console.log('Token decode failed, clearing auth state:', error);
      localStorage.removeItem('homeease_token');
      return false;
    }
  }
  
  return false; // No token
};

// Force logout and clear all auth data
export const forceLogout = () => {
  localStorage.removeItem('homeease_token');
  localStorage.removeItem('user');
  delete window.axios?.defaults?.headers?.common?.['Authorization'];
  
  // Reload page to reset app state
  window.location.href = '/login';
};
