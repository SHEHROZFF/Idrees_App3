// routes/policies.js
const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');
// const { adminAuth } = require('../middlewares/auth');

// GET a policy by type (privacy or terms)
router.get('/:type', async (req, res) => {
  try {
    const policy = await Policy.findOne({ type: req.params.type });
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a policy (admin only)
router.put('/:type', async (req, res) => {
  try {
    const { content } = req.body;
    const policy = await Policy.findOneAndUpdate(
      { type: req.params.type },
      { content, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    res.json(policy);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update policy' });
  }
});

module.exports = router;
