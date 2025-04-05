// controllers/courseController.js
const asyncHandler = require('express-async-handler');
const Course = require('../models/Course');
const Video = require('../models/Video');

/**
 * @desc    Create a new course (non-featured by default)
 * @route   POST /api/courses
 * @access  Private/Admin
 */
const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    instructor,
    price,
    image,
    videos, // Expect an array of video objects
    rating,
    reviews,
    isFeatured,
    shortVideoLink,
    // Additional fields
    difficultyLevel,
    language,
    topics,
    totalDuration,
    numberOfLectures,
    category,
    tags,
    requirements,
    whatYouWillLearn,
    saleEnabled,
    salePrice,
  } = req.body;

  // Basic required fields check
  if (!title || !description || !instructor || !price || !image) {
    res.status(400);
    throw new Error('Please provide all required fields: title, description, instructor, price, image.');
  }

  // If not featured, clear shortVideoLink
  const finalShortVideoLink = isFeatured ? shortVideoLink || '' : '';

  // Create course document without videos for now
  let course = new Course({
    title,
    description,
    instructor,
    price,
    image,
    rating: rating || 0,
    reviews: reviews || 0,
    isFeatured: isFeatured || false,
    shortVideoLink: finalShortVideoLink,
    difficultyLevel: difficultyLevel || 'Beginner',
    language: language || 'English',
    topics: topics || [],
    totalDuration: totalDuration || 0,
    numberOfLectures: numberOfLectures || 0,
    category: category || '',
    tags: tags || [],
    requirements: requirements || [],
    whatYouWillLearn: whatYouWillLearn || [],
    saleEnabled: saleEnabled || false,
    salePrice: salePrice || 0,
  });

  // Save course first to obtain its _id
  course = await course.save();

  // If videos are provided, add the course id to each video, insert them, and sort by priority
  if (videos && Array.isArray(videos) && videos.length > 0) {
    const videosWithCourse = videos.map(video => ({ ...video, course: course._id }));
    let createdVideos = await Video.insertMany(videosWithCourse);
    // Sort the videos by priority (ascending)
    createdVideos = createdVideos.sort((a, b) => a.priority - b.priority);
    course.videos = createdVideos.map(video => video._id);
    await course.save();
  }

  // Populate videos before sending response
  await course.populate('videos');
  res.status(201).json(course);
});

/**
 * @desc    Create a new featured course (isFeatured forced to true)
 * @route   POST /api/courses/featured
 * @access  Private/Admin
 */
const createFeaturedCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    instructor,
    price,
    image,
    videos,
    rating,
    reviews,
    shortVideoLink,
    // Additional fields
    difficultyLevel,
    language,
    topics,
    totalDuration,
    numberOfLectures,
    category,
    tags,
    requirements,
    whatYouWillLearn,
    saleEnabled,
    salePrice,  
  } = req.body;

  if (!title || !description || !instructor || !price || !image) {
    res.status(400);
    throw new Error('Please provide all required fields: title, description, instructor, price, image.');
  }

  let course = new Course({
    title,
    description,
    instructor,
    price,
    image,
    rating: rating || 0,
    reviews: reviews || 0,
    isFeatured: true,
    shortVideoLink: shortVideoLink || '',
    difficultyLevel: difficultyLevel || 'Beginner',
    language: language || 'English',
    topics: topics || [],
    totalDuration: totalDuration || 0,
    numberOfLectures: numberOfLectures || 0,
    category: category || '',
    tags: tags || [],
    requirements: requirements || [],
    whatYouWillLearn: whatYouWillLearn || [],
    saleEnabled: saleEnabled || false,
    salePrice: salePrice || 0,
  });

  course = await course.save();

  if (videos && Array.isArray(videos) && videos.length > 0) {
    const videosWithCourse = videos.map(video => ({ ...video, course: course._id }));
    let createdVideos = await Video.insertMany(videosWithCourse);
    createdVideos = createdVideos.sort((a, b) => a.priority - b.priority);
    course.videos = createdVideos.map(video => video._id);
    await course.save();
  }

  await course.populate('videos');
  res.status(201).json(course);
});

/**
 * @desc    Get all courses with pagination & selective projection
 * @route   GET /api/courses
 * @access  Private
 */
