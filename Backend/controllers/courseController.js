// controllers/courseController.js

const asyncHandler = require('express-async-handler');
const { Readable } = require('stream');
const Course = require('../models/Course');
const Video = require('../models/Video');
const cloudinary = require('../config/cloudinary');

/**
 * Helper: wrap cloudinary.uploader.upload_stream in a Promise
 */
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return reject(new Error('Failed to upload file to Cloudinary.'));
      }
      resolve(result);
    });
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

// /**
//  * @desc Create a new course (non-featured by default)
//  * @route POST /api/courses
//  * @access Private/Admin
//  */
// exports.createCourse = asyncHandler(async (req, res) => {
//   // Basic fields from req.body (text)
//   let {
//     title,
//     description,
//     instructor,
//     price,
//     rating,
//     reviews,
//     isFeatured,
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//     saleEnabled,
//     salePrice,

//     // We'll store video metadata in 'videosData' as JSON
//     // and short video as a file if isFeatured
//     videosData,
//   } = req.body;

//   // Convert some fields
//   const featured = isFeatured === 'true' || isFeatured === true;
//   const sale = saleEnabled === 'true' || saleEnabled === true;
//   topics = topics ? topics.split(',').map((t) => t.trim()).filter(Boolean) : [];
//   tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
//   requirements = requirements ? requirements.split(',').map((t) => t.trim()).filter(Boolean) : [];
//   whatYouWillLearn = whatYouWillLearn
//     ? whatYouWillLearn.split(',').map((t) => t.trim()).filter(Boolean)
//     : [];

//   // Create the Course doc
//   let course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: featured,
//     difficultyLevel: difficultyLevel || 'Beginner',
//     language: language || 'English',
//     topics,
//     totalDuration: totalDuration || 0,
//     numberOfLectures: numberOfLectures || 0,
//     category: category || '',
//     tags,
//     requirements,
//     whatYouWillLearn,
//     saleEnabled: sale,
//     salePrice: salePrice || 0,
//   });

//   // 1) Upload main course image, if any
//   if (req.files?.image?.[0]) {
//     const imgFile = req.files.image[0];
//     const imgRes = await uploadToCloudinary(imgFile.buffer, {
//       folder: 'course_images',
//       resource_type: 'image',
//     });
//     course.image.public_id = imgRes.public_id;
//     course.image.url = imgRes.secure_url;
//   }

//   // 2) If featured, upload shortVideo, if any
//   if (featured && req.files?.shortVideo?.[0]) {
//     const shortFile = req.files.shortVideo[0];
//     const vidRes = await uploadToCloudinary(shortFile.buffer, {
//       folder: 'course_short_videos',
//       resource_type: 'video',
//     });
//     course.shortVideoLink.public_id = vidRes.public_id;
//     course.shortVideoLink.url = vidRes.secure_url;
//   }

//   // Save so we have an _id for the relationship
//   course = await course.save();

//   // 3) Parse 'videosData' from JSON
//   let parsedVideos = [];
//   try {
//     parsedVideos = JSON.parse(videosData || '[]'); // array of { title, description, ... }
//   } catch (err) {
//     parsedVideos = [];
//   }

//   const createdVideos = [];
//   // Each video object can have an actual video file and a cover image
//   for (let i = 0; i < parsedVideos.length; i++) {
//     const vData = parsedVideos[i];

//     let newVid = new Video({
//       title: vData.title || 'Untitled Video',
//       description: vData.description || '',
//       duration: vData.duration || 0,
//       priority: vData.priority || 0,
//       course: course._id,
//     });

//     // If user uploaded a video file at index i
//     if (req.files?.videos?.[i]) {
//       const videoFile = req.files.videos[i];
//       const uploadRes = await uploadToCloudinary(videoFile.buffer, {
//         folder: 'course_videos',
//         resource_type: 'video',
//       });
//       newVid.videoFile.public_id = uploadRes.public_id;
//       newVid.videoFile.url = uploadRes.secure_url;
//     }

//     // If user uploaded a cover image at index i
//     if (req.files?.covers?.[i]) {
//       const coverFile = req.files.covers[i];
//       const coverRes = await uploadToCloudinary(coverFile.buffer, {
//         folder: 'course_video_covers',
//         resource_type: 'image',
//       });
//       newVid.coverImage.public_id = coverRes.public_id;
//       newVid.coverImage.url = coverRes.secure_url;
//     }

//     newVid = await newVid.save();
//     createdVideos.push(newVid);
//   }

//   // Sort videos by priority
//   createdVideos.sort((a, b) => a.priority - b.priority);

//   // Link them to the course
//   course.videos = createdVideos.map((v) => v._id);
//   await course.save();

