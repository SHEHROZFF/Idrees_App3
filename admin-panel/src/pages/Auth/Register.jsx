// src/pages/Auth/Register.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerAdmin } from '../../redux/slices/authSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Icons for password toggle
import logo from '../../assets/logo.jpg'; // Importing the logo image

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Please enter your name.'),
      email: Yup.string().email('Invalid Email').required('Please enter your email.'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Please enter your password.'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password.'),
    }),
    onSubmit: (values) => {
      dispatch(
        registerAdmin({
          name: values.name,
          email: values.email,
          password: values.password,
          role: 'admin',
        })
      )
        .unwrap()
        .then((data) => {
          if (data.success) {
            navigate('/login');
          } else {
            // Handle unsuccessful registration if needed
          }
        })
        .catch((err) => {
          // Handle error if needed
        });
    },
  });

  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Admin Panel Logo" className="h-16 w-16 object-contain" />
        </div>

        {/* Close Button */}
        <button
          onClick={() => navigate('/')} // Replace with appropriate navigation if needed
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Form Title */}
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Admin Register
        </h2>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>
        )}

        {/* Registration Form */}
        <form onSubmit={formik.handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700 dark:text-gray-200 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formik.touched.name && formik.errors.name
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
              }`}
              placeholder="John Doe"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-describedby="name-error"
            />
            {formik.touched.name && formik.errors.name && (
              <p id="name-error" className="text-red-500 text-sm mt-1">
                {formik.errors.name}
              </p>
            )}
          </div>

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

          {/* Confirm Password Field */}
          <div className="mb-6 relative">
            <label htmlFor="confirmPassword" className="block text-gray-700 dark:text-gray-200 mb-2">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? 'border-red-500 focus:ring-red-200'
                  : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
              }`}
              placeholder="••••••••"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              aria-describedby="confirmPassword-error"
            />
            {/* Confirm Password Toggle Button */}
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="absolute top-10 right-4 text-gray-500 dark:text-gray-400 focus:outline-none"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p id="confirmPassword-error" className="text-red-500 text-sm mt-1">
                {formik.errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-green-400 flex items-center justify-center"
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
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
