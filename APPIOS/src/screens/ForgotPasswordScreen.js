import React, { useState, useRef, useContext, useMemo } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert';
import LegalLinksPopup from '../components/LegalLinksPopup';
import AppBrandName from '../components/AppBrandName';

import { useDispatch } from 'react-redux';
import { forgotPwd } from '../store/slices/authSlice';


const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');

  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(-scale(50))).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const dispatch = useDispatch();

  const handleResetPassword = async () => {
    if (!email) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please enter your email.');
      setAlertIcon('alert-circle');
      setAlertVisible(true);
      return;
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please enter a valid email address.');
      setAlertIcon('alert-circle');
      setAlertVisible(true);
      return;
    }
    setLoading(true);
    try {
      const response = await dispatch(forgotPwd(email)).unwrap();
      setLoading(false);
      if (response.success) {
        setAlertTitle('Success');
        setAlertMessage('A reset link has been sent to your email.');
        setAlertIcon('checkmark-circle');
        setAlertVisible(true);
      } else {
        setAlertTitle('Error');
        setAlertMessage(response.message);
        setAlertIcon('close-circle');
        setAlertVisible(true);
      }
    } catch (err) {
      setLoading(false);
      setAlertTitle('Error');
      setAlertMessage(err.message || 'Failed to send reset link.');
      setAlertIcon('close-circle');
      setAlertVisible(true);
    }
  };

  const handleCloseAlert = () => {
    setAlertVisible(false);
    if (alertTitle === 'Success') {
      navigation.navigate('Otp', { email });
    }
  };

  // Responsive styles computed with useMemo
  const styles = useMemo(() => StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    background: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    container: {
      width: '90%',
      alignItems: 'center',
    },
    subtitle: {
      fontSize: scale(18),
      marginTop: scale(5),
      fontWeight: '600',
    },
    inputContainer: {
      width: '100%',
      marginTop: scale(20),
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: scale(10),
      borderRadius: scale(15),
      borderWidth: 1,
      paddingHorizontal: scale(15),
    },
    inputIcon: {
      marginRight: scale(10),
    },
    input: {
      flex: 1,
      height: scale(50),
      fontSize: scale(16),
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
      letterSpacing: 1.1,
    },
    backToLoginButton: {
      marginTop: scale(20),
    },
    backToLoginText: {
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
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={currentTheme.authBackground}
        style={[styles.background, { width, height }]}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <AppBrandName
                brandName="Ai-Nsider"
                primaryColor={currentTheme.primaryColor}
                textColor={currentTheme.textColor}
              />
              <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
                Forgot Your Password?
              </Text>
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  { 
                    backgroundColor: currentTheme.inputBackgroundColor,
                    borderColor: currentTheme.inputBorderColor,
                  },
                ]}>
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
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                </View>
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
                  onPress={handleResetPassword}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>
                      SEND RESET LINK
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.backToLoginButton}
              >
                <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
                  Back to Login
                </Text>
              </TouchableOpacity>
              <View style={styles.legalContainer}>
                <LegalLinksPopup
                  staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
                  themeStyles={{
                    cardBackground: currentTheme.cardBackground,
                    textColor: currentTheme.textColor,
                    primaryColor: currentTheme.primaryColor,
                  }}
                  headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
                  textStyle={{ color: currentTheme.secondaryColor, fontSize: scale(12) }}
                />
              </View>
              <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                onClose={handleCloseAlert}
                icon={alertIcon}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;







// import React, { useState, useRef, useContext } from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   useWindowDimensions,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';
// import LegalLinksPopup from '../components/LegalLinksPopup';
// import AppBrandName from '../components/AppBrandName';

// import { useDispatch } from 'react-redux';
// import { forgotPwd } from '../store/slices/authSlice';

// const ForgotPasswordScreen = () => {
//   const [email, setEmail] = useState('');
//   const navigation = useNavigation();

//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

//   const dispatch = useDispatch();
//   const { width, height } = useWindowDimensions();

