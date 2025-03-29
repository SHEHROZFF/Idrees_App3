// babel.config.js

// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'], // If you're using Expo
//     plugins: ['nativewind/babel'],   // Add this line
//   };
// };

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }],
    ],
    plugins: ['react-native-reanimated/plugin'],
  };
};
