// routes/themeRoutes.js
const express = require('express');
const router = express.Router();
const { getTheme, updateTheme } = require('../controllers/themeController');

// Optionally add middleware to restrict update access to admins
router.route('/')
  .get(getTheme)
  .put(updateTheme);

module.exports = router;
