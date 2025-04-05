// models/Video.js
const mongoose = require('mongoose');

const videoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a video title.'],
    },
    url: {
      type: String,
      required: [true, 'Please add a video URL.'],
      match: [
        /^(https?:\/\/.*\.(?:mp4|webm|ogg))$/i,
        'Please enter a valid video URL.',
      ],
    },
    coverImage: {
      type: String,
      default: '',
      match: [
        /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i,
        'Please enter a valid image URL.',
      ],
    },
    description: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      default: 0,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
  },
  { timestamps: true }
);

const Video = mongoose.model('Video', videoSchema);
module.exports = Video;
