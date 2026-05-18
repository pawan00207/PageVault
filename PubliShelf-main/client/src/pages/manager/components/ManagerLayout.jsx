import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import ManagerNavbar from './ManagerNavbar';
import { getProfile } from '../../../services/manager.services';

const ManagerLayout = () => {
  const [managerName, setManagerName] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProfile();
        if (mounted && res?.data?.user) {
          const u = res.data.user;
          setManagerName(`${u.firstname || ''} ${u.lastname || ''}`.trim());
        }
      } catch (e) {
        console.error('Failed to load manager profile for layout:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <ManagerNavbar managerName={managerName} />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;