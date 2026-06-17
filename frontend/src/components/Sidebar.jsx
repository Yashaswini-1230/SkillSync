import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSidebar } from '../context/SidebarContext.jsx';
import {
  FiHome,
  FiUpload,
  FiSearch,
  FiFileText,
  FiMessageSquare,
  FiUser,
  FiBriefcase,
  FiClock
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useAuth();
  const { isOpen, close } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    if (window.innerWidth >= 768) {
      document.body.classList.toggle('sidebar-open', isOpen);
    }
    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [isOpen]);

  if (!user) return null;

  const menuItems = [
    { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { path: '/upload', icon: FiUpload, label: 'Upload Resume' },
    { path: '/analyze', icon: FiSearch, label: 'Analyze Resume' },
    { path: '/analysis-history', icon: FiClock, label: 'Analysis History' },
    { path: '/builder', icon: FiFileText, label: 'Resume Builder' },
    { path: '/saved-resumes', icon: FiFileText, label: 'Saved Resumes' },
    { path: '/jobs', icon: FiBriefcase, label: 'Jobs & Internships' },
    { path: '/interview', icon: FiMessageSquare, label: 'AI Interview Prep' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <aside
        className={`fixed top-20 left-0 h-[calc(100vh-5rem)] bg-white shadow-xl z-40 transform transition-all duration-300 ease-in-out w-64 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={close}
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

          <div className="border-t border-gray-200 p-4">
            <Link
              to="/profile"
              onClick={close}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive('/profile')
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiUser size={20} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user?.name}</div>
                <div className="text-xs text-gray-500 truncate">{user?.email}</div>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 top-20 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Sidebar;
