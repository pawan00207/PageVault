import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance.util";

const Footer = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get(`/system/stats`);
      if (response.data.success) {
        setStats(response.data.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">PubliShelf</h3>
            <p className="text-gray-400">Your gateway to endless literary discoveries.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white">Terms of Service</Link>
              </li>
              <li>
                <Link to="#" className="text-gray-400 hover:text-white">Privacy Policy</Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 md:-translate-x-12">
              <h4 className="text-lg font-semibold mb-4 text-white">Site Stats</h4>
              {loading ? (
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Site Views</span>
                    <span className="h-5 w-20 bg-gray-700 rounded animate-pulse"></span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Site Users</span>
                    <span className="h-5 w-20 bg-gray-700 rounded animate-pulse"></span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Views Today</span>
                    <span className="h-5 w-12 bg-gray-700 rounded animate-pulse"></span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Users Today</span>
                    <span className="h-5 w-12 bg-gray-700 rounded animate-pulse"></span>
                  </li>
                </ul>
              ) : (
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Site Views</span>
                    <span className="text-white font-bold text-lg">{stats?.totalViews?.toLocaleString() || 0}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Site Users</span>
                    <span className="text-white font-bold text-lg">{stats?.totalUsers?.toLocaleString() || 0}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Views Today</span>
                    <span className="text-white font-bold text-lg">{stats?.viewsToday || 0}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-gray-300">Users Today</span>
                    <span className="text-white font-bold text-lg">{stats?.usersToday || 0}</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <Link to="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter"></i></Link>
              <Link to="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook"></i></Link>
              <Link to="#" className="text-gray-400 hover:text-white"><i className="fab fa-instagram"></i></Link>
              <Link to="#" className="text-gray-400 hover:text-white"><i className="fab fa-linkedin"></i></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;