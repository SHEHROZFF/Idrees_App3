const mongoose = require('mongoose');

const adSchema = mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    description: { type: String },
    link: { type: String },
    category: { type: String, required: true },
    // Template for design selection
    templateId: {
      type: String,
      required: true,
      enum: ['promo', 'newCourse', 'sale', 'event'],
      default: 'newCourse',
    },
    price: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    targetAudience: { type: String },
    ctaText: { type: String },
    priority: { type: Number, default: 0 },
    cardDesign: { type: String, default: 'basic' },
    // Additional fields for specific templates
    promoCode: { type: String },             // For promo ads
    limitedOffer: { type: Boolean },           // For promo ads
    instructor: { type: String },              // For newCourse ads
    courseInfo: { type: String },              // For newCourse ads
    rating: { type: Number },                  // For newCourse ads
    originalPrice: { type: Number },           // For sale ads
    salePrice: { type: Number },               // For sale ads
    discountPercentage: { type: Number },      // For sale ads
    saleEnds: { type: Date },                  // For sale ads
    eventDate: { type: Date },                 // For event ads
    eventLocation: { type: String },           // For event ads
    // Optional custom style overrides
    customStyles: { type: Object },

    // Add more fields as needed
    adProdtype: {
      type: String,
      // required: true,
      enum: ['Product', 'Course'],
      default: 'Product',
    },
    adProdId: {
      type: String,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ad', adSchema);








// // models/Ad.js
// const mongoose = require('mongoose');

// const adSchema = mongoose.Schema(
//   {
//     image: { type: String, required: true },
//     title: { type: String, required: true },
//     subtitle: { type: String, required: true },
//     description: { type: String },
//     link: { type: String },
//     category: { type: String, required: true },
//     // Template for design selection
//     templateId: {
//       type: String,
//       required: true,
//       enum: ['promo', 'newCourse', 'sale', 'event'],
//       default: 'newCourse',
//     },
//     price: { type: Number },
//     startDate: { type: Date },
//     endDate: { type: Date },
//     targetAudience: { type: String },
//     ctaText: { type: String },
//     priority: { type: Number, default: 0 },
//     cardDesign: { type: String, default: 'basic' },
//     backgroundColor: { type: String },
//     textColor: { type: String },
//     // Additional fields for specific templates
//     promoCode: { type: String },             // For promo ads
//     limitedOffer: { type: Boolean },           // For promo ads
//     instructor: { type: String },              // For newCourse ads
//     courseInfo: { type: String },              // For newCourse ads
//     rating: { type: Number },                  // For newCourse ads
//     originalPrice: { type: Number },           // For sale ads
//     salePrice: { type: Number },               // For sale ads
//     discountPercentage: { type: Number },      // For sale ads
//     saleEnds: { type: Date },                  // For sale ads
//     eventDate: { type: Date },                 // For event ads
//     eventLocation: { type: String },           // For event ads
//     // Optional custom style overrides
//     customStyles: { type: Object },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Ad', adSchema);






// // models/Ad.js
// const mongoose = require('mongoose');

// const adSchema = mongoose.Schema(
//   {
//     image: { type: String, required: true },
//     title: { type: String, required: true },
//     subtitle: { type: String, required: true },
//     description: { type: String },
//     link: { type: String },
//     category: { type: String, required: true },
//     // New field for design templates:
//     templateId: {
//       type: String,
//       required: true,
//       enum: ['promo', 'newCourse', 'sale', 'event'],
//       default: 'newCourse',
//     },
//     price: { type: Number },
//     startDate: { type: Date },
//     endDate: { type: Date },
//     targetAudience: { type: String },
//     ctaText: { type: String },
//     priority: { type: Number, default: 0 },
//     cardDesign: { type: String, default: 'basic' },
//     backgroundColor: { type: String },
//     textColor: { type: String },
//     // Optional custom style overrides
//     customStyles: { type: Object },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model('Ad', adSchema);









// const mongoose = require('mongoose');

// const adSchema = mongoose.Schema(
//   {
//     image: {
//       type: String,
//       required: [true, 'Please add an ad image URL.'],
//       match: [
//         /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i,
//         'Please enter a valid image URL.',
//       ],
//     },
//     title: {
//       type: String,
//       required: [true, 'Please add a title for the ad.'],
//     },
//     subtitle: {
//       type: String,
//       required: [true, 'Please add a subtitle for the ad.'],
//     },
//     description: {
//       type: String,
//       required: [true, 'Please add a description for the ad.'],
//       maxlength: [500, 'Description cannot exceed 500 characters.'],
//     },
//     link: {
//       type: String,
//       required: [true, 'Please add a link to the ad.'],
//       match: [
//         /^(https?:\/\/[^\s$.?#].[^\s]*)$/,
//         'Please enter a valid URL.',
//       ],
//     },
//     category: {
//       type: String,
//       enum: ['New Course', 'Product', 'Sale', 'Promotion', 'Event'],
//       required: [true, 'Please specify the ad category.'],
//     },
//     price: {
//       type: Number,
//       required: false,
//     },
//     startDate: {
//       type: Date,
//       required: true,
//     },
//     endDate: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ['Active', 'Paused', 'Expired'],
//       default: 'Active',
//     },
//     targetAudience: {
//       type: String,
//       enum: ['Beginner', 'Intermediate', 'Advanced', 'General'],
//       required: false,
//     },
//     ctaText: {
//       type: String,
//       default: 'Learn More',
//     },
//     priority: {
//       type: Number,
//       default: 1,
//     },
//     // New field for card design
//     cardDesign: {
//       type: String,
//       enum: ['basic', 'modern', 'minimal', 'detailed'], // add as many as you want
//       default: 'basic',
//     },
//     // Optional design properties
//     backgroundColor: {
//       type: String,
//       default: '#ffffff',
//     },
//     textColor: {
//       type: String,
//       default: '#000000',
//     },
//   },
//   { timestamps: true }
// );

// const Ad = mongoose.model('Ad', adSchema);
// module.exports = Ad;







// const mongoose = require('mongoose');

// const adSchema = mongoose.Schema(
//   {
//     image: {
//       type: String,
//       required: [true, 'Please add an ad image URL.'],
//       match: [
//         /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i,
//         'Please enter a valid image URL.',
//       ],
//     },
//     title: {
//       type: String,
//       required: [true, 'Please add a title for the ad.'],
//     },
//     subtitle: {
//       type: String,
//       required: [true, 'Please add a subtitle for the ad.'],
//     },
//   },
//   { timestamps: true }
// );

// const Ad = mongoose.model('Ad', adSchema);
// module.exports = Ad;



// const mongoose = require('mongoose');

// const adSchema = mongoose.Schema(
//   {
//     image: {
//       type: String,
//       required: [true, 'Please add an ad image URL.'],
//       match: [
//         /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i,
//         'Please enter a valid image URL.',
//       ],
//     },
//     title: {
//       type: String,
//       required: [true, 'Please add a title for the ad.'],
//     },
//     subtitle: {
//       type: String,
//       required: [true, 'Please add a subtitle for the ad.'],
//     },
//     description: {
//       type: String,
//       required: [true, 'Please add a description for the ad.'],
//       maxlength: [500, 'Description cannot exceed 500 characters.'],
//     },
//     link: {
//       type: String,
//       required: [true, 'Please add a link to the ad.'],
//       match: [/^(https?:\/\/[^\s$.?#].[^\s]*)$/, 'Please enter a valid URL.'],
//     },
//     category: {
//       type: String,
//       enum: ['New Course', 'Product', 'Sale', 'Promotion', 'Event'],
//       required: [true, 'Please specify the ad category.'],
//     },
//     price: {
//       type: Number,
//       required: false, // Only for product ads
//     },
//     startDate: {
//       type: Date,
//       required: true,
//     },
//     endDate: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ['Active', 'Paused', 'Expired'],
//       default: 'Active',
//     },
//     targetAudience: {
//       type: String,
//       enum: ['Beginner', 'Intermediate', 'Advanced', 'General'],
//       required: false, // Optional, depending on the ad content
//     },
//     ctaText: {
//       type: String,
//       default: 'Learn More',
//     },
//     priority: {
//       type: Number,
//       default: 1, // Ads with lower priority numbers will be displayed first
//     },
//   },
//   { timestamps: true }
// );

// const Ad = mongoose.model('Ad', adSchema);
// module.exports = Ad;
