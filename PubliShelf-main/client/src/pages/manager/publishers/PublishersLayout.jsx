// client/src/pages/manager/publishers/PublishersLayout.jsx
import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const PublishersLayout = () => {
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const managerName = `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Manager';

  const tabs = [
    { path: '/manager/publishers/pending', label: 'Pending', icon: 'fa-clock' },
    { path: '/manager/publishers/active', label: 'Active', icon: 'fa-check-circle' },
    { path: '/manager/publishers/banned', label: 'Banned', icon: 'fa-ban' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Publisher Management</h1>
            <p className="text-gray-600">Manage publisher accounts and permissions</p>
          </div>

          <div className="mb-6 border-b border-gray-200 bg-white rounded-t-xl px-6">
            <div className="flex space-x-8">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`pb-4 pt-4 font-medium transition-colors flex items-center gap-2 ${
                    location.pathname === tab.path
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <i className={`fas ${tab.icon}`}></i>
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200 p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishersLayout;
