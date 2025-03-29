// src/pages/Products.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from '../redux/slices/productsSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Transition } from '@headlessui/react'; // For smooth modal transitions

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  const [showForm, setShowForm] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10; // 10 products per page

  useEffect(() => {
    dispatch(fetchProducts());
    // eslint-disable-next-line
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(products.length / productsPerPage);

  // Adjust current page if products change
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1);
    }
  }, [products, totalPages, currentPage]);

  // Determine products to display on current page
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const formik = useFormik({
    initialValues: {
      name: currentProduct ? currentProduct.name : '',
      subjectName: currentProduct ? currentProduct.subjectName : '',
      subjectCode: currentProduct ? currentProduct.subjectCode : '',
      price: currentProduct ? currentProduct.price : '',
      // NEW FIELDS:
      saleEnabled: currentProduct ? currentProduct.saleEnabled : false,
      salePrice:
        currentProduct && currentProduct.salePrice !== undefined
          ? currentProduct.salePrice
          : '',
      image: currentProduct ? currentProduct.image : '',
      description: currentProduct ? currentProduct.description : '',
      type: currentProduct ? currentProduct.type : 'exam', // Default type
      pdfLink: currentProduct ? currentProduct.pdfLink : '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      subjectName: Yup.string().required('Required'),
      subjectCode: Yup.string().required('Required'),
      price: Yup.number().positive('Must be positive').required('Required'),
      // Conditional validation for salePrice based on saleEnabled:
      salePrice: Yup.number().when('saleEnabled', {
        is: true,
        then: (schema) =>
          schema
            .positive('Sale Price must be a positive number')
            .required('Sale Price is required when sale is enabled'),
        otherwise: (schema) => schema,
      }),
      image: Yup.string().url('Invalid URL').required('Required'),
      description: Yup.string().required('Required'),
      type: Yup.string()
        .oneOf(['certificate', 'notes', 'exam'], 'Invalid Type')
        .required('Required'),
      pdfLink: Yup.string().url('Invalid URL').required('Required'),
    }),
    onSubmit: (values) => {
      if (currentProduct) {
        // Update product
        dispatch(updateProduct({ id: currentProduct._id, productData: values }))
          .unwrap()
          .then(() => {
            setShowForm(false);
            setCurrentProduct(null);
            formik.resetForm();
            setCurrentPage(1); // Reset to first page on update
          })
          .catch((err) => {
            console.error('Update Product Failed:', err);
          });
      } else {
        // Add new product
        dispatch(addProduct(values))
          .unwrap()
          .then(() => {
            setShowForm(false);
            formik.resetForm();
            setCurrentPage(1); // Reset to first page on add
          })
          .catch((err) => {
            console.error('Add Product Failed:', err);
          });
      }
    },
  });

  const handleEdit = (product) => {
    setCurrentProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product/exam?')) {
      dispatch(deleteProduct(id))
        .unwrap()
        .then(() => {
          const newTotalPages = Math.ceil((products.length - 1) / productsPerPage);
          if (currentPage > newTotalPages) {
            setCurrentPage(newTotalPages);
          }
        })
        .catch((err) => {
          console.error('Delete Product Failed:', err);
        });
    }
  };

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Products/Exams Management Title */}
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Products/Exams Management
      </h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Product/Exam Button */}
      <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
        aria-label="Add Product/Exam"
      >
        <FaPlus className="mr-2" />
        Add Product/Exam
      </button>

      {/* Products/Exams Table */}
      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {/* Product ID Column */}
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product ID
                  </th>
                  {/* Existing Columns */}
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subject Name
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subject Code
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    PDF Link
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {currentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    {/* Product ID Cell */}
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {product._id}
                    </td>
                    {/* Existing Cells */}
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {product.name}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {product.subjectName}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {product.subjectCode}
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">
                      {product.description}
                    </td>
                    <td className="py-2 px-4 text-sm capitalize text-gray-800 dark:text-gray-200">
                      {product.type}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      <a href={product.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        View PDF
                      </a>
                    </td>
                    <td className="py-5 px-4 text-sm flex items-center">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
                        aria-label={`Edit ${product.name}`}
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                        aria-label={`Delete ${product.name}`}
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentProducts.length === 0 && (
                  <tr>
                    {/* Update colSpan from 9 to 10 to include Product ID column */}
                    <td colSpan="10" className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
                      No products/exams found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {products.length > productsPerPage && (
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

      {/* Add/Edit Product Form */}
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto ">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              {currentProduct ? 'Edit Product/Exam' : 'Add New Product/Exam'}
            </h3>
            <form onSubmit={formik.handleSubmit}>
              {/* Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Name</label>
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
                  placeholder="Mathematics"
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
                )}
              </div>

              {/* Subject Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Subject Name</label>
                <input
                  type="text"
                  name="subjectName"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.subjectName && formik.errors.subjectName
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.subjectName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Algebra"
                />
                {formik.touched.subjectName && formik.errors.subjectName && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.subjectName}</div>
                )}
              </div>

              {/* Subject Code Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Subject Code</label>
                <input
                  type="text"
                  name="subjectCode"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.subjectCode && formik.errors.subjectCode
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.subjectCode}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="MATH101"
                />
                {formik.touched.subjectCode && formik.errors.subjectCode && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.subjectCode}</div>
                )}
              </div>

              {/* Price Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Price</label>
                <input
                  type="number"
                  name="price"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.price && formik.errors.price
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="49.99"
                />
                {formik.touched.price && formik.errors.price && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.price}</div>
                )}
              </div>

              {/* Sale Enabled Checkbox */}
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  name="saleEnabled"
                  id="saleEnabled"
                  checked={formik.values.saleEnabled}
                  onChange={formik.handleChange}
                  className="mr-2 h-5 w-5 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="saleEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sale Enabled
                </label>
              </div>

              {/* Conditionally Rendered Sale Price Field */}
              {formik.values.saleEnabled && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Sale Price
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formik.values.salePrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Sale Price"
                    step="0.01"
                    className={`mt-2 block w-full rounded-md border-gray-300 shadow-sm px-4 py-3 
                      focus:border-blue-500 focus:ring focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 
                      ${formik.touched.salePrice && formik.errors.salePrice ? 'border-red-500' : ''}`}
                  />
                  {formik.touched.salePrice && formik.errors.salePrice && (
                    <div className="text-red-500 text-xs mt-1">{formik.errors.salePrice}</div>
                  )}
                </div>
              )}

              {/* Image URL Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Image URL</label>
                <input
                  type="url"
                  name="image"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.image && formik.errors.image
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.image}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="https://example.com/image.jpg"
                />
                {formik.touched.image && formik.errors.image && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
                )}
              </div>

              {/* Description Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.description && formik.errors.description
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Detailed description of the product/exam."
                ></textarea>
                {formik.touched.description && formik.errors.description && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
                )}
              </div>

              {/* Type Dropdown Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">Type</label>
                <select
                  name="type"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.type && formik.errors.type
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="certificate">Certificate</option>
                  <option value="notes">Notes</option>
                  <option value="exam">Exam</option>
                </select>
                {formik.touched.type && formik.errors.type && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.type}</div>
                )}
              </div>

              {/* PDF Link Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">PDF Link</label>
                <input
                  type="url"
                  name="pdfLink"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.pdfLink && formik.errors.pdfLink
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.pdfLink}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="https://example.com/document.pdf"
                />
                {formik.touched.pdfLink && formik.errors.pdfLink && (
                  <div className="text-red-500 text-sm mt-1">{formik.errors.pdfLink}</div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentProduct(null);
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
                  {currentProduct ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Products;










// // src/pages/Products.jsx

// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
// } from '../redux/slices/productsSlice';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// import { Transition } from '@headlessui/react'; // For smooth modal transitions

// const Products = () => {
//   const dispatch = useDispatch();
//   const { products, loading, error } = useSelector((state) => state.products);

//   const [showForm, setShowForm] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null);

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const productsPerPage = 10; // 10 products per page

//   useEffect(() => {
//     dispatch(fetchProducts());
//     // eslint-disable-next-line
//   }, []);

//   // Calculate total pages
//   const totalPages = Math.ceil(products.length / productsPerPage);

//   // Adjust current page if products change
//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages || 1);
//     }
//   }, [products, totalPages, currentPage]);

//   // Determine products to display on current page
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

//   const formik = useFormik({
//     initialValues: {
//       name: currentProduct ? currentProduct.name : '',
//       subjectName: currentProduct ? currentProduct.subjectName : '',
//       subjectCode: currentProduct ? currentProduct.subjectCode : '',
//       price: currentProduct ? currentProduct.price : '',
//       image: currentProduct ? currentProduct.image : '',
//       description: currentProduct ? currentProduct.description : '',
//       type: currentProduct ? currentProduct.type : 'exam', // Default type
//       pdfLink: currentProduct ? currentProduct.pdfLink : '',
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       name: Yup.string().required('Required'),
//       subjectName: Yup.string().required('Required'),
//       subjectCode: Yup.string().required('Required'),
//       price: Yup.number().positive('Must be positive').required('Required'),
//       image: Yup.string().url('Invalid URL').required('Required'),
//       description: Yup.string().required('Required'),
//       type: Yup.string()
//         .oneOf(['certificate', 'notes', 'exam'], 'Invalid Type')
//         .required('Required'),
//       pdfLink: Yup.string().url('Invalid URL').required('Required'),
//     }),
//     onSubmit: (values) => {
//       if (currentProduct) {
//         // Update product
//         dispatch(updateProduct({ id: currentProduct._id, productData: values }))
//           .unwrap()
//           .then(() => {
//             setShowForm(false);
//             setCurrentProduct(null);
//             formik.resetForm();
//             setCurrentPage(1); // Reset to first page on update
//           })
//           .catch((err) => {
//             // Optionally handle errors (e.g., show a notification)
//             console.error('Update Product Failed:', err);
//           });
//       } else {
//         // Add new product
//         dispatch(addProduct(values))
//           .unwrap()
//           .then(() => {
//             setShowForm(false);
//             formik.resetForm();
//             setCurrentPage(1); // Reset to first page on add
//           })
//           .catch((err) => {
//             // Optionally handle errors (e.g., show a notification)
//             console.error('Add Product Failed:', err);
//           });
//       }
//     },
//   });

//   const handleEdit = (product) => {
//     setCurrentProduct(product);
//     setShowForm(true);
//   };

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this product/exam?')) {
//       dispatch(deleteProduct(id))
//         .unwrap()
//         .then(() => {
//           // Optionally adjust current page if necessary
//           const newTotalPages = Math.ceil((products.length - 1) / productsPerPage);
//           if (currentPage > newTotalPages) {
//             setCurrentPage(newTotalPages);
//           }
//         })
//         .catch((err) => {
//           // Optionally handle errors (e.g., show a notification)
//           console.error('Delete Product Failed:', err);
//         });
//     }
//   };

//   // Handle page change
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       {/* Products/Exams Management Title */}
//       <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Products/Exams Management</h2>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Add Product/Exam Button */}
//       <button
//         onClick={() => setShowForm(true)}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Product/Exam"
//       >
//         <FaPlus className="mr-2" />
//         Add Product/Exam
//       </button>

//       {/* Products/Exams Table */}
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   {/* Product ID Column */}
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Product ID
//                   </th>

//                   {/* Existing Columns */}
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject Name</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject Code</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PDF Link</th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentProducts.map((product) => (
//                   <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                     {/* Product ID Cell */}
//                     <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product._id}</td>

//                     {/* Existing Cells */}
//                     <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product.name}</td>
//                     <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product.subjectName}</td>
//                     <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product.subjectCode}</td>
//                     <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">${product.price.toFixed(2)}</td>
//                     <td className="py-2 px-4 text-sm">
//                       <img
//                         src={product.image}
//                         alt={product.name}
//                         className="w-12 h-12 object-cover rounded"
//                       />
//                     </td>
//                     <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product.description}</td>
//                     <td className="py-2 px-4 text-sm capitalize text-gray-800 dark:text-gray-200">{product.type}</td>
//                     <td className="py-2 px-4 text-sm">
//                       <a href={product.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//                         View PDF
//                       </a>
//                     </td>
//                     <td className="py-5 px-4 text-sm flex items-center">
//                       <button
//                         onClick={() => handleEdit(product)}
//                         className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
//                         aria-label={`Edit ${product.name}`}
//                       >
//                         <FaEdit className="mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(product._id)}
//                         className="text-red-500 hover:text-red-700 flex items-center"
//                         aria-label={`Delete ${product.name}`}
//                       >
//                         <FaTrash className="mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentProducts.length === 0 && (
//                   <tr>
//                     {/* Update colSpan from 9 to 10 to include Product ID column */}
//                     <td colSpan="10" className="py-4 px-6 text-center text-gray-600 dark:text-gray-400">
//                       No products/exams found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Controls */}
//           {products.length > productsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   {/* Previous Page Button */}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
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
//                         currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
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
//         </>
//       )}

//       {/* Add/Edit Product Form */}
//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
//             <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentProduct ? 'Edit Product/Exam' : 'Add New Product/Exam'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               {/* Name Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.name && formik.errors.name
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.name}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Mathematics"
//                 />
//                 {formik.touched.name && formik.errors.name && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
//                 )}
//               </div>

//               {/* Subject Name Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Subject Name</label>
//                 <input
//                   type="text"
//                   name="subjectName"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.subjectName && formik.errors.subjectName
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.subjectName}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Algebra"
//                 />
//                 {formik.touched.subjectName && formik.errors.subjectName && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.subjectName}</div>
//                 )}
//               </div>

//               {/* Subject Code Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Subject Code</label>
//                 <input
//                   type="text"
//                   name="subjectCode"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.subjectCode && formik.errors.subjectCode
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.subjectCode}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="MATH101"
//                 />
//                 {formik.touched.subjectCode && formik.errors.subjectCode && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.subjectCode}</div>
//                 )}
//               </div>

//               {/* Price Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Price</label>
//                 <input
//                   type="number"
//                   name="price"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.price && formik.errors.price
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.price}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="49.99"
//                 />
//                 {formik.touched.price && formik.errors.price && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.price}</div>
//                 )}
//               </div>

//               {/* Image URL Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Image URL</label>
//                 <input
//                   type="url"
//                   name="image"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.image && formik.errors.image
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.image}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="https://example.com/image.jpg"
//                 />
//                 {formik.touched.image && formik.errors.image && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
//                 )}
//               </div>

//               {/* Description Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Description</label>
//                 <textarea
//                   name="description"
//                   rows="3"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.description && formik.errors.description
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.description}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Detailed description of the product/exam."
//                 ></textarea>
//                 {formik.touched.description && formik.errors.description && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
//                 )}
//               </div>

