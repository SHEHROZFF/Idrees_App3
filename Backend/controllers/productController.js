// controllers/productController.js

const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

/**
 * Wrap Cloudinary's upload_stream in a Promise, so we can await it.
 * This is used for images only.
 *
 * @param {Buffer} fileBuffer - The file buffer from Multer (image)
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise} - Resolves with { public_id, secure_url, ... }
 */
const uploadToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error('Cloudinary Upload Error:', error);
        return reject(new Error('Failed to upload image to Cloudinary.'));
      }
      resolve(result);
    });

    // Pipe the buffer into Cloudinary
    Readable.from(fileBuffer).pipe(uploadStream);
  });
};

// @desc    Fetch all products/exams
// @route   GET /api/products
// @access  Public/Admin
exports.fetchProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).select('-__v');
  res.status(200).json({ success: true, count: products.length, data: products });
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public/Admin
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.status(200).json({ success: true, data: product });
});

// @desc    Add a new product/exam
// @route   POST /api/products
// @access  Private/Admin
exports.addProduct = asyncHandler(async (req, res) => {
  const {
    name,
    subjectName,
    subjectCode,
    price,
    description,
    type,
    saleEnabled,
    salePrice,
  } = req.body;

  // Prepare new product data
  const productData = {
    name,
    subjectName,
    subjectCode,
    price,
    description,
    type,
    saleEnabled: saleEnabled === 'true' || saleEnabled === true,
    salePrice,
  };

  // If user uploads an image -> Cloudinary
  if (req.files?.image?.[0]) {
    const fileBuffer = req.files.image[0].buffer;
    const uploadResult = await uploadToCloudinary(fileBuffer, {
      folder: 'products_images',
    });
    productData.image = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  }

  // If user uploads a PDF -> local server
  if (req.files?.pdf?.[0]) {
    const pdfBuffer = req.files.pdf[0].buffer;
    const originalName = req.files.pdf[0].originalname;
    const uniqueFilename = Date.now() + '-' + originalName;

    // Write PDF file to disk in uploads/pdfs
    const pdfFolder = path.join(__dirname, '..', 'uploads', 'pdfs');
    if (!fs.existsSync(pdfFolder)) {
      fs.mkdirSync(pdfFolder, { recursive: true });
    }
    const pdfPath = path.join(pdfFolder, uniqueFilename);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Construct local relative path (for deletion, etc.)
    const localPdfRelativePath = `/uploads/pdfs/${uniqueFilename}`;
    // Construct a fully-qualified URL so you can link directly
    const protocol = req.protocol;         // 'http' or 'https'
    const host = req.get('host');          // e.g. 'localhost:5000'
    const pdfFullUrl = `${protocol}://${host}${localPdfRelativePath}`;

    // Save both in the DB
    productData.pdfLocalPath = localPdfRelativePath;
    productData.pdfFullUrl = pdfFullUrl;
  }

  // Create new product
  const product = await Product.create(productData);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update a product/exam
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const {
    name,
    subjectName,
    subjectCode,
    price,
    description,
    type,
    saleEnabled,
    salePrice,
  } = req.body;

  // Find product by ID
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product/Exam not found');
  }

  // Update text fields
  product.name = name || product.name;
  product.subjectName = subjectName || product.subjectName;
  product.subjectCode = subjectCode || product.subjectCode;
  product.price = price !== undefined ? price : product.price;
  product.description = description || product.description;
  product.type = type || product.type;
  product.saleEnabled = saleEnabled === 'true' || saleEnabled === true;
  product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;

  // If a new image is uploaded (replace old image on Cloudinary)
  if (req.files?.image?.[0]) {
    // Remove old image if it exists
    if (product.image?.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }
    // Upload new image
    const fileBuffer = req.files.image[0].buffer;
    const uploadResult = await uploadToCloudinary(fileBuffer, {
      folder: 'products_images',
    });
    product.image = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  }

  // If a new PDF is uploaded -> local server
  if (req.files?.pdf?.[0]) {
    // Remove old PDF file if it exists
    if (product.pdfLocalPath) {
      const oldFileName = path.basename(product.pdfLocalPath); // extract filename
      const oldPdfPath = path.join(__dirname, '..', 'uploads', 'pdfs', oldFileName);
      if (fs.existsSync(oldPdfPath)) {
        fs.unlinkSync(oldPdfPath);
      }
    }

    // Save new PDF to disk
    const pdfBuffer = req.files.pdf[0].buffer;
    const originalName = req.files.pdf[0].originalname;
    const uniqueFilename = Date.now() + '-' + originalName;

    const pdfFolder = path.join(__dirname, '..', 'uploads', 'pdfs');
    if (!fs.existsSync(pdfFolder)) {
      fs.mkdirSync(pdfFolder, { recursive: true });
    }
    const pdfPath = path.join(pdfFolder, uniqueFilename);
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Construct local relative path
    const localPdfRelativePath = `/uploads/pdfs/${uniqueFilename}`;
    // Construct full URL
    const protocol = req.protocol;
    const host = req.get('host');
    const pdfFullUrl = `${protocol}://${host}${localPdfRelativePath}`;

    product.pdfLocalPath = localPdfRelativePath;
    product.pdfFullUrl = pdfFullUrl;
  }

  // Save the updated product
  const updatedProduct = await product.save();
  res.status(200).json({ success: true, data: updatedProduct });
});

