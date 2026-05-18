import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../store/hooks';
import verifyAuth from '../utils/verifyAuth.util';

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();
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

  return <Outlet />;
};

export default PublicRoute;
