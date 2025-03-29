// src/navigation/AppNavigator.js
import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Provider as PaperProvider } from 'react-native-paper';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import OtpScreen from '../screens/OtpScreen';
import NewPasswordScreen from '../screens/NewPasswordScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import MarketPage from '../screens/MarketPage';
import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import ProductPage from '../screens/ProductPage';
import CartPage from '../screens/CartPage';
import FavouritesPage from '../screens/FavouritesPage';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import AICoursesScreen from '../screens/AICoursesScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import MyEnrollmentsScreen from '../screens/MyEnrollmentsScreen';
import PurchaseScreen from '../screens/PurchaseScreen';
import EnrolledCourseScreen from '../screens/EnrolledCourseScreen';
import MyReviewsScreen from '../screens/MyReviewsScreen';

// Context
import { ThemeProvider, ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { FavouritesContext, FavouritesProvider } from '../contexts/FavouritesContext';
import { UserContext, UserProvider } from '../contexts/UserContext';

// Create Navigators
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const MarketStack = createStackNavigator();
const FavouritesStack = createStackNavigator();

// Favourites stack
const FavouritesStackScreen = () => (
  <FavouritesStack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    }}
  >
    <FavouritesStack.Screen name="Favourites2" component={FavouritesPage} />
    <FavouritesStack.Screen name="ProductPage" component={ProductPage} />
    <FavouritesStack.Screen name="CartPageF" component={CartPage} />
    <FavouritesStack.Screen name="Settings" component={SettingsScreen} />
  </FavouritesStack.Navigator>
);

// Combine Market & AI Courses & etc. into one stack
const CombinedStack = createStackNavigator();
const CombinedStackScreen = ({ route }) => {
  // If you want to accept initial route from route.params
  const initialScreen = route.params?.screen || 'MarketHome';
  return (
    <CombinedStack.Navigator
      key={initialScreen}
      initialRouteName={initialScreen}
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
    >
      {/* Market Screens */}
      <CombinedStack.Screen name="MarketHome" component={MarketPage} />
      <CombinedStack.Screen name="ProductPage" component={ProductPage} />
      <CombinedStack.Screen name="CartPage" component={CartPage} />
      <CombinedStack.Screen name="Settings" component={SettingsScreen} />
      <CombinedStack.Screen name="ChangePassword" component={ChangePasswordScreen} />

      {/* AI Courses Screens */}
      <CombinedStack.Screen name="AICoursesHome" component={AICoursesScreen} />
      <CombinedStack.Screen name="CourseDetailScreen" component={CourseDetailScreen} />
      <CombinedStack.Screen name="PurchaseScreen" component={PurchaseScreen} />
      <CombinedStack.Screen name="MyEnrollmentsScreen" component={MyEnrollmentsScreen} />
      <CombinedStack.Screen name="EnrolledCourseScreen" component={EnrolledCourseScreen} />
      {<CombinedStack.Screen name="MyReviewsScreen" component={MyReviewsScreen} />}
        
    </CombinedStack.Navigator>
  );
};

// Custom TabBar
function CustomTabBar({ state, descriptors, navigation }) {
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const { favouriteItems } = useContext(FavouritesContext);

  // 1) We define scale logic
  const { width } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // 2) We create memoized styles for the tab bar
  const styles = useMemo(() => {
    return {
      tabBarContainer: {
        position: 'absolute',
        bottom: scale(20),
        left: scale(20),
        right: scale(20),
        height: scale(60),
        borderRadius: scale(30),
        backgroundColor: currentTheme.cardBackground,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: scale(5),
        shadowOffset: { width: 0, height: scale(4) },
        paddingHorizontal: scale(15),
      },
      iconWrapper: {
        alignItems: 'center',
        marginHorizontal: scale(6),
        paddingVertical: scale(4),
      },
      iconLabel: {
        fontSize: scale(8),
        marginTop: scale(2),
      },
      badgeContainer: {
        position: 'absolute',
        right: scale(-2),
        top: scale(-3),
        borderRadius: scale(8),
        width: scale(16),
        height: scale(16),
        justifyContent: 'center',
        alignItems: 'center',
      },
      badgeText: {
        fontSize: scale(10),
        fontWeight: 'bold',
      },
    };
  }, [scaleFactor, currentTheme]);

  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = route.name;
        const isFocused = state.index === index;
        const color = isFocused
          ? currentTheme.tabBarActiveTintColor
          : currentTheme.tabBarInactiveTintColor;

        let iconName;
        let useMaterialIcons = false;
        if (label === 'Favourites') {
          iconName = isFocused ? 'heart' : 'heart-outline';
        } else if (label === 'PurchaseHistory') {
          useMaterialIcons = true;
          iconName = 'history';
        } else if (label === 'Market') {
          iconName = isFocused ? 'storefront' : 'storefront-outline';
        } else if (label === 'AICourses') {
          iconName = isFocused ? 'school' : 'school-outline';
        } else if (label === 'UserProfile') {
          iconName = isFocused ? 'person' : 'person-outline';
        } else if (label === 'Help') {
          iconName = isFocused ? 'help-circle' : 'help-circle-outline';
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.iconWrapper}
            activeOpacity={0.7}
          >
            {useMaterialIcons ? (
              <MaterialIcons name={iconName} size={scale(22)} color={color} />
            ) : (
              <Ionicons name={iconName} size={scale(22)} color={color} />
            )}
            {/* Badge for favourites */}
            {label === 'Favourites' && favouriteItems.length > 0 && (
              <View
                style={[
                  styles.badgeContainer,
                  { backgroundColor: currentTheme.saleTagBackgroundColor },
                ]}
              >
                <Text style={[styles.badgeText, { color: currentTheme.buttonTextColor }]}>
                  {favouriteItems.length}
                </Text>
              </View>
            )}
            <Text style={[styles.iconLabel, { color }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Main Tab Nav
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Market"
      // screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true, // Hides the tab bar when keyboard appears
      }}
    >
      <Tab.Screen name="Favourites" component={FavouritesStackScreen} />
      <Tab.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
      <Tab.Screen
        name="Market"
        component={CombinedStackScreen}
        initialParams={{ screen: 'MarketHome' }}
      />
      <Tab.Screen
        name="AICourses"
        component={CombinedStackScreen}
        initialParams={{ screen: 'AICoursesHome' }}
      />
      <Tab.Screen name="UserProfile" component={UserProfileScreen} />
      <Tab.Screen name="Help" component={HelpScreen} />
    </Tab.Navigator>
  );
};

