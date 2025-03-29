// models/Course.js
const mongoose = require('mongoose');

const courseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title.'],
    },
    description: {
      type: String,
      required: [true, 'Please add a course description.'],
    },
    instructor: {
      type: String,
      required: [true, 'Please add an instructor name.'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price.'],
      min: [0, 'Price must be a positive number.'],
    },
    image: {
      type: String,
      required: [true, 'Please add an image URL.'],
      match: [
        /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i,
        'Please enter a valid image URL.',
      ],
    },
    videos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    shortVideoLink: {
      type: String,
      default: '',
      match: [
        /^(https?:\/\/.*\.(?:mp4|webm|ogg))$/i,
        'Please enter a valid video URL.',
      ],
    },
    difficultyLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    language: {
      type: String,
      default: 'English',
    },
    topics: {
      type: [String],
      default: [],
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
    numberOfLectures: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },
    requirements: {
      type: [String],
      default: [],
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    saleEnabled: {
      type: Boolean,
      required: true,
      default: false,
    },
    salePrice: {
      type: Number,
      required: false,
      min: [0, 'Sale price must be a positive number.'],
    },
  },
  { timestamps: true }
);

// Pre deleteOne hook to cascade deletion of reviews (if needed)
courseSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  console.log(`Cascade delete: Removing reviews for course ${this._id}`);
  await this.model('Review').deleteMany({
    reviewable: this._id,
    reviewableModel: 'Course',
  });
  next();
});

// Static method to calculate aggregated ratings remains the same
courseSchema.statics.calculateRatings = async function (courseId) {
  const Review = mongoose.model('Review');
  const courseObjectId = new mongoose.Types.ObjectId(courseId);

  console.log('Calculating ratings for course:', courseId);

  const result = await Review.aggregate([
    {
      $match: {
        reviewable: courseObjectId,
        reviewableModel: 'Course',
      },
    },
    {
      $group: {
        _id: '$reviewable',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  console.log('Aggregation result for course:', result);

  if (result.length > 0) {
    await this.findByIdAndUpdate(courseId, {
      rating: result[0].averageRating,
      reviews: result[0].totalReviews,
    });
  } else {
    await this.findByIdAndUpdate(courseId, {
      rating: 0,
      reviews: 0,
    });
  }
};

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;













// // models/Course.js
// const mongoose = require('mongoose');

// // Video Schema – each video now gets its own _id
// const videoSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Please add a video title.'],
//   },
//   url: {
//     type: String,
//     required: [true, 'Please add a video URL.'],
//     match: [
//       /^(https?:\/\/.*\.(?:mp4|webm|ogg))$/i,
//       'Please enter a valid video URL.',
//     ],
//   },
//   coverImage: {
//     type: String,
//     default: '',
//     match: [
//       /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i,
//       'Please enter a valid image URL.',
//     ],
//   },
//   description: {
//     type: String,
//     default: '',
//   },
//   duration: {
//     type: Number, // duration in seconds or minutes
//     default: 0,
//   },
//   priority: {
//     type: Number,
//     default: 0, // lower number => higher priority
//   },
// });
// // Note: We are no longer using { _id: false } so each video will have its own _id

// const courseSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: [true, 'Please add a course title.'],
//     },
//     description: {
//       type: String,
//       required: [true, 'Please add a course description.'],
//     },
//     instructor: {
//       type: String,
//       required: [true, 'Please add an instructor name.'],
//     },
//     price: {
//       type: Number,
//       required: [true, 'Please add a price.'],
//       min: [0, 'Price must be a positive number.'],
//     },
//     image: {
//       type: String,
//       required: [true, 'Please add an image URL.'],
//       match: [
//         /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i,
//         'Please enter a valid image URL.',
//       ],
//     },
//     videos: {
//       type: [videoSchema],
//       default: [],
//     },
//     rating: {
//       type: Number,
//       default: 0,
//     },
//     reviews: {
//       type: Number,
//       default: 0,
//     },
//     isFeatured: {
//       type: Boolean,
//       default: false,
//     },
//     shortVideoLink: {
//       type: String,
//       default: '',
//       match: [
//         /^(https?:\/\/.*\.(?:mp4|webm|ogg))$/i,
//         'Please enter a valid video URL.',
//       ],
//     },
//     // ---- Additional Detailed Fields ----
//     difficultyLevel: {
//       type: String,
//       enum: ['Beginner', 'Intermediate', 'Advanced'],
//       default: 'Beginner',
//     },
//     language: {
//       type: String,
//       default: 'English',
//     },
//     topics: {
//       type: [String],
//       default: [],
//     },
//     totalDuration: {
//       type: Number,
//       default: 0,
//     },
//     numberOfLectures: {
//       type: Number,
//       default: 0,
//     },
//     category: {
//       type: String,
//       default: '',
//     },
//     tags: {
//       type: [String],
//       default: [],
//     },
//     requirements: {
//       type: [String],
//       default: [],
//     },
//     whatYouWillLearn: {
//       type: [String],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// // Pre-save hook: sort videos by priority
// courseSchema.pre('save', function (next) {
//   if (this.videos && this.videos.length > 0) {
//     this.videos.sort((a, b) => a.priority - b.priority);
//   }
//   next();
// });

// // Pre deleteOne middleware to cascade deletion of reviews
// courseSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
//   console.log(`Cascade delete: Removing reviews for course ${this._id}`);
//   await this.model('Review').deleteMany({
//     reviewable: this._id,
//     reviewableModel: 'Course',
//   });
//   next();
// });

// // Static method to calculate aggregated rating and review count
// courseSchema.statics.calculateRatings = async function (courseId) {
//   const Review = mongoose.model('Review');
//   const courseObjectId = new mongoose.Types.ObjectId(courseId);

//   console.log('Calculating ratings for course:', courseId);

//   const result = await Review.aggregate([
//     {
//       $match: {
//         reviewable: courseObjectId,
//         reviewableModel: 'Course',
//       },
//     },
//     {
//       $group: {
//         _id: '$reviewable',
//         averageRating: { $avg: '$rating' },
//         totalReviews: { $sum: 1 },
//       },
//     },
//   ]);

//   console.log('Aggregation result for course:', result);

//   if (result.length > 0) {
//     await this.findByIdAndUpdate(courseId, {
//       rating: result[0].averageRating,
//       reviews: result[0].totalReviews,
//     });
//   } else {
//     await this.findByIdAndUpdate(courseId, {
//       rating: 0,
//       reviews: 0,
//     });
//   }
// };

// const Course = mongoose.model('Course', courseSchema);
// module.exports = Course;
