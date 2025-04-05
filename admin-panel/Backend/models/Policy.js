// models/Policy.js
const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['privacy', 'terms'],
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Policy', PolicySchema);