//               {/* Type Dropdown Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Type</label>
//                 <select
//                   name="type"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.type && formik.errors.type
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.type}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                 >
//                   <option value="certificate">Certificate</option>
//                   <option value="notes">Notes</option>
//                   <option value="exam">Exam</option>
//                 </select>
//                 {formik.touched.type && formik.errors.type && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.type}</div>
//                 )}
//               </div>

//               {/* PDF Link Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">PDF Link</label>
//                 <input
//                   type="url"
//                   name="pdfLink"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.pdfLink && formik.errors.pdfLink
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.pdfLink}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="https://example.com/document.pdf"
//                 />
//                 {formik.touched.pdfLink && formik.errors.pdfLink && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.pdfLink}</div>
//                 )}
//               </div>

//               {/* Form Buttons */}
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentProduct(null);
//                     formik.resetForm();
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//                 >
//                   {currentProduct ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Products;





















// // src/pages/Products.jsx

// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
// } from '../redux/slices/productsSlice';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
// import { Transition } from '@headlessui/react'; // For smooth modal transitions

// const Products = () => {
//   const dispatch = useDispatch();
//   const { products, loading, error } = useSelector((state) => state.products);

//   const [showForm, setShowForm] = useState(false);
//   const [currentProduct, setCurrentProduct] = useState(null);