// @desc    Delete a product/exam
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product/Exam not found');
  }

  // Remove image from Cloudinary if it exists
  if (product.image?.public_id) {
    await cloudinary.uploader.destroy(product.image.public_id);
  }

  // Remove pdf from local disk if it exists
  if (product.pdfLocalPath) {
    const fileName = path.basename(product.pdfLocalPath); // get the filename only
    const pdfPath = path.join(__dirname, '..', 'uploads', 'pdfs', fileName);
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
  }

  // Finally remove product from DB
  await product.deleteOne();
  res.status(200).json({
    success: true,
    message: 'Product/Exam removed',
    data: { _id: productId },
  });
});









// // controllers/productController.js

// const asyncHandler = require('express-async-handler');
// const Product = require('../models/Product');
// const cloudinary = require('../config/cloudinary');
// const { Readable } = require('stream');

// /**
//  * Wrap Cloudinary's upload_stream in a Promise, so we can await it.
//  *
//  * @param {Buffer} fileBuffer - The file buffer from Multer
//  * @param {Object} options - Cloudinary upload options
//  * @returns {Promise} - Resolves with { public_id, secure_url, ... }
//  */
// const uploadToCloudinary = (fileBuffer, options = {}) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
//       if (error) {
//         console.error('Cloudinary Upload Error:', error);
//         return reject(new Error('Failed to upload file to Cloudinary.'));
//       }
//       resolve(result);
//     });
//     // Pipe the buffer into the upload_stream
//     Readable.from(fileBuffer).pipe(uploadStream);
//   });
// };

// // @desc    Fetch all products/exams
// // @route   GET /api/products
// // @access  Public/Admin
// exports.fetchProducts = asyncHandler(async (req, res) => {
//   const products = await Product.find({}).select('-__v');
//   res.status(200).json({ success: true, count: products.length, data: products });
// });

// // @desc    Get product by ID
// // @route   GET /api/products/:id
// // @access  Public/Admin
// exports.getProductById = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found');
//   }
//   res.status(200).json({ success: true, data: product });
// });

// // @desc    Add a new product/exam
// // @route   POST /api/products
// // @access  Private/Admin
// exports.addProduct = asyncHandler(async (req, res) => {
//   const {
//     name,
//     subjectName,
//     subjectCode,
//     price,
//     description,
//     type,
//     saleEnabled,
//     salePrice,
//   } = req.body;

//   // Prepare new product data
//   const productData = {
//     name,
//     subjectName,
//     subjectCode,
//     price,
//     description,
//     type,
//     saleEnabled: saleEnabled === 'true' || saleEnabled === true,
//     salePrice,
//   };

//   // If user uploads an image
//   if (req.files?.image?.[0]) {
//     const fileBuffer = req.files.image[0].buffer;
//     const uploadResult = await uploadToCloudinary(fileBuffer, {
//       folder: 'products_images',
//       // By default type='upload' for images, resource_type='image' is implied
//     });
//     productData.image = {
//       public_id: uploadResult.public_id,
//       url: uploadResult.secure_url,
//     };
//   }

//   // If user uploads a PDF
//   if (req.files?.pdf?.[0]) {
//     const file = req.files.pdf[0];
//     const fileBuffer = file.buffer;

