// Token utility functions
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export const getTokenTimeRemaining = (token) => {
  if (!token) return 0;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeRemaining = payload.exp - currentTime;
    return Math.max(0, timeRemaining);
  } catch (error) {
    console.error('Error parsing token:', error);
    return 0;
  }
};

export const shouldRefreshToken = (token) => {
  const timeRemaining = getTokenTimeRemaining(token);
  // Refresh token nếu còn ít hơn 30 phút
  return timeRemaining < 1800 && timeRemaining > 0;
};