//   // Return the new course with videos
//   const populated = await Course.findById(course._id).populate('videos');
//   res.status(201).json(populated);
// });
exports.createCourse = asyncHandler(async (req, res) => {
  // 1) Basic text fields
  let {
    title,
    description,
    instructor,
    price,
    rating,
    reviews,
    isFeatured,
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
    videosData, // JSON array of video info
  } = req.body;

  const featured = isFeatured === 'true' || isFeatured === true;
  const sale = saleEnabled === 'true' || saleEnabled === true;

  // Convert CSV fields => arrays
  const topicsArr = topics ? topics.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const tagsArr = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const reqArr = requirements ? requirements.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const learnArr = whatYouWillLearn
    ? whatYouWillLearn.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  // 2) Create course doc
  let course = new Course({
    title,
    description,
    instructor,
    price,
    rating: rating || 0,
    reviews: reviews || 0,
    isFeatured: featured,
    difficultyLevel: difficultyLevel || 'Beginner',
    language: language || 'English',
    topics: topicsArr,
    totalDuration: totalDuration || 0,
    numberOfLectures: numberOfLectures || 0,
    category: category || '',
    tags: tagsArr,
    requirements: reqArr,
    whatYouWillLearn: learnArr,
    saleEnabled: sale,
    salePrice: salePrice || 0,
  });

  // 3) If user sent a main image
  const mainImageFile = req.files.find((f) => f.fieldname === 'image');
  if (mainImageFile) {
    const imgRes = await uploadToCloudinary(mainImageFile.buffer, {
      folder: 'course_images',
      resource_type: 'image',
    });
    course.image.public_id = imgRes.public_id;
    course.image.url = imgRes.secure_url;
  }

  // 4) If course is featured, check for shortVideo
  if (featured) {
    const shortFile = req.files.find((f) => f.fieldname === 'shortVideo');
    if (shortFile) {
      const vidRes = await uploadToCloudinary(shortFile.buffer, {
        folder: 'course_short_videos',
        resource_type: 'video',
      });
      course.shortVideoLink.public_id = vidRes.public_id;
      course.shortVideoLink.url = vidRes.secure_url;
    }
  }

  // Save the course so we get its _id for the videos
  course = await course.save();

  // 5) Parse videosData
  let parsedVideos = [];
  try {
    parsedVideos = JSON.parse(videosData || '[]');
  } catch (err) {
    parsedVideos = [];
  }

  // 6) Create each video doc, using distinct field names
  const createdVideos = [];
  for (let i = 0; i < parsedVideos.length; i++) {
    const vData = parsedVideos[i];

    // Basic video doc
    let newVid = new Video({
      title: vData.title || 'Untitled Video',
      description: vData.description || '',
      duration: vData.duration || 0,
      priority: vData.priority || 0,
      course: course._id,
    });

    // Unique ID for file fields, or fallback to "new_i"
    const uniqueId = vData._id || `new_${i}`;
    const videoField = `videoFile_${uniqueId}`;
    const coverField = `coverFile_${uniqueId}`;

    // If there's a matching videoFile in req.files
    const foundVidFile = req.files.find((f) => f.fieldname === videoField);
    if (foundVidFile) {
      const uploadRes = await uploadToCloudinary(foundVidFile.buffer, {
        folder: 'course_videos',
        resource_type: 'video',
      });
      newVid.videoFile.public_id = uploadRes.public_id;
      newVid.videoFile.url = uploadRes.secure_url;
    }

    // If there's a matching coverFile in req.files
    const foundCoverFile = req.files.find((f) => f.fieldname === coverField);
    if (foundCoverFile) {
      const coverRes = await uploadToCloudinary(foundCoverFile.buffer, {
        folder: 'course_video_covers',
        resource_type: 'image',
      });
      newVid.coverImage.public_id = coverRes.public_id;
      newVid.coverImage.url = coverRes.secure_url;
    }

    newVid = await newVid.save();
    createdVideos.push(newVid);
  }

  // 7) Sort by priority, attach to course
  createdVideos.sort((a, b) => a.priority - b.priority);
  course.videos = createdVideos.map((v) => v._id);
  await course.save();

  // 8) Return the new course w/ populated videos
  const populated = await Course.findById(course._id).populate('videos');
  res.status(201).json(populated);
});


/**
 * @desc Create a new featured course
 * @route POST /api/courses/featured
 * @access Private/Admin
 */
exports.createFeaturedCourse = asyncHandler(async (req, res) => {
  // You can replicate the same logic as createCourse, forcing isFeatured to true.
  // For brevity, you can just reuse createCourse or do a custom approach here.
  res
    .status(501)
    .json({
      message:
        'createFeaturedCourse not implemented. Please replicate create logic with forced isFeatured = true.',
    });
});

/**
 * @desc Get all courses with pagination & selective projection
 * @route GET /api/courses
 * @access Private
 */
exports.getCourses = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const courses = await Course.find({})
    .populate('videos')
    .skip(skip)
    .limit(limit)
    .lean();

  // Optionally, get the first video if you want
  const formatted = courses.map((course) => ({
    ...course,
    firstVideoUrl: course.videos?.[0]?.videoFile?.url || null,
  }));

  res.json(formatted);
});

/**
 * @desc   Get featured reels
 * @route  GET /api/courses/featuredreels
 * @access Private
 */
exports.getFeaturedReels = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const reels = await Course.find({ isFeatured: true }).skip(skip).limit(limit).lean();
  res.json(reels);
});

/**
 * @desc   Quick search for courses by title/description
 * @route  GET /api/courses/search?query=...
 * @access Private
 */
exports.searchCourses = asyncHandler(async (req, res) => {
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
  const suggestions = await Course.find(filter).limit(20).lean();
  res.json(suggestions);
});

/**
 * @desc    Get a course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
exports.getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('videos');
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  res.json(course);
});

// /**
//  * @desc  Update a course
//  * @route PUT /api/courses/:id
//  * @access Private/Admin
//  */
// exports.updateCourse = asyncHandler(async (req, res) => {
//   const courseId = req.params.id;
//   let course = await Course.findById(courseId);
//   if (!course) {
//     res.status(404);
//     throw new Error('Course not found');
//   }

//   // =========== 1) Update basic textual fields ===========
//   let {
//     title,
//     description,
//     instructor,
//     price,
//     rating,
//     reviews,
//     isFeatured,
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//     saleEnabled,
//     salePrice,
//     videosData,
//   } = req.body;

//   const featured = isFeatured === 'true' || isFeatured === true;
//   const sale = saleEnabled === 'true' || saleEnabled === true;

//   // Convert string fields => arrays
//   course.title = title ?? course.title;
//   course.description = description ?? course.description;
//   course.instructor = instructor ?? course.instructor;
//   course.price = price ?? course.price;
//   course.rating = rating ?? course.rating;
//   course.reviews = reviews ?? course.reviews;
//   course.isFeatured = featured;
//   course.difficultyLevel = difficultyLevel ?? course.difficultyLevel;
//   course.language = language ?? course.language;
//   course.topics = topics
//     ? topics.split(',').map((t) => t.trim()).filter(Boolean)
//     : course.topics;
//   course.totalDuration = totalDuration ?? course.totalDuration;
//   course.numberOfLectures = numberOfLectures ?? course.numberOfLectures;
//   course.category = category ?? course.category;
//   course.tags = tags
//     ? tags.split(',').map((t) => t.trim()).filter(Boolean)
//     : course.tags;
//   course.requirements = requirements
//     ? requirements.split(',').map((t) => t.trim()).filter(Boolean)
//     : course.requirements;
//   course.whatYouWillLearn = whatYouWillLearn
//     ? whatYouWillLearn.split(',').map((t) => t.trim()).filter(Boolean)
//     : course.whatYouWillLearn;
//   course.saleEnabled = sale;
//   course.salePrice = salePrice ?? course.salePrice;

//   // =========== 2) Update main image, short video if present ===========
//   if (req.files?.image?.[0]) {
//     if (course.image.public_id) {
//       await cloudinary.uploader.destroy(course.image.public_id, {
//         resource_type: 'image',
//       });
//     }
//     const imgFile = req.files.image[0];
//     const imgRes = await uploadToCloudinary(imgFile.buffer, {
//       folder: 'course_images',
//       resource_type: 'image',
//     });
//     course.image.public_id = imgRes.public_id;
//     course.image.url = imgRes.secure_url;
//   }

