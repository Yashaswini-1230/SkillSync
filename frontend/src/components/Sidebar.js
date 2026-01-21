import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiMenu,
  FiX,
  FiHome,
  FiUpload,
  FiSearch,
  FiFileText,
  FiMessageSquare,
  FiUser
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/upload', icon: FiUpload, label: 'Upload Resume' },
    { path: '/analyze', icon: FiSearch, label: 'Analyze Resume' },
    { path: '/builder', icon: FiFileText, label: 'Resume Builder' },
    { path: '/interview', icon: FiMessageSquare, label: 'AI Interview Prep' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow md:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full pt-16">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Profile Section */}
          <div className="border-t border-gray-200 p-4">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUser size={20} />
              <div className="flex-1">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Account Icon (always visible when sidebar closed on desktop) */}
      <Link
        to="/profile"
        className="fixed top-4 left-16 md:left-4 z-50 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow hidden md:block"
      >
        <FiUser size={24} />
      </Link>
    </>
  );
};

export default Sidebar;
