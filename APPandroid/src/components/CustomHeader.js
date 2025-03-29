// src/components/CustomHeader.js
import React, { useContext } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../ThemeContext';
import { CartContext } from '../contexts/CartContext';
import { lightTheme, darkTheme } from '../../themes';
import { LinearGradient } from 'expo-linear-gradient';
import { UserContext } from '../contexts/UserContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const CustomHeader = ({ userProfileImage = DEFAULT_PROFILE_IMAGE, username = 'John Doe' }) => {
  const { width } = useWindowDimensions();
  // Calculate a scale factor similar to your other screens
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;
  const styles = createStyles(scale);

  const { theme } = useContext(ThemeContext);
  const { cartItems } = useContext(CartContext);
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const profileImageSize = width < 375 ? scale(50) : scale(45);

  return (
    <LinearGradient
      colors={currentTheme.headerBackground}
      style={[
        styles.headerContainer,
        {
          paddingTop: insets.top + scale(10),
          paddingHorizontal: width < 380 ? scale(15) : scale(20),
        },
      ]}
      start={[0, 0]}
      end={[0, 1]}
    >
      {/* User Info */}
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => navigation.navigate('UserProfile')}
        accessibilityLabel="Go to Profile"
        accessibilityRole="button"
      >
        <Image
          source={{ uri: user?.profileImage || DEFAULT_PROFILE_IMAGE }}
          style={[
            styles.profileImage,
            {
              width: profileImageSize,
              height: profileImageSize,
              borderRadius: profileImageSize / 2,
              borderColor: currentTheme.borderColor,
              backgroundColor: currentTheme.backgroundColor,
            },
          ]}
          accessibilityLabel={`${username}'s profile picture`}
        />
        <Text
          style={[
            styles.username,
            { color: currentTheme.headerTextColor, fontSize: width < 380 ? scale(16) : scale(20) },
          ]}
        >
          {user?.name || 'John Doe'}
        </Text>
      </TouchableOpacity>

      {/* Right Buttons */}
      <View style={styles.rightButtonsContainer}>
        {/* Cart Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('CartPage')}
          accessibilityLabel="Go to Cart"
          accessibilityRole="button"
        >
          <Ionicons name="cart-outline" size={scale(24)} color={currentTheme.headerTextColor} />
          {cartItems.length > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: currentTheme.saleTagBackgroundColor }]}>
              <Text style={[styles.cartBadgeText, { color: currentTheme.buttonTextColor }]}>{cartItems.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Menu Button */}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Open Menu"
          accessibilityRole="button"
        >
          <Ionicons name="menu-outline" size={scale(24)} color={currentTheme.headerTextColor} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const createStyles = (scale) =>
  StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Platform.OS === 'ios' ? scale(15) : scale(10),
      borderBottomLeftRadius: scale(20),
      borderBottomRightRadius: scale(20),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.3,
      shadowRadius: scale(4),
      elevation: scale(5),
      marginBottom: scale(10),
    },
    userInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    username: {
      marginLeft: scale(12),
      fontWeight: '600',
    },
    profileImage: {
      borderWidth: scale(2),
    },
    rightButtonsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: {
      paddingHorizontal: scale(8),
      paddingVertical: scale(8),
      marginLeft: scale(15),
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: scale(8),
    },
    cartBadge: {
      position: 'absolute',
      right: -scale(2),
      top: -scale(2),
      width: scale(18),
      height: scale(18),
      borderRadius: scale(9),
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartBadgeText: {
      fontSize: scale(10),
      fontWeight: 'bold',
    },
  });

export default CustomHeader;





// // src/components/CustomHeader.js
// import React, { useContext } from 'react';
// import {
//   View,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   Platform,
//   useWindowDimensions,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { CartContext } from '../contexts/CartContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { LinearGradient } from 'expo-linear-gradient';
// import { UserContext } from '../contexts/UserContext';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// const CustomHeader = ({ userProfileImage = DEFAULT_PROFILE_IMAGE, username = 'John Doe' }) => {
//   const { width } = useWindowDimensions();
//   const { theme } = useContext(ThemeContext);
//   const { cartItems } = useContext(CartContext);
//   const { user } = useContext(UserContext);
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();