//     // We'll derive a "public_id" from the original file name (minus extension)
//     const originalName = file.originalname.split('.').slice(0, -1).join('.');

//     const uploadResult = await uploadToCloudinary(fileBuffer, {
//       folder: 'products_pdfs',
//       resource_type: 'raw',   // needed for non-image files
//       type: 'upload',         // publicly available if Cloudinary account allows
//       format: 'pdf',          // ensure final URL ends in .pdf
//       use_filename: true,     // use the file's name for better readability
//       unique_filename: true,  // Cloudinary might add random characters to avoid collisions
//       public_id: originalName // the base public_id (filename)
//     });

//     productData.pdf = {
//       public_id: uploadResult.public_id,
//       url: uploadResult.secure_url,
//     };
//   }

//   // Create new product
//   const product = await Product.create(productData);
//   res.status(201).json({ success: true, data: product });
// });

// // @desc    Update a product/exam
// // @route   PUT /api/products/:id
// // @access  Private/Admin
// exports.updateProduct = asyncHandler(async (req, res) => {
//   const productId = req.params.id;
//   const {
//     name,
//     subjectName,
//     subjectCode,
//     price,
//     description,
//     type,
//     saleEnabled,
//     salePrice,
//   } = req.body;

//   // Find product by ID
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product/Exam not found');
//   }

//   // Update text fields
//   product.name = name || product.name;
//   product.subjectName = subjectName || product.subjectName;
//   product.subjectCode = subjectCode || product.subjectCode;
//   product.price = price !== undefined ? price : product.price;
//   product.description = description || product.description;
//   product.type = type || product.type;
//   product.saleEnabled = saleEnabled === 'true' || saleEnabled === true;
//   product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;

//   // If a new image is uploaded, remove old & upload new
//   if (req.files?.image?.[0]) {
//     if (product.image?.public_id) {
//       await cloudinary.uploader.destroy(product.image.public_id);
//     }
//     const fileBuffer = req.files.image[0].buffer;
//     const uploadResult = await uploadToCloudinary(fileBuffer, {
//       folder: 'products_images',
//     });
//     product.image = {
//       public_id: uploadResult.public_id,
//       url: uploadResult.secure_url,
//     };
//   }

//   // If a new PDF is uploaded, remove old & upload new
//   if (req.files?.pdf?.[0]) {
//     if (product.pdf?.public_id) {
//       await cloudinary.uploader.destroy(product.pdf.public_id, { resource_type: 'raw' });
//     }

//     const file = req.files.pdf[0];
//     const fileBuffer = file.buffer;
//     const originalName = file.originalname.split('.').slice(0, -1).join('.');
    
//     const uploadResult = await uploadToCloudinary(fileBuffer, {
//       folder: 'products_pdfs',
//       resource_type: 'raw',
//       type: 'upload',
//       format: 'pdf',
//       use_filename: true,
//       unique_filename: true,
//       public_id: originalName
//     });
//     product.pdf = {
//       public_id: uploadResult.public_id,
//       url: uploadResult.secure_url,
//     };
//   }

//   // Save the updated product
//   const updatedProduct = await product.save();
//   res.status(200).json({ success: true, data: updatedProduct });
// });

// // @desc    Delete a product/exam
// // @route   DELETE /api/products/:id
// // @access  Private/Admin
// exports.deleteProduct = asyncHandler(async (req, res) => {
//   const productId = req.params.id;
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product/Exam not found');
//   }

//   // Remove image from Cloudinary if it exists
//   if (product.image?.public_id) {
//     await cloudinary.uploader.destroy(product.image.public_id);
//   }
//   // Remove pdf from Cloudinary if it exists
//   if (product.pdf?.public_id) {
//     await cloudinary.uploader.destroy(product.pdf.public_id, { resource_type: 'raw' });
//   }

//   await product.deleteOne();
//   res.status(200).json({
//     success: true,
//     message: 'Product/Exam removed',
//     data: { _id: productId },
//   });
// });








// const asyncHandler = require('express-async-handler');
// const Product = require('../models/Product');
// const cloudinary = require('../config/cloudinary');
// const { Readable } = require('stream');

