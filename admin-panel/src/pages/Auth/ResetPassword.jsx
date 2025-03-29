// src/pages/Auth/ResetPassword.jsx

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword, clearAuthMessages } from '../../redux/slices/authSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../../assets/logo.jpg';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resetToken } = useParams();
  const { loading, error, message } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = React.useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Initialize formik for form handling and validation
  const formik = useFormik({
    initialValues: {
      password: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Please enter your new password.'),
    }),
    onSubmit: (values) => {
      dispatch(resetPassword({ resetToken, password: values.password }))
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
          Reset Password
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

        {/* Reset Password Form */}
        <form onSubmit={formik.handleSubmit}>
          {/* Password Field */}
          <div className="mb-6 relative">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-200 mb-2">
              New Password
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

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-200 disabled:bg-green-400"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
