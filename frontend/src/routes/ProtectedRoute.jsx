import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../pages/Authen/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // Chưa đăng nhập -> chuyển đến trang login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Không có quyền truy cập -> chuyển đến trang unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Có quyền truy cập -> render các route con
  return <Outlet />;
};

export default ProtectedRoute;