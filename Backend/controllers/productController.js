const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Fetch all products/exams
// @route   GET /api/products
// @access  Public/Admin
const fetchProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).select('-__v'); // Exclude __v field
  res.status(200).json({ success: true, count: products.length, data: products });
});

const getProductById = asyncHandler(async (req, res) => { 
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
const addProduct = asyncHandler(async (req, res) => {
  const { name, subjectName, subjectCode, price, image, description, type, pdfLink, saleEnabled, salePrice } = req.body;

  // Create new product
  const product = await Product.create({
    name,
    subjectName,
    subjectCode,
    price,
    image,
    description,
    type,
    pdfLink,
    saleEnabled,
    salePrice,
  });

  res.status(201).json({ success: true, data: product });
});

// @desc    Update a product/exam
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, subjectName, subjectCode, price, image, description, type, pdfLink, saleEnabled, salePrice } = req.body;

  // Find product by ID
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product/Exam not found');
  }

  // Update fields
  product.name = name || product.name;
  product.subjectName = subjectName || product.subjectName;
  product.subjectCode = subjectCode || product.subjectCode;
  product.price = price !== undefined ? price : product.price;
  product.image = image || product.image;
  product.description = description || product.description;
  product.type = type || product.type;
  product.pdfLink = pdfLink || product.pdfLink;
  product.saleEnabled = saleEnabled || product.saleEnabled;
  product.salePrice = salePrice || product.salePrice;

  const updatedProduct = await product.save();

  res.status(200).json({ success: true, data: updatedProduct });
});

// @desc    Delete a product/exam
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error('Product/Exam not found');
  }
  await product.deleteOne(); // triggers pre('deleteOne') middleware
  res.status(200).json({
    success: true,
    message: 'Product/Exam removed',
    data: { _id: id },
  });
});

module.exports = {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById
};












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
