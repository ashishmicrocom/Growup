// Get the base URL for the API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:7777/api';

// Extract the backend base URL (without /api)
export const getBackendUrl = () => {
  return API_BASE_URL.replace('/api', '');
};

// Helper to get the full image URL
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Otherwise, prepend the backend URL
  return `${getBackendUrl()}${path}`;
};
