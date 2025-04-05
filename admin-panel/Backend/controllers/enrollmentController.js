// controllers/enrollmentController.js

const asyncHandler = require('express-async-handler');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

/**
 * @desc    Enroll the current user in a specific course
 * @route   POST /api/enrollments/:courseId
 * @access  Private (user)
 */
const enrollInCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // 1. Check if course exists
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found.');
  }

  // 2. Check if user already enrolled
  const existing = await Enrollment.findOne({ user: userId, course: courseId });
  if (existing) {
    res.status(400);
    throw new Error('You are already enrolled in this course.');
  }

  // 3. Create new enrollment
  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId,
    paymentStatus: 'not_required', // or 'paid' if you have payment
    pricePaid: course.price, // example storing the course price
  });

  res.status(201).json({
    success: true,
    message: 'Enrollment successful',
    enrollment,
  });
});

/**
 * @desc    Unenroll user from a course
 * @route   DELETE /api/enrollments/:courseId
 * @access  Private (user)
 */
const unenrollFromCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (!enrollment) {
    res.status(404);
    throw new Error('You are not enrolled in this course.');
  }

  await enrollment.deleteOne();
  res.json({
    success: true,
    message: 'Successfully unenrolled',
  });
});

/**
 * @desc    Get all enrollments for the logged-in user
 * @route   GET /api/enrollments/my
 * @access  Private (user)
 */
const getMyEnrollments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Populate course info if needed
  const enrollments = await Enrollment.find({ user: userId })
    .populate('course')
    .sort({ enrolledAt: -1 });

  res.json({
    success: true,
    count: enrollments.length,
    enrollments,
  });
});

/**
 * @desc    Update progress or status on an enrollment (user)
 * @route   PATCH /api/enrollments/:courseId
 * @access  Private
 */
const updateEnrollment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  const {
    progress,
    status,
    lastAccessed,
    completionDate,
    certificateUrl,
    lessonsProgress,
    notes,
  } = req.body;

  const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found for this user/course.');
  }

  // Update fields if they’re provided
  if (progress !== undefined) enrollment.progress = progress;
  if (status) enrollment.status = status;
  if (lastAccessed) enrollment.lastAccessed = lastAccessed;
  if (completionDate) enrollment.completionDate = completionDate;
  if (certificateUrl) enrollment.certificateUrl = certificateUrl;
  if (lessonsProgress) enrollment.lessonsProgress = lessonsProgress;
  if (notes !== undefined) enrollment.notes = notes;

  await enrollment.save();
  res.json({
    success: true,
    message: 'Enrollment updated',
    enrollment,
  });
});

// ----------------------------------------------------------------------
//        ADMIN METHODS (NEW)
// ----------------------------------------------------------------------

/**
 * @desc    Get all enrollments (ADMIN)
 * @route   GET /api/enrollments/admin
 * @access  Private/Admin
 */
const getAllEnrollmentsAdmin = asyncHandler(async (req, res) => {
  // If you want to populate user or course details:
  // .populate('user', 'name email') // example user fields
  // .populate('course', 'title price')
  const enrollments = await Enrollment.find({})
    .populate('user', 'name email')
    .populate('course', 'title price')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: enrollments,
  });
});

/**
 * @desc    Create a new enrollment (ADMIN)
 * @route   POST /api/enrollments/admin
 * @access  Private/Admin
 */
const createEnrollmentAdmin = asyncHandler(async (req, res) => {
  // Expect body to have { user, course, paymentStatus, status, progress, ... }
  const {
    user,
    course,
    paymentStatus,
    pricePaid,
    progress,
    status,
    certificateUrl,
    notes,
  } = req.body;

  // Optional: check course existence, check duplicates, etc.
  const existing = await Enrollment.findOne({ user, course });
  if (existing) {
    res.status(400);
    throw new Error('This user is already enrolled in that course.');
  }

  const newEnrollment = new Enrollment({
    user,
    course,
    paymentStatus: paymentStatus || 'not_required',
    pricePaid: pricePaid || 0,
    progress: progress || 0,
    status: status || 'active',
    certificateUrl: certificateUrl || '',
    notes: notes || '',
  });

  const created = await newEnrollment.save();
  res.status(201).json({
    success: true,
    data: created,
    message: 'Enrollment created by admin',
  });
});