// Auth Stack
const AuthStackScreen = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="Otp" component={OtpScreen} />
    <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
  </Stack.Navigator>
);

// App Stack
const AppStackScreen = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Main" component={MainTabNavigator} />
  </Stack.Navigator>
);

// Root Navigator
const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(UserContext);

  if (loading) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C3483" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <PaperProvider>
        <FavouritesProvider>
          <NavigationContainer theme={NavigationDefaultTheme}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                <Stack.Screen name="AppStack" component={AppStackScreen} />
              ) : (
                <Stack.Screen name="AuthStack" component={AuthStackScreen} />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </FavouritesProvider>
      </PaperProvider>
    </ThemeProvider>
  );
};

export default AppNavigator;

// Local styles
const localStyles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});











// // src/navigation/AppNavigator.js

// import React, { useContext } from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity,
//   useWindowDimensions,
// } from 'react-native';
// import {
//   NavigationContainer,
//   DefaultTheme as NavigationDefaultTheme,
// } from '@react-navigation/native';
// import {
//   createStackNavigator,
//   CardStyleInterpolators,
// } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Provider as PaperProvider } from 'react-native-paper';

// // Screens
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// import OtpScreen from '../screens/OtpScreen';
// import NewPasswordScreen from '../screens/NewPasswordScreen';
// import UserProfileScreen from '../screens/UserProfileScreen';
// import MarketPage from '../screens/MarketPage';
// import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import HelpScreen from '../screens/HelpScreen';
// import ProductPage from '../screens/ProductPage';
// import CartPage from '../screens/CartPage';
// import FavouritesPage from '../screens/FavouritesPage';
// import ChangePasswordScreen from '../screens/ChangePasswordScreen';

// // AI Courses screens
// import AICoursesScreen from '../screens/AICoursesScreen';
// import CourseDetailScreen from '../screens/CourseDetailScreen';
// // import EnrollmentScreen from '../screens/EnrollmentScreen';
// import MyEnrollmentsScreen from '../screens/MyEnrollmentsScreen'; 
// import PurchaseScreen from '../screens/PurchaseScreen';
// import EnrolledCourseScreen from '../screens/EnrolledCourseScreen';
// // ^-- Make sure you have this screen in your project

// // Context
// import { ThemeProvider, ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import {
//   FavouritesContext,
//   FavouritesProvider,
// } from '../contexts/FavouritesContext';
// import { UserContext, UserProvider } from '../contexts/UserContext';

// // Create Navigators
// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();
// const MarketStack = createStackNavigator();
// const FavouritesStack = createStackNavigator();

// // ----------------------- Market Stack ----------------------- //
// // const MarketStackScreen = () => (
// //   <MarketStack.Navigator
// //     screenOptions={{
// //       headerShown: false,
// //       cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
// //     }}
// //   >
// //     <MarketStack.Screen name="MarketHome" component={MarketPage} />
// //     <MarketStack.Screen name="ProductPage" component={ProductPage} />
// //     <MarketStack.Screen name="CartPage" component={CartPage} />
// //     <MarketStack.Screen name="Settings" component={SettingsScreen} />
// //     <MarketStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
// //   </MarketStack.Navigator>
// // );

// // ----------------------- Favourites Stack ----------------------- //
// const FavouritesStackScreen = () => (
//   <FavouritesStack.Navigator
//     screenOptions={{
//       headerShown: false,
//       cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
//     }}
//   >
//     <FavouritesStack.Screen name="Favourites2" component={FavouritesPage} />
//     <FavouritesStack.Screen name="ProductPage" component={ProductPage} />
//     <FavouritesStack.Screen name="CartPageF" component={CartPage} />
//     <FavouritesStack.Screen name="Settings" component={SettingsScreen} />
//   </FavouritesStack.Navigator>
// );

// // ----------------------- AI Courses Stack ----------------------- //
// //
// // Put AICoursesScreen, CourseDetailScreen, EnrollmentScreen, 
// // and MyEnrollmentsScreen in the SAME stack so the tab bar remains visible.
// // const AICoursesStack = createStackNavigator();
// // const AICoursesStackScreen = () => (
// //   <AICoursesStack.Navigator
// //     screenOptions={{
// //       headerShown: false,
// //       cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
// //     }}
// //   >
// //     <AICoursesStack.Screen name="AICoursesHome" component={AICoursesScreen} />
// //     <AICoursesStack.Screen name="CourseDetailScreen" component={CourseDetailScreen} />
// //     <AICoursesStack.Screen name="PurchaseScreen" component={PurchaseScreen} />
// //     {/* <AICoursesStack.Screen name="EnrollmentScreen" component={EnrollmentScreen} /> */}
// //     <AICoursesStack.Screen name="MyEnrollmentsScreen" component={MyEnrollmentsScreen} />
// //     <AICoursesStack.Screen name="EnrolledCourseScreen" component={EnrolledCourseScreen} />
// //   </AICoursesStack.Navigator>
// // );
// // Create a new CombinedStack
// const CombinedStack = createStackNavigator();

// const CombinedStackScreen = ({ route }) => {
//   // Read the desired initial screen from route.params,
//   // defaulting to 'MarketHome' if not provided.
//   const initialScreen = route.params?.screen || 'MarketHome';

//   return (
//     <CombinedStack.Navigator
//       // Setting a key forces the navigator to reinitialize when initialScreen changes.
//       key={initialScreen}
//       initialRouteName={initialScreen}
//       screenOptions={{
//         headerShown: false,
//         cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
//       }}
//     >
//       {/* Market Screens */}
//       <CombinedStack.Screen name="MarketHome" component={MarketPage} />
//       <CombinedStack.Screen name="ProductPage" component={ProductPage} />
//       <CombinedStack.Screen name="CartPage" component={CartPage} />
//       <CombinedStack.Screen name="Settings" component={SettingsScreen} />
//       <CombinedStack.Screen name="ChangePassword" component={ChangePasswordScreen} />