//   const handleResetPassword = async () => {
//     if (!email) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter your email.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     const emailRegex = /\S+@\S+\.\S+/;
//     if (!emailRegex.test(email)) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter a valid email address.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await dispatch(forgotPwd(email)).unwrap();
//       setLoading(false);
//       if (response.success) {
//         setAlertTitle('Success');
//         setAlertMessage('A reset link has been sent to your email.');
//         setAlertIcon('checkmark-circle');
//         setAlertVisible(true);
//       } else {
//         setAlertTitle('Error');
//         setAlertMessage(response.message);
//         setAlertIcon('close-circle');
//         setAlertVisible(true);
//       }
//     } catch (err) {
//       setLoading(false);
//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to send reset link.');
//       setAlertIcon('close-circle');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//     if (alertTitle === 'Success') {
//       navigation.navigate('Otp', { email });
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <LinearGradient
//         colors={
//           theme === 'light'
//             ? currentTheme.authBackground
//             : currentTheme.authBackground
//         }
//         style={[styles.background, { width, height }]}
//       >
//         <KeyboardAvoidingView
//           behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//           style={styles.keyboardView}
//         >
//           <ScrollView
//             contentContainerStyle={styles.scrollContainer}
//             keyboardShouldPersistTaps="handled"
//           >
//             <View style={styles.container}>
//               <AppBrandName
//                 brandName="Ai-Nsider"
//                 primaryColor={currentTheme.primaryColor}
//                 textColor={currentTheme.textColor}
//               />
//               <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//                 Forgot Your Password?
//               </Text>

//               <View style={styles.inputContainer}>
//                 <View
//                   style={[
//                     styles.inputWrapper,
//                     { backgroundColor: currentTheme.inputBackgroundColor,borderColor: currentTheme.inputBorderColor, },
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
//                     returnKeyType="done"
//                     onSubmitEditing={handleResetPassword}
//                   />
//                 </View>
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
//                   onPress={handleResetPassword}
//                   activeOpacity={0.8}
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color='#FFFFFF'/>
//                   ) : (
//                     <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>SEND RESET LINK</Text>
//                   )}
//                 </TouchableOpacity>
//               </Animated.View>

//               <TouchableOpacity
//                 onPress={() => navigation.navigate('Login')}
//                 style={styles.backToLoginButton}
//               >
//                 <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//                   Back to Login
//                 </Text>
//               </TouchableOpacity>

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
//                 icon={alertIcon}
//               />
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </LinearGradient>
//     </SafeAreaView>
//   );
// };

// export default ForgotPasswordScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   background: {
//     flex: 1,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   container: {
//     width: '90%',
//     alignItems: 'center',
//   },
//   subtitle: {
//     fontSize: 18,
//     marginTop: 5,
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
//     // borderColor: 'rgba(255,255,255,0.4)',
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
//     fontSize: 16,
//     fontWeight: 'bold',
//     letterSpacing: 1.1,
//   },
//   backToLoginButton: {
//     marginTop: 20,
//   },
//   backToLoginText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     // textDecorationLine: 'underline',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });








// // src/screens/ForgotPasswordScreen.js

// import React, { useState, useRef, useContext } from 'react';
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
// import LegalLinksPopup from '../components/LegalLinksPopup';
// import AppBrandName from '../components/AppBrandName';

// // NEW: Import useDispatch and forgotPwd thunk from authSlice
// import { useDispatch } from 'react-redux';
// import { forgotPwd } from '../store/slices/authSlice';

// const { width, height } = Dimensions.get('window');

// const ForgotPasswordScreen = () => {
//   const [email, setEmail] = useState('');
//   const navigation = useNavigation();

//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

//   // NEW: Initialize Redux dispatcher
//   const dispatch = useDispatch();

