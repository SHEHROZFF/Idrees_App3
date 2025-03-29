// EditProfilePopup.js
import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import CustomAlert from './CustomAlert';
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

const EditProfilePopup = ({ visible, onClose, userData, onSave }) => {
  const { width } = useWindowDimensions();
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // Basic states
  const [name, setName] = useState(userData?.name || '');
  const [email, setEmail] = useState(userData?.email || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [address, setAddress] = useState(userData?.address || '');

  // We'll store local URIs for the images from the gallery
  const [profileImageUri, setProfileImageUri] = useState(userData?.profileImage || '');
  const [coverImageUri, setCoverImageUri] = useState(userData?.coverImage || '');

  // Alert
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // On mount or userData change, reset fields:
  useEffect(() => {
    setName(userData?.name || '');
    setEmail(userData?.email || '');
    setPhone(userData?.phone || '');
    setAddress(userData?.address || '');
    setProfileImageUri(userData?.profileImage || '');
    setCoverImageUri(userData?.coverImage || '');
  }, [userData]);

  // Simplify validations
  const isValidEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const isValidPhoneNumber = (input) => /^\+?[0-9]{7,15}$/.test(input);

  const showAlert = (title, message, icon) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertIcon(icon);
    setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    setAlertVisible(true);
  };

  // Method to pick an image from the gallery
  const pickImage = async (isProfile = true) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission denied', 'Please allow gallery access to pick images.', 'alert-circle');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: isProfile ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    // For Expo SDK 48+ (and beyond):
    if (!result.canceled && result.assets?.length) {
      const pickedUri = result.assets[0].uri;
      if (isProfile) {
        setProfileImageUri(pickedUri);
      } else {
        setCoverImageUri(pickedUri);
      }
    }
  };

  const handleSave = () => {
    // Some field validations
    if (!name || !email) {
      showAlert('Validation Error', 'Name and email are required.', 'alert-circle');
      return;
    }
    if (email && !isValidEmail(email)) {
      showAlert('Invalid Email', 'Please enter a valid email address.', 'alert-circle');
      return;
    }
    if (phone && !isValidPhoneNumber(phone)) {
      showAlert('Invalid Phone Number', 'Please enter a valid phone number.', 'alert-circle');
      return;
    }

    // Prepare updated data
    const updatedData = {
      ...userData,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    // Pass local URIs up to parent
    onSave(updatedData, profileImageUri, coverImageUri);
    onClose();
  };

  const responsiveStyles = useMemo(
    () =>
      StyleSheet.create({
        modalContainer: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        modalInnerContainer: {
          borderRadius: scale(10),
          padding: scale(20),
          elevation: 5,
          width: '90%',
          maxHeight: '90%',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(2) },
          shadowOpacity: 0.25,
          shadowRadius: scale(3.84),
          backgroundColor: currentTheme.cardBackground,
        },
        modalContent: {
          flexGrow: 1,
          paddingBottom: scale(20),
        },
        modalHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        modalTitle: {
          fontSize: scale(20),
          fontWeight: '600',
          color: currentTheme.cardTextColor,
        },
        closeButton: {
          padding: scale(5),
        },
        sectionTitle: {
          fontSize: scale(16),
          fontWeight: '600',
          marginTop: scale(20),
          marginBottom: scale(10),
          color: currentTheme.textColor,
        },
        imageSection: {
          marginBottom: scale(20),
          alignItems: 'center',
        },
        profileImagePreview: {
          width: width * 0.3,
          height: width * 0.3,
          borderRadius: (width * 0.3) / 2,
          alignSelf: 'center',
          marginBottom: scale(10),
          backgroundColor: '#ccc',
        },
        coverImagePreview: {
          width: '100%',
          height: scale(150),
          borderRadius: scale(10),
          alignSelf: 'center',
          marginBottom: scale(10),
          backgroundColor: '#ccc',
        },
        pickImageButton: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: scale(10),
          borderRadius: scale(8),
          backgroundColor: currentTheme.primaryColor,
          marginBottom: scale(10),
        },
        pickImageButtonText: {
          marginLeft: scale(5),
          color: currentTheme.buttonTextColor,
          fontWeight: '600',
        },
        inputContainer: {
          marginTop: scale(10),
        },
        label: {
          fontSize: scale(14),
          marginBottom: scale(5),
          fontWeight: '500',
          color: currentTheme.textColor,
        },
        input: {
          borderWidth: scale(1),
          borderRadius: scale(8),
          paddingHorizontal: scale(10),
          paddingVertical: Platform.OS === 'ios' ? scale(12) : scale(8),
          fontSize: scale(14),
          marginBottom: scale(5),
          backgroundColor: currentTheme.backgroundColor,
          color: currentTheme.textColor,
          borderColor: currentTheme.borderColor,
        },
        saveButton: {
          paddingVertical: scale(12),
          borderRadius: scale(8),
          marginTop: scale(15),
          alignItems: 'center',
          backgroundColor: currentTheme.primaryColor,
        },
        saveButtonText: {
          fontSize: scale(16),
          fontWeight: '600',
          color: currentTheme.buttonTextColor,
        },
      }),
    [width, currentTheme, scale]
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={responsiveStyles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={responsiveStyles.modalInnerContainer}>
          <ScrollView
            contentContainerStyle={responsiveStyles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={responsiveStyles.modalHeader}>
              <Text style={responsiveStyles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={onClose} style={responsiveStyles.closeButton}>
                <Ionicons name="close" size={scale(24)} color={currentTheme.textColor} />
              </TouchableOpacity>
            </View>

            {/* Profile Image Section */}
            <Text style={responsiveStyles.sectionTitle}>Profile Photo</Text>
            <View style={responsiveStyles.imageSection}>
              <Image
                source={profileImageUri ? { uri: profileImageUri } : null}
                style={responsiveStyles.profileImagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={responsiveStyles.pickImageButton}
                onPress={() => pickImage(true)}
              >
                <Ionicons
                  name="image-outline"
                  size={scale(20)}
                  color={currentTheme.buttonTextColor}
                />
                <Text style={responsiveStyles.pickImageButtonText}>Pick Profile Image</Text>
              </TouchableOpacity>
            </View>

            {/* Cover Image Section */}
            <Text style={responsiveStyles.sectionTitle}>Cover Photo</Text>
            <View style={responsiveStyles.imageSection}>
              <Image
                source={coverImageUri ? { uri: coverImageUri } : null}
                style={responsiveStyles.coverImagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={responsiveStyles.pickImageButton}
                onPress={() => pickImage(false)}
              >
                <Ionicons
                  name="image-outline"
                  size={scale(20)}
                  color={currentTheme.buttonTextColor}
                />
                <Text style={responsiveStyles.pickImageButtonText}>Pick Cover Image</Text>
              </TouchableOpacity>
            </View>

            {/* Other Profile Fields */}
            <Text style={responsiveStyles.sectionTitle}>Personal Details</Text>
            <View style={responsiveStyles.inputContainer}>
              <Text style={responsiveStyles.label}>Name</Text>
              <TextInput
                style={responsiveStyles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={currentTheme.placeholderTextColor}
                maxLength={20}
              />
            </View>

            <View style={responsiveStyles.inputContainer}>
              <Text style={responsiveStyles.label}>Email</Text>
              <TextInput
                style={responsiveStyles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={currentTheme.placeholderTextColor}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={responsiveStyles.inputContainer}>
              <Text style={responsiveStyles.label}>Phone Number</Text>
              <TextInput
                style={responsiveStyles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                placeholderTextColor={currentTheme.placeholderTextColor}
                keyboardType="phone-pad"
              />
            </View>

            <View style={responsiveStyles.inputContainer}>
              <Text style={responsiveStyles.label}>Address</Text>
              <TextInput
                style={[responsiveStyles.input, { height: scale(80) }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter your address"
                multiline
                numberOfLines={3}
                placeholderTextColor={currentTheme.placeholderTextColor}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={responsiveStyles.saveButton}
              onPress={handleSave}
            >
              <Text style={responsiveStyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* CustomAlert */}
          <CustomAlert
            visible={alertVisible}
            title={alertTitle}
            message={alertMessage}
            icon={alertIcon}
            onClose={() => setAlertVisible(false)}
            buttons={alertButtons}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditProfilePopup;







// // src/components/EditProfilePopup.js
// import React, { useState, useContext, useEffect, useMemo } from 'react';
// import {
//   View,
//   Text,
//   Modal,
//   TouchableOpacity,
//   TextInput,
//   StyleSheet,
//   ScrollView,
//   KeyboardAvoidingView,
//   Platform,
//   Image,
//   useWindowDimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import CustomAlert from './CustomAlert';

// const EditProfilePopup = ({ visible, onClose, userData, onSave }) => {
//   const { width } = useWindowDimensions();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Calculate a scale factor based on a base width.
//   const baseWidth = width > 375 ? 460 : 500;
//   const scaleFactor = width / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   // State initialization
//   const [name, setName] = useState(userData?.name || '');
//   const [email, setEmail] = useState(userData?.email || '');
//   const [phone, setPhone] = useState(userData?.phone || '');
//   const [address, setAddress] = useState(userData?.address || '');
//   const [profileImageUrl, setProfileImageUrl] = useState(userData?.profileImage || '');
//   const [coverImageUrl, setCoverImageUrl] = useState(userData?.coverImage || '');

//   // State for image load errors
//   const [profileImageError, setProfileImageError] = useState(false);
//   const [coverImageError, setCoverImageError] = useState(false);

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   useEffect(() => {
//     setName(userData?.name || '');
//     setEmail(userData?.email || '');
//     setPhone(userData?.phone || '');
//     setAddress(userData?.address || '');
//     setProfileImageUrl(userData?.profileImage || '');
//     setCoverImageUrl(userData?.coverImage || '');
//   }, [userData]);

//   // Validate image URLs
//   const isValidImageUrl = (url) => {
//     const regex = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)$/i;
//     return regex.test(url);
//   };

//   // Email validation
//   const isValidEmail = (email) => {
//     const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return regex.test(email);
//   };

//   // Phone number validation
//   const isValidPhoneNumber = (phone) => {
//     const regex = /^\+?[0-9]{7,15}$/;
//     return regex.test(phone);
//   };

//   const showAlert = (title, message, icon) => {
//     setAlertTitle(title);
//     setAlertMessage(message);
//     setAlertIcon(icon);
//     setAlertButtons([
//       {
//         text: 'OK',
//         onPress: () => setAlertVisible(false),
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   const handleSave = () => {
//     // Perform validation
//     if (!name || !email) {
//       showAlert('Validation Error', 'Name and email are required.', 'alert-circle');
//       return;
//     }
//     if (email && !isValidEmail(email)) {
//       showAlert('Invalid Email', 'Please enter a valid email address.', 'alert-circle');
//       return;
//     }
//     if (phone && !isValidPhoneNumber(phone)) {
//       showAlert('Invalid Phone Number', 'Please enter a valid phone number.', 'alert-circle');
//       return;
//     }
//     if (profileImageUrl && !isValidImageUrl(profileImageUrl)) {
//       showAlert(
//         'Invalid URL',
//         'Please enter a valid image URL for the profile image.',
//         'alert-circle'
//       );
//       return;
//     }
//     if (coverImageUrl && !isValidImageUrl(coverImageUrl)) {
//       showAlert(
//         'Invalid URL',
//         'Please enter a valid image URL for the cover image.',
//         'alert-circle'
//       );
//       return;
//     }

//     const updatedData = {
//       ...userData,
//       name: name.trim(),
//       email: email.trim(),
//       phone: phone.trim(),
//       address: address.trim(),
//       profileImage: profileImageUrl.trim(),
//       coverImage: coverImageUrl.trim(),
//     };

//     onSave(updatedData);
//     onClose();
//   };

//   // Memoized responsive styles
//   const responsiveStyles = useMemo(
//     () =>
//       StyleSheet.create({
//         modalContainer: {
//           flex: 1,
//           backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
//           justifyContent: 'center',
//           alignItems: 'center',
//         },
//         modalInnerContainer: {
//           borderRadius: scale(10),
//           padding: scale(20),
//           elevation: 5,
//           width: '90%',
//           maxHeight: '90%',
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: scale(2) },
//           shadowOpacity: 0.25,
//           shadowRadius: scale(3.84),
//           backgroundColor: currentTheme.cardBackground,
//         },
//         modalContent: {
//           flexGrow: 1,
//           paddingBottom: scale(20),
//         },
//         modalHeader: {
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//         },
//         modalTitle: {
//           fontSize: scale(20),
//           fontWeight: '600',
//           color: currentTheme.cardTextColor,
//         },
//         closeButton: {
//           padding: scale(5),
//         },
//         sectionTitle: {
//           fontSize: scale(16),
//           fontWeight: '600',
//           marginTop: scale(20),
//           marginBottom: scale(10),
//           color: currentTheme.textColor,
//         },
//         imageSection: {
//           marginBottom: scale(20),
//         },
//         profileImagePreview: {
//           width: width * 0.3,
//           height: width * 0.3,
//           borderRadius: (width * 0.3) / 2,
//           alignSelf: 'center',
//           marginBottom: scale(10),
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: scale(1) },
//           shadowOpacity: 0.2,
//           shadowRadius: scale(2),
//         },
//         coverImagePreview: {
//           width: '100%',
//           height: scale(150),
//           borderRadius: scale(10),
//           alignSelf: 'center',
//           marginBottom: scale(10),
//           shadowColor: '#000',
//           shadowOffset: { width: 0, height: scale(1) },
//           shadowOpacity: 0.2,
//           shadowRadius: scale(2),
//         },
//         placeholderImage: {
//           width: width * 0.3,
//           height: width * 0.3,
//           borderRadius: (width * 0.3) / 2,
//           justifyContent: 'center',
//           alignItems: 'center',
//           alignSelf: 'center',
//           marginBottom: scale(10),
//         },
//         placeholderCoverImage: {
//           width: '100%',
//           height: scale(150),
//           borderRadius: scale(10),
//           justifyContent: 'center',
//           alignItems: 'center',
//           alignSelf: 'center',
//           marginBottom: scale(10),
//         },
//         inputContainer: {
//           marginTop: scale(10),
//         },
//         label: {
//           fontSize: scale(14),
//           marginBottom: scale(5),
//           fontWeight: '500',
//           color: currentTheme.textColor,
//         },
//         input: {
//           borderWidth: scale(1),
//           borderRadius: scale(8),
//           paddingHorizontal: scale(10),
//           paddingVertical: Platform.OS === 'ios' ? scale(12) : scale(8),
//           fontSize: scale(14),
//           marginBottom: scale(5),
//           backgroundColor: currentTheme.backgroundColor,
//           color: currentTheme.textColor,
//           borderColor: currentTheme.borderColor,
//         },
//         saveButton: {
//           paddingVertical: scale(12),
//           borderRadius: scale(8),
//           marginTop: scale(15),
//           alignItems: 'center',
//           backgroundColor: currentTheme.primaryColor,
//         },
//         saveButtonText: {
//           fontSize: scale(16),
//           fontWeight: '600',
//           color: currentTheme.buttonTextColor,
//         },
//         errorText: {
//           fontSize: scale(12),
//           textAlign: 'center',
//           marginBottom: scale(5),
//           color: currentTheme.errorTextColor || 'red',
//         },
//       }),
//     [width, currentTheme, scale]
//   );

//   return (
//     <Modal
//       visible={visible}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={onClose}
//     >
//       <KeyboardAvoidingView
//         style={responsiveStyles.modalContainer}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <View style={responsiveStyles.modalInnerContainer}>
//           <ScrollView
//             contentContainerStyle={responsiveStyles.modalContent}
//             keyboardShouldPersistTaps="handled"
//             showsVerticalScrollIndicator={false}
//           >
//             {/* Header */}
//             <View style={responsiveStyles.modalHeader}>
//               <Text style={responsiveStyles.modalTitle}>Edit Profile</Text>
//               <TouchableOpacity onPress={onClose} style={responsiveStyles.closeButton}>
//                 <Ionicons name="close" size={scale(24)} color={currentTheme.textColor} />
//               </TouchableOpacity>
//             </View>

//             {/* Profile Image Section */}
//             <Text style={responsiveStyles.sectionTitle}>Profile Photo</Text>
//             <View style={responsiveStyles.imageSection}>
//               {profileImageUrl ? (
//                 <Image
//                   source={{ uri: profileImageUrl }}
//                   style={responsiveStyles.profileImagePreview}
//                   onError={() => setProfileImageError(true)}
//                 />
//               ) : (
//                 <View
//                   style={[
//                     responsiveStyles.placeholderImage,
//                     { backgroundColor: currentTheme.backgroundColor },
//                   ]}
//                 >
//                   <Ionicons name="person-outline" size={scale(50)} color={currentTheme.placeholderTextColor} />
//                 </View>
//               )}
//               {profileImageError && (
//                 <Text style={responsiveStyles.errorText}>Failed to load profile image.</Text>
//               )}
//               <TextInput
//                 style={responsiveStyles.input}
//                 value={profileImageUrl}
//                 onChangeText={(text) => {
//                   setProfileImageUrl(text);
//                   if (isValidImageUrl(text)) {
//                     setProfileImageError(false);
//                   }
//                 }}
//                 placeholder="Enter profile image URL"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 autoCapitalize="none"
//                 accessibilityLabel="Profile Image URL Input"
//               />
//             </View>

//             {/* Cover Image Section */}
//             <Text style={responsiveStyles.sectionTitle}>Cover Photo</Text>
//             <View style={responsiveStyles.imageSection}>
//               {coverImageUrl ? (
//                 <Image
//                   source={{ uri: coverImageUrl }}
//                   style={responsiveStyles.coverImagePreview}
//                   onError={() => setCoverImageError(true)}
//                 />
//               ) : (
//                 <View
//                   style={[
//                     responsiveStyles.placeholderCoverImage,
//                     { backgroundColor: currentTheme.backgroundColor },
//                   ]}
//                 >
//                   <Ionicons name="image-outline" size={scale(50)} color={currentTheme.placeholderTextColor} />
//                 </View>
//               )}
//               {coverImageError && (
//                 <Text style={[responsiveStyles.errorText, { color: currentTheme.errorTextColor }]}>
//                   Failed to load cover image.
//                 </Text>
//               )}
//               <TextInput
//                 style={responsiveStyles.input}
//                 value={coverImageUrl}
//                 onChangeText={(text) => {
//                   setCoverImageUrl(text);
//                   if (isValidImageUrl(text)) {
//                     setCoverImageError(false);
//                   }
//                 }}
//                 placeholder="Enter cover image URL"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 autoCapitalize="none"
//                 accessibilityLabel="Cover Image URL Input"
//               />
//             </View>

//             {/* Other Profile Fields */}
//             <Text style={responsiveStyles.sectionTitle}>Personal Details</Text>
//             <View style={responsiveStyles.inputContainer}>
//               <Text style={responsiveStyles.label}>Name</Text>
//               <TextInput
//                 style={responsiveStyles.input}
//                 value={name}
//                 onChangeText={setName}
//                 placeholder="Enter your name"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Name Input"
//               />
//             </View>

//             <View style={responsiveStyles.inputContainer}>
//               <Text style={responsiveStyles.label}>Email</Text>
//               <TextInput
//                 style={responsiveStyles.input}
//                 value={email}
//                 onChangeText={setEmail}
//                 placeholder="Enter your email"
//                 keyboardType="email-address"
//                 autoCapitalize="none"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Email Input"
//               />
//             </View>

//             <View style={responsiveStyles.inputContainer}>
//               <Text style={responsiveStyles.label}>Phone Number</Text>
//               <TextInput
//                 style={responsiveStyles.input}
//                 value={phone}
//                 onChangeText={setPhone}
//                 placeholder="Enter your phone number"
//                 keyboardType="phone-pad"
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Phone Number Input"
//               />
//             </View>

//             <View style={responsiveStyles.inputContainer}>
//               <Text style={responsiveStyles.label}>Address</Text>
//               <TextInput
//                 style={[responsiveStyles.input, { height: scale(80) }]}
//                 value={address}
//                 onChangeText={setAddress}
//                 placeholder="Enter your address"
//                 multiline
//                 numberOfLines={3}
//                 placeholderTextColor={currentTheme.placeholderTextColor}
//                 accessibilityLabel="Address Input"
//               />
//             </View>

//             {/* Save Button */}
//             <TouchableOpacity
//               style={responsiveStyles.saveButton}
//               onPress={handleSave}
//               accessibilityLabel="Save Profile"
//               accessibilityRole="button"
//             >
//               <Text style={responsiveStyles.saveButtonText}>Save</Text>
//             </TouchableOpacity>
//           </ScrollView>

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
//     </Modal>
//   );
// };

// export default EditProfilePopup;