// /**
//  * Helper function to wrap Cloudinary's upload_stream in a Promise
//  * so we can await it.
//  * 
//  * @param {Buffer} fileBuffer - The file buffer from Multer
//  * @param {Object} options - Cloudinary upload options (folder, resource_type, etc.)
//  * @returns {Promise} - Resolves with the upload result (public_id, secure_url, etc.)
//  */
// const uploadToCloudinary = (fileBuffer, options = {}) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
//       if (error) {
//         console.error('Cloudinary Upload Error:', error);
//         return reject(new Error('Failed to upload file to Cloudinary.'));
//       }
//       resolve(result);
//     });
//     // Pipe the buffer into the upload_stream
//     Readable.from(fileBuffer).pipe(uploadStream);
//   });
// };

// // @desc    Fetch all products/exams
// // @route   GET /api/products
// // @access  Public/Admin
// exports.fetchProducts = asyncHandler(async (req, res) => {
//   const products = await Product.find({}).select('-__v');
//   res.status(200).json({ success: true, count: products.length, data: products });
// });

// // @desc    Get product by ID
// // @route   GET /api/products/:id
// // @access  Public/Admin
// exports.getProductById = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.id);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found');
//   }
//   res.status(200).json({ success: true, data: product });
// });

// // @desc    Add a new product/exam
// // @route   POST /api/products
// // @access  Private/Admin
// exports.addProduct = asyncHandler(async (req, res) => {
//   const {
//     name,
//     subjectName,
//     subjectCode,
//     price,
//     description,
//     type,
//     saleEnabled,
//     salePrice,
//   } = req.body;

//   // Prepare new product data
//   const productData = {
//     name,
//     subjectName,
//     subjectCode,
//     price,
//     description,
//     type,
//     saleEnabled: saleEnabled === 'true' || saleEnabled === true,
//     salePrice,
//   };

//   // If user uploads an image
//   if (req.files?.image?.[0]) {
//     const fileBuffer = req.files.image[0].buffer;
//     const uploadResult = await uploadToCloudinary(fileBuffer, {
//       folder: 'products_images',
//     });
//     productData.image = {
//       public_id: uploadResult.public_id,
//       url: uploadResult.secure_url,
//     };
//   }

//   // If user uploads a pdf
//   if (req.files?.pdf?.[0]) {
//     const fileBuffer = req.files.pdf[0].buffer;
//     const uploadResult = await uploadToCloudinary(fileBuffer, {
//       folder: 'products_pdfs',
//       resource_type: 'auto', // let Cloudinary handle PDF detection
//     });
//     productData.pdf = {
//       public_id: uploadResult.public_id,
//       url: uploadResult.secure_url,
//     };
//   }

//   // Create new product
//   const product = await Product.create(productData);
//   res.status(201).json({ success: true, data: product });
// });

// // @desc    Update a product/exam
// // @route   PUT /api/products/:id
// // @access  Private/Admin
// exports.updateProduct = asyncHandler(async (req, res) => {
//   const productId = req.params.id;
//   const {
//     name,
//     subjectName,
//     subjectCode,
//     price,
//     description,
//     type,
//     saleEnabled,
//     salePrice,
//   } = req.body;

//   // Find product by ID
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product/Exam not found');
//   }

//   // Update simple fields
//   product.name = name || product.name;
//   product.subjectName = subjectName || product.subjectName;
//   product.subjectCode = subjectCode || product.subjectCode;
//   product.price = price !== undefined ? price : product.price;
//   product.description = description || product.description;
//   product.type = type || product.type;
//   product.saleEnabled = saleEnabled === 'true' || saleEnabled === true;
//   product.salePrice = salePrice !== undefined ? salePrice : product.salePrice;

//   // If a new image is uploaded, remove the old one from Cloudinary & upload new
//   if (req.files?.image?.[0]) {
//     if (product.image?.public_id) {
//       await cloudinary.uploader.destroy(product.image.public_id);
//     }
//     const fileBuffer = req.files.image[0].buffer;
//     const uploadResult = await uploadToCloudinary(fileBuffer, {
//       folder: 'products_images',
//     });
//     product.image = {
//       public_id: uploadResult.public_id,
//       url: uploadResult.secure_url,
//     };
//   }