//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const profileImageSize = width < 380 ? 38 : 45; // Adjust profile image size based on screen width

//   return (
//     <LinearGradient
//       colors={currentTheme.headerBackground}
//       style={[
//         styles.headerContainer,
//         {
//           paddingTop: insets.top + 10,
//           paddingHorizontal: width < 380 ? 15 : 20,
//         },
//       ]}
//       start={[0, 0]}
//       end={[0, 1]}
//     >
//       {/* User Info */}
//       <TouchableOpacity
//         style={styles.userInfoContainer}
//         onPress={() => navigation.navigate('UserProfile')}
//         accessibilityLabel="Go to Profile"
//         accessibilityRole="button"
//       >
//         <Image
//           source={{ uri: user?.profileImage || DEFAULT_PROFILE_IMAGE }}
//           style={[
//             styles.profileImage,
//             {
//               width: profileImageSize,
//               height: profileImageSize,
//               borderRadius: profileImageSize / 2,
//               borderColor: currentTheme.borderColor,
//               backgroundColor: currentTheme.backgroundColor,
//             },
//           ]}
//           accessibilityLabel={`${username}'s profile picture`}
//         />
//         <Text
//           style={[
//             styles.username,
//             { color: currentTheme.headerTextColor, fontSize: width < 380 ? 16 : 20 },
//           ]}
//         >
//           {user?.name || 'John Doe'}
//         </Text>
//       </TouchableOpacity>