//       {/* AI Courses Screens */}
//       <CombinedStack.Screen name="AICoursesHome" component={AICoursesScreen} />
//       <CombinedStack.Screen name="CourseDetailScreen" component={CourseDetailScreen} />
//       <CombinedStack.Screen name="PurchaseScreen" component={PurchaseScreen} />
//       <CombinedStack.Screen name="MyEnrollmentsScreen" component={MyEnrollmentsScreen} />
//       <CombinedStack.Screen name="EnrolledCourseScreen" component={EnrolledCourseScreen} />
//     </CombinedStack.Navigator>
//   );
// };

// // ----------------------- Custom Tab Bar ----------------------- //
// function CustomTabBar({ state, descriptors, navigation }) {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const { favouriteItems } = useContext(FavouritesContext);

//   const { width } = useWindowDimensions();
//   const tabBarContainerStyle = {
//     position: 'absolute',
//     bottom: 20,
//     left: width * 0.05,
//     right: width * 0.05,
//     height: width > 400 ? 70 : 60,
//     borderRadius: width > 400 ? 35 : 30,
//     backgroundColor: currentTheme.cardBackground,
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 4 },
//     paddingHorizontal: width > 400 ? 20 : 15,
//   };

//     const styles = {
//     iconWrapper: {
//       alignItems: 'center',
//       marginHorizontal: width > 400 ? 8 : 6,
//       paddingVertical: width > 400 ? 6 : 4,
//     },
//     iconLabel: {
//       fontSize: width > 400 ? 8 : 8,
//       marginTop: 2,
//     },
//     badge: {
//       position: 'absolute',
//       right: width > 400 ? -2 : 0,
//       top: width > 400 ? -4 : -3,
//       borderRadius: width > 400 ? 10 : 8,
//       width: width > 400 ? 18 : 16,
//       height: width > 400 ? 18 : 16,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//   };
  

//   return (
//     <View style={tabBarContainerStyle}>
//       {state.routes.map((route, index) => {
//         const { options } = descriptors[route.key];
//         const label = route.name;
//         const isFocused = state.index === index;

//         const color = isFocused
//           ? currentTheme.tabBarActiveTintColor
//           : currentTheme.tabBarInactiveTintColor;

//         let iconName;
//         let useMaterialIcons = false;

//         if (label === 'Favourites') {
//           iconName = isFocused ? 'heart' : 'heart-outline';

//           // return (
//           //   <View style={{ width: 24, height: 24, margin: 5 }}>
//           //     <Ionicons name={iconName} size={20} color={color} />
//           //     {favouriteItems.length > 0 && (
//           //       <View style={[styles.badge, { backgroundColor: currentTheme.saleTagBackgroundColor }]}>
//           //         <Text style={[styles.badgeText,{color: currentTheme.buttonTextColor}]}>
//           //           {favouriteItems.length}
//           //         </Text>
//           //       </View>
//           //     )}
//           //   </View>
//           // );
//         } else if (label === 'PurchaseHistory') {
//           useMaterialIcons = true;
//           iconName = 'history';
//         } else if (label === 'Market') {
//           iconName = isFocused ? 'storefront' : 'storefront-outline';
//         } else if (label === 'AICourses') {
//           iconName = isFocused ? 'school' : 'school-outline';
//         } else if (label === 'UserProfile') {
//           iconName = isFocused ? 'person' : 'person-outline';
//         } else if (label === 'Help') {
//           iconName = isFocused ? 'help-circle' : 'help-circle-outline';
//         }

//         const onPress = () => {
//           const event = navigation.emit({
//             type: 'tabPress',
//             target: route.key,
//             canPreventDefault: true,
//           });
//           if (!event.defaultPrevented) {
//             navigation.navigate(route.name);
//           }
//         };

//         return (
//           <TouchableOpacity
//             key={route.key}
//             onPress={onPress}
//             style={styles.iconWrapper}
//             activeOpacity={0.7}
//           >
//             {useMaterialIcons ? (
//               <MaterialIcons name={iconName} size={22} color={color} />
//             ) : (
//               <Ionicons name={iconName} size={22} color={color} />
//             )}
//             {label === 'Favourites' && favouriteItems.length > 0 && (
//               <View style={[styles.badge, { backgroundColor: currentTheme.saleTagBackgroundColor }]}>
//                 <Text style={[styles.badgeText, { color: currentTheme.buttonTextColor }]}>
//                   {favouriteItems.length}
//                 </Text>
//               </View>
//             )}
//             <Text style={[styles.iconLabel, { color }]}>{label}</Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }

// // ----------------------- Main Tabs ----------------------- //
// // 
// // Replaced the direct component for "AICourses" with AICoursesStackScreen
// // so the bottom tab stays visible on all sub-screens.
// const MainTabNavigator = () => {
//   return (
//     <Tab.Navigator
//       initialRouteName="Market"
//       screenOptions={{ headerShown: false }}
//       tabBar={(props) => <CustomTabBar {...props} />}
//     >
//       <Tab.Screen name="Favourites" component={FavouritesStackScreen} />
//       <Tab.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
//       {/* For the Market tab, set the entry screen to MarketHome */}
//       <Tab.Screen
//         name="Market"
//         component={CombinedStackScreen}
//         initialParams={{ screen: 'MarketHome' }}
//       />

//       {/* For the AICourses tab, set the entry screen to AICoursesHome */}
//       <Tab.Screen
//         name="AICourses"
//         component={CombinedStackScreen}
//         initialParams={{ screen: 'AICoursesHome' }}
//       />
      
//       <Tab.Screen name="UserProfile" component={UserProfileScreen} />
//       <Tab.Screen name="Help" component={HelpScreen} />
//     </Tab.Navigator>
//   );
// };

// // ----------------------- Auth Stack Navigator ----------------------- //
// const AuthStackScreen = () => (
//   <Stack.Navigator
//     screenOptions={{
//       headerShown: false,
//       cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
//     }}
//   >
//     <Stack.Screen name="Login" component={LoginScreen} />
//     <Stack.Screen name="Register" component={RegisterScreen} />
//     <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//     <Stack.Screen name="Otp" component={OtpScreen} />
//     <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
//   </Stack.Navigator>
// );

// // ----------------------- App Stack Navigator ----------------------- //
// const AppStackScreen = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     {/* The main tab navigator */}
//     <Stack.Screen name="Main" component={MainTabNavigator} />
//     {/* 
//       Removed CourseDetailScreen, EnrollmentScreen from here so we can see the
//       tab bar on those screens (they're inside AICoursesStack now).
//     */}
//   </Stack.Navigator>
// );