const getCourses = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Populate videos for a complete API response
  const courses = await Course.find({})
    .populate('videos')
    .select(
      'title description image rating reviews isFeatured videos difficultyLevel language topics totalDuration numberOfLectures category tags requirements whatYouWillLearn saleEnabled salePrice price'
    )
    // .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  // Optionally, extract the first video URL for convenience
  const formattedCourses = courses.map((course) => ({
    ...course,
    videoUrl: course.videos?.[0]?.url || null,
  }));

  res.json(formattedCourses);
});

/**
 * @desc    Get featured reels (lightweight data with pagination)
 * @route   GET /api/courses/featuredreels
 * @access  Private
 */
const getFeaturedReels = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  // Sorting by creation date (newest first)
  const reels = await Course.find({ isFeatured: true })
    .select(
      'title shortVideoLink image rating reviews difficultyLevel language topics totalDuration numberOfLectures category tags requirements whatYouWillLearn saleEnabled salePrice'
    )
    // .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json(reels);
});

// const getFeaturedReels = asyncHandler(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 5;
//   const skip = (page - 1) * limit;

//   const reels = await Course.find({ isFeatured: true })
//     .select(
//       'title shortVideoLink image rating reviews difficultyLevel language topics totalDuration numberOfLectures category tags requirements whatYouWillLearn'
//     )
//     .skip(skip)
//     .limit(limit);

//   res.json(reels);
// });

/**
 * @desc    Quick search for courses by title/description
 * @route   GET /api/courses/search?query=...
 * @access  Private
 */
const searchCourses = asyncHandler(async (req, res) => {
  const { query = '' } = req.query;
  if (!query.trim()) {
    return res.json([]);
  }

  const filter = {
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
  };

  const suggestions = await Course.find(filter).select(
    'title description image rating reviews isFeatured shortVideoLink saleEnabled salePrice'
  );

  res.json(suggestions);
});

/**
 * @desc    Get a course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('videos');
  if (course) {
    res.json(course);
  } else {
    res.status(404);
    throw new Error('Course not found.');
  }
});

/**
 * @desc    Update a course
 * @route   PUT /api/courses/:id
 * @access  Private/Admin
 */
const updateCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    instructor,
    price,
    image,
    videos,
    rating,
    reviews,
    isFeatured,
    shortVideoLink,
    // Additional fields
    difficultyLevel,
    language,
    topics,
    totalDuration,
    numberOfLectures,
    category,
    tags,
    requirements,
    whatYouWillLearn,
    saleEnabled,
    salePrice,
  } = req.body;

  let course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found.');
  }

  // Update fields if provided; otherwise keep existing values
  course.title = title ?? course.title;
  course.description = description ?? course.description;
  course.instructor = instructor ?? course.instructor;
  course.price = price ?? course.price;
  course.image = image ?? course.image;
  course.rating = rating !== undefined ? rating : course.rating;
  course.reviews = reviews !== undefined ? reviews : course.reviews;
  course.isFeatured = isFeatured !== undefined ? isFeatured : course.isFeatured;
  course.shortVideoLink = course.isFeatured ? shortVideoLink || '' : '';

  course.difficultyLevel = difficultyLevel ?? course.difficultyLevel;
  course.language = language ?? course.language;
  course.topics = topics ?? course.topics;
  course.totalDuration = totalDuration !== undefined ? totalDuration : course.totalDuration;
  course.numberOfLectures = numberOfLectures !== undefined ? numberOfLectures : course.numberOfLectures;
  course.category = category ?? course.category;
  course.tags = tags ?? course.tags;
  course.requirements = requirements ?? course.requirements;
  course.whatYouWillLearn = whatYouWillLearn ?? course.whatYouWillLearn;

  course.saleEnabled = saleEnabled !== undefined ? saleEnabled : course.saleEnabled;
  course.salePrice = salePrice !== undefined ? salePrice : course.salePrice;

  // If videos are provided, replace the current video documents
  if (videos !== undefined) {
    // Remove existing videos for this course
    if (course.videos && course.videos.length > 0) {
      await Video.deleteMany({ _id: { $in: course.videos } });
    }
    // If new videos exist, create them with the course id and sort by priority
    if (Array.isArray(videos) && videos.length > 0) {
      const videosWithCourse = videos.map(video => ({ ...video, course: course._id }));
      let newVideos = await Video.insertMany(videosWithCourse);
      newVideos = newVideos.sort((a, b) => a.priority - b.priority);
      course.videos = newVideos.map(video => video._id);
    } else {
      course.videos = [];
    }
  }

  course = await course.save();
  await course.populate('videos');
  res.json(course);
});

