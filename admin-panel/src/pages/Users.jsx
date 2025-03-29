// src/pages/Users.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Redux hooks
import {
  fetchUsers,
  addUser,
  updateUser,
  deleteUser,
} from '../redux/slices/usersSlice'; // Redux actions
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { Transition } from '@headlessui/react'; // For smooth modal transitions

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.users); // Access users from Redux

  const [showForm, setShowForm] = useState(false); // Controls form visibility
  const [currentUser, setCurrentUser] = useState(null); // Holds user data for editing

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10; // Adjust as needed

  // Fetch users from backend when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Formik setup for add/edit user
  const formik = useFormik({
    initialValues: {
      name: currentUser ? currentUser.name : '',
      email: currentUser ? currentUser.email : '',
      role: currentUser ? currentUser.role : 'user',
      password: '',
    },
    enableReinitialize: true, // Reinitialize form when currentUser changes
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid Email').required('Email is required'),
      role: Yup.string()
        .oneOf(['admin', 'user'], 'Invalid Role') // Ensure roles match backend definitions
        .required('Role is required'),
      password: currentUser
        ? Yup.string().notRequired()
        : Yup.string()
            .min(6, 'Password must be at least 6 characters')
            .required('Password is required'),
    }),
    onSubmit: (values) => {
      if (currentUser) {
        // Update user
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }
        dispatch(updateUser({ id: currentUser._id, userData: updateData }))
          .unwrap()
          .then(() => {
            setShowForm(false);
            setCurrentUser(null);
            formik.resetForm();
            setCurrentPage(1); // Reset to first page on update
          })
          .catch((err) => {
            // Optionally handle errors (e.g., show a notification)
            console.error('Update User Failed:', err);
          });
      } else {
        // Add new user
        dispatch(addUser(values))
          .unwrap()
          .then(() => {
            setShowForm(false);
            formik.resetForm();
            setCurrentPage(1); // Reset to first page on add
          })
          .catch((err) => {
            // Optionally handle errors (e.g., show a notification)
            console.error('Add User Failed:', err);
          });
      }
    },
  });

  // Handle edit button click
  const handleEdit = (user) => {
    setCurrentUser(user);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id))
        .unwrap()
        .then(() => {
          // Optionally adjust current page if necessary
          const totalPages = Math.ceil((users.length - 1) / usersPerPage);
          if (currentPage > totalPages) {
            setCurrentPage(totalPages);
          }
        })
        .catch((err) => {
          // Optionally handle errors (e.g., show a notification)
          console.error('Delete User Failed:', err);
        });
    }
  };

  // Calculate pagination details
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Users Management Title */}
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Users Management
      </h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add User Button */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
        aria-label="Add User"
      >
        <FaPlus className="mr-2" />
        Add User
      </button>

      {/* Users Table */}
      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {user.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {user.email}
                    </td>
                    <td className="py-4 px-6 text-sm capitalize text-gray-800 dark:text-gray-200">
                      {user.role}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
                        aria-label={`Edit ${user.name}`}
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                        aria-label={`Delete ${user.name}`}
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {users.length > usersPerPage && (
            <div className="flex justify-center mt-6">
              <nav aria-label="Page navigation">
                <ul className="inline-flex -space-x-px">
                  {/* Previous Page Button */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      aria-label="Previous Page"
                    >
                      <FaChevronLeft />
                    </button>
                  </li>

                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, index) => (
                    <li key={index + 1}>
                      <button
                        onClick={() => paginate(index + 1)}
                        className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
                          currentPage === index + 1
                            ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}

                  {/* Next Page Button */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      aria-label="Next Page"
                    >
                      <FaChevronRight />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Add/Edit User Modal */}
      <Transition
        show={showForm}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {currentUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={formik.handleSubmit}>
              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.name && formik.errors.name
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="John Doe"
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.name}
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.email && formik.errors.email
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="admin@example.com"
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.email}
                  </div>
                )}
              </div>

              {/* Role Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Role
                </label>
                <select
                  name="role"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.role && formik.errors.role
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.role}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                {formik.touched.role && formik.errors.role && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.role}
                  </div>
                )}
              </div>

              {/* Password Field (Only for Adding New User) */}
              {!currentUser && (
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-200">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-500 focus:ring-red-200'
                        : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                    }`}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="••••••••"
                  />
                  {formik.touched.password && formik.errors.password && (
                    <div className="text-red-500 text-sm mt-1">
                      {formik.errors.password}
                    </div>
                  )}
                </div>
              )}

              {/* Form Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentUser(null);
                    formik.resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  {currentUser ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Users;
