//   useEffect(() => {
//     dispatch(fetchProducts());
//     // eslint-disable-next-line
//   }, []);

//   const formik = useFormik({
//     initialValues: {
//       name: currentProduct ? currentProduct.name : '',
//       subjectName: currentProduct ? currentProduct.subjectName : '',
//       subjectCode: currentProduct ? currentProduct.subjectCode : '',
//       price: currentProduct ? currentProduct.price : '',
//       image: currentProduct ? currentProduct.image : '',
//       description: currentProduct ? currentProduct.description : '',
//       type: currentProduct ? currentProduct.type : 'exam', // Default type
//       pdfLink: currentProduct ? currentProduct.pdfLink : '',
//     },
//     enableReinitialize: true,
//     validationSchema: Yup.object({
//       name: Yup.string().required('Required'),
//       subjectName: Yup.string().required('Required'),
//       subjectCode: Yup.string().required('Required'),
//       price: Yup.number().positive('Must be positive').required('Required'),
//       image: Yup.string().url('Invalid URL').required('Required'),
//       description: Yup.string().required('Required'),
//       type: Yup.string()
//         .oneOf(['certificate', 'notes', 'exam'], 'Invalid Type')
//         .required('Required'),
//       pdfLink: Yup.string().url('Invalid URL').required('Required'),
//     }),
//     onSubmit: (values) => {
//       if (currentProduct) {
//         // Update product
//         dispatch(updateProduct({ id: currentProduct._id, productData: values }));
//       } else {
//         // Add new product
//         dispatch(addProduct(values));
//       }
//       setShowForm(false);
//       setCurrentProduct(null);
//       formik.resetForm();
//     },
//   });

