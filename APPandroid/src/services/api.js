// src/services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mime from 'mime';



// Replace with your actual API URL
// const API_URL = 'http://10.0.0.2:5000/api';
const API_URL = 'https://ecom-mauve-three.vercel.app/api';
// ----------------------- Helper Functions ----------------------- //

/**shehr
 * Retrieve the authentication token from AsyncStorage.
 * @returns {Promise<string|null>} The JWT token or null if not found.
 */
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error retrieving auth token:', error);
    return null;
  }
};

/**
 * Store the authentication token in AsyncStorage.
 * @param {string} token - The JWT token to store.
 * @returns {Promise<void>}
 */
const storeAuthToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

/**
 * Remove the authentication token from AsyncStorage (Logout).
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem('token');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const deleteUserAccount = async () => {
  try {
    const token = await getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };
    console.log("headers",headers);
    
    const response = await axios.delete(`${API_URL}/users/me`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error deleting user account:', error);
    return { success: false, message: 'Failed to delete user account.' };
  }
}

// ----------------------- Authentication Functions ----------------------- //

/**
 * Login User
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise<object>} Response data or error object.
 */
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password, role: 'user' });

    if (response.data && response.data.token) {
      await storeAuthToken(response.data.token);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Login error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Login failed.' };
  }
};

/**
 * Register User
 * @param {object} userData - User registration data.
 * @returns {Promise<object>} Response data or error object.
 */
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);

    if (response.data && response.data.token) {
      await storeAuthToken(response.data.token);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Registration error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Registration failed.' };
  }
};

/**
 * Forgot Password
 * @param {string} email - User's email.
 * @returns {Promise<object>} Response data or error object.
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgotpassword`, { email, role: 'user' });
    return response.data;
  } catch (error) {
    console.error('Forgot Password error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to send reset link.' };
  }
};

/**
 * Verify OTP
 * @param {string} email - User's email.
 * @param {string} otp - One-Time Password received via email.
 * @returns {Promise<object>} Response data or error object.
 */
export const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otp, role: 'user' });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Verify OTP error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'OTP verification failed.' };
  }
};

/**
 * Reset Password
 * @param {string} email - User's email.
 * @param {string} newPassword - New password to set.
 * @returns {Promise<object>} Response data or error object.
 */
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/reset-password`, { email, newPassword, role: 'user' });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Reset Password error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Password reset failed.' };
  }
};

/**
 * Get User Profile
 * @returns {Promise<object>} User profile data or error object.
 */
export const getUserProfile = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/users/me`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get User Profile error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch user profile.' };
  }
};

/**
 * Update User Profile
 * @param {object} updatedData - Updated user data.
 * @returns {Promise<object>} Updated user data or error object.
 */
export const updateUserProfile = async (updatedData) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(`${API_URL}/users/me`, updatedData, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update User Profile error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to update profile.' };
  }
};

/**
 * Update user profile with images via multipart form-data.
 * @param {object} updatedData - { name, email, phone, address, etc. }
 * @param {string} profileImageUri - local file URI for profile
 * @param {string} coverImageUri   - local file URI for cover
 */
export const updateUserProfileMultipart = async (updatedData, profileImageUri, coverImageUri) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    // Construct the form data
    const formData = new FormData();

    // Text fields
    formData.append('name', updatedData.name || '');
    formData.append('email', updatedData.email || '');
    formData.append('phone', updatedData.phone || '');
    formData.append('address', updatedData.address || '');

    // If user selected a new profile image from gallery
    if (profileImageUri && !profileImageUri.startsWith('http')) {
      formData.append('profileImage', {
        uri: profileImageUri,
        type: mime.getType(profileImageUri) || 'image/jpeg',
        name: `profile.${mime.getExtension(mime.getType(profileImageUri)) || 'jpg'}`,
      });
    }

    // If user selected a new cover image from gallery
    if (coverImageUri && !coverImageUri.startsWith('http')) {
      formData.append('coverImage', {
        uri: coverImageUri,
        type: mime.getType(coverImageUri) || 'image/jpeg',
        name: `cover.${mime.getExtension(mime.getType(coverImageUri)) || 'jpg'}`,
      });
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    };

    // Send the multipart/form-data to your server
    const response = await axios.put(`${API_URL}/users/me`, formData, config);

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Update failed');
    }

    return {
      success: true,
      data: response.data.data, // The "data" property from your server's JSON
    };
  } catch (error) {
    console.error('Update User Profile (multipart) error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update profile.',
    };
  }
};
// ----------------------- Product Functions ----------------------- //

/**
 * Fetch All Products
 * @returns {Promise<object>} Products data or error object.
 */
export const fetchProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch Products error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch products.' };
  }
};

/**
 * Get Product Details
 * @param {string} productId - ID of the product.
 * @returns {Promise<object>} Product details data or error object.
 */
export const getProductDetails = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get Product Details error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch product details.' };
  }
};

/**
 * Get Top-Rated Products
 * @returns {Promise<object>} Top-rated products data or error object.
 */
