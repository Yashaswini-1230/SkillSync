import React, { useState, useEffect } from 'react';
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
  FiUser,
  FiLogOut,
  FiBriefcase
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Update body class for sidebar state
  useEffect(() => {
    if (window.innerWidth >= 768) {
      document.body.classList.toggle('sidebar-open', isOpen);
    }
  }, [isOpen]);

  // Don't render sidebar on auth pages
  if (!user) return null;

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/upload', icon: FiUpload, label: 'Upload Resume' },
    { path: '/analyze', icon: FiSearch, label: 'Analyze Resume' },
    { path: '/builder', icon: FiFileText, label: 'Resume Builder' },
    { path: '/saved-resumes', icon: FiFileText, label: 'Saved Resumes' },
    { path: '/jobs', icon: FiBriefcase, label: 'Jobs & Internships' },
    { path: '/interview', icon: FiMessageSquare, label: 'AI Interview Prep' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger Button - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-5 left-5 z-50 p-3 bg-primary-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:bg-primary-700 transition-all duration-200"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-xl z-40 transform transition-all duration-300 ease-in-out ${
          window.innerWidth < 768
            ? (isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
            : (isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
        }`}
      >
        <div className="flex flex-col h-full pt-20">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
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
            <div className="space-y-2">
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
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
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <FiLogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
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

    </>
  );
};

export default Sidebar;