//   if (featured && req.files?.shortVideo?.[0]) {
//     if (course.shortVideoLink.public_id) {
//       await cloudinary.uploader.destroy(course.shortVideoLink.public_id, {
//         resource_type: 'video',
//       });
//     }
//     const shortFile = req.files.shortVideo[0];
//     const vidRes = await uploadToCloudinary(shortFile.buffer, {
//       folder: 'course_short_videos',
//       resource_type: 'video',
//     });
//     course.shortVideoLink.public_id = vidRes.public_id;
//     course.shortVideoLink.url = vidRes.secure_url;
//   }

//   await course.save(); // save partial updates

//   // =========== 3) Upsert Videos with file-pointer approach ===========
//   if (videosData) {
//     // parse the incoming videos array
//     let parsedVideos = [];
//     try {
//       parsedVideos = JSON.parse(videosData); // each item: { _id?: '', title, description, ... }
//     } catch (err) {
//       parsedVideos = [];
//     }

//     // Old videos in DB for this course
//     const oldVideos = await Video.find({ _id: { $in: course.videos } });
//     const finalVideoIds = [];

//     // IMPORTANT: We'll track separate pointer indexes for actual new file arrays:
//     const realVideoFiles = req.files.videos || [];  // actual uploaded video files
//     const realCoverFiles = req.files.covers || [];  // actual uploaded covers
//     let vfIndex = 0;  // pointer for realVideoFiles
//     let cfIndex = 0;  // pointer for realCoverFiles

//     // Loop over the new array
//     for (let i = 0; i < parsedVideos.length; i++) {
//       const vData = parsedVideos[i];
//       let videoDoc;

//       // find existing doc if _id is present
//       if (vData._id) {
//         videoDoc = oldVideos.find((ov) => ov._id.toString() === vData._id);
//       }

//       if (videoDoc) {
//         // ---------- UPDATE EXISTING VIDEO ----------
//         videoDoc.title = vData.title || videoDoc.title;
//         videoDoc.description = vData.description || videoDoc.description;
//         videoDoc.duration = vData.duration ?? videoDoc.duration;
//         videoDoc.priority = vData.priority ?? videoDoc.priority;

//         // If there's still a real videoFile left at vfIndex, we treat it as the file for THIS item
//         if (!vData._id) {
//           // Only assign new files to NEW videos
//           const newVideoFile = realVideoFiles[vfIndex];
//           vfIndex++;
//           if (newVideoFile) {
//             const uploadRes = await uploadToCloudinary(newVideoFile.buffer, {
//               folder: 'course_videos',
//               resource_type: 'video',
//             });
//             newVid.videoFile.public_id = uploadRes.public_id;
//             newVid.videoFile.url = uploadRes.secure_url;
//           }
        
//           const newCoverFile = realCoverFiles[cfIndex];
//           cfIndex++;
//           if (newCoverFile) {
//             const coverRes = await uploadToCloudinary(newCoverFile.buffer, {
//               folder: 'course_video_covers',
//               resource_type: 'image',
//             });
//             newVid.coverImage.public_id = coverRes.public_id;
//             newVid.coverImage.url = coverRes.secure_url;
//           }
//         }
        

//         // If there's still a real coverFile at cfIndex, use it for THIS item
//         // if (cfIndex < realCoverFiles.length) {
//         //   const newCoverFile = realCoverFiles[cfIndex];
//         //   cfIndex += 1; // move pointer
//         //   if (newCoverFile) {
//         //     if (videoDoc.coverImage.public_id) {
//         //       await cloudinary.uploader.destroy(videoDoc.coverImage.public_id, {
//         //         resource_type: 'image',
//         //       });
//         //     }
//         //     const coverRes = await uploadToCloudinary(newCoverFile.buffer, {
//         //       folder: 'course_video_covers',
//         //       resource_type: 'image',
//         //     });
//         //     videoDoc.coverImage.public_id = coverRes.public_id;
//         //     videoDoc.coverImage.url = coverRes.secure_url;
//         //   }
//         // }
//         // ✅ Only update cover image if the video is NEW (i.e., no _id)
//         if (!vData._id) {
//           const newCoverFile = realCoverFiles[cfIndex];
//           cfIndex++;
//           if (newCoverFile) {
//             const coverRes = await uploadToCloudinary(newCoverFile.buffer, {
//               folder: 'course_video_covers',
//               resource_type: 'image',
//             });
//             newVid.coverImage.public_id = coverRes.public_id;
//             newVid.coverImage.url = coverRes.secure_url;
//           }
//         }


//         await videoDoc.save();
//         finalVideoIds.push(videoDoc._id);
//       } else {
//         // ---------- CREATE A NEW VIDEO DOC ----------
//         const newVid = await createNewVideoDocPointer(
//           vData,
//           course._id,
//           realVideoFiles,
//           realCoverFiles,
//           () => {
//             // Grab videoFile & increment pointer
//             if (vfIndex < realVideoFiles.length) {
//               const f = realVideoFiles[vfIndex];
//               vfIndex++;
//               return f;
//             }
//             return null;
//           },
//           () => {
//             // Grab coverFile & increment pointer
//             if (cfIndex < realCoverFiles.length) {
//               const c = realCoverFiles[cfIndex];
//               cfIndex++;
//               return c;
//             }
//             return null;
//           }
//         );
//         finalVideoIds.push(newVid._id);
//       }
//     }

//     // Remove old videos that are not in final
//     for (const oldVid of oldVideos) {
//       if (!finalVideoIds.some((id) => id.toString() === oldVid._id.toString())) {
//         // user removed that oldVid
//         if (oldVid.videoFile.public_id) {
//           await cloudinary.uploader.destroy(oldVid.videoFile.public_id, {
//             resource_type: 'video',
//           });
//         }
//         if (oldVid.coverImage.public_id) {
//           await cloudinary.uploader.destroy(oldVid.coverImage.public_id, {
//             resource_type: 'image',
//           });
//         }
//         await oldVid.deleteOne();
//       }
//     }

//     // Sort by priority & save
//     const finalDocs = await Video.find({ _id: { $in: finalVideoIds } });
//     finalDocs.sort((a, b) => a.priority - b.priority);
//     course.videos = finalDocs.map((v) => v._id);
//     await course.save();
//   }

//   // =========== 4) Return the updated course with videos ===========
//   const updatedCourse = await Course.findById(course._id).populate('videos');
//   res.json(updatedCourse);
// });

