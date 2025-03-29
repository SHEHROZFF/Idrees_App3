// server.js

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middleware/errorMiddleware');
const adminRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes')
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const themeRoutes = require('./routes/themeRoutes');
const courseRoutes = require('./routes/courseRoutes');
const adRoutes = require('./routes/adRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const policiesRoutes = require('./routes/policiesRoutes');
const configRoutes = require('./routes/config');


// const stripe = require('stripe')('sk_test_51OXlAIAZK57wNYnQQluuPOe6YHwpKCs2dZfKLaEe7Ye67OObYR3Hes3i0Vjo1yp450mlVWQ9ufvWWYYymF1mc33R00GwSCgwFi');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security HTTP headers
app.use(helmet());

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.get('/', (req, res) => {
  res.send('API is running...');
})

// app.post('/create-checkout-session', async (req, res) => {
//   const { cartItems } = req.body; // Pass cart items from the frontend

//   try {
//     const line_items = cartItems.map(item => ({
//       price_data: {
//         currency: 'usd',
//         product_data: {
//           name: item.name,
//           images: [item.image],
//         },
//         unit_amount: parseInt(item.price) * 100, // Convert price to cents
//       },
//       quantity: 1, // Adjust quantity as needed
//     }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items,
//       mode: 'payment',
//       success_url: 'https://your-success-url.com',
//       cancel_url: 'https://your-cancel-url.com',
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
// Routes
app.use('/api/auth', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/courses', courseRoutes); // Mount the courses routes
app.use('/api/ads', adRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/config', configRoutes);


// Error handling middleware (should be last piece of middleware)
app.use(errorHandler);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);
