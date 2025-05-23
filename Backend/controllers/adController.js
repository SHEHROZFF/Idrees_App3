// controllers/adController.js

const asyncHandler = require('express-async-handler');
const { Readable } = require('stream');
const Ad = require('../models/Ad');
const cloudinary = require('../config/cloudinary');

/**
 * Helper to wrap Cloudinary's upload_stream in a Promise
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) {
        console.error('Cloudinary Upload Error:', err);
        return reject(new Error('Failed to upload file to Cloudinary'));
      }
      resolve(result);
    });
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

// @desc    Create new Ad
// @route   POST /api/ads
// @access  Private/Admin
exports.createAd = asyncHandler(async (req, res) => {
  // Parse text fields from req.body
  let {
    title,
    subtitle,
    description,
    link,
    category,
    templateId,
    price,
    startDate,
    endDate,
    targetAudience,
    ctaText,
    priority,
    cardDesign,
    promoCode,
    limitedOffer,
    instructor,
    courseInfo,
    rating,
    originalPrice,
    salePrice,
    discountPercentage,
    saleEnds,
    eventDate,
    eventLocation,
    customStyles,
    adProdtype,
    adProdId,
  } = req.body;

  // Basic validation
  if (!title || !subtitle) {
    res.status(400);
    throw new Error('title and subtitle are required');
  }

  // Start building the Ad document
  let adData = {
    title,
    subtitle,
    description,
    link,
    category,
    templateId: templateId || 'newCourse',
    price,
    startDate,
    endDate,
    targetAudience,
    ctaText,
    priority: priority || 0,
    cardDesign: cardDesign || 'basic',
    promoCode,
    limitedOffer,
    instructor,
    courseInfo,
    rating,
    originalPrice,
    salePrice,
    discountPercentage,
    saleEnds,
    eventDate,
    eventLocation,
    customStyles,
    adProdtype: adProdtype || 'Product',
    adProdId: adProdId || '',
  };

  // If user uploaded an image file
  if (req.files?.image?.[0]) {
    const fileBuffer = req.files.image[0].buffer;
    const result = await uploadToCloudinary(fileBuffer, {
      folder: 'ads_images',
      resource_type: 'image',
    });
    adData.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  } else {
    res.status(400);
    throw new Error('Ad image file is required');
  }

  const newAd = await Ad.create(adData);
  res.status(201).json(newAd);
});

// @desc    Get all Ads
// @route   GET /api/ads
// @access  Public
exports.getAds = asyncHandler(async (req, res) => {
  const ads = await Ad.find({});
  // Return consistent format
  res.json(ads);
});

// @desc    Get Ad by ID
// @route   GET /api/ads/:id
// @access  Public
exports.getAdById = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }
  res.json(ad);
});

// @desc    Update Ad
// @route   PUT /api/ads/:id
// @access  Private/Admin
exports.updateAd = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }
  

  // Extract text fields
  let {
    title,
    subtitle,
    description,
    link,
    category,
    templateId,
    price,
    startDate,
    endDate,
    targetAudience,
    ctaText,
    priority,
    cardDesign,
    promoCode,
    limitedOffer,
    instructor,
    courseInfo,
    rating,
    originalPrice,
    salePrice,
    discountPercentage,
    saleEnds,
    eventDate,
    eventLocation,
    customStyles,
    adProdtype,
    adProdId,
  } = req.body;



  console.log(req.body);
  

  // Update fields if present
  ad.title = title || ad.title;
  ad.subtitle = subtitle || ad.subtitle;
  ad.description = description || ad.description;
  ad.link = link || ad.link;
  ad.category = category || ad.category;
  ad.templateId = templateId || ad.templateId;
  ad.price = price || ad.price;
  ad.startDate = startDate || ad.startDate;
  ad.endDate = endDate || ad.endDate;
  ad.targetAudience = targetAudience || ad.targetAudience;
  ad.ctaText = ctaText || ad.ctaText;
  ad.priority = priority || ad.priority;
  ad.cardDesign = cardDesign || ad.cardDesign;

  ad.promoCode = promoCode || ad.promoCode;
  ad.limitedOffer = limitedOffer || ad.limitedOffer;
  ad.instructor = instructor || ad.instructor;
  ad.courseInfo = courseInfo || ad.courseInfo;
  ad.rating = rating || ad.rating;
  ad.originalPrice = originalPrice || ad.originalPrice;
  ad.salePrice = salePrice || ad.salePrice;
  ad.discountPercentage = discountPercentage || ad.discountPercentage;
  ad.saleEnds = saleEnds || ad.saleEnds;
  ad.eventDate = eventDate || ad.eventDate;
  ad.eventLocation = eventLocation || ad.eventLocation;

  ad.adProdtype = adProdtype || ad.adProdtype;
  ad.adProdId = adProdId || ad.adProdId;
  ad.customStyles = customStyles || ad.customStyles;
  console.log(req.files);
  
  // If new image is uploaded, remove old from Cloudinary & upload new
  if (req.files?.image?.[0]) {
    // Remove old image from Cloudinary if it exists
    if (ad.image?.public_id) {
      await cloudinary.uploader.destroy(ad.image.public_id);
    }
    // Upload new
    const fileBuffer = req.files.image[0].buffer;
    const result = await uploadToCloudinary(fileBuffer, {
      folder: 'ads_images',
      resource_type: 'image',
    });
    ad.image = {
      public_id: result.public_id,
      url: result.secure_url,
    };
  }

  const updatedAd = await ad.save();
  res.json(updatedAd);
});

// @desc    Delete Ad
// @route   DELETE /api/ads/:id
// @access  Private/Admin
exports.deleteAd = asyncHandler(async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  if (!ad) {
    res.status(404);
    throw new Error('Ad not found');
  }
  // Remove image from Cloudinary if any
  if (ad.image?.public_id) {
    await cloudinary.uploader.destroy(ad.image.public_id);
  }
  await ad.deleteOne();
  res.json({ message: 'Ad removed successfully' });
});







// const asyncHandler = require('express-async-handler');
// const Ad = require('../models/Ad');

// const createAd = asyncHandler(async (req, res) => {
//   const {
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     templateId,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//     promoCode,
//     limitedOffer,
//     instructor,
//     courseInfo,
//     rating,
//     originalPrice,
//     salePrice,
//     discountPercentage,
//     saleEnds,
//     eventDate,
//     eventLocation,
//     customStyles,
//     adProdtype,
//     adProdId,
//   } = req.body;

//   if (!image || !title || !subtitle) {
//     res.status(400);
//     throw new Error('Please provide image, title, and subtitle for the ad.');
//   }

//   const ad = new Ad({
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     templateId,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//     promoCode,
//     limitedOffer,
//     instructor,
//     courseInfo,
//     rating,
//     originalPrice,
//     salePrice,
//     discountPercentage,
//     saleEnds,
//     eventDate,
//     eventLocation,
//     customStyles,
//     adProdtype,
//     adProdId,
//   });

//   const createdAd = await ad.save();
//   res.status(201).json(createdAd);
// });
// // const createAd = asyncHandler(async (req, res) => {
// //   const {
// //     image,
// //     title,
// //     subtitle,
// //     description,
// //     link,
// //     category,
// //     templateId,
// //     price,
// //     startDate,
// //     endDate,
// //     targetAudience,
// //     ctaText,
// //     priority,
// //     cardDesign,
// //     backgroundColor,
// //     textColor,
// //     customStyles,
// //   } = req.body;

// //   if (!image || !title || !subtitle) {
// //     res.status(400);
// //     throw new Error('Please provide image, title, and subtitle for the ad.');
// //   }

// //   const ad = new Ad({
// //     image,
// //     title,
// //     subtitle,
// //     description,
// //     link,
// //     category,
// //     templateId,
// //     price,
// //     startDate,
// //     endDate,
// //     targetAudience,
// //     ctaText,
// //     priority,
// //     cardDesign,
// //     backgroundColor,
// //     textColor,
// //     customStyles,
// //   });

// //   const createdAd = await ad.save();
// //   res.status(201).json(createdAd);
// // });

// const getAds = asyncHandler(async (req, res) => {
//   const ads = await Ad.find({});
//   res.json({ success: true, data: ads });
// });

// const getAdById = asyncHandler(async (req, res) => {
//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     res.json(ad);
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// const updateAd = asyncHandler(async (req, res) => {
//   const {
//     // image,
//     // title,
//     // subtitle,
//     // description,
//     // link,
//     // category,
//     // templateId,
//     // price,
//     // startDate,
//     // endDate,
//     // targetAudience,
//     // ctaText,
//     // priority,
//     // cardDesign,
//     // backgroundColor,
//     // textColor,
//     // customStyles,
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     templateId,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//     promoCode,
//     limitedOffer,
//     instructor,
//     courseInfo,
//     rating,
//     originalPrice,
//     salePrice,
//     discountPercentage,
//     saleEnds,
//     eventDate,
//     eventLocation,
//     customStyles,
//     adProdtype,
//     adProdId,
//   } = req.body;

//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     ad.image = image || ad.image;
//     ad.title = title || ad.title;
//     ad.subtitle = subtitle || ad.subtitle;
//     ad.description = description || ad.description;
//     ad.link = link || ad.link;
//     ad.category = category || ad.category;
//     ad.templateId = templateId || ad.templateId;
//     ad.price = price || ad.price;
//     ad.startDate = startDate || ad.startDate;
//     ad.endDate = endDate || ad.endDate;
//     ad.targetAudience = targetAudience || ad.targetAudience;
//     ad.ctaText = ctaText || ad.ctaText;
//     ad.priority = priority || ad.priority;
//     ad.cardDesign = cardDesign || ad.cardDesign;
//     ad.backgroundColor = backgroundColor || ad.backgroundColor;
//     ad.textColor = textColor || ad.textColor;
//     ad.customStyles = customStyles || ad.customStyles;

//     ad.promoCode = promoCode || ad.promoCode;
//     ad.limitedOffer = limitedOffer || ad.limitedOffer;
//     ad.instructor = instructor || ad.instructor;
//     ad.courseInfo = courseInfo || ad.courseInfo;
//     ad.rating = rating || ad.rating;
//     ad.originalPrice = originalPrice || ad.originalPrice;
//     ad.salePrice = salePrice || ad.salePrice;
//     ad.discountPercentage = discountPercentage || ad.discountPercentage;
//     ad.saleEnds = saleEnds || ad.saleEnds;
//     ad.eventDate = eventDate || ad.eventDate;
//     ad.eventLocation = eventLocation || ad.eventLocation;

//     ad.adProdtype = adProdtype || ad.adProdtype;
//     ad.adProdId = adProdId || ad.adProdId;

//     const updatedAd = await ad.save();
//     res.json(updatedAd);
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// const deleteAd = asyncHandler(async (req, res) => {
//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     await ad.deleteOne();
//     res.json({ message: 'Ad removed successfully' });
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// module.exports = { createAd, getAds, getAdById, updateAd, deleteAd };







// // controllers/adController.js
// const asyncHandler = require('express-async-handler');
// const Ad = require('../models/Ad');

// const createAd = asyncHandler(async (req, res) => {
//   const {
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     templateId,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//     customStyles,
//   } = req.body;

//   if (!image || !title || !subtitle) {
//     res.status(400);
//     throw new Error('Please provide image, title, and subtitle for the ad.');
//   }

//   const ad = new Ad({
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     templateId,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//     customStyles,
//   });

//   const createdAd = await ad.save();
//   res.status(201).json(createdAd);
// });

// const getAds = asyncHandler(async (req, res) => {
//   const ads = await Ad.find({});
//   res.json({ success: true, data: ads });
// });

// const getAdById = asyncHandler(async (req, res) => {
//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     res.json(ad);
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// const updateAd = asyncHandler(async (req, res) => {
//   const {
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     templateId,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//     customStyles,
//   } = req.body;

//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     ad.image = image || ad.image;
//     ad.title = title || ad.title;
//     ad.subtitle = subtitle || ad.subtitle;
//     ad.description = description || ad.description;
//     ad.link = link || ad.link;
//     ad.category = category || ad.category;
//     ad.templateId = templateId || ad.templateId;
//     ad.price = price || ad.price;
//     ad.startDate = startDate || ad.startDate;
//     ad.endDate = endDate || ad.endDate;
//     ad.targetAudience = targetAudience || ad.targetAudience;
//     ad.ctaText = ctaText || ad.ctaText;
//     ad.priority = priority || ad.priority;
//     ad.cardDesign = cardDesign || ad.cardDesign;
//     ad.backgroundColor = backgroundColor || ad.backgroundColor;
//     ad.textColor = textColor || ad.textColor;
//     ad.customStyles = customStyles || ad.customStyles;

//     const updatedAd = await ad.save();
//     res.json(updatedAd);
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// const deleteAd = asyncHandler(async (req, res) => {
//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     await ad.remove();
//     res.json({ message: 'Ad removed successfully' });
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// module.exports = { createAd, getAds, getAdById, updateAd, deleteAd };







// const asyncHandler = require('express-async-handler');
// const Ad = require('../models/Ad');

// /**
//  * @desc    Create a new ad
//  * @route   POST /api/ads
//  * @access  Private/Admin
//  */
// const createAd = asyncHandler(async (req, res) => {
//   const {
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//   } = req.body;

//   // Check required fields (keeping backwards compatibility with image, title, subtitle)
//   if (!image || !title || !subtitle) {
//     res.status(400);
//     throw new Error('Please provide image, title, and subtitle for the ad.');
//   }

//   const ad = new Ad({
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//   });

//   const createdAd = await ad.save();
//   res.status(201).json(createdAd);
// });

// /**
//  * @desc    Get all ads
//  * @route   GET /api/ads
//  * @access  Public
//  */
// const getAds = asyncHandler(async (req, res) => {
//   const ads = await Ad.find({});
//   res.json(ads);
// });

// /**
//  * @desc    Get a single ad by ID
//  * @route   GET /api/ads/:id
//  * @access  Public
//  */
// const getAdById = asyncHandler(async (req, res) => {
//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     res.json(ad);
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// /**
//  * @desc    Update an ad
//  * @route   PUT /api/ads/:id
//  * @access  Private/Admin
//  */
// const updateAd = asyncHandler(async (req, res) => {
//   const {
//     image,
//     title,
//     subtitle,
//     description,
//     link,
//     category,
//     price,
//     startDate,
//     endDate,
//     targetAudience,
//     ctaText,
//     priority,
//     cardDesign,
//     backgroundColor,
//     textColor,
//   } = req.body;

//   const ad = await Ad.findById(req.params.id);

