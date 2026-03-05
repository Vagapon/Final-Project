/**
 * Get the API base URL from environment variables
 * @returns {string} API base URL (e.g., https://premier-league-backend-58mr.onrender.com/api)
 */
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

/**
 * Get the API base URL without /api suffix (for socket.io)
 * @returns {string} API base URL without /api (e.g., https://premier-league-backend-58mr.onrender.com)
 */
export const getSocketUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace('/api', '') || 'http://localhost:5000';
};
