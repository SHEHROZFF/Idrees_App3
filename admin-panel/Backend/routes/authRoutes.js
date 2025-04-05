// routes/authRoutes.js

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET;
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPasswordLink,
  resetPasswordOtp,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPasswordLink);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPasswordOtp);
// Token verification endpoint
router.get('/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Assuming 'Bearer <token>'

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Optionally, you can attach decoded user information
    return res.status(200).json({ success: true, user: decoded });
  });
});
module.exports = router;
