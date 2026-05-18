import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import PublisherNavbar from './PublisherNavbar';
import PublisherFooter from './PublisherFooter';
import { getProfile } from '../../../services/publisher.services';

const PublisherLayout = () => {
  const [publisherName, setPublisherName] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getProfile();
        if (mounted && res?.data?.user) {
          const u = res.data.user;
          setPublisherName(`${u.firstname || ''} ${u.lastname || ''}`.trim());
        }
      } catch (e) {
        // non-blocking; navbar can render without a name
        console.error('Failed to load publisher profile for layout:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublisherNavbar publisherName={publisherName} />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <PublisherFooter />
    </div>
  );
};

export default PublisherLayout;
