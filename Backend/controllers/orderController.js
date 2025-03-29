// controllers/orderController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Config = require('../models/Config');
const dotenv = require('dotenv');
dotenv.config();

// const stripe = require('stripe');

/**
 * @desc    Create a Stripe Payment Intent
 * @route   POST /api/orders/create-payment-intent
 * @access  Private
 */
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderItems, totalPrice } = req.body;

  // Validate order items
  // if (!orderItems || orderItems.length === 0) {
  //   res.status(400);
  //   throw new Error('No order items');
  // }
// console.log( totalPrice);

  try {
    const config = await Config.findOne({ key: 'stripePrivateKey' });
    if (!config) {
      return res.status(404).json({ error: 'Stripe configuration not found' });
    }
    const stripe = require('stripe')(config.value);
    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount:totalPrice, // Amount in cents
      currency: 'usd', // Change to your currency
      payment_method_types: ['card'],
      // automatic_payment_methods: {
      //   enabled: true,
      // },
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500);
    throw new Error('Failed to create payment intent');
  }
});

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private
 */
const addOrderItems = asyncHandler(async (req, res) => {
  const {
    orderItems,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    paymentResult,
  } = req.body;

  console.log('Order Items:', orderItems);

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Create new order
  const order = new Order({
    user: req.user._id,
    orderItems,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    paymentResult,
    status: 'completed', // Set status to 'completed'
  });
  if (order) {
    // Increment the user's purchasesCount
    await req.user.incrementPurchases();
  }
  const createdOrder = await order.save();

  // Populate the 'product' field in orderItems to include 'pdfLink'
  const populatedOrder = await createdOrder.populate({
    path: 'orderItems.product',
    select: 'pdfLink', // Select the pdfLink field
  });

  res.status(201).json(populatedOrder);
});

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate({
      path: 'orderItems.product',
      select: 'pdfLink', // Include pdfLink in each orderItem's product
    })
    .sort({ createdAt: -1 });
  res.json(orders);
});

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user')
    .populate({
      path: 'orderItems.product',
      select: 'pdfLink', // Include pdfLink in each orderItem's product
    })
    .sort({ createdAt: -1 });
    console.log(orders);
    
  res.json(orders);
});

// const deleteOrder = asyncHandler(async (req, res) => {
//   const orderId = req.params.id;
//   const deletedOrder = await Order.findByIdAndDelete(orderId);
//   if (!deletedOrder) {
//     res.status(404);
//     throw new Error('Order not found');
//   }
//   res.json({ message: 'Order deleted successfully' });
// });
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  await order.deleteOne();
  res.json({ message: 'Order deleted successfully' });
});
module.exports = {
  createPaymentIntent,
  addOrderItems,
  getMyOrders,
  getAllOrders,
  deleteOrder,
};