//   const handleResetPassword = async () => {
//     if (!email) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter your email.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     const emailRegex = /\S+@\S+\.\S+/;
//     if (!emailRegex.test(email)) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter a valid email address.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);
//     try {
//       // Use Redux thunk instead of a direct API call
//       const response = await dispatch(forgotPwd(email)).unwrap();
//       setLoading(false);
//       if (response.success) {
//         setAlertTitle('Success');
//         setAlertMessage('A reset link has been sent to your email.');
//         setAlertIcon('checkmark-circle');
//         setAlertVisible(true);
//       } else {
//         setAlertTitle('Error');
//         setAlertMessage(response.message);
//         setAlertIcon('close-circle');
//         setAlertVisible(true);
//       }
//     } catch (err) {
//       setLoading(false);
//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to send reset link.');
//       setAlertIcon('close-circle');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//     if (alertTitle === 'Success') {
//       navigation.navigate('Otp', { email });
//     }
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
//           <AppBrandName
//             brandName="Ai-Nsider"
//             primaryColor={currentTheme.primaryColor}
//             textColor={currentTheme.textColor}
//           />
//           <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//             Forgot Your Password?
//           </Text>

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
//                 returnKeyType="done"
//                 onSubmitEditing={handleResetPassword}
//               />
//             </View>
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
//               onPress={handleResetPassword}
//               activeOpacity={0.8}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>SEND RESET LINK</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <TouchableOpacity
//             onPress={() => navigation.navigate('Login')}
//             style={styles.backToLoginButton}
//           >
//             <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//               Back to Login
//             </Text>
//           </TouchableOpacity>

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
//             icon={alertIcon}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default ForgotPasswordScreen;

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
//   subtitle: {
//     fontSize: 18,
//     marginTop: 5,
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
//   backToLoginButton: {
//     marginTop: 20,
//   },
//   backToLoginText: {
//     fontSize: 16,
//     textDecorationLine: 'underline',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });








// // src/screens/ForgotPasswordScreen.js

// import React, { useState, useRef, useContext } from 'react';
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
// import { forgotPassword } from '../services/api';
// import CustomAlert from '../components/CustomAlert';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// // NEW: Reusable brand-name component
// import AppBrandName from '../components/AppBrandName';

// const { width, height } = Dimensions.get('window');

// const ForgotPasswordScreen = () => {
//   const [email, setEmail] = useState('');
//   const navigation = useNavigation();

//   const [loading, setLoading] = useState(false);
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

//   const handleResetPassword = async () => {
//     if (!email) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter your email.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     const emailRegex = /\S+@\S+\.\S+/;
//     if (!emailRegex.test(email)) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter a valid email address.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);
//     const response = await forgotPassword(email);
//     setLoading(false);

//     if (response.success) {
//       setAlertTitle('Success');
//       setAlertMessage('A reset link has been sent to your email.');
//       setAlertIcon('checkmark-circle');
//       setAlertVisible(true);
//     } else {
//       setAlertTitle('Error');
//       setAlertMessage(response.message);
//       setAlertIcon('close-circle');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//     if (alertTitle === 'Success') {
//       navigation.navigate('Otp', { email });
//     }
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
//           {/* Reusable brand name + subtitle */}
//           <AppBrandName
//             brandName="Ai-Nsider"
//             primaryColor={currentTheme.primaryColor}
//             textColor={currentTheme.textColor}
//           />
//           <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//             Forgot Your Password?
//           </Text>

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
//                 returnKeyType="done"
//                 onSubmitEditing={handleResetPassword}
//               />
//             </View>
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
//               onPress={handleResetPassword}
//               activeOpacity={0.8}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>SEND RESET LINK</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <TouchableOpacity
//             onPress={() => navigation.navigate('Login')}
//             style={styles.backToLoginButton}
//           >
//             <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//               Back to Login
//             </Text>
//           </TouchableOpacity>

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
//             icon={alertIcon}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default ForgotPasswordScreen;

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
//   subtitle: {
//     fontSize: 18,
//     marginTop: 5,
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
//   backToLoginButton: {
//     marginTop: 20,
//   },
//   backToLoginText: {
//     fontSize: 16,
//     textDecorationLine: 'underline',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });








// // src/screens/ForgotPasswordScreen.js

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
// import { forgotPassword } from '../services/api';
// import CustomAlert from '../components/CustomAlert';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// const { width, height } = Dimensions.get('window');

// const ForgotPasswordScreen = () => {
//   const [email, setEmail] = useState('');
//   const navigation = useNavigation();

