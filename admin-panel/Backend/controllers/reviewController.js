const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Course = require('../models/Course');
const User = require('../models/User');

/**
 * @desc    Create a new review for a product or course
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = asyncHandler(async (req, res) => {
  const { reviewableId, reviewableType, rating, comment } = req.body;

  if (!reviewableId || !reviewableType || !rating || !comment) {
    res.status(400);
    throw new Error('Reviewable ID, reviewable type, rating, and comment are required.');
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  // Validate reviewableType and check that the item exists
  let reviewableItem;
  if (reviewableType === 'Product') {
    reviewableItem = await Product.findById(reviewableId);
  } else if (reviewableType === 'Course') {
    reviewableItem = await Course.findById(reviewableId);
  } else {
    res.status(400);
    throw new Error('Invalid reviewable type.');
  }
  if (!reviewableItem) {
    res.status(404);
    throw new Error(`${reviewableType} not found.`);
  }

  // Check if the user has already reviewed this item
  const existingReview = await Review.findOne({
    user: req.user._id,
    reviewable: reviewableId,
    reviewableModel: reviewableType,
  });
  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this item.');
  }

  const review = new Review({
    user: req.user._id,
    reviewable: reviewableId,
    reviewableModel: reviewableType,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  await review.save();
  // Increment the user's review count using your built-in model function
  await user.incrementReviews();
  res.status(201).json(review);
});

/**
 * @desc    Get all reviews (for all items)
 * @route   GET /api/reviews
 * @access  Public
 */
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('user', 'name email')
    .populate('reviewable', 'name'); // Adjust as needed
  res.json(reviews);
});

/**
 * @desc    Get reviews for a specific item (Product or Course)
 * @route   GET /api/reviews/:reviewableType/:reviewableId
 * @access  Public
 */
const getReviewsForItem = asyncHandler(async (req, res) => {
  const { reviewableType, reviewableId } = req.params;
  if (!['Product', 'Course'].includes(reviewableType)) {
    res.status(400);
    throw new Error('Invalid reviewable type.');
  }

  let reviewableItem;
  if (reviewableType === 'Product') {
    reviewableItem = await Product.findById(reviewableId);
  } else {
    reviewableItem = await Course.findById(reviewableId);
  }
  if (!reviewableItem) {
    res.status(404);
    throw new Error(`${reviewableType} not found.`);
  }

  const reviews = await Review.find({
    reviewable: reviewableId,
    reviewableModel: reviewableType,
  })
    .populate('user', 'name email profileImage')
    .populate('reviewable', 'title name'); // For Course, you might use title

  res.json(reviews);
});

/**
 * @desc    Update a review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }

  // Optionally: Check that req.user is owner (or admin)
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this review.');
  }

  if (rating) review.rating = Number(rating);
  if (comment) review.comment = comment;

  await review.save();
  // Post-save hook recalculates ratings
  res.json(review);
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private/Admin (or owner)
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }

  const user = await User.findById(req.user._id);
  // // Check if user is owner or admin
  // if (
  //   review.user.toString() !== req.user._id.toString() &&
  //   req.user.role !== 'admin'
  // ) {
  //   res.status(401);
  //   throw new Error('Not authorized to delete this review.');
  // }

  await review.deleteOne();
  await user.decrementReviews();
  res.json({ message: 'Review deleted successfully.' });
});
/**
 * @desc    Get all reviews by the logged-in user
 * @route   GET /api/reviews/my
 * @access  Private
 */
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate('reviewable', 'title name price image') // or whichever fields you want
    .populate('user', 'name email profileImage'); // yourself for completeness

  res.json({
    success: true,
    data: reviews
  });
});

module.exports = {
  createReview,
  getAllReviews,
  getReviewsForItem,
  updateReview,
  deleteReview,
  getMyReviews
};














// // controllers/reviewController.js

// const asyncHandler = require('express-async-handler');
// const Review = require('../models/Review');
// const Product = require('../models/Product');

