// routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  addOrderItems,
  getMyOrders,
  getAllOrders,
  deleteOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Create Payment Intent
router.post('/create-payment-intent', protect, createPaymentIntent);

// Create a new order
router.post('/', protect, addOrderItems);

// Get logged-in user's orders
router.get('/myorders', protect, getMyOrders);

// Get all orders (Admin)
router.get('/', protect, getAllOrders);
router.delete('/:id', protect, deleteOrder);

module.exports = router;
