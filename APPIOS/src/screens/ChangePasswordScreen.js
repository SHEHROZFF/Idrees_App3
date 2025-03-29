// src/screens/ChangePasswordScreen.js
import React, { useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import CustomAlert from '../components/CustomAlert';
import { changePassword } from '../store/slices/authSlice';

const ChangePasswordScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const dispatch = useDispatch();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Helper scaling function: baseline width is 375px
  const baseWidth = width > 375 ? 460 : 500;
  const scale = (size) => (size * width) / baseWidth;

  // Helper to show alert
  const showAlert = (title, message, icon, buttons) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertIcon(icon);
    setAlertButtons(buttons);
    setAlertVisible(true);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      showAlert(
        'Error',
        'All fields are required.',
        'alert-circle',
        [{ text: 'OK', onPress: () => setAlertVisible(false) }]
      );
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showAlert(
        'Error',
        'New password and confirm password do not match.',
        'alert-circle',
        [{ text: 'OK', onPress: () => setAlertVisible(false) }]
      );
      return;
    }
    setLoading(true);
    try {
      await dispatch(changePassword({ oldPassword, newPassword })).unwrap();
      showAlert(
        'Success',
        'Your password has been changed successfully.',
        'checkmark-circle',
        [
          {
            text: 'OK',
            onPress: () => {
              setAlertVisible(false);
              navigation.navigate('Settings');
            },
          },
        ]
      );
    } catch (error) {
      showAlert(
        'Error',
        error || 'Failed to change password.',
        'close-circle',
        [{ text: 'OK', onPress: () => setAlertVisible(false) }]
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: currentTheme.backgroundColor,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: scale(12),
          paddingHorizontal: scale(20),
          justifyContent: 'center',
          borderBottomLeftRadius: scale(30),
          borderBottomRightRadius: scale(30),
          elevation: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(3) },
          shadowOpacity: 0.3,
          shadowRadius: scale(4),
          marginBottom: scale(20),
        },
        backButton: {
          position: 'absolute',
          left: scale(20),
          paddingTop: Platform.OS === 'ios' ? scale(50) : scale(10),
          padding: scale(10),
          borderRadius: scale(20),
        },
        headerTitle: {
          fontWeight: '800',
          fontSize: width < 360 ? scale(20) : scale(24),
          color: currentTheme.headerTextColor,
        },
        container: {
          paddingVertical: scale(20),
          paddingHorizontal: width < 375 ? scale(10) : scale(20),
        },
        subheading: {
          fontSize: width < 375 ? scale(14) : scale(15),
          textAlign: 'center',
          marginBottom: scale(25),
          lineHeight: scale(20),
          color: currentTheme.textColor,
        },
        inputCard: {
          borderRadius: scale(14),
          paddingVertical: scale(15),
          paddingHorizontal: scale(15),
          marginBottom: scale(20),
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(1) },
          shadowOpacity: 0.08,
          shadowRadius: scale(2),
          backgroundColor: currentTheme.cardBackground,
        },
        inputLabel: {
          fontSize: scale(14),
          marginBottom: scale(5),
          fontWeight: '600',
          color: currentTheme.textColor,
        },
        inputContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1.2,
          borderRadius: scale(8),
          borderColor: currentTheme.borderColor,
        },
        icon: {
          position: 'absolute',
          left: scale(10),
          zIndex: 10,
        },
        input: {
          flex: 1,
          height: scale(48),
          paddingLeft: scale(40),
          paddingRight: scale(10),
          fontSize: scale(15),
          color: currentTheme.textColor,
        },
        button: {
          marginTop: scale(10),
          paddingVertical: scale(14),
          borderRadius: scale(10),
          alignItems: 'center',
          elevation: 3,
          backgroundColor: currentTheme.primaryColor,
        },
        buttonText: {
          fontSize: scale(16),
          fontWeight: '600',
          color: currentTheme.buttonTextColor,
        },
      }),
    [width, currentTheme]
  );

  return (
    <View style={styles.safeArea}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />
      <LinearGradient
        colors={currentTheme.headerBackground}
        style={[styles.header, { paddingTop: insets.top + scale(10) }]}
        start={[0, 0]}
        end={[0, 1]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="arrow-back" size={scale(24)} color={currentTheme.headerTextColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.subheading}>
          Please fill in the details below to update your password.
        </Text>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Current Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={scale(20)}
              color={currentTheme.placeholderTextColor}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your current password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>New Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={scale(20)}
              color={currentTheme.placeholderTextColor}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter a new password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
        </View>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Confirm New Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed"
              size={scale(20)}
              color={currentTheme.placeholderTextColor}
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your new password"
              placeholderTextColor={currentTheme.placeholderTextColor}
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        icon={alertIcon}
        buttons={alertButtons}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

export default ChangePasswordScreen;








// // src/screens/ChangePasswordScreen.js
// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   StatusBar,
//   useWindowDimensions,
//   Platform,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch } from 'react-redux';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';
// import { changePassword } from '../store/slices/authSlice';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const ChangePasswordScreen = () => {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const insets = useSafeAreaInsets();
//   const { width } = useWindowDimensions(); // Responsive hook!

//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const dispatch = useDispatch();

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const showAlert = (title, message, icon, buttons) => {
//     setAlertTitle(title);
//     setAlertMessage(message);
//     setAlertIcon(icon);
//     setAlertButtons(buttons);
//     setAlertVisible(true);
//   };

//   const handleChangePassword = async () => {
//     if (!oldPassword || !newPassword || !confirmNewPassword) {
//       showAlert(
//         'Error',
//         'All fields are required.',
//         'alert-circle',
//         [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//       );
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       showAlert(
//         'Error',
//         'New password and confirm password do not match.',
//         'alert-circle',
//         [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       await dispatch(changePassword({ oldPassword, newPassword })).unwrap();

//       showAlert(
//         'Success',
//         'Your password has been changed successfully.',
//         'checkmark-circle',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Settings');
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       showAlert(
//         'Error',
//         error || 'Failed to change password.',
//         'close-circle',
//         [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header, { paddingTop: insets.top + 10 }]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Settings')}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <Text
//           style={[
//             styles.headerTitle,
//             {
//               color: currentTheme.headerTextColor,
//               fontSize: width < 360 ? 20 : 24, // responsive header title font size
//             },
//           ]}
//         >
//           Change Password
//         </Text>
//       </LinearGradient>
//       <ScrollView contentContainerStyle={[styles.container, { paddingHorizontal: width < 375 ? 10 : 20 }]}>
//         <Text style={[styles.subheading, { color: currentTheme.textColor }]}>
//           Please fill in the details below to update your password.
//         </Text>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>Current Password</Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Enter your current password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={oldPassword}
//               onChangeText={setOldPassword}
//             />
//           </View>
//         </View>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>New Password</Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Enter a new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={newPassword}
//               onChangeText={setNewPassword}
//             />
//           </View>
//         </View>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
//             Confirm New Password
//           </Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Re-enter your new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={confirmNewPassword}
//               onChangeText={setConfirmNewPassword}
//             />
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleChangePassword}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#FFFFFF" />
//           ) : (
//             <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>Update Password</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         buttons={alertButtons}
//         onClose={() => setAlertVisible(false)}
//       />
//     </View>
//   );
// };

// export default ChangePasswordScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 20,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 20,
//     paddingTop: Platform.OS === 'ios' ? 50 : 10,
//     padding: Platform.OS === 'ios' ? 10 : 10,
//     borderRadius: 20,
//   },
//   headerTitle: {
//     fontWeight: '800',
//   },
//   container: {
//     paddingVertical: 20,
//   },
//   subheading: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 25,
//     lineHeight: 20,
//   },
//   inputCard: {
//     borderRadius: 14,
//     paddingVertical: 15,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 2,
//   },
//   inputLabel: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1.2,
//     borderRadius: 8,
//   },
//   icon: {
//     position: 'absolute',
//     left: 10,
//     zIndex: 10,
//   },
//   input: {
//     flex: 1,
//     height: 48,
//     paddingLeft: 40,
//     paddingRight: 10,
//     fontSize: 15,
//   },
//   button: {
//     marginTop: 10,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 3,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });







// // src/screens/ChangePasswordScreen.js
// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
//   StatusBar
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useNavigation } from '@react-navigation/native';
// import { useDispatch } from 'react-redux';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from '../components/CustomAlert';
// import { changePassword } from '../store/slices/authSlice';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// const ChangePasswordScreen = () => {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const insets = useSafeAreaInsets();

//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const dispatch = useDispatch();

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const showAlert = (title, message, icon, buttons) => {
//     setAlertTitle(title);
//     setAlertMessage(message);
//     setAlertIcon(icon);
//     setAlertButtons(buttons);
//     setAlertVisible(true);
//   };

//   const handleChangePassword = async () => {
//     if (!oldPassword || !newPassword || !confirmNewPassword) {
//       showAlert(
//         'Error',
//         'All fields are required.',
//         'alert-circle',
//         [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//       );
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       showAlert(
//         'Error',
//         'New password and confirm password do not match.',
//         'alert-circle',
//         [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//       );
//       return;
//     }

//     setLoading(true);
//     try {
//       // Dispatch the changePassword thunk and wait for it to complete
//       await dispatch(changePassword({ oldPassword, newPassword })).unwrap();

//       showAlert(
//         'Success',
//         'Your password has been changed successfully.',
//         'checkmark-circle',
//         [
//           {
//             text: 'OK',
//             onPress: () => {
//               setAlertVisible(false);
//               navigation.navigate('Settings');
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       showAlert(
//         'Error',
//         error || 'Failed to change password.',
//         'close-circle',
//         [{ text: 'OK', onPress: () => setAlertVisible(false) }]
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header, { paddingTop: insets.top + 10 }]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Settings')}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Change Password
//         </Text>
//       </LinearGradient>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={[styles.subheading, { color: currentTheme.textColor }]}>
//           Please fill in the details below to update your password.
//         </Text>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>Current Password</Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Enter your current password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={oldPassword}
//               onChangeText={setOldPassword}
//             />
//           </View>
//         </View>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>New Password</Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Enter a new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={newPassword}
//               onChangeText={setNewPassword}
//             />
//           </View>
//         </View>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
//             Confirm New Password
//           </Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Re-enter your new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={confirmNewPassword}
//               onChangeText={setConfirmNewPassword}
//             />
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleChangePassword}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#FFFFFF" />
//           ) : (
//             <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Update Password</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         buttons={alertButtons}
//         onClose={() => setAlertVisible(false)}
//       />
//     </View>
//   );
// };

// export default ChangePasswordScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 20,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 10,
//     borderRadius: 20,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//   },
//   container: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },
//   subheading: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 25,
//     lineHeight: 20,
//   },
//   inputCard: {
//     borderRadius: 14,
//     paddingVertical: 15,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 2,
//   },
//   inputLabel: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1.2,
//     borderRadius: 8,
//   },
//   icon: {
//     position: 'absolute',
//     left: 10,
//     zIndex: 10,
//   },
//   input: {
//     flex: 1,
//     height: 48,
//     paddingLeft: 40,
//     paddingRight: 10,
//     fontSize: 15,
//   },
//   button: {
//     marginTop: 10,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 3,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });








// // src/screens/ChangePasswordScreen.js
// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { changeUserPassword } from '../services/api';
// import CustomAlert from '../components/CustomAlert';

// const ChangePasswordScreen = () => {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const showAlert = (title, message, icon, buttons) => {
//     setAlertTitle(title);
//     setAlertMessage(message);
//     setAlertIcon(icon);
//     setAlertButtons(buttons);
//     setAlertVisible(true);
//   };

//   const handleChangePassword = async () => {
//     if (!oldPassword || !newPassword || !confirmNewPassword) {
//       showAlert('Error', 'All fields are required.', 'alert-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       showAlert('Error', 'New password and confirm password do not match.', 'alert-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//       return;
//     }

//     setLoading(true);
//     const response = await changeUserPassword(oldPassword, newPassword);
//     setLoading(false);

//     if (response.success) {
//       showAlert('Success', 'Your password has been changed successfully.', 'checkmark-circle', [
//         {
//           text: 'OK',
//           onPress: () => {
//             setAlertVisible(false);
//             navigation.navigate('Settings');
//           },
//         },
//       ]);
//     } else {
//       showAlert('Error', response.message || 'Failed to change password.', 'close-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//     }
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[1, 0]}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Settings')}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Change Password
//         </Text>
//       </LinearGradient>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={[styles.subheading, { color: currentTheme.textColor }]}>
//           Please fill in the details below to update your password.
//         </Text>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>Current Password</Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Enter your current password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={oldPassword}
//               onChangeText={setOldPassword}
//             />
//           </View>
//         </View>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>New Password</Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Enter a new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={newPassword}
//               onChangeText={setNewPassword}
//             />
//           </View>
//         </View>

//         <View style={[styles.inputCard, { backgroundColor: currentTheme.cardBackground }]}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>Confirm New Password</Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Re-enter your new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={confirmNewPassword}
//               onChangeText={setConfirmNewPassword}
//             />
//           </View>
//         </View>

//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleChangePassword}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#FFFFFF" />
//           ) : (
//             <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Update Password</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         buttons={alertButtons}
//         onClose={() => setAlertVisible(false)}
//       />
//     </SafeAreaView>
//   );
// };

// export default ChangePasswordScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 20,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 10,
//     borderRadius: 20,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//   },
//   container: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },
//   subheading: {
//     fontSize: 14,
//     textAlign: 'center',
//     marginBottom: 25,
//     lineHeight: 20,
//   },
//   inputCard: {
//     borderRadius: 14,
//     paddingVertical: 15,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 2,
//   },
//   inputLabel: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1.2,
//     borderRadius: 8,
//   },
//   icon: {
//     position: 'absolute',
//     left: 10,
//     zIndex: 10,
//   },
//   input: {
//     flex: 1,
//     height: 48,
//     paddingLeft: 40,
//     paddingRight: 10,
//     fontSize: 15,
//   },
//   button: {
//     marginTop: 10,
//     paddingVertical: 14,
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 3,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });










// // src/screens/ChangePasswordScreen.js

// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { changeUserPassword } from '../services/api';
// import CustomAlert from '../components/CustomAlert';

// const ChangePasswordScreen = () => {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const showAlert = (title, message, icon, buttons) => {
//     setAlertTitle(title);
//     setAlertMessage(message);
//     setAlertIcon(icon);
//     setAlertButtons(buttons);
//     setAlertVisible(true);
//   };

//   const handleChangePassword = async () => {
//     if (!oldPassword || !newPassword || !confirmNewPassword) {
//       showAlert('Error', 'All fields are required.', 'alert-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       showAlert('Error', 'New password and confirm password do not match.', 'alert-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//       return;
//     }

//     setLoading(true);
//     const response = await changeUserPassword(oldPassword, newPassword);
//     setLoading(false);

//     if (response.success) {
//       showAlert('Success', 'Your password has been changed successfully.', 'checkmark-circle', [
//         {
//           text: 'OK',
//           onPress: () => {
//             setAlertVisible(false);
//             navigation.navigate('Settings');
//           },
//         },
//       ]);
//     } else {
//       showAlert('Error', response.message || 'Failed to change password.', 'close-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//     }
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[1, 0]}
//       >
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.navigate('Settings')}
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Change Password
//         </Text>
//       </LinearGradient>
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={[styles.subheading, { color: currentTheme.textColor }]}>
//           Please fill in the details below to update your password.
//         </Text>

