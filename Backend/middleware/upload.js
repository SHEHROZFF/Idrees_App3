const multer = require('multer');

// We'll store files in memory for direct upload to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  // Optional file-size limits or file-type filters can go here
  // limits: { fileSize: 10 * 1024 * 1024 }, // e.g. 10MB limit
});

module.exports = upload;







