// controllers/themeController.js
const asyncHandler = require('express-async-handler');
const Theme = require('../models/Theme');

// @desc    Get theme settings
// @route   GET /api/theme
// @access  Public (or restrict via middleware if needed)
const getTheme = asyncHandler(async (req, res) => {
  let theme = await Theme.findOne();
  if (!theme) {
    // Create a default theme document if none exists
    theme = await Theme.create({
      light: {
        backgroundHeaderColor: '#0033CC',
        backgroundColor: '#FFFFFF',
        primaryColor: '#0033CC',
        secondaryColor: '#001A80',
        textColor: '#000000',
        headerBackground: ['#0033CC', '#7db6ff'],
        placeholderTextColor: '#BDBDBD',
        cardBackground: '#FFFFFF',
        cardTextColor: '#0033CC',
        overlayColor: 'rgba(0, 51, 204, 0.8)',
        tabBarActiveTintColor: '#0033CC',
        tabBarInactiveTintColor: 'gray',
        statusBarStyle: 'light-content',
        switchTrackColorFalse: '#BDBDBD',
        switchTrackColorTrue: '#80AFFF',
        switchThumbColor: '#FFFFFF',
        switchIosBackgroundColor: '#BDBDBD',
        borderColor: '#80AFFF',
        priceColor: '#E91E63',
        headerTextColor: '#FFFFFF',
        arrowColor: '#FFFFFF',
      },
      dark: {
        backgroundHeaderColor: '#002A9E',
        backgroundColor: '#121212',
        primaryColor: '#0033CC',
        secondaryColor: '#001A80',
        textColor: '#E0E0E0',
        headerBackground: ['#1E1E1E', '#002A9E'],
        placeholderTextColor: '#A5A5A5',
        cardBackground: '#1E1E1E',
        cardTextColor: '#0088CC',
        overlayColor: 'rgba(0, 51, 204, 0.75)',
        tabBarActiveTintColor: '#0033CC',
        tabBarInactiveTintColor: '#757575',
        statusBarStyle: 'light-content',
        switchTrackColorFalse: '#616161',
        switchTrackColorTrue: '#3399FF',
        switchThumbColor: '#FFFFFF',
        switchIosBackgroundColor: '#424242',
        borderColor: '#CCD6FF',
        priceColor: '#FF4081',
        headerTextColor: '#E0E0E0',
        arrowColor: '#0033CC',
      },
    });
  }
  res.json(theme);
});

// @desc    Update theme settings
// @route   PUT /api/theme
// @access  Admin (you can add admin middleware)
const updateTheme = asyncHandler(async (req, res) => {
  const { light, dark } = req.body;
  let theme = await Theme.findOne();
  if (!theme) {
    theme = await Theme.create({ light, dark });
  } else {
    theme.light = light || theme.light;
    theme.dark = dark || theme.dark;
    await theme.save();
  }
  res.json(theme);
});

module.exports = { getTheme, updateTheme };