//         {/* Current Password */}
//         <View style={styles.inputCard}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
//             Current Password
//           </Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Enter your current password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={oldPassword}
//               onChangeText={setOldPassword}
//             />
//           </View>
//         </View>

//         {/* New Password */}
//         <View style={styles.inputCard}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
//             New Password
//           </Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Enter a new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={newPassword}
//               onChangeText={setNewPassword}
//             />
//           </View>
//         </View>

//         {/* Confirm New Password */}
//         <View style={styles.inputCard}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
//             Confirm New Password
//           </Text>
//           <View style={[styles.inputContainer, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[styles.input, { color: currentTheme.textColor }]}
//               placeholder="Re-enter your new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={confirmNewPassword}
//               onChangeText={setConfirmNewPassword}
//             />
//           </View>
//         </View>

//         {/* Update Password Button */}
//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleChangePassword}
//           disabled={loading}
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#FFFFFF" />
//           ) : (
//             <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Update Password</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         buttons={alertButtons}
//         onClose={() => setAlertVisible(false)}
//       />
//     </SafeAreaView>
//   );
// };

// export default ChangePasswordScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 20,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 10,
//     borderRadius: 20,
//   },
//   headerTitle: {
//     fontSize: 26,
//     fontWeight: '700',
//   },
//   container: {
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },
//   subheading: {
//     fontSize: 16,
//     textAlign: 'center',
//     marginBottom: 25,
//     lineHeight: 22,
//   },
//   inputCard: {
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     borderRadius: 16,
//     paddingVertical: 15,
//     paddingHorizontal: 15,
//     marginBottom: 20,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   inputLabel: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderRadius: 8,
//   },
//   icon: {
//     position: 'absolute',
//     left: 10,
//     zIndex: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     paddingLeft: 40,
//     paddingRight: 10,
//     fontSize: 16,
//   },
//   button: {
//     marginTop: 15,
//     paddingVertical: 15,
//     borderRadius: 10,
//     alignItems: 'center',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });











// import React, { useState, useContext } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   SafeAreaView,
//   StyleSheet,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { changeUserPassword } from '../services/api';
// import CustomAlert from '../components/CustomAlert'; // Import your custom alert

// const ChangePasswordScreen = () => {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmNewPassword, setConfirmNewPassword] = useState('');
//   const [loading, setLoading] = useState(false); // Add loading state

//   const navigation = useNavigation();

//   // Access theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // ----------- Custom Alert State ----------- 
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);
  

//   // Handler to show CustomAlert easily
//   const showAlert = (title, message, icon, buttons) => {
//     setAlertTitle(title);
//     setAlertMessage(message);
//     setAlertIcon(icon);
//     setAlertButtons(buttons);
//     setAlertVisible(true);
//   };

//   const handleChangePassword = async () => {
//     // Basic validation
//     if (!oldPassword || !newPassword || !confirmNewPassword) {
//       showAlert('Error', 'All fields are required.', 'alert-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//       return;
//     }
//     if (newPassword !== confirmNewPassword) {
//       showAlert('Error', 'New password and confirm password do not match.', 'alert-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//       return;
//     }

//     setLoading(true); // Set loading to true when the request starts

//     // Call the change password API
//     const response = await changeUserPassword(oldPassword, newPassword);

//     setLoading(false); // Set loading to false once the response is received

