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
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/dashboard" className="flex items-center group ml-16 md:ml-0">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-200">
              SkillSync
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2 ml-8">
            <Link
              to="/dashboard"
              className="px-5 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-semibold text-lg"
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className="px-5 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-semibold text-lg"
            >
              Upload
            </Link>
            <Link
              to="/analyze"
              className="px-5 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-semibold text-lg"
            >
              Analyze
            </Link>
            <Link
              to="/builder"
              className="px-5 py-3 rounded-xl text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-semibold text-lg"
            >
              Builder
            </Link>
            <div className="h-8 w-px bg-gray-300 mx-4"></div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold text-lg"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
