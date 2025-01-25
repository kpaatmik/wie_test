import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

function PrivateRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const currentPath = location.pathname;
  const isVerifyIdPage = currentPath === '/verify-id';

  // Handle verification status
  if (!user.is_verified && !isVerifyIdPage) {
    return <Navigate to="/verify-id" replace />;
  }

  // Handle verified users trying to access verify-id page
  if (user.is_verified && isVerifyIdPage) {
    const dashboardPath = 
      user.user_type === 'pregnant' ? '/pregnant/dashboard' :
      user.user_type === 'caregiver' ? '/caregiver/dashboard' :
      '/';
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}

export default PrivateRoute;
