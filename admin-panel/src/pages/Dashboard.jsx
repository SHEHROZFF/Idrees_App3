// src/pages/Dashboard.jsx

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUsers,
} from '../redux/slices/usersSlice';
import {
  fetchProducts,
} from '../redux/slices/productsSlice';
import {
  fetchOrders,
} from '../redux/slices/ordersSlice';
import {
  fetchAllReviews,
} from '../redux/slices/reviewsSlice';
import { fetchCourses } from '../redux/slices/coursesSlice';
import { fetchAds } from '../redux/slices/adsSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  FaUsers,
  FaBoxOpen,
  FaClipboardList,
  FaStar,
  FaDollarSign,
  FaBook,
  FaBullhorn,
} from 'react-icons/fa';

const Dashboard = () => {
  const dispatch = useDispatch();

  // Access data from Redux store
  const { users, loading: usersLoading, error: usersError } = useSelector((state) => state.users);
  const { products, loading: productsLoading, error: productsError } = useSelector((state) => state.products);
  const { orders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.orders);
  const { reviews, loading: reviewsLoading, error: reviewsError } = useSelector((state) => state.reviews);
  const { courses, loading: coursesLoading, error: coursesError } = useSelector((state) => state.courses);
  const { ads, loading: adsLoading, error: adsError } = useSelector((state) => state.ads);

  // Aggregate loading and error states
  const loading =
    usersLoading ||
    productsLoading ||
    ordersLoading ||
    reviewsLoading ||
    coursesLoading ||
    adsLoading;
  const error =
    usersError ||
    productsError ||
    ordersError ||
    reviewsError ||
    coursesError ||
    adsError;

  // Summary Counts
  const usersCount = users.length;
  const productsCount = products.length;
  const ordersCount = orders.length;
  const reviewsCount = reviews.length;
  const coursesCount = courses.length;
  const adsCount = ads.length;

  // Orders Per Month Bar Chart Data
  const orderData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const counts = {};
    months.forEach((month) => {
      counts[month] = 0;
    });
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const month = months[date.getMonth()];
      counts[month] += 1;
    });
    return months.map((month) => ({
      month,
      orders: counts[month],
    }));
  }, [orders]);

  // Reviews Sentiment Pie Chart Data based on Ratings
  const reviewData = useMemo(() => {
    const positive = reviews.filter(review => review.rating >= 4).length;
    const neutral = reviews.filter(review => review.rating === 3).length;
    const negative = reviews.filter(review => review.rating <= 2).length;
    return [
      { name: 'Positive', value: positive },
      { name: 'Neutral', value: neutral },
      { name: 'Negative', value: negative },
    ];
  }, [reviews]);

  const COLORS = ['#4CAF50', '#FFC107', '#F44336']; // Green, Amber, Red

  // Revenue Trends Line Chart Data
  const revenueData = useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const revenue = {};
    months.forEach((month) => {
      revenue[month] = 0;
    });
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const month = months[date.getMonth()];
      revenue[month] += order.totalPrice;
    });
    return months.map((month) => ({
      month,
      revenue: revenue[month],
    }));
  }, [orders]);

  // Recent Orders (Latest 5)
  const recentOrders = useMemo(() => {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedOrders.slice(0, 5);
  }, [orders]);

  // Recent Reviews (Latest 5)
  const recentReviews = useMemo(() => {
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedReviews.slice(0, 5);
  }, [reviews]);

  // Recent Courses (Latest 5)
  const recentCourses = useMemo(() => {
    const sortedCourses = [...courses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedCourses.slice(0, 5);
  }, [courses]);

  // Recent Ads (Latest 5)
  const recentAds = useMemo(() => {
    const sortedAds = [...ads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return sortedAds.slice(0, 5);
  }, [ads]);

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchProducts());
    dispatch(fetchOrders());
    dispatch(fetchAllReviews());
    dispatch(fetchCourses());
    dispatch(fetchAds());
  }, [dispatch]);

  return (
    <div className="p-4">
      {/* Dashboard Title */}
      <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h2>

      {/* Global Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span className="ml-2 text-gray-700 dark:text-gray-300">Loading...</span>
        </div>
      )}

      {/* Global Error Message */}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        {/* Users Card */}
        <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <FaUsers className="h-12 w-12 text-blue-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Users</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{usersCount}</p>
          </div>
        </div>

        {/* Products Card */}
        <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <FaBoxOpen className="h-12 w-12 text-green-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Products</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{productsCount}</p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <FaClipboardList className="h-12 w-12 text-yellow-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Orders</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{ordersCount}</p>
          </div>
        </div>

        {/* Reviews Card */}
        <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <FaStar className="h-12 w-12 text-pink-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Reviews</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{reviewsCount}</p>
          </div>
        </div>

        {/* Courses Card */}
        <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <FaBook className="h-12 w-12 text-indigo-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Courses</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{coursesCount}</p>
          </div>
        </div>

        {/* Ads Card */}
        <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <FaBullhorn className="h-12 w-12 text-red-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Ads</p>
            <p className="text-2xl font-semibold text-gray-800 dark:text-white">{adsCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders Per Month Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Orders Per Month</h3>
          {orderData && orderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderData}>
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-300">No data available.</p>
          )}
        </div>

        {/* Reviews Sentiment Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Reviews Sentiment</h3>
          {reviewData && reviewData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reviewData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {reviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 dark:text-gray-300">No data available.</p>
          )}
        </div>
      </div>

      {/* Revenue Trends Line Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Revenue Trends</h3>
        {revenueData && revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">No data available.</p>
        )}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Orders</h3>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.user.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">No recent orders available.</p>
        )}
      </div>

      {/* Recent Reviews Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Reviews</h3>
        {recentReviews && recentReviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Review ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sentiment
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentReviews.map((review) => {
                  let sentiment = '';
                  let sentimentColor = '';
                  if (review.rating >= 4) {
                    sentiment = 'Positive';
                    sentimentColor = 'bg-green-100 text-green-800';
                  } else if (review.rating === 3) {
                    sentiment = 'Neutral';
                    sentimentColor = 'bg-yellow-100 text-yellow-800';
                  } else {
                    sentiment = 'Negative';
                    sentimentColor = 'bg-red-100 text-red-800';
                  }
                  return (
                    <tr key={review._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review._id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.reviewable.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.rating} ⭐</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sentimentColor}`}>
                          {sentiment}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">No recent reviews available.</p>
        )}
      </div>

      {/* Recent Courses Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Courses</h3>
        {recentCourses && recentCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Course ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Instructor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentCourses.map((course) => (
                  <tr key={course._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{course.instructor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${course.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">No recent courses available.</p>
        )}
      </div>

      {/* Recent Ads Table */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Ads</h3>
        {recentAds && recentAds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ad ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Subtitle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Image
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentAds.map((ad) => (
                  <tr key={ad._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{ad._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{ad.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{ad.subtitle}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img src={ad.image} alt={ad.title} className="w-16 h-auto rounded" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">No recent ads available.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;












// // src/pages/Dashboard.jsx

// import React, { useEffect, useMemo } from 'react';
// import { useDispatch, useSelector } from 'react-redux'; // Redux hooks
// import {
//   fetchUsers,
// } from '../redux/slices/usersSlice';
// import {
//   fetchProducts,
// } from '../redux/slices/productsSlice';
// import {
//   fetchOrders,
// } from '../redux/slices/ordersSlice';
// import {
//   fetchAllReviews,
// } from '../redux/slices/reviewsSlice';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   LineChart,
//   Line,
// } from 'recharts';
// import { FaUsers, FaBoxOpen, FaClipboardList, FaStar, FaDollarSign } from 'react-icons/fa';

// const Dashboard = () => {
//   const dispatch = useDispatch();

//   // Access data from Redux store
//   const { users, loading: usersLoading, error: usersError } = useSelector((state) => state.users);
//   const { products, loading: productsLoading, error: productsError } = useSelector((state) => state.products);
//   const { orders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.orders);
//   const { reviews, loading: reviewsLoading, error: reviewsError } = useSelector((state) => state.reviews);
  
//   // Aggregate loading and error states
//   const loading = usersLoading || productsLoading || ordersLoading || reviewsLoading;
//   const error = usersError || productsError || ordersError || reviewsError;

//   // Summary Counts
//   const usersCount = users.length;
//   const productsCount = products.length;
//   const ordersCount = orders.length;
//   const reviewsCount = reviews.length;

//   // Orders Per Month Bar Chart Data
//   const orderData = useMemo(() => {
//     // Initialize an array with months
//     const months = [
//       'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//     ];
    
//     // Initialize an object to hold counts per month
//     const counts = {};
//     months.forEach((month) => {
//       counts[month] = 0;
//     });
    
//     // Iterate over orders and count per month
//     orders.forEach((order) => {
//       const date = new Date(order.createdAt);
//       const month = months[date.getMonth()];
//       counts[month] += 1;
//     });
    
//     // Transform into array format for recharts
//     return months.map((month) => ({
//       month,
//       orders: counts[month],
//     }));
//   }, [orders]);

//   // Reviews Approval Status Pie Chart Data
//   const reviewData = useMemo(() => {
//     const approved = reviews.filter(review => review.approved).length;
//     const pending = reviews.length - approved;
//     return [
//       { name: 'Approved', value: approved },
//       { name: 'Pending', value: pending },
//     ];
//   }, [reviews]);

//   const COLORS = ['#4CAF50', '#FF9800'];

//   // Revenue Trends Line Chart Data
//   const revenueData = useMemo(() => {
//     const months = [
//       'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
//     ];
    
//     const revenue = {};
//     months.forEach((month) => {
//       revenue[month] = 0;
//     });
    
//     orders.forEach((order) => {
//       const date = new Date(order.createdAt);
//       const month = months[date.getMonth()];
//       revenue[month] += order.totalPrice;
//     });
    
//     return months.map((month) => ({
//       month,
//       revenue: revenue[month],
//     }));
//   }, [orders]);

//   // Recent Orders (Latest 5)
//   const recentOrders = useMemo(() => {
//     // Sort orders by createdAt descending
//     const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     // Return the latest 5 orders
//     return sortedOrders.slice(0, 5);
//   }, [orders]);

//   // Recent Reviews (Latest 5)
//   const recentReviews = useMemo(() => {
//     // Sort reviews by createdAt descending
//     const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//     // Return the latest 5 reviews
//     return sortedReviews.slice(0, 5);
//   }, [reviews]);

//   useEffect(() => {
//     dispatch(fetchUsers());
//     dispatch(fetchProducts());
//     dispatch(fetchOrders());
//     dispatch(fetchAllReviews());
//   }, [dispatch]);

//   return (
//     <div className="p-4">
//       {/* Dashboard Title */}
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h2>

//       {/* Global Loading Indicator */}
//       {loading && (
//         <div className="flex justify-center items-center mb-4">
//           <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
//           </svg>
//           <span className="ml-2 text-gray-700 dark:text-gray-300">Loading...</span>
//         </div>
//       )}

//       {/* Global Error Message */}
//       {error && (
//         <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
//           {error}
//         </div>
//       )}

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         {/* Users Card */}
//         <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
//           <FaUsers className="h-12 w-12 text-blue-500" />
//           <div className="ml-4">
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Users</p>
//             <p className="text-2xl font-semibold text-gray-800 dark:text-white">{usersCount}</p>
//           </div>
//         </div>

//         {/* Products Card */}
//         <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
//           <FaBoxOpen className="h-12 w-12 text-green-500" />
//           <div className="ml-4">
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Products</p>
//             <p className="text-2xl font-semibold text-gray-800 dark:text-white">{productsCount}</p>
//           </div>
//         </div>

//         {/* Orders Card */}
//         <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
//           <FaClipboardList className="h-12 w-12 text-yellow-500" />
//           <div className="ml-4">
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Orders</p>
//             <p className="text-2xl font-semibold text-gray-800 dark:text-white">{ordersCount}</p>
//           </div>
//         </div>

//         {/* Reviews Card */}
//         <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
//           <FaStar className="h-12 w-12 text-pink-500" />
//           <div className="ml-4">
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Reviews</p>
//             <p className="text-2xl font-semibold text-gray-800 dark:text-white">{reviewsCount}</p>
//           </div>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Orders Per Month Bar Chart */}
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Orders Per Month</h3>
//           {orderData && orderData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={orderData}>
//                 <XAxis dataKey="month" stroke="#9CA3AF" />
//                 <YAxis stroke="#9CA3AF" />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="orders" fill="#3B82F6" />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-gray-500 dark:text-gray-300">No data available.</p>
//           )}
//         </div>

//         {/* Reviews Approval Status Pie Chart */}
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Reviews Approval Status</h3>
//           {reviewData && reviewData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={reviewData}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={100}
//                   fill="#8884d8"
//                   label
//                 >
//                   {reviewData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-gray-500 dark:text-gray-300">No data available.</p>
//           )}
//         </div>
//       </div>

//       {/* Revenue Trends Line Chart */}
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
//         <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Revenue Trends</h3>
//         {revenueData && revenueData.length > 0 ? (
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={revenueData}>
//               <XAxis dataKey="month" stroke="#9CA3AF" />
//               <YAxis stroke="#9CA3AF" />
//               <Tooltip />
//               <Legend />
//               <Line type="monotone" dataKey="revenue" stroke="#10B981" />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-300">No data available.</p>
//         )}
//       </div>

//       {/* Recent Orders Table */}
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
//         <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Orders</h3>
//         {recentOrders && recentOrders.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Order ID
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Customer
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Total
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                 {recentOrders.map((order) => (
//                   <tr key={order._id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order._id}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.user.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           order.status === 'Completed'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {order.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-300">No recent orders available.</p>
//         )}
//       </div>

//       {/* Recent Reviews Table */}
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
//         <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Reviews</h3>
//         {recentReviews && recentReviews.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Review ID
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Product
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Rating
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                 {recentReviews.map((review) => (
//                   <tr key={review._id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review._id}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.product.name}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.rating} ⭐</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           review.approved
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {review.approved ? 'Approved' : 'Pending'}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-300">No recent reviews available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
















// // src/pages/Dashboard.jsx
// import React, { useEffect, useMemo } from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   fetchUsers,
// } from '../redux/slices/usersSlice';
// import {
//   fetchProducts,
// } from '../redux/slices/productsSlice';
// import {
//   fetchOrders,
// } from '../redux/slices/ordersSlice';
// // import {
// //   fetchReviews,
// // } from '../redux/slices/reviewsSlice';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   LineChart,
//   Line,
// } from 'recharts';
// import { FaUsers, FaBoxOpen, FaClipboardList, FaStar, FaDollarSign } from 'react-icons/fa';
// // If you plan to use tables, consider importing components or use HTML tables

// const Dashboard = () => {
//   const dispatch = useDispatch();
//   // const { users } = useSelector((state) => state.users);
//   // const { products } = useSelector((state) => state.products);
//   // const { orders } = useSelector((state) => state.orders);
//   // const { reviews } = useSelector((state) => state.reviews);

//   // Dummy data for summary cards
//   const usersCount = 1200;
//   const productsCount = 450;
//   const ordersCount = 3200;
//   const reviewsCount = 860;

//   // Dummy data for Orders per Month
//   const orderData = [
//     { month: 'Jan', orders: 300 },
//     { month: 'Feb', orders: 450 },
//     { month: 'Mar', orders: 600 },
//     { month: 'Apr', orders: 750 },
//     { month: 'May', orders: 900 },
//     { month: 'Jun', orders: 1200 },
//     { month: 'Jul', orders: 1500 },
//     { month: 'Aug', orders: 1300 },
//     { month: 'Sep', orders: 1100 },
//     { month: 'Oct', orders: 1600 },
//     { month: 'Nov', orders: 1700 },
//     { month: 'Dec', orders: 2000 },
//   ];

//   // Dummy data for Reviews Approval Status
//   const reviewData = [
//     { name: 'Approved', value: 500 },
//     { name: 'Pending', value: 360 },
//   ];

//   const COLORS = ['#4CAF50', '#FF9800'];

//   // Dummy data for Revenue Trends
//   const revenueData = [
//     { month: 'Jan', revenue: 4000 },
//     { month: 'Feb', revenue: 3000 },
//     { month: 'Mar', revenue: 5000 },
//     { month: 'Apr', revenue: 7000 },
//     { month: 'May', revenue: 6000 },
//     { month: 'Jun', revenue: 8000 },
//     { month: 'Jul', revenue: 9000 },
//     { month: 'Aug', revenue: 8500 },
//     { month: 'Sep', revenue: 7800 },
//     { month: 'Oct', revenue: 9200 },
//     { month: 'Nov', revenue: 10000 },
//     { month: 'Dec', revenue: 12000 },
//   ];

//   // Dummy data for Recent Orders
//   const recentOrders = [
//     { id: 'ORD12345', customer: 'John Doe', total: 250, status: 'Completed' },
//     { id: 'ORD12346', customer: 'Jane Smith', total: 150, status: 'Pending' },
//     { id: 'ORD12347', customer: 'Alice Johnson', total: 300, status: 'Completed' },
//     { id: 'ORD12348', customer: 'Bob Brown', total: 200, status: 'Pending' },
//   ];

//   // Dummy data for Recent Reviews
//   const recentReviews = [
//     { id: 'REV12345', product: 'Wireless Mouse', rating: 5, approved: true },
//     { id: 'REV12346', product: 'Bluetooth Headphones', rating: 4, approved: false },
//     { id: 'REV12347', product: 'Gaming Keyboard', rating: 5, approved: true },
//     { id: 'REV12348', product: 'HD Monitor', rating: 3, approved: false },
//   ];

//   useEffect(() => {
//     // Commenting out backend dispatches since backend is not connected
//     // dispatch(fetchUsers());
//     // dispatch(fetchProducts());
//     // dispatch(fetchOrders());
//     // dispatch(fetchReviews());
//   }, [dispatch]);

//   return (
//     <div className="p-4">
//       {/* Dashboard Title */}
//       <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Dashboard</h2>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         {/* Users Card */}
//         <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
//           <FaUsers className="h-12 w-12 text-blue-500" />
//           <div className="ml-4">
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Users</p>
//             <p className="text-2xl font-semibold text-gray-800 dark:text-white">{usersCount}</p>
//           </div>
//         </div>

//         {/* Products Card */}
//         <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
//           <FaBoxOpen className="h-12 w-12 text-green-500" />
//           <div className="ml-4">
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Products</p>
//             <p className="text-2xl font-semibold text-gray-800 dark:text-white">{productsCount}</p>
//           </div>
//         </div>

//         {/* Orders Card */}
//         <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
//           <FaClipboardList className="h-12 w-12 text-yellow-500" />
//           <div className="ml-4">
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Orders</p>
//             <p className="text-2xl font-semibold text-gray-800 dark:text-white">{ordersCount}</p>
//           </div>
//         </div>

//         {/* Reviews Card */}
//         <div className="flex items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
//           <FaStar className="h-12 w-12 text-pink-500" />
//           <div className="ml-4">
//             <p className="text-sm font-medium text-gray-500 dark:text-gray-300">Total Reviews</p>
//             <p className="text-2xl font-semibold text-gray-800 dark:text-white">{reviewsCount}</p>
//           </div>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {/* Orders Per Month Bar Chart */}
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Orders Per Month</h3>
//           {orderData && orderData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={orderData}>
//                 <XAxis dataKey="month" stroke="#9CA3AF" />
//                 <YAxis stroke="#9CA3AF" />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="orders" fill="#3B82F6" />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-gray-500 dark:text-gray-300">No data available.</p>
//           )}
//         </div>

//         {/* Reviews Approval Status Pie Chart */}
//         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
//           <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Reviews Approval Status</h3>
//           {reviewData && reviewData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={reviewData}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={100}
//                   fill="#8884d8"
//                   label
//                 >
//                   {reviewData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <p className="text-gray-500 dark:text-gray-300">No data available.</p>
//           )}
//         </div>
//       </div>

//       {/* Revenue Trends Line Chart */}
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
//         <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Revenue Trends</h3>
//         {/* Sample Revenue Data */}
//         <ResponsiveContainer width="100%" height={300}>
//           <LineChart data={revenueData}>
//             <XAxis dataKey="month" stroke="#9CA3AF" />
//             <YAxis stroke="#9CA3AF" />
//             <Tooltip />
//             <Legend />
//             <Line type="monotone" dataKey="revenue" stroke="#10B981" />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Recent Orders Table */}
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
//         <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Orders</h3>
//         {recentOrders && recentOrders.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Order ID
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Customer
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Total
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                 {recentOrders.map((order) => (
//                   <tr key={order.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.id}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{order.customer}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">${order.total}</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           order.status === 'Completed'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {order.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-300">No recent orders available.</p>
//         )}
//       </div>

//       {/* Recent Reviews Table */}
//       <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
//         <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Reviews</h3>
//         {recentReviews && recentReviews.length > 0 ? (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
//               <thead className="bg-gray-50 dark:bg-gray-700">
//                 <tr>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Review ID
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Product
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Rating
//                   </th>
//                   <th
//                     scope="col"
//                     className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
//                   >
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
//                 {recentReviews.map((review) => (
//                   <tr key={review.id}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.id}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.product}</td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{review.rating} ⭐</td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <span
//                         className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                           review.approved
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {review.approved ? 'Approved' : 'Pending'}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         ) : (
//           <p className="text-gray-500 dark:text-gray-300">No recent reviews available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
