// routes/productRoutes.js

const express = require('express');
const router = express.Router();

const {
  fetchProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  streamPDF
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadPDF'); // <-- Our new/updated Multer config

// Fetch all and add product
router
  .route('/')
  .get(fetchProducts)
  .post(
    protect, 
    authorize('admin'), 
    // Accept up to 1 image file and 1 pdf file
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]),
    addProduct
  );

// Get/update/delete product
router
  .route('/:id')
  .get(getProductById)
  .put(
    protect,
    authorize('admin'),
    upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]),
    updateProduct
  )
  .delete(protect, authorize('admin'), deleteProduct);

// NEW route for streaming PDF
router.get('/stream-pdf/:productId', protect, streamPDF);

module.exports = router;








// const express = require('express');
// const router = express.Router();

// const {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
//   getProductById
// } = require('../controllers/productController');

// const { protect, authorize } = require('../middleware/authMiddleware');
// const upload = require('../middleware/upload');

// // Fetch all and add product
// router
//   .route('/')
//   .get(fetchProducts)
//   .post(
//     protect, 
//     authorize('admin'), 
//     // Accept up to 1 image file and 1 pdf file
//     upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]),
//     addProduct
//   );

// // Get/update/delete product
// router
//   .route('/:id')
//   .get(getProductById)
//   .put(
//     protect,
//     authorize('admin'),
//     upload.fields([{ name: 'image', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]),
//     updateProduct
//   )
//   .delete(protect, authorize('admin'), deleteProduct);

// module.exports = router;







// // routes/productRoutes.js

// const express = require('express');
// const router = express.Router();
// const {
//   fetchProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
//   getProductById
// } = require('../controllers/productController');

// // Middleware for authentication and authorization
// const { protect, authorize } = require('../middleware/authMiddleware');

// // Fetch all products/exams
// router.route('/').get(fetchProducts).post(protect, authorize('admin'), addProduct);

// // Get a specific product/exam by ID
// router.route('/:id').get(getProductById);   

// // Update and delete specific product/exam by ID
// router.route('/:id').put(protect, authorize('admin'), updateProduct).delete(protect, authorize('admin'), deleteProduct);

// module.exports = router;
