// models/Theme.js
const mongoose = require('mongoose');

const themeSchema = mongoose.Schema(
  {
    light: {
      backgroundHeaderColor: { type: String, required: true },
      backgroundColor: { type: String, required: true },
      primaryColor: { type: String, required: true },
      secondaryColor: { type: String, required: true },
      textColor: { type: String, required: true },
      headerBackground: { type: [String], required: true },
      placeholderTextColor: { type: String, required: true },
      cardBackground: { type: String, required: true },
      cardTextColor: { type: String, required: true },
      overlayColor: { type: String, required: true },
      tabBarActiveTintColor: { type: String, required: true },
      tabBarInactiveTintColor: { type: String, required: true },
      statusBarStyle: { type: String, required: true },
      switchTrackColorFalse: { type: String, required: true },
      switchTrackColorTrue: { type: String, required: true },
      switchThumbColor: { type: String, required: true },
      switchIosBackgroundColor: { type: String, required: true },
      borderColor: { type: String, required: true },
      priceColor: { type: String, required: true },
      headerTextColor: { type: String, required: true },
      arrowColor: { type: String, required: true },
    },
    dark: {
      backgroundHeaderColor: { type: String, required: true },
      backgroundColor: { type: String, required: true },
      primaryColor: { type: String, required: true },
      secondaryColor: { type: String, required: true },
      textColor: { type: String, required: true },
      headerBackground: { type: [String], required: true },
      placeholderTextColor: { type: String, required: true },
      cardBackground: { type: String, required: true },
      cardTextColor: { type: String, required: true },
      overlayColor: { type: String, required: true },
      tabBarActiveTintColor: { type: String, required: true },
      tabBarInactiveTintColor: { type: String, required: true },
      statusBarStyle: { type: String, required: true },
      switchTrackColorFalse: { type: String, required: true },
      switchTrackColorTrue: { type: String, required: true },
      switchThumbColor: { type: String, required: true },
      switchIosBackgroundColor: { type: String, required: true },
      borderColor: { type: String, required: true },
      priceColor: { type: String, required: true },
      headerTextColor: { type: String, required: true },
      arrowColor: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theme', themeSchema);