//   if (ad) {
//     ad.image = image || ad.image;
//     ad.title = title || ad.title;
//     ad.subtitle = subtitle || ad.subtitle;
//     ad.description = description || ad.description;
//     ad.link = link || ad.link;
//     ad.category = category || ad.category;
//     ad.price = price || ad.price;
//     ad.startDate = startDate || ad.startDate;
//     ad.endDate = endDate || ad.endDate;
//     ad.targetAudience = targetAudience || ad.targetAudience;
//     ad.ctaText = ctaText || ad.ctaText;
//     ad.priority = priority || ad.priority;
//     ad.cardDesign = cardDesign || ad.cardDesign;
//     ad.backgroundColor = backgroundColor || ad.backgroundColor;
//     ad.textColor = textColor || ad.textColor;

//     const updatedAd = await ad.save();
//     res.json(updatedAd);
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// /**
//  * @desc    Delete an ad
//  * @route   DELETE /api/ads/:id
//  * @access  Private/Admin
//  */
// const deleteAd = asyncHandler(async (req, res) => {
//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     await ad.remove();
//     res.json({ message: 'Ad removed successfully' });
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// module.exports = {
//   createAd,
//   getAds,
//   getAdById,
//   updateAd,
//   deleteAd,
// };







// const asyncHandler = require('express-async-handler');
// const Ad = require('../models/Ad');