//   const handleEdit = (product) => {
//     setCurrentProduct(product);
//     setShowForm(true);
//   };

//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this product/exam?')) {
//       dispatch(deleteProduct(id));
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Products/Exams Management</h2>
//       {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
//       <button
//         onClick={() => setShowForm(true)}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-4 flex items-center"
//         aria-label="Add Product/Exam"
//       >
//         <FaPlus className="mr-2" />
//         Add Product/Exam
//       </button>

//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//             <thead className="bg-gray-50 dark:bg-gray-700">
//               <tr>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject Name</th>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subject Code</th>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">PDF Link</th>
//                 <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {products.map((product) => (
//                 <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
//                   <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product.name}</td>
//                   <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product.subjectName}</td>
//                   <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product.subjectCode}</td>
//                   <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">${product.price.toFixed(2)}</td>
//                   <td className="py-2 px-4 text-sm">
//                     <img
//                       src={product.image}
//                       alt={product.name}
//                       className="w-12 h-12 object-cover rounded"
//                     />
//                   </td>
//                   <td className="py-2 px-4 text-sm text-gray-800 dark:text-gray-200">{product.description}</td>
//                   <td className="py-2 px-4 text-sm capitalize text-gray-800 dark:text-gray-200">{product.type}</td>
//                   <td className="py-2 px-4 text-sm">
//                     <a href={product.pdfLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
//                       View PDF
//                     </a>
//                   </td>
//                   <td className="py-5 px-4 text-sm flex items-center">
//                     <button
//                       onClick={() => handleEdit(product)}
//                       className="text-blue-500 hover:text-blue-700 mr-2 flex items-center"
//                       aria-label={`Edit ${product.name}`}
//                     >
//                       <FaEdit className="mr-1" />
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(product._id)}
//                       className="text-red-500 hover:text-red-700 flex items-center"
//                       aria-label={`Delete ${product.name}`}
//                     >
//                       <FaTrash className="mr-1" />
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {products.length === 0 && (
//                 <tr>
//                   <td colSpan="9" className="text-center py-4 text-gray-600 dark:text-gray-400">
//                     No products/exams found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Add/Edit Product Form */}
//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
//             <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentProduct ? 'Edit Product/Exam' : 'Add New Product/Exam'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               {/* Name Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Name</label>
//                 <input
//                   type="text"
//                   name="name"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.name && formik.errors.name
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.name}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Mathematics"
//                 />
//                 {formik.touched.name && formik.errors.name && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
//                 )}
//               </div>

//               {/* Subject Name Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Subject Name</label>
//                 <input
//                   type="text"
//                   name="subjectName"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.subjectName && formik.errors.subjectName
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.subjectName}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Algebra"
//                 />
//                 {formik.touched.subjectName && formik.errors.subjectName && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.subjectName}</div>
//                 )}
//               </div>

//               {/* Subject Code Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Subject Code</label>
//                 <input
//                   type="text"
//                   name="subjectCode"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.subjectCode && formik.errors.subjectCode
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.subjectCode}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="MATH101"
//                 />
//                 {formik.touched.subjectCode && formik.errors.subjectCode && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.subjectCode}</div>
//                 )}
//               </div>

//               {/* Price Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Price</label>
//                 <input
//                   type="number"
//                   name="price"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.price && formik.errors.price
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.price}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="49.99"
//                 />
//                 {formik.touched.price && formik.errors.price && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.price}</div>
//                 )}
//               </div>

//               {/* Image URL Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Image URL</label>
//                 <input
//                   type="url"
//                   name="image"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.image && formik.errors.image
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.image}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="https://example.com/image.jpg"
//                 />
//                 {formik.touched.image && formik.errors.image && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
//                 )}
//               </div>

//               {/* Description Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Description</label>
//                 <textarea
//                   name="description"
//                   rows="3"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.description && formik.errors.description
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.description}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Detailed description of the product/exam."
//                 ></textarea>
//                 {formik.touched.description && formik.errors.description && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
//                 )}
//               </div>

//               {/* Type Dropdown Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Type</label>
//                 <select
//                   name="type"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.type && formik.errors.type
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.type}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                 >
//                   <option value="certificate">Certificate</option>
//                   <option value="notes">Notes</option>
//                   <option value="exam">Exam</option>
//                 </select>
//                 {formik.touched.type && formik.errors.type && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.type}</div>
//                 )}
//               </div>

