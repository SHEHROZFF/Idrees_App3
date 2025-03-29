// src/screens/UserProfileScreen.js
import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { UserContext } from '../contexts/UserContext';
import EditProfilePopup from '../components/EditProfilePopup';
import CustomAlert from '../components/CustomAlert';

import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../store/slices/authSlice';
import { FavouritesContext } from '../contexts/FavouritesContext';

import { updateUserProfileMultipart, deleteUserAccount } from '../services/api'; // Added deleteUserAccount

// Static fallback images
const STATIC_PROFILE_IMAGE = 'https://w7.pngwing.com/pngs/684/806/png-transparent-user-avatar-enter-photo-placeholder.png';
const STATIC_COVER_IMAGE = 'https://t3.ftcdn.net/jpg/04/25/64/80/240_F_425648048_vJdR1FZINXrMjExnnmk8zUGOrdPf6JTr.jpg';

const UserProfileScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { favouriteItems } = useContext(FavouritesContext);
  const { logout } = useContext(UserContext);

  const { width } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;
  const headerHeight = width * 0.5;

  // Local state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditProfileVisible, setEditProfileVisible] = useState(false);

  // Custom alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Styles
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        headerContainer: {
          position: 'relative',
          width: '100%',
          height: headerHeight,
        },
        coverImage: {
          width: '100%',
          height: '100%',
        },
        coverGradient: {
          position: 'absolute',
          width: '100%',
          height: '100%',
        },
        userInfoContainer: {
          alignItems: 'center',
          marginTop: scale(-60),
          paddingHorizontal: scale(20),
        },
        profileImage: {
          width: scale(120),
          height: scale(120),
          borderRadius: scale(60),
          borderWidth: scale(4),
          marginBottom: scale(10),
          backgroundColor: '#ccc',
          borderColor: currentTheme.borderColor,
        },
        userName: {
          fontSize: scale(26),
          fontWeight: '700',
          color: currentTheme.textColor,
        },
        userEmail: {
          fontSize: scale(18),
          marginBottom: scale(10),
          color: currentTheme.textColor,
        },
        editButton: {
          flexDirection: 'row',
          paddingVertical: scale(8),
          paddingHorizontal: scale(15),
          borderRadius: scale(20),
          alignItems: 'center',
          marginTop: scale(10),
          backgroundColor: currentTheme.primaryColor,
        },
        editButtonText: {
          fontSize: scale(16),
          marginLeft: scale(5),
          fontWeight: '600',
          color: currentTheme.buttonTextColor,
        },
        statsContainer: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginVertical: scale(20),
          paddingHorizontal: scale(20),
        },
        statItem: {
          alignItems: 'center',
        },
        statNumber: {
          fontSize: scale(24),
          fontWeight: '900',
          color: currentTheme.primaryColor,
        },
        statLabel: {
          fontSize: scale(16),
          color: currentTheme.textColor,
        },
        section: {
          paddingHorizontal: scale(20),
          marginBottom: scale(20),
        },
        sectionTitle: {
          fontSize: scale(22),
          fontWeight: '700',
          marginBottom: scale(10),
          color: currentTheme.cardTextColor,
        },
        infoItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: scale(12),
          borderBottomWidth: scale(1),
          borderBottomColor: currentTheme.borderColor,
        },
        infoIcon: {
          marginRight: scale(15),
        },
        infoText: {
          fontSize: scale(16),
          color: currentTheme.textColor,
        },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: currentTheme.backgroundColor,
        },
        loadingText: {
          fontSize: scale(18),
          marginTop: scale(15),
          textAlign: 'center',
          color: currentTheme.textColor,
        },
        deleteButton: {
          // backgroundColor: 'red',
          paddingVertical: scale(10),
          // paddingHorizontal: scale(20),
          marginHorizontal: scale(120),
          borderRadius: scale(20),
          alignItems: 'center',
          marginTop: scale(100),
        },
        deleteButtonText: {
          fontSize: scale(16),
          fontWeight: '900',
          color: '#FFFFFF',
          marginTop: scale(5),
        },
      }),
    [width, currentTheme, headerHeight, scale]
  );

  // Fetch user profile from the server
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      await dispatch(fetchProfile()).unwrap();
      setAlertVisible(false);
    } catch (error) {
      console.error('Fetch User Profile Error:', error);
      setAlertTitle('Error');
      setAlertMessage(error.message || 'Failed to fetch user profile.');
      setAlertIcon('close-circle');
      setAlertButtons([
        { text: 'Retry', onPress: () => fetchUserProfile() },
        { text: 'Cancel', onPress: () => setAlertVisible(false) },
      ]);
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  /**
   * Save profile with images
   * `updatedData` = { name, email, phone, address }
   * `profileUri` and `coverUri` are local image URIs from EditProfilePopup
   */
  const handleSaveProfile = async (updatedData, profileUri, coverUri) => {
    try {
      setLoading(true);
      // Call the new function with FormData
      const result = await updateUserProfileMultipart(updatedData, profileUri, coverUri);
      if (!result.success) {
        throw new Error(result.message);
      }

      // Optionally, refresh the user data from the server
      await fetchUserProfile();

      // Show success alert
      setAlertTitle('Success');
      setAlertMessage('Your profile has been updated successfully.');
      setAlertIcon('checkmark-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    } catch (error) {
      console.error('Update Profile Error:', error);
      setAlertTitle('Error');
      setAlertMessage(error.message || 'Failed to update profile.');
      setAlertIcon('close-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    } finally {
      setLoading(false);
      setEditProfileVisible(false);
    }
  };

  // Function to handle account deletion after confirmation
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      // Call API to delete the account
      const result = await deleteUserAccount();
      if (!result.success) {
        throw new Error(result.message);
      }
      // Account deleted successfully. Hide alert and navigate to Login.
      setAlertVisible(false);
      const response = await logout();
      console.log("responselogout", response);
      if (!response) {
        showAlert('Logout Failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Delete Account Error:', error);
      setAlertTitle('Error');
      setAlertMessage(error.message || 'Failed to delete account.');
      setAlertIcon('close-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to confirm account deletion using the CustomAlert
  const confirmDeleteAccount = () => {
    setAlertTitle('Confirm Account Deletion');
    setAlertMessage('Are you sure you want to delete your account? This action cannot be undone.');
    setAlertIcon('warning');
    setAlertButtons([
      { text: 'Cancel', onPress: () => setAlertVisible(false) },
      { text: 'Delete', onPress: () => handleDeleteAccount() },
    ]);
    setAlertVisible(true);
  };

  const renderInfoItem = (iconName, text) => (
    <View style={styles.infoItem}>
      <Ionicons
        name={iconName}
        size={scale(20)}
        color={currentTheme.searchIconColor}
        style={styles.infoIcon}
      />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.primaryColor} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
      contentContainerStyle={{ paddingBottom: scale(30) }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={currentTheme.primaryColor}
          colors={[currentTheme.primaryColor]}
        />
      }
    >
      {/* Header Section with Cover Image */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: user?.coverImage || STATIC_COVER_IMAGE }}
          style={styles.coverImage}
          resizeMode="cover"
          accessibilityLabel={`${user?.name}'s cover image`}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.5)', 'transparent']}
          style={styles.coverGradient}
        />
      </View>

      {/* User Profile Info */}
      <View style={styles.userInfoContainer}>
        <Image
          source={{ uri: user?.profileImage || STATIC_PROFILE_IMAGE }}
          style={styles.profileImage}
          accessibilityLabel={`${user?.name}'s profile picture`}
          onError={(e) => {
            console.log(`Failed to load profile image for ${user?.name}:`, e.nativeEvent.error);
          }}
        />
        <Text style={styles.userName}>{user?.name || 'N/A'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setEditProfileVisible(true)}
          accessibilityLabel="Edit Profile"
          accessibilityRole="button"
        >
          <Ionicons name="pencil" size={scale(20)} color="#FFFFFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('Favourites')}
        >
          <Text style={styles.statNumber}>{favouriteItems.length || 0}</Text>
          <Text style={styles.statLabel}>Favourites</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('PurchaseHistory')}
        >
          <Text style={styles.statNumber}>{user?.purchasesCount || 0}</Text>
          <Text style={styles.statLabel}>Purchases</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.statItem}
          onPress={() => navigation.navigate('MyReviewsScreen')}
        >
          <Text style={styles.statNumber}>{user?.reviewsCount || 0}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </TouchableOpacity>
      </View>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {renderInfoItem('call', user?.phone || 'N/A')}
        {renderInfoItem('location', user?.address || 'N/A')}
      </View>

      {/* Delete Account Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: currentTheme.primaryColor }]}
          onPress={confirmDeleteAccount}
          accessibilityLabel="Delete Account"
          accessibilityRole="button"
        >
          <Ionicons name="trash" size={scale(30)} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Popup */}
      <EditProfilePopup
        visible={isEditProfileVisible}
        onClose={() => setEditProfileVisible(false)}
        userData={user}
        onSave={handleSaveProfile}
      />

      {/* CustomAlert Component */}
      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        icon={alertIcon}
        onClose={() => setAlertVisible(false)}
        buttons={alertButtons}
      />
    </ScrollView>
  );
};

