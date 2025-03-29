// routes/enrollmentRoutes.js

const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  enrollInCourse,
  unenrollFromCourse,
  getMyEnrollments,
  updateEnrollment,
  getAllEnrollmentsAdmin,
  createEnrollmentAdmin,
  updateEnrollmentAdmin,
  deleteEnrollmentAdmin,
  updateLessonProgress,
} = require('../controllers/enrollmentController');


// New route for updating lesson progress
router.patch('/:courseId/progress', protect, updateLessonProgress);
// ----------------------------------------------------------------------
//  USER-FOCUSED ENDPOINTS
// ----------------------------------------------------------------------

// Enroll in a course (user)
router.post('/:courseId', protect, enrollInCourse);

// Unenroll from a course (user)
router.delete('/:courseId', protect, unenrollFromCourse);

// Update own enrollment (progress, certificate, etc.) (user)
router.patch('/:courseId', protect, updateEnrollment);

// Get all enrollments for the current (logged-in) user
router.get('/my', protect, getMyEnrollments);

// ----------------------------------------------------------------------
//  ADMIN-FOCUSED ENDPOINTS
// ----------------------------------------------------------------------

// GET all enrollments (admin)
router.get('/admin', protect, getAllEnrollmentsAdmin);

// CREATE a new enrollment (admin)
router.post('/admin', protect, createEnrollmentAdmin);

// UPDATE an enrollment by ID (admin)
router.put('/admin/:id', protect, updateEnrollmentAdmin);

// DELETE an enrollment by ID (admin)
router.delete('/admin/:id', protect, deleteEnrollmentAdmin);

module.exports = router;