/**
 * @desc    Delete a course
 * @route   DELETE /api/courses/:id
 * @access  Private/Admin
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    // Delete associated videos first (if any)
    if (course.videos && course.videos.length > 0) {
      await Video.deleteMany({ _id: { $in: course.videos } });
    }
    await course.deleteOne();
    res.json({ message: 'Course removed successfully.' });
  } else {
    res.status(404);
    throw new Error('Course not found.');
  }
});

/**
 * @desc    Get all courses for admin (no pagination)
 * @route   GET /api/courses/admin
 * @access  Private
 */
const getCoursesAdmin = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).populate('videos');
  res.json(courses);
});

module.exports = {
  createCourse,
  createFeaturedCourse,
  getCourses,
  getCoursesAdmin,
  getFeaturedReels,
  getCourseById,
  updateCourse,
  deleteCourse,
  searchCourses,
};











// const asyncHandler = require('express-async-handler');
// const Course = require('../models/Course');

// /**
//  * @desc    Create a new course (non-featured by default)
//  * @route   POST /api/courses
//  * @access  Private/Admin
//  */
// const createCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     isFeatured,
//     shortVideoLink,

//     // Additional fields
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//   } = req.body;

//   // Basic required fields check
//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields: title, description, instructor, price, image.');
//   }

//   // If not featured, shortVideoLink should be empty
//   const finalShortVideoLink = isFeatured ? shortVideoLink || '' : '';

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: isFeatured || false,
//     shortVideoLink: finalShortVideoLink,

//     // Additional fields
//     difficultyLevel: difficultyLevel || 'Beginner', // default or from body
//     language: language || 'English',
//     topics: topics || [],
//     totalDuration: totalDuration || 0,
//     numberOfLectures: numberOfLectures || 0,
//     category: category || '',
//     tags: tags || [],
//     requirements: requirements || [],
//     whatYouWillLearn: whatYouWillLearn || [],
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Create a new featured course (isFeatured forced to true)
//  * @route   POST /api/courses/featured
//  * @access  Private/Admin
//  */
// const createFeaturedCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     shortVideoLink,

//     // Additional fields
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//   } = req.body;

//   // Basic required fields check
//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields: title, description, instructor, price, image.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: true,
//     shortVideoLink: shortVideoLink || '',

//     // Additional fields
//     difficultyLevel: difficultyLevel || 'Beginner',
//     language: language || 'English',
//     topics: topics || [],
//     totalDuration: totalDuration || 0,
//     numberOfLectures: numberOfLectures || 0,
//     category: category || '',
//     tags: tags || [],
//     requirements: requirements || [],
//     whatYouWillLearn: whatYouWillLearn || [],
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Get all courses with pagination & selective projection
//  * @route   GET /api/courses
//  * @access  Private
//  */
// const getCourses = asyncHandler(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   // Using .lean() to get plain JS objects
//   const courses = await Course.find({})
//     .select(
//       'title description image rating reviews isFeatured videos difficultyLevel language topics totalDuration numberOfLectures category tags requirements whatYouWillLearn'
//     )
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   // Optionally extract the first video URL from the videos array
//   const formattedCourses = courses.map((course) => ({
//     ...course,
//     videoUrl: course.videos?.[0]?.url || null, // or omit if you don't want
//   }));

//   res.json(formattedCourses);
// });

// /**
//  * @desc    Get featured reels (lightweight data with pagination)
//  * @route   GET /api/courses/featuredreels
//  * @access  Private
//  */
// const getFeaturedReels = asyncHandler(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 5;
//   const skip = (page - 1) * limit;

//   const reels = await Course.find({ isFeatured: true })
//     .select('title shortVideoLink image rating reviews difficultyLevel language topics totalDuration numberOfLectures category tags requirements whatYouWillLearn')
//     .skip(skip)
//     .limit(limit);

//   res.json(reels);
// });

// /**
//  * @desc    Quick search for courses by title/description
//  * @route   GET /api/courses/search?query=...
//  * @access  Private
//  */
// const searchCourses = asyncHandler(async (req, res) => {
//   const { query = '' } = req.query;
//   if (!query.trim()) {
//     return res.json([]);
//   }