//   // If a new PDF is uploaded, remove the old one from Cloudinary & upload new
//   if (req.files?.pdf?.[0]) {
//     if (product.pdf?.public_id) {
//       await cloudinary.uploader.destroy(product.pdf.public_id, { resource_type: 'raw' });
//     }
//     const fileBuffer = req.files.pdf[0].buffer;
//     const uploadResult = await uploadToCloudinary(fileBuffer, {
//       folder: 'products_pdfs',
//       resource_type: 'auto',
//     });
//     product.pdf = {
//       public_id: uploadResult.public_id,
//       url: uploadResult.secure_url,
//     };
//   }

//   const updatedProduct = await product.save();
//   res.status(200).json({ success: true, data: updatedProduct });
// });

// // @desc    Delete a product/exam
// // @route   DELETE /api/products/:id
// // @access  Private/Admin
// exports.deleteProduct = asyncHandler(async (req, res) => {
//   const productId = req.params.id;
//   const product = await Product.findById(productId);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product/Exam not found');
//   }

//   // Remove image from Cloudinary if it exists
//   if (product.image?.public_id) {
//     await cloudinary.uploader.destroy(product.image.public_id);
//   }
//   // Remove pdf from Cloudinary if it exists
//   if (product.pdf?.public_id) {
//     await cloudinary.uploader.destroy(product.pdf.public_id, { resource_type: 'raw' });
//   }

//   await product.deleteOne();
//   res.status(200).json({
//     success: true,
//     message: 'Product/Exam removed',
//     data: { _id: productId },
//   });
// });








// const asyncHandler = require('express-async-handler');
// const Product = require('../models/Product');

// // @desc    Fetch all products/exams
// // @route   GET /api/products
// // @access  Public/Admin
// const fetchProducts = asyncHandler(async (req, res) => {
//   const products = await Product.find({}).select('-__v'); // Exclude __v field
//   res.status(200).json({ success: true, count: products.length, data: products });
// });

// const getProductById = asyncHandler(async (req, res) => { 
//   const product = await Product.findById(req.params.id);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found');
//   }
//   res.status(200).json({ success: true, data: product });
// });

// // @desc    Add a new product/exam
// // @route   POST /api/products
// // @access  Private/Admin
// const addProduct = asyncHandler(async (req, res) => {
//   const { name, subjectName, subjectCode, price, image, description, type, pdfLink, saleEnabled, salePrice } = req.body;

//   // Create new product
//   const product = await Product.create({
//     name,
//     subjectName,
//     subjectCode,
//     price,
//     image,
//     description,
//     type,
//     pdfLink,
//     saleEnabled,
//     salePrice,
//   });

//   res.status(201).json({ success: true, data: product });
// });

// // @desc    Update a product/exam
// // @route   PUT /api/products/:id
// // @access  Private/Admin
// const updateProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { name, subjectName, subjectCode, price, image, description, type, pdfLink, saleEnabled, salePrice } = req.body;

//   // Find product by ID
//   const product = await Product.findById(id);

//   if (!product) {
//     res.status(404);
//     throw new Error('Product/Exam not found');
//   }

//   // Update fields
//   product.name = name || product.name;
//   product.subjectName = subjectName || product.subjectName;
//   product.subjectCode = subjectCode || product.subjectCode;
//   product.price = price !== undefined ? price : product.price;
//   product.image = image || product.image;
//   product.description = description || product.description;
//   product.type = type || product.type;
//   product.pdfLink = pdfLink || product.pdfLink;
//   product.saleEnabled = saleEnabled || product.saleEnabled;
//   product.salePrice = salePrice || product.salePrice;

//   const updatedProduct = await product.save();

//   res.status(200).json({ success: true, data: updatedProduct });
// });

// // @desc    Delete a product/exam
// // @route   DELETE /api/products/:id
// // @access  Private/Admin
// const deleteProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const product = await Product.findById(id);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product/Exam not found');
//   }
//   await product.deleteOne(); // triggers pre('deleteOne') middleware
//   res.status(200).json({
//     success: true,
//     message: 'Product/Exam removed',
//     data: { _id: id },
//   });
// });

// module.exports = {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
//   getProductById
// };












// // controllers/productController.js

// const asyncHandler = require('express-async-handler');
// const Product = require('../models/Product');

// // @desc    Fetch all products/exams
// // @route   GET /api/products
// // @access  Public/Admin
// const fetchProducts = asyncHandler(async (req, res) => {
//   const products = await Product.find({}).select('-__v'); // Exclude __v field
//   res.status(200).json({ success: true, count: products.length, data: products });
// });

