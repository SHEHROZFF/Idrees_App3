// routes/config.js
const express = require('express');
const router = express.Router();
const Config = require('../models/Config');

router.get('/stripe', async (req, res) => {
  try {
    // Look up the publishable key by a known key name, e.g. "stripePublishableKey"
    const config = await Config.findOne({ key: 'stripePublishableKey' });
    if (!config) {
      return res.status(404).json({ error: 'Stripe configuration not found' });
    }
    res.json({ publishableKey: config.value });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