//               {/* PDF Link Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">PDF Link</label>
//                 <input
//                   type="url"
//                   name="pdfLink"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.pdfLink && formik.errors.pdfLink
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.pdfLink}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="https://example.com/document.pdf"
//                 />
//                 {formik.touched.pdfLink && formik.errors.pdfLink && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.pdfLink}</div>
//                 )}
//               </div>

//               {/* Form Buttons */}
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentProduct(null);
//                     formik.resetForm();
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//                 >
//                   {currentProduct ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Products;










// // src/pages/Products.jsx

// import React, { useEffect, useState } from 'react';
// // import { useDispatch, useSelector } from 'react-redux'; // Redux hooks (commented out since backend is not connected)
// // import {
// //   fetchProducts,
// //   addProduct,
// //   updateProduct,
// //   deleteProduct,
// // } from '../redux/slices/productsSlice'; // Redux actions (commented out since backend is not connected)
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaChevronLeft,
//   FaChevronRight,
// } from 'react-icons/fa';
// import { Transition } from '@headlessui/react'; // For smooth modal transitions

// const Products = () => {
//   // const dispatch = useDispatch();
//   // const { products, loading, error } = useSelector((state) => state.products); // Backend connected

//   // Dummy data for products/exams
//   const initialProducts = [
//     {
//       _id: '1',
//       name: 'Mathematics Exam',
//       subjectName: 'Algebra',
//       subjectCode: 'MATH101',
//       price: 49.99,
//       image: 'https://th.bing.com/th/id/R.98267fb8788825d8e036dd2e2355803b?rik=dfr86vURH0leNQ&pid=ImgRaw&r=0',
//       description: 'Comprehensive Algebra exam covering all topics.',
//     },
//     {
//       _id: '2',
//       name: 'Physics Exam',
//       subjectName: 'Mechanics',
//       subjectCode: 'PHY201',
//       price: 59.99,
//       image: 'https://images-na.ssl-images-amazon.com/images/I/51sPUiBtNNL.jpg',
//       description: 'Advanced Mechanics exam for undergraduate students.',
//     },
//     {
//       _id: '3',
//       name: 'Chemistry Exam',
//       subjectName: 'Organic Chemistry',
//       subjectCode: 'CHEM301',
//       price: 54.99,
//       image: 'https://images-na.ssl-images-amazon.com/images/I/51sPUiBtNNL.jpg',
//       description: 'Detailed Organic Chemistry exam covering synthesis and reactions.',
//     },
//     // Add more dummy products/exams as needed for testing pagination
//     {
//       _id: '4',
//       name: 'Biology Exam',
//       subjectName: 'Genetics',
//       subjectCode: 'BIO401',
//       price: 44.99,
//       image: 'https://th.bing.com/th/id/R.98267fb8788825d8e036dd2e2355803b?rik=dfr86vURH0leNQ&pid=ImgRaw&r=0',
//       description: 'Genetics exam focusing on DNA replication and gene expression.',
//     },
//     {
//       _id: '5',
//       name: 'English Exam',
//       subjectName: 'Literature',
//       subjectCode: 'ENG501',
//       price: 39.99,
//       image: 'https://th.bing.com/th/id/OIP.ZhhhDx9uxUPLoZv-F0BYqAAAAA?w=385&h=500&rs=1&pid=ImgDetMain',
//       description: 'Literature exam covering classical and modern works.',
//     },
//     {
//       _id: '6',
//       name: 'Computer Science Exam',
//       subjectName: 'Algorithms',
//       subjectCode: 'CS601',
//       price: 64.99,
//       image: 'https://images-na.ssl-images-amazon.com/images/I/51sPUiBtNNL.jpg',
//       description: 'Algorithms exam testing problem-solving and computational thinking.',
//     },
//     {
//       _id: '7',
//       name: 'History Exam',
//       subjectName: 'World History',
//       subjectCode: 'HIST701',
//       price: 49.99,
//       image: 'https://th.bing.com/th/id/R.98267fb8788825d8e036dd2e2355803b?rik=dfr86vURH0leNQ&pid=ImgRaw&r=0',
//       description: 'World History exam covering major historical events and figures.',
//     },
//     {
//       _id: '8',
//       name: 'Geography Exam',
//       subjectName: 'Physical Geography',
//       subjectCode: 'GEO801',
//       price: 45.99,
//       image: 'https://images-na.ssl-images-amazon.com/images/I/51sPUiBtNNL.jpg',
//       description: 'Physical Geography exam focusing on earth systems and landscapes.',
//     },
//     {
//       _id: '9',
//       name: 'Economics Exam',
//       subjectName: 'Microeconomics',
//       subjectCode: 'ECON901',
//       price: 55.99,
//       image: 'https://th.bing.com/th/id/OIP.ZhhhDx9uxUPLoZv-F0BYqAAAAA?w=385&h=500&rs=1&pid=ImgDetMain',
//       description: 'Microeconomics exam covering supply and demand, market structures.',
//     },
//     {
//       _id: '10',
//       name: 'Art Exam',
//       subjectName: 'Modern Art',
//       subjectCode: 'ART1001',
//       price: 42.99,
//       image: 'https://th.bing.com/th/id/R.98267fb8788825d8e036dd2e2355803b?rik=dfr86vURH0leNQ&pid=ImgRaw&r=0',
//       description: 'Modern Art exam exploring various art movements and techniques.',
//     },
//     // ... add more products/exams as needed
//   ];