//   // Basic regex search, matching title OR description
//   const filter = {
//     $or: [
//       { title: { $regex: query, $options: 'i' } },
//       { description: { $regex: query, $options: 'i' } },
//     ],
//   };

//   const suggestions = await Course.find(filter).select(
//     'title description image rating reviews isFeatured shortVideoLink'
//   );

//   res.json(suggestions);
// });

// /**
//  * @desc    Get a course by ID
//  * @route   GET /api/courses/:id
//  * @access  Private
//  */
// const getCourseById = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     res.json(course);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Update a course
//  * @route   PUT /api/courses/:id
//  * @access  Private/Admin
//  */
// const updateCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     isFeatured,
//     shortVideoLink,

//     // Additional fields
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//   } = req.body;

//   const course = await Course.findById(req.params.id);
//   if (!course) {
//     res.status(404);
//     throw new Error('Course not found.');
//   }

//   // Update each field if provided; otherwise use existing
//   course.title = title ?? course.title;
//   course.description = description ?? course.description;
//   course.instructor = instructor ?? course.instructor;
//   course.price = price ?? course.price;
//   course.image = image ?? course.image;
//   course.videos = videos ?? course.videos;
//   course.rating = rating !== undefined ? rating : course.rating;
//   course.reviews = reviews !== undefined ? reviews : course.reviews;
//   course.isFeatured = isFeatured !== undefined ? isFeatured : course.isFeatured;
//   course.shortVideoLink = course.isFeatured ? shortVideoLink || '' : '';

//   // Additional fields
//   course.difficultyLevel = difficultyLevel ?? course.difficultyLevel;
//   course.language = language ?? course.language;
//   course.topics = topics ?? course.topics;
//   course.totalDuration =
//     totalDuration !== undefined ? totalDuration : course.totalDuration;
//   course.numberOfLectures =
//     numberOfLectures !== undefined ? numberOfLectures : course.numberOfLectures;
//   course.category = category ?? course.category;
//   course.tags = tags ?? course.tags;
//   course.requirements = requirements ?? course.requirements;
//   course.whatYouWillLearn = whatYouWillLearn ?? course.whatYouWillLearn;

//   const updatedCourse = await course.save();
//   res.json(updatedCourse);
// });

// /**
//  * @desc    Delete a course
//  * @route   DELETE /api/courses/:id
//  * @access  Private/Admin
//  */
// const deleteCourse = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     await course.deleteOne();
//     res.json({ message: 'Course removed successfully.' });
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Get all courses for admin (no pagination)
//  * @route   GET /api/courses/admin
//  * @access  Private
//  */
// const getCoursesAdmin = asyncHandler(async (req, res) => {
//   const courses = await Course.find({});
//   res.json(courses);
// });

// module.exports = {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getCoursesAdmin,
//   getFeaturedReels,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
//   searchCourses,
// };







// const asyncHandler = require('express-async-handler');
// const Course = require('../models/Course');

// /**
//  * @desc    Create a new course (non-featured by default)
//  * @route   POST /api/courses
//  * @access  Private/Admin
//  */
// const createCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     isFeatured,
//     shortVideoLink,
//   } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: isFeatured || false,
//     shortVideoLink: isFeatured ? shortVideoLink : '',
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Create a new featured course (isFeatured forced to true)
//  * @route   POST /api/courses/featured
//  * @access  Private/Admin
//  */
// const createFeaturedCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     shortVideoLink,
//   } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: true,
//     shortVideoLink: shortVideoLink || '',
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Get all courses with pagination & selective projection
//  * @route   GET /api/courses
//  * @access  Private
//  */
// const getCourses = asyncHandler(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   const courses = await Course.find({})
//     .select('title description image rating reviews isFeatured videos') // Select full videos array
//     .skip(skip)
//     .limit(limit)
//     .lean(); // Converts Mongoose documents to plain JavaScript objects

//   // Extract the first video URL from the videos array
//   const formattedCourses = courses.map(course => ({
//     ...course,
//     videoUrl: course.videos?.[0]?.url || null, // Extracts the first video's URL or null if unavailable
//   }));

//   res.json(formattedCourses);
// });

// // const getCourses = asyncHandler(async (req, res) => {
// //   const page = Number(req.query.page) || 1;
// //   const limit = Number(req.query.limit) || 10;
// //   const skip = (page - 1) * limit;

