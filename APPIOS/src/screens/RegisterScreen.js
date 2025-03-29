// src/screens/RegisterScreen.js
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



const RegisterScreen = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  const { register } = useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const confirmPasswordInputRef = useRef();

  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(new Animated.Value(-scale(50))).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

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
  }, [scaleFactor]);

  const evaluatePasswordStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6) {
      if (/[a-z]/.test(pw)) score++;
      if (/[A-Z]/.test(pw)) score++;
      if (/[0-9]/.test(pw)) score++;
      if (/[^A-Za-z0-9]/.test(pw)) score++;
      if (pw.length >= 8) score++;
    }
    setPasswordScore(score);

    let strengthLabel = 'Too Short';
    switch (score) {
      case 1:
      case 2:
        strengthLabel = 'Weak';
        break;
      case 3:
        strengthLabel = 'Medium';
        break;
      case 4:
        strengthLabel = 'Strong';
        break;
      case 5:
        strengthLabel = 'Very Strong';
        break;
      default:
        strengthLabel = 'Too Short';
    }
    setPasswordStrength(strengthLabel);
  };

  const handlePasswordChange = (pw) => {
    setPassword(pw);
    evaluatePasswordStrength(pw);
    if (confirmPassword !== '') {
      setPasswordsMatch(pw === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (cpw) => {
    setConfirmPassword(cpw);
    setPasswordsMatch(password === cpw);
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setAlertTitle('Validation Error');
      setAlertMessage('Please fill in all fields.');
      setAlertIcon('alert-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    if (password.length < 6) {
      setAlertTitle('Validation Error');
      setAlertMessage('Password must be at least 6 characters long.');
      setAlertIcon('alert-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertTitle('Validation Error');
      setAlertMessage('Passwords do not match.');
      setAlertIcon('alert-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    const userData = { name, email, password, role: 'user' };
    const response = await register(userData);
    setLoading(false);

    if (response.success) {
      setAlertTitle('Success');
      setAlertMessage('Account created successfully!');
      setAlertIcon('checkmark-circle');
      setAlertButtons([
        {
          text: 'OK',
          onPress: () => {
            setAlertVisible(false);
            navigation.navigate('Main');
          },
        },
      ]);
      setAlertVisible(true);
    } else {
      setAlertTitle('Registration Failed');
      setAlertMessage(response.message);
      setAlertIcon('close-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'Too Short':
        return currentTheme.passwordStrengthTooShortColor;
      case 'Weak':
        return currentTheme.passwordStrengthWeakColor;
      case 'Medium':
        return currentTheme.passwordStrengthMediumColor;
      case 'Strong':
        return currentTheme.passwordStrengthStrongColor;
      case 'Very Strong':
        return currentTheme.passwordStrengthVeryStrongColor;
      default:
        return currentTheme.passwordStrengthWeakColor;
    }
  };

  // Dynamically compute styles using the scale function and scaleFactor.
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
      marginTop: scale(10),
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: scale(10),
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
    passwordStrengthContainer: {
      width: '100%',
      marginBottom: scale(10),
    },
    passwordStrengthBar: {
      height: scale(8),
      borderRadius: scale(4),
      backgroundColor: 'grey',
    },
    passwordStrengthText: {
      marginTop: scale(5),
      fontSize: scale(14),
      fontWeight: 'bold',
      alignSelf: 'flex-end',
    },
    passwordMismatchText: {
      fontSize: scale(14),
      marginTop: -scale(5),
      marginBottom: scale(10),
      alignSelf: 'flex-start',
      marginLeft: scale(50),
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
    loginContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: scale(15),
    },
    accountText: {
      fontSize: scale(16),
    },
    loginText: {
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
                Create Your Account
              </Text>

              <View style={styles.inputContainer}>
                <View style={[styles.inputWrapper, { backgroundColor: currentTheme.inputBackgroundColor, borderColor: currentTheme.inputBorderColor }]}>
                  <Icon
                    name="person"
                    size={scale(24)}
                    color={currentTheme.placeholderTextColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Name"
                    placeholderTextColor={currentTheme.placeholderTextColor}
                    style={[styles.input, { color: currentTheme.textColor }]}
                    onChangeText={setName}
                    returnKeyType="next"
                    onSubmitEditing={() => emailInputRef.current.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                <View style={[styles.inputWrapper, { backgroundColor: currentTheme.inputBackgroundColor, borderColor: currentTheme.inputBorderColor }]}>
                  <Icon
                    name="email"
                    size={scale(24)}
                    color={currentTheme.placeholderTextColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={emailInputRef}
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

                <View style={[styles.inputWrapper, { backgroundColor: currentTheme.inputBackgroundColor, borderColor: currentTheme.inputBorderColor }]}>
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
                    onChangeText={handlePasswordChange}
                    returnKeyType="next"
                    onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
                    blurOnSubmit={false}
                  />
                </View>

                {password !== '' && (
                  <View style={styles.passwordStrengthContainer}>
                    <View
                      style={[
                        styles.passwordStrengthBar,
                        {
                          width: `${(passwordScore / 5) * 100}%`,
                          backgroundColor: getPasswordStrengthColor(),
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.passwordStrengthText,
                        { color: getPasswordStrengthColor() },
                      ]}
                    >
                      {passwordStrength}
                    </Text>
                  </View>
                )}

                <View style={[styles.inputWrapper, { backgroundColor: currentTheme.inputBackgroundColor, borderColor: currentTheme.inputBorderColor }]}>
                  <Icon
                    name="lock-outline"
                    size={scale(24)}
                    color={currentTheme.placeholderTextColor}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    ref={confirmPasswordInputRef}
                    placeholder="Confirm Password"
                    placeholderTextColor={currentTheme.placeholderTextColor}
                    style={[styles.input, { color: currentTheme.textColor }]}
                    secureTextEntry
                    onChangeText={handleConfirmPasswordChange}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                </View>
                {!passwordsMatch && confirmPassword !== '' && (
                  <Text style={[styles.passwordMismatchText, { color: currentTheme.passwordMismatchTextColor }]}>
                    Passwords do not match
                  </Text>
                )}
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
                  onPress={handleRegister}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>
                      REGISTER
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.loginContainer}>
                <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
                  Already have an account?
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={[styles.loginText, { color: currentTheme.secondaryColor }]}>
                    {' '}Login
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
                  textStyle={{ color: currentTheme.secondaryColor, fontSize: scale(12) }}
                />
              </View>

              <CustomAlert
                visible={alertVisible}
                title={alertTitle}
                message={alertMessage}
                icon={alertIcon}
                onClose={() => setAlertVisible(false)}
                buttons={alertButtons}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RegisterScreen;








// // src/screens/RegisterScreen.js

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

// const RegisterScreen = () => {
//   const navigation = useNavigation();
//   const { width, height } = useWindowDimensions();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');

//   const [password, setPassword] = useState('');
//   const [passwordStrength, setPasswordStrength] = useState('');
//   const [passwordScore, setPasswordScore] = useState(0);
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [passwordsMatch, setPasswordsMatch] = useState(true);

//   const { register } = useContext(UserContext);
//   const [loading, setLoading] = useState(false);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const emailInputRef = useRef();
//   const passwordInputRef = useRef();
//   const confirmPasswordInputRef = useRef();

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

//   const evaluatePasswordStrength = (pw) => {
//     let score = 0;
//     if (pw.length >= 6) {
//       if (/[a-z]/.test(pw)) score++;
//       if (/[A-Z]/.test(pw)) score++;
//       if (/[0-9]/.test(pw)) score++;
//       if (/[^A-Za-z0-9]/.test(pw)) score++;
//       if (pw.length >= 8) score++;
//     }
//     setPasswordScore(score);

//     let strengthLabel = 'Too Short';
//     switch (score) {
//       case 1:
//       case 2:
//         strengthLabel = 'Weak';
//         break;
//       case 3:
//         strengthLabel = 'Medium';
//         break;
//       case 4:
//         strengthLabel = 'Strong';
//         break;
//       case 5:
//         strengthLabel = 'Very Strong';
//         break;
//       default:
//         strengthLabel = 'Too Short';
//     }
//     setPasswordStrength(strengthLabel);
//   };

//   const handlePasswordChange = (pw) => {
//     setPassword(pw);
//     evaluatePasswordStrength(pw);
//     if (confirmPassword !== '') {
//       setPasswordsMatch(pw === confirmPassword);
//     }
//   };

//   const handleConfirmPasswordChange = (cpw) => {
//     setConfirmPassword(cpw);
//     setPasswordsMatch(password === cpw);
//   };

//   const handleRegister = async () => {
//     if (!name || !email || !password || !confirmPassword) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please fill in all fields.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     if (password.length < 6) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Password must be at least 6 characters long.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     if (password !== confirmPassword) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Passwords do not match.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);
//     const userData = { name, email, password, role: 'user' };
//     const response = await register(userData);
//     setLoading(false);

//     if (response.success) {
//       setAlertTitle('Success');
//       setAlertMessage('Account created successfully!');
//       setAlertIcon('checkmark-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => {
//             setAlertVisible(false);
//             navigation.navigate('Main');
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     } else {
//       setAlertTitle('Registration Failed');
//       setAlertMessage(response.message);
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const getPasswordStrengthColor = () => {
//     switch (passwordStrength) {
//       case 'Too Short':
//         return currentTheme.passwordStrengthTooShortColor;
//       case 'Weak':
//         return currentTheme.passwordStrengthWeakColor;
//       case 'Medium':
//         return currentTheme.passwordStrengthMediumColor;
//       case 'Strong':
//         return currentTheme.passwordStrengthStrongColor;
//       case 'Very Strong':
//         return currentTheme.passwordStrengthVeryStrongColor;
//       default:
//         return currentTheme.passwordStrengthWeakColor;
//     }
//   };

//   return (
//     <LinearGradient
//       colors={theme === 'light' ? currentTheme.authBackground : currentTheme.authBackground}
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
//                 Create Your Account
//               </Text>

//               <View style={styles.inputContainer}>
//                 <View style={[styles.inputWrapper, { backgroundColor: currentTheme.inputBackgroundColor, borderColor: currentTheme.inputBorderColor }]}>
//                   <Icon
//                     name="person"
//                     size={24}
//                     color={currentTheme.placeholderTextColor}
//                     style={styles.inputIcon}
//                   />
//                   <TextInput
//                     placeholder="Name"
//                     placeholderTextColor={currentTheme.placeholderTextColor}
//                     style={[styles.input, { color: currentTheme.textColor }]}
//                     onChangeText={setName}
//                     returnKeyType="next"
//                     onSubmitEditing={() => emailInputRef.current.focus()}
//                     blurOnSubmit={false}
//                   />
//                 </View>

//                 <View style={[styles.inputWrapper, { backgroundColor: currentTheme.inputBackgroundColor, borderColor: currentTheme.inputBorderColor }]}>
//                   <Icon
//                     name="email"
//                     size={24}
//                     color={currentTheme.placeholderTextColor}
//                     style={styles.inputIcon}
//                   />
//                   <TextInput
//                     ref={emailInputRef}
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

//                 <View style={[styles.inputWrapper, { backgroundColor: currentTheme.inputBackgroundColor, borderColor: currentTheme.inputBorderColor }]}>
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
//                     onChangeText={handlePasswordChange}
//                     returnKeyType="next"
//                     onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
//                     blurOnSubmit={false}
//                   />
//                 </View>

//                 {password !== '' && (
//                   <View style={styles.passwordStrengthContainer}>
//                     <View
//                       style={[
//                         styles.passwordStrengthBar,
//                         {
//                           width: `${(passwordScore / 5) * 100}%`,
//                           backgroundColor: getPasswordStrengthColor(),
//                         },
//                       ]}
//                     />
//                     <Text
//                       style={[
//                         styles.passwordStrengthText,
//                         { color: getPasswordStrengthColor() },
//                       ]}
//                     >
//                       {passwordStrength}
//                     </Text>
//                   </View>
//                 )}

//                 <View style={[styles.inputWrapper, { backgroundColor: currentTheme.inputBackgroundColor,borderColor: currentTheme.inputBorderColor }]}>
//                   <Icon
//                     name="lock-outline"
//                     size={24}
//                     color={currentTheme.placeholderTextColor}
//                     style={styles.inputIcon}
//                   />
//                   <TextInput
//                     ref={confirmPasswordInputRef}
//                     placeholder="Confirm Password"
//                     placeholderTextColor={currentTheme.placeholderTextColor}
//                     style={[styles.input, { color: currentTheme.textColor }]}
//                     secureTextEntry
//                     onChangeText={handleConfirmPasswordChange}
//                     returnKeyType="done"
//                     onSubmitEditing={handleRegister}
//                   />
//                 </View>
//                 {!passwordsMatch && confirmPassword !== '' && (
//                   <Text style={[styles.passwordMismatchText, { color: currentTheme.passwordMismatchTextColor }]}>Passwords do not match</Text>
//                 )}
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
//                   onPress={handleRegister}
//                   activeOpacity={0.8}
//                 >
//                   {loading ? (
//                     <ActivityIndicator size="small" color='#FFFFFF'/>
//                   ) : (
//                     <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>REGISTER</Text>
//                   )}
//                 </TouchableOpacity>
//               </Animated.View>

//               <View style={styles.loginContainer}>
//                 <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//                   Already have an account?
//                 </Text>
//                 <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//                   <Text style={[styles.loginText, { color: currentTheme.secondaryColor }]}>
//                     {' '}Login
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
//                 icon={alertIcon}
//                 onClose={() => setAlertVisible(false)}
//                 buttons={alertButtons}
//               />
//             </View>
//           </ScrollView>
//         </KeyboardAvoidingView>
//       </SafeAreaView>
//     </LinearGradient>
//   );
// };

// export default RegisterScreen;

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
//     fontSize: 18,
//     marginTop: 10,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 10,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//     borderRadius: 15,
//     borderWidth: 1,
//     // borderColor: 'rgba(255,255,255,0.4)',
//     // backgroundColor: 'rgba(255,255,255,0.2)',
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
//   passwordStrengthContainer: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   passwordStrengthBar: {
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'grey',
//   },
//   passwordStrengthText: {
//     marginTop: 5,
//     fontSize: 14,
//     fontWeight: 'bold',
//     alignSelf: 'flex-end',
//   },
//   passwordMismatchText: {
//     // color: 'red',
//     fontSize: 14,
//     marginTop: -5,
//     marginBottom: 10,
//     alignSelf: 'flex-start',
//     marginLeft: 50,
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
//   loginContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   loginText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });











// // src/screens/RegisterScreen.js

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
// import { registerUser } from '../services/api'; // Or from context
// import CustomAlert from '../components/CustomAlert';
// import { UserContext } from '../contexts/UserContext';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// // NEW: Reusable brand-name component
// import AppBrandName from '../components/AppBrandName';

// const { width, height } = Dimensions.get('window');

// const RegisterScreen = () => {
//   const navigation = useNavigation();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');

//   // Password & confirm
//   const [password, setPassword] = useState('');
//   const [passwordStrength, setPasswordStrength] = useState('');
//   const [passwordScore, setPasswordScore] = useState(0);
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [passwordsMatch, setPasswordsMatch] = useState(true);

//   const { register } = useContext(UserContext);
//   const [loading, setLoading] = useState(false);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Refs
//   const emailInputRef = useRef();
//   const passwordInputRef = useRef();
//   const confirmPasswordInputRef = useRef();

//   // Animations
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

//   // Evaluate password strength
//   const evaluatePasswordStrength = (pw) => {
//     let score = 0;
//     if (pw.length >= 6) {
//       if (/[a-z]/.test(pw)) score++;
//       if (/[A-Z]/.test(pw)) score++;
//       if (/[0-9]/.test(pw)) score++;
//       if (/[^A-Za-z0-9]/.test(pw)) score++;
//       if (pw.length >= 8) score++;
//     }
//     setPasswordScore(score);

//     let strengthLabel = 'Too Short';
//     switch (score) {
//       case 1:
//       case 2:
//         strengthLabel = 'Weak';
//         break;
//       case 3:
//         strengthLabel = 'Medium';
//         break;
//       case 4:
//         strengthLabel = 'Strong';
//         break;
//       case 5:
//         strengthLabel = 'Very Strong';
//         break;
//       default:
//         strengthLabel = 'Too Short';
//     }
//     setPasswordStrength(strengthLabel);
//   };

//   const handlePasswordChange = (pw) => {
//     setPassword(pw);
//     evaluatePasswordStrength(pw);
//     if (confirmPassword !== '') {
//       setPasswordsMatch(pw === confirmPassword);
//     }
//   };

//   const handleConfirmPasswordChange = (cpw) => {
//     setConfirmPassword(cpw);
//     setPasswordsMatch(password === cpw);
//   };

//   const handleRegister = async () => {
//     if (!name || !email || !password || !confirmPassword) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please fill in all fields.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     if (password.length < 6) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Password must be at least 6 characters long.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     if (password !== confirmPassword) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Passwords do not match.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);
//     const userData = { name, email, password, role: 'user' };
//     const response = await register(userData);
//     setLoading(false);

//     if (response.success) {
//       setAlertTitle('Success');
//       setAlertMessage('Account created successfully!');
//       setAlertIcon('checkmark-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => {
//             setAlertVisible(false);
//             navigation.navigate('Main');
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     } else {
//       setAlertTitle('Registration Failed');
//       setAlertMessage(response.message);
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const getPasswordStrengthColor = () => {
//     switch (passwordStrength) {
//       case 'Too Short':
//       case 'Weak':
//         return 'red';
//       case 'Medium':
//         return 'orange';
//       case 'Strong':
//         return 'yellowgreen';
//       case 'Very Strong':
//         return 'green';
//       default:
//         return 'grey';
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
//             Create Your Account
//           </Text>

//           <View style={styles.inputContainer}>
//             {/* Name Input */}
//             <View style={[styles.inputWrapper]}>
//               <Icon
//                 name="person"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Name"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 onChangeText={setName}
//                 returnKeyType="next"
//                 onSubmitEditing={() => emailInputRef.current.focus()}
//                 blurOnSubmit={false}
//               />
//             </View>

//             {/* Email Input */}
//             <View style={[styles.inputWrapper]}>
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={emailInputRef}
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

//             {/* Password Input */}
//             <View style={[styles.inputWrapper]}>
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
//                 onChangeText={handlePasswordChange}
//                 returnKeyType="next"
//                 onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
//                 blurOnSubmit={false}
//               />
//             </View>

//             {/* Password Strength */}
//             {password !== '' && (
//               <View style={styles.passwordStrengthContainer}>
//                 <View
//                   style={[
//                     styles.passwordStrengthBar,
//                     {
//                       width: `${(passwordScore / 5) * 100}%`,
//                       backgroundColor: getPasswordStrengthColor(),
//                     },
//                   ]}
//                 />
//                 <Text
//                   style={[
//                     styles.passwordStrengthText,
//                     { color: getPasswordStrengthColor() },
//                   ]}
//                 >
//                   {passwordStrength}
//                 </Text>
//               </View>
//             )}

//             {/* Confirm Password */}
//             <View style={[styles.inputWrapper]}>
//               <Icon
//                 name="lock-outline"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={confirmPasswordInputRef}
//                 placeholder="Confirm Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 secureTextEntry
//                 onChangeText={handleConfirmPasswordChange}
//                 returnKeyType="done"
//                 onSubmitEditing={handleRegister}
//               />
//             </View>
//             {!passwordsMatch && confirmPassword !== '' && (
//               <Text style={styles.passwordMismatchText}>Passwords do not match</Text>
//             )}
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
//               onPress={handleRegister}
//               activeOpacity={0.8}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>REGISTER</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <View style={styles.loginContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Already have an account?
//             </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//               <Text style={[styles.loginText, { color: currentTheme.secondaryColor }]}>
//                 {' '}Login
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
//             icon={alertIcon}
//             onClose={() => setAlertVisible(false)}
//             buttons={alertButtons}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default RegisterScreen;

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
//     marginTop: 10,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     width: '100%',
//     marginTop: 10,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.4)',
//     backgroundColor: 'rgba(255,255,255,0.2)',
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
//   passwordStrengthContainer: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   passwordStrengthBar: {
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'grey',
//   },
//   passwordStrengthText: {
//     marginTop: 5,
//     fontSize: 14,
//     fontWeight: 'bold',
//     alignSelf: 'flex-end',
//   },
//   passwordMismatchText: {
//     color: 'red',
//     fontSize: 14,
//     marginTop: -5,
//     marginBottom: 10,
//     alignSelf: 'flex-start',
//     marginLeft: 50,
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
//   loginContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   loginText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });








// // src/screens/RegisterScreen.js

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
// import { registerUser } from '../services/api'; // if you have this
// import CustomAlert from '../components/CustomAlert';
// import { UserContext } from '../contexts/UserContext';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// const { width, height } = Dimensions.get('window');

// const RegisterScreen = () => {
//   const navigation = useNavigation();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');

//   // Password states
//   const [password, setPassword] = useState('');
//   const [passwordStrength, setPasswordStrength] = useState('');
//   const [passwordScore, setPasswordScore] = useState(0);

//   // Confirm password
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [passwordsMatch, setPasswordsMatch] = useState(true);

//   const { register } = useContext(UserContext);

//   const [loading, setLoading] = useState(false);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animations
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

//   // Refs
//   const emailInputRef = useRef();
//   const passwordInputRef = useRef();
//   const confirmPasswordInputRef = useRef();

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

//   // Evaluate password strength
//   const evaluatePasswordStrength = (pw) => {
//     let score = 0;
//     if (pw.length >= 6) {
//       if (/[a-z]/.test(pw)) score++;
//       if (/[A-Z]/.test(pw)) score++;
//       if (/[0-9]/.test(pw)) score++;
//       if (/[^A-Za-z0-9]/.test(pw)) score++;
//       if (pw.length >= 8) score++;
//     }
//     setPasswordScore(score);

//     let strengthLabel = 'Too Short';
//     switch (score) {
//       case 1:
//       case 2:
//         strengthLabel = 'Weak';
//         break;
//       case 3:
//         strengthLabel = 'Medium';
//         break;
//       case 4:
//         strengthLabel = 'Strong';
//         break;
//       case 5:
//         strengthLabel = 'Very Strong';
//         break;
//       default:
//         strengthLabel = 'Too Short';
//     }
//     setPasswordStrength(strengthLabel);
//   };

//   const handlePasswordChange = (pw) => {
//     setPassword(pw);
//     evaluatePasswordStrength(pw);
//     if (confirmPassword !== '') {
//       setPasswordsMatch(pw === confirmPassword);
//     }
//   };

//   const handleConfirmPasswordChange = (cpw) => {
//     setConfirmPassword(cpw);
//     setPasswordsMatch(password === cpw);
//   };

//   const handleRegister = async () => {
//     if (!name || !email || !password || !confirmPassword) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please fill in all fields.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     if (password.length < 6) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Password must be at least 6 characters long.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     if (password !== confirmPassword) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Passwords do not match.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);
//     const userData = { name, email, password, role: 'user' };
//     const response = await register(userData);
//     setLoading(false);

//     if (response.success) {
//       setAlertTitle('Success');
//       setAlertMessage('Account created successfully!');
//       setAlertIcon('checkmark-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => {
//             setAlertVisible(false);
//             navigation.navigate('Main');
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     } else {
//       setAlertTitle('Registration Failed');
//       setAlertMessage(response.message);
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     }
//   };

//   const getPasswordStrengthColor = () => {
//     switch (passwordStrength) {
//       case 'Too Short':
//       case 'Weak':
//         return 'red';
//       case 'Medium':
//         return 'orange';
//       case 'Strong':
//         return 'yellowgreen';
//       case 'Very Strong':
//         return 'green';
//       default:
//         return 'grey';
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
//               Create Your Account
//             </Text>
//           </Animated.View>

//           <View style={styles.inputContainer}>
//             {/* Name Input */}
//             <View style={[styles.inputWrapper]}>
//               <Icon
//                 name="person"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Name"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 onChangeText={setName}
//                 returnKeyType="next"
//                 onSubmitEditing={() => emailInputRef.current.focus()}
//                 blurOnSubmit={false}
//               />
//             </View>

//             {/* Email Input */}
//             <View style={[styles.inputWrapper]}>
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={emailInputRef}
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

//             {/* Password Input */}
//             <View style={[styles.inputWrapper]}>
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
//                 onChangeText={handlePasswordChange}
//                 returnKeyType="next"
//                 onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
//                 blurOnSubmit={false}
//               />
//             </View>

//             {/* Password Strength */}
//             {password !== '' && (
//               <View style={styles.passwordStrengthContainer}>
//                 <View
//                   style={[
//                     styles.passwordStrengthBar,
//                     {
//                       width: `${(passwordScore / 5) * 100}%`,
//                       backgroundColor: getPasswordStrengthColor(),
//                     },
//                   ]}
//                 />
//                 <Text
//                   style={[
//                     styles.passwordStrengthText,
//                     { color: getPasswordStrengthColor() },
//                   ]}
//                 >
//                   {passwordStrength}
//                 </Text>
//               </View>
//             )}

//             {/* Confirm Password */}
//             <View style={[styles.inputWrapper]}>
//               <Icon
//                 name="lock-outline"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={confirmPasswordInputRef}
//                 placeholder="Confirm Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[styles.input, { color: currentTheme.textColor }]}
//                 secureTextEntry
//                 onChangeText={handleConfirmPasswordChange}
//                 returnKeyType="done"
//                 onSubmitEditing={handleRegister}
//               />
//             </View>
//             {!passwordsMatch && confirmPassword !== '' && (
//               <Text style={styles.passwordMismatchText}>Passwords do not match</Text>
//             )}
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
//               onPress={handleRegister}
//               activeOpacity={0.8}
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>REGISTER</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>

//           <View style={styles.loginContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Already have an account?
//             </Text>
//             <TouchableOpacity onPress={() => navigation.navigate('Login')}>
//               <Text style={[styles.loginText, { color: currentTheme.secondaryColor }]}>
//                 {' '}Login
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
//             icon={alertIcon}
//             onClose={() => setAlertVisible(false)}
//             buttons={alertButtons}
//           />
//         </View>
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default RegisterScreen;

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
//     marginTop: 10,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//     borderRadius: 15,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.4)',
//     backgroundColor: 'rgba(255,255,255,0.2)',
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
//   passwordStrengthContainer: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   passwordStrengthBar: {
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'grey',
//   },
//   passwordStrengthText: {
//     marginTop: 5,
//     fontSize: 14,
//     fontWeight: 'bold',
//     alignSelf: 'flex-end',
//   },
//   passwordMismatchText: {
//     color: 'red',
//     fontSize: 14,
//     marginTop: -5,
//     marginBottom: 10,
//     alignSelf: 'flex-start',
//     marginLeft: 50,
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
//   loginContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 15,
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   loginText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });









// // src/screens/RegisterScreen.js

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
// import { registerUser } from '../services/api';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert
// import { UserContext } from '../contexts/UserContext';
// import LegalLinksPopup from '../components/LegalLinksPopup';
// const { width, height } = Dimensions.get('window');

// const RegisterScreen = () => {
//   const navigation = useNavigation();
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');

//   // Password states
//   const [password, setPassword] = useState('');
//   const [passwordStrength, setPasswordStrength] = useState(''); // New state for password strength
//   const [passwordScore, setPasswordScore] = useState(0); // Numeric score for password strength

//   // Confirm password state
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [passwordsMatch, setPasswordsMatch] = useState(true); // New state for password match

//   const { register } = useContext(UserContext);

//   // Loading state
//   const [loading, setLoading] = useState(false);

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;
//   const buttonScale = useRef(new Animated.Value(1)).current;

//   // Create refs for input fields
//   const emailInputRef = useRef();
//   const passwordInputRef = useRef();
//   const confirmPasswordInputRef = useRef();

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

//   // Function to evaluate password strength
//   const evaluatePasswordStrength = (password) => {
//     let strength = '';
//     let score = 0;

//     if (password.length >= 6) {
//       if (/[a-z]/.test(password)) score++; // Lowercase letters
//       if (/[A-Z]/.test(password)) score++; // Uppercase letters
//       if (/[0-9]/.test(password)) score++; // Numbers
//       if (/[^A-Za-z0-9]/.test(password)) score++; // Special characters
//       if (password.length >= 8) score++; // Bonus for length

//       switch (score) {
//         case 1:
//         case 2:
//           strength = 'Weak';
//           break;
//         case 3:
//           strength = 'Medium';
//           break;
//         case 4:
//           strength = 'Strong';
//           break;
//         case 5:
//           strength = 'Very Strong';
//           break;
//         default:
//           strength = 'Weak';
//       }
//     } else {
//       strength = 'Too Short';
//     }

//     setPasswordStrength(strength);
//     setPasswordScore(score);
//   };

//   const handlePasswordChange = (password) => {
//     setPassword(password);
//     evaluatePasswordStrength(password);

//     // Check if passwords match
//     if (confirmPassword !== '') {
//       setPasswordsMatch(password === confirmPassword);
//     }
//   };

//   const handleConfirmPasswordChange = (confirmPassword) => {
//     setConfirmPassword(confirmPassword);
//     setPasswordsMatch(password === confirmPassword);
//   };

//   const handleRegister = async () => {
//     if (!name || !email || !password || !confirmPassword) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Please fill in all fields.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }

//     if (password.length < 6) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Password must be at least 6 characters long.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }

//     if (password !== confirmPassword) {
//       setAlertTitle('Validation Error');
//       setAlertMessage('Passwords do not match.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//       return;
//     }

//     setLoading(true);

//     // Simulate registration API call
//     const userData = { name, email, password, role: 'user' };
//     const response = await register(userData);
//     setLoading(false);
//     console.log(response);
    

//     if (response.success) {
//       setAlertTitle('Success');
//       setAlertMessage('Account created successfully!');
//       setAlertIcon('checkmark-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => {
//             setAlertVisible(false);
//             navigation.navigate('Main');
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     } else {
//       setAlertTitle('Registration Failed');
//       setAlertMessage(response.message);
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         {
//           text: 'OK',
//           onPress: () => setAlertVisible(false),
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   // Function to get color based on password strength
//   const getPasswordStrengthColor = () => {
//     switch (passwordStrength) {
//       case 'Too Short':
//         return 'red';
//       case 'Weak':
//         return 'red';
//       case 'Medium':
//         return 'orange';
//       case 'Strong':
//         return 'yellowgreen';
//       case 'Very Strong':
//         return 'green';
//       default:
//         return 'grey';
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
//             <Icon name="person-add" size={100} color={currentTheme.primaryColor} />
//             <Text style={[styles.title, { color: currentTheme.textColor }]}>
//               Create Account
//             </Text>
//           </Animated.View>
//           <View style={styles.inputContainer}>
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="person"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 placeholder="Name"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                     backgroundColor: currentTheme.inputBackground,
//                   },
//                 ]}
//                 onChangeText={setName}
//                 accessibilityLabel="Name Input"
//                 returnKeyType="next"
//                 onSubmitEditing={() => {
//                   emailInputRef.current.focus();
//                 }}
//                 blurOnSubmit={false}
//               />
//             </View>
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="email"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={emailInputRef}
//                 placeholder="Email"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                     backgroundColor: currentTheme.inputBackground,
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
//             <View style={styles.inputWrapper}>
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
//                     backgroundColor: currentTheme.inputBackground,
//                   },
//                 ]}
//                 secureTextEntry
//                 onChangeText={handlePasswordChange}
//                 accessibilityLabel="Password Input"
//                 returnKeyType="next"
//                 onSubmitEditing={() => {
//                   confirmPasswordInputRef.current.focus();
//                 }}
//                 blurOnSubmit={false}
//               />
//             </View>
//             {/* Password Strength Indicator */}
//             {password !== '' && (
//               <View style={styles.passwordStrengthContainer}>
//                 <View
//                   style={[
//                     styles.passwordStrengthBar,
//                     {
//                       width: `${(passwordScore / 5) * 100}%`,
//                       backgroundColor: getPasswordStrengthColor(),
//                     },
//                   ]}
//                 />
//                 <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor() }]}>
//                   {passwordStrength}
//                 </Text>
//               </View>
//             )}
//             <View style={styles.inputWrapper}>
//               <Icon
//                 name="lock-outline"
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//                 style={styles.inputIcon}
//               />
//               <TextInput
//                 ref={confirmPasswordInputRef}
//                 placeholder="Confirm Password"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 style={[
//                   styles.input,
//                   {
//                     color: currentTheme.textColor,
//                     backgroundColor: currentTheme.inputBackground,
//                   },
//                 ]}
//                 secureTextEntry
//                 onChangeText={handleConfirmPasswordChange}
//                 accessibilityLabel="Confirm Password Input"
//                 returnKeyType="done"
//                 onSubmitEditing={handleRegister}
//               />
//             </View>
//             {/* Password Match Indicator */}
//             {confirmPassword !== '' && !passwordsMatch && (
//               <Text style={styles.passwordMismatchText}>Passwords do not match</Text>
//             )}
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
//               onPress={handleRegister}
//               activeOpacity={0.8}
//               accessibilityLabel="Register Button"
//               accessibilityRole="button"
//             >
//               {loading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.buttonText}>REGISTER</Text>
//               )}
//             </TouchableOpacity>
//           </Animated.View>
//           <View style={styles.loginContainer}>
//             <Text style={[styles.accountText, { color: currentTheme.textColor }]}>
//               Already have an account?
//             </Text>
//             <TouchableOpacity
//               onPress={() => navigation.navigate('Login')}
//               accessibilityLabel="Login Button"
//               accessibilityRole="button"
//             >
//               <Text
//                 style={[
//                   styles.loginText,
//                   { color: currentTheme.secondaryColor },
//                 ]}
//               >
//                 {' '}
//                 Login
//               </Text>
//             </TouchableOpacity>
//           </View>
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
//             icon={alertIcon}
//             onClose={() => setAlertVisible(false)}
//             buttons={alertButtons}
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
//   passwordStrengthContainer: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   passwordStrengthBar: {
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'grey',
//   },
//   passwordStrengthText: {
//     marginTop: 5,
//     fontSize: 14,
//     fontWeight: 'bold',
//     alignSelf: 'flex-end',
//   },
//   passwordMismatchText: {
//     color: 'red',
//     fontSize: 14,
//     marginTop: -5,
//     marginBottom: 10,
//     alignSelf: 'flex-start',
//     marginLeft: 50, // Adjust to align with the input fields
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
//   loginContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   accountText: {
//     fontSize: 16,
//   },
//   loginText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });


// export default RegisterScreen;



