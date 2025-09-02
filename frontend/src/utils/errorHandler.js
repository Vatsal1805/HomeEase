// Error handler utility
export const handleApiError = (error, context = '') => {
  console.error(`API Error in ${context}:`, error);
  
  if (error.response) {
    // Server responded with error status
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
    return error.response.data?.message || 'Server error occurred';
  } else if (error.request) {
    // Network error
    console.error('Network error:', error.request);
    return 'Network error - please check your connection';
  } else {
    // Other error
    console.error('Error message:', error.message);
    return error.message || 'An unexpected error occurred';
  }
};

// Log component mount/unmount for debugging
export const logComponentMount = (componentName) => {
  console.log(`✅ ${componentName} mounted`);
  return () => console.log(`❌ ${componentName} unmounted`);
};

// Validate required props
export const validateProps = (props, required, componentName) => {
  const missing = required.filter(prop => !props[prop]);
  if (missing.length > 0) {
    console.error(`❌ ${componentName} missing required props:`, missing);
    return false;
  }
  return true;
};