//     if (response.success) {
//       showAlert('Success', 'Your password has been changed successfully.', 'checkmark-circle', [
//         {
//           text: 'OK',
//           onPress: () => {
//             setAlertVisible(false);
//             navigation.navigate('Settings');
//           },
//         },
//       ]);
//     } else {
//       showAlert('Error', response.message || 'Failed to change password.', 'close-circle', [
//         { text: 'OK', onPress: () => setAlertVisible(false) },
//       ]);
//     }
//   };

//   return (
//     <SafeAreaView
//       style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}
//     >
//       {/* Header with Linear Gradient */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[1, 0]}
//       >
//         {/* Back Button */}
//         <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => {
//             console.log('Back button pressed');
//             navigation.navigate('Settings');
//           }}
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>

//         {/* Header Title */}
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Change Password
//         </Text>
//       </LinearGradient>

//       {/* Main Content */}
//       <ScrollView contentContainerStyle={styles.container}>
//         <Text style={[styles.subheading, { color: currentTheme.textColor }]}>
//           Please fill in the details below to update your password.
//         </Text>

//         {/* Old Password Field */}
//         <View style={styles.inputGroup}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
//             Current Password
//           </Text>
//           <View style={styles.inputContainer}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   borderColor: currentTheme.borderColor,
//                   backgroundColor: currentTheme.cardBackground,
//                 },
//               ]}
//               placeholder="Enter your current password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={oldPassword}
//               onChangeText={setOldPassword}
//             />
//           </View>
//         </View>

