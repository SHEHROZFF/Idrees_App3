// routes/productRoutes.js

const express = require('express');
const router = express.Router();
const {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById
} = require('../controllers/productController');

// Middleware for authentication and authorization
const { protect, authorize } = require('../middleware/authMiddleware');

// Fetch all products/exams
router.route('/').get(fetchProducts).post(protect, authorize('admin'), addProduct);

// Get a specific product/exam by ID
router.route('/:id').get(getProductById);   

// Update and delete specific product/exam by ID
router.route('/:id').put(protect, authorize('admin'), updateProduct).delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
