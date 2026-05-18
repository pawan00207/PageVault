import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../store/hooks';
import verifyAuth from '../utils/verifyAuth.util';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hydrateAuth = async () => {
      if (!isAuthenticated)
        await verifyAuth();
      setIsLoading(false);
    };
    hydrateAuth();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