//         {/* New Password Field */}
//         <View style={styles.inputGroup}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
//             New Password
//           </Text>
//           <View style={styles.inputContainer}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   borderColor: currentTheme.borderColor,
//                   backgroundColor: currentTheme.cardBackground,
//                 },
//               ]}
//               placeholder="Enter a new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={newPassword}
//               onChangeText={setNewPassword}
//             />
//           </View>
//         </View>

//         {/* Confirm New Password Field */}
//         <View style={styles.inputGroup}>
//           <Text style={[styles.inputLabel, { color: currentTheme.textColor }]}>
//             Confirm New Password
//           </Text>
//           <View style={styles.inputContainer}>
//             <Ionicons
//               name="lock-closed"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.icon}
//             />
//             <TextInput
//               style={[
//                 styles.input,
//                 {
//                   color: currentTheme.textColor,
//                   borderColor: currentTheme.borderColor,
//                   backgroundColor: currentTheme.cardBackground,
//                 },
//               ]}
//               placeholder="Re-enter your new password"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               secureTextEntry
//               value={confirmNewPassword}
//               onChangeText={setConfirmNewPassword}
//             />
//           </View>
//         </View>

//         {/* Change Password Button */}
//         <TouchableOpacity
//           style={[styles.button, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleChangePassword}
//           disabled={loading} // Disable the button when loading
//         >
//           {loading ? (
//             <ActivityIndicator size="small" color="#FFFFFF" />
//           ) : (
//             <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Update Password</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>

