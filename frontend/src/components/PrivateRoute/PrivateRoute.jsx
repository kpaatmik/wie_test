import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  return user ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
