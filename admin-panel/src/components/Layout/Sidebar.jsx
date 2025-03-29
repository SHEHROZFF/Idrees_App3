import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaUserShield,
  FaUsers,
  FaBoxOpen,
  FaClipboardList,
  FaStar,
  FaBars,
  FaTimes,
  FaHome,
  FaEdit,
  FaBook,
  FaBullhorn,
  FaFileContract, // New icon for Ads
} from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { name: 'Dashboard', icon: <FaHome className="h-6 w-6" />, path: '/' },
    { name: 'Users', icon: <FaUsers className="h-6 w-6" />, path: '/users' },
    { name: 'Products', icon: <FaBoxOpen className="h-6 w-6" />, path: '/products' },
    { name: 'Orders', icon: <FaClipboardList className="h-6 w-6" />, path: '/orders' },
    { name: 'Reviews', icon: <FaStar className="h-6 w-6" />, path: '/reviews' },
    { name: 'Courses', icon: <FaBook className="h-6 w-6" />, path: '/courses' },
    { name: 'Ads', icon: <FaBullhorn className="h-6 w-6" />, path: '/ads' },
    { name: 'Theme Settings', icon: <FaEdit className="h-6 w-6" />, path: '/theme' },
    { name: 'Enrollments', icon: <FaClipboardList className="h-6 w-6" />, path: '/enrollments' },
    { name: 'Policies', icon: <FaFileContract className="h-6 w-6" />, path: '/policies' }, 
  ];

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-800 text-gray-100 min-h-screen transition-width duration-300 relative`}>
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-[-15px] bg-gray-800 text-white border border-gray-700 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-300"
        aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
      </button>
      <div className="p-4 flex items-center">
        <FaUserShield className="h-8 w-8 ml-2 text-blue-400" />
        {isOpen && <span className="text-2xl font-bold ml-2">Admin Panel</span>}
      </div>
      <nav className="mt-10">
        {menuItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`flex items-center w-full px-4 py-2 mt-2 text-left hover:bg-gray-700 focus:outline-none transition-colors duration-200 ${location.pathname === item.path ? 'bg-gray-700' : ''}`}
            aria-label={item.name}
          >
            <span className="h-8 w-8 ml-2">{item.icon}</span>
            {isOpen && <span className="ml-3">{item.name}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;















// // src/components/Layout/Sidebar.jsx
// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//   FaUserShield,
//   FaUsers,
//   FaBoxOpen,
//   FaClipboardList,
//   FaStar,
//   FaBars,
//   FaTimes,
//   FaHome,
//   FaEdit,  // Reuse this for theme settings
//   FaBook
// } from 'react-icons/fa';

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isOpen, setIsOpen] = useState(true);

//   const menuItems = [
//     { name: 'Dashboard', icon: <FaHome className="h-6 w-6" />, path: '/' },
//     { name: 'Users', icon: <FaUsers className="h-6 w-6" />, path: '/users' },
//     { name: 'Products', icon: <FaBoxOpen className="h-6 w-6" />, path: '/products' },
//     { name: 'Orders', icon: <FaClipboardList className="h-6 w-6" />, path: '/orders' },
//     { name: 'Reviews', icon: <FaStar className="h-6 w-6" />, path: '/reviews' },
//     { name: 'Courses', icon: <FaBook className="h-6 w-6" />, path: '/courses' },
//     { name: 'Theme Settings', icon: <FaEdit className="h-6 w-6" />, path: '/theme' },
//   ];

//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gray-800 text-gray-100 min-h-screen transition-width duration-300 relative`}>
//       <button
//         onClick={toggleSidebar}
//         className="absolute top-4 right-[-15px] bg-gray-800 text-white border border-gray-700 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-300"
//         aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
//       >
//         {isOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
//       </button>
//       <div className="p-4 flex items-center">
//         <FaUserShield className="h-8 w-8 ml-2 text-blue-400" />
//         {isOpen && <span className="text-2xl font-bold ml-2">Admin Panel</span>}
//       </div>
//       <nav className="mt-10">
//         {menuItems.map((item) => (
//           <button
//             key={item.name}
//             onClick={() => navigate(item.path)}
//             className={`flex items-center w-full px-4 py-2 mt-2 text-left hover:bg-gray-700 focus:outline-none transition-colors duration-200 ${location.pathname === item.path ? 'bg-gray-700' : ''}`}
//             aria-label={item.name}
//           >
//             <span className="h-8 w-8 ml-2">{item.icon}</span>
//             {isOpen && <span className="ml-3">{item.name}</span>}
//           </button>
//         ))}
//       </nav>
//     </div>
//   );
// };

// export default Sidebar;











// // src/components/Layout/Sidebar.jsx
// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//   FaUserShield, // Updated import
//   FaUsers,
//   FaBoxOpen,
//   FaClipboardList,
//   FaStar,
//   FaBars,
//   FaTimes,
//   FaHome
// } from 'react-icons/fa'; // React Icons

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isOpen, setIsOpen] = useState(true); // State to manage sidebar open/close

//   const menuItems = [
//     { name: 'Dashboard', icon: <FaHome className="h-6 w-6" />, path: '/' }, // Updated icon
//     { name: 'Users', icon: <FaUsers className="h-6 w-6" />, path: '/users' },
//     { name: 'Products', icon: <FaBoxOpen className="h-6 w-6" />, path: '/products' },
//     { name: 'Orders', icon: <FaClipboardList className="h-6 w-6" />, path: '/orders' },
//     { name: 'Reviews', icon: <FaStar className="h-6 w-6" />, path: '/reviews' },
//   ];

//   // Function to toggle sidebar open/close
//   const toggleSidebar = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <div
//       className={`${
//         isOpen ? 'w-64' : 'w-20'
//       } bg-gray-800 text-gray-100 min-h-screen transition-width duration-300 relative`}
//     >
//       {/* Toggle Button */}
//       <button
//         onClick={toggleSidebar}
//         className="absolute top-4 right-[-15px] bg-gray-800 text-white border border-gray-700 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform duration-300"
//         aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
//       >
//         {isOpen ? <FaTimes className="h-4 w-4" /> : <FaBars className="h-4 w-4" />}
//       </button>

//       {/* Logo and Title */}
//       <div className="p-4 flex items-center">
//         <FaUserShield className="h-8 w-8 ml-2 text-blue-400" /> {/* Updated Icon */}
//         {isOpen && <span className="text-2xl font-bold ml-2">Admin Panel</span>}
//       </div>

//       {/* Navigation Menu */}
//       <nav className="mt-10">
//         {menuItems.map((item) => (
//           <button
//             key={item.name}
//             onClick={() => navigate(item.path)}
//             className={`flex items-center w-full px-4 py-2 mt-2 text-left hover:bg-gray-700 focus:outline-none transition-colors duration-200 ${
//               location.pathname === item.path ? 'bg-gray-700' : ''
//             }`}
//             aria-label={item.name}
//           >
//             <span className="h-8 w-8 ml-2">{item.icon}</span>
//             {isOpen && <span className="ml-3">{item.name}</span>}
//           </button>
//         ))}
//       </nav>

//       {/* Optional: Footer or Additional Content */}
//       {/* You can add a footer or user profile section here if needed */}
//     </div>
//   );
// };

// export default Sidebar;