//   const [products, setProducts] = useState([]); // Local state for products/exams
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [showForm, setShowForm] = useState(false); // Controls form visibility
//   const [currentProduct, setCurrentProduct] = useState(null); // Holds product/exam data for editing

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const productsPerPage = 5; // Adjust as needed

//   // Fetch products/exams (dummy fetch)
//   useEffect(() => {
//     // Commenting out backend dispatches since backend is not connected
//     // dispatch(fetchProducts());

//     // Simulate fetching data with dummy products/exams
//     setLoading(true);
//     setTimeout(() => {
//       setProducts(initialProducts);
//       setLoading(false);
//     }, 1000); // Simulate network delay
//   }, []);

//   // Formik setup for add/edit product/exam
//   const formik = useFormik({
//     initialValues: {
//       name: currentProduct ? currentProduct.name : '',
//       subjectName: currentProduct ? currentProduct.subjectName : '',
//       subjectCode: currentProduct ? currentProduct.subjectCode : '',
//       price: currentProduct ? currentProduct.price : '',
//       image: currentProduct ? currentProduct.image : '',
//       description: currentProduct ? currentProduct.description : '',
//     },
//     enableReinitialize: true, // Reinitialize form when currentProduct changes
//     validationSchema: Yup.object({
//       name: Yup.string().required('Name is required'),
//       subjectName: Yup.string().required('Subject Name is required'),
//       subjectCode: Yup.string().required('Subject Code is required'),
//       price: Yup.number()
//         .positive('Price must be a positive number')
//         .required('Price is required'),
//       image: Yup.string().url('Invalid URL').required('Image URL is required'),
//       description: Yup.string().required('Description is required'),
//     }),
//     onSubmit: (values) => {
//       if (currentProduct) {
//         // Update product/exam
//         const updatedProduct = { ...currentProduct, ...values };
//         // dispatch(updateProduct({ id: currentProduct._id, productData: updatedProduct })); // Backend connected

//         // For dummy data, update local state
//         setProducts((prevProducts) =>
//           prevProducts.map((product) =>
//             product._id === currentProduct._id ? updatedProduct : product
//           )
//         );
//       } else {
//         // Add new product/exam
//         const newProduct = {
//           _id: (products.length + 1).toString(),
//           ...values,
//         };
//         // dispatch(addProduct(newProduct)); // Backend connected

//         // For dummy data, add to local state
//         setProducts((prevProducts) => [...prevProducts, newProduct]);
//       }
//       setShowForm(false);
//       setCurrentProduct(null);
//       formik.resetForm();
//       setCurrentPage(1); // Reset to first page on add/update
//     },
//   });

//   // Handle edit button click
//   const handleEdit = (product) => {
//     setCurrentProduct(product);
//     setShowForm(true);
//   };

//   // Handle delete button click
//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this product/exam?')) {
//       // dispatch(deleteProduct(id)); // Backend connected

//       // For dummy data, remove from local state
//       setProducts((prevProducts) => prevProducts.filter((product) => product._id !== id));

//       // Adjust current page if necessary
//       const indexOfLastProduct = currentPage * productsPerPage;
//       const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//       const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
//       if (currentProducts.length === 1 && currentPage > 1) {
//         setCurrentPage(currentPage - 1);
//       }
//     }
//   };