// // ----------------------- Root App Navigator ----------------------- //
// const AppNavigator = () => {
//   const { isAuthenticated, loading } = useContext(UserContext);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#6C3483" />
//       </View>
//     );
//   }

//   return (

//     <ThemeProvider>
//       <PaperProvider>
//         <FavouritesProvider>
//           <NavigationContainer theme={NavigationDefaultTheme}>
//             <Stack.Navigator screenOptions={{ headerShown: false }}>
//               {isAuthenticated ? (
//                 <Stack.Screen name="AppStack" component={AppStackScreen} />
//               ) : (
//                 <Stack.Screen name="AuthStack" component={AuthStackScreen} />
//               )}
//             </Stack.Navigator>
//           </NavigationContainer>
//         </FavouritesProvider>
//       </PaperProvider>
//     </ThemeProvider>

//   );
// };

// export default AppNavigator;

// // ----------------------- Styles ----------------------- //
// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },

//   badgeText: {
//     // color: '#FFFFFF',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });











// // src/navigation/AppNavigator.js

// import React, { useContext } from 'react';
// import {
//   View,
//   Text,
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity,
// } from 'react-native';
// import {
//   NavigationContainer,
//   DefaultTheme as NavigationDefaultTheme,
// } from '@react-navigation/native';
// import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// // Screens
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// import OtpScreen from '../screens/OtpScreen';
// import NewPasswordScreen from '../screens/NewPasswordScreen';
// import UserProfileScreen from '../screens/UserProfileScreen';
// import MarketPage from '../screens/MarketPage';
// import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import HelpScreen from '../screens/HelpScreen';
// import ProductPage from '../screens/ProductPage';
// import CartPage from '../screens/CartPage';
// import FavouritesPage from '../screens/FavouritesPage';
// import ChangePasswordScreen from '../screens/ChangePasswordScreen';
// import AICoursesScreen from '../screens/AICoursesScreen';
// import CourseDetailScreen from '../screens/CourseDetailScreen';
// import EnrollmentScreen from '../screens/EnrollmentScreen';

// // Context
// import { ThemeProvider, ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext, FavouritesProvider } from '../contexts/FavouritesContext';
// import { UserContext, UserProvider } from '../contexts/UserContext';

// // Create Navigators
// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();
// const MarketStack = createStackNavigator();
// const FavouritesStack = createStackNavigator();

// // ----------------------- Market Stack ----------------------- //
// const MarketStackScreen = () => (
//   <MarketStack.Navigator
//     screenOptions={{
//       headerShown: false,
//       cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
//     }}
//   >
//     <MarketStack.Screen name="MarketHome" component={MarketPage} />
//     <MarketStack.Screen name="ProductPage" component={ProductPage} />
//     <MarketStack.Screen name="CartPage" component={CartPage} />
//     <MarketStack.Screen name="Settings" component={SettingsScreen} />
//     <MarketStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
//   </MarketStack.Navigator>
// );

// // ----------------------- Favourites Stack ----------------------- //
// const FavouritesStackScreen = () => (
//   <FavouritesStack.Navigator
//     screenOptions={{
//       headerShown: false,
//       cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
//     }}
//   >
//     <FavouritesStack.Screen name="Favourites2" component={FavouritesPage} />
//     <FavouritesStack.Screen name="ProductPage" component={ProductPage} />
//     <FavouritesStack.Screen name="CartPageF" component={CartPage} />
//     <FavouritesStack.Screen name="Settings" component={SettingsScreen} />
//   </FavouritesStack.Navigator>
// );

// // ----------------------- Custom Tab Bar ----------------------- //
// function CustomTabBar({ state, descriptors, navigation }) {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // A taller, more rounded, and spacious container
//   const tabBarContainerStyle = {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//     right: 20,
//     height: 68, // Slightly taller
//     borderRadius: 34, // Half of height for a fully rounded pill
//     backgroundColor: currentTheme.cardBackground,
//     flexDirection: 'row',
//     // Spread icons more evenly
//     justifyContent: 'space-evenly',
//     alignItems: 'center',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 5,
//     shadowOffset: { width: 0, height: 4 },
//     // Add padding so icons don’t touch edges
//     paddingHorizontal: 15,
//   };

//   return (
//     <View style={tabBarContainerStyle}>
//       {state.routes.map((route, index) => {
//         const { options } = descriptors[route.key];
//         const label = route.name;
//         const isFocused = state.index === index;

//         // Colors
//         const color = isFocused
//           ? currentTheme.tabBarActiveTintColor
//           : currentTheme.tabBarInactiveTintColor;

//         let iconName;
//         let useMaterialIcons = false;

//         // Decide which icon set + icon name
//         if (label === 'Favourites') {
//           iconName = isFocused ? 'heart' : 'heart-outline';
//         } else if (label === 'PurchaseHistory') {
//           // "history" is from MaterialIcons
//           useMaterialIcons = true;
//           iconName = 'history';
//         } else if (label === 'Market') {
//           iconName = isFocused ? 'storefront' : 'storefront-outline';
//         } else if (label === 'AICourses') {
//           iconName = isFocused ? 'school' : 'school-outline';
//         } else if (label === 'UserProfile') {
//           iconName = isFocused ? 'person' : 'person-outline';
//         } else if (label === 'Help') {
//           iconName = isFocused ? 'help-circle' : 'help-circle-outline';
//         }

//         const onPress = () => {
//           const event = navigation.emit({
//             type: 'tabPress',
//             target: route.key,
//             canPreventDefault: true,
//           });
//           if (!event.defaultPrevented) {
//             navigation.navigate(route.name);
//           }
//         };

//         return (
//           <TouchableOpacity
//             key={route.key}
//             onPress={onPress}
//             style={styles.iconWrapper}
//             activeOpacity={0.7}
//           >
//             {useMaterialIcons ? (
//               <MaterialIcons name={iconName} size={22} color={color} />
//             ) : (
//               <Ionicons name={iconName} size={22} color={color} />
//             )}
//             <Text style={[styles.iconLabel, { color }]}>{label}</Text>
//           </TouchableOpacity>
//         );
//       })}
//     </View>
//   );
// }

