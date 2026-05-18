import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/hooks';
import { useEffect, useState } from 'react';
import verifyAuth from '../utils/verifyAuth.util';

const PublicOnlyRoute = () => {
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

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    if (role === 'buyer') {
      return <Navigate to="/buyer/dashboard" replace />;
    } else if (role === 'publisher') {
      return <Navigate to="/publisher/dashboard" replace />;
    } else if (role === 'manager') {
      return <Navigate to="/manager/dashboard" replace />;
    } else if (role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
