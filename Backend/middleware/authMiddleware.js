// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {

      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log(token);
      

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');
      console.log(req.user);
      

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no user found');
    }

    const roleHierarchy = ['user', 'admin'];

    const userRoleIndex = roleHierarchy.indexOf(req.user.role);
    const hasAccess = allowedRoles.some(
      (role) => roleHierarchy.indexOf(role) <= userRoleIndex
    );

    if (!hasAccess) {
      res.status(403);
      throw new Error(
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};


module.exports = { protect, authorize };
