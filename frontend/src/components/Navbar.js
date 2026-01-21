import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">SkillSync</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Upload
            </Link>
            <Link
              to="/analyze"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Analyze
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <FiLogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