//   // Calculate pagination details
//   const indexOfLastProduct = currentPage * productsPerPage;
//   const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
//   const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
//   const totalPages = Math.ceil(products.length / productsPerPage);

//   // Handle page change
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       {/* Products/Exams Management Title */}
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
//         Products/Exams Management
//       </h2>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Add Product/Exam Button */}
//       <button
//         onClick={() => setShowForm(true)}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Product/Exam"
//       >
//         <FaPlus className="mr-2" />
//         Add Product/Exam
//       </button>

//       {/* Products/Exams Table */}
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Name
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Subject Name
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Subject Code
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Price
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Image
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Description
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//                 {currentProducts.map((product) => (
//                   <tr
//                     key={product._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {product.name}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {product.subjectName}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {product.subjectCode}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       ${product.price.toFixed(2)}
//                     </td>
//                     <td className="py-4 px-6 text-sm">
//                       <img
//                         src={product.image}
//                         alt={product.name}
//                         className="w-12 h-12 object-cover rounded"
//                       />
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {product.description}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button
//                         onClick={() => handleEdit(product)}
//                         className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
//                         aria-label={`Edit ${product.name}`}
//                       >
//                         <FaEdit className="mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(product._id)}
//                         className="text-red-500 hover:text-red-700 flex items-center"
//                         aria-label={`Delete ${product.name}`}
//                       >
//                         <FaTrash className="mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentProducts.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="7"
//                       className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No products/exams found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Controls */}
//           {products.length > productsPerPage && (
//             <div className="flex justify-center mt-6">
//               <nav aria-label="Page navigation">
//                 <ul className="inline-flex -space-x-px">
//                   {/* Previous Page Button */}
//                   <li>
//                     <button
//                       onClick={() => paginate(currentPage - 1)}
//                       disabled={currentPage === 1}
//                       className={`px-3 py-2 ml-0 leading-tight text-gray-500 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                         currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
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
//                         currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
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
//         </>
//       )}

//       {/* Add/Edit Product/Exam Modal */}
//       <Transition
//         show={showForm}
//         enter="transition ease-out duration-300 transform"
//         enterFrom="opacity-0 scale-95"
//         enterTo="opacity-100 scale-100"
//         leave="transition ease-in duration-200 transform"
//         leaveFrom="opacity-100 scale-100"
//         leaveTo="opacity-0 scale-95"
//       >
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-4 overflow-y-auto">
//             <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
//               {currentProduct ? 'Edit Product/Exam' : 'Add New Product/Exam'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               {/* Name Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.name && formik.errors.name
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.name}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Mathematics Exam"
//                 />
//                 {formik.touched.name && formik.errors.name && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
//                 )}
//               </div>

//               {/* Subject Name Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Subject Name
//                 </label>
//                 <input
//                   type="text"
//                   name="subjectName"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.subjectName && formik.errors.subjectName
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.subjectName}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Algebra"
//                 />
//                 {formik.touched.subjectName && formik.errors.subjectName && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.subjectName}</div>
//                 )}
//               </div>

//               {/* Subject Code Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Subject Code
//                 </label>
//                 <input
//                   type="text"
//                   name="subjectCode"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.subjectCode && formik.errors.subjectCode
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.subjectCode}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="MATH101"
//                 />
//                 {formik.touched.subjectCode && formik.errors.subjectCode && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.subjectCode}</div>
//                 )}
//               </div>

//               {/* Price Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Price
//                 </label>
//                 <input
//                   type="number"
//                   name="price"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.price && formik.errors.price
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.price}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="49.99"
//                 />
//                 {formik.touched.price && formik.errors.price && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.price}</div>
//                 )}
//               </div>

//               {/* Image URL Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Image URL
//                 </label>
//                 <input
//                   type="url"
//                   name="image"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.image && formik.errors.image
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.image}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="https://example.com/image.jpg"
//                 />
//                 {formik.touched.image && formik.errors.image && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
//                 )}
//               </div>

//               {/* Description Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   rows="3"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.description && formik.errors.description
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.description}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="Detailed description of the product/exam."
//                 ></textarea>
//                 {formik.touched.description && formik.errors.description && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.description}</div>
//                 )}
//               </div>

//               {/* Form Buttons */}
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentProduct(null);
//                     formik.resetForm();
//                   }}
//                   className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
//                 >
//                   {currentProduct ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Products;
