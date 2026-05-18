import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminNavbar from '../components/AdminNavbar';

const AdminLayout = () => {
  const user = useSelector(state => state.user);
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar adminName={user?.name} isSuperAdmin={user?.isSuperAdmin} />
      <div className="pt-16 pb-20">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
