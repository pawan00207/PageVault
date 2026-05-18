import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const BuyerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />  
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default BuyerLayout;