//   const [loading, setLoading] = useState(false);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

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

//   const handleResetPassword = async () => {
//     if (!email) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter your email.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     const emailRegex = /\S+@\S+\.\S+/;
//     if (!emailRegex.test(email)) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter a valid email address.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);
//     const response = await forgotPassword(email);
//     setLoading(false);

//     if (response.success) {
//       setAlertTitle('Success');
//       setAlertMessage('A reset link has been sent to your email.');
//       setAlertIcon('checkmark-circle');
//       setAlertVisible(true);
//     } else {
//       setAlertTitle('Error');
//       setAlertMessage(response.message);
//       setAlertIcon('close-circle');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//     if (alertTitle === 'Success') {
//       navigation.navigate('Otp', { email });
//     }
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
//               Forgot Your Password?
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
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                   },
//                 ]}
//                 onChangeText={setEmail}
//                 autoCapitalize="none"
//                 keyboardType="email-address"
//                 returnKeyType="done"
//                 onSubmitEditing={handleResetPassword}
//               />
//             </View>
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
//               onPress={handleResetPassword}
//               activeOpacity={0.8}
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>SEND RESET LINK</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <TouchableOpacity
//             onPress={() => navigation.navigate('Login')}
//             style={styles.backToLoginButton}
//           >
//             <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//               Back to Login
//             </Text>
//           </TouchableOpacity>

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
//             icon={alertIcon}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default ForgotPasswordScreen;

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
//   backToLoginButton: {
//     marginTop: 20,
//   },
//   backToLoginText: {
//     fontSize: 16,
//     textDecorationLine: 'underline',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });









// // src/screens/ForgotPasswordScreen.js

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
// import { forgotPassword } from '../services/api';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert
// import LegalLinksPopup from '../components/LegalLinksPopup';

// const { width, height } = Dimensions.get('window');

// const ForgotPasswordScreen = () => {
//   const [email, setEmail] = useState('');
//   const navigation = useNavigation();

//   // Loading state
//   const [loading, setLoading] = useState(false);

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

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

//   const handleResetPassword = async () => {
//     if (!email) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter your email.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     // Simple email format validation
//     const emailRegex = /\S+@\S+\.\S+/;
//     if (!emailRegex.test(email)) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please enter a valid email address.');
//       setAlertIcon('alert-circle');
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);

//     // Simulate reset password API call
//     const response = await forgotPassword(email);
//     setLoading(false);

//     if (response.success) {
//       setAlertTitle('Success');
//       setAlertMessage('A reset link has been sent to your email.');
//       setAlertIcon('checkmark-circle');
//       setAlertVisible(true);
//     } else {
//       setAlertTitle('Error');
//       setAlertMessage(response.message);
//       setAlertIcon('close-circle');
//       setAlertVisible(true);
//     }
//   };

//   const handleCloseAlert = () => {
//     setAlertVisible(false);
//     if (alertTitle === 'Success') {
//       navigation.navigate('Otp', { email }); // Navigate to the OTP screen after successful reset request
//     }
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
//             <Icon name="lock-reset" size={100} color={currentTheme.primaryColor} />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               Reset Password
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
//                 returnKeyType="done"
//                 onSubmitEditing={handleResetPassword}
//               />
//             </View>
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
//               onPress={handleResetPassword}
//               activeOpacity={0.8}
//               accessibilityLabel="Send Reset Link Button"
//               accessibilityRole="button"
//               disabled={loading}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>SEND RESET LINK</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>
//           <TouchableOpacity
//             onPress={() => navigation.navigate('Login')}
//             accessibilityLabel="Back to Login Button"
//             accessibilityRole="button"
//             style={styles.backToLoginButton}
//           >
//             <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//               Back to Login
//             </Text>
//           </TouchableOpacity>

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
//             icon={alertIcon}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
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
//     backgroundColor: '#ffffff',
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
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   backToLoginButton: {
//     marginTop: 20,
//   },
//   backToLoginText: {
//     fontSize: 16,
//   },
// });


// export default ForgotPasswordScreen;