// // ----------------------- Main Tabs ----------------------- //
// const MainTabNavigator = () => {
//   return (
//     <Tab.Navigator
//       initialRouteName="Market"
//       screenOptions={{ headerShown: false }}
//       // Use a custom tabBar for the floating style
//       tabBar={(props) => <CustomTabBar {...props} />}
//     >
//       <Tab.Screen name="Favourites" component={FavouritesStackScreen} />
//       <Tab.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
//       <Tab.Screen name="Market" component={MarketStackScreen} />
//       <Tab.Screen name="AICourses" component={AICoursesScreen} />
//       <Tab.Screen name="UserProfile" component={UserProfileScreen} />
//       <Tab.Screen name="Help" component={HelpScreen} />
//     </Tab.Navigator>
//   );
// };

// // ----------------------- Auth Stack Navigator ----------------------- //
// const AuthStackScreen = () => (
//   <Stack.Navigator
//     screenOptions={{
//       headerShown: false,
//       cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
//     }}
//   >
//     <Stack.Screen name="Login" component={LoginScreen} />
//     <Stack.Screen name="Register" component={RegisterScreen} />
//     <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//     <Stack.Screen name="Otp" component={OtpScreen} />
//     <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
//   </Stack.Navigator>
// );

// // ----------------------- App Stack Navigator ----------------------- //
// const AppStackScreen = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="Main" component={MainTabNavigator} />
//     <Stack.Screen
//       name="CourseDetailScreen"
//       component={CourseDetailScreen}
//       options={{
//         cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
//       }}
//     />
//     <Stack.Screen
//       name="EnrollmentScreen"
//       component={EnrollmentScreen}
//       options={{
//         cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
//       }}
//     />
//   </Stack.Navigator>
// );

// // ----------------------- Root App Navigator ----------------------- //
// const AppNavigator = () => {
//   const { isAuthenticated, loading } = useContext(UserContext);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <ThemeProvider>
//       <FavouritesProvider>
//         <NavigationContainer theme={NavigationDefaultTheme}>
//           <Stack.Navigator screenOptions={{ headerShown: false }}>
//             {isAuthenticated ? (
//               <Stack.Screen name="AppStack" component={AppStackScreen} />
//             ) : (
//               <Stack.Screen name="AuthStack" component={AuthStackScreen} />
//             )}
//           </Stack.Navigator>
//         </NavigationContainer>
//       </FavouritesProvider>
//     </ThemeProvider>
//   );
// };

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
//   iconWrapper: {
//     alignItems: 'center',
//     // Add horizontal spacing so icons aren't too close
//     marginHorizontal: 6,
//   },
//   iconLabel: {
//     fontSize: 9, // slightly smaller text for less clutter
//     marginTop: 2,
//   },
// });

// export default AppNavigator;












// // src/navigation/AppNavigator.js

// import React, { useContext } from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// import OtpScreen from '../screens/OtpScreen';
// import NewPasswordScreen from '../screens/NewPasswordScreen';
// import UserProfileScreen from '../screens/UserProfileScreen';
// import MarketPage from '../screens/MarketPage';
// import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import HelpScreen from '../screens/HelpScreen';
// import ProductPage from '../screens/ProductPage';
// import CartPage from '../screens/CartPage';
// import FavouritesPage from '../screens/FavouritesPage';
// import ChangePasswordScreen from '../screens/ChangePasswordScreen';
// import AICoursesScreen from '../screens/AICoursesScreen'; // New AI Courses Screen

// // New Screens
// import CourseDetailScreen from '../screens/CourseDetailScreen';
// import EnrollmentScreen from '../screens/EnrollmentScreen';

// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// import { ThemeProvider, ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext, FavouritesProvider } from '../contexts/FavouritesContext';
// import { UserContext, UserProvider } from '../contexts/UserContext';

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();
// const MarketStack = createStackNavigator();
// const FavouritesStack = createStackNavigator();

// // ----------------------- Stack Screens ----------------------- //

// const MarketStackScreen = () => (
//   <MarketStack.Navigator screenOptions={{ headerShown: false }}>
//     <MarketStack.Screen name="MarketHome" component={MarketPage} />
//     <MarketStack.Screen name="ProductPage" component={ProductPage} />
//     <MarketStack.Screen name="CartPage" component={CartPage} />
//     <MarketStack.Screen name="Settings" component={SettingsScreen} />
//     <MarketStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
//   </MarketStack.Navigator>
// );

// const FavouritesStackScreen = () => (
//   <FavouritesStack.Navigator screenOptions={{ headerShown: false }}>
//     <FavouritesStack.Screen name="Favourites2" component={FavouritesPage} />
//     <FavouritesStack.Screen name="ProductPage" component={ProductPage} />
//     <FavouritesStack.Screen name="CartPageF" component={CartPage} />
//     <FavouritesStack.Screen name="Settings" component={SettingsScreen} />
//   </FavouritesStack.Navigator>
// );

// // ----------------------- Tab Navigator ----------------------- //

// const MainTabNavigator = () => {
//   const { theme } = useContext(ThemeContext);
//   const { favouriteItems } = useContext(FavouritesContext);

//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const styles = StyleSheet.create({
//     badge: {
//       position: 'absolute',
//       right: -6,
//       top: -3,
//       backgroundColor: currentTheme.priceColor,
//       borderRadius: 8,
//       width: 16,
//       height: 16,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     badgeText: {
//       color: '#FFFFFF',
//       fontSize: 10,
//       fontWeight: 'bold',
//     },
//   });

//   return (
//     <Tab.Navigator
//       initialRouteName="Market"
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName;
//           if (route.name === 'Favourites') {
//             iconName = focused ? 'heart' : 'heart-outline';
//             return (
//               <View style={{ width: 24, height: 24, margin: 5 }}>
//                 <Ionicons name={iconName} size={size} color={color} />
//                 {favouriteItems?.length > 0 && (
//                   <View style={styles.badge}>
                    // <Text style={styles.badgeText}>
                    //   {favouriteItems.length}
                    // </Text>
