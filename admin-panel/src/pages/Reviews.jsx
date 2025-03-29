// src/pages/Reviews.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllReviews, deleteReview, updateReview, createReview } from '../redux/slices/reviewsSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Transition } from '@headlessui/react';

const Reviews = () => {
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector((state) => state.reviews);

  const [showForm, setShowForm] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  // Fetch reviews on component mount
  useEffect(() => {
    dispatch(fetchAllReviews());
  }, [dispatch]);

  // Updated initial values: use reviewableId and reviewableType (default to Product)
  const initialValues = {
    reviewableId: currentReview ? currentReview.reviewable : '',
    reviewableType: currentReview ? currentReview.reviewableModel : 'Product',
    rating: currentReview ? currentReview.rating : 5,
    comment: currentReview ? currentReview.comment : '',
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      reviewableId: Yup.string().required('Reviewable ID is required'),
      reviewableType: Yup.string().oneOf(['Product', 'Course']).required('Reviewable type is required'),
      rating: Yup.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5').required('Rating is required'),
      comment: Yup.string().required('Comment is required'),
    }),
    onSubmit: (values) => {
      const reviewData = {
        reviewableId: values.reviewableId,
        reviewableType: values.reviewableType,
        rating: values.rating,
        comment: values.comment,
      };

      if (currentReview) {
        // Update existing review
        dispatch(updateReview({ id: currentReview._id, reviewData }));
      } else {
        // Create new review
        dispatch(createReview(reviewData));
      }
      setShowForm(false);
      setCurrentReview(null);
      formik.resetForm();
      setCurrentPage(1);
    },
  });

  const handleEdit = (review) => {
    setCurrentReview(review);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      dispatch(deleteReview(id));
      // Adjust current page if necessary
      const indexOfLastReview = currentPage * reviewsPerPage;
      const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
      const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
      if (currentReviews.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Pagination calculations
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Reviews Management
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      <button
        onClick={() => {
          setCurrentReview(null);
          setShowForm(true);
        }}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
        aria-label="Add Review"
      >
        <FaPlus className="mr-2" /> Add Review
      </button>

      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Review ID
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Comment
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentReviews.map((review) => (
                  <tr key={review._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{review._id}</td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {review.user.name} ({review.user.email})
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {/* If reviewableModel is Product, show product name; if Course, show course title */}
                      {review.reviewableModel === 'Product'
                        ? review.reviewable.name
                        : review.reviewable.title}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }, (_, index) => (
                          <span key={index} className="text-yellow-500">
                            {index < Math.floor(review.rating) ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">{review.comment}</td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
                      <button
                        onClick={() => handleEdit(review)}
                        className="text-blue-500 hover:underline flex items-center mr-2"
                        aria-label={`Edit review ${review._id}`}
                      >
                        <FaEdit className="mr-1" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-red-500 hover:underline flex items-center"
                        aria-label={`Delete review ${review._id}`}
                      >
                        <FaTrash className="mr-1" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentReviews.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                      No reviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {reviews.length > reviewsPerPage && (
            <div className="flex justify-center mt-6">
              <nav aria-label="Page navigation">
                <ul className="inline-flex -space-x-px">
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

      <Transition
        show={showForm}
        enter="transition ease-out duration-300 transform"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-200 transform"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {currentReview ? 'Edit Review' : 'Add New Review'}
            </h3>
            <form onSubmit={formik.handleSubmit}>
              {/* Reviewable ID Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Reviewable ID</label>
                <input
                  type="text"
                  name="reviewableId"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.reviewableId && formik.errors.reviewableId
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.reviewableId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter ID of the Product or Course"
                />
                {formik.touched.reviewableId && formik.errors.reviewableId && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.reviewableId}</div>
                )}
              </div>

              {/* Reviewable Type Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Reviewable Type</label>
                <select
                  name="reviewableType"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.reviewableType && formik.errors.reviewableType
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.reviewableType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="Product">Product</option>
                  <option value="Course">Course</option>
                </select>
                {formik.touched.reviewableType && formik.errors.reviewableType && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.reviewableType}</div>
                )}
              </div>

              {/* Rating Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Rating</label>
                <select
                  name="rating"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.rating && formik.errors.rating
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.rating}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
                {formik.touched.rating && formik.errors.rating && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.rating}</div>
                )}
              </div>

              {/* Comment Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Comment</label>
                <textarea
                  name="comment"
                  rows="3"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.comment && formik.errors.comment
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.comment}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Your feedback here..."
                ></textarea>
                {formik.touched.comment && formik.errors.comment && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.comment}</div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentReview(null);
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
                  {currentReview ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Reviews;














// // src/pages/Reviews.jsx

// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchAllReviews,
//   deleteReview,
//   updateReview,
//   createReview,
// } from '../redux/slices/reviewsSlice';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
// } from 'react-icons/fa';
// import { Transition } from '@headlessui/react';

// const Reviews = () => {
//   const dispatch = useDispatch();
//   const { reviews, loading, error } = useSelector((state) => state.reviews);

//   const [showForm, setShowForm] = useState(false);
//   const [currentReview, setCurrentReview] = useState(null);

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const reviewsPerPage = 10;

//   // Fetch reviews on component mount
//   useEffect(() => {
//     dispatch(fetchAllReviews());
//   }, [dispatch]);

//   // Formik setup for edit/add review
//   const formik = useFormik({
//     initialValues: {
//       productId: currentReview ? currentReview.product._id : '',
//       rating: currentReview ? currentReview.rating : 5,
//       comment: currentReview ? currentReview.comment : '',
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       productId: Yup.string().required('Product ID is required'),
//       rating: Yup.number()
//         .min(1, 'Rating must be at least 1')
//         .max(5, 'Rating cannot exceed 5')
//         .required('Rating is required'),
//       comment: Yup.string().required('Comment is required'),
//     }),
//     onSubmit: (values) => {
//       if (currentReview) {
//         // Update review
//         const reviewData = {
//           productId: values.productId,
//           rating: values.rating,
//           comment: values.comment,
//         };
//         dispatch(updateReview({ id: currentReview._id, reviewData }));
//       } else {
//         // Create a new review
//         const reviewData = {
//           productId: values.productId,
//           rating: values.rating,
//           comment: values.comment,
//         };
//         dispatch(createReview(reviewData));
//       }
//       setShowForm(false);
//       setCurrentReview(null);
//       formik.resetForm();
//       setCurrentPage(1); // Reset to first page on update
//     },
//   });

//   // Handle edit button click
//   const handleEdit = (review) => {
//     setCurrentReview(review);
//     setShowForm(true);
//   };

//   // Handle delete button click
//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this review?')) {
//       dispatch(deleteReview(id));

//       // Adjust current page if necessary
//       const indexOfLastReview = currentPage * reviewsPerPage;
//       const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
//       const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
//       if (currentReviews.length === 1 && currentPage > 1) {
//         setCurrentPage(currentPage - 1);
//       }
//     }
//   };

//   // Calculate pagination details
//   const indexOfLastReview = currentPage * reviewsPerPage;
//   const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
//   const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
//   const totalPages = Math.ceil(reviews.length / reviewsPerPage);

//   // Handle page change
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       {/* Reviews Management Title */}
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
//         Reviews Management
//       </h2>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
//       )}

//       {/* Add Review Button */}
//       <button
//         onClick={() => {
//           setCurrentReview(null);
//           setShowForm(true);
//         }}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Review"
//       >
//         <FaPlus className="mr-2" />
//         Add Review
//       </button>

//       {/* Reviews Table */}
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Review ID
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     User
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Product
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Rating
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Comment
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Date
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentReviews.map((review) => (
//                   <tr
//                     key={review._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {review._id}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {review.user.name} ({review.user.email})
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {review.product.name}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       <div className="flex items-center">
//                         {Array.from({ length: 5 }, (_, index) => (
//                           <span key={index} className="text-yellow-500">
//                             {index < Math.floor(review.rating) ? '★' : '☆'}
//                           </span>
//                         ))}
//                       </div>
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {review.comment}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {new Date(review.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button
//                         onClick={() => handleEdit(review)}
//                         className="text-blue-500 hover:underline flex items-center mr-2"
//                         aria-label={`Edit review ${review._id}`}
//                       >
//                         <FaEdit className="mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(review._id)}
//                         className="text-red-500 hover:underline flex items-center"
//                         aria-label={`Delete review ${review._id}`}
//                       >
//                         <FaTrash className="mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentReviews.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="7"
//                       className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No reviews found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Controls */}
//           {reviews.length > reviewsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   {/* Previous Page Button */}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1
//                           ? 'cursor-not-allowed opacity-50'
//                           : ''
//                       }`}
//                       aria-label="Previous Page"
//                     >
//                       <FaChevronLeft />
//                     </button>
//                   </li>

//                   {/* Page Numbers */}
//                   {[...Array(totalPages)].map((_, index) => (
//                     <li key={index + 1}>
//                       <button
//                         onClick={() => paginate(index + 1)}
//                         className={`px-3 py-2 leading-tight border border-gray-300 dark:border-gray-700 ${
//                           currentPage === index + 1
//                             ? 'text-blue-600 bg-blue-50 dark:bg-gray-700 dark:text-white'
//                             : 'text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
//                         }`}
//                         aria-label={`Go to page ${index + 1}`}
//                       >
//                         {index + 1}
//                       </button>
//                     </li>
//                   ))}

//                   {/* Next Page Button */}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage + 1)}
//                       disabled={currentPage === totalPages}
//                       className={`px-3 py-2 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === totalPages
//                           ? 'cursor-not-allowed opacity-50'
//                           : ''
//                       }`}
//                       aria-label="Next Page"
//                     >
//                       <FaChevronRight />
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           )}

//           {/* Add/Edit Review Modal */}
//           <Transition
//             show={showForm}
//             enter="transition ease-out duration-300 transform"
//             enterFrom="opacity-0 scale-95"
//             enterTo="opacity-100 scale-100"
//             leave="transition ease-in duration-200 transform"
//             leaveFrom="opacity-100 scale-100"
//             leaveTo="opacity-0 scale-95"
//           >
//             <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//               <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
//                 <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//                   {currentReview ? 'Edit Review' : 'Add New Review'}
//                 </h3>
//                 <form onSubmit={formik.handleSubmit}>
//                   {/* Product ID Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Product ID
//                     </label>
//                     <input
//                       type="text"
//                       name="productId"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.productId && formik.errors.productId
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.productId}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Enter Product ID"
//                     />
//                     {formik.touched.productId && formik.errors.productId && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.productId}
//                       </div>
//                     )}
//                   </div>

//                   {/* Rating Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Rating
//                     </label>
//                     <select
//                       name="rating"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.rating && formik.errors.rating
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.rating}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                     >
//                       <option value={5}>5 - Excellent</option>
//                       <option value={4}>4 - Very Good</option>
//                       <option value={3}>3 - Good</option>
//                       <option value={2}>2 - Fair</option>
//                       <option value={1}>1 - Poor</option>
//                     </select>
//                     {formik.touched.rating && formik.errors.rating && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.rating}
//                       </div>
//                     )}
//                   </div>

//                   {/* Comment Field */}
//                   <div className="mb-4">
//                     <label className="block text-gray-700 dark:text-gray-200">
//                       Comment
//                     </label>
//                     <textarea
//                       name="comment"
//                       rows="3"
//                       className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                         formik.touched.comment && formik.errors.comment
//                           ? 'border-red-500 focus:ring-red-200'
//                           : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                       }`}
//                       value={formik.values.comment}
//                       onChange={formik.handleChange}
//                       onBlur={formik.handleBlur}
//                       placeholder="Your feedback here..."
//                     ></textarea>
//                     {formik.touched.comment && formik.errors.comment && (
//                       <div className="text-red-500 text-sm mt-1">
//                         {formik.errors.comment}
//                       </div>
//                     )}
//                   </div>

//                   {/* Form Buttons */}
//                   <div className="flex justify-end">
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setShowForm(false);
//                         setCurrentReview(null);
//                         formik.resetForm();
//                       }}
//                       className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="submit"
//                       className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//                     >
//                       {currentReview ? 'Update' : 'Add'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </Transition>
//         </>
//       )}
//     </div>
//   );
// };

// export default Reviews;




