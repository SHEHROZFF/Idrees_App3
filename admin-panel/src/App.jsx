// // src/App.jsx
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Layout from './components/Layout/Layout';
// import Login from './pages/Auth/Login';
// import Register from './pages/Auth/Register';
// import Dashboard from './pages/Dashboard';
// import Users from './pages/Users';
// import Products from './pages/Products';
// import Orders from './pages/Orders';
// import Reviews from './pages/Reviews';
// import { useSelector } from 'react-redux';

// const App = () => {
//   const { isAuthenticated } = useSelector((state) => state.auth);

//   return (
//     <Router>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
//         <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />

//         {/* Protected Routes */}
//         {/* <Route
//           path="/"
//           element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
//         > */}
//         <Route
//           path="/"
//           element={ <Layout /> }
//         >
//           <Route index element={<Dashboard />} />
//           <Route path="users" element={<Users />} />
//           <Route path="products" element={<Products />} />
//           <Route path="orders" element={<Orders />} />
//           <Route path="reviews" element={<Reviews />} />
//         </Route>

//         {/* Fallback Route */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// };

// export default App;


// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword'; // Import ForgotPassword
import ResetPassword from './pages/Auth/ResetPassword';   // Import ResetPassword
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Reviews from './pages/Reviews';
import LandingPage from './pages/LandingPage';
import ThemeSettings from './pages/ThemeSettings';
import Courses from './pages/Courses';
import Ads from './pages/Ads';
import Enrollments from './pages/Enrollments';
import Policies from './pages/Policies';
import { useSelector } from 'react-redux';


const App = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        {/* <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
        /> */}
        <Route
          path="/forgot-password"
          element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" replace />}
        />
        <Route
          path="/reset-password/:resetToken"
          element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" replace />}
        />
        <Route path="/landing" element={<LandingPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="/theme" element={<ThemeSettings />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/ads" element={<Ads />} />
          <Route path="/enrollments" element={<Enrollments />} />
          <Route path="/policies" element={<Policies />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