export default UserProfileScreen;












// // src/screens/UserProfileScreen.js
// import React, { useEffect, useState, useContext, useMemo } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   ActivityIndicator,
//   RefreshControl,
//   useWindowDimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import EditProfilePopup from '../components/EditProfilePopup';
// import CustomAlert from '../components/CustomAlert';

// import { useDispatch, useSelector } from 'react-redux';
// import { fetchProfile } from '../store/slices/authSlice'; // We'll remove direct updateProfile usage
// import { FavouritesContext } from '../contexts/FavouritesContext';

// import { updateUserProfileMultipart } from '../services/api'; // The new function

// // Static fallback images
// const STATIC_PROFILE_IMAGE = 'https://w7.pngwing.com/pngs/684/806/png-transparent-user-avatar-enter-photo-placeholder.png';
// const STATIC_COVER_IMAGE = 'https://t3.ftcdn.net/jpg/04/25/64/80/240_F_425648048_vJdR1FZINXrMjExnnmk8zUGOrdPf6JTr.jpg';

// const UserProfileScreen = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.auth.user);
//   const { favouriteItems } = useContext(FavouritesContext);

//   const { width } = useWindowDimensions();
//   const baseWidth = width > 375 ? 460 : 500;
//   const scaleFactor = width / baseWidth;
//   const scale = (size) => size * scaleFactor;
//   const headerHeight = width * 0.5;