export const getTopProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/products/top`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get Top Products error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch top products.' };
  }
};

export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get Product by ID error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch product.' };
  }
}

// ----------------------- Review Functions ----------------------- //

/**
 * Add or Update a Review (Authenticated Users)
 * @param {string} productId - ID of the product to review.
 * @param {number} rating - Rating between 1 and 5.
 * @param {string} comment - Review comment.
 * @returns {Promise<object>} Response data or error object.
 */
export const addOrUpdateReview = async (reviewableId,reviewableType, rating, comment) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      `${API_URL}/reviews`,
      { reviewableId,reviewableType, rating, comment },
      config
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Add/Update Review error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to add/update review.' };
  }
};

/**
 * Get All Reviews for a Product
 * @param {string} productId - ID of the product.
 * @returns {Promise<object>} Reviews data or error object.
 */
export const getProductReviewsAPI = async (reviewableId, reviewableType) => {
  try {
    // console.log("getProductReviewsAPI",reviewableId,reviewableType);
    
    const response = await axios.get(`${API_URL}/reviews/${reviewableType}/${reviewableId}`);
    // console.log(response);

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get Product Reviews error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch reviews.' };
  }
};

/**
 * Delete a Review (Authenticated Users/Admin)
 * @param {string} reviewId - ID of the review to delete.
 * @returns {Promise<object>} Success message or error object.
 */
export const deleteReviewAPI = async (reviewId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.delete(`${API_URL}/reviews/${reviewId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Delete Review error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to delete review.' };
  }
};

export const getMyReviewsAPI = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/reviews/my`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get My Reviews error:', error.response?.data?.message || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get reviews.',
    };
  }
};

export const updateReviewAPI = async (reviewId, rating, comment) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.put(
      `${API_URL}/reviews/${reviewId}`,
      { rating, comment },
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update Review error:', error.response?.data?.message || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update review.',
    };
  }
};

// ----------------------- Order Functions ----------------------- //

/**
 * Create a New Order
 * @param {object} orderData - Data for the new order.
 * @returns {Promise<object>} Created order data or error object.
 */
export const createOrder = async (orderData) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(`${API_URL}/orders`, orderData, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Create Order error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to create order.' };
  }
};

/**
 * Get Logged-in User's Orders
 * @returns {Promise<object>} Orders data or error object.
 */
export const getMyOrders = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`${API_URL}/orders/myorders`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get My Orders error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch orders.' };
  }
};

// ----------------------- Payment Functions ----------------------- //

/**
 * Fetch Payment Intent for Orders
 * @param {number} totalPrice - Total price of the order (in dollars).
 * @returns {Promise<string|null>} The client secret for the payment intent or null on error.
 */
export const fetchPaymentIntent = async (totalPrice) => {
  try {
    // console.log("totalPrice",totalPrice);
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }

    const response = await fetch(`${API_URL}/orders/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        totalPrice: parseInt(totalPrice) * 100, // Convert to cents
      }),
    });
    

    const { clientSecret } = await response.json();
    // console.log(clientSecret);
    
    return clientSecret;
  } catch (error) {
    console.error('Error fetching payment intent:', error);
    return null; // Return null on error
  }
};

// ----------------------- Token Verification Function ----------------------- //

/**
 * Verify Authentication Token with Backend
 * @returns {Promise<boolean>} True if token is valid, else false.
 */
export const verifyAuthToken = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return false;

    const response = await axios.get(`${API_URL}/auth/verify-token`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
console.log("response verify",response.data.success);

    return response.data.success;
  } catch (error) {
    console.error('Token verification error:', error.response?.data?.message || error.message);
    return false;
  }
};


// ------------------------change password-------------------------- //

/**
 * Change User Password (Authenticated Users)
 * @param {string} oldPassword - User's current/old password.
 * @param {string} newPassword - User's new password.
 * @returns {Promise<object>} Response data or error object.
 */
export const changeUserPassword = async (oldPassword, newPassword) => {
  try {
    // console.log("changeUserPassword",oldPassword,newPassword);
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('No authentication token found.');
    }
// console.log("token",token);

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
// console.log("config",config);

    // Adjust the endpoint and payload according to your backend API
    const response = await axios.post(
      `${API_URL}/users/changepassword`,
      { oldPassword, newPassword },
      config
    );
    // console.log("response",response);
    

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Change Password error:', error.response?.data?.message || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to change password.',
    };
  }
};



// ----------------------- Courses & Ads ----------------------- //

export const fetchCourses = async (page = 1, limit = 10) => {
  try {
    const token = await getAuthToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/courses?page=${page}&limit=${limit}`, config);
    // console.log("response",response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch Courses error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch courses.' };
  }
};
export const fetchFeaturedReels = async (page = 1, limit = 5) => {
  try {
    const token = await getAuthToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(
      `${API_URL}/courses/featuredreels?page=${page}&limit=${limit}`,
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      'Fetch Featured Reels error:',
      error.response?.data?.message || error.message
    );
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch featured reels.',
    };
  }
};

export const fetchAds = async () => {
  try {
    const token = await getAuthToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/ads`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch Ads error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch ads.' };
  }
};