//       {/* CustomAlert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         buttons={alertButtons}
//         onClose={() => setAlertVisible(false)}
//       />
//     </SafeAreaView>
//   );
// };

// export default ChangePasswordScreen;


// /* ----------- Styles ----------- */
// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 15,
//     paddingHorizontal: 15,
//     // iOS shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     // Android elevation
//     elevation: 5,
//     zIndex: 10,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 15,
//     padding: 15,
//     borderRadius: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 20, // Make sure it's above the gradient or other elements
//   }, 
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     flex: 1,
//   },
//   container: {
//     paddingHorizontal: 15,
//     paddingVertical: 20,
//   },
//   subheading: {
//     fontSize: 16,
//     marginBottom: 25,
//     textAlign: 'center',
//     lineHeight: 22,
//   },
//   inputGroup: {
//     marginBottom: 20,
//   },
//   inputLabel: {
//     fontSize: 14,
//     marginBottom: 5,
//     fontWeight: '600',
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   icon: {
//     position: 'absolute',
//     left: 10,
//     zIndex: 10,
//   },
//   input: {
//     flex: 1,
//     height: 50,
//     paddingLeft: 40,
//     paddingRight: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     fontSize: 16,
//   },
//   button: {
//     marginTop: 15,
//     paddingVertical: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     // iOS shadow
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     // Android elevation
//     elevation: 5,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });

