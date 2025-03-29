// src/components/Layout/Header.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAdmin } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'; // React Icons
import ThemeToggle from '../ThemeToggle';
import logo from '../../assets/logo.jpg'; // Importing the logo image

const Header = ({ isSidebarOpen, toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((state) => state.auth.admin);

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center bg-white dark:bg-gray-800 shadow px-6 py-4">
      <div className="flex items-center">
        {/* Sidebar Toggle Button (Visible on small screens) */}
        <button
          onClick={toggleSidebar}
          className="text-gray-500 dark:text-gray-200 focus:outline-none mr-4 md:hidden transition-colors duration-200 hover:text-gray-700 dark:hover:text-gray-400"
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {isSidebarOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <img src={logo} alt="Admin Panel Logo" className="h-8 w-8 object-contain" />

        {/* Title (Hidden on small screens when sidebar is collapsed) */}
        <h1 className="text-2xl font-bold ml-2 text-gray-800 dark:text-white hidden md:block">
          Admin Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Logout Button */}
        {/* {admin && ( */}
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            <FaSignOutAlt className="h-5 w-5 mr-2" />
            Logout
          </button>
        {/* )} */}
      </div>
    </header>
  );
};

export default Header;
