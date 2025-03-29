// src/pages/Orders.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Redux hooks
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

import {
  fetchOrders,
  // addOrder,
  updateOrderStatus,
  deleteOrder,
} from '../redux/slices/ordersSlice'; // Import Redux actions

const Orders = () => {
  const dispatch = useDispatch();
  
  // Access orders state from Redux
  const { orders, loading, error } = useSelector((state) => state.orders);
  
  // Local state for controlling the Add/Edit Order/Cart Form
  const [showForm, setShowForm] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10; // Adjust as needed

  // Fetch orders from the backend on component mount
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // Formik setup for add/edit order/cart
  const formik = useFormik({
    initialValues: {
      orderId: currentOrder ? currentOrder.orderId : '',
      userName: currentOrder ? currentOrder.user.name : '',
      userEmail: currentOrder ? currentOrder.user.email : '',
      totalPrice: currentOrder ? currentOrder.totalPrice : '',
      status: currentOrder ? currentOrder.status : 'Pending',
      createdAt: currentOrder
        ? new Date(currentOrder.createdAt).toISOString().substr(0, 10)
        : '', // Format to YYYY-MM-DD
    },
    enableReinitialize: true, // Reinitialize form when currentOrder changes
    validationSchema: Yup.object({
      orderId: Yup.string().required('Order ID is required'),
      userName: Yup.string().required('User Name is required'),
      userEmail: Yup.string()
        .email('Invalid Email')
        .required('User Email is required'),
      totalPrice: Yup.number()
        .positive('Total Price must be a positive number')
        .required('Total Price is required'),
      status: Yup.string()
        .oneOf(
          ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
          'Invalid Status'
        )
        .required('Status is required'),
      createdAt: Yup.date().required('Creation Date is required'),
    }),
    // onSubmit: async (values) => {
    //   if (currentOrder) {
    //     // Update order/cart
    //     try {
    //       await dispatch(
    //         updateOrderStatus({ id: currentOrder._id, status: values.status })
    //       ).unwrap();
    //       setShowForm(false);
    //       setCurrentOrder(null);
    //       formik.resetForm();
    //       setCurrentPage(1); // Reset to first page on add/update
    //     } catch (err) {
    //       console.error('Update Order Error:', err);
    //       // Optionally, set local error state or display a notification
    //     }
    //   } else {
    //     // Add new order/cart
    //     const newOrderData = {
    //       orderId: values.orderId,
    //       user: { name: values.userName, email: values.userEmail },
    //       totalPrice: parseFloat(values.totalPrice),
    //       status: values.status,
    //       createdAt: new Date(values.createdAt).toISOString(),
    //     };
    //     try {
    //       await dispatch(addOrder(newOrderData)).unwrap();
    //       setShowForm(false);
    //       formik.resetForm();
    //       setCurrentPage(1); // Reset to first page on add/update
    //     } catch (err) {
    //       console.error('Add Order Error:', err);
    //       // Optionally, set local error state or display a notification
    //     }
    //   }
    // },
  });

  // Handle edit button click
  const handleEdit = (order) => {
    setCurrentOrder(order);
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order/cart?')) {
      try {
        await dispatch(deleteOrder(id)).unwrap();
        
        // Adjust current page if necessary
        const indexOfLastOrder = currentPage * ordersPerPage;
        const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
        const currentOrdersSlice = orders.slice(indexOfFirstOrder, indexOfLastOrder);
        if (currentOrdersSlice.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (err) {
        console.error('Delete Order Error:', err);
        // Optionally, set local error state or display a notification
      }
    }
  };

  // Handle status change directly from the table
  const handleStatusChange = async (id, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
    } catch (err) {
      console.error('Update Status Error:', err);
      // Optionally, set local error state or display a notification
    }
  };

  // Calculate pagination details
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      {/* Orders/Carts Management Title */}
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Orders/Carts Management
      </h2>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Add Order/Cart Button */}
      {/* <button
        onClick={() => setShowForm(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
        aria-label="Add Order/Cart"
      >
        <FaPlus className="mr-2" />
        Add Order/Cart
      </button> */}

      {/* Orders/Carts Table */}
      {loading ? (
        <div className="text-gray-800 dark:text-gray-200">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Price
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
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
                {currentOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {order._id}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {order.user.name} ({order.user.email})
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      ${order.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-sm capitalize text-gray-800 dark:text-gray-200">
                    {order.status}
                      {/* <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded focus:outline-none focus:ring"
                        aria-label={`Change status for order ${order.orderId}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select> */}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
                      {/* <button
                        onClick={() => handleEdit(order)}
                        className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
                        aria-label={`Edit order ${order.orderId}`}
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button> */}
                      <button
                        onClick={() => handleDelete(order._id)}
                        className="text-red-500 hover:text-red-700 flex items-center"
                        aria-label={`Delete order ${order.orderId}`}
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {currentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
                    >
                      No orders/carts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {orders.length > ordersPerPage && (
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

      {/* Add/Edit Order/Cart Modal */}
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
              {currentOrder ? 'Edit Order/Cart' : 'Add New Order/Cart'}
            </h3>
            <form onSubmit={formik.handleSubmit}>
              {/* Order ID Field */}
              {/* <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Order ID
                </label>
                <input
                  type="text"
                  name="orderId"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.orderId && formik.errors.orderId
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.orderId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="ORD1001"
                />
                {formik.touched.orderId && formik.errors.orderId && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.orderId}
                  </div>
                )}
              </div> */}

              {/* User Name Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  User Name
                </label>
                <input
                  type="text"
                  name="userName"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.userName && formik.errors.userName
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.userName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="John Doe"
                />
                {formik.touched.userName && formik.errors.userName && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.userName}
                  </div>
                )}
              </div>

              {/* User Email Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  User Email
                </label>
                <input
                  type="email"
                  name="userEmail"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.userEmail && formik.errors.userEmail
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.userEmail}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="john@example.com"
                />
                {formik.touched.userEmail && formik.errors.userEmail && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.userEmail}
                  </div>
                )}
              </div>

              {/* Total Price Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Total Price
                </label>
                <input
                  type="number"
                  name="totalPrice"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.totalPrice && formik.errors.totalPrice
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.totalPrice}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="150.75"
                  step="0.01"
                />
                {formik.touched.totalPrice && formik.errors.totalPrice && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.totalPrice}
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
                  <option value="Completed">Completed</option>
                  {/* <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option> */}
                </select>
                {formik.touched.status && formik.errors.status && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.status}
                  </div>
                )}
              </div>

              {/* Created At Field */}
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-200">
                  Creation Date
                </label>
                <input
                  type="date"
                  name="createdAt"
                  className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
                    formik.touched.createdAt && formik.errors.createdAt
                      ? 'border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
                  }`}
                  value={formik.values.createdAt}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.createdAt && formik.errors.createdAt && (
                  <div className="text-red-500 text-sm mt-1">
                    {formik.errors.createdAt}
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setCurrentOrder(null);
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
                  {currentOrder ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  );
};

export default Orders;
























// // src/pages/Orders.jsx

// import React, { useEffect, useState } from 'react';
// // import { useDispatch, useSelector } from 'react-redux'; // Redux hooks (commented out since backend is not connected)
// // import {
// //   fetchOrders,
// //   updateOrderStatus,
// //   deleteOrder,
// //   addOrder,
// // } from '../redux/slices/ordersSlice'; // Redux actions (commented out since backend is not connected)
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

// const Orders = () => {
//   // const dispatch = useDispatch();
//   // const { orders, loading, error } = useSelector((state) => state.orders); // Backend connected

//   // Dummy data for orders/carts
//   const initialOrders = [
//     {
//       _id: '1',
//       orderId: 'ORD1001',
//       user: { name: 'John Doe', email: 'john@example.com' },
//       totalPrice: 150.75,
//       status: 'Pending',
//       createdAt: '2024-04-20T10:30:00Z',
//     },
//     {
//       _id: '2',
//       orderId: 'ORD1002',
//       user: { name: 'Jane Smith', email: 'jane@example.com' },
//       totalPrice: 299.99,
//       status: 'Processing',
//       createdAt: '2024-04-21T14:15:00Z',
//     },
//     {
//       _id: '3',
//       orderId: 'ORD1003',
//       user: { name: 'Alice Johnson', email: 'alice@example.com' },
//       totalPrice: 89.5,
//       status: 'Shipped',
//       createdAt: '2024-04-22T09:45:00Z',
//     },
//     // Add more dummy orders/carts as needed for testing pagination
//     {
//       _id: '4',
//       orderId: 'ORD1004',
//       user: { name: 'Bob Williams', email: 'bob@example.com' },
//       totalPrice: 120.0,
//       status: 'Delivered',
//       createdAt: '2024-04-23T11:20:00Z',
//     },
//     {
//       _id: '5',
//       orderId: 'ORD1005',
//       user: { name: 'Carol Davis', email: 'carol@example.com' },
//       totalPrice: 75.25,
//       status: 'Cancelled',
//       createdAt: '2024-04-24T16:05:00Z',
//     },
//     {
//       _id: '6',
//       orderId: 'ORD1006',
//       user: { name: 'David Martinez', email: 'david@example.com' },
//       totalPrice: 200.0,
//       status: 'Pending',
//       createdAt: '2024-04-25T13:50:00Z',
//     },
//     {
//       _id: '7',
//       orderId: 'ORD1007',
//       user: { name: 'Eva Green', email: 'eva@example.com' },
//       totalPrice: 350.0,
//       status: 'Processing',
//       createdAt: '2024-04-26T08:30:00Z',
//     },
//     {
//       _id: '8',
//       orderId: 'ORD1008',
//       user: { name: 'Frank Harris', email: 'frank@example.com' },
//       totalPrice: 99.99,
//       status: 'Shipped',
//       createdAt: '2024-04-27T12:10:00Z',
//     },
//     {
//       _id: '9',
//       orderId: 'ORD1009',
//       user: { name: 'Grace Lee', email: 'grace@example.com' },
//       totalPrice: 180.5,
//       status: 'Delivered',
//       createdAt: '2024-04-28T17:25:00Z',
//     },
//     {
//       _id: '10',
//       orderId: 'ORD1010',
//       user: { name: 'Henry Adams', email: 'henry@example.com' },
//       totalPrice: 60.0,
//       status: 'Cancelled',
//       createdAt: '2024-04-29T15:40:00Z',
//     },
//     // ... add more orders/carts as needed
//   ];

//   const [orders, setOrders] = useState([]); // Local state for orders/carts
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [showForm, setShowForm] = useState(false); // Controls form visibility
//   const [currentOrder, setCurrentOrder] = useState(null); // Holds order/cart data for editing

//   // Pagination states
//   const [currentPage, setCurrentPage] = useState(1);
//   const ordersPerPage = 5; // Adjust as needed

//   // Fetch orders/carts (dummy fetch)
//   useEffect(() => {
//     // Commenting out backend dispatches since backend is not connected
//     // dispatch(fetchOrders());

//     // Simulate fetching data with dummy orders/carts
//     setLoading(true);
//     setTimeout(() => {
//       setOrders(initialOrders);
//       setLoading(false);
//     }, 1000); // Simulate network delay
//   }, []);

//   // Formik setup for add/edit order/cart
//   const formik = useFormik({
//     initialValues: {
//       orderId: currentOrder ? currentOrder.orderId : '',
//       userName: currentOrder ? currentOrder.user.name : '',
//       userEmail: currentOrder ? currentOrder.user.email : '',
//       totalPrice: currentOrder ? currentOrder.totalPrice : '',
//       status: currentOrder ? currentOrder.status : 'Pending',
//       createdAt: currentOrder ? currentOrder.createdAt : '',
//     },
//     enableReinitialize: true, // Reinitialize form when currentOrder changes
//     validationSchema: Yup.object({
//       orderId: Yup.string().required('Order ID is required'),
//       userName: Yup.string().required('User Name is required'),
//       userEmail: Yup.string().email('Invalid Email').required('User Email is required'),
//       totalPrice: Yup.number()
//         .positive('Total Price must be a positive number')
//         .required('Total Price is required'),
//       status: Yup.string()
//         .oneOf(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], 'Invalid Status')
//         .required('Status is required'),
//       createdAt: Yup.date().required('Creation Date is required'),
//     }),
//     onSubmit: (values) => {
//       if (currentOrder) {
//         // Update order/cart
//         const updatedOrder = {
//           ...currentOrder,
//           orderId: values.orderId,
//           user: { name: values.userName, email: values.userEmail },
//           totalPrice: parseFloat(values.totalPrice),
//           status: values.status,
//           createdAt: values.createdAt,
//         };
//         // dispatch(updateOrderStatus({ id: currentOrder._id, status: values.status })); // Backend connected

//         // For dummy data, update local state
//         setOrders((prevOrders) =>
//           prevOrders.map((order) =>
//             order._id === currentOrder._id ? updatedOrder : order
//           )
//         );
//       } else {
//         // Add new order/cart
//         const newOrder = {
//           _id: (orders.length + 1).toString(),
//           orderId: values.orderId,
//           user: { name: values.userName, email: values.userEmail },
//           totalPrice: parseFloat(values.totalPrice),
//           status: values.status,
//           createdAt: values.createdAt,
//         };
//         // dispatch(addOrder(newOrder)); // Backend connected

//         // For dummy data, add to local state
//         setOrders((prevOrders) => [...prevOrders, newOrder]);
//       }
//       setShowForm(false);
//       setCurrentOrder(null);
//       formik.resetForm();
//       setCurrentPage(1); // Reset to first page on add/update
//     },
//   });

//   // Handle edit button click
//   const handleEdit = (order) => {
//     setCurrentOrder(order);
//     setShowForm(true);
//   };

//   // Handle delete button click
//   const handleDelete = (id) => {
//     if (window.confirm('Are you sure you want to delete this order/cart?')) {
//       // dispatch(deleteOrder(id)); // Backend connected

//       // For dummy data, remove from local state
//       setOrders((prevOrders) => prevOrders.filter((order) => order._id !== id));

//       // Adjust current page if necessary
//       const indexOfLastOrder = currentPage * ordersPerPage;
//       const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
//       const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
//       if (currentOrders.length === 1 && currentPage > 1) {
//         setCurrentPage(currentPage - 1);
//       }
//     }
//   };

//   // Calculate pagination details
//   const indexOfLastOrder = currentPage * ordersPerPage;
//   const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
//   const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
//   const totalPages = Math.ceil(orders.length / ordersPerPage);

//   // Handle page change
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   return (
//     <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
//       {/* Orders/Carts Management Title */}
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
//         Orders/Carts Management
//       </h2>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Add Order/Cart Button */}
//       <button
//         onClick={() => setShowForm(true)}
//         className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition mb-6 flex items-center"
//         aria-label="Add Order/Cart"
//       >
//         <FaPlus className="mr-2" />
//         Add Order/Cart
//       </button>

//       {/* Orders/Carts Table */}
//       {loading ? (
//         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Order ID
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     User
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Total Price
//                   </th>
//                   <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
//                     Status
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
//                 {currentOrders.map((order) => (
//                   <tr
//                     key={order._id}
//                     className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                   >
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {order.orderId}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {order.user.name} ({order.user.email})
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       ${order.totalPrice.toFixed(2)}
//                     </td>
//                     <td className="py-4 px-6 text-sm capitalize text-gray-800 dark:text-gray-200">
//                       <select
//                         value={order.status}
//                         onChange={(e) => handleStatusChange(order._id, e.target.value)}
//                         className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded focus:outline-none focus:ring"
//                         aria-label={`Change status for order ${order.orderId}`}
//                       >
//                         <option value="Pending">Pending</option>
//                         <option value="Processing">Processing</option>
//                         <option value="Shipped">Shipped</option>
//                         <option value="Delivered">Delivered</option>
//                         <option value="Cancelled">Cancelled</option>
//                       </select>
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200">
//                       {new Date(order.createdAt).toLocaleDateString()}
//                     </td>
//                     <td className="py-4 px-6 text-sm text-gray-800 dark:text-gray-200 flex items-center">
//                       <button
//                         onClick={() => handleEdit(order)}
//                         className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
//                         aria-label={`Edit order ${order.orderId}`}
//                       >
//                         <FaEdit className="mr-1" />
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleDelete(order._id)}
//                         className="text-red-500 hover:text-red-700 flex items-center"
//                         aria-label={`Delete order ${order.orderId}`}
//                       >
//                         <FaTrash className="mr-1" />
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {currentOrders.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan="6"
//                       className="py-4 px-6 text-center text-gray-600 dark:text-gray-400"
//                     >
//                       No orders/carts found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination Controls */}
//           {orders.length > ordersPerPage && (
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

//       {/* Add/Edit Order/Cart Modal */}
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
//               {currentOrder ? 'Edit Order/Cart' : 'Add New Order/Cart'}
//             </h3>
//             <form onSubmit={formik.handleSubmit}>
//               {/* Order ID Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Order ID</label>
//                 <input
//                   type="text"
//                   name="orderId"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.orderId && formik.errors.orderId
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.orderId}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="ORD1001"
//                 />
//                 {formik.touched.orderId && formik.errors.orderId && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.orderId}</div>
//                 )}
//               </div>

//               {/* User Name Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">User Name</label>
//                 <input
//                   type="text"
//                   name="userName"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.userName && formik.errors.userName
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.userName}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="John Doe"
//                 />
//                 {formik.touched.userName && formik.errors.userName && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.userName}</div>
//                 )}
//               </div>

//               {/* User Email Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">User Email</label>
//                 <input
//                   type="email"
//                   name="userEmail"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.userEmail && formik.errors.userEmail
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.userEmail}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="john@example.com"
//                 />
//                 {formik.touched.userEmail && formik.errors.userEmail && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.userEmail}</div>
//                 )}
//               </div>

//               {/* Total Price Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Total Price</label>
//                 <input
//                   type="number"
//                   name="totalPrice"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.totalPrice && formik.errors.totalPrice
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.totalPrice}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   placeholder="150.75"
//                   step="0.01"
//                 />
//                 {formik.touched.totalPrice && formik.errors.totalPrice && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.totalPrice}</div>
//                 )}
//               </div>

//               {/* Status Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Status</label>
//                 <select
//                   name="status"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.status && formik.errors.status
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.status}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                 >
//                   <option value="Pending">Pending</option>
//                   <option value="Processing">Processing</option>
//                   <option value="Shipped">Shipped</option>
//                   <option value="Delivered">Delivered</option>
//                   <option value="Cancelled">Cancelled</option>
//                 </select>
//                 {formik.touched.status && formik.errors.status && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.status}</div>
//                 )}
//               </div>

//               {/* Created At Field */}
//               <div className="mb-4">
//                 <label className="block text-gray-700 dark:text-gray-200">Creation Date</label>
//                 <input
//                   type="date"
//                   name="createdAt"
//                   className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
//                     formik.touched.createdAt && formik.errors.createdAt
//                       ? 'border-red-500 focus:ring-red-200'
//                       : 'border-gray-300 focus:ring-blue-200 dark:border-gray-700 dark:focus:ring-blue-500'
//                   }`}
//                   value={formik.values.createdAt.split('T')[0]} // Format to YYYY-MM-DD
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                 />
//                 {formik.touched.createdAt && formik.errors.createdAt && (
//                   <div className="text-red-500 text-sm mt-1">{formik.errors.createdAt}</div>
//                 )}
//               </div>

//               {/* Form Buttons */}
//               <div className="flex justify-end">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowForm(false);
//                     setCurrentOrder(null);
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
//                   {currentOrder ? 'Update' : 'Add'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default Orders;








// // // src/pages/Orders.jsx
// // import React, { useEffect } from 'react';
// // import { useDispatch, useSelector } from 'react-redux';
// // import {
// //   fetchOrders,
// //   updateOrderStatus,
// //   deleteOrder,
// // } from '../redux/slices/ordersSlice';
// // import { FaTrash, FaEdit } from 'react-icons/fa'; // React Icons

// // const Orders = () => {
// //   const dispatch = useDispatch();
// //   const { orders, loading, error } = useSelector((state) => state.orders);

// //   useEffect(() => {
// //     dispatch(fetchOrders());
// //     // eslint-disable-next-line
// //   }, []);

// //   const handleStatusChange = (id, status) => {
// //     dispatch(updateOrderStatus({ id, status }));
// //   };

// //   const handleDelete = (id) => {
// //     if (window.confirm('Are you sure you want to delete this order/cart?')) {
// //       dispatch(deleteOrder(id));
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Orders/Carts Management</h2>
// //       {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
// //       {loading ? (
// //         <div className="text-gray-800 dark:text-gray-200">Loading...</div>
// //       ) : (
// //         <div className="overflow-x-auto">
// //           <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
// //             <thead>
// //               <tr>
// //                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Order ID</th>
// //                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">User</th>
// //                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Total Price</th>
// //                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Status</th>
// //                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Date</th>
// //                 <th className="py-2 px-4 border-b text-left text-gray-700 dark:text-gray-200">Actions</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {orders.map((order) => (
// //                 <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
// //                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">{order.orderId}</td>
// //                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">
// //                     {order.user.name} ({order.user.email})
// //                   </td>
// //                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">${order.totalPrice.toFixed(2)}</td>
// //                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200 capitalize">
// //                     <select
// //                       value={order.status}
// //                       onChange={(e) => handleStatusChange(order._id, e.target.value)}
// //                       className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded focus:outline-none"
// //                     >
// //                       <option value="Pending">Pending</option>
// //                       <option value="Processing">Processing</option>
// //                       <option value="Shipped">Shipped</option>
// //                       <option value="Delivered">Delivered</option>
// //                       <option value="Cancelled">Cancelled</option>
// //                     </select>
// //                   </td>
// //                   <td className="py-2 px-4 border-b text-gray-800 dark:text-gray-200">
// //                     {new Date(order.createdAt).toLocaleDateString()}
// //                   </td>
// //                   <td className="py-2 px-4 border-b">
// //                     <button
// //                       onClick={() => handleDelete(order._id)}
// //                       className="text-red-500 hover:underline flex items-center"
// //                     >
// //                       <FaTrash className="mr-1" />
// //                       Delete
// //                     </button>
// //                   </td>
// //                 </tr>
// //               ))}
// //               {orders.length === 0 && (
// //                 <tr>
// //                   <td colSpan="6" className="text-center py-4 text-gray-600 dark:text-gray-400">
// //                     No orders/carts found.
// //                   </td>
// //                 </tr>
// //               )}
// //             </tbody>
// //           </table>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default Orders;