//   // Local state
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [isEditProfileVisible, setEditProfileVisible] = useState(false);

//   // Custom alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Styles
//   const styles = useMemo(
//     () =>
//       StyleSheet.create({
//         container: {
//           flex: 1,
//         },
//         headerContainer: {
//           position: 'relative',
//           width: '100%',
//           height: headerHeight,
//         },
//         coverImage: {
//           width: '100%',
//           height: '100%',
//         },
//         coverGradient: {
//           position: 'absolute',
//           width: '100%',
//           height: '100%',
//         },
//         userInfoContainer: {
//           alignItems: 'center',
//           marginTop: scale(-60),
//           paddingHorizontal: scale(20),
//         },
//         profileImage: {
//           width: scale(120),
//           height: scale(120),
//           borderRadius: scale(60),
//           borderWidth: scale(4),
//           marginBottom: scale(10),
//           backgroundColor: '#ccc',
//           borderColor: currentTheme.borderColor,
//         },
//         userName: {
//           fontSize: scale(26),
//           fontWeight: '700',
//           color: currentTheme.textColor,
//         },
//         userEmail: {
//           fontSize: scale(18),
//           marginBottom: scale(10),
//           color: currentTheme.textColor,
//         },
//         editButton: {
//           flexDirection: 'row',
//           paddingVertical: scale(8),
//           paddingHorizontal: scale(15),
//           borderRadius: scale(20),
//           alignItems: 'center',
//           marginTop: scale(10),
//           backgroundColor: currentTheme.primaryColor,
//         },
//         editButtonText: {
//           fontSize: scale(16),
//           marginLeft: scale(5),
//           fontWeight: '600',
//           color: currentTheme.buttonTextColor,
//         },
//         statsContainer: {
//           flexDirection: 'row',
//           justifyContent: 'space-around',
//           marginVertical: scale(20),
//           paddingHorizontal: scale(20),
//         },
//         statItem: {
//           alignItems: 'center',
//         },
//         statNumber: {
//           fontSize: scale(24),
//           fontWeight: '900',
//           color: currentTheme.primaryColor,
//         },
//         statLabel: {
//           fontSize: scale(16),
//           color: currentTheme.textColor,
//         },
//         section: {
//           paddingHorizontal: scale(20),
//           marginBottom: scale(20),
//         },
//         sectionTitle: {
//           fontSize: scale(22),
//           fontWeight: '700',
//           marginBottom: scale(10),
//           color: currentTheme.cardTextColor,
//         },
//         infoItem: {
//           flexDirection: 'row',
//           alignItems: 'center',
//           paddingVertical: scale(12),
//           borderBottomWidth: scale(1),
//           borderBottomColor: currentTheme.borderColor,
//         },
//         infoIcon: {
//           marginRight: scale(15),
//         },
//         infoText: {
//           fontSize: scale(16),
//           color: currentTheme.textColor,
//         },
//         loadingContainer: {
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//           backgroundColor: currentTheme.backgroundColor,
//         },
//         loadingText: {
//           fontSize: scale(18),
//           marginTop: scale(15),
//           textAlign: 'center',
//           color: currentTheme.textColor,
//         },
//       }),
//     [width, currentTheme, headerHeight, scale]
//   );

