// // ThemeContext.js
// import React, { createContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import { lightTheme, darkTheme } from './themes'; // fallback values

// export const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   // Current mode: "light" or "dark"
//   const [mode, setMode] = useState('light');
//   // Store the theme details fetched from the backend
//   const [themeDetails, setThemeDetails] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Toggle between light and dark modes
//   const toggleTheme = () => {
//     setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
//   };

//   // Fetch theme from the backend on mount
//   useEffect(() => {
//     axios.get('https://ecom-mauve-three.vercel.app/api/theme') // replace with your actual API endpoint
//       .then(response => {
//         console.log(response.data);
        
//         setThemeDetails(response.data);
//       })
//       .catch(error => {
//         console.error('Failed to fetch theme settings:', error);
//         // Fall back to static themes if fetch fails
//         setThemeDetails({ light: lightTheme, dark: darkTheme });
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // While loading, you can return null or a loading indicator
//   if (loading) {
//     return null;
//   }

//   // Determine the current theme details based on mode
//   const currentTheme = mode === 'light' ? themeDetails.light : themeDetails.dark;

//   return (
//     <ThemeContext.Provider value={{ mode, toggleTheme, currentTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };



import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const THEME_STORAGE_KEY = 'appTheme';

  // Load the saved theme on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