exports.updateCourse = asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  let course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // 1) Update textual fields
  const {
    title,
    description,
    instructor,
    price,
    rating,
    reviews,
    isFeatured,
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
    videosData,  // JSON array of video metadata
  } = req.body;

  // Convert to booleans, arrays, etc.
  course.title = title ?? course.title;
  course.description = description ?? course.description;
  course.instructor = instructor ?? course.instructor;
  course.price = price ?? course.price;
  course.rating = rating ?? course.rating;
  course.reviews = reviews ?? course.reviews;
  course.isFeatured = isFeatured === 'true' || isFeatured === true;
  course.difficultyLevel = difficultyLevel ?? course.difficultyLevel;
  course.language = language ?? course.language;
  course.topics = topics ? topics.split(',').map((t) => t.trim()).filter(Boolean) : course.topics;
  course.totalDuration = totalDuration ?? course.totalDuration;
  course.numberOfLectures = numberOfLectures ?? course.numberOfLectures;
  course.category = category ?? course.category;
  course.tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : course.tags;
  course.requirements = requirements ? requirements.split(',').map((t) => t.trim()).filter(Boolean) : course.requirements;
  course.whatYouWillLearn = whatYouWillLearn ? whatYouWillLearn.split(',').map((t) => t.trim()).filter(Boolean) : course.whatYouWillLearn;
  course.saleEnabled = saleEnabled === 'true' || saleEnabled === true;
  course.salePrice = salePrice ?? course.salePrice;

  // 2) Update main image, shortVideo if present
  if (req.files.find((f) => f.fieldname === 'image')) {
    // remove old from Cloudinary
    if (course.image.public_id) {
      await cloudinary.uploader.destroy(course.image.public_id, { resource_type: 'image' });
    }
    const file = req.files.find((f) => f.fieldname === 'image');
    const imgRes = await uploadToCloudinary(file.buffer, {
      folder: 'course_images',
      resource_type: 'image',
    });
    course.image.public_id = imgRes.public_id;
    course.image.url = imgRes.secure_url;
  }

  if (course.isFeatured && req.files.find((f) => f.fieldname === 'shortVideo')) {
    // remove old from Cloudinary
    if (course.shortVideoLink.public_id) {
      await cloudinary.uploader.destroy(course.shortVideoLink.public_id, { resource_type: 'video' });
    }
    const file = req.files.find((f) => f.fieldname === 'shortVideo');
    const vidRes = await uploadToCloudinary(file.buffer, {
      folder: 'course_short_videos',
      resource_type: 'video',
    });
    course.shortVideoLink.public_id = vidRes.public_id;
    course.shortVideoLink.url = vidRes.secure_url;
  }

  await course.save(); // partial save

  // 3) Upsert Videos
  let parsedVideos = [];
  try {
    parsedVideos = JSON.parse(videosData || '[]');
  } catch (err) {
    parsedVideos = [];
  }

  // old videos from DB
  const oldVideos = await Video.find({ _id: { $in: course.videos } });
  const finalVideoIds = [];

  for (let i = 0; i < parsedVideos.length; i++) {
    const vData = parsedVideos[i];
    let videoDoc = null;

    // If there's a real _id, we assume it's an existing video
    if (vData._id) {
      videoDoc = oldVideos.find((ov) => ov._id.toString() === vData._id);
    }

    if (videoDoc) {
      // -- UPDATE existing videoDoc
      videoDoc.title = vData.title || videoDoc.title;
      videoDoc.description = vData.description || videoDoc.description;
      videoDoc.duration = vData.duration ?? videoDoc.duration;
      videoDoc.priority = vData.priority ?? videoDoc.priority;

      // field names for this item
      const uniqueId = vData._id; // e.g. "642baa..."
      const videoField = `videoFile_${uniqueId}`;
      const coverField = `coverFile_${uniqueId}`;

      // If there's a new video file
      const newVidFile = req.files.find((f) => f.fieldname === videoField);
      if (newVidFile) {
        // remove old
        if (videoDoc.videoFile.public_id) {
          await cloudinary.uploader.destroy(videoDoc.videoFile.public_id, { resource_type: 'video' });
        }
        // upload new
        const uploadRes = await uploadToCloudinary(newVidFile.buffer, {
          folder: 'course_videos',
          resource_type: 'video',
        });
        videoDoc.videoFile.public_id = uploadRes.public_id;
        videoDoc.videoFile.url = uploadRes.secure_url;
      }

      // If there's a new cover file
      const newCoverFile = req.files.find((f) => f.fieldname === coverField);
      if (newCoverFile) {
        if (videoDoc.coverImage.public_id) {
          await cloudinary.uploader.destroy(videoDoc.coverImage.public_id, { resource_type: 'image' });
        }
        const coverRes = await uploadToCloudinary(newCoverFile.buffer, {
          folder: 'course_video_covers',
          resource_type: 'image',
        });
        videoDoc.coverImage.public_id = coverRes.public_id;
        videoDoc.coverImage.url = coverRes.secure_url;
      }

      await videoDoc.save();
      finalVideoIds.push(videoDoc._id);

    } else {
      // -- CREATE a new video doc
      const newVid = new Video({
        title: vData.title || 'Untitled Video',
        description: vData.description || '',
        duration: vData.duration || 0,
        priority: vData.priority || 0,
        course: course._id,
      });

      // If there's a new file for a "fake" ID like "new_0"
      const uniqueId = vData._id || `new_${i}`; // e.g. "new_0"
      const videoField = `videoFile_${uniqueId}`;
      const coverField = `coverFile_${uniqueId}`;

      const newVidFile = req.files.find((f) => f.fieldname === videoField);
      if (newVidFile) {
        const vidRes = await uploadToCloudinary(newVidFile.buffer, {
          folder: 'course_videos',
          resource_type: 'video',
        });
        newVid.videoFile.public_id = vidRes.public_id;
        newVid.videoFile.url = vidRes.secure_url;
      }

      const newCoverFile = req.files.find((f) => f.fieldname === coverField);
      if (newCoverFile) {
        const coverRes = await uploadToCloudinary(newCoverFile.buffer, {
          folder: 'course_video_covers',
          resource_type: 'image',
        });
        newVid.coverImage.public_id = coverRes.public_id;
        newVid.coverImage.url = coverRes.secure_url;
      }

      await newVid.save();
      finalVideoIds.push(newVid._id);
    }
  }

  // 4) Remove old videos that no longer exist
  for (const oldVid of oldVideos) {
    if (!finalVideoIds.some((id) => id.toString() === oldVid._id.toString())) {
      // user removed that video
      if (oldVid.videoFile.public_id) {
        await cloudinary.uploader.destroy(oldVid.videoFile.public_id, { resource_type: 'video' });
      }
      if (oldVid.coverImage.public_id) {
        await cloudinary.uploader.destroy(oldVid.coverImage.public_id, { resource_type: 'image' });
      }
      await oldVid.deleteOne();
    }
  }

  // Sort them by priority
  const finalDocs = await Video.find({ _id: { $in: finalVideoIds } });
  finalDocs.sort((a, b) => a.priority - b.priority);
  course.videos = finalDocs.map((v) => v._id);
  await course.save();

  const updatedCourse = await Course.findById(course._id).populate('videos');
  res.json(updatedCourse);
});


/** 
 * Helper for creating a new Video doc using "pointer-based" file selection
 */
async function createNewVideoDocPointer(
  vData,
  courseId,
  realVideoFiles,
  realCoverFiles,
  getNextVideoFile,
  getNextCoverFile
) {
  let newVid = new Video({
    title: vData.title || 'Untitled Video',
    description: vData.description || '',
    duration: vData.duration || 0,
    priority: vData.priority || 0,
    course: courseId,
  });

  // Attempt to pull the next file from "getNextVideoFile()"
  const file = getNextVideoFile();
  if (file) {
    const upRes = await uploadToCloudinary(file.buffer, {
      folder: 'course_videos',
      resource_type: 'video',
    });
    newVid.videoFile.public_id = upRes.public_id;
    newVid.videoFile.url = upRes.secure_url;
  }

  // Attempt the next cover file
  const cover = getNextCoverFile();
  if (cover) {
    const coverRes = await uploadToCloudinary(cover.buffer, {
      folder: 'course_video_covers',
      resource_type: 'image',
    });
    newVid.coverImage.public_id = coverRes.public_id;
    newVid.coverImage.url = coverRes.secure_url;
  }

  return await newVid.save();
}

/**
 * @desc Delete a course
 * @route DELETE /api/courses/:id
 * @access Private/Admin
 */
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found.');
  }

  // Remove main image from Cloudinary if any
  if (course.image.public_id) {
    await cloudinary.uploader.destroy(course.image.public_id, { resource_type: 'image' });
  }

  // Remove shortVideo if any
  if (course.shortVideoLink.public_id) {
    await cloudinary.uploader.destroy(course.shortVideoLink.public_id, {
      resource_type: 'video',
    });
  }

  // Remove course videos from DB + Cloudinary
  if (course.videos && course.videos.length > 0) {
    const oldVideos = await Video.find({ _id: { $in: course.videos } });
    for (const v of oldVideos) {
      if (v.videoFile.public_id) {
        await cloudinary.uploader.destroy(v.videoFile.public_id, { resource_type: 'video' });
      }
      if (v.coverImage.public_id) {
        await cloudinary.uploader.destroy(v.coverImage.public_id, { resource_type: 'image' });
      }
    }
    await Video.deleteMany({ _id: { $in: course.videos } });
  }

  await course.deleteOne();
  res.json({ message: 'Course removed successfully.' });
});

/**
 * @desc Get all courses for admin (no pagination)
 * @route GET /api/courses/admin
 * @access Private
 */
exports.getCoursesAdmin = asyncHandler(async (req, res) => {
  const courses = await Course.find({}).populate('videos');
  res.json(courses);
});







// // controllers/courseController.js

// const asyncHandler = require('express-async-handler');
// const { Readable } = require('stream');
// const Course = require('../models/Course');
// const Video = require('../models/Video');
// const cloudinary = require('../config/cloudinary');

// /**
//  * Helper: wrap cloudinary.uploader.upload_stream in a Promise
//  */
// const uploadToCloudinary = (fileBuffer, options) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
//       if (error) {
//         console.error('Cloudinary Upload Error:', error);
//         return reject(new Error('Failed to upload file to Cloudinary.'));
//       }
//       resolve(result);
//     });
//     Readable.from(fileBuffer).pipe(uploadStream);
//   });
// };

// /**
//  * @desc Create a new course (non-featured by default)
//  * @route POST /api/courses
//  * @access Private/Admin
//  */
// exports.createCourse = asyncHandler(async (req, res) => {
//   // Basic fields from req.body (text)
//   let {
//     title,
//     description,
//     instructor,
//     price,
//     rating,
//     reviews,
//     isFeatured,
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//     saleEnabled,
//     salePrice,

//     // We'll store video metadata in 'videosData' as JSON 
//     // and short video as a file if isFeatured
//     videosData,
//   } = req.body;

//   // Convert some fields
//   const featured = isFeatured === 'true' || isFeatured === true;
//   const sale = saleEnabled === 'true' || saleEnabled === true;
//   topics = topics ? topics.split(',').map((t) => t.trim()).filter(Boolean) : [];
//   tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
//   requirements = requirements ? requirements.split(',').map((t) => t.trim()).filter(Boolean) : [];
//   whatYouWillLearn = whatYouWillLearn ? whatYouWillLearn.split(',').map((t) => t.trim()).filter(Boolean) : [];

//   // Create the Course doc
//   let course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: featured,
//     difficultyLevel: difficultyLevel || 'Beginner',
//     language: language || 'English',
//     topics,
//     totalDuration: totalDuration || 0,
//     numberOfLectures: numberOfLectures || 0,
//     category: category || '',
//     tags,
//     requirements,
//     whatYouWillLearn,
//     saleEnabled: sale,
//     salePrice: salePrice || 0,
//   });

//   // 1) Upload main course image, if any
//   if (req.files?.image?.[0]) {
//     const imgFile = req.files.image[0];
//     const imgRes = await uploadToCloudinary(imgFile.buffer, {
//       folder: 'course_images',
//       resource_type: 'image',
//     });
//     course.image.public_id = imgRes.public_id;
//     course.image.url = imgRes.secure_url;
//   }

//   // 2) If featured, upload shortVideo, if any
//   if (featured && req.files?.shortVideo?.[0]) {
//     const shortFile = req.files.shortVideo[0];
//     const vidRes = await uploadToCloudinary(shortFile.buffer, {
//       folder: 'course_short_videos',
//       resource_type: 'video',
//     });
//     course.shortVideoLink.public_id = vidRes.public_id;
//     course.shortVideoLink.url = vidRes.secure_url;
//   }

//   // Save so we have an _id for the relationship
//   course = await course.save();