// //   const courses = await Course.find({})
// //     .select('title description image rating reviews isFeatured videos[0].url')
// //     .skip(skip)
// //     .limit(limit);

// //   res.json(courses);
// // });

// /**
//  * @desc    Get featured reels (lightweight data with pagination)
//  * @route   GET /api/courses/featuredreels
//  * @access  Private
//  */
// const getFeaturedReels = asyncHandler(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 5;
//   const skip = (page - 1) * limit;
  
//   const reels = await Course.find({ isFeatured: true })
//     .select('title shortVideoLink image')
//     .skip(skip)
//     .limit(limit);
  
//   res.json(reels);
// });

// /**
//  * @desc    Quick search for courses by title/description
//  * @route   GET /api/courses/search?query=...
//  * @access  Private
//  */
// const searchCourses = asyncHandler(async (req, res) => {
//   const { query = '' } = req.query;
//   if (!query) {
//     return res.json([]); // no query => return empty
//   }

//   // For short suggestions, limit to 5 or 10
//   // const limit = 5;

//   // Basic regex search, case-insensitive, matching title OR description
//   const filter = {
//     $or: [
//       { title: { $regex: query, $options: 'i' } },
//       { description: { $regex: query, $options: 'i' } },
//     ],
//   };

//   const suggestions = await Course.find(filter)
//     .select('title description image rating reviews isFeatured shortVideoLink') 
//     // .limit(limit);

//   res.json(suggestions);
// });
// /**
//  * @desc    Get a course by ID
//  * @route   GET /api/courses/:id
//  * @access  Private
//  */
// const getCourseById = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     res.json(course);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Update a course
//  * @route   PUT /api/courses/:id
//  * @access  Private/Admin
//  */
// const updateCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     isFeatured,
//     shortVideoLink,
//   } = req.body;
//   const course = await Course.findById(req.params.id);

//   if (course) {
//     course.title = title || course.title;
//     course.description = description || course.description;
//     course.instructor = instructor || course.instructor;
//     course.price = price || course.price;
//     course.image = image || course.image;
//     course.videos = videos || course.videos;
//     course.rating = rating !== undefined ? rating : course.rating;
//     course.reviews = reviews !== undefined ? reviews : course.reviews;
//     course.isFeatured = isFeatured !== undefined ? isFeatured : course.isFeatured;
//     course.shortVideoLink = isFeatured ? shortVideoLink : '';

//     const updatedCourse = await course.save();
//     res.json(updatedCourse);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Delete a course
//  * @route   DELETE /api/courses/:id
//  * @access  Private/Admin
//  */
// const deleteCourse = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     await course.deleteOne();
//     res.json({ message: 'Course removed successfully.' });
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Get all courses for admin (no pagination)
//  * @route   GET /api/courses/admin
//  * @access  Private
//  */
// const getCoursesAdmin = asyncHandler(async (req, res) => {
//   const courses = await Course.find({});
//   res.json(courses);
// });

// module.exports = {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getCoursesAdmin,
//   getFeaturedReels,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
//   searchCourses,
// };






// const asyncHandler = require('express-async-handler');
// const Course = require('../models/Course');

// /**
//  * @desc    Create a new course (non-featured by default)
//  * @route   POST /api/courses
//  * @access  Private/Admin
//  */
// const createCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     isFeatured,
//     shortVideoLink, // new field
//   } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: isFeatured || false,
//     shortVideoLink: isFeatured ? shortVideoLink : '',
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Create a new featured course (isFeatured is forced to true)
//  * @route   POST /api/courses/featured
//  * @access  Private/Admin
//  */
// const createFeaturedCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     shortVideoLink, // new field
//   } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: true,
//     shortVideoLink: shortVideoLink || '',
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Get all courses with pagination & selective projection
//  * @route   GET /api/courses
//  * @access  Private
//  */
// const getCourses = asyncHandler(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   // Only select lightweight fields for list view
//   const courses = await Course.find({})
//     .select('title description image rating reviews isFeatured')
//     .skip(skip)
//     .limit(limit);
  
//   res.json(courses);
// });

// /**
//  * @desc    Get featured reels (lightweight data for featured courses)
//  * @route   GET /api/courses/featuredreels
//  * @access  Private
//  */
// const getFeaturedReels = asyncHandler(async (req, res) => {
//   const reels = await Course.find({ isFeatured: true })
//     .select('title shortVideoLink image');
//   res.json(reels);
// });

