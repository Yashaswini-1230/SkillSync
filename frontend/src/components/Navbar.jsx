import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSidebar } from '../context/SidebarContext.jsx';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import {
  FiFileText,
  FiHome,
  FiSearch,
  FiUpload
} from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isOpen, toggle } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/upload', icon: FiUpload, label: 'Upload' },
    { path: '/analyze', icon: FiSearch, label: 'Analyze' },
    { path: '/builder', icon: FiFileText, label: 'Builder' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg z-50 border-b border-gray-100">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2.5 bg-primary-600 text-white rounded-xl shadow-md hover:bg-primary-700 transition-all duration-200"
              aria-label="Toggle sidebar"
            >
              {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <Link to="/dashboard" className="flex items-center group">
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-primary-800 transition-all duration-200">
                SkillSync
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-primary-700'
                      }`
                    }
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 font-semibold"
            >
              <FiLogOut size={20} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