// /**
//  * @desc    Create a new ad
//  * @route   POST /api/ads
//  * @access  Private/Admin
//  */
// const createAd = asyncHandler(async (req, res) => {
//   const { image, title, subtitle } = req.body;

//   if (!image || !title || !subtitle) {
//     res.status(400);
//     throw new Error('Please provide image, title, and subtitle for the ad.');
//   }

//   const ad = new Ad({ image, title, subtitle });
//   const createdAd = await ad.save();
//   res.status(201).json(createdAd);
// });

// /**
//  * @desc    Get all ads
//  * @route   GET /api/ads
//  * @access  Public
//  */
// const getAds = asyncHandler(async (req, res) => {
//   const ads = await Ad.find({});
//   res.json(ads);
// });

// /**
//  * @desc    Get a single ad by ID
//  * @route   GET /api/ads/:id
//  * @access  Public
//  */
// const getAdById = asyncHandler(async (req, res) => {
//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     res.json(ad);
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// /**
//  * @desc    Update an ad
//  * @route   PUT /api/ads/:id
//  * @access  Private/Admin
//  */
// const updateAd = asyncHandler(async (req, res) => {
//   const { image, title, subtitle } = req.body;
//   const ad = await Ad.findById(req.params.id);

//   if (ad) {
//     ad.image = image || ad.image;
//     ad.title = title || ad.title;
//     ad.subtitle = subtitle || ad.subtitle;
//     const updatedAd = await ad.save();
//     res.json(updatedAd);
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// /**
//  * @desc    Delete an ad
//  * @route   DELETE /api/ads/:id
//  * @access  Private/Admin
//  */
// const deleteAd = asyncHandler(async (req, res) => {
//   const ad = await Ad.findById(req.params.id);
//   if (ad) {
//     await ad.remove();
//     res.json({ message: 'Ad removed successfully' });
//   } else {
//     res.status(404);
//     throw new Error('Ad not found');
//   }
// });

// module.exports = {
//   createAd,
//   getAds,
//   getAdById,
//   updateAd,
//   deleteAd,
// };