// /**
//  * @desc    Create a new review
//  * @route   POST /api/reviews
//  * @access  Private
//  */
// const createReview = asyncHandler(async (req, res) => {
//   const { productId, rating, comment } = req.body;
//   console.log(productId, rating, comment);

//   // Validate required fields
//   if (!productId || !rating || !comment) {
//     res.status(400);
//     throw new Error('Product ID, rating, and comment are required.');
//   }

//   // Check if product exists
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found.');
//   }

//   // Check if the user has already reviewed this product
//   const existingReview = await Review.findOne({
//     user: req.user._id,
//     product: productId,
//   });

//   if (existingReview) {
//     res.status(400);
//     throw new Error('You have already reviewed this product.');
//   }

//   // Create a new review
//   const review = new Review({
//     user: req.user._id,
//     product: productId,
//     name: req.user.name,
//     rating: Number(rating),
//     comment,
//   });
//   if (review) {
//     // Increment the user's reviewsCount
//     await req.user.incrementReviews();
//   }
//   await review.save();

//   // Recalculate product ratings and number of reviews
//   await Product.calculateRatings(productId);

//   res.status(201).json(review);
// });

// /**
//  * @desc    Get all reviews
//  * @route   GET /api/reviews
//  * @access  Public
//  */
// const getAllReviews = asyncHandler(async (req, res) => {
//   const reviews = await Review.find()
//     .populate('user', 'name email')
//     .populate('product', 'name');

//   res.json(reviews);
// });

// /**
//  * @desc    Get reviews for a specific product
//  * @route   GET /api/reviews/product/:productId
//  * @access  Public
//  */
// const getProductReviews = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   console.log(productId);

//   // Check if product exists
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found.');
//   }

//   const reviews = await Review.find({ product: productId })
//     .populate('user', 'name email profileImage')
//     .populate('product', 'name');

//   res.json(reviews);
// });

// /**
//  * @desc    Update a review
//  * @route   PUT /api/reviews/:id
//  * @access  Private
//  */
// const updateReview = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { rating, comment } = req.body;

//   // Find the review
//   const review = await Review.findById(id);

//   if (!review) {
//     res.status(404);
//     throw new Error('Review not found.');
//   }

//   // Check if the user is the owner of the review
//   // if (review.user.toString() !== req.user._id.toString()) {
//   //   res.status(401);
//   //   throw new Error('Not authorized to update this review.');
//   // }

//   // Update the review fields
//   if (rating) review.rating = Number(rating);
//   if (comment) review.comment = comment;

//   await review.save();

//   // Recalculate product ratings and number of reviews
//   await Product.calculateRatings(review.product);

//   res.json(review);
// });

// /**
//  * @desc    Delete a review
//  * @route   DELETE /api/reviews/:id
//  * @access  Private/Admin
//  */
// // const deleteReview = asyncHandler(async (req, res) => {
// //   const { id } = req.params;

// //   // Find the review
// //   const review = await Review.findById(id);

// //   if (!review) {
// //     res.status(404);
// //     throw new Error('Review not found.');
// //   }

// //   // Check if the user is the owner of the review or an admin
// //   if (
// //     review.user.toString() !== req.user._id.toString() &&
// //     req.user.role !== 'admin'
// //   ) {
// //     res.status(401);
// //     throw new Error('Not authorized to delete this review.');
// //   }

// //   const productId = review.product;

// //   // Delete the review
// //   await review.deleteOne();
// //   // Decrement the user's reviewsCount
// //   await review.user.decrementReviews();

// //   // Recalculate product ratings and number of reviews
// //   await Product.calculateRatings(productId);

// //   res.json({ message: 'Review deleted successfully.' });
// // });
// const deleteReview = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const review = await Review.findById(id);
//   if (!review) {
//     res.status(404);
//     throw new Error('Review not found.');
//   }
//   // Check if the user is the owner of the review or an admin
//   if (
//     review.user.toString() !== req.user._id.toString() &&
//     req.user.role !== 'admin'
//   ) {
//     res.status(401);
//     throw new Error('Not authorized to delete this review.');
//   }