/**
 * @desc    Update an enrollment by ID (ADMIN)
 * @route   PUT /api/enrollments/admin/:id
 * @access  Private/Admin
 */
const updateEnrollmentAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // You may pass any fields from your Enrollment schema
  const {
    user,
    course,
    paymentStatus,
    pricePaid,
    progress,
    status,
    certificateUrl,
    lastAccessed,
    completionDate,
    lessonsProgress,
    notes,
  } = req.body;

  const enrollment = await Enrollment.findById(id);
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found.');
  }

  // Update fields
  if (user !== undefined) enrollment.user = user;
  if (course !== undefined) enrollment.course = course;
  if (paymentStatus !== undefined) enrollment.paymentStatus = paymentStatus;
  if (pricePaid !== undefined) enrollment.pricePaid = pricePaid;
  if (progress !== undefined) enrollment.progress = progress;
  if (status !== undefined) enrollment.status = status;
  if (certificateUrl !== undefined) enrollment.certificateUrl = certificateUrl;
  if (lastAccessed !== undefined) enrollment.lastAccessed = lastAccessed;
  if (completionDate !== undefined) enrollment.completionDate = completionDate;
  if (lessonsProgress !== undefined) enrollment.lessonsProgress = lessonsProgress;
  if (notes !== undefined) enrollment.notes = notes;

  const updated = await enrollment.save();
  res.json({
    success: true,
    data: updated,
    message: 'Enrollment updated by admin',
  });
});

/**
 * @desc    Delete an enrollment by ID (ADMIN)
 * @route   DELETE /api/enrollments/admin/:id
 * @access  Private/Admin
 */
const deleteEnrollmentAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enrollment = await Enrollment.findById(id);
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found.');
  }

  await enrollment.deleteOne();

  res.json({
    success: true,
    message: 'Enrollment removed successfully by admin.',
    data: { _id: id },
  });
});

/**
 * @desc    Update lesson progress for a specific course enrollment
 * @route   PATCH /api/enrollments/:courseId/progress
 * @access  Private (user)
 */
const updateLessonProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { lessonId, watchedDuration, completed } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!lessonId) {
    res.status(400);
    throw new Error('Lesson ID is required.');
  }

  // Find enrollment for the user and course
  const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (!enrollment) {
    res.status(404);
    throw new Error('Enrollment not found for this user/course.');
  }

  // Update the lesson progress if it exists; otherwise add a new entry
  let lessonFound = false;
  enrollment.lessonsProgress = enrollment.lessonsProgress.map(lp => {
    if (lp.lessonId === lessonId) {
      lessonFound = true;
      return {
        ...lp.toObject ? lp.toObject() : lp, // support both plain objects and Mongoose documents
        watchedDuration: watchedDuration !== undefined ? watchedDuration : lp.watchedDuration,
        completed: completed !== undefined ? completed : lp.completed,
      };
    }
    return lp;
  });

  if (!lessonFound) {
    enrollment.lessonsProgress.push({
      lessonId,
      watchedDuration: watchedDuration || 0,
      completed: completed || false,
    });
  }

  // Fetch the course to know the total number of lessons (videos)
  const course = await Course.findById(courseId);
  const totalLessons = course && course.videos ? course.videos.length : enrollment.lessonsProgress.length;
  const numCompleted = enrollment.lessonsProgress.filter(lp => lp.completed).length;
  const overallProgress = totalLessons > 0 ? (numCompleted / totalLessons) * 100 : 0;

  enrollment.progress = overallProgress;
  enrollment.lastAccessed = Date.now();

  await enrollment.save();

  res.json({
    success: true,
    message: 'Lesson progress updated.',
    enrollment,
  });
});

// Export all
module.exports = {
  // existing user-based methods
  enrollInCourse,
  unenrollFromCourse,
  getMyEnrollments,
  updateEnrollment,

  // new admin-based methods
  getAllEnrollmentsAdmin,
  createEnrollmentAdmin,
  updateEnrollmentAdmin,
  deleteEnrollmentAdmin,

  updateLessonProgress,
};
