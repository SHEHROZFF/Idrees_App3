// routes/courseRoutes.js

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createCourse,
  createFeaturedCourse,
  getCourses,
  getFeaturedReels,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCoursesAdmin,
  searchCourses,
} = require('../controllers/courseController');

// Standard course endpoints with pagination
router
  .route('/')
  .get(protect, getCourses)
  .post(
    protect,
    upload.any(),
    createCourse
  );

// Admin endpoint (all courses without pagination)
router.route('/admin').get(protect, getCoursesAdmin);

// Endpoint for creating a featured course (POST)
router
  .route('/featured')
  .post(
    protect,
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'shortVideo', maxCount: 1 },
      { name: 'videos', maxCount: 50 },
      { name: 'covers', maxCount: 50 },
    ]),
    createFeaturedCourse
  );

// New endpoint for fetching featured reels (GET)
router.get('/featuredreels', protect, getFeaturedReels);

// Quick search
router.get('/search', protect, searchCourses);

// Single course by id
router
  .route('/:id')
  .get(protect, getCourseById)
  .put(
    protect,
    upload.any(),
    updateCourse
  )
  .delete(protect, deleteCourse);

module.exports = router;










// // routes/courseRoutes.js

// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const upload = require('../middleware/upload');
// const {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getFeaturedReels,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
//   getCoursesAdmin,
//   searchCourses,
// } = require('../controllers/courseController');

// // Standard course endpoints with pagination
// router
//   .route('/')
//   .get(protect, getCourses)
//   .post(
//     protect,
//     upload.fields([
//       { name: 'image', maxCount: 1 },
//       { name: 'shortVideo', maxCount: 1 },
//       { name: 'videos', maxCount: 50 },
//       { name: 'covers', maxCount: 50 },
//     ]),
//     createCourse
//   );

// // Admin endpoint (all courses without pagination)
// router.route('/admin').get(protect, getCoursesAdmin);

// // Endpoint for creating a featured course (POST)
// router
//   .route('/featured')
//   .post(
//     protect,
//     upload.fields([
//       { name: 'image', maxCount: 1 },
//       { name: 'shortVideo', maxCount: 1 },
//       { name: 'videos', maxCount: 50 },
//       { name: 'covers', maxCount: 50 },
//     ]),
//     createFeaturedCourse
//   );

// // New endpoint for fetching featured reels (GET)
// router.get('/featuredreels', protect, getFeaturedReels);

// // Quick search
// router.get('/search', protect, searchCourses);

// // Single course by id
// router
//   .route('/:id')
//   .get(protect, getCourseById)
//   .put(
//     protect,
//     upload.fields([
//       { name: 'image', maxCount: 1 },
//       { name: 'shortVideo', maxCount: 1 },
//       { name: 'videos', maxCount: 50 },
//       { name: 'covers', maxCount: 50 },
//     ]),
//     updateCourse
//   )
//   .delete(protect, deleteCourse);

// module.exports = router;








// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getFeaturedReels,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
//   getCoursesAdmin,
//   searchCourses
// } = require('../controllers/courseController');

// // Standard course endpoints with pagination
// router.route('/')
//   .get(protect, getCourses)
//   .post(protect, createCourse);

// // Admin endpoint (all courses without pagination)
// router.route('/admin')
//   .get(protect, getCoursesAdmin);

// // Endpoint for creating a featured course (POST)
// router.route('/featured')
//   .post(protect, createFeaturedCourse);

// // New endpoint for fetching featured reels (GET)
// router.route('/featuredreels')
//   .get(protect, getFeaturedReels);

// router.get('/search', protect, searchCourses);
// // Endpoints for a single course by id
// router.route('/:id')
//   .get(protect, getCourseById)
//   .put(protect, updateCourse)
//   .delete(protect, deleteCourse);



// module.exports = router;











// // routes/courseRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
// } = require('../controllers/courseController');

// // Standard course endpoints
// router.route('/')
//   .get(protect, getCourses)
//   .post(protect, createCourse);

// router.route('/:id')
//   .get(protect, getCourseById)
//   .put(protect, updateCourse)
//   .delete(protect, deleteCourse);

// // Separate endpoint for adding a featured course
// router.route('/featured')
//   .post(protect, createFeaturedCourse);

// module.exports = router;