//   // 3) Parse 'videosData' from JSON
//   let parsedVideos = [];
//   try {
//     parsedVideos = JSON.parse(videosData || '[]'); // array of { title, description, ... }
//   } catch (err) {
//     parsedVideos = [];
//   }

//   const createdVideos = [];
//   // Each video object can have an actual video file and a cover image
//   for (let i = 0; i < parsedVideos.length; i++) {
//     const vData = parsedVideos[i];

//     let newVid = new Video({
//       title: vData.title || 'Untitled Video',
//       description: vData.description || '',
//       duration: vData.duration || 0,
//       priority: vData.priority || 0,
//       course: course._id,
//     });

//     // If user uploaded a video file at index i
//     if (req.files?.videos?.[i]) {
//       const videoFile = req.files.videos[i];
//       const uploadRes = await uploadToCloudinary(videoFile.buffer, {
//         folder: 'course_videos',
//         resource_type: 'video',
//       });
//       newVid.videoFile.public_id = uploadRes.public_id;
//       newVid.videoFile.url = uploadRes.secure_url;
//     }

//     // If user uploaded a cover image at index i
//     if (req.files?.covers?.[i]) {
//       const coverFile = req.files.covers[i];
//       const coverRes = await uploadToCloudinary(coverFile.buffer, {
//         folder: 'course_video_covers',
//         resource_type: 'image',
//       });
//       newVid.coverImage.public_id = coverRes.public_id;
//       newVid.coverImage.url = coverRes.secure_url;
//     }

//     newVid = await newVid.save();
//     createdVideos.push(newVid);
//   }

//   // Sort videos by priority
//   createdVideos.sort((a, b) => a.priority - b.priority);

//   // Link them to the course
//   course.videos = createdVideos.map((v) => v._id);
//   await course.save();

//   // Return the new course with videos
//   const populated = await Course.findById(course._id).populate('videos');
//   res.status(201).json(populated);
// });

// /**
//  * @desc Create a new featured course
//  * @route POST /api/courses/featured
//  * @access Private/Admin
//  */
// exports.createFeaturedCourse = asyncHandler(async (req, res) => {
//   // You can replicate the same logic as createCourse, forcing isFeatured to true.
//   // For brevity, you can just reuse createCourse or do a custom approach here.
//   res.status(501).json({ message: 'createFeaturedCourse not implemented. Please replicate create logic with forced isFeatured = true.' });
// });

// /**
//  * @desc Get all courses with pagination & selective projection
//  * @route GET /api/courses
//  * @access Private
//  */
// exports.getCourses = asyncHandler(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   const courses = await Course.find({})
//     .populate('videos')
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   // Optionally, get the first video if you want
//   const formatted = courses.map((course) => ({
//     ...course,
//     firstVideoUrl: course.videos?.[0]?.videoFile?.url || null,
//   }));

//   res.json(formatted);
// });

// /**
//  * @desc   Get featured reels
//  * @route  GET /api/courses/featuredreels
//  * @access Private
//  */
// exports.getFeaturedReels = asyncHandler(async (req, res) => {
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 5;
//   const skip = (page - 1) * limit;

//   const reels = await Course.find({ isFeatured: true })
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   res.json(reels);
// });

// /**
//  * @desc   Quick search for courses by title/description
//  * @route  GET /api/courses/search?query=...
//  * @access Private
//  */
// exports.searchCourses = asyncHandler(async (req, res) => {
//   const { query = '' } = req.query;
//   if (!query.trim()) {
//     return res.json([]);
//   }
//   const filter = {
//     $or: [
//       { title: { $regex: query, $options: 'i' } },
//       { description: { $regex: query, $options: 'i' } },
//     ],
//   };
//   const suggestions = await Course.find(filter).limit(20).lean();
//   res.json(suggestions);
// });

// /**
//  * @desc    Get a course by ID
//  * @route   GET /api/courses/:id
//  * @access  Private
//  */
// exports.getCourseById = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id).populate('videos');
//   if (!course) {
//     res.status(404);
//     throw new Error('Course not found');
//   }
//   res.json(course);
// });

// /**
//  * @desc  Update a course
//  * @route PUT /api/courses/:id
//  * @access Private/Admin
//  */
// exports.updateCourse = asyncHandler(async (req, res) => {
//   const courseId = req.params.id;
//   let course = await Course.findById(courseId);
//   if (!course) {
//     res.status(404);
//     throw new Error('Course not found');
//   }

//   // We parse textual fields from req.body
//   let {
//     title,
//     description,
//     instructor,
//     price,
//     rating,
//     reviews,
//     isFeatured,
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//     saleEnabled,
//     salePrice,
//     videosData,
//   } = req.body;

//   // Convert
//   const featured = isFeatured === 'true' || isFeatured === true;
//   const sale = saleEnabled === 'true' || saleEnabled === true;
//   topics = topics ? topics.split(',').map((t) => t.trim()).filter(Boolean) : course.topics;
//   tags = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : course.tags;
//   requirements = requirements ? requirements.split(',').map((t) => t.trim()).filter(Boolean) : course.requirements;
//   whatYouWillLearn = whatYouWillLearn ? whatYouWillLearn.split(',').map((t) => t.trim()).filter(Boolean) : course.whatYouWillLearn;

//   // Update textual fields
//   course.title = title ?? course.title;
//   course.description = description ?? course.description;
//   course.instructor = instructor ?? course.instructor;
//   course.price = price ?? course.price;
//   course.rating = rating ?? course.rating;
//   course.reviews = reviews ?? course.reviews;
//   course.isFeatured = featured;
//   course.difficultyLevel = difficultyLevel ?? course.difficultyLevel;
//   course.language = language ?? course.language;
//   course.topics = topics;
//   course.totalDuration = totalDuration ?? course.totalDuration;
//   course.numberOfLectures = numberOfLectures ?? course.numberOfLectures;
//   course.category = category ?? course.category;
//   course.tags = tags;
//   course.requirements = requirements;
//   course.whatYouWillLearn = whatYouWillLearn;
//   course.saleEnabled = sale;
//   course.salePrice = salePrice ?? course.salePrice;

//   // 1) If new course image is uploaded
//   if (req.files?.image?.[0]) {
//     // Remove old from Cloudinary if any
//     if (course.image.public_id) {
//       await cloudinary.uploader.destroy(course.image.public_id, { resource_type: 'image' });
//     }
//     // Upload new
//     const imgFile = req.files.image[0];
//     const imgRes = await uploadToCloudinary(imgFile.buffer, {
//       folder: 'course_images',
//       resource_type: 'image',
//     });
//     course.image.public_id = imgRes.public_id;
//     course.image.url = imgRes.secure_url;
//   }

