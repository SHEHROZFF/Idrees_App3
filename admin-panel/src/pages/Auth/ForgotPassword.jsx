// src/pages/Auth/ForgotPassword.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword, clearAuthMessages } from '../../redux/slices/authSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.jpg';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, message } = useSelector((state) => state.auth);

  // Initialize formik for form handling and validation
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid Email')
        .required('Please enter your email.'),
    }),
    onSubmit: (values) => {
      dispatch(forgotPassword(values.email))
        .unwrap()
        .then((data) => {
          // Navigate to login page after success
          navigate('/login');
        })
        .catch((err) => {
          // Error is already handled in Redux state
        });
    },
  });

  // Clear messages when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAuthMessages());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-16 w-16 object-contain" />
        </div>

        {/* Form Title */}
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Forgot Password
        </h2>

        {/* Success Message */}
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">
            {message}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* Forgot Password Form */}
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
              placeholder="Your email"
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Back to Login Link */}
        <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
          Remembered your password?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