//   // Fetch user profile from the server
//   const fetchUserProfile = async () => {
//     try {
//       setLoading(true);
//       await dispatch(fetchProfile()).unwrap();
//       setAlertVisible(false);
//     } catch (error) {
//       console.error('Fetch User Profile Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to fetch user profile.');
//       setAlertIcon('close-circle');
//       setAlertButtons([
//         { text: 'Retry', onPress: () => fetchUserProfile() },
//         { text: 'Cancel', onPress: () => setAlertVisible(false) },
//       ]);
//       setAlertVisible(true);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchUserProfile();
//   }, []);

//   const onRefresh = () => {
//     setRefreshing(true);
//     fetchUserProfile();
//   };

//   /**
//    *  Save profile with images
//    *  `updatedData` = { name, email, phone, address }
//    *  `profileUri` and `coverUri` are local image URIs from EditProfilePopup
//    */
//   const handleSaveProfile = async (updatedData, profileUri, coverUri) => {
//     try {
//       setLoading(true);
//       // Call the new function with FormData
//       const result = await updateUserProfileMultipart(updatedData, profileUri, coverUri);
//       if (!result.success) {
//         throw new Error(result.message);
//       }

//       // Optionally, refresh the user data from the server
//       await fetchUserProfile();

//       // Show success alert
//       setAlertTitle('Success');
//       setAlertMessage('Your profile has been updated successfully.');
//       setAlertIcon('checkmark-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     } catch (error) {
//       console.error('Update Profile Error:', error);
//       setAlertTitle('Error');
//       setAlertMessage(error.message || 'Failed to update profile.');
//       setAlertIcon('close-circle');
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     } finally {
//       setLoading(false);
//       setEditProfileVisible(false);
//     }
//   };

//   const renderInfoItem = (iconName, text) => (
//     <View style={styles.infoItem}>
//       <Ionicons
//         name={iconName}
//         size={scale(20)}
//         color={currentTheme.searchIconColor}
//         style={styles.infoIcon}
//       />
//       <Text style={styles.infoText}>{text}</Text>
//     </View>
//   );

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={styles.loadingText}>Loading your profile...</Text>
//       </View>
//     );
//   }

//   return (
//     <ScrollView
//       style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
//       contentContainerStyle={{ paddingBottom: scale(30) }}
//       showsVerticalScrollIndicator={false}
//       refreshControl={
//         <RefreshControl
//           refreshing={refreshing}
//           onRefresh={onRefresh}
//           tintColor={currentTheme.primaryColor}
//           colors={[currentTheme.primaryColor]}
//         />
//       }
//     >
//       {/* Header Section with Cover Image */}
//       <View style={styles.headerContainer}>
//         <Image
//           source={{ uri: user?.coverImage || STATIC_COVER_IMAGE }}
//           style={styles.coverImage}
//           resizeMode="cover"
//           accessibilityLabel={`${user?.name}'s cover image`}
//         />
//         <LinearGradient
//           colors={['rgba(0,0,0,0.5)', 'transparent']}
//           style={styles.coverGradient}
//         />
//       </View>

//       {/* User Profile Info */}
//       <View style={styles.userInfoContainer}>
//         <Image
//           source={{ uri: user?.profileImage || STATIC_PROFILE_IMAGE }}
//           style={styles.profileImage}
//           accessibilityLabel={`${user?.name}'s profile picture`}
//           onError={(e) => {
//             console.log(`Failed to load profile image for ${user?.name}:`, e.nativeEvent.error);
//           }}
//         />
//         <Text style={styles.userName}>{user?.name || 'N/A'}</Text>
//         <Text style={styles.userEmail}>{user?.email || 'N/A'}</Text>
//         <TouchableOpacity
//           style={styles.editButton}
//           onPress={() => setEditProfileVisible(true)}
//           accessibilityLabel="Edit Profile"
//           accessibilityRole="button"
//         >
//           <Ionicons name="pencil" size={scale(20)} color="#FFFFFF" />
//           <Text style={styles.editButtonText}>Edit Profile</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Statistics Section */}
//       <View style={styles.statsContainer}>
//         <TouchableOpacity
//           style={styles.statItem}
//           onPress={() => navigation.navigate('Favourites')}
//         >
//           <Text style={styles.statNumber}>{favouriteItems.length || 0}</Text>
//           <Text style={styles.statLabel}>Favourites</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.statItem}
//           onPress={() => navigation.navigate('PurchaseHistory')}
//         >
//           <Text style={styles.statNumber}>{user?.purchasesCount || 0}</Text>
//           <Text style={styles.statLabel}>Purchases</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={styles.statItem}
//           onPress={() => navigation.navigate('MyReviewsScreen')}
//         >
//           <Text style={styles.statNumber}>{user?.reviewsCount || 0}</Text>
//           <Text style={styles.statLabel}>Reviews</Text>
//         </TouchableOpacity>
//       </View>

//       {/* <View style={styles.statsContainer}>
//         <View style={styles.statItem}>
//           <Text style={styles.statNumber}>{user?.purchasesCount || 0}</Text>
//           <Text style={styles.statLabel}>Purchases</Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={styles.statNumber}>{favouriteItems.length || 0}</Text>
//           <Text style={styles.statLabel}>Favorites</Text>
//         </View>
//         <View style={styles.statItem}>
//           <Text style={styles.statNumber}>{user?.reviewsCount || 0}</Text>
//           <Text style={styles.statLabel}>Reviews</Text>
//         </View>
//       </View> */}

//       {/* Personal Information Section */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Personal Information</Text>
//         {renderInfoItem('call', user?.phone || 'N/A')}
//         {renderInfoItem('location', user?.address || 'N/A')}
//       </View>

//       {/* Edit Profile Popup */}
//       <EditProfilePopup
//         visible={isEditProfileVisible}
//         onClose={() => setEditProfileVisible(false)}
//         userData={user}
//         onSave={handleSaveProfile}
//       />

//       {/* CustomAlert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </ScrollView>
//   );
// };

// export default UserProfileScreen;
