// src/pages/Enrollments.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEnrollments,
  addEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from '../redux/slices/enrollmentsSlice';

import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';
import { Transition } from '@headlessui/react';

const Enrollments = () => {
  const dispatch = useDispatch();
  const { enrollments, loading, error } = useSelector((state) => state.enrollments);

  const [showForm, setShowForm] = useState(false);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10; // entries per page

  useEffect(() => {
    dispatch(fetchEnrollments());
    // eslint-disable-next-line
  }, []);

  // total pages
  const totalPages = Math.ceil(enrollments.length / perPage);

  // If data changes and currentPage > totalPages, adjust it
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [enrollments, totalPages, currentPage]);

  // Current slice of enrollments
  const indexOfLast = currentPage * perPage;
  const indexOfFirst = indexOfLast - perPage;
  const currentList = enrollments.slice(indexOfFirst, indexOfLast);

  // Formik
  const formik = useFormik({
    initialValues: {
      user: currentEnrollment
        ? // If user is an object, store user._id; else store what’s there
          typeof currentEnrollment.user === 'object'
            ? currentEnrollment.user._id
            : currentEnrollment.user
        : '',
      course: currentEnrollment
        ? // If course is an object, store course._id; else store what’s there
          typeof currentEnrollment.course === 'object'
            ? currentEnrollment.course._id
            : currentEnrollment.course
        : '',
      status: currentEnrollment ? currentEnrollment.status : 'active',
      paymentStatus: currentEnrollment
        ? currentEnrollment.paymentStatus
        : 'not_required',
      progress: currentEnrollment ? currentEnrollment.progress : 0,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      user: Yup.string().required('User ID is required'),
      course: Yup.string().required('Course ID is required'),
      status: Yup.string().required('Status is required'),
      paymentStatus: Yup.string().required('Payment status is required'),
      progress: Yup.number()
        .min(0, 'Progress cannot be negative')
        .max(100, 'Progress cannot exceed 100')
        .required('Progress is required'),
    }),
    onSubmit: (values) => {
      if (currentEnrollment) {
        // Update
        dispatch(
          updateEnrollment({ id: currentEnrollment._id, enrollmentData: values })
        )
          .unwrap()
          .then(() => {
            setShowForm(false);
            setCurrentEnrollment(null);
            formik.resetForm();
            setCurrentPage(1);
          })
          .catch((err) => {
            console.error('Update Enrollment Failed:', err);
          });
      } else {
        // Add
        dispatch(addEnrollment(values))
          .unwrap()
          .then(() => {
            setShowForm(false);
            formik.resetForm();
            setCurrentPage(1);
          })
          .catch((err) => {
            console.error('Add Enrollment Failed:', err);
          });
      }
    },
  });

  const handleEdit = (enrollment) => {
    setCurrentEnrollment(enrollment);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      dispatch(deleteEnrollment(id))
        .unwrap()
        .then(() => {
          const newTotalPages = Math.ceil((enrollments.length - 1) / perPage);
          if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
        })
        .catch((err) => {
          console.error('Delete Enrollment Failed:', err);
        });
    }
  };

  // handle page change
  const paginate = (pageNum) => setCurrentPage(pageNum);

  /**
   * Helper: Render user field
   * If en.user is an object, display user.name or user.email
   * Otherwise, just display the string
   */
  const renderUser = (userField) => {
    if (!userField) return 'No User';

    // If it's an object, show name/email or fallback to _id
    if (typeof userField === 'object') {
      return userField.name
        ? `${userField.name} (${userField._id})`
        : userField._id || 'Unknown User';
    }
    // Otherwise, it's a string: probably userId
    return userField;
  };

  /**
   * Helper: Render course field
   * If en.course is an object, display course.title or fallback
   */
  const renderCourse = (courseField) => {
    if (!courseField) return 'No Course';

    // If it's an object, show course title or fallback to _id
    if (typeof courseField === 'object') {
      return courseField.title
        ? `${courseField.title} (${courseField._id})`
        : courseField._id || 'Unknown Course';
    }
    // Otherwise, it's a string: probably courseId
    return courseField;
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Enrollments Management
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
        aria-label="Add Enrollment"
      >
        <FaPlus className="mr-2" />
        Add Enrollment
      </button>

      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">
          Loading enrollments...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Enrollment ID
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Progress (%)
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentList.map((en) => (
                  <tr
                    key={en._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {en._id}
                    </td>

                    {/*
                      Instead of directly rendering en.user or en.course,
                      use helper functions
                    */}
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {renderUser(en.user)}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {renderCourse(en.course)}
                    </td>

                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 capitalize">
                      {en.status}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200 capitalize">
                      {en.paymentStatus}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {en.progress}%
                    </td>
                    <td className="py-5 px-4 text-sm flex items-center">
                      <button
                        onClick={() => handleEdit(en)}
                        className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(en._id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {currentList.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
                    >
                      No enrollments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {enrollments.length > perPage && (
            <div className="flex justify-center mt-6">
              <nav aria-label="Page navigation">
                <ul className="inline-flex -space-x-px">
                  {/* PREV */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === 1
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
                    >
                      <FaChevronLeft />
                    </button>
                  </li>

                  {[...Array(totalPages)].map((_, idx) => (
                    <li key={idx + 1}>
                      <button
                        onClick={() => paginate(idx + 1)}
                        className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
                          currentPage === idx + 1
                            ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
                            : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    </li>
                  ))}

                  {/* NEXT */}
                  <li>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        currentPage === totalPages
                          ? 'cursor-not-allowed opacity-50'
                          : ''
                      }`}
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

      {/* Add/Edit Enrollment Form */}
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
              {currentEnrollment ? 'Edit Enrollment' : 'Add New Enrollment'}
            </h3>
            <form onSubmit={formik.handleSubmit}>
              {/* User Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  User (ID)
                </label>
                <input
                  type="text"
                  name="user"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.user && formik.errors.user
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.user}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="userObjectId"
                />
                {formik.touched.user && formik.errors.user && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.user}
                  </div>
                )}
              </div>

              {/* Course Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Course (ID)
                </label>
                <input
                  type="text"
                  name="course"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.course && formik.errors.course
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.course}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="courseObjectId"
                />
                {formik.touched.course && formik.errors.course && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.course}
                  </div>
                )}
              </div>

              {/* Status Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Status
                </label>
                <select
                  name="status"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.status && formik.errors.status
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="paused">Paused</option>
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.status}
                  </div>
                )}
              </div>

              {/* Payment Status Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.paymentStatus && formik.errors.paymentStatus
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.paymentStatus}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="not_required">Not Required</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="refunded">Refunded</option>
                </select>
                {formik.touched.paymentStatus && formik.errors.paymentStatus && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.paymentStatus}
                  </div>
                )}
              </div>

              {/* Progress Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Progress (%)
                </label>
                <input
                  type="number"
                  name="progress"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.progress && formik.errors.progress
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.progress}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="0-100"
                />
                {formik.touched.progress && formik.errors.progress && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.progress}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentEnrollment(null);
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
                  {currentEnrollment ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Enrollments;
