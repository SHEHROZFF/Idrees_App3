// userRoutes.js
const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe,
  changePassword,
  deleteMe
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// New import
const upload = require('../middleware/multer');

const router = express.Router();

router
  .route('/me')
  .get(protect, getMe)
  .put(
    protect,
    upload.fields([
      { name: 'profileImage', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
    ]),
    updateMe
  ).delete(protect, deleteMe);

// Admin routes
router
  .route('/')
  .get(protect, authorize('admin'), getUsers)
  .post(protect, authorize('admin'), createUser);

// Must place this route before /:id if you want a "changepassword" route
router.post('/changepassword', protect, changePassword);

// The wildcard route:
router
  .route('/:id')
  .get(protect, getUser)
  .put(protect, updateUser)
  .delete(protect, deleteUser);

module.exports = router;









// // userRoutes.js

// const express = require('express');
// const {
//   getUsers,
//   getUser,
//   createUser,
//   updateUser,
//   deleteUser,
//   getMe,
//   updateMe,
//   changePassword
// } = require('../controllers/userController');
// const { protect, authorize } = require('../middleware/authMiddleware');

// const router = express.Router();

// // Public routes
// router.route('/me')
//   .get(protect, getMe)
//   .put(protect, updateMe);

// // Admin routes
// router.route('/')
//   .get(protect, authorize('admin'), getUsers)
//   .post(protect, authorize('admin'), createUser);

// // **Place this BEFORE the wildcard `/:id` route**:
// router.post('/changepassword', protect, changePassword);


// // The wildcard route:
// router.route('/:id')
//   .get(protect, getUser)
//   .put(protect, updateUser)
//   .delete(protect, deleteUser);

// module.exports = router;