// /**
//  * @desc    Get a course by ID
//  * @route   GET /api/courses/:id
//  * @access  Private
//  */
// const getCourseById = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     res.json(course);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Update a course
//  * @route   PUT /api/courses/:id
//  * @access  Private/Admin
//  */
// const updateCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     isFeatured,
//     shortVideoLink, // new field
//   } = req.body;
//   const course = await Course.findById(req.params.id);

//   if (course) {
//     course.title = title || course.title;
//     course.description = description || course.description;
//     course.instructor = instructor || course.instructor;
//     course.price = price || course.price;
//     course.image = image || course.image;
//     course.videos = videos || course.videos;
//     course.rating = rating !== undefined ? rating : course.rating;
//     course.reviews = reviews !== undefined ? reviews : course.reviews;
//     course.isFeatured = isFeatured !== undefined ? isFeatured : course.isFeatured;
//     course.shortVideoLink = isFeatured ? shortVideoLink : '';

//     const updatedCourse = await course.save();
//     res.json(updatedCourse);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Delete a course
//  * @route   DELETE /api/courses/:id
//  * @access  Private/Admin
//  */
// const deleteCourse = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     await course.deleteOne();
//     res.json({ message: 'Course removed successfully.' });
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Get all courses
//  * @route   GET /api/courses
//  * @access  Private
//  */
// const getCoursesAdmin = asyncHandler(async (req, res) => {
//   const courses = await Course.find({});
//   res.json(courses);
// });


// module.exports = {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getCoursesAdmin,
//   getFeaturedReels,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
// };








// const asyncHandler = require('express-async-handler');
// const Course = require('../models/Course');

// /**
//  * @desc    Create a new course (non-featured by default)
//  * @route   POST /api/courses
//  * @access  Private/Admin
//  */
// const createCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     isFeatured,
//     shortVideoLink, // new field
//   } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: isFeatured || false,
//     shortVideoLink: isFeatured ? shortVideoLink : '',
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Create a new featured course (isFeatured is forced to true)
//  * @route   POST /api/courses/featured
//  * @access  Private/Admin
//  */
// const createFeaturedCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     shortVideoLink, // new field
//   } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: true,
//     shortVideoLink: shortVideoLink || '',
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Get all courses
//  * @route   GET /api/courses
//  * @access  Private
//  */
// const getCourses = asyncHandler(async (req, res) => {
//   const courses = await Course.find({});
//   res.json(courses);
// });

// /**
//  * @desc    Get a course by ID
//  * @route   GET /api/courses/:id
//  * @access  Private
//  */
// const getCourseById = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     res.json(course);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Update a course
//  * @route   PUT /api/courses/:id
//  * @access  Private/Admin
//  */
// const updateCourse = asyncHandler(async (req, res) => {
//   const {
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos,
//     rating,
//     reviews,
//     isFeatured,
//     shortVideoLink, // new field
//   } = req.body;
//   const course = await Course.findById(req.params.id);

//   if (course) {
//     course.title = title || course.title;
//     course.description = description || course.description;
//     course.instructor = instructor || course.instructor;
//     course.price = price || course.price;
//     course.image = image || course.image;
//     course.videos = videos || course.videos;
//     course.rating = rating !== undefined ? rating : course.rating;
//     course.reviews = reviews !== undefined ? reviews : course.reviews;
//     course.isFeatured = isFeatured !== undefined ? isFeatured : course.isFeatured;
//     course.shortVideoLink = isFeatured ? shortVideoLink : '';

//     const updatedCourse = await course.save();
//     res.json(updatedCourse);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Delete a course
//  * @route   DELETE /api/courses/:id
//  * @access  Private/Admin
//  */
// const deleteCourse = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     await course.deleteOne();
//     res.json({ message: 'Course removed successfully.' });
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// module.exports = {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
// };








// const asyncHandler = require('express-async-handler');
// const Course = require('../models/Course');