//   // 2) If newly featured and a shortVideo is uploaded
//   if (featured && req.files?.shortVideo?.[0]) {
//     // Remove old shortVideo if any
//     if (course.shortVideoLink.public_id) {
//       await cloudinary.uploader.destroy(course.shortVideoLink.public_id, { resource_type: 'video' });
//     }
//     const shortFile = req.files.shortVideo[0];
//     const vidRes = await uploadToCloudinary(shortFile.buffer, {
//       folder: 'course_short_videos',
//       resource_type: 'video',
//     });
//     course.shortVideoLink.public_id = vidRes.public_id;
//     course.shortVideoLink.url = vidRes.secure_url;
//   }

//   // Save the partial updates so far
//   await course.save();

//   // 3) If videosData is provided, we assume the user wants to replace existing videos
//   if (videosData !== undefined) {
//     // Remove old videos from DB and Cloudinary
//     if (course.videos && course.videos.length > 0) {
//       const oldVideos = await Video.find({ _id: { $in: course.videos } });
//       for (const oldVid of oldVideos) {
//         // remove video from Cloudinary
//         if (oldVid.videoFile.public_id) {
//           await cloudinary.uploader.destroy(oldVid.videoFile.public_id, { resource_type: 'video' });
//         }
//         // remove cover from Cloudinary
//         if (oldVid.coverImage.public_id) {
//           await cloudinary.uploader.destroy(oldVid.coverImage.public_id, { resource_type: 'image' });
//         }
//       }
//       // remove from DB
//       await Video.deleteMany({ _id: { $in: course.videos } });
//     }

//     // Create new videos
//     let parsedNewVideos = [];
//     try {
//       parsedNewVideos = JSON.parse(videosData);
//     } catch (err) {
//       parsedNewVideos = [];
//     }

//     const newVideos = [];
//     for (let i = 0; i < parsedNewVideos.length; i++) {
//       const vData = parsedNewVideos[i];
//       let newVid = new Video({
//         title: vData.title || 'Untitled Video',
//         description: vData.description || '',
//         duration: vData.duration || 0,
//         priority: vData.priority || 0,
//         course: course._id,
//       });

//       // If user uploaded a video file at index i
//       if (req.files?.videos?.[i]) {
//         const videoFile = req.files.videos[i];
//         const upRes = await uploadToCloudinary(videoFile.buffer, {
//           folder: 'course_videos',
//           resource_type: 'video',
//         });
//         newVid.videoFile.public_id = upRes.public_id;
//         newVid.videoFile.url = upRes.secure_url;
//       }

//       // If user uploaded a cover at index i
//       if (req.files?.covers?.[i]) {
//         const coverFile = req.files.covers[i];
//         const coverRes = await uploadToCloudinary(coverFile.buffer, {
//           folder: 'course_video_covers',
//           resource_type: 'image',
//         });
//         newVid.coverImage.public_id = coverRes.public_id;
//         newVid.coverImage.url = coverRes.secure_url;
//       }

//       newVid = await newVid.save();
//       newVideos.push(newVid);
//     }

//     newVideos.sort((a, b) => a.priority - b.priority);
//     course.videos = newVideos.map((v) => v._id);
//     await course.save();
//   }

//   // Return updated with populated videos
//   const updatedCourse = await Course.findById(course._id).populate('videos');
//   res.json(updatedCourse);
// });

// /**
//  * @desc Delete a course
//  * @route DELETE /api/courses/:id
//  * @access Private/Admin
//  */
// exports.deleteCourse = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (!course) {
//     res.status(404);
//     throw new Error('Course not found.');
//   }

//   // Remove main image from Cloudinary if any
//   if (course.image.public_id) {
//     await cloudinary.uploader.destroy(course.image.public_id, { resource_type: 'image' });
//   }

//   // Remove shortVideo if any
//   if (course.shortVideoLink.public_id) {
//     await cloudinary.uploader.destroy(course.shortVideoLink.public_id, { resource_type: 'video' });
//   }

//   // Remove course videos from DB + Cloudinary
//   if (course.videos && course.videos.length > 0) {
//     const oldVideos = await Video.find({ _id: { $in: course.videos } });
//     for (const v of oldVideos) {
//       if (v.videoFile.public_id) {
//         await cloudinary.uploader.destroy(v.videoFile.public_id, { resource_type: 'video' });
//       }
//       if (v.coverImage.public_id) {
//         await cloudinary.uploader.destroy(v.coverImage.public_id, { resource_type: 'image' });
//       }
//     }
//     await Video.deleteMany({ _id: { $in: course.videos } });
//   }

//   await course.deleteOne();
//   res.json({ message: 'Course removed successfully.' });
// });

// /**
//  * @desc Get all courses for admin (no pagination)
//  * @route GET /api/courses/admin
//  * @access Private
//  */
// exports.getCoursesAdmin = asyncHandler(async (req, res) => {
//   const courses = await Course.find({}).populate('videos');
//   res.json(courses);
// });











// // controllers/courseController.js
// const asyncHandler = require('express-async-handler');
// const Course = require('../models/Course');
// const Video = require('../models/Video');

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
//     videos, // Expect an array of video objects
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
//     saleEnabled,
//     salePrice,
//   } = req.body;

//   // Basic required fields check
//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields: title, description, instructor, price, image.');
//   }

//   // If not featured, clear shortVideoLink
//   const finalShortVideoLink = isFeatured ? shortVideoLink || '' : '';

//   // Create course document without videos for now
//   let course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: isFeatured || false,
//     shortVideoLink: finalShortVideoLink,
//     difficultyLevel: difficultyLevel || 'Beginner',
//     language: language || 'English',
//     topics: topics || [],
//     totalDuration: totalDuration || 0,
//     numberOfLectures: numberOfLectures || 0,
//     category: category || '',
//     tags: tags || [],
//     requirements: requirements || [],
//     whatYouWillLearn: whatYouWillLearn || [],
//     saleEnabled: saleEnabled || false,
//     salePrice: salePrice || 0,
//   });

//   // Save course first to obtain its _id
//   course = await course.save();

//   // If videos are provided, add the course id to each video, insert them, and sort by priority
//   if (videos && Array.isArray(videos) && videos.length > 0) {
//     const videosWithCourse = videos.map(video => ({ ...video, course: course._id }));
//     let createdVideos = await Video.insertMany(videosWithCourse);
//     // Sort the videos by priority (ascending)
//     createdVideos = createdVideos.sort((a, b) => a.priority - b.priority);
//     course.videos = createdVideos.map(video => video._id);
//     await course.save();
//   }