//                   </View>
//                 )}
//               </View>
//             );
//           } else if (route.name === 'PurchaseHistory') {
//             iconName = focused ? 'history' : 'history';
//             return <MaterialIcons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'Market') {
//             iconName = focused ? 'storefront' : 'storefront-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'AICourses') {
//             iconName = focused ? 'school' : 'school-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'UserProfile') {
//             iconName = focused ? 'person' : 'person-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'Help') {
//             iconName = focused ? 'help-circle' : 'help-circle-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           }
//         },
//         tabBarActiveTintColor: currentTheme.tabBarActiveTintColor,
//         tabBarInactiveTintColor: currentTheme.tabBarInactiveTintColor,
//         tabBarStyle: {
//           backgroundColor: currentTheme.cardBackground,
//         },
//       })}
//     >
//       <Tab.Screen name="Favourites" component={FavouritesStackScreen} />
//       <Tab.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
//       <Tab.Screen name="Market" component={MarketStackScreen} />
//       <Tab.Screen name="AICourses" component={AICoursesScreen} />
//       <Tab.Screen name="UserProfile" component={UserProfileScreen} />
//       <Tab.Screen name="Help" component={HelpScreen} />
//     </Tab.Navigator>
//   );
// };

// // ----------------------- Auth Stack Navigator ----------------------- //

// const AuthStackScreen = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="Login" component={LoginScreen} />
//     <Stack.Screen name="Register" component={RegisterScreen} />
//     <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//     <Stack.Screen name="Otp" component={OtpScreen} />
//     <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
//   </Stack.Navigator>
// );

// // ----------------------- App Stack Navigator ----------------------- //

// const AppStackScreen = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="Main" component={MainTabNavigator} />
//     <Stack.Screen name="CourseDetailScreen" component={CourseDetailScreen} />
//     <Stack.Screen name="EnrollmentScreen" component={EnrollmentScreen} />
//   </Stack.Navigator>
// );

// // ----------------------- App Navigator ----------------------- //

// const AppNavigator = () => {
//   const { isAuthenticated, loading } = useContext(UserContext);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <ThemeProvider>
//       <FavouritesProvider>
//         <NavigationContainer>
//           <Stack.Navigator screenOptions={{ headerShown: false }}>
//             {isAuthenticated ? (
//               <Stack.Screen name="AppStack" component={AppStackScreen} />
//             ) : (
//               <Stack.Screen name="AuthStack" component={AuthStackScreen} />
//             )}
//           </Stack.Navigator>
//         </NavigationContainer>
//       </FavouritesProvider>
//     </ThemeProvider>
//   );
// };

// // ----------------------- Styles ----------------------- //

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
// });

// export default AppNavigator;























// // src/navigation/AppNavigator.js

// import React, { useContext } from 'react';
// import { View, ActivityIndicator, Alert, StyleSheet, Text } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// import OtpScreen from '../screens/OtpScreen';
// import NewPasswordScreen from '../screens/NewPasswordScreen';
// import UserProfileScreen from '../screens/UserProfileScreen';
// import MarketPage from '../screens/MarketPage';
// import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import HelpScreen from '../screens/HelpScreen';
// import ProductPage from '../screens/ProductPage';
// import CartPage from '../screens/CartPage';
// import FavouritesPage from '../screens/FavouritesPage';

// import ChangePasswordScreen from '../screens/ChangePasswordScreen';

// import AsyncStorage from '@react-native-async-storage/async-storage';

// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// import { ThemeProvider, ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext, FavouritesProvider } from '../contexts/FavouritesContext';

// import { UserContext, UserProvider } from '../contexts/UserContext'; // Import UserContext and Provider

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();
// const MarketStack = createStackNavigator();
// const FavouritesStack = createStackNavigator();

// // ----------------------- Stack Screens ----------------------- //

// const MarketStackScreen = () => (
//   <MarketStack.Navigator screenOptions={{ headerShown: false }}>
//     <MarketStack.Screen name="MarketHome" component={MarketPage} />
//     <MarketStack.Screen name="ProductPage" component={ProductPage} />
//     <MarketStack.Screen name="CartPage" component={CartPage} />
//     <MarketStack.Screen name="Settings" component={SettingsScreen} />
//     <MarketStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
//   </MarketStack.Navigator>
// );

// const FavouritesStackScreen = () => (
//   <FavouritesStack.Navigator screenOptions={{ headerShown: false }}>
//     <FavouritesStack.Screen name="Favourites2" component={FavouritesPage} />
//     <FavouritesStack.Screen name="ProductPage" component={ProductPage} />
//     <FavouritesStack.Screen name="CartPageF" component={CartPage} />
//     <FavouritesStack.Screen name="Settings" component={SettingsScreen} />
//   </FavouritesStack.Navigator>
// );

// // ----------------------- Tab Navigator ----------------------- //

// const MainTabNavigator = () => {
//   const { theme } = useContext(ThemeContext);
//   const { favouriteItems } = useContext(FavouritesContext);

//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const styles = StyleSheet.create({
    // badge: {
    //   position: 'absolute',
    //   right: -6,
    //   top: -3,
    //   backgroundColor: currentTheme.priceColor,
    //   borderRadius: 8,
    //   width: 16,
    //   height: 16,
    //   justifyContent: 'center',
    //   alignItems: 'center',
    // },
    // badgeText: {
    //   color: '#FFFFFF',
    //   fontSize: 10,
    //   fontWeight: 'bold',
    // },
//   });

//   return (
//     <Tab.Navigator
//       initialRouteName="Market"
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName;

//           if (route.name === 'Favourites') {
//             iconName = focused ? 'heart' : 'heart-outline';

//             return (
//               <View style={{ width: 24, height: 24, margin: 5 }}>
//                 <Ionicons name={iconName} size={size} color={color} />
//                 {favouriteItems?.length > 0 && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>
//                       {favouriteItems.length}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             );
//           } else if (route.name === 'PurchaseHistory') {
//             iconName = focused ? 'history' : 'history';
//             return <MaterialIcons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'Market') {
//             iconName = focused ? 'storefront' : 'storefront-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'UserProfile') {
//             iconName = focused ? 'person' : 'person-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'Help') {
//             iconName = focused ? 'help-circle' : 'help-circle-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           }
//         },
//         tabBarActiveTintColor: currentTheme.tabBarActiveTintColor,
//         tabBarInactiveTintColor: currentTheme.tabBarInactiveTintColor,
//         tabBarStyle: {
//           backgroundColor: currentTheme.cardBackground,
//         },
//       })}
//     >
//       <Tab.Screen name="Favourites" component={FavouritesStackScreen} />
//       <Tab.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
//       <Tab.Screen name="Market" component={MarketStackScreen} />
//       <Tab.Screen name="UserProfile" component={UserProfileScreen} />
//       <Tab.Screen name="Help" component={HelpScreen} />
//     </Tab.Navigator>
//   );
// };

// // ----------------------- Auth Stack Navigator ----------------------- //

// const AuthStackScreen = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="Login" component={LoginScreen} />
//     <Stack.Screen name="Register" component={RegisterScreen} />
//     <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//     <Stack.Screen name="Otp" component={OtpScreen} />
//     <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
//   </Stack.Navigator>
// );

// // ----------------------- App Stack Navigator ----------------------- //

// const AppStackScreen = () => (
//   <Stack.Navigator screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="Main" component={MainTabNavigator} />
//   </Stack.Navigator>
// );

// // ----------------------- App Navigator ----------------------- //

// const AppNavigator = () => {
//   const { isAuthenticated, loading } = useContext(UserContext); // Consume UserContext

//   if (loading) {
//     // Show loading indicator while checking auth status
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <ThemeProvider>
//       <FavouritesProvider>
//         <NavigationContainer>
//           <Stack.Navigator screenOptions={{ headerShown: false }}>
//             {isAuthenticated ? (
//               // Main App Stack
//               <Stack.Screen name="AppStack" component={AppStackScreen} />
//             ) : (
//               // Authentication Stack
//               <Stack.Screen name="AuthStack" component={AuthStackScreen} />
//             )}
//           </Stack.Navigator>
//         </NavigationContainer>
//       </FavouritesProvider>
//     </ThemeProvider>
//   );
// };

// // ----------------------- Styles ----------------------- //

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
// });

// // ----------------------- Export with UserProvider ----------------------- //


// export default AppNavigator;






// export default () => (
//   <UserProvider>
//     <AppNavigator />
//   </UserProvider>
// );
















// // src/navigation/AppNavigator.js

// import React, { useEffect, useState, useContext } from 'react';
// import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native'; // Import necessary components
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// import OtpScreen from '../screens/OtpScreen';
// import UserProfileScreen from '../screens/UserProfileScreen';
// import MarketPage from '../screens/MarketPage';
// import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import HelpScreen from '../screens/HelpScreen';
// import ProductPage from '../screens/ProductPage';
// import CartPage from '../screens/CartPage';
// import NewPasswordScreen from '../screens/NewPasswordScreen';
// import FavouritesPage from '../screens/FavouritesPage';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// import { ThemeProvider, ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext, FavouritesProvider } from '../contexts/FavouritesContext'; // Import FavouritesContext and Provider

// import api from '../services/api'; // Import the centralized API functions

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();
// const MarketStack = createStackNavigator();
// const FavouritesStack = createStackNavigator();

// // ----------------------- Stack Screens ----------------------- //

// const MarketStackScreen = () => (
//   <MarketStack.Navigator screenOptions={{ headerShown: false }}>
//     <MarketStack.Screen name="MarketHome" component={MarketPage} />
//     <MarketStack.Screen name="ProductPage" component={ProductPage} />
//     <MarketStack.Screen name="CartPage" component={CartPage} />
//     <MarketStack.Screen name="Settings" component={SettingsScreen} />
//   </MarketStack.Navigator>
// );

// const FavouritesStackScreen = () => (
//   <FavouritesStack.Navigator screenOptions={{ headerShown: false }}>
//     <FavouritesStack.Screen name="Favourites2" component={FavouritesPage} />
//     <FavouritesStack.Screen name="ProductPage" component={ProductPage} />
//     <FavouritesStack.Screen name="CartPageF" component={CartPage} />
//     <FavouritesStack.Screen name="Settings" component={SettingsScreen} />
//   </FavouritesStack.Navigator>
// );

// // ----------------------- Tab Navigator ----------------------- //

// const MainTabNavigator = () => {
//   const { theme } = useContext(ThemeContext);
//   const { favouriteItems } = useContext(FavouritesContext);

//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const styles = StyleSheet.create({
//     badge: {
//       position: 'absolute',
//       right: -6,
//       top: -3,
//       backgroundColor: currentTheme.priceColor,
//       borderRadius: 8,
//       width: 16,
//       height: 16,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     badgeText: {
//       color: '#FFFFFF',
//       fontSize: 10,
//       fontWeight: 'bold',
//     },
//   });

//   return (
//     <Tab.Navigator
//       initialRouteName="Market"
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName;

//           if (route.name === 'Favourites') {
//             iconName = focused ? 'heart' : 'heart-outline';

//             return (
//               <View style={{ width: 24, height: 24, margin: 5 }}>
//                 <Ionicons name={iconName} size={size} color={color} />
//                 {favouriteItems.length > 0 && (
//                   <View style={styles.badge}>
//                     <Text style={styles.badgeText}>
//                       {favouriteItems.length}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             );
//           } else if (route.name === 'PurchaseHistory') {
//             iconName = focused ? 'history' : 'history';
//             return <MaterialIcons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'Market') {
//             iconName = focused ? 'storefront' : 'storefront-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'UserProfile') {
//             iconName = focused ? 'person' : 'person-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'Help') {
//             iconName = focused ? 'help-circle' : 'help-circle-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           }
//         },
//         tabBarActiveTintColor: currentTheme.tabBarActiveTintColor,
//         tabBarInactiveTintColor: currentTheme.tabBarInactiveTintColor,
//         tabBarStyle: {
//           backgroundColor: currentTheme.cardBackground,
//         },
//       })}
//     >
//       <Tab.Screen name="Favourites" component={FavouritesStackScreen} />
//       <Tab.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
//       <Tab.Screen name="Market" component={MarketStackScreen} />
//       <Tab.Screen name="UserProfile" component={UserProfileScreen} />
//       <Tab.Screen name="Help" component={HelpScreen} />
//     </Tab.Navigator>
//   );
// };

// // ----------------------- App Navigator ----------------------- //

// const AppNavigator = () => {
//   const [isLoading, setIsLoading] = useState(true); // Loading state
//   const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication state

//   // Function to check authentication status
//   const checkAuth = async () => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (token) {
//         const isValid = await api.verifyAuthToken(); // Use the centralized API function
//         if (isValid) {
//           setIsAuthenticated(true);
//         } else {
//           await AsyncStorage.removeItem('token'); // Remove invalid token
//           setIsAuthenticated(false);
//           Alert.alert('Session Expired', 'Please log in again.');
//         }
//       } else {
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error('Authentication check error:', error);
//       setIsAuthenticated(false);
//     } finally {
//       setIsLoading(false); // Stop loading
//     }
//   };

//   // Run authentication check on component mount
//   useEffect(() => {
//     checkAuth();
//   }, []);

//   if (isLoading) {
//     // Show loading indicator while checking auth status
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <ThemeProvider>
//       <FavouritesProvider>
//         <NavigationContainer>
//           <Stack.Navigator
//             initialRouteName={isAuthenticated ? 'Main' : 'Login'}
//             screenOptions={{ headerShown: false }}
//           >
//             {!isAuthenticated ? (
//               // Authentication Stack
//               <>
//                 <Stack.Screen name="Login" component={LoginScreen} />
//                 <Stack.Screen name="Register" component={RegisterScreen} />
//                 <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//                 <Stack.Screen name="Otp" component={OtpScreen} />
//                 <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
//               </>
//             ) : (
//               // Main App Stack
//               <Stack.Screen name="Main" component={MainTabNavigator} />
//             )}
//           </Stack.Navigator>
//         </NavigationContainer>
//       </FavouritesProvider>
//     </ThemeProvider>
//   );
// };

// // ----------------------- Styles ----------------------- //

// const styles = StyleSheet.create({
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//   },
// });

// export default AppNavigator;













// // src/navigation/AppNavigator.js

// import React, { useContext } from 'react';
// import { View, Text, StyleSheet } from 'react-native'; // Import necessary components
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// import OtpScreen from '../screens/OtpScreen';
// import UserProfileScreen from '../screens/UserProfileScreen';
// import MarketPage from '../screens/MarketPage';
// import PurchaseHistoryScreen from '../screens/PurchaseHistoryScreen';
// import SettingsScreen from '../screens/SettingsScreen';
// import HelpScreen from '../screens/HelpScreen';
// import ProductPage from '../screens/ProductPage';
// import CartPage from '../screens/CartPage';
// import NewPasswordScreen from '../screens/NewPasswordScreen';
// import FavouritesPage from '../screens/FavouritesPage';

// import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// import { ThemeProvider, ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext, FavouritesProvider } from '../contexts/FavouritesContext'; // Import FavouritesContext and Provider

// const Stack = createStackNavigator();
// const Tab = createBottomTabNavigator();

// const MarketStack = createStackNavigator();
// const FavouritesStack = createStackNavigator();

// const MarketStackScreen = () => (
//   <MarketStack.Navigator screenOptions={{ headerShown: false }}>
//     <MarketStack.Screen name="MarketHome" component={MarketPage} />
//     <MarketStack.Screen name="ProductPage" component={ProductPage} />
//     <MarketStack.Screen name="CartPage" component={CartPage} />
//     <MarketStack.Screen name="Settings" component={SettingsScreen} />
//   </MarketStack.Navigator>
// );

// const FavouritesStackScreen = () => (
//   <FavouritesStack.Navigator screenOptions={{ headerShown: false }}>
//     <FavouritesStack.Screen name="Favourites2" component={FavouritesPage} />
//     <FavouritesStack.Screen name="ProductPage" component={ProductPage} />
//     <FavouritesStack.Screen name="CartPageF" component={CartPage} />
//     <FavouritesStack.Screen name="Settings" component={SettingsScreen} />
//   </FavouritesStack.Navigator>
// );

// const MainTabNavigator = () => {
//   const { theme } = useContext(ThemeContext);
//   const { favouriteItems } = useContext(FavouritesContext);

//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const styles = StyleSheet.create({
//     badge: {
//       position: 'absolute',
//       right: -6,
//       top: -3,
//       backgroundColor: currentTheme.priceColor,
//       borderRadius: 8,
//       width: 16,
//       height: 16,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     badgeText: {
//       color: '#FFFFFF',
//       fontSize: 10,
//       fontWeight: 'bold',
//     },
//   });

//   return (
//     <Tab.Navigator
//       initialRouteName="Market"
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName;

          // if (route.name === 'Favourites') {
          //   iconName = focused ? 'heart' : 'heart-outline';

          //   return (
          //     <View style={{ width: 24, height: 24, margin: 5 }}>
          //       <Ionicons name={iconName} size={size} color={color} />
          //       {favouriteItems.length > 0 && (
          //         <View style={styles.badge}>
          //           <Text style={styles.badgeText}>
          //             {favouriteItems.length}
          //           </Text>
          //         </View>
          //       )}
          //     </View>
          //   );
//           } else if (route.name === 'PurchaseHistory') {
//             iconName = focused ? 'history' : 'history';
//             return <MaterialIcons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'Market') {
//             iconName = focused ? 'storefront' : 'storefront-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'UserProfile') {
//             iconName = focused ? 'person' : 'person-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           } else if (route.name === 'Help') {
//             iconName = focused ? 'help-circle' : 'help-circle-outline';
//             return <Ionicons name={iconName} size={size} color={color} />;
//           }
//         },
//         tabBarActiveTintColor: currentTheme.tabBarActiveTintColor,
//         tabBarInactiveTintColor: currentTheme.tabBarInactiveTintColor,
//         tabBarStyle: {
//           backgroundColor: currentTheme.cardBackground,
//         },
//       })}
//     >
//       <Tab.Screen name="Favourites" component={FavouritesStackScreen} />
//       <Tab.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
//       <Tab.Screen name="Market" component={MarketStackScreen} />
//       <Tab.Screen name="UserProfile" component={UserProfileScreen} />
//       <Tab.Screen name="Help" component={HelpScreen} />
//     </Tab.Navigator>
//   );
// };

// const AppNavigator = () => {
//   return (
//     <ThemeProvider>
//       <FavouritesProvider>
//         <NavigationContainer>
//           <Stack.Navigator
//             initialRouteName="Login"
//             screenOptions={{ headerShown: false }}
//           >
//             <Stack.Screen name="Login" component={LoginScreen} />
//             <Stack.Screen name="Register" component={RegisterScreen} />
//             <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//             <Stack.Screen name="Otp" component={OtpScreen} />
//             <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
//             <Stack.Screen name="Main" component={MainTabNavigator} />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </FavouritesProvider>
//     </ThemeProvider>
//   );
// };

// export default AppNavigator;








