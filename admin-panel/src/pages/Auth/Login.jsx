// src/pages/Auth/Login.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../../redux/slices/authSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Navigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Icons for password toggle
import logo from '../../assets/logo.jpg'; // Importing the logo image

const Login = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid Email').required('Please enter your email.'),
      password: Yup.string().required('Please enter your password.'),
    }),
    onSubmit: (values) => {
      dispatch(loginAdmin(values));
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }
    },
  });

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Admin Panel Logo" className="h-16 w-16 object-contain" />
        </div>

        {/* Form Title */}
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">Admin Login</h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={formik.handleSubmit}>
          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-200 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
              }`}
              placeholder="admin@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-describedby="email-error"
            />
            {formik.touched.email && formik.errors.email && (
              <p id="email-error" className="text-red-500 text-sm mt-1">
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-200 mb-2">
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formik.touched.password && formik.errors.password
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
              }`}
              placeholder="••••••••"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-describedby="password-error"
            />
            {/* Password Toggle Button */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-10 right-4 text-gray-500 dark:text-gray-400 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {formik.touched.password && formik.errors.password && (
              <p id="password-error" className="text-red-500 text-sm mt-1">
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="mb-6 flex items-center justify-between">
            <label className="flex items-center text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-600"
                checked={rememberMe}
                onChange={() => setRememberMe((prev) => !prev)}
              />
              <span className="ml-2">Remember Me</span>
            </label>
            <Link to="/forgot-password" className="text-blue-500 hover:underline text-sm">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400 flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Register Link */}
        {/* <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default Login;
