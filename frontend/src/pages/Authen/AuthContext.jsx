import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation, replace } from 'react-router-dom';
import axios from 'axios';
import { use } from 'react';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
const location = useLocation();
  // Kiểm tra localStorage khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          }); 
          setUser(response.data);
        }
          catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
};
checkAuth();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);

    // Cập nhật redirect logic cho STAFF
    let redirectTo = '/';
    if (userData.role === 'ADMIN') {
      redirectTo = '/admin';
    } else if (userData.role === 'STAFF') {
      redirectTo = '/staff';
    }
    
    navigate(redirectTo, { replace: true });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };
useEffect(() => {
    if (user && location.pathname === '/login') {
        // Cập nhật redirect logic cho STAFF
        let redirectTo = '/';
        if (user.role === 'ADMIN') {
          redirectTo = '/admin';
        } else if (user.role === 'STAFF') {
          redirectTo = '/staff';
        }
        
        navigate(redirectTo, { replace: true });
    }
    }, [user, location, navigate]);
if(loading) {
    return <div>Loading...</div>; // Hoặc có thể hiển thị một spinner
}
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};