// src/screens/LoginScreen.js

import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert';
import { UserContext } from '../contexts/UserContext';
import LegalLinksPopup from '../components/LegalLinksPopup';
import AppBrandName from '../components/AppBrandName';


const LoginScreen = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth; // scale everything relative to a base width

  // Optional: a scaling function for fonts and dimensions
  const scale = (size) => size * scaleFactor;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const { login } = useContext(UserContext);

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(-50 * scaleFactor)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const passwordInputRef = useRef();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(iconTranslateY, {
        toValue: 0,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please enter both email and password.');
      setAlertVisible(true);
      return;
    }
    setLoading(true);
    const response = await login(email, password);
    setLoading(false);

    if (!response.success) {
      setAlertTitle('Login Failed');
      setAlertMessage('Invalid email or password.');
      setAlertVisible(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
  };

  // Create responsive styles that re-calculate when dimensions change.
  const styles = useMemo(() => StyleSheet.create({
    background: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(10),
    },
    container: {
      width: '90%',
      alignItems: 'center',
      paddingHorizontal: scale(10),
    },
    subtitle: {
      fontSize: scale(18),
      marginTop: scale(10),
      fontWeight: '600',
    },
    inputContainer: {
      width: '100%',
      marginTop: scale(20),
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: scale(8),
      borderRadius: scale(15),
      borderWidth: 1,
      paddingHorizontal: scale(15),
      height: scale(50),
    },
    inputIcon: {
      marginRight: scale(10),
    },
    input: {
      flex: 1,
      height: scale(50),
      fontSize: scale(16),
    },
    forgotPasswordButton: {
      alignSelf: 'flex-end',
      marginTop: scale(5),
    },
    forgotPasswordText: {
      fontWeight: 'bold',
      fontSize: scale(14),
    },
    button: {
      width: '100%',
      paddingVertical: scale(15),
      borderRadius: scale(30),
      alignItems: 'center',
      elevation: 3,
      marginTop: scale(10),
    },
    buttonText: {
      fontSize: scale(16),
      fontWeight: 'bold',
      letterSpacing: 1.1 * scaleFactor,
    },
    registerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: scale(20),
    },
    accountText: {
      fontSize: scale(16),
    },
    registerText: {
      fontSize: scale(16),
      fontWeight: 'bold',
    },
    legalContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: scale(20),
    },
  }), [scaleFactor]);

  return (
    <LinearGradient
      colors={currentTheme.authBackground}
      style={[styles.background, { width, height }]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? scale(60) : scale(20)}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <AppBrandName
                brandName="Ai-Nsider"
                primaryColor={currentTheme.primaryColor}
                textColor={currentTheme.textColor}
              />
              <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
                Welcome Back
              </Text>

              <View style={styles.inputContainer}>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: currentTheme.inputBackgroundColor,
                      borderColor: currentTheme.inputBorderColor,
                    },
                  ]}
                >
                  <Icon
                    name="email"
                    size={scale(24)}
                    color={currentTheme.placeholderTextColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor={currentTheme.placeholderTextColor}
                    style={[styles.input, { color: currentTheme.textColor }]}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordInputRef.current.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: currentTheme.inputBackgroundColor,
                      borderColor: currentTheme.inputBorderColor,
                    },
                  ]}
                >
                  <Icon
                    name="lock"
                    size={scale(24)}
                    color={currentTheme.placeholderTextColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={passwordInputRef}
                    placeholder="Password"
                    placeholderTextColor={currentTheme.placeholderTextColor}
                    style={[styles.input, { color: currentTheme.textColor }]}
                    secureTextEntry
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotPassword')}
                  style={styles.forgotPasswordButton}
                >
                  <Text
                    style={[
                      styles.forgotPasswordText,
                      { color: currentTheme.secondaryColor },
                    ]}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <Animated.View
                style={{
                  transform: [{ scale: buttonScale }],
                  width: '100%',
                  alignItems: 'center',
                }}
              >
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
                  onPress={handleLogin}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color='#FFFFFF' />
                  ) : (
                    <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>
                      LOGIN
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.registerContainer}>
                <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
                  Don't have an account?
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text
                    style={[
                      styles.registerText,
                      { color: currentTheme.secondaryColor },
                    ]}
                  >
                    {' '}Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.legalContainer}>
                <LegalLinksPopup
                  staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
                  themeStyles={{
                    cardBackground: currentTheme.cardBackground,
                    textColor: currentTheme.textColor,
                    primaryColor: currentTheme.primaryColor,
                  }}
                  headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
                  textStyle={{ color: currentTheme.secondaryColor }}
                />
              </View>

              <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={handleCloseAlert}
                icon={
                  alertTitle === 'Validation Error'
                    ? 'alert-circle'
                    : 'close-circle'
                }
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;








// // src/screens/LoginScreen.js

// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   ScrollView,
//   SafeAreaView,
//   useWindowDimensions,
//   PixelRatio,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';
// import { UserContext } from '../contexts/UserContext';
// import LegalLinksPopup from '../components/LegalLinksPopup';
// import AppBrandName from '../components/AppBrandName';

// const scaleFont = (size) => size * PixelRatio.getFontScale();

// const LoginScreen = () => {
//   const navigation = useNavigation();
//   const { width, height } = useWindowDimensions();
//   const isSmallScreen = width < 380;

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const { login } = useContext(UserContext);

//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;
//   const passwordInputRef = useRef();

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(iconOpacity, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(iconTranslateY, {
//         toValue: 0,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter both email and password.');
//       setAlertVisible(true);
//       return;
//     }
//     setLoading(true);
//     const response = await login(email, password);
//     setLoading(false);

//     if (!response.success) {
//       setAlertTitle('Login Failed');
//       setAlertMessage('Invalid email or password.');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//   };

//   return (
//     <LinearGradient
//       colors={currentTheme.authBackground}
//       style={[styles.background, { width, height }]}
//     >
//       <SafeAreaView style={{ flex: 1 }}>
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//           keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 20}
//           style={{ flex: 1 }}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             <View style={styles.container}>
//               <AppBrandName
//                 brandName="Ai-Nsider"
//                 primaryColor={currentTheme.primaryColor}
//                 textColor={currentTheme.textColor}
//               />
//               <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//                 Welcome Back
//               </Text>

//               <View style={styles.inputContainer}>
//                 <View
//                   style={[
//                     styles.inputWrapper,
//                     {
//                       backgroundColor: currentTheme.inputBackgroundColor,
//                       borderColor: currentTheme.inputBorderColor,
//                     },
//                   ]}
//                 >
//                   <Icon
//                     name="email"
//                     size={24}
//                     color={currentTheme.placeholderTextColor}
//                     style={styles.inputIcon}
//                   />
//                   <TextInput
//                     placeholder="Email"
//                     placeholderTextColor={currentTheme.placeholderTextColor}
//                     style={[styles.input, { color: currentTheme.textColor }]}
//                     onChangeText={setEmail}
//                     autoCapitalize="none"
//                     keyboardType="email-address"
//                     returnKeyType="next"
//                     onSubmitEditing={() => passwordInputRef.current.focus()}
//                     blurOnSubmit={false}
//                   />
//                 </View>

//                 <View
//                   style={[
//                     styles.inputWrapper,
//                     {
//                       backgroundColor: currentTheme.inputBackgroundColor,
//                       borderColor: currentTheme.inputBorderColor,
//                     },
//                   ]}
//                 >
//                   <Icon
//                     name="lock"
//                     size={24}
//                     color={currentTheme.placeholderTextColor}
//                     style={styles.inputIcon}
//                   />
//                   <TextInput
//                     ref={passwordInputRef}
//                     placeholder="Password"
//                     placeholderTextColor={currentTheme.placeholderTextColor}
//                     style={[styles.input, { color: currentTheme.textColor }]}
//                     secureTextEntry
//                     onChangeText={setPassword}
//                     returnKeyType="done"
//                     onSubmitEditing={handleLogin}
//                   />
//                 </View>

//                 <TouchableOpacity
//                   onPress={() => navigation.navigate('ForgotPassword')}
//                   style={styles.forgotPasswordButton}
//                 >
//                   <Text
//                     style={[
//                       styles.forgotPasswordText,
//                       { color: currentTheme.secondaryColor },
//                     ]}
//                   >
//                     Forgot Password?
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <Animated.View
//                 style={{
//                   transform: [{ scale: buttonScale }],
//                   width: '100%',
//                   alignItems: 'center',
//                 }}
//               >
//                 <TouchableOpacity
//                   style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//                   onPress={handleLogin}
//                   activeOpacity={0.8}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color='#FFFFFF'/>
//                   ) : (
//                     <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>LOGIN</Text>
//                   )}
//                 </TouchableOpacity>
//               </Animated.View>

//               <View style={styles.registerContainer}>
//                 <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//                   Don't have an account?
//                 </Text>
//                 <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//                   <Text
//                     style={[
//                       styles.registerText,
//                       { color: currentTheme.secondaryColor },
//                     ]}
//                   >
//                     {' '}Sign Up
//                   </Text>
//                 </TouchableOpacity>
//               </View>

//               <View style={styles.legalContainer}>
//                 <LegalLinksPopup
//                   staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
//                   themeStyles={{
//                     cardBackground: currentTheme.cardBackground,
//                     textColor: currentTheme.textColor,
//                     primaryColor: currentTheme.primaryColor,
//                   }}
//                   headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//                   textStyle={{ color: currentTheme.secondaryColor }}
//                 />
//               </View>

//               <CustomAlert
//                 visible={alertVisible}
//                 title={alertTitle}
//                 message={alertMessage}
//                 onClose={handleCloseAlert}
//                 icon={
//                   alertTitle === 'Validation Error'
//                     ? 'alert-circle'
//                     : 'close-circle'
//                 }
//               />
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   container: {
//     width: '90%',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   subtitle: {
//     fontSize: scaleFont(18),
//     marginTop: 10,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 8,
//     borderRadius: 15,
//     borderWidth: 1,
//     paddingHorizontal: 15,
//     height: 50,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//   },
//   forgotPasswordButton: {
//     alignSelf: 'flex-end',
//     marginTop: 5,
//   },
//   forgotPasswordText: {
//     fontWeight: 'bold',
//     fontSize: scaleFont(14),
//     // textDecorationLine: 'underline',
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
//     marginTop: 10,
//   },
//   buttonText: {
//     // color: '#FFFFFF',
//     fontSize: scaleFont(16),
//     fontWeight: 'bold',
//     letterSpacing: 1.1,
//   },
//   registerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   accountText: {
//     fontSize: scaleFont(16),
//   },
//   registerText: {
//     fontSize: scaleFont(16),
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });










// // src/screens/LoginScreen.js

// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   ActivityIndicator,
//   useWindowDimensions,
//   PixelRatio
// } from 'react-native';

// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';
// import { UserContext } from '../contexts/UserContext';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// // NEW: Reusable brand-name component
// import AppBrandName from '../components/AppBrandName';

// const { width, height } = Dimensions.get('window');
// const isSmallScreen = width < 380;
// const isLargeScreen = width > 768;
// const scaleFont = (size) => size * PixelRatio.getFontScale();


// const LoginScreen = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const { login } = useContext(UserContext);

//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;
//   const passwordInputRef = useRef();

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(iconOpacity, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(iconTranslateY, {
//         toValue: 0,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter both email and password.');
//       setAlertVisible(true);
//       return;
//     }
//     setLoading(true);
//     const response = await login(email, password);
//     setLoading(false);

//     if (!response.success) {
//       setAlertTitle('Login Failed');
//       setAlertMessage('Invalid email or password.');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//   };

//   return (
//     <LinearGradient
//       colors={
//         theme === 'light'
//           ? currentTheme.authBackground
//           : currentTheme.authBackground
//       }
//       style={styles.background}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.overlay}
//       >
//         <View style={styles.container}>
//           {/* Reusable brand name + subtitle */}
//           <AppBrandName
//             brandName="Ai-Nsider"
//             primaryColor={currentTheme.primaryColor}
//             textColor={currentTheme.textColor}
//           />
//           <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//             Welcome Back
//           </Text>

//           <View style={styles.inputContainer}>
//             <View
//               style={[
//                 styles.inputWrapper,
//                 { backgroundColor: currentTheme.inputBackgroundColor,borderColor: currentTheme.inputBorderColor, },
//               ]}
//             >
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Email"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 returnKeyType="next"
//                 onSubmitEditing={() => passwordInputRef.current.focus()}
//                 blurOnSubmit={false}
//               />
//             </View>

//             <View
//               style={[
//                 styles.inputWrapper,
//                 { backgroundColor: currentTheme.inputBackgroundColor,borderColor: currentTheme.inputBorderColor, },
//               ]}
//             >
//               <Icon
//                 name="lock"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={passwordInputRef}
//                 placeholder="Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 secureTextEntry
//                 onChangeText={setPassword}
//                 returnKeyType="done"
//                 onSubmitEditing={handleLogin}
//               />
//             </View>

//             <TouchableOpacity
//               onPress={() => navigation.navigate('ForgotPassword')}
//               style={styles.forgotPasswordButton}
//             >
//               <Text style={[styles.forgotPasswordText, { color: currentTheme.secondaryColor }]}>
//                 Forgot Password?
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <Animated.View
//             style={{
//               transform: [{ scale: buttonScale }],
//               width: '100%',
//               alignItems: 'center',
//             }}
//           >
//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//               onPress={handleLogin}
//               activeOpacity={0.8}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color={currentTheme.loadingindicatorColor} />
//               ) : (
//                 <Text style={styles.buttonText}>LOGIN</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <View style={styles.registerContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Don't have an account?
//             </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//               <Text style={[styles.registerText, { color: currentTheme.secondaryColor }]}>
//                 {' '}Sign Up
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.legalContainer}>
//             <LegalLinksPopup
//               staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
//               themeStyles={{
//                 cardBackground: currentTheme.cardBackground,
//                 textColor: currentTheme.textColor,
//                 primaryColor: currentTheme.primaryColor,
//               }}
//               headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//               textStyle={{ color: currentTheme.secondaryColor }}
//             />
//           </View>

//           <CustomAlert
//             visible={alertVisible}
//             title={alertTitle}
//             message={alertMessage}
//             onClose={handleCloseAlert}
//             icon={
//               alertTitle === 'Validation Error'
//                 ? 'alert-circle'
//                 : 'close-circle'
//             }
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width,
//     height,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: isSmallScreen ? 10 : 0,
//   },
//   container: {
//     width: isSmallScreen ? '90%' : '85%',
//     alignItems: 'center',
//     paddingHorizontal: isSmallScreen ? 10 : 15,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: isSmallScreen ? 10 : 0,
//   },
  
//   subtitle: {
//     fontSize: scaleFont(isSmallScreen ? 16 : 18),
//     marginTop: 10,
//     fontWeight: '600',
//   },
  
//   inputContainer: {
//     width: '100%',
//     marginTop: isSmallScreen ? 15 : 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 8,
//     borderRadius: 15,
//     borderWidth: 1,
//     // borderColor: 'rgba(255,255,255,0.9)',
//     paddingHorizontal: isSmallScreen ? 10 : 15,
//     height: isSmallScreen ? 45 : 50,
//   },
  
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//   },
//   forgotPasswordButton: {
//     alignSelf: 'flex-end',
//     marginTop: isSmallScreen ? 3 : 5,
//   },
//   forgotPasswordText: {
//     fontSize: scaleFont(isSmallScreen ? 12 : 14),
//     textDecorationLine: 'underline',
//   },
//   button: {
//     width: isSmallScreen ? '95%' : '100%',
//     paddingVertical: isSmallScreen ? 12 : 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
//     marginTop: isSmallScreen ? 8 : 10,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: scaleFont(isSmallScreen ? 14 : 16),
//     fontWeight: 'bold',
//     letterSpacing: 1.1,
//   },
  
//   registerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: isSmallScreen ? 15 : 20,
//   },
//   accountText: {
//     fontSize: scaleFont(isSmallScreen ? 14 : 16),
//   },
//   registerText: {
//     fontSize: scaleFont(isSmallScreen ? 14 : 16),
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: isSmallScreen ? 15 : 20,
//   },
  
// });







// // src/screens/LoginScreen.js

// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';
// import { UserContext } from '../contexts/UserContext';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// const { width, height } = Dimensions.get('window');

// const LoginScreen = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const { login } = useContext(UserContext);

//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;
//   const passwordInputRef = useRef();

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(iconOpacity, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(iconTranslateY, {
//         toValue: 0,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter both email and password.');
//       setAlertVisible(true);
//       return;
//     }
//     setLoading(true);
//     const response = await login(email, password);
//     setLoading(false);

//     if (!response.success) {
//       setAlertTitle('Login Failed');
//       setAlertMessage('Invalid email or password.');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//   };

//   return (
//     <LinearGradient
//       colors={
//         theme === 'light'
//           ? ['#f7efff', '#e0c3fc']
//           : ['#0f0c29', '#302b63']
//       }
//       style={styles.background}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.overlay}
//       >
//         <View style={styles.container}>
//           <Animated.View
//             style={{
//               opacity: iconOpacity,
//               transform: [{ translateY: iconTranslateY }],
//               alignItems: 'center',
//               marginBottom: 30,
//             }}
//           >
//             <Text style={[styles.brandTitle, { color: currentTheme.primaryColor }]}>
//               Ai-Nsider
//             </Text>
//             <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//               Welcome Back
//             </Text>
//           </Animated.View>

//           <View style={styles.inputContainer}>
//             <View
//               style={[
//                 styles.inputWrapper,
//                 { backgroundColor: 'rgba(255,255,255,0.2)' },
//               ]}
//             >
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Email"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 returnKeyType="next"
//                 onSubmitEditing={() => passwordInputRef.current.focus()}
//                 blurOnSubmit={false}
//               />
//             </View>

//             <View
//               style={[
//                 styles.inputWrapper,
//                 { backgroundColor: 'rgba(255,255,255,0.2)' },
//               ]}
//             >
//               <Icon
//                 name="lock"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={passwordInputRef}
//                 placeholder="Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 secureTextEntry
//                 onChangeText={setPassword}
//                 returnKeyType="done"
//                 onSubmitEditing={handleLogin}
//               />
//             </View>

//             <TouchableOpacity
//               onPress={() => navigation.navigate('ForgotPassword')}
//               style={styles.forgotPasswordButton}
//             >
//               <Text style={[styles.forgotPasswordText, { color: currentTheme.secondaryColor }]}>
//                 Forgot Password?
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <Animated.View
//             style={{
//               transform: [{ scale: buttonScale }],
//               width: '100%',
//               alignItems: 'center',
//             }}
//           >
//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//               onPress={handleLogin}
//               activeOpacity={0.8}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>LOGIN</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <View style={styles.registerContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Don't have an account?
//             </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Register')}>
//               <Text style={[styles.registerText, { color: currentTheme.secondaryColor }]}>
//                 {' '}Sign Up
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.legalContainer}>
//             <LegalLinksPopup
//               staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
//               themeStyles={{
//                 cardBackground: currentTheme.cardBackground,
//                 textColor: currentTheme.textColor,
//                 primaryColor: currentTheme.primaryColor,
//               }}
//               headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//               textStyle={{ color: currentTheme.secondaryColor }}
//             />
//           </View>

//           <CustomAlert
//             visible={alertVisible}
//             title={alertTitle}
//             message={alertMessage}
//             onClose={handleCloseAlert}
//             icon={alertTitle === 'Validation Error' ? 'alert-circle' : 'close-circle'}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width,
//     height,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: '85%',
//     alignItems: 'center',
//   },
//   brandTitle: {
//     fontSize: 36,
//     fontWeight: '900',
//     textTransform: 'uppercase',
//     letterSpacing: 1.2,
//   },
//   subtitle: {
//     fontSize: 18,
//     marginTop: 10,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.4)',
//     paddingHorizontal: 15,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//   },
//   forgotPasswordButton: {
//     alignSelf: 'flex-end',
//     marginTop: 5,
//   },
//   forgotPasswordText: {
//     fontSize: 14,
//     textDecorationLine: 'underline',
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//     letterSpacing: 1.1,
//   },
//   registerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   registerText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });








// // src/screens/LoginScreen.js

// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// // import { loginUser } from '../services/api';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Import the CustomAlert component
// import CustomAlert from '../components/CustomAlert';
// import { UserContext, UserProvider } from '../contexts/UserContext';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// const { width, height } = Dimensions.get('window');

// const LoginScreen = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');

//   // Loading state
//   const [loading, setLoading] = useState(false);

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const { login } = useContext(UserContext);

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

//   // Create a ref for password input
//   const passwordInputRef = useRef();

//   // Function to start the animations
//   const startAnimations = () => {
//     Animated.parallel([
//       Animated.timing(iconOpacity, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(iconTranslateY, {
//         toValue: 0,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   useEffect(() => {
//     startAnimations();
//   }, []);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter both email and password.');
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);

//     // Simulate login API call
//     const response = await login(email, password);
//     setLoading(false);

//     if (!response.success) {
//       // navigation.navigate('Main'); // Adjust as per your navigation structure
//       setAlertTitle('Login Failed');
//       setAlertMessage('Invalid email or password.');
//       setAlertVisible(true);
//     } 
//     // else {
//     //   setAlertTitle('Login Failed');
//     //   setAlertMessage('Invalid email or password.');
//     //   setAlertVisible(true);
//     // }
//   };

//   // Function to handle closing the alert
//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//   };

//   return (
//     <LinearGradient
//       colors={theme === 'light' ? ['#ffffff', '#e6f7ff'] : ['#121212', '#1f1f1f']}
//       style={styles.background}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.overlay}
//       >
//         <View style={styles.container}>
//           <Animated.View
//             style={{
//               opacity: iconOpacity,
//               transform: [{ translateY: iconTranslateY }],
//               alignItems: 'center',
//               marginBottom: 30,
//             }}
//           >
//             <Icon name="login" size={100} color={currentTheme.primaryColor} />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               Welcome Back
//             </Text>
//           </Animated.View>
//           <View style={styles.inputContainer}>
//             <View
//               style={[
//                 styles.inputWrapper,
//                 { backgroundColor: currentTheme.inputBackground },
//               ]}
//             >
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Email"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                   },
//                 ]}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 accessibilityLabel="Email Input"
//                 returnKeyType="next"
//                 onSubmitEditing={() => {
//                   passwordInputRef.current.focus();
//                 }}
//                 blurOnSubmit={false}
//               />
//             </View>
//             <View
//               style={[
//                 styles.inputWrapper,
//                 { backgroundColor: currentTheme.inputBackground },
//               ]}
//             >
//               <Icon
//                 name="lock"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={passwordInputRef}
//                 placeholder="Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                   },
//                 ]}
//                 secureTextEntry
//                 onChangeText={setPassword}
//                 accessibilityLabel="Password Input"
//                 returnKeyType="done"
//                 onSubmitEditing={handleLogin}
//               />
//             </View>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('ForgotPassword')}
//               style={styles.forgotPasswordButton}
//               accessibilityLabel="Forgot Password Button"
//               accessibilityRole="button"
//             >
//               <Text style={[styles.forgotPasswordText, { color: currentTheme.secondaryColor }]}>
//                 Forgot Password?
//               </Text>
//             </TouchableOpacity>
//           </View>
//           <Animated.View
//             style={{
//               transform: [{ scale: buttonScale }],
//               width: '100%',
//               alignItems: 'center',
//             }}
//           >
//             <TouchableOpacity
//               style={[
//                 styles.button,
//                 { backgroundColor: currentTheme.primaryColor },
//               ]}
//               onPress={handleLogin}
//               activeOpacity={0.8}
//               accessibilityLabel="Login Button"
//               accessibilityRole="button"
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>LOGIN</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>
//           <View style={styles.registerContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Don't have an account?
//             </Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('Register')}
//               accessibilityLabel="Sign Up Button"
//               accessibilityRole="button"
//             >
//               <Text
//                 style={[
//                   styles.registerText,
//                   { color: currentTheme.secondaryColor },
//                 ]}
//               >
//                 {' '}
//                 Sign Up
//               </Text>
//             </TouchableOpacity>
//           </View>
//           {/* <View style={styles.legalContainer}>
//             <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
//               <Text style={[styles.legalText, { color: currentTheme.placeholderTextColor }]}>
//                 Privacy Policy
//               </Text>
//             </TouchableOpacity>
//             <Text style={[styles.legalText, { color: currentTheme.placeholderTextColor }]}> | </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('TermsOfUse')}>
//               <Text style={[styles.legalText, { color: currentTheme.placeholderTextColor }]}>
//                 Terms of Use
//               </Text>
//             </TouchableOpacity>
//           </View> */}
//           <View style={styles.legalContainer}>
//             <LegalLinksPopup
//               // fetchContent={null} // or your fetch function
//               staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
//               themeStyles={{
//                 cardBackground: currentTheme.cardBackground,
//                 textColor: currentTheme.textColor,
//                 primaryColor: currentTheme.primaryColor,
//               }}
//               headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//               textStyle={{ color: currentTheme.placeholderTextColor }}
//             />
//           </View>
//           {/* CustomAlert Component */}
//           <CustomAlert
//             visible={alertVisible}
//             title={alertTitle}
//             message={alertMessage}
//             onClose={handleCloseAlert}
//             icon={alertTitle === 'Validation Error' ? 'alert-circle' : 'close-circle'}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width: width,
//     height: height,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: '85%',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//     borderRadius: 30,
//     borderWidth: 1,
//     borderColor: '#d9d9d9',
//     paddingHorizontal: 15,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//   },
//   forgotPasswordButton: {
//     alignSelf: 'flex-end',
//     marginTop: 5,
//   },
//   forgotPasswordText: {
//     fontSize: 14,
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   registerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   registerText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   legalText: {
//     fontSize: 12,
//   },
// });

// export default LoginScreen;
















// // src/screens/LoginScreen.js

// import React, { useState, useEffect, useRef, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   ActivityIndicator,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Import the CustomAlert and PolicyPopup components
// import CustomAlert from '../components/CustomAlert';
// import PolicyPopup from '../components/DynamicContentPopup';
// import { UserContext } from '../contexts/UserContext';

// const { width, height } = Dimensions.get('window');

// const LoginScreen = () => {
//   const navigation = useNavigation();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');

//   // State to control the policy popup
//   const [policyPopupVisible, setPolicyPopupVisible] = useState(false);
//   const [policyType, setPolicyType] = useState(''); // 'privacy' or 'terms'

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const { login } = useContext(UserContext);

//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;
//   const passwordInputRef = useRef();

//   const startAnimations = () => {
//     Animated.parallel([
//       Animated.timing(iconOpacity, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.spring(iconTranslateY, {
//         toValue: 0,
//         friction: 5,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   };

//   useEffect(() => {
//     startAnimations();
//   }, []);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter both email and password.');
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);
//     const response = await login(email, password);
//     setLoading(false);

//     if (!response.success) {
//       setAlertTitle('Login Failed');
//       setAlertMessage('Invalid email or password.');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//   };

//   // Open the popup with the appropriate policy type
//   const openPolicyPopup = (type) => {
//     setPolicyType(type);
//     setPolicyPopupVisible(true);
//   };

//   return (
//     <LinearGradient
//       colors={theme === 'light' ? ['#ffffff', '#e6f7ff'] : ['#121212', '#1f1f1f']}
//       style={styles.background}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.overlay}
//       >
//         <View style={styles.container}>
//           <Animated.View
//             style={{
//               opacity: iconOpacity,
//               transform: [{ translateY: iconTranslateY }],
//               alignItems: 'center',
//               marginBottom: 30,
//             }}
//           >
//             <Icon name="login" size={100} color={currentTheme.primaryColor} />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               Welcome Back
//             </Text>
//           </Animated.View>
//           <View style={styles.inputContainer}>
//             <View
//               style={[
//                 styles.inputWrapper,
//                 { backgroundColor: currentTheme.inputBackground },
//               ]}
//             >
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Email"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 accessibilityLabel="Email Input"
//                 returnKeyType="next"
//                 onSubmitEditing={() => passwordInputRef.current.focus()}
//                 blurOnSubmit={false}
//               />
//             </View>
//             <View
//               style={[
//                 styles.inputWrapper,
//                 { backgroundColor: currentTheme.inputBackground },
//               ]}
//             >
//               <Icon
//                 name="lock"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={passwordInputRef}
//                 placeholder="Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 secureTextEntry
//                 onChangeText={setPassword}
//                 accessibilityLabel="Password Input"
//                 returnKeyType="done"
//                 onSubmitEditing={handleLogin}
//               />
//             </View>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('ForgotPassword')}
//               style={styles.forgotPasswordButton}
//               accessibilityLabel="Forgot Password Button"
//               accessibilityRole="button"
//             >
//               <Text style={[styles.forgotPasswordText, { color: currentTheme.secondaryColor }]}>
//                 Forgot Password?
//               </Text>
//             </TouchableOpacity>
//           </View>
//           <Animated.View
//             style={{
//               transform: [{ scale: buttonScale }],
//               width: '100%',
//               alignItems: 'center',
//             }}
//           >
//             <TouchableOpacity
//               style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//               onPress={handleLogin}
//               activeOpacity={0.8}
//               accessibilityLabel="Login Button"
//               accessibilityRole="button"
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>LOGIN</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>
//           <View style={styles.registerContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Don't have an account?
//             </Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('Register')}
//               accessibilityLabel="Sign Up Button"
//               accessibilityRole="button"
//             >
//               <Text style={[styles.registerText, { color: currentTheme.secondaryColor }]}>
//                 {' '}Sign Up
//               </Text>
//             </TouchableOpacity>
//           </View>
//           <View style={styles.legalContainer}>
//             {/* Use the modal popup instead of navigation */}
//             <TouchableOpacity onPress={() => openPolicyPopup('privacy')}>
//               <Text style={[styles.legalText, { color: currentTheme.placeholderTextColor }]}>
//                 Privacy Policy
//               </Text>
//             </TouchableOpacity>
//             <Text style={[styles.legalText, { color: currentTheme.placeholderTextColor }]}> | </Text>
//             <TouchableOpacity onPress={() => openPolicyPopup('terms')}>
//               <Text style={[styles.legalText, { color: currentTheme.placeholderTextColor }]}>
//                 Terms of Use
//               </Text>
//             </TouchableOpacity>
//           </View>
//           {/* Custom Alert */}
//           <CustomAlert
//             visible={alertVisible}
//             title={alertTitle}
//             message={alertMessage}
//             onClose={handleCloseAlert}
//             icon={alertTitle === 'Validation Error' ? 'alert-circle' : 'close-circle'}
//           />
//           {/* Policy Popup Modal */}
//           <PolicyPopup
//             type={policyType}
//             visible={policyPopupVisible}
//             onClose={() => setPolicyPopupVisible(false)}
//             themeStyles={currentTheme}
//             headerBackground={currentTheme.headerBackground}
//             headerTextColor={currentTheme.headerTextColor}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// // ... styles remain unchanged
// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width: width,
//     height: height,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     width: '85%',
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     marginTop: 10,
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 20,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//     borderRadius: 30,
//     borderWidth: 1,
//     borderColor: '#d9d9d9',
//     paddingHorizontal: 15,
//   },
//   inputIcon: {
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     fontSize: 16,
//   },
//   forgotPasswordButton: {
//     alignSelf: 'flex-end',
//     marginTop: 5,
//   },
//   forgotPasswordText: {
//     fontSize: 14,
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     marginTop: 10,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   registerContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   registerText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   legalText: {
//     fontSize: 12,
//   },
// });

// export default LoginScreen;


