// routes/adRoutes.js

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createAd,
  getAds,
  getAdById,
  updateAd,
  deleteAd,
} = require('../controllers/adController');

// GET all, CREATE new
router
  .route('/')
  .get(getAds)
  .post(protect, upload.fields([{ name: 'image', maxCount: 1 }]), createAd);

// GET by ID, UPDATE, DELETE
router
  .route('/:id')
  .get(getAdById)
  .put(protect, upload.fields([{ name: 'image', maxCount: 1 }]), updateAd)
  .delete(protect,  deleteAd);

module.exports = router;




// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const { createAd, getAds, getAdById, updateAd, deleteAd } = require('../controllers/adController');

// router.route('/')
//   .get(getAds)
//   .post(protect, createAd);

// router.route('/:id')
//   .get(getAdById)
//   .put(protect, updateAd)
//   .delete(protect, deleteAd);

// module.exports = router;









// // routes/adsRoutes.js
// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const { createAd, getAds, getAdById, updateAd, deleteAd } = require('../controllers/adController');

// router.route('/')
//   .get(getAds)
//   .post(protect, createAd);

// router.route('/:id')
//   .get(getAdById)
//   .put(protect, updateAd)
//   .delete(protect, deleteAd);

// module.exports = router;






// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const {
//   createAd,
//   getAds,
//   getAdById,
//   updateAd,
//   deleteAd,
// } = require('../controllers/adController');

// router
//   .route('/')
//   .get(getAds)
//   .post(protect, createAd);

// router
//   .route('/:id')
//   .get(getAdById)
//   .put(protect, updateAd)
//   .delete(protect, deleteAd);

// module.exports = router;











// const express = require('express');
// const router = express.Router();
// const { protect, admin } = require('../middleware/authMiddleware');
// const {
//   createAd,
//   getAds,
//   getAdById,
//   updateAd,
//   deleteAd,
// } = require('../controllers/adController');

// router
//   .route('/')
//   .get(getAds)
//   .post(protect, createAd);

// router
//   .route('/:id')
//   .get(getAdById)
//   .put(protect, updateAd)
//   .delete(protect,  deleteAd);

// module.exports = router;