//   const productId = review.product;
//   // Use deleteOne() on the document so middleware is triggered
//   await review.deleteOne();

//   // Since review.user is stored as an ObjectId, retrieve the user document
//   const reviewUser = await User.findById(review.user);
//   if (reviewUser) {
//     await reviewUser.decrementReviews();
//   }

//   // Recalculate product ratings and number of reviews
//   await Product.calculateRatings(productId);
//   res.json({ message: 'Review deleted successfully.' });
// });
// module.exports = {
//   createReview,
//   getAllReviews,
//   getProductReviews,
//   updateReview,
//   deleteReview,
// };





















// // controllers/reviewController.js

// const asyncHandler = require('express-async-handler');
// const Review = require('../models/Review');
// const Product = require('../models/Product');
// const User = require('../models/User');

// /**
//  * @desc    Create a new review
//  * @route   POST /api/reviews
//  * @access  Private
//  */
// const createReview = asyncHandler(async (req, res) => {
//   const { productId, rating, comment } = req.body;
//   console.log(productId, rating, comment);
  
//   // Validate required fields
//   if (!productId || !rating || !comment) {
//     res.status(400);
//     throw new Error('Product ID, rating, and comment are required.');
//   }

//   // Check if product exists
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found.');
//   }

//   // Check if the user has already reviewed this product
//   const existingReview = await Review.findOne({
//     user: req.user._id,
//     product: productId,
//   });

//   if (existingReview) {
//     res.status(400);
//     throw new Error('You have already reviewed this product.');
//   }

//   // Create a new review
//   const review = new Review({
//     user: req.user._id,
//     product: productId,
//     name: req.user.name,
//     rating: Number(rating),
//     comment,
//   });

//   await review.save();
//   // Recalculate product ratings and number of reviews
//   await Product.calculateRatings(productId);

//   res.status(201).json(review);
// });

// /**
//  * @desc    Get all reviews
//  * @route   GET /api/reviews
//  * @access  Public
//  */
// const getAllReviews = asyncHandler(async (req, res) => {
//   const reviews = await Review.find()
//     .populate('user', 'name email')
//     .populate('product', 'name');

//   res.json(reviews);
// });

// /**
//  * @desc    Get reviews for a specific product
//  * @route   GET /api/reviews/product/:productId
//  * @access  Public
//  */
// const getProductReviews = asyncHandler(async (req, res) => {
//   const { productId } = req.params;
//   console.log(productId);
  

//   // Check if product exists
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found.');
//   }

//   const reviews = await Review.find({ product: productId })
//     .populate('user', 'name email')
//     .populate('product', 'name');

//   res.json(reviews);
// });

// /**
//  * @desc    Update a review
//  * @route   PUT /api/reviews/:id
//  * @access  Private
//  */
// const updateReview = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { rating, comment } = req.body;

//   // Find the review
//   const review = await Review.findById(id);

//   if (!review) {
//     res.status(404);
//     throw new Error('Review not found.');
//   }

//   // Check if the user is the owner of the review
//   if (review.user.toString() !== req.user._id.toString()) {
//     res.status(401);
//     throw new Error('Not authorized to update this review.');
//   }

//   // Update the review fields
//   if (rating) review.rating = Number(rating);
//   if (comment) review.comment = comment;

//   await review.save();

//   res.json(review);
// });

// /**
//  * @desc    Delete a review
//  * @route   DELETE /api/reviews/:id
//  * @access  Private
//  */
// const deleteReview = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   // Check if the user is the owner of the review
//   // if (review.user.toString() !== req.user._id.toString()) {
//   //   res.status(401);
//   //   throw new Error('Not authorized to delete this review.');
//   // }
//   // Find the review
//   const review = await Review.findByIdAndDelete(id);

//   res.json({ message: 'Review deleted successfully.' });
// });

// module.exports = {
//   createReview,
//   getAllReviews,
//   getProductReviews,
//   updateReview,
//   deleteReview,
// };