//   // Populate videos before sending response
//   await course.populate('videos');
//   res.status(201).json(course);
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
//     saleEnabled,
//     salePrice,  
//   } = req.body;

//   if (!title || !description || !instructor || !price || !image) {
//     res.status(400);
//     throw new Error('Please provide all required fields: title, description, instructor, price, image.');
//   }

//   let course = new Course({
//     title,
//     description,
//     instructor,
//     price,
//     image,
//     rating: rating || 0,
//     reviews: reviews || 0,
//     isFeatured: true,
//     shortVideoLink: shortVideoLink || '',
//     difficultyLevel: difficultyLevel || 'Beginner',
//     language: language || 'English',
//     topics: topics || [],
//     totalDuration: totalDuration || 0,
//     numberOfLectures: numberOfLectures || 0,
//     category: category || '',
//     tags: tags || [],
//     requirements: requirements || [],
//     whatYouWillLearn: whatYouWillLearn || [],
//     saleEnabled: saleEnabled || false,
//     salePrice: salePrice || 0,
//   });

//   course = await course.save();

//   if (videos && Array.isArray(videos) && videos.length > 0) {
//     const videosWithCourse = videos.map(video => ({ ...video, course: course._id }));
//     let createdVideos = await Video.insertMany(videosWithCourse);
//     createdVideos = createdVideos.sort((a, b) => a.priority - b.priority);
//     course.videos = createdVideos.map(video => video._id);
//     await course.save();
//   }

//   await course.populate('videos');
//   res.status(201).json(course);
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

//   // Populate videos for a complete API response
//   const courses = await Course.find({})
//     .populate('videos')
//     .select(
//       'title description image rating reviews isFeatured videos difficultyLevel language topics totalDuration numberOfLectures category tags requirements whatYouWillLearn saleEnabled salePrice price'
//     )
//     // .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit)
//     .lean();

//   // Optionally, extract the first video URL for convenience
//   const formattedCourses = courses.map((course) => ({
//     ...course,
//     videoUrl: course.videos?.[0]?.url || null,
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

//   // Sorting by creation date (newest first)
//   const reels = await Course.find({ isFeatured: true })
//     .select(
//       'title shortVideoLink image rating reviews difficultyLevel language topics totalDuration numberOfLectures category tags requirements whatYouWillLearn saleEnabled salePrice'
//     )
//     // .sort({ createdAt: -1 })
//     .skip(skip)
//     .limit(limit);

//   res.json(reels);
// });

// // const getFeaturedReels = asyncHandler(async (req, res) => {
// //   const page = Number(req.query.page) || 1;
// //   const limit = Number(req.query.limit) || 5;
// //   const skip = (page - 1) * limit;

// //   const reels = await Course.find({ isFeatured: true })
// //     .select(
// //       'title shortVideoLink image rating reviews difficultyLevel language topics totalDuration numberOfLectures category tags requirements whatYouWillLearn'
// //     )
// //     .skip(skip)
// //     .limit(limit);

// //   res.json(reels);
// // });

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

//   const filter = {
//     $or: [
//       { title: { $regex: query, $options: 'i' } },
//       { description: { $regex: query, $options: 'i' } },
//     ],
//   };

//   const suggestions = await Course.find(filter).select(
//     'title description image rating reviews isFeatured shortVideoLink saleEnabled salePrice'
//   );

//   res.json(suggestions);
// });

// /**
//  * @desc    Get a course by ID
//  * @route   GET /api/courses/:id
//  * @access  Private
//  */
// const getCourseById = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id).populate('videos');
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
//     saleEnabled,
//     salePrice,
//   } = req.body;

//   let course = await Course.findById(req.params.id);
//   if (!course) {
//     res.status(404);
//     throw new Error('Course not found.');
//   }

//   // Update fields if provided; otherwise keep existing values
//   course.title = title ?? course.title;
//   course.description = description ?? course.description;
//   course.instructor = instructor ?? course.instructor;
//   course.price = price ?? course.price;
//   course.image = image ?? course.image;
//   course.rating = rating !== undefined ? rating : course.rating;
//   course.reviews = reviews !== undefined ? reviews : course.reviews;
//   course.isFeatured = isFeatured !== undefined ? isFeatured : course.isFeatured;
//   course.shortVideoLink = course.isFeatured ? shortVideoLink || '' : '';

//   course.difficultyLevel = difficultyLevel ?? course.difficultyLevel;
//   course.language = language ?? course.language;
//   course.topics = topics ?? course.topics;
//   course.totalDuration = totalDuration !== undefined ? totalDuration : course.totalDuration;
//   course.numberOfLectures = numberOfLectures !== undefined ? numberOfLectures : course.numberOfLectures;
//   course.category = category ?? course.category;
//   course.tags = tags ?? course.tags;
//   course.requirements = requirements ?? course.requirements;
//   course.whatYouWillLearn = whatYouWillLearn ?? course.whatYouWillLearn;

//   course.saleEnabled = saleEnabled !== undefined ? saleEnabled : course.saleEnabled;
//   course.salePrice = salePrice !== undefined ? salePrice : course.salePrice;

//   // If videos are provided, replace the current video documents
//   if (videos !== undefined) {
//     // Remove existing videos for this course
//     if (course.videos && course.videos.length > 0) {
//       await Video.deleteMany({ _id: { $in: course.videos } });
//     }
//     // If new videos exist, create them with the course id and sort by priority
//     if (Array.isArray(videos) && videos.length > 0) {
//       const videosWithCourse = videos.map(video => ({ ...video, course: course._id }));
//       let newVideos = await Video.insertMany(videosWithCourse);
//       newVideos = newVideos.sort((a, b) => a.priority - b.priority);
//       course.videos = newVideos.map(video => video._id);
//     } else {
//       course.videos = [];
//     }
//   }

//   course = await course.save();
//   await course.populate('videos');
//   res.json(course);
// });

// /**
//  * @desc    Delete a course
//  * @route   DELETE /api/courses/:id
//  * @access  Private/Admin
//  */
// const deleteCourse = asyncHandler(async (req, res) => {
//   const course = await Course.findById(req.params.id);
//   if (course) {
//     // Delete associated videos first (if any)
//     if (course.videos && course.videos.length > 0) {
//       await Video.deleteMany({ _id: { $in: course.videos } });
//     }
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
//   const courses = await Course.find({}).populate('videos');
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
