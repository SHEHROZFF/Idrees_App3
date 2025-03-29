// src/contexts/UserContext.js

import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ----- Redux Imports ----- //
import { useDispatch, useSelector } from 'react-redux';
import {
  login as loginThunk,
  register as registerThunk,
  fetchProfile,
  logout as logoutThunk,
  verifyToken
} from '../store/slices/authSlice';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  // Local states if you still want them:
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ----- Redux Hooks ----- //
  const dispatch = useDispatch();
  const {
    user: reduxUser,
    loading: reduxLoading,
    error,
    tokenVerified
  } = useSelector((state) => state.auth);

  // On mount, check token in AsyncStorage and verify with Redux
  useEffect(() => {
    const initializeUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          // If a token exists, let's verify it
          const result = await dispatch(verifyToken());
          // If verifyToken is rejected, the catch block below runs
          if (verifyToken.fulfilled.match(result)) {
            // If the token is valid, fetch the user profile
            const fetchResult = await dispatch(fetchProfile());
            // console.log("fetchResult",fetchResult);
            
            if (fetchProfile.fulfilled.match(fetchResult)) {
              setIsAuthenticated(true);
            } else {
              // If can't fetch profile, logout
              await dispatch(logoutThunk());
              setIsAuthenticated(false);
            }
          } else {
            // token invalid
            await dispatch(logoutThunk());
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Initialization Error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, [dispatch]);

  // Keep local 'user' in sync with Redux user
  useEffect(() => {
    setUser(reduxUser);
  }, [reduxUser]);

  /**
   * Login Function via Redux
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} { success, message? }
   */
  const login = async (email, password) => {
    try {
      const loginResult = await dispatch(loginThunk({ email, password }));
      if (loginThunk.fulfilled.match(loginResult)) {
        // Login success -> fetch profile
        const profileResult = await dispatch(fetchProfile());
        if (fetchProfile.fulfilled.match(profileResult)) {
          setIsAuthenticated(true);
          return { success: true };
        } else {
          // If fetching profile fails
          throw new Error(profileResult.payload || 'Failed to fetch user profile.');
        }
      } else {
        // Rejected or error
        return { success: false, message: loginResult.payload || 'Login failed.' };
      }
    } catch (error) {
      console.error('Login Error:', error);
      return { success: false, message: error.message || 'Login failed.' };
    }
  };

  /**
   * Register Function via Redux
   * @param {object} userData
   * @returns {Promise<object>}
   */
  const register = async (userData) => {
    try {
      const registerResult = await dispatch(registerThunk(userData));
      if (registerThunk.fulfilled.match(registerResult)) {
        // Registration success -> fetch profile
        const profileResult = await dispatch(fetchProfile());
        if (fetchProfile.fulfilled.match(profileResult)) {
          setIsAuthenticated(true);
          return { success: true };
        } else {
          throw new Error(profileResult.payload || 'Failed to fetch user profile.');
        }
      } else {
        return { success: false, message: registerResult.payload || 'Registration failed.' };
      }
    } catch (error) {
      console.error('Registration Error:', error);
      return { success: false, message: error.message || 'Registration failed.' };
    }
  };

  /**
   * Logout Function via Redux
   */
  const logout = async () => {
    try {
      const result = await dispatch(logoutThunk());
      console.log("logoutresult ",result);
      // console.log(logoutThunk.fulfilled.match(result));
      if (logoutThunk.fulfilled.match(result)) {
        // Clear local user state
        setUser(null);
        setIsAuthenticated(false);
        return true;
      } else {
        Alert.alert('Logout Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Logout Error:', error);
      Alert.alert('Logout Error', 'An unexpected error occurred.');
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        loading,
        isAuthenticated,
        tokenVerified,
        error,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};









// // src/contexts/UserContext.js

// import React, { createContext, useState, useEffect } from 'react';
// import { Alert } from 'react-native';
// import api from '../services/api'; // Ensure the path is correct
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { logoutUser } from '../services/api'; // Import logout function

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   // State to hold user data
//   const [user, setUser] = useState(null);

//   // State to manage loading status
//   const [loading, setLoading] = useState(true);

//   // State to manage authentication status
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // Fetch user profile on app start
//   useEffect(() => {
//     const initializeUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (token) {
//           const response = await api.getUserProfile();
//           if (response.success && response.data) {
//             setUser(response.data);
//             setIsAuthenticated(true);
//           } else {
//             // Token might be invalid or expired
//             await logout();
//           }
//         }
//       } catch (error) {
//         console.error('Initialization Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeUser();
//   }, []);

//   /**
//    * Login Function
//    * @param {string} email
//    * @param {string} password
//    * @returns {Promise<object>} Success status and message
//    */
//   const login = async (email, password) => {
//     try {
//       const response = await api.loginUser(email, password);
//       if (response.success && response.data.token) {
//         const profileResponse = await api.getUserProfile();
//         if (profileResponse.success && profileResponse.data) {
//           setUser(profileResponse.data);
//           setIsAuthenticated(true);
//           return { success: true };
//         } else {
//           throw new Error(profileResponse.message || 'Failed to fetch user profile.');
//         }
//       } else {
//         return { success: false, message: response.message || 'Login failed.' };
//       }
//     } catch (error) {
//       console.error('Login Error:', error);
//       return { success: false, message: error.message || 'Login failed.' };
//     }
//   };

//   /**
//    * Register Function
//    * @param {object} userData
//    * @returns {Promise<object>} Success status and message
//    */
//   const register = async (userData) => {
//     try {
//       const response = await api.registerUser(userData);
//       if (response.success && response.data.token) {
//         const profileResponse = await api.getUserProfile();
//         if (profileResponse.success && profileResponse.data) {
//           setUser(profileResponse.data);
//           setIsAuthenticated(true);
//           return { success: true };
//         } else {
//           throw new Error(profileResponse.message || 'Failed to fetch user profile.');
//         }
//       } else {
//         return { success: false, message: response.message || 'Registration failed.' };
//       }
//     } catch (error) {
//       console.error('Registration Error:', error);
//       return { success: false, message: error.message || 'Registration failed.' };
//     }
//   };

//   /**
//    * Logout Function
//    * @returns {Promise<void>}
//    */
//   const logout = async () => {
//     try {
//       const response = await logoutUser(); // Removes token from AsyncStorage
//       console.log("in context",response);
      
//       if (response) {
//         // setUser(null);
//         setIsAuthenticated(false);
//       } else {
//         Alert.alert('Logout Failed', 'Please try again.');
//       }
//     } catch (error) {
//       console.error('Logout Error:', error);
//       Alert.alert('Logout Error', 'An unexpected error occurred.');
//     }
//   };

//   return (
//     <UserContext.Provider value={{ user, setUser, login, register, logout, loading, isAuthenticated }}>
//       {children}
//     </UserContext.Provider>
//   );
// };










// // src/contexts/UserContext.js

// import React, { createContext, useState, useEffect } from 'react';
// import { Alert } from 'react-native';
// import api from '../services/api'; // Ensure the path is correct
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { logoutUser } from '../services/api'; // Import logout function

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   // State to hold user data
//   const [user, setUser] = useState(null);

//   // State to manage loading status
//   const [loading, setLoading] = useState(true);

//   // Fetch user profile on app start
//   useEffect(() => {
//     const initializeUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (token) {
//           const response = await api.getUserProfile();
//           if (response.success && response.data) {
//             setUser(response.data);
//           } else {
//             // Token might be invalid or expired
//             await logout();
//           }
//         }
//       } catch (error) {
//         console.error('Initialization Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeUser();
//   }, []);

//   /**
//    * Login Function
//    * @param {string} email
//    * @param {string} password
//    */
//   const login = async (email, password) => {
//     try {
//       const response = await api.loginUser(email, password);
//       if (response.success && response.data.token) {
//         const profileResponse = await api.getUserProfile();
//         if (profileResponse.success && profileResponse.data) {
//           setUser(profileResponse.data);
//           return { success: true };
//         } else {
//           throw new Error(profileResponse.message || 'Failed to fetch user profile.');
//         }
//       } else {
//         return { success: false, message: response.message || 'Login failed.' };
//       }
//     } catch (error) {
//       console.error('Login Error:', error);
//       return { success: false, message: error.message || 'Login failed.' };
//     }
//   };
//   const register = async (userData) => {
//     try {
//       const response = await api.registerUser(userData);
//       if (response.success && response.data.token) {
//         const profileResponse = await api.getUserProfile();
//         if (profileResponse.success && profileResponse.data) {
//           setUser(profileResponse.data);
//           return { success: true };
//         } else {
//           throw new Error(profileResponse.message || 'Failed to fetch user profile.');
//         }
//       } else {
//         return { success: false, message: response.message || 'Login failed.' };
//       }
//     } catch (error) {
//       console.error('Login Error:', error);
//       return { success: false, message: error.message || 'Login failed.' };
//     }
//   };

//   // const update = async (updatedData) => {
//   //   try {
//   //     const response = await api.updateUserProfile(updatedData);
//   //     if (response.success && response.data.data) {
//   //       const profileResponse = await api.getUserProfile();
//   //       if (profileResponse.success && profileResponse.data) {
//   //         setUser(profileResponse.data);
//   //         return { success: true };
//   //       } else {
//   //         throw new Error(profileResponse.message || 'Failed to fetch user profile.');
//   //       }
//   //     } else {
//   //       return { success: false, message: response.message || 'Login failed.' };
//   //     }
//   //   } catch (error) {
//   //     console.error('Login Error:', error);
//   //     return { success: false, message: error.message || 'Login failed.' };
//   //   }
//   // };
//   /**
//    * Logout Function
//    */
//   const logout = async () => {
//     try {
//       const response = await logoutUser(); // Removes token from AsyncStorage
//       // console.log(response);
      
//       // setUser(null);
//       return response;
//     } catch (error) {
//       console.error('Logout Error:', error);
//       Alert.alert('Error', 'Failed to logout. Please try again.');
//     }
//   };

//   return (
//     <UserContext.Provider value={{ user, setUser, login, logout, loading, register }}>
//       {children}
//     </UserContext.Provider>
//   );
// };










// // src/contexts/UserContext.js

// import React, { createContext, useState, useEffect } from 'react';
// import { Alert } from 'react-native';
// import api from '../services/api'; // Ensure the path is correct
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { logoutUser } from '../services/api'; // Import logout function

// export const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   // State to hold user data
//   const [user, setUser] = useState(null);

//   // State to manage loading status
//   const [loading, setLoading] = useState(true);

//   // Fetch user profile on app start
//   useEffect(() => {
//     const initializeUser = async () => {
//       try {
//         const token = await AsyncStorage.getItem('token');
//         if (token) {
//           const response = await api.getUserProfile();
//           if (response.success && response.data) {
//             setUser(response.data);
//           } else {
//             // Token might be invalid or expired
//             // await logout();
//           }
//         }
//       } catch (error) {
//         console.error('Initialization Error:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     initializeUser();
//   }, []);


//   return (
//     <UserContext.Provider value={{ user, setUser,loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };
