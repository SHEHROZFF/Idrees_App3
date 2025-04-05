// /middleware/multer.js
const multer = require('multer');

// Store files in memory so we can stream to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
