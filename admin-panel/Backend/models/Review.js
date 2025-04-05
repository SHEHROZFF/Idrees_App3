const mongoose = require('mongoose');
const Product = require('./Product');
const Course = require('./Course'); // Make sure this file exists

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Instead of a fixed "product" field, we use a dynamic reference:
    reviewable: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'reviewableModel',
    },
    reviewableModel: {
      type: String,
      required: true,
      enum: ['Product', 'Course'],
    },
    name: {
      type: String,
      required: [true, 'Please add your name.'],
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5.'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment.'],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only leave one review per item (product or course)
reviewSchema.index({ user: 1, reviewable: 1, reviewableModel: 1 }, { unique: true });

// After saving a review, recalculate ratings for the reviewed item
reviewSchema.post('save', async function () {
  if (this.reviewableModel === 'Product') {
    await Product.calculateRatings(this.reviewable);
  } else if (this.reviewableModel === 'Course') {
    await Course.calculateRatings(this.reviewable);
  }
});

// After deleting a review, recalculate ratings for the reviewed item
reviewSchema.post(
  'deleteOne',
  { document: true, query: false },
  async function () {
    if (this.reviewableModel === 'Product') {
      await Product.calculateRatings(this.reviewable);
    } else if (this.reviewableModel === 'Course') {
      await Course.calculateRatings(this.reviewable);
    }
  }
);

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;

















// // models/Review.js
// const mongoose = require('mongoose');
// const Product = require('./Product');

// const reviewSchema = mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: true,
//     },
//     name: {
//       type: String,
//       required: [true, 'Please add your name.'],
//     },
//     rating: {
//       type: Number,
//       required: [true, 'Please add a rating between 1 and 5.'],
//       min: [1, 'Rating must be at least 1'],
//       max: [5, 'Rating cannot exceed 5'],
//     },
//     comment: {
//       type: String,
//       required: [true, 'Please add a comment.'],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Ensure a user can only leave one review per product
// reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// // Post 'save' middleware to recalculate product ratings after a review is saved
// reviewSchema.post('save', async function () {
//   await Product.calculateRatings(this.product);
// });

// // Use deleteOne middleware (for document deletion) instead of remove
// reviewSchema.post(
//   'deleteOne',
//   { document: true, query: false },
//   async function () {
//     await Product.calculateRatings(this.product);
//   }
// );

// const Review = mongoose.model('Review', reviewSchema);
// module.exports = Review;















// // models/Review.js

// const mongoose = require('mongoose');
// const Product = require('./Product');

// // Define the Review Schema
// const reviewSchema = mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: true,
//     },
//     name: {
//       type: String,
//       required: [true, 'Please add your name.'],
//     },
//     rating: {
//       type: Number,
//       required: [true, 'Please add a rating between 1 and 5.'],
//       min: [1, 'Rating must be at least 1'],
//       max: [5, 'Rating cannot exceed 5'],
//     },
//     comment: {
//       type: String,
//       required: [true, 'Please add a comment.'],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Ensure a user can only leave one review per product
// reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// // Post 'save' middleware to recalculate product ratings after a review is saved
// reviewSchema.post('save', async function () {
//   await Product.calculateRatings(this.product);
// });

// // Post 'remove' middleware to recalculate product ratings after a review is removed
// reviewSchema.post('remove', async function () {
//   await Product.calculateRatings(this.product);
// });

// const Review = mongoose.model('Review', reviewSchema);

// module.exports = Review;
















// // models/Review.js

// const mongoose = require('mongoose');

// // Define the Review Schema
// const reviewSchema = mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     product: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Product',
//       required: true,
//     },
//     name: {
//       type: String,
//       required: [true, 'Please add your name.'],
//     },
//     rating: {
//       type: Number,
//       required: [true, 'Please add a rating between 1 and 5.'],
//       min: [1, 'Rating must be at least 1'],
//       max: [5, 'Rating cannot exceed 5'],
//     },
//     comment: {
//       type: String,
//       required: [true, 'Please add a comment.'],
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Ensure a user can only leave one review per product
// reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// const Review = mongoose.model('Review', reviewSchema);

// module.exports = Review;