// src/services/api.js
export const searchCoursesAPI = async (query) => {
  try {
    const token = await getAuthToken();
    const config = { headers: { Authorization: `Bearer ${token}` } };
    // console.log("query",encodeURIComponent(query));
    

    // encodeURI the query to be safe
    const response = await axios.get(`${API_URL}/courses/search?query=${encodeURIComponent(query)}`, config);
    // console.log("response",response);
    
    return { success: true, data: response.data };
  } catch (error) {
    // console.log("error",error);
    console.error('Search Courses error:', error.response?.data?.message || error.message);
    return { success: false, message: 'Failed to search courses.' };
  }
};


// api.js
export const fetchCourseById = async (courseId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No authentication token found.');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    const response = await axios.get(`${API_URL}/courses/${courseId}`, config);
    // console.log("response",response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch course by ID error:', error.response?.data?.message || error.message);
    return { success: false, message: 'Failed to fetch course details.' };
  }
};
//----------------------------------------------------
//  ENROLLMENT ENDPOINTS
//----------------------------------------------------
/**
 * Enroll the current user in a course
 * @param {string} courseId
 * @returns {Promise<object>} { success, data }
 */
export const enrollInCourseAPI = async (courseId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No token found. Please log in.');

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(`${API_URL}/enrollments/${courseId}`, {}, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Enroll in course error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Enrollment failed.' };
  }
};

/**
 * Unenroll from a course
 * @param {string} courseId
 */
export const unenrollFromCourseAPI = async (courseId) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No token found. Please log in.');

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const response = await axios.delete(`${API_URL}/enrollments/${courseId}`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Unenroll error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Unenrollment failed.' };
  }
};

/**
 * Get all enrollments for the logged-in user
 */
export const getMyEnrollmentsAPI = async () => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No token found. Please log in.');

    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`${API_URL}/enrollments/my`, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get enrollments error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch enrollments.' };
  }
};

/**
 * Update an existing enrollment (progress, certificate, etc.)
 * @param {string} courseId
 * @param {object} updates
 */
export const updateEnrollmentAPI = async (courseId, updates = {}) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No token found. Please log in.');

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const response = await axios.patch(`${API_URL}/enrollments/${courseId}`, updates, config);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Update enrollment error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to update enrollment.' };
  }
};


/**
 * Update lesson progress for a course enrollment.
 * @param {string} courseId - The ID of the course.
 * @param {object} progressData - An object with { lessonId, watchedDuration, completed }.
 * @returns {Promise<object>} The updated enrollment data or an error object.
 */
export const updateLessonProgressAPI = async (courseId, progressData = {}) => {
  try {
    const token = await getAuthToken();
    if (!token) throw new Error('No token found. Please log in.');

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    const response = await axios.patch(
      `${API_URL}/enrollments/${courseId}/progress`,
      progressData,
      config
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.error(
      'Update lesson progress error:',
      error.response?.data?.message || error.message
    );
    return {
      success: false,
      message:
        error.response?.data?.message || 'Failed to update lesson progress.',
    };
  }
};

export const fetchPolicy = async (type) => {
  try {
    const response = await axios.get(`${API_URL}/policies/${type}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Fetch Policy error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch policy.' };
  }
};

export const configStripeKey = async () => {
  try {
    const response = await axios.get(`${API_URL}/config/stripe`);
    // console.log("response",response.data);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Config Stripe Key error:', error.response?.data?.message || error.message);
    return { success: false, message: error.response?.data?.message || 'Failed to fetch Stripe key.' };
  }
};



// ----------------------- Export All Functions ----------------------- //

export default {
  // Authentication
  loginUser,
  registerUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  deleteUserAccount,

  // Products
  fetchProducts,
  getProductDetails,
  getTopProducts,
  getProductById,

  // Reviews
  addOrUpdateReview,
  getProductReviewsAPI,
  deleteReviewAPI,
  updateReviewAPI,
  getMyReviewsAPI,

  // Orders
  createOrder,
  getMyOrders,

  // Payment
  fetchPaymentIntent,

  // Token Verification
  verifyAuthToken,

  // Change Password
  changeUserPassword,

  // // Fetch Courses
  // fetchCourses,

  // // Fetch Ads
  // fetchAds

    // Courses & Ads
    fetchCourses,
    fetchFeaturedReels,
    fetchAds,

    // Search
    searchCoursesAPI,

    // Fetch Course by ID
    fetchCourseById,

    // Enrollments
    enrollInCourseAPI,
    unenrollFromCourseAPI,
    getMyEnrollmentsAPI,
    updateEnrollmentAPI,

    // Update Lesson Progress
    // updateLessonProgressAPI
    updateLessonProgressAPI,

    // Fetch Policy
    fetchPolicy,

    //stripe
    configStripeKey

};