//       {/* Right Buttons */}
//       <View style={styles.rightButtonsContainer}>
//         {/* Cart Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.navigate('CartPage')}
//           accessibilityLabel="Go to Cart"
//           accessibilityRole="button"
//         >
//           <Ionicons name="cart-outline" size={24} color={currentTheme.headerTextColor} />
//           {cartItems.length > 0 && (
//             <View style={[styles.cartBadge, { backgroundColor: currentTheme.saleTagBackgroundColor }]}>
//               <Text style={[styles.cartBadgeText, { color: currentTheme.buttonTextColor }]}>{cartItems.length}</Text>
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* Menu Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.navigate('Settings')}
//           accessibilityLabel="Open Menu"
//           accessibilityRole="button"
//         >
//           <Ionicons name="menu-outline" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//       </View>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: Platform.OS === 'ios' ? 15 : 10,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//     marginBottom: 10,
//   },
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   username: {
//     marginLeft: 12,
//     fontWeight: '600',
//   },
//   profileImage: {
//     borderWidth: 2,
//     // backgroundColor: '#fff',
//   },
//   rightButtonsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     marginLeft: 15,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 8,
//   },
//   cartBadge: {
//     position: 'absolute',
//     right: -2,
//     top: -2,
//     // backgroundColor: '#E53935',
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cartBadgeText: {
//     // color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });

// export default CustomHeader;







// import React, { useContext } from 'react';
// import {
//   View,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   Platform,
//   Dimensions
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { CartContext } from '../contexts/CartContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { LinearGradient } from 'expo-linear-gradient';
// import { UserContext } from '../contexts/UserContext';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const { width } = Dimensions.get('window');

// const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// const CustomHeader = ({ userProfileImage = DEFAULT_PROFILE_IMAGE, username = 'John Doe' }) => {
//   const { theme } = useContext(ThemeContext);
//   const { cartItems } = useContext(CartContext);
//   const { user } = useContext(UserContext);
//   const navigation = useNavigation();
//   const insets = useSafeAreaInsets();

//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const profileImageSize = width < 380 ? 38 : 45; // Adjust profile image size based on screen width

//   return (
//     <LinearGradient
//       colors={currentTheme.headerBackground}
//       style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}
//       start={[0, 0]}
//       end={[0, 1]}
//     >
//       {/* User Info */}
//       <TouchableOpacity
//         style={styles.userInfoContainer}
//         onPress={() => navigation.navigate('UserProfile')}
//         accessibilityLabel="Go to Profile"
//         accessibilityRole="button"
//       >
//         <Image
//           source={{ uri: user?.profileImage || DEFAULT_PROFILE_IMAGE }}
//           style={[
//             styles.profileImage,
//             { 
//               width: profileImageSize, 
//               height: profileImageSize, 
//               borderRadius: profileImageSize / 2,
//               borderColor: currentTheme.borderColor 
//             }
//           ]}
//           accessibilityLabel={`${username}'s profile picture`}
//         />
//         <Text style={[styles.username, { color: currentTheme.headerTextColor, fontSize: width < 380 ? 16 : 20 }]}>
//           {user?.name || 'John Doe'}
//         </Text>
//       </TouchableOpacity>

//       {/* Right Buttons */}
//       <View style={styles.rightButtonsContainer}>
//         {/* Cart Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.navigate('CartPage')}
//           accessibilityLabel="Go to Cart"
//           accessibilityRole="button"
//         >
//           <Ionicons name="cart-outline" size={24} color={currentTheme.headerTextColor} />
//           {cartItems.length > 0 && (
//             <View style={styles.cartBadge}>
//               <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* Menu Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.navigate('Settings')}
//           accessibilityLabel="Open Menu"
//           accessibilityRole="button"
//         >
//           <Ionicons name="menu-outline" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//       </View>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: width < 380 ? 15 : 20,
//     paddingVertical: Platform.OS === 'ios' ? 15 : 10,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//     marginBottom: 10,
//   },
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   username: {
//     marginLeft: 12,
//     fontWeight: '600',
//   },
//   profileImage: {
//     borderWidth: 2,
//     backgroundColor: '#fff',
//   },
//   rightButtonsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     marginLeft: 15,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 8,
//   },
//   cartBadge: {
//     position: 'absolute',
//     right: -2,
//     top: -2,
//     backgroundColor: '#E53935',
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cartBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });

// export default CustomHeader;








// // components/CustomHeader.js

// import React, { useContext } from 'react';
// import { View, Image, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { CartContext } from '../contexts/CartContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { LinearGradient } from 'expo-linear-gradient';
// import { UserContext } from '../contexts/UserContext';

// const DEFAULT_PROFILE_IMAGE = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

// const CustomHeader = ({ userProfileImage = DEFAULT_PROFILE_IMAGE, username = 'John Doe' }) => {
//   const { theme } = useContext(ThemeContext);
//   const { cartItems } = useContext(CartContext);
//   const navigation = useNavigation();
//   const { user } = useContext(UserContext);

//   // console.log("userheader:", user);
  
  
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   return (
//     <LinearGradient
//       colors={currentTheme.headerBackground}
//       style={styles.headerContainer}
//       start={[0, 1]}
//       end={[0, 0]}
//     >
//       {/* User Info */}
//       <TouchableOpacity
//         style={styles.userInfoContainer}
//         onPress={() => navigation.navigate('UserProfile')}
//         accessibilityLabel="Go to Profile"
//         accessibilityRole="button"
//       >
//         <Image
//           source={{ uri: user.profileImage || DEFAULT_PROFILE_IMAGE }}
//           style={[styles.profileImage, { borderColor: currentTheme.borderColor }]}
//           accessibilityLabel={`${username}'s profile picture`}
//           onError={(e) => {
//             console.log(`Failed to load profile image for ${username}:`, e.nativeEvent.error);
//           }}
//         />
//         <Text style={[styles.username, { color: currentTheme.headerTextColor }]}>
//           {user.name}
//         </Text>
//       </TouchableOpacity>

//       {/* Right Buttons */}
//       <View style={styles.rightButtonsContainer}>
//         {/* Cart Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.navigate('CartPage')}
//           accessibilityLabel="Go to Cart"
//           accessibilityRole="button"
//         >
//           <Ionicons name="cart-outline" size={24} color={currentTheme.headerTextColor} />
//           {cartItems.length > 0 && (
//             <View style={styles.cartBadge}>
//               <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* Hamburger Menu Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.navigate('Settings')}
//           accessibilityLabel="Open Menu"
//           accessibilityRole="button"
//         >
//           <Ionicons name="menu-outline" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//       </View>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     paddingVertical: Platform.OS === 'ios' ? 25 : 20,
//     borderBottomLeftRadius: 20,
//     borderBottomRightRadius: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     elevation: 5,
//     marginBottom: 10,
//   },
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   username: {
//     fontSize: 20,
//     marginLeft: 12,
//     fontWeight: '600',
//   },
//   profileImage: {
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     borderWidth: 2,
//     backgroundColor: '#fff',
//   },
//   rightButtonsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     paddingHorizontal: 8,
//     paddingVertical: 8,
//     marginLeft: 15,
//     backgroundColor: 'rgba(255,255,255,0.2)',
//     borderRadius: 8,
//   },
//   cartBadge: {
//     position: 'absolute',
//     right: -2,
//     top: -2,
//     backgroundColor: '#E53935',
//     width: 18,
//     height: 18,
//     borderRadius: 9,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cartBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });

// export default CustomHeader;









// // components/CustomHeader.js

// import React, { useContext } from 'react';
// import { View, Image, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { CartContext } from '../contexts/CartContext'; // Ensure correct path
// import { lightTheme, darkTheme } from '../../themes';
// import { LinearGradient } from 'expo-linear-gradient';
// import { UserContext } from '../contexts/UserContext';

// const DEFAULT_PROFILE_IMAGE = 'https://w7.pngwing.com/pngs/684/806/png-transparent-user-avatar-enter-photo-placeholder.png';

// const CustomHeader = ({ userProfileImage = DEFAULT_PROFILE_IMAGE, username = 'John Doe' }) => {
//   const { theme } = useContext(ThemeContext);
//   const { cartItems } = useContext(CartContext);
//   const navigation = useNavigation();
//   const { user } = useContext(UserContext);
//   ;
  

//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   return (
//     <LinearGradient
//       colors={currentTheme.headerBackground}
//       style={styles.headerContainer}
//       start={[0, 1]}
//       end={[0, 0]}
//     >
//       {/* User Info */}
//       <TouchableOpacity
//         style={styles.userInfoContainer}
//         onPress={() => navigation.navigate('UserProfile')}
//         accessibilityLabel="Go to Profile"
//         accessibilityRole="button"
//       >
//         <Image
//           source={{ uri: user.profileImage || DEFAULT_PROFILE_IMAGE }}
//           style={[
//             styles.profileImage,
//             { borderColor: currentTheme.borderColor },
//           ]}
//           accessibilityLabel={`${username}'s profile picture`}
//           onError={(e) => {
//             console.log(`Failed to load profile image for ${username}:`, e.nativeEvent.error);
//           }}
//         />
//         <Text style={[styles.username, { color: currentTheme.headerTextColor }]}>
//           {user.name}
//         </Text>
//       </TouchableOpacity>

//       {/* Right Buttons */}
//       <View style={styles.rightButtonsContainer}>
//         {/* Cart Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.navigate('CartPage')}
//           accessibilityLabel="Go to Cart"
//           accessibilityRole="button"
//         >
//           <Ionicons name="cart-outline" size={24} color={currentTheme.headerTextColor} />
//           {cartItems.length > 0 && (
//             <View style={styles.cartBadge}>
//               <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
//             </View>
//           )}
//         </TouchableOpacity>

//         {/* Settings Button */}
//         <TouchableOpacity
//           style={styles.iconButton}
//           onPress={() => navigation.navigate('Settings')}
//           accessibilityLabel="Go to Settings"
//           accessibilityRole="button"
//         >
//           <Ionicons name="settings-outline" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//       </View>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//     paddingVertical: Platform.OS === 'ios' ? 20 : 15,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 1, 
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   username: {
//     fontSize: 18,
//     marginLeft: 10,
//     fontWeight: 'bold',
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 2,
//     backgroundColor: '#ccc', // Placeholder background color
//   },
//   rightButtonsContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   iconButton: {
//     paddingHorizontal: 5,
//     paddingVertical: 5,
//     marginLeft: 15,
//     position: 'relative',
//   },
//   cartBadge: {
//     position: 'absolute',
//     right: -2,
//     top: -2,
//     backgroundColor: '#E53935',
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cartBadgeText: {
//     color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });

// export default CustomHeader;




// // components/CustomHeader.js

// import React, { useRef, useContext } from 'react';
// import {
//   View,
//   TouchableWithoutFeedback,
//   Image,
//   StyleSheet,
//   Animated,
//   Text,
//   Platform,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { LinearGradient } from 'expo-linear-gradient';

// const DEFAULT_PROFILE_IMAGE = 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg';

// const CustomHeader = ({ userProfileImage = DEFAULT_PROFILE_IMAGE, username = 'User' }) => {
//   const navigation = useNavigation();

//   // Animation refs
//   const scaleAnim = useRef(new Animated.Value(1)).current; // For scaling
//   const rotateAnim = useRef(new Animated.Value(0)).current; // For rotation
//   const colorAnim = useRef(new Animated.Value(0)).current; // For color interpolation

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Interpolate rotation from 0deg to -20deg on press
//   const rotateInterpolate = rotateAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '-20deg'],
//   });

//   // Interpolate color from arrowColor to secondaryColor on press
//   const colorInterpolate = colorAnim.interpolate({
//     inputRange: [0, 1],
//     outputRange: [currentTheme.arrowColor, currentTheme.secondaryColor],
//   });

//   const handlePressIn = () => {
//     // Animate to pressed state
//     Animated.parallel([
//       Animated.spring(scaleAnim, {
//         toValue: 0.9,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//       Animated.timing(rotateAnim, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(colorAnim, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: false, // Color interpolation doesn't support native driver
//       }),
//     ]).start();
//   };

//   const handlePressOut = () => {
//     // Animate back to original state
//     Animated.parallel([
//       Animated.spring(scaleAnim, {
//         toValue: 1,
//         friction: 4,
//         useNativeDriver: true,
//       }),
//       Animated.timing(rotateAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(colorAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: false,
//       }),
//     ]).start(() => {
//       navigation.goBack();
//     });
//   };

//   return (
//     <LinearGradient
//       colors={currentTheme.headerBackground}
//       style={styles.headerContainer}
//       start={[0, 0]}
//       end={[1, 0]}
//     >
//       {/* Back Button with Enhanced Animation */}
//       <TouchableWithoutFeedback
//         onPressIn={handlePressIn}
//         onPressOut={handlePressOut}
//         accessibilityLabel="Go Back"
//         accessibilityRole="button"
//       >
//         <Animated.View
//           style={[
//             styles.backButton,
//             {
//               transform: [{ scale: scaleAnim }, { rotate: rotateInterpolate }],
//             },
//           ]}
//         >
//           <AnimatedIonicons name="arrow-back" size={24} color={colorInterpolate} />
//         </Animated.View>
//       </TouchableWithoutFeedback>

//       {/* User Info */}
//       <View style={styles.userInfoContainer}>
//         <Text style={[styles.username, { color: currentTheme.headerTextColor }]}>
//           {username}
//         </Text>
//         <Image
//           source={{ uri: userProfileImage }}
//           style={[
//             styles.profileImage,
//             { borderColor: currentTheme.borderColor },
//           ]}
//           accessibilityLabel={`${username}'s profile picture`}
//           onError={(e) => {
//             console.log(`Failed to load profile image for ${username}: `, e.nativeEvent.error);
//             // Optionally, set a default image or handle the error as needed
//           }}
//         />
//       </View>
//     </LinearGradient>
//   );
// };

// // Custom Animated Ionicons component to handle color interpolation
// const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

// const styles = StyleSheet.create({
//   headerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingHorizontal: 15,
//     paddingVertical: Platform.OS === 'ios' ? 40 : 15, // Adjust for status bar
//     // Shadow for iOS
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     // Elevation for Android
//     elevation: 5,
//   },
//   backButton: {
//     padding: 10,
//     borderRadius: 20,
//     // Optional: Add background color or ripple effect
//     // backgroundColor: 'rgba(255,255,255,0.2)',
//   },
//   userInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   username: {
//     fontSize: 16,
//     marginRight: 10,
//     fontWeight: '600',
//   },
//   profileImage: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 2,
//     backgroundColor: '#ccc', // Placeholder background color
//   },
// });

// export default CustomHeader;