// /**
//  * @desc    Create a new course (non-featured by default)
//  * @route   POST /api/courses
//  * @access  Private/Admin
//  */
// const createCourse = asyncHandler(async (req, res) => {
//   const { title, description, instructor, price, image, videos, rating, reviews, isFeatured } =
//     req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: isFeatured || false,
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Create a new featured course (isFeatured is forced to true)
//  * @route   POST /api/courses/featured
//  * @access  Private/Admin
//  */
// const createFeaturedCourse = asyncHandler(async (req, res) => {
//   const { title, description, instructor, price, image, videos, rating, reviews } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: true,
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Get all courses
//  * @route   GET /api/courses
//  * @access  Private
//  */
// const getCourses = asyncHandler(async (req, res) => {
//   const courses = await Course.find({});
//   res.json(courses);
// });

// /**
//  * @desc    Get a course by ID
//  * @route   GET /api/courses/:id
//  * @access  Private
//  */
// const getCourseById = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     res.json(course);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Update a course
//  * @route   PUT /api/courses/:id
//  * @access  Private/Admin
//  */
// const updateCourse = asyncHandler(async (req, res) => {
//   const { title, description, instructor, price, image, videos, rating, reviews, isFeatured } =
//     req.body;
//   const course = await Course.findById(req.params.id);

//   if (course) {
//     course.title = title || course.title;
//     course.description = description || course.description;
//     course.instructor = instructor || course.instructor;
//     course.price = price || course.price;
//     course.image = image || course.image;
//     course.videos = videos || course.videos;
//     course.rating = rating !== undefined ? rating : course.rating;
//     course.reviews = reviews !== undefined ? reviews : course.reviews;
//     course.isFeatured = isFeatured !== undefined ? isFeatured : course.isFeatured;

//     const updatedCourse = await course.save();
//     res.json(updatedCourse);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Delete a course
//  * @route   DELETE /api/courses/:id
//  * @access  Private/Admin
//  */
// const deleteCourse = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     await course.remove();
//     res.json({ message: 'Course removed successfully.' });
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// module.exports = {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
// };













// // controllers/courseController.js
// const asyncHandler = require('express-async-handler');
// const Course = require('../models/Course');

// /**
//  * @desc    Create a new course (non-featured by default)
//  * @route   POST /api/courses
//  * @access  Private/Admin
//  */
// const createCourse = asyncHandler(async (req, res) => {
//   const { title, description, instructor, price, image, videos, rating, reviews, isFeatured } =
//     req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: isFeatured || false, // allow override if needed
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Create a new featured course (isFeatured is forced to true)
//  * @route   POST /api/courses/featured
//  * @access  Private/Admin
//  */
// const createFeaturedCourse = asyncHandler(async (req, res) => {
//   const { title, description, instructor, price, image, videos, rating, reviews } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields.');
//   }

//   const course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     videos: videos || [],
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: true, // Always set featured to true
//   });

//   const createdCourse = await course.save();
//   res.status(201).json(createdCourse);
// });

// /**
//  * @desc    Get all courses
//  * @route   GET /api/courses
//  * @access  Private
//  */
// const getCourses = asyncHandler(async (req, res) => {
//   const courses = await Course.find({});
//   res.json(courses);
// });

// /**
//  * @desc    Get a course by ID
//  * @route   GET /api/courses/:id
//  * @access  Private
//  */
// const getCourseById = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     res.json(course);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Update a course
//  * @route   PUT /api/courses/:id
//  * @access  Private/Admin
//  */
// const updateCourse = asyncHandler(async (req, res) => {
//   const { title, description, instructor, price, image, videos, rating, reviews, isFeatured } =
//     req.body;
//   const course = await Course.findById(req.params.id);

//   if (course) {
//     course.title = title || course.title;
//     course.description = description || course.description;
//     course.instructor = instructor || course.instructor;
//     course.price = price || course.price;
//     course.image = image || course.image;
//     course.videos = videos || course.videos;
//     course.rating = rating !== undefined ? rating : course.rating;
//     course.reviews = reviews !== undefined ? reviews : course.reviews;
//     course.isFeatured = isFeatured !== undefined ? isFeatured : course.isFeatured;

//     const updatedCourse = await course.save();
//     res.json(updatedCourse);
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// /**
//  * @desc    Delete a course
//  * @route   DELETE /api/courses/:id
//  * @access  Private/Admin
//  */
// const deleteCourse = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     await course.remove();
//     res.json({ message: 'Course removed successfully.' });
//   } else {
//     res.status(404);
//     throw new Error('Course not found.');
//   }
// });

// module.exports = {
//   createCourse,
//   createFeaturedCourse,
//   getCourses,
//   getCourseById,
//   updateCourse,
//   deleteCourse,
// };
