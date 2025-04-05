// middleware/upload.js

const multer = require('multer');

// We store everything in memory, so we can handle them in the controller.
const storage = multer.memoryStorage();

// Optionally, you can filter files if needed
function fileFilter(req, file, cb) {
  // Example: you might block some file types, etc.
  // For now, let's accept all:
  cb(null, true);
}

const upload = multer({ storage, fileFilter });

module.exports = upload;