// src/screens/NewPasswordScreen.js
import React, { useState, useRef, useContext, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert';
import LegalLinksPopup from '../components/LegalLinksPopup';
import AppBrandName from '../components/AppBrandName';
import { useDispatch } from 'react-redux';
import { resetPwd } from '../store/slices/authSlice';


const NewPasswordScreen = () => {
  const { width, height } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const route = useRoute();
  const { email } = route.params;

  // Password visibility
  const [secureEntry, setSecureEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

  // Loading / Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Confirm password ref
  const confirmPasswordInputRef = useRef(null);

  // Optional: password strength helper
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[@$!%*?&#]/.test(password)) strength += 1;
    return strength;
  };

  const renderPasswordStrength = () => {
    const strength = getPasswordStrength(newPassword);
    const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['#E53935', '#FB8C00', '#FDD835', '#43A047'];

    if (newPassword.length === 0) return null;
    return (
      <View style={styles.passwordStrengthContainer}>
        <View
          style={[
            styles.strengthBar,
            { backgroundColor: strengthColors[strength - 1] || '#E53935' },
          ]}
        />
        <Text
          style={[
            styles.strengthText,
            { color: strengthColors[strength - 1] || '#E53935' },
          ]}
        >
          {strengthLabels[strength - 1] || 'Weak'}
        </Text>
      </View>
    );
  };

  // Redux dispatcher
  const dispatch = useDispatch();

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (getPasswordStrength(newPassword) < 3) {
      setError('Password is too weak. Please use a stronger password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const result = await dispatch(resetPwd({ email, newPassword })).unwrap();
      setLoading(false);
      if (result) {
        setAlertTitle('Success');
        setAlertMessage('Your password has been updated successfully!');
        setAlertIcon('checkmark-circle');
        setAlertButtons([
          {
            text: 'OK',
            onPress: () => {
              setAlertVisible(false);
              navigation.navigate('Login');
            },
          },
        ]);
        setAlertVisible(true);
      } else {
        setError('Failed to update password. Please try again later.');
      }
    } catch (err) {
      setLoading(false);
      setError('An error occurred. Please try again.');
      console.error('Update Password Error:', err);
    }
  };

  // Responsive styles computed with useMemo
  const styles = useMemo(() => StyleSheet.create({
    background: {
      flex: 1,
    },
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    subtitle: {
      fontSize: scale(18),
      marginBottom: scale(10),
      fontWeight: '600',
    },
    inputContainer: {
      width: '85%',
      marginTop: scale(10),
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: scale(10),
      borderRadius: scale(15),
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
    visibilityIcon: {
      padding: scale(5),
    },
    passwordStrengthContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: scale(5),
      marginBottom: scale(5),
    },
    strengthBar: {
      width: scale(50),
      height: scale(5),
      borderRadius: scale(5),
      marginRight: scale(10),
    },
    strengthText: {
      fontSize: scale(14),
      fontWeight: '500',
    },
    errorText: {
      fontSize: scale(14),
      marginTop: scale(5),
      textAlign: 'center',
    },
    buttonContainer: {
      width: '85%',
      marginTop: scale(10),
    },
    button: {
      width: '100%',
      paddingVertical: scale(15),
      borderRadius: scale(30),
      alignItems: 'center',
      elevation: 3,
    },
    buttonText: {
      fontSize: scale(16),
      fontWeight: 'bold',
      letterSpacing: scale(1.1),
    },
    backToLoginButton: {
      marginTop: scale(20),
    },
    backToLoginText: {
      fontSize: scale(16),
      fontWeight: 'bold',
      // textDecorationLine: 'underline',
    },
    legalContainer: {
      marginTop: scale(20),
    },
    // Additional container style for the content
  }), [scaleFactor]);

  return (
    <LinearGradient
      colors={currentTheme.authBackground}
      style={[styles.background, { width, height }]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <AppBrandName
          brandName="Ai-Nsider"
          primaryColor={currentTheme.primaryColor}
          textColor={currentTheme.textColor}
        />
        <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
          Set Your New Password
        </Text>
        <View style={styles.inputContainer}>
          {/* New Password */}
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor: currentTheme.inputBorderColor,
                backgroundColor: currentTheme.inputBackgroundColor,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={scale(24)}
              color={currentTheme.placeholderTextColor}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder="New Password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              style={[styles.input, { color: currentTheme.textColor }]}
              secureTextEntry={secureEntry}
              onChangeText={setNewPassword}
              value={newPassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
              blurOnSubmit={false}
            />
            <TouchableOpacity
              onPress={() => setSecureEntry(!secureEntry)}
              style={styles.visibilityIcon}
            >
              <Ionicons
                name={secureEntry ? 'eye-off' : 'eye'}
                size={scale(24)}
                color={currentTheme.placeholderTextColor}
              />
            </TouchableOpacity>
          </View>
          {renderPasswordStrength()}
          {/* Confirm Password */}
          <View
            style={[
              styles.inputWrapper,
              {
                borderColor: currentTheme.inputBorderColor,
                backgroundColor: currentTheme.inputBackgroundColor,
              },
            ]}
          >
            <Ionicons
              name="lock-open-outline"
              size={scale(24)}
              color={currentTheme.placeholderTextColor}
              style={styles.inputIcon}
            />
            <TextInput
              ref={confirmPasswordInputRef}
              placeholder="Confirm Password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              style={[styles.input, { color: currentTheme.textColor }]}
              secureTextEntry={secureConfirmEntry}
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              returnKeyType="done"
              onSubmitEditing={handleUpdatePassword}
            />
            <TouchableOpacity
              onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
              style={styles.visibilityIcon}
            >
              <Ionicons
                name={secureConfirmEntry ? 'eye-off' : 'eye'}
                size={scale(24)}
                color={currentTheme.placeholderTextColor}
              />
            </TouchableOpacity>
          </View>
          {error ? (
            <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>{error}</Text>
          ) : null}
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>
                UPDATE PASSWORD
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
            textStyle={{ color: currentTheme.secondaryColor }}
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
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default NewPasswordScreen;












// // src/screens/NewPasswordScreen.js

// import React, { useState, useRef, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   useWindowDimensions,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// // NEW: Import reusable brand component and Redux tools
// import AppBrandName from '../components/AppBrandName';
// import { useDispatch } from 'react-redux';
// import { resetPwd } from '../store/slices/authSlice';

// const NewPasswordScreen = () => {
//   const { width, height } = useWindowDimensions();
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const route = useRoute();
//   const { email } = route.params;

//   // Password visibility
//   const [secureEntry, setSecureEntry] = useState(true);
//   const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

//   // Loading / Error
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Alert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Confirm password ref
//   const confirmPasswordInputRef = useRef(null);

//   // For password strength (optional)
//   const getPasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 8) strength += 1;
//     if (/[A-Z]/.test(password)) strength += 1;
//     if (/[0-9]/.test(password)) strength += 1;
//     if (/[@$!%*?&#]/.test(password)) strength += 1;
//     return strength;
//   };

//   const renderPasswordStrength = () => {
//     const strength = getPasswordStrength(newPassword);
//     const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
//     const strengthColors = ['#E53935', '#FB8C00', '#FDD835', '#43A047'];

//     if (newPassword.length === 0) return null;
//     return (
//       <View style={styles.passwordStrengthContainer}>
//         <View
//           style={[
//             styles.strengthBar,
//             { backgroundColor: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         />
//         <Text
//           style={[
//             styles.strengthText,
//             { color: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         >
//           {strengthLabels[strength - 1] || 'Weak'}
//         </Text>
//       </View>
//     );
//   };

//   // NEW: Redux dispatcher
//   const dispatch = useDispatch();

//   const handleUpdatePassword = async () => {
//     if (!newPassword || !confirmPassword) {
//       setError('Please fill in all fields.');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     if (getPasswordStrength(newPassword) < 3) {
//       setError('Password is too weak. Please use a stronger password.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Dispatch the resetPwd thunk instead of calling the API directly
//       const result = await dispatch(resetPwd({ email, newPassword })).unwrap();
//       setLoading(false);

//       if (result) {
//         setAlertTitle('Success');
//         setAlertMessage('Your password has been updated successfully!');
//         setAlertIcon('checkmark-circle');
//         setAlertButtons([
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Login');
//             },
//           },
//         ]);
//         setAlertVisible(true);
//       } else {
//         setError('Failed to update password. Please try again later.');
//       }
//     } catch (err) {
//       setLoading(false);
//       setError('An error occurred. Please try again.');
//       console.error('Update Password Error:', err);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={
//         theme === 'light'
//           ? currentTheme.authBackground
//           : currentTheme.authBackground
//       }
//       style={[styles.background, { width, height }]}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.overlay}
//       >
//         {/* Reusable brand name */}
//         <AppBrandName
//           brandName="Ai-Nsider"
//           primaryColor={currentTheme.primaryColor}
//           textColor={currentTheme.textColor}
//         />
//         <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//           Set Your New Password
//         </Text>

//         <View style={styles.inputContainer}>
//           {/* New Password */}
//           <View style={[styles.inputWrapper, { borderColor: currentTheme.inputBorderColor, backgroundColor: currentTheme.inputBackgroundColor }]}>
//             <Ionicons
//               name="lock-closed-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               placeholder="New Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[styles.input, { color: currentTheme.textColor }]}
//               secureTextEntry={secureEntry}
//               onChangeText={setNewPassword}
//               value={newPassword}
//               returnKeyType="next"
//               onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
//               blurOnSubmit={false}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureEntry(!secureEntry)}
//               style={styles.visibilityIcon}
//             >
//               <Ionicons
//                 name={secureEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {renderPasswordStrength()}

//           {/* Confirm Password */}
//           <View style={[styles.inputWrapper, { borderColor: currentTheme.inputBorderColor, backgroundColor: currentTheme.inputBackgroundColor }]}>
//             <Ionicons
//               name="lock-open-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               ref={confirmPasswordInputRef}
//               placeholder="Confirm Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[styles.input, { color: currentTheme.textColor }]}
//               secureTextEntry={secureConfirmEntry}
//               onChangeText={setConfirmPassword}
//               value={confirmPassword}
//               returnKeyType="done"
//               onSubmitEditing={handleUpdatePassword}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
//               style={styles.visibilityIcon}
//             >
//               <Ionicons
//                 name={secureConfirmEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {error ? <Text style={[styles.errorText, { color: currentTheme.errorTextColorr }]}>{error}</Text> : null}
//         </View>

//         {/* Update Password Button */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={handleUpdatePassword}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#FFFFFF" />
//             ) : (
//               <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>UPDATE PASSWORD</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Back to Login */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Login')}
//           style={styles.backToLoginButton}
//         >
//           <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//             Back to Login
//           </Text>
//         </TouchableOpacity>

//         {/* Legal Links */}
//         <View style={styles.legalContainer}>
//           <LegalLinksPopup
//             staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
//             themeStyles={{
//               cardBackground: currentTheme.cardBackground,
//               textColor: currentTheme.textColor,
//               primaryColor: currentTheme.primaryColor,
//             }}
//             headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//             textStyle={{ color: currentTheme.secondaryColor }}
//           />
//         </View>

//         <CustomAlert
//           visible={alertVisible}
//           title={alertTitle}
//           message={alertMessage}
//           icon={alertIcon}
//           onClose={() => setAlertVisible(false)}
//           buttons={alertButtons}
//         />
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default NewPasswordScreen;

// const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//   },
//   overlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     width: '85%',
//     marginTop: 10,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 10,
//     borderRadius: 15,
//     // borderWidth: 1,
//     // borderColor: 'rgba(255,255,255,0.4)',
//     // backgroundColor: 'rgba(255,255,255,0.2)',
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
//   visibilityIcon: {
//     padding: 5,
//   },
//   passwordStrengthContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 5,
//     marginBottom: 5,
//   },
//   strengthBar: {
//     width: 50,
//     height: 5,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   strengthText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   errorText: {
//     // color: '#E53935',
//     fontSize: 14,
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     width: '85%',
//     marginTop: 10,
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
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
//     fontWeight: 'bold'
//     // textDecorationLine: 'underline',
//   },
//   legalContainer: {
//     marginTop: 20,
//   },
// });









// // src/screens/NewPasswordScreen.js

// import React, { useState, useRef, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   Animated,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// // NEW: Import reusable brand component and Redux tools
// import AppBrandName from '../components/AppBrandName';
// import { useDispatch } from 'react-redux';
// import { resetPwd } from '../store/slices/authSlice';

// const { width, height } = Dimensions.get('window');

// const NewPasswordScreen = () => {
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const route = useRoute();
//   const { email } = route.params;

//   // Password visibility
//   const [secureEntry, setSecureEntry] = useState(true);
//   const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

//   // Loading / Error
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Alert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Confirm password ref
//   const confirmPasswordInputRef = useRef(null);

//   // For password strength (optional)
//   const getPasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 8) strength += 1;
//     if (/[A-Z]/.test(password)) strength += 1;
//     if (/[0-9]/.test(password)) strength += 1;
//     if (/[@$!%*?&#]/.test(password)) strength += 1;
//     return strength;
//   };

//   const renderPasswordStrength = () => {
//     const strength = getPasswordStrength(newPassword);
//     const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
//     const strengthColors = ['#E53935', '#FB8C00', '#FDD835', '#43A047'];

//     if (newPassword.length === 0) return null;
//     return (
//       <View style={styles.passwordStrengthContainer}>
//         <View
//           style={[
//             styles.strengthBar,
//             { backgroundColor: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         />
//         <Text
//           style={[
//             styles.strengthText,
//             { color: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         >
//           {strengthLabels[strength - 1] || 'Weak'}
//         </Text>
//       </View>
//     );
//   };

//   // NEW: Redux dispatcher
//   const dispatch = useDispatch();

//   const handleUpdatePassword = async () => {
//     if (!newPassword || !confirmPassword) {
//       setError('Please fill in all fields.');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     if (getPasswordStrength(newPassword) < 3) {
//       setError('Password is too weak. Please use a stronger password.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Dispatch the resetPwd thunk instead of calling the API directly
//       const result = await dispatch(resetPwd({ email, newPassword })).unwrap();
//       setLoading(false);

//       if (result) {
//         setAlertTitle('Success');
//         setAlertMessage('Your password has been updated successfully!');
//         setAlertIcon('checkmark-circle');
//         setAlertButtons([
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Login');
//             },
//           },
//         ]);
//         setAlertVisible(true);
//       } else {
//         setError('Failed to update password. Please try again later.');
//       }
//     } catch (err) {
//       setLoading(false);
//       setError('An error occurred. Please try again.');
//       console.error('Update Password Error:', err);
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
//         {/* Reusable brand name */}
//         <AppBrandName
//           brandName="Ai-Nsider"
//           primaryColor={currentTheme.primaryColor}
//           textColor={currentTheme.textColor}
//         />
//         <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//           Set Your New Password
//         </Text>

//         <View style={styles.inputContainer}>
//           {/* New Password */}
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-closed-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               placeholder="New Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[styles.input, { color: currentTheme.textColor }]}
//               secureTextEntry={secureEntry}
//               onChangeText={setNewPassword}
//               value={newPassword}
//               returnKeyType="next"
//               onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
//               blurOnSubmit={false}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureEntry(!secureEntry)}
//               style={styles.visibilityIcon}
//             >
//               <Ionicons
//                 name={secureEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {renderPasswordStrength()}

//           {/* Confirm Password */}
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-open-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               ref={confirmPasswordInputRef}
//               placeholder="Confirm Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[styles.input, { color: currentTheme.textColor }]}
//               secureTextEntry={secureConfirmEntry}
//               onChangeText={setConfirmPassword}
//               value={confirmPassword}
//               returnKeyType="done"
//               onSubmitEditing={handleUpdatePassword}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
//               style={styles.visibilityIcon}
//             >
//               <Ionicons
//                 name={secureConfirmEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//         </View>

//         {/* Update Password Button */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={handleUpdatePassword}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#FFFFFF" />
//             ) : (
//               <Text style={styles.buttonText}>UPDATE PASSWORD</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Back to Login */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Login')}
//           style={styles.backToLoginButton}
//         >
//           <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//             Back to Login
//           </Text>
//         </TouchableOpacity>

//         {/* Legal Links */}
//         <View style={styles.legalContainer}>
//           <LegalLinksPopup
//             staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
//             themeStyles={{
//               cardBackground: currentTheme.cardBackground,
//               textColor: currentTheme.textColor,
//               primaryColor: currentTheme.primaryColor,
//             }}
//             headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//             textStyle={{ color: currentTheme.secondaryColor }}
//           />
//         </View>

//         <CustomAlert
//           visible={alertVisible}
//           title={alertTitle}
//           message={alertMessage}
//           icon={alertIcon}
//           onClose={() => setAlertVisible(false)}
//           buttons={alertButtons}
//         />
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default NewPasswordScreen;

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
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     width: '85%',
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
//   visibilityIcon: {
//     padding: 5,
//   },
//   passwordStrengthContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 5,
//     marginBottom: 5,
//   },
//   strengthBar: {
//     width: 50,
//     height: 5,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   strengthText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: '#E53935',
//     fontSize: 14,
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     width: '85%',
//     marginTop: 10,
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
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
//     marginTop: 20,
//   },
// });










// // src/screens/NewPasswordScreen.js

// import React, { useState, useRef, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
//   Animated,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { resetPassword } from '../services/api';
// import CustomAlert from '../components/CustomAlert';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// // NEW: Reusable brand-name component
// import AppBrandName from '../components/AppBrandName';

// const { width, height } = Dimensions.get('window');

// const NewPasswordScreen = () => {
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const route = useRoute();
//   const { email } = route.params;

//   // Password visibility
//   const [secureEntry, setSecureEntry] = useState(true);
//   const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

//   // Loading / Error
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Alert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Confirm password ref
//   const confirmPasswordInputRef = useRef(null);

//   // For password strength (optional)
//   const getPasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 8) strength += 1;
//     if (/[A-Z]/.test(password)) strength += 1;
//     if (/[0-9]/.test(password)) strength += 1;
//     if (/[@$!%*?&#]/.test(password)) strength += 1;
//     return strength;
//   };

//   const renderPasswordStrength = () => {
//     const strength = getPasswordStrength(newPassword);
//     const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
//     const strengthColors = ['#E53935', '#FB8C00', '#FDD835', '#43A047'];

//     if (newPassword.length === 0) return null;
//     return (
//       <View style={styles.passwordStrengthContainer}>
//         <View
//           style={[
//             styles.strengthBar,
//             { backgroundColor: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         />
//         <Text
//           style={[
//             styles.strengthText,
//             { color: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         >
//           {strengthLabels[strength - 1] || 'Weak'}
//         </Text>
//       </View>
//     );
//   };

//   const handleUpdatePassword = async () => {
//     if (!newPassword || !confirmPassword) {
//       setError('Please fill in all fields.');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     if (getPasswordStrength(newPassword) < 3) {
//       setError('Password is too weak. Please use a stronger password.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await resetPassword(email, newPassword);
//       setLoading(false);

//       if (response) {
//         setAlertTitle('Success');
//         setAlertMessage('Your password has been updated successfully!');
//         setAlertIcon('checkmark-circle');
//         setAlertButtons([
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Login');
//             },
//           },
//         ]);
//         setAlertVisible(true);
//       } else {
//         setError('Failed to update password. Please try again later.');
//       }
//     } catch (err) {
//       setLoading(false);
//       setError('An error occurred. Please try again.');
//       console.error('Update Password Error:', err);
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
//         {/* Reusable brand name */}
//         <AppBrandName
//           brandName="Ai-Nsider"
//           primaryColor={currentTheme.primaryColor}
//           textColor={currentTheme.textColor}
//         />
//         <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//           Set Your New Password
//         </Text>

//         <View style={styles.inputContainer}>
//           {/* New Password */}
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-closed-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               placeholder="New Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[styles.input, { color: currentTheme.textColor }]}
//               secureTextEntry={secureEntry}
//               onChangeText={setNewPassword}
//               value={newPassword}
//               returnKeyType="next"
//               onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
//               blurOnSubmit={false}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureEntry(!secureEntry)}
//               style={styles.visibilityIcon}
//             >
//               <Ionicons
//                 name={secureEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {renderPasswordStrength()}

//           {/* Confirm Password */}
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-open-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               ref={confirmPasswordInputRef}
//               placeholder="Confirm Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[styles.input, { color: currentTheme.textColor }]}
//               secureTextEntry={secureConfirmEntry}
//               onChangeText={setConfirmPassword}
//               value={confirmPassword}
//               returnKeyType="done"
//               onSubmitEditing={handleUpdatePassword}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
//               style={styles.visibilityIcon}
//             >
//               <Ionicons
//                 name={secureConfirmEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//         </View>

//         {/* Update Password Button */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={handleUpdatePassword}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#FFFFFF" />
//             ) : (
//               <Text style={styles.buttonText}>UPDATE PASSWORD</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Back to Login */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Login')}
//           style={styles.backToLoginButton}
//         >
//           <Text style={[styles.backToLoginText, { color: currentTheme.secondaryColor }]}>
//             Back to Login
//           </Text>
//         </TouchableOpacity>

//         {/* Legal Links */}
//         <View style={styles.legalContainer}>
//           <LegalLinksPopup
//             staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
//             themeStyles={{
//               cardBackground: currentTheme.cardBackground,
//               textColor: currentTheme.textColor,
//               primaryColor: currentTheme.primaryColor,
//             }}
//             headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//             textStyle={{ color: currentTheme.secondaryColor }}
//           />
//         </View>

//         <CustomAlert
//           visible={alertVisible}
//           title={alertTitle}
//           message={alertMessage}
//           icon={alertIcon}
//           onClose={() => setAlertVisible(false)}
//           buttons={alertButtons}
//         />
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default NewPasswordScreen;

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
//   subtitle: {
//     fontSize: 18,
//     marginBottom: 10,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     width: '85%',
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
//   visibilityIcon: {
//     padding: 5,
//   },
//   passwordStrengthContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 5,
//     marginBottom: 5,
//   },
//   strengthBar: {
//     width: 50,
//     height: 5,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   strengthText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: '#E53935',
//     fontSize: 14,
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     width: '85%',
//     marginTop: 10,
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
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
//     marginTop: 20,
//   },
// });







// // src/screens/NewPasswordScreen.js

// import React, { useState, useRef, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { resetPassword } from '../services/api';
// import CustomAlert from '../components/CustomAlert';
// import LegalLinksPopup from '../components/LegalLinksPopup';

// const { width, height } = Dimensions.get('window');

// const NewPasswordScreen = () => {
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const route = useRoute();
//   const { email } = route.params;

//   // Password visibility states
//   const [secureEntry, setSecureEntry] = useState(true);
//   const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

//   // Loading state
//   const [loading, setLoading] = useState(false);
//   // Error state
//   const [error, setError] = useState('');

//   // State for CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animations
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;

//   // Confirm password ref
//   const confirmPasswordInputRef = useRef(null);

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

//   // Password strength (optional)
//   const getPasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 8) strength += 1;
//     if (/[A-Z]/.test(password)) strength += 1;
//     if (/[0-9]/.test(password)) strength += 1;
//     if (/[@$!%*?&#]/.test(password)) strength += 1;
//     return strength;
//   };

//   const renderPasswordStrength = () => {
//     const strength = getPasswordStrength(newPassword);
//     const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
//     const strengthColors = ['#E53935', '#FB8C00', '#FDD835', '#43A047'];

//     if (newPassword.length === 0) return null;

//     return (
//       <View style={styles.passwordStrengthContainer}>
//         <View
//           style={[
//             styles.strengthBar,
//             { backgroundColor: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         />
//         <Text
//           style={[
//             styles.strengthText,
//             { color: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         >
//           {strengthLabels[strength - 1] || 'Weak'}
//         </Text>
//       </View>
//     );
//   };

//   const handleUpdatePassword = async () => {
//     if (!newPassword || !confirmPassword) {
//       setError('Please fill in all fields.');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     if (getPasswordStrength(newPassword) < 3) {
//       setError('Password is too weak. Please use a stronger password.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const response = await resetPassword(email, newPassword);
//       setLoading(false);

//       if (response) {
//         setAlertTitle('Success');
//         setAlertMessage('Your password has been updated successfully!');
//         setAlertIcon('checkmark-circle');
//         setAlertButtons([
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Login');
//             },
//           },
//         ]);
//         setAlertVisible(true);
//       } else {
//         setError('Failed to update password. Please try again later.');
//       }
//     } catch (err) {
//       setLoading(false);
//       setError('An error occurred. Please try again.');
//       console.error('Update Password Error:', err);
//     }
//   };

//   return (
//     <LinearGradient
//       // A more vibrant gradient for the background
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
//         {/* Brand & Screen Title */}
//         <Animated.View
//           style={{
//             opacity: iconOpacity,
//             transform: [{ translateY: iconTranslateY }],
//             alignItems: 'center',
//             marginBottom: 30,
//           }}
//         >
//           <Text style={[styles.brandTitle, { color: currentTheme.primaryColor }]}>
//             Ai-Nsider
//           </Text>
//           <Text style={[styles.subtitle, { color: currentTheme.textColor }]}>
//             Set Your New Password
//           </Text>
//         </Animated.View>

//         <View style={styles.inputContainer}>
//           {/* New Password */}
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-closed-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               placeholder="New Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                 },
//               ]}
//               secureTextEntry={secureEntry}
//               onChangeText={setNewPassword}
//               value={newPassword}
//               returnKeyType="next"
//               onSubmitEditing={() => confirmPasswordInputRef.current.focus()}
//               blurOnSubmit={false}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureEntry(!secureEntry)}
//               style={styles.visibilityIcon}
//             >
//               <Ionicons
//                 name={secureEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {/* Strength bar */}
//           {renderPasswordStrength()}

//           {/* Confirm Password */}
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-open-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               ref={confirmPasswordInputRef}
//               placeholder="Confirm Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                 },
//               ]}
//               secureTextEntry={secureConfirmEntry}
//               onChangeText={setConfirmPassword}
//               value={confirmPassword}
//               returnKeyType="done"
//               onSubmitEditing={handleUpdatePassword}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
//               style={styles.visibilityIcon}
//             >
//               <Ionicons
//                 name={secureConfirmEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//         </View>

//         {/* Update Password Button */}
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={handleUpdatePassword}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#FFFFFF" />
//             ) : (
//               <Text style={styles.buttonText}>UPDATE PASSWORD</Text>
//             )}
//           </TouchableOpacity>
//         </View>

//         {/* Back to Login */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Login')}
//           style={styles.backToLoginButton}
//         >
//           <Text
//             style={[
//               styles.backToLoginText,
//               { color: currentTheme.secondaryColor },
//             ]}
//           >
//             Back to Login
//           </Text>
//         </TouchableOpacity>

//         {/* Legal Links */}
//         <View style={styles.legalContainer}>
//           <LegalLinksPopup
//             staticContent="<p>Your legal content goes here. Replace this with actual content.</p>"
//             themeStyles={{
//               cardBackground: currentTheme.cardBackground,
//               textColor: currentTheme.textColor,
//               primaryColor: currentTheme.primaryColor,
//             }}
//             headerBackground={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//             textStyle={{ color: currentTheme.secondaryColor }}
//           />
//         </View>

//         {/* CustomAlert */}
//         <CustomAlert
//           visible={alertVisible}
//           title={alertTitle}
//           message={alertMessage}
//           icon={alertIcon}
//           onClose={() => setAlertVisible(false)}
//           buttons={alertButtons}
//         />
//       </KeyboardAvoidingView>
//     </LinearGradient>
//   );
// };

// export default NewPasswordScreen;

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
//     width: '85%',
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
//   visibilityIcon: {
//     padding: 5,
//   },
//   passwordStrengthContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginLeft: 5,
//     marginBottom: 5,
//   },
//   strengthBar: {
//     width: 50,
//     height: 5,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   strengthText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: '#E53935',
//     fontSize: 14,
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     width: '85%',
//     marginTop: 10,
//   },
//   button: {
//     width: '100%',
//     paddingVertical: 15,
//     borderRadius: 30,
//     alignItems: 'center',
//     elevation: 3,
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
//     marginTop: 20,
//   },
// });







// // src/screens/NewPasswordScreen.js

// import React, { useState, useRef, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   Dimensions,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { resetPassword } from '../services/api';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert
// import LegalLinksPopup from '../components/LegalLinksPopup';

// const { width, height } = Dimensions.get('window');

// const NewPasswordScreen = () => {
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const route = useRoute();
//   const { email } = route.params;

//   // Password visibility states
//   const [secureEntry, setSecureEntry] = useState(true);
//   const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

//   // Loading state
//   const [loading, setLoading] = useState(false);

//   // Error state
//   const [error, setError] = useState('');

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const navigation = useNavigation();

//   // Get theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation values
//   const iconOpacity = useRef(new Animated.Value(0)).current;
//   const iconTranslateY = useRef(new Animated.Value(-50)).current;

//   // Ref for confirm password input
//   const confirmPasswordInputRef = useRef(null);

//   // Function to start the entrance animations
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

//   // Optional: Password strength calculation
//   const getPasswordStrength = (password) => {
//     let strength = 0;
//     if (password.length >= 8) strength += 1;
//     if (/[A-Z]/.test(password)) strength += 1;
//     if (/[0-9]/.test(password)) strength += 1;
//     if (/[@$!%*?&#]/.test(password)) strength += 1;
//     return strength;
//   };

//   const renderPasswordStrength = () => {
//     const strength = getPasswordStrength(newPassword);
//     const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
//     const strengthColors = ['#E53935', '#FB8C00', '#FDD835', '#43A047'];

//     if (newPassword.length === 0) return null;

//     return (
//       <View style={styles.passwordStrengthContainer}>
//         <View
//           style={[
//             styles.strengthBar,
//             { backgroundColor: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         />
//         <Text
//           style={[
//             styles.strengthText,
//             { color: strengthColors[strength - 1] || '#E53935' },
//           ]}
//         >
//           {strengthLabels[strength - 1] || 'Weak'}
//         </Text>
//       </View>
//     );
//   };

//   const handleUpdatePassword = async () => {
//     if (!newPassword || !confirmPassword) {
//       setError('Please fill in all fields.');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('Passwords do not match.');
//       return;
//     }

//     // Optional: Add password strength validation here
//     if (getPasswordStrength(newPassword) < 3) {
//       setError('Password is too weak. Please choose a stronger password.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       console.log(email, newPassword);

//       const response = await resetPassword(email, newPassword);
//       setLoading(false);

//       if (response) {
//         // Use CustomAlert instead of Alert.alert
//         setAlertTitle('Success');
//         setAlertMessage('Your password has been updated successfully!');
//         setAlertIcon('checkmark-circle');
//         setAlertButtons([
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Login');
//             },
//           },
//         ]);
//         setAlertVisible(true);
//       } else {
//         setError('Failed to update password. Please try again later.');
//       }
//     } catch (err) {
//       setLoading(false);
//       setError('An error occurred. Please try again.');
//       console.error('Update Password Error:', err);
//     }
//   };

//   return (
//     <LinearGradient
//       colors={
//         theme === 'light' ? ['#ffffff', '#e6f7ff'] : ['#121212', '#1f1f1f']
//       }
//       style={styles.background}
//     >
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         style={styles.overlay}
//       >
//         <Animated.View
//           style={{
//             opacity: iconOpacity,
//             transform: [{ translateY: iconTranslateY }],
//             alignItems: 'center',
//             marginBottom: 20,
//           }}
//         >
//           <Ionicons
//             name="lock-closed-outline"
//             size={100}
//             color={currentTheme.primaryColor}
//           />
//           <Text style={[styles.title, { color: currentTheme.textColor }]}>
//             New Password
//           </Text>
//         </Animated.View>
//         <View style={styles.inputContainer}>
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-closed-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               placeholder="New Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   backgroundColor: currentTheme.inputBackground,
//                 },
//               ]}
//               secureTextEntry={secureEntry}
//               onChangeText={setNewPassword}
//               value={newPassword}
//               accessibilityLabel="New Password Input"
//               returnKeyType="next"
//               onSubmitEditing={() => {
//                 confirmPasswordInputRef.current.focus();
//               }}
//               blurOnSubmit={false}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureEntry(!secureEntry)}
//               style={styles.visibilityIcon}
//               accessibilityLabel={
//                 secureEntry ? 'Show Password' : 'Hide Password'
//               }
//               accessibilityRole="button"
//             >
//               <Ionicons
//                 name={secureEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {renderPasswordStrength()}
//           <View style={styles.inputWrapper}>
//             <Ionicons
//               name="lock-open-outline"
//               size={24}
//               color={currentTheme.placeholderTextColor}
//               style={styles.inputIcon}
//             />
//             <TextInput
//               ref={confirmPasswordInputRef}
//               placeholder="Confirm Password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   backgroundColor: currentTheme.inputBackground,
//                 },
//               ]}
//               secureTextEntry={secureConfirmEntry}
//               onChangeText={setConfirmPassword}
//               value={confirmPassword}
//               accessibilityLabel="Confirm Password Input"
//               returnKeyType="done"
//               onSubmitEditing={handleUpdatePassword}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
//               style={styles.visibilityIcon}
//               accessibilityLabel={
//                 secureConfirmEntry ? 'Show Password' : 'Hide Password'
//               }
//               accessibilityRole="button"
//             >
//               <Ionicons
//                 name={secureConfirmEntry ? 'eye-off' : 'eye'}
//                 size={24}
//                 color={currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>
//           </View>
//           {error ? <Text style={styles.errorText}>{error}</Text> : null}
//         </View>
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity
//             style={[
//               styles.button,
//               { backgroundColor: currentTheme.primaryColor },
//               loading && styles.buttonLoading,
//             ]}
//             onPress={handleUpdatePassword}
//             activeOpacity={0.8}
//             accessibilityLabel="Update Password Button"
//             accessibilityRole="button"
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color="#FFFFFF" />
//             ) : (
//               <Text style={styles.buttonText}>UPDATE PASSWORD</Text>
//             )}
//           </TouchableOpacity>
//         </View>
//         <TouchableOpacity
//           onPress={() => navigation.navigate('Login')}
//           accessibilityLabel="Back to Login Button"
//           accessibilityRole="button"
//           style={styles.backToLoginButton}
//         >
//           <Text
//             style={[
//               styles.backToLoginText,
//               { color: currentTheme.secondaryColor },
//             ]}
//           >
//             Back to Login
//           </Text>
//         </TouchableOpacity>
//         <View style={styles.legalContainer}>
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
//         {/* CustomAlert Component */}
//         <CustomAlert
//           visible={alertVisible}
//           title={alertTitle}
//           message={alertMessage}
//           icon={alertIcon}
//           onClose={() => setAlertVisible(false)}
//           buttons={alertButtons}
//         />
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
//     paddingHorizontal: 20, // Added padding for better spacing on small devices
//   },
//   container: {
//     width: '100%',
//     alignItems: 'center',
//     // Removed borderRadius, backgroundColor, and shadow properties for better responsiveness
//   },
//   title: {
//     fontSize: 28,
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
//   visibilityIcon: {
//     padding: 5,
//   },
//   passwordStrengthContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   strengthBar: {
//     width: 50,
//     height: 5,
//     borderRadius: 5,
//     marginRight: 10,
//   },
//   strengthText: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   errorText: {
//     color: '#E53935',
//     fontSize: 14,
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   buttonContainer: {
//     width: '100%',
//     marginTop: 10,
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
//   buttonLoading: {
//     backgroundColor: '#004D40', // Darker shade while loading
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
//     textDecorationLine: 'underline',
//   },
//   legalContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
// });

// export default NewPasswordScreen;