// // @desc    Add a new product/exam
// // @route   POST /api/products
// // @access  Private/Admin
// const addProduct = asyncHandler(async (req, res) => {
//   const { name, subjectName, subjectCode, price, image, description, type, pdfLink } = req.body;

//   // Create new product
//   const product = await Product.create({
//     name,
//     subjectName,
//     subjectCode,
//     price,
//     image,
//     description,
//     type,
//     pdfLink,
//   });

//   res.status(201).json({ success: true, data: product });
// });

// // @desc    Update a product/exam
// // @route   PUT /api/products/:id
// // @access  Private/Admin
// const updateProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { name, subjectName, subjectCode, price, image, description, type, pdfLink } = req.body;

//   // Find product by ID
//   const product = await Product.findById(id);

//   if (!product) {
//     res.status(404);
//     throw new Error('Product/Exam not found');
//   }

//   // Update fields
//   product.name = name || product.name;
//   product.subjectName = subjectName || product.subjectName;
//   product.subjectCode = subjectCode || product.subjectCode;
//   product.price = price !== undefined ? price : product.price;
//   product.image = image || product.image;
//   product.description = description || product.description;
//   product.type = type || product.type;
//   product.pdfLink = pdfLink || product.pdfLink;

//   const updatedProduct = await product.save();

//   res.status(200).json({ success: true, data: updatedProduct });
// });

// // @desc    Delete a product/exam
// // @route   DELETE /api/products/:id
// // @access  Private/Admin
// // const deleteProduct = asyncHandler(async (req, res) => {
// //   const { id } = req.params;

// //   // Find product by ID and delete
// //   const product = await Product.findByIdAndDelete(id);

// //   if (!product) {
// //     res.status(404);
// //     throw new Error('Product/Exam not found');
// //   }

// //   res.status(200).json({ success: true, message: 'Product/Exam removed', data: { _id: id } });
// // });
// const deleteProduct = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const product = await Product.findById(id);
//   if (!product) {
//     res.status(404);
//     throw new Error('Product/Exam not found');
//   }
//   await product.deleteOne(); // triggers pre('deleteOne') middleware
//   res.status(200).json({
//     success: true,
//     message: 'Product/Exam removed',
//     data: { _id: id },
//   });
// });
// module.exports = {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
// };



























// // controllers/productController.js

// const asyncHandler = require('express-async-handler');
// const Product = require('../models/Product');

// // @desc    Get all products
// // @route   GET /api/products
// // @access  Public
// const getProducts = asyncHandler(async (req, res) => {
//   const products = await Product.find();
//   res.status(200).json({ success: true, count: products.length, data: products });
// });

// // @desc    Get single product
// // @route   GET /api/products/:id
// // @access  Public
// const getProduct = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.id);

//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found');
//   }

//   res.status(200).json({ success: true, data: product });
// });

// // @desc    Create new product
// // @route   POST /api/products
// // @access  Private/Admin
// const createProduct = asyncHandler(async (req, res) => {
//   const { name, description, price, category, stock } = req.body;

//   const product = await Product.create({
//     name,
//     description,
//     price,
//     category,
//     stock,
//   });

//   res.status(201).json({ success: true, data: product });
// });

// // @desc    Update product
// // @route   PUT /api/products/:id
// // @access  Private/Admin
// const updateProduct = asyncHandler(async (req, res) => {
//   const { name, description, price, category, stock } = req.body;

//   let product = await Product.findById(req.params.id);

//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found');
//   }

//   product.name = name || product.name;
//   product.description = description || product.description;
//   product.price = price || product.price;
//   product.category = category || product.category;
//   product.stock = stock || product.stock;

//   const updatedProduct = await product.save();

//   res.status(200).json({ success: true, data: updatedProduct });
// });

// // @desc    Delete product
// // @route   DELETE /api/products/:id
// // @access  Private/Admin
// const deleteProduct = asyncHandler(async (req, res) => {
//   const product = await Product.findById(req.params.id);

//   if (!product) {
//     res.status(404);
//     throw new Error('Product not found');
//   }

//   await product.remove();

//   res.status(200).json({ success: true, message: 'Product removed' });
// });

// module.exports = {
//   getProducts,
//   getProduct,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// };
