// src/screens/PurchaseScreen.js

import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  RefreshControl,
  StatusBar,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AdsSection from '../components/AdsSection';
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

// Redux imports
import { useDispatch } from 'react-redux';
import { fetchCourseByIdThunk } from '../store/slices/courseSlice';
import { fetchPaymentIntentThunk } from '../store/slices/paymentSlice';
import { enrollInCourseThunk, fetchMyEnrollmentsThunk } from '../store/slices/enrollmentSlice';

import { Portal } from 'react-native-paper';
import CustomAlert from '../components/CustomAlert';

// Reusable sub-component
const ReceiptCard = ({ course, theme, scale }) => {
  // Optionally, you can scale further inside here, or reuse the parent's style variables
  return (
    <View
      style={[
        {
          width: '100%',
          borderWidth: scale(1),
          borderRadius: scale(14),
          padding: scale(15),
          marginVertical: scale(15),
          shadowOffset: { width: 0, height: scale(3) },
          shadowOpacity: 0.2,
          shadowRadius: scale(4),
          elevation: scale(3),
          backgroundColor: theme.backgroundColor,
          borderColor: theme.borderColor,
        },
      ]}
    >
      <Text
        style={{
          fontSize: scale(20),
          fontWeight: '700',
          marginBottom: scale(10),
          textAlign: 'center',
          color: theme.textColor,
        }}
      >
        {course.title}
      </Text>
      {/* Some lines of detail */}
      <DetailRow label="Instructor" value={course.instructor} scale={scale} theme={theme} />
      <DetailRow label="Category" value={course.category} scale={scale} theme={theme} />
      <DetailRow
        label="Price"
        value={`$${course.price}`}
        scale={scale}
        theme={theme}
        hideIfEmpty={true}
      />
      {course.saleEnabled && course.salePrice < course.price && (
        <DetailRow
          label="Sale Price"
          value={`$${course.salePrice}`}
          scale={scale}
          theme={theme}
          highlight
        />
      )}
      <DetailRow label="Rating" value={course.rating} scale={scale} theme={theme} />
      <DetailRow label="Difficulty" value={course.difficultyLevel} scale={scale} theme={theme} />
      <DetailRow label="Language" value={course.language} scale={scale} theme={theme} />
      <DetailRow
        label="Lectures"
        value={`${course.numberOfLectures}`}
        scale={scale}
        theme={theme}
      />
      <DetailRow
        label="Duration"
        value={`${course.totalDuration} hrs`}
        scale={scale}
        theme={theme}
      />
      {/* You can add more fields or condense them as you see fit */}
    </View>
  );
};

const DetailRow = ({ label, value, scale, theme, highlight, hideIfEmpty }) => {
  if (!value && hideIfEmpty) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: scale(6),
        justifyContent: 'space-between',
      }}
    >
      <Text
        style={{
          fontSize: scale(14),
          fontWeight: '600',
          color: theme.textColor,
          width: '35%',
        }}
      >
        {label}:
      </Text>
      <Text
        style={{
          fontSize: scale(14),
          fontWeight: highlight ? '700' : '400',
          color: highlight ? theme.primaryColor : theme.textColor,
          width: '60%',
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
};

const PurchaseScreen = () => {
  const { width } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  const styles = useMemo(() => createStyles(scale, width), [scaleFactor, width]);

  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params;
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const insets = useSafeAreaInsets();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Custom Alert state
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState([]);
  const [customAlertIcon, setCustomAlertIcon] = useState('');

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const dispatch = useDispatch();

  // Helper to show custom alert
  const showAlert = useCallback((title, message, buttons, icon) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(buttons || []);
    setCustomAlertIcon(icon || 'alert-circle');
    setCustomAlertVisible(true);
  }, []);

  // Load course details
  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
      if (result.success && result.data) {
        setCourse(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to load course info.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [courseId, dispatch]);

  // Check if user is already enrolled
  const checkEnrollmentStatus = useCallback(
    async (courseData) => {
      if (!courseData) return;
      try {
        const enrollResult = await dispatch(fetchMyEnrollmentsThunk()).unwrap();
        if (enrollResult.enrollments) {
          const alreadyEnrolled = enrollResult.enrollments.some(
            (enrollment) =>
              enrollment.course && enrollment.course._id.toString() === courseId
          );
          setIsEnrolled(alreadyEnrolled);
        }
      } catch (err) {
        console.error('Enrollment check error:', err);
      }
    },
    [courseId, dispatch]
  );

  useEffect(() => {
    const loadData = async () => {
      await loadCourse();
    };
    loadData();
  }, [loadCourse]);

  useEffect(() => {
    if (course) {
      checkEnrollmentStatus(course);
    }
  }, [course, checkEnrollmentStatus]);

  // Final Price
  const finalPrice =
    course && course.saleEnabled && course.salePrice < course.price
      ? course.salePrice
      : course?.price;

  // Calculate discount
  let discountPercentage = 0;
  if (
    course &&
    course.saleEnabled &&
    course.price > 0 &&
    course.salePrice < course.price
  ) {
    discountPercentage = Math.round(
      ((course.price - course.salePrice) / course.price) * 100
    );
  }

  // Purchase logic
  const handlePurchase = async () => {
    if (!course) return;
    if (isEnrolled) {
      showAlert(
        'Already Enrolled',
        'You are already enrolled in this course.',
        [],
        'information-circle'
      );
      return;
    }
    setButtonLoading(true);

    // If free, just enroll
    if (finalPrice === 0) {
      try {
        const enrollResult = await dispatch(enrollInCourseThunk(courseId)).unwrap();
        if (enrollResult) {
          showAlert('Enrollment Successful', 'Enjoy your course!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ], 'checkmark-circle');
        } else {
          showAlert('Enrollment Failed', 'Something went wrong enrolling.', [], 'alert-circle');
        }
      } catch (error) {
        showAlert('Error', error.message, [], 'alert-circle');
      } finally {
        setButtonLoading(false);
      }
      return;
    }

    // Otherwise paid – handle Stripe flow
    try {
      const clientSecret = await dispatch(fetchPaymentIntentThunk(finalPrice)).unwrap();
      if (!clientSecret) {
        showAlert('Error', 'Could not initiate payment.', [], 'alert-circle');
        setButtonLoading(false);
        return;
      }

      // init PaymentSheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Your App Name',
      });
      if (initError) {
        showAlert('Payment Error', initError.message, [], 'alert-circle');
        setButtonLoading(false);
        return;
      }

      // present PaymentSheet
      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        showAlert('Payment Failed', paymentError.message, [], 'alert-circle');
        setButtonLoading(false);
        return;
      }

      // Payment success – enroll
      const enrollResult = await dispatch(enrollInCourseThunk(courseId)).unwrap();
      if (enrollResult && enrollResult.success) {
        showAlert('Enrollment Successful', 'Enjoy your course!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ], 'checkmark-circle');
      } else {
        showAlert('Enrollment Failed', enrollResult.message, [], 'alert-circle');
      }
    } catch (error) {
      showAlert('Checkout Failed', error.message, [], 'alert-circle');
    }
    setButtonLoading(false);
  };

  // Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourse();
    setRefreshing(false);
  };

  // Ads
  const handleAdPress = useCallback(
    (ad) => {
      if (ad.adProdtype === 'Course') {
        navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
      } else {
        navigation.navigate('ProductPage', { productId: ad.adProdId });
      }
    },
    [navigation]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={currentTheme.primaryColor} />
          <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
            Loading course...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !course) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
            {error || 'Course not found.'}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
            onPress={loadCourse}
          >
            <Text style={[styles.retryButtonText, { color: currentTheme.buttonTextColor }]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Destructure some fields
  const { title, price, description, image, rating } = course;

  return (
    <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />

      {/* "Hero" background shape + gradient */}
      <LinearGradient
        colors={currentTheme.headerBackground}
        style={[styles.heroContainer, { paddingTop: insets.top + scale(10) }]}
        start={[0, 0]}
        end={[1, 1]}
      >
        {/* Nav Back Button */}
        <TouchableOpacity
          style={styles.heroBackButton}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go Back"
        >
          <Ionicons
            name="arrow-back"
            size={scale(28)}
            color={currentTheme.headerTextColor}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.heroTitle, { color: currentTheme.headerTextColor }]}>
          Purchase Course
        </Text>

        {/* Subtle wave shape or second color block */}
        <View style={[styles.heroWaveShape, { backgroundColor: currentTheme.backgroundColor }]} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={currentTheme.primaryColor} />
        }
      >
        {/* Main Card container with elevated style */}
        <View style={[styles.mainCard, { backgroundColor: currentTheme.cardBackground }]}>
          {image ? (
            <Image source={{ uri: image }} style={styles.courseImage} resizeMode="cover" />
          ) : null}
          <Text style={[styles.courseTitle, { color: currentTheme.textColor }]} numberOfLines={2}>
            {title}
          </Text>

          {/* Star rating row */}
          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }, (_, i) => {
              const fill = i < Math.floor(rating);
              return (
                <Ionicons
                  key={i}
                  name={fill ? 'star' : 'star-outline'}
                  size={scale(18)}
                  color="#FFD700"
                  style={{ marginRight: scale(4) }}
                />
              );
            })}
            <Text style={[styles.ratingNumber, { color: currentTheme.textColor }]}>{rating}</Text>
          </View>

          {/* Price / discount display */}
          {price > 0 && (
            <>
              {course.saleEnabled && course.salePrice < price ? (
                <View style={styles.priceContainer}>
                  <Text
                    style={[
                      styles.oldPrice,
                      {
                        color: currentTheme.placeholderTextColor,
                        textDecorationLine: 'line-through',
                      },
                    ]}
                  >
                    ${price.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.salePrice,
                      {
                        color: currentTheme.errorTextColor,
                      },
                    ]}
                  >
                    ${course.salePrice.toFixed(2)}
                  </Text>
                  {discountPercentage > 0 && (
                    <Text
                      style={[styles.discountText, { color: currentTheme.primaryColor }]}
                    >
                      {discountPercentage}% off
                    </Text>
                  )}
                </View>
              ) : (
                <Text style={[styles.normalPrice, { color: currentTheme.primaryColor }]}>
                  ${price.toFixed(2)}
                </Text>
              )}
            </>
          )}
          {price === 0 && (
            <Text style={[styles.normalPrice, { color: currentTheme.primaryColor }]}>Free</Text>
          )}

          {/* Short Description */}
          {!!description && (
            <Text style={[styles.courseDescription, { color: currentTheme.textColor }]}>
              {description.slice(0, 120)}
              {description.length > 120 && '...'}
            </Text>
          )}

          {/* Detailed info card */}
          <ReceiptCard course={course} theme={currentTheme} scale={scale} />

          {/* Price + button area */}
          <View style={styles.purchaseRow}>
            {/* If the course is free or on sale, show some detail next to button, or just button */}
            <TouchableOpacity
              style={[styles.purchaseButton, { backgroundColor: currentTheme.primaryColor }]}
              onPress={handlePurchase}
              disabled={buttonLoading}
            >
              {buttonLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.purchaseButtonText, { color: currentTheme.buttonTextColor }]}>
                  {price === 0 ? 'Enroll Now' : 'Buy Now'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Ads or Additional Info */}
        {/* <View style={styles.adsSection}>
          <Text
            style={[styles.adsHeading, { color: currentTheme.textColor }]}
          >
            Explore Similar Courses
          </Text> */}
          <AdsSection
            currentTheme={currentTheme}
            onAdPress={handleAdPress}
            refreshSignal={0}
            templateFilter="newCourse"
            marginV={0}
            headingShow={true}
            headingText='Explore Similar Courses'
            headingStyle={styles.adsHeading}
          />
        {/* </View> */}

        {/* <View style={styles.adsSection}>
          <Text
            style={[styles.adsHeading, { color: currentTheme.textColor }]}
          >
            Ongoing Sales
          </Text> */}
          <AdsSection
            currentTheme={currentTheme}
            onAdPress={handleAdPress}
            refreshSignal={0}
            templateFilter="sale"
            marginV={0}
            headingStyle={styles.adsHeading}
            headingText='Check Our Ongoing Sales'
            headingShow={true}
          />
        {/* </View> */}
      </ScrollView>

      {/* Custom Alert */}
      <Portal>
        <CustomAlert
          visible={customAlertVisible}
          title={customAlertTitle}
          message={customAlertMessage}
          icon={customAlertIcon}
          buttons={
            customAlertButtons.length
              ? customAlertButtons
              : [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
          }
          onClose={() => setCustomAlertVisible(false)}
        />
      </Portal>
    </View>
  );
};

export default PurchaseScreen;

/** ------------------------------------------------------------------
 *  STYLES (SCALED)
 * ----------------------------------------------------------------- */
const createStyles = (scale, width) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: scale(10),
      fontSize: scale(16),
    },
    errorText: {
      fontSize: scale(18),
      fontWeight: 'bold',
      textAlign: 'center',
    },
    retryButton: {
      marginTop: scale(20),
      paddingHorizontal: scale(20),
      paddingVertical: scale(10),
      borderRadius: scale(8),
    },
    retryButtonText: {
      fontSize: scale(16),
    },
    heroContainer: {
      width: '100%',
      height: scale(180),
      borderBottomLeftRadius: scale(60),
      borderBottomRightRadius: scale(60),
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(10),
    },
    heroBackButton: {
      position: 'absolute',
      top: scale(50),
      left: scale(20),
      zIndex: 10,
      padding: scale(8),
    },
    backIcon: {
      // optional margin
    },
    heroTitle: {
      fontSize: scale(28),
      fontWeight: '800',
      top: scale(50),
      color: '#fff',
      position: 'absolute',
      zIndex: 2,
      textAlign: 'center',
      width: '100%',
      paddingHorizontal: scale(20),
    },
    heroWaveShape: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: scale(70),
      borderTopLeftRadius: scale(70),
      borderTopRightRadius: scale(70),
    },
    scrollContainer: {
      paddingBottom: scale(90),
    },
    mainCard: {
      width: '90%',
      alignSelf: 'center',
      borderRadius: scale(20),
      padding: scale(16),
      marginTop: scale(-60),
      // Shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(4) },
      shadowOpacity: 0.15,
      shadowRadius: scale(6),
      elevation: scale(5),
      zIndex: 3,
    },
    courseImage: {
      width: '100%',
      height: scale(180),
      borderRadius: scale(12),
      marginBottom: scale(15),
    },
    courseTitle: {
      fontSize: scale(22),
      fontWeight: '700',
      marginBottom: scale(8),
      textAlign: 'center',
      paddingHorizontal: scale(10),
    },
    ratingRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: scale(8),
    },
    ratingNumber: {
      fontSize: scale(15),
      marginLeft: scale(5),
      fontWeight: '600',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: scale(8),
    },
    oldPrice: {
      fontSize: scale(16),
      marginRight: scale(8),
    },
    salePrice: {
      fontSize: scale(20),
      fontWeight: '700',
    },
    discountText: {
      fontSize: scale(12),
      marginLeft: scale(6),
      fontWeight: '600',
    },
    normalPrice: {
      fontSize: scale(20),
      fontWeight: '700',
      marginBottom: scale(8),
      textAlign: 'center',
    },
    courseDescription: {
      fontSize: scale(15),
      lineHeight: scale(20),
      textAlign: 'center',
      marginBottom: scale(10),
    },
    purchaseRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: scale(10),
    },
    purchaseButton: {
      borderRadius: scale(18),
      paddingVertical: scale(10),
      paddingHorizontal: scale(25),
      elevation: scale(4),
    },
    purchaseButtonText: {
      fontSize: scale(16),
      fontWeight: '600',
    },
    // adsSection: {
    //   marginTop: scale(20),
    //   marginBottom: scale(35),
    // },
    adsHeading: {
      fontSize: scale(22),
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: scale(10),
      marginTop: scale(20)
    },
  });














// // src/screens/PurchaseScreen.js
// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   SafeAreaView,
//   Image,
//   ScrollView,
//   RefreshControl,
//   StatusBar,
//   Platform,
//   useWindowDimensions,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useStripe } from '@stripe/stripe-react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import AdsSection from '../components/AdsSection';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Redux imports – replace direct API calls with thunks!
// import { useDispatch } from 'react-redux';
// import { fetchCourseByIdThunk } from '../store/slices/courseSlice';
// import { fetchPaymentIntentThunk } from '../store/slices/paymentSlice';
// import { enrollInCourseThunk, fetchMyEnrollmentsThunk } from '../store/slices/enrollmentSlice';

// import { Portal } from 'react-native-paper';

// // Import your custom alert
// import CustomAlert from '../components/CustomAlert';

// // A simple sub-component that displays detailed course info
// const ReceiptCard = ({ course, theme }) => (
//   <View
//     style={[
//       styles.receiptCard,
//       {
//         backgroundColor: theme.backgroundColor,
//         borderColor: theme.borderColor,
//       },
//     ]}
//   >
//     <Text style={[styles.receiptTitle, { color: theme.textColor }]}>
//       {course.title}
//     </Text>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Instructor:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.instructor}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Category:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.category}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Price:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         ${course.price}
//       </Text>
//     </View>

//     {course.saleEnabled && course.salePrice < course.price && (
//       <View style={styles.receiptRow}>
//         <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//           Sale Price:
//         </Text>
//         <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//           ${course.salePrice}
//         </Text>
//       </View>
//     )}

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Rating:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.rating}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Difficulty:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.difficultyLevel}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Language:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.language}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Lectures:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.numberOfLectures}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Duration:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.totalDuration} hrs
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Description:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>
//         {course.description}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Requirements:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>
//         {course.requirements.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Topics:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>
//         {course.topics.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         What You'll Learn:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>
//         {course.whatYouWillLearn.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Created At:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {new Date(course.createdAt).toLocaleDateString()}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Updated At:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {new Date(course.updatedAt).toLocaleDateString()}
//       </Text>
//     </View>
//   </View>
// );

// const PurchaseScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const insets = useSafeAreaInsets();
//   const { width } = useWindowDimensions();

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [buttonLoading, setButtonLoading] = useState(false);
//   const [purchaseInProgress, setPurchaseInProgress] = useState(false);
//   const [error, setError] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // Custom Alert state
//   const [customAlertVisible, setCustomAlertVisible] = useState(false);
//   const [customAlertTitle, setCustomAlertTitle] = useState('');
//   const [customAlertMessage, setCustomAlertMessage] = useState('');
//   const [customAlertButtons, setCustomAlertButtons] = useState([]);
//   const [customAlertIcon, setCustomAlertIcon] = useState('');

//   // Helper function to show custom alert
//   const showAlert = (title, message, buttons, icon) => {
//     setCustomAlertTitle(title);
//     setCustomAlertMessage(message);
//     setCustomAlertButtons(buttons || []);
//     setCustomAlertVisible(true);
//     setCustomAlertIcon(icon);
//   };

//   const { initPaymentSheet, presentPaymentSheet } = useStripe();
//   const dispatch = useDispatch();

//   // Load course details via Redux thunk
//   const loadCourse = useCallback(async () => {
//     try {
//       setLoading(true);
//       const result = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
//       if (result.success && result.data) {
//         setCourse(result.data);
//         setError(null);
//       } else {
//         setError(result.message);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [courseId, dispatch]);

//   useEffect(() => {
//     loadCourse();
//   }, [loadCourse]);

//   // Check enrollment status via Redux thunk
//   const checkEnrollmentStatus = useCallback(async () => {
//     if (course) {
//       try {
//         const enrollResult = await dispatch(fetchMyEnrollmentsThunk()).unwrap();
//         if (enrollResult.enrollments) {
//           const alreadyEnrolled = enrollResult.enrollments.some(
//             (enrollment) =>
//               enrollment.course &&
//               enrollment.course._id.toString() === courseId
//           );
//           setIsEnrolled(alreadyEnrolled);
//         }
//       } catch (err) {
//         console.error('Enrollment check error:', err);
//       }
//     }
//   }, [course, courseId, dispatch]);

//   useEffect(() => {
//     checkEnrollmentStatus();
//   }, [course, checkEnrollmentStatus]);

//   // Determine final price based on sale conditions
//   const finalPrice =
//     course && course.saleEnabled && course.salePrice < course.price
//       ? course.salePrice
//       : course && course.price;

//   // Calculate discount percentage if applicable
//   let discountPercentage = 0;
//   if (
//     course &&
//     course.saleEnabled &&
//     course.price > 0 &&
//     course.salePrice < course.price
//   ) {
//     discountPercentage = Math.round(
//       ((course.price - course.salePrice) / course.price) * 100
//     );
//   }

//   // Handle purchase action
//   const handlePurchase = async () => {
//     if (isEnrolled) {
//       showAlert('Already Enrolled', 'You are already enrolled in this course.',[], 'alert-circle');
//       return;
//     }

//     setButtonLoading(true);

//     // For free courses, enroll directly
//     if (finalPrice === 0) {
//       try {
//         setPurchaseInProgress(true);
//         const enrollResult = await dispatch(enrollInCourseThunk(courseId)).unwrap();
//         if (enrollResult) {
//           showAlert('Enrollment Successful', 'You have been enrolled in this course!', [
//             { text: 'OK', onPress: () => navigation.goBack() },
//           ],'checkmark-circle');
//         } else {
//           showAlert('Enrollment Failed', 'Something went wrong.',[], 'alert-circle');
//         }
//       } catch (error) {
//         showAlert('Error', error.message);
//       } finally {
//         setPurchaseInProgress(false);
//         setButtonLoading(false);
//       }
//       return;
//     }

//     // For paid courses, process payment with Stripe
//     try {
//       setPurchaseInProgress(true);
//       const clientSecret = await dispatch(fetchPaymentIntentThunk(finalPrice)).unwrap();
//       if (!clientSecret) {
//         showAlert('Error', 'Could not initiate payment.',[], 'alert-circle');
//         setButtonLoading(false);
//         return;
//       }

//       const { error: initError } = await initPaymentSheet({
//         paymentIntentClientSecret: clientSecret,
//         merchantDisplayName: 'Your App Name',
//       });
//       if (initError) {
//         showAlert('Payment Error', initError.message,[], 'alert-circle');
//         setButtonLoading(false);
//         return;
//       }

//       const { error: paymentError } = await presentPaymentSheet();
//       if (paymentError) {
//         showAlert('Payment Failed', paymentError.message);
//         setButtonLoading(false);
//         return;
//       }

//       // Payment successful – enroll via Redux thunk
//       const enrollResult = await dispatch(enrollInCourseThunk(courseId)).unwrap();
//       if (enrollResult) {
//         showAlert('Enrollment Successful', 'You have been enrolled in this course!', [
//           { text: 'OK', onPress: () => navigation.goBack() },
//         ],  'checkmark-circle');
//       } else {
//         showAlert('Enrollment Failed', enrollResult.message,[], 'alert-circle');
//       }
//     } catch (error) {
//       showAlert(
//         'Checkout Failed',
//         error.message || 'An error occurred during checkout.',
//         [],
//         'alert-circle'
//       );
//     }
//     setPurchaseInProgress(false);
//     setButtonLoading(false);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadCourse();
//     setRefreshing(false);
//   };

//   const handleAdPress = useCallback(
//     (ad) => {
//       if (ad.adProdtype === 'Course') {
//         navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//       } else {
//         navigation.navigate('ProductPage', { productId: ad.adProdId });
//       }
//     },
//     [navigation]
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading course...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !course) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
//             {error || 'Course not found.'}
//           </Text>
//           <TouchableOpacity
//             style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={loadCourse}
//           >
//             <Text style={[styles.retryButtonText, { color: currentTheme.buttonTextColor }]}>
//               Retry
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const { title, price, description, image } = course;

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
//         <TouchableOpacity
//           style={styles.headerBackButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons
//             name="arrow-back"
//             size={24}
//             color={currentTheme.headerTextColor}
//             style={styles.backButton}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Purchase Course
//         </Text>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         <View style={styles.mainContent}>
//           {/* Ads Section */}
//           <View style={[styles.adsWrapper, { borderBottomColor: currentTheme.borderColor }]}>
//             <Text style={[styles.adsTitle, { color: currentTheme.textColor }]}>
//               Get More Excited Course
//             </Text>
//             <AdsSection
//               currentTheme={currentTheme}
//               onAdPress={handleAdPress}
//               refreshSignal={0}
//               templateFilter="newCourse"
//               marginV={25}
//             />
//           </View>

//           {/* Course Card */}
//           <View
//             style={[
//               styles.cardContainer,
//               {
//                 backgroundColor: currentTheme.cardBackground,
//                 shadowColor: currentTheme.textShadowColor,
//                 width: width * 0.96,
//               },
//             ]}
//           >
//             {image && (
//               <Image
//                 source={{ uri: image }}
//                 style={styles.courseImage}
//                 resizeMode="cover"
//               />
//             )}
//             <Text style={[styles.courseTitle, { color: currentTheme.textColor }]}>
//               {title}
//             </Text>
//             {price > 0 &&
//               (course.saleEnabled && course.salePrice < price ? (
//                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                   <Text
//                     style={[
//                       styles.coursePrice,
//                       {
//                         color: currentTheme.textColor,
//                         textDecorationLine: 'line-through',
//                         left: 35,
//                       },
//                     ]}
//                   >
//                     ${price.toFixed(2)}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.coursePrice,
//                       {
//                         color: currentTheme.errorTextColor,
//                         marginLeft: 8,
//                         transform: [{ rotate: '30deg' }],
//                         left: 35,
//                         fontWeight: 'bold',
//                         fontSize: 24,
//                       },
//                     ]}
//                   >
//                     ${course.salePrice.toFixed(2)}
//                   </Text>
//                 </View>
//               ) : (
//                 <Text style={[styles.coursePrice, { color: currentTheme.primaryColor }]}>
//                   ${price.toFixed(2)}
//                 </Text>
//               ))}

//             {description && (
//               <Text style={[styles.courseDescription, { color: currentTheme.textColor }]}>
//                 {description}
//               </Text>
//             )}

//             {/* Full Course Details */}
//             <ReceiptCard course={course} theme={currentTheme} />

//             {/* Price and Sale Tag Section */}
//             <View style={styles.buttonContainer}>
//               <View style={styles.priceSection}>
//                 <TouchableOpacity
//                   style={[
//                     styles.footerPriceButton,
//                     {
//                       borderColor: currentTheme.borderColor,
//                       backgroundColor: currentTheme.backgroundColor,
//                     },
//                   ]}
//                   disabled
//                 >
//                   {course.saleEnabled && course.salePrice < course.price ? (
//                     <Text
//                       style={[
//                         styles.footerPriceText,
//                         {
//                           color: currentTheme.textColor,
//                           textDecorationLine: 'line-through',
//                         },
//                       ]}
//                     >
//                       ${price.toFixed(2)}
//                     </Text>
//                   ) : (
//                     <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//                       {price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//                 {course.saleEnabled && course.salePrice < course.price && (
//                   <View
//                     style={[
//                       styles.saleTagContainer,
//                       { backgroundColor: currentTheme.saleTagBackgroundColor },
//                     ]}
//                   >
//                     <View
//                       style={[
//                         styles.saleTagHole,
//                         {
//                           backgroundColor: currentTheme.saleTagBackgroundColor,
//                           borderColor: currentTheme.borderColor,
//                         },
//                       ]}
//                     />
//                     <Text style={[styles.saleTagPrice, { color: currentTheme.buttonTextColor }]}>
//                       ${course.salePrice.toFixed(2)}
//                     </Text>
//                     {discountPercentage > 0 && (
//                       <Text style={[styles.saleTagDiscount, { color: currentTheme.buttonTextColor }]}>
//                         {discountPercentage}% OFF
//                       </Text>
//                     )}
//                   </View>
//                 )}
//               </View>
//               <TouchableOpacity
//                 style={[styles.footerEnrollButton, { backgroundColor: currentTheme.primaryColor }]}
//                 onPress={handlePurchase}
//                 disabled={buttonLoading}
//               >
//                 {buttonLoading ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={[styles.footerEnrollText, { color: currentTheme.buttonTextColor }]}>
//                     {price === 0 ? 'Enroll Now' : 'Buy Now'}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Additional Ads */}
//           <View style={[styles.adsWrapper, { borderBottomColor: currentTheme.borderColor }]} />
//           <Text
//             style={[
//               styles.adsTitle,
//               { color: currentTheme.textColor, marginBottom: -40 },
//             ]}
//           >
//             Try our New Sale
//           </Text>
//           <AdsSection
//             currentTheme={currentTheme}
//             onAdPress={handleAdPress}
//             refreshSignal={0}
//             templateFilter="sale"
//             marginV={25}
//           />
//         </View>
//       </ScrollView>

//       {/* Custom Alert */}
//       <Portal>
//         <CustomAlert
//           visible={customAlertVisible}
//           title={customAlertTitle}
//           message={customAlertMessage}
//           icon={customAlertIcon}
//           buttons={
//             customAlertButtons.length
//               ? customAlertButtons
//               : [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
//           }
//           onClose={() => setCustomAlertVisible(false)}
//         />
//       </Portal> 
//     </View>
//   );
// };

// export default PurchaseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   errorText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   backButton: {
//     position: 'absolute',
//     left: 10,
//     paddingTop: Platform.OS === 'ios' ? 15 : 0,
//   },
//   retryButton: {
//     marginTop: 20,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     fontSize: 16,
//   },
//   scrollContainer: {
//     paddingBottom: 140,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 15,
//   },
//   headerBackButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     textAlign: 'center',
//   },
//   mainContent: {
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   adsWrapper: {
//     width: '100%',
//     marginVertical: 10,
//     borderBottomWidth: 1,
//   },
//   adsTitle: {
//     fontSize: 25,
//     fontWeight: '900',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   cardContainer: {
//     width: '96%',
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 8,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     marginBottom: 20,
//   },
//   courseImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   courseTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   coursePrice: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   courseDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   receiptCard: {
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   receiptTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   receiptRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   receiptLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 0.4,
//   },
//   receiptValue: {
//     fontSize: 14,
//     flex: 0.6,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     marginTop: 20,
//     width: '100%',
//   },
//   priceSection: {
//     position: 'relative',
//     marginRight: 15,
//     justifyContent: 'center',
//   },
//   footerPriceButton: {
//     width: 70,
//     height: 50,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerPriceText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   saleTagContainer: {
//     position: 'absolute',
//     top: -40,
//     right: -40,
//     borderRadius: 10,
//     paddingVertical: 6,
//     paddingHorizontal: Platform.OS === 'ios' ? 8 : 10,
//     minWidth: 70,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowOffset: { width: 1, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3,
//     elevation: 4,
//     zIndex: 10,
//     transform: [{ rotate: '-45deg' }],
//   },
//   saleTagHole: {
//     position: 'absolute',
//     left: -8,
//     top: '50%',
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     borderWidth: 2,
//     transform: [{ translateY: -8 }],
//   },
//   saleTagPrice: {
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   saleTagDiscount: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   footerEnrollButton: {
//     flex: 1,
//     height: 50,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerEnrollText: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });










// // src/screens/PurchaseScreen.js
// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   SafeAreaView,
//   Image,
//   Alert,
//   ScrollView,
//   RefreshControl,
//   StatusBar,
//   Platform,
//   useWindowDimensions,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useStripe } from '@stripe/stripe-react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import AdsSection from '../components/AdsSection';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Redux imports – replace direct API calls with thunks!
// import { useDispatch } from 'react-redux';
// import { fetchCourseByIdThunk } from '../store/slices/courseSlice';
// import { fetchPaymentIntentThunk } from '../store/slices/paymentSlice';
// import { enrollInCourseThunk, fetchMyEnrollmentsThunk } from '../store/slices/enrollmentSlice';

// // A simple sub-component that displays detailed course info
// const ReceiptCard = ({ course, theme }) => (
//   <View
//     style={[
//       styles.receiptCard,
//       {
//         backgroundColor: theme.backgroundColor,
//         borderColor: theme.borderColor,
//       },
//     ]}
//   >
//     <Text style={[styles.receiptTitle, { color: theme.textColor }]}>
//       {course.title}
//     </Text>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Instructor:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.instructor}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Category:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.category}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Price:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         ${course.price}
//       </Text>
//     </View>

//     {course.saleEnabled && course.salePrice < course.price && (
//       <View style={styles.receiptRow}>
//         <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//           Sale Price:
//         </Text>
//         <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//           ${course.salePrice}
//         </Text>
//       </View>
//     )}

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Rating:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.rating}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Difficulty:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.difficultyLevel}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Language:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.language}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Lectures:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.numberOfLectures}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Duration:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.totalDuration} hrs
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Description:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>
//         {course.description}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Requirements:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>
//         {course.requirements.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Topics:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>
//         {course.topics.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         What You'll Learn:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>
//         {course.whatYouWillLearn.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Created At:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {new Date(course.createdAt).toLocaleDateString()}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Updated At:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {new Date(course.updatedAt).toLocaleDateString()}
//       </Text>
//     </View>
//   </View>
// );

// const PurchaseScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const insets = useSafeAreaInsets();
//   const { width } = useWindowDimensions();

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [buttonloading, setButtonLoading] = useState(false);
//   const [purchaseInProgress, setPurchaseInProgress] = useState(false);
//   const [error, setError] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const { initPaymentSheet, presentPaymentSheet } = useStripe();
//   const dispatch = useDispatch();

//   // Load course details via Redux thunk
//   const loadCourse = useCallback(async () => {
//     try {
//       setLoading(true);
//       const result = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
//       if (result.success && result.data) {
//         setCourse(result.data);
//         setError(null);
//       } else {
//         setError(result.message);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [courseId, dispatch]);

//   useEffect(() => {
//     loadCourse();
//   }, [loadCourse]);

//   // Check enrollment status via Redux thunk
//   const checkEnrollmentStatus = useCallback(async () => {
//     if (course) {
//       try {
//         const enrollResult = await dispatch(fetchMyEnrollmentsThunk()).unwrap();
//         if (enrollResult.enrollments) {
//           const alreadyEnrolled = enrollResult.enrollments.some(
//             (enrollment) =>
//               enrollment.course &&
//               enrollment.course._id.toString() === courseId
//           );
//           setIsEnrolled(alreadyEnrolled);
//         }
//       } catch (err) {
//         console.error('Enrollment check error:', err);
//       }
//     }
//   }, [course, courseId, dispatch]);

//   useEffect(() => {
//     checkEnrollmentStatus();
//   }, [course, checkEnrollmentStatus]);

//   // Determine final price based on sale conditions
//   const finalPrice =
//     course && course.saleEnabled && course.salePrice < course.price
//       ? course.salePrice
//       : course && course.price;

//   // Calculate discount percentage if applicable
//   let discountPercentage = 0;
//   if (course && course.saleEnabled && course.price > 0 && course.salePrice < course.price) {
//     discountPercentage = Math.round(((course.price - course.salePrice) / course.price) * 100);
//   }

//   // Handle purchase action
//   const handlePurchase = async () => {
//     if (isEnrolled) {
//       Alert.alert('Already Enrolled', 'You are already enrolled in this course.');
//       return;
//     }

//     setButtonLoading(true);

//     // For free courses, enroll directly
//     if (finalPrice === 0) {
//       try {
//         setPurchaseInProgress(true);
//         const enrollResult = await dispatch(enrollInCourseThunk(courseId)).unwrap();
//         if (enrollResult) {
//           Alert.alert(
//             'Enrollment Successful',
//             'You have been enrolled in this course!',
//             [{ text: 'OK', onPress: () => navigation.goBack() }]
//           );
//         } else {
//           Alert.alert('Enrollment Failed', 'Something went wrong.');
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message);
//       } finally {
//         setPurchaseInProgress(false);
//         setButtonLoading(false);
//       }
//       return;
//     }

//     // For paid courses, process payment with Stripe
//     try {
//       setPurchaseInProgress(true);
//       const clientSecret = await dispatch(fetchPaymentIntentThunk(finalPrice)).unwrap();
//       if (!clientSecret) {
//         Alert.alert('Error', 'Could not initiate payment.');
//         setButtonLoading(false);
//         return;
//       }

//       const { error: initError } = await initPaymentSheet({
//         paymentIntentClientSecret: clientSecret,
//         merchantDisplayName: 'Your App Name',
//       });
//       if (initError) {
//         Alert.alert('Payment Error', initError.message);
//         setButtonLoading(false);
//         return;
//       }

//       const { error: paymentError } = await presentPaymentSheet();
//       if (paymentError) {
//         Alert.alert('Payment Failed', paymentError.message);
//         setButtonLoading(false);
//         return;
//       }

//       // Payment successful – enroll via Redux thunk
//       const enrollResult = await dispatch(enrollInCourseThunk(courseId)).unwrap();
//       if (enrollResult) {
//         Alert.alert(
//           'Enrollment Successful',
//           'You have been enrolled in this course!',
//           [{ text: 'OK', onPress: () => navigation.goBack() }]
//         );
//       } else {
//         Alert.alert('Enrollment Failed', enrollResult.message);
//       }
//     } catch (error) {
//       Alert.alert('Checkout Failed', error.message || 'An error occurred during checkout.');
//     }
//     setPurchaseInProgress(false);
//     setButtonLoading(false);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadCourse();
//     setRefreshing(false);
//   };

//   const handleAdPress = useCallback(
//     (ad) => {
//       if (ad.adProdtype === 'Course') {
//         navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//       } else {
//         navigation.navigate('ProductPage', { productId: ad.adProdId });
//       }
//     },
//     [navigation]
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading course...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !course) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
//             {error || 'Course not found.'}
//           </Text>
//           <TouchableOpacity
//             style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={loadCourse}
//           >
//             <Text style={[styles.retryButtonText, { color: currentTheme.buttonTextColor }]}>
//               Retry
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const { title, price, description, image } = course;

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
//         <TouchableOpacity
//           style={styles.headerBackButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons
//             name="arrow-back"
//             size={24}
//             color={currentTheme.headerTextColor}
//             style={styles.backButton}
//           />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Purchase Course
//         </Text>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         <View style={styles.mainContent}>
//           {/* Ads Section */}
//           <View style={[styles.adsWrapper, { borderBottomColor: currentTheme.borderColor }]}>
//             <Text style={[styles.adsTitle, { color: currentTheme.textColor }]}>
//               Get More Excited Course
//             </Text>
//             <AdsSection
//               currentTheme={currentTheme}
//               onAdPress={handleAdPress}
//               refreshSignal={0}
//               templateFilter="newCourse"
//               marginV={25}
//             />
//           </View>

//           {/* Course Card */}
//           <View
//             style={[
//               styles.cardContainer,
//               {
//                 backgroundColor: currentTheme.cardBackground,
//                 shadowColor: currentTheme.textShadowColor,
//                 width: width * 0.96,
//               },
//             ]}
//           >
//             {image && (
//               <Image
//                 source={{ uri: image }}
//                 style={styles.courseImage}
//                 resizeMode="cover"
//               />
//             )}
//             <Text style={[styles.courseTitle, { color: currentTheme.textColor }]}>
//               {title}
//             </Text>
//             {price > 0 && (
//               course.saleEnabled && course.salePrice < price ? (
//                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                   <Text style={[styles.coursePrice, { color: currentTheme.textColor, textDecorationLine: 'line-through', left: 35 }]}>
//                     ${price.toFixed(2)}
//                   </Text>
//                   <Text style={[styles.coursePrice, { color: currentTheme.errorTextColor, marginLeft: 8, transform: [{ rotate: '30deg' }],left: 35, fontWeight: 'bold',fontSize: 24 }]}>
//                     ${course.salePrice.toFixed(2)}
//                   </Text>
//                 </View>
//               ) : (
//                 <Text style={[styles.coursePrice, { color: currentTheme.primaryColor }]}>
//                   ${price.toFixed(2)}
//                 </Text>
//               )
//             )}

//             {description && (
//               <Text style={[styles.courseDescription, { color: currentTheme.textColor }]}>
//                 {description}
//               </Text>
//             )}

//             {/* Full Course Details */}
//             <ReceiptCard course={course} theme={currentTheme} />

//             {/* Price and Sale Tag Section */}
//             <View style={styles.buttonContainer}>
//               <View style={styles.priceSection}>
//                 <TouchableOpacity
//                   style={[
//                     styles.footerPriceButton,
//                     {
//                       borderColor: currentTheme.borderColor,
//                       backgroundColor: currentTheme.backgroundColor,
//                     },
//                   ]}
//                   disabled
//                 >
//                   {course.saleEnabled && course.salePrice < course.price ? (
//                     <Text
//                       style={[
//                         styles.footerPriceText,
//                         {
//                           color: currentTheme.textColor,
//                           textDecorationLine: 'line-through',
//                         },
//                       ]}
//                     >
//                       ${price.toFixed(2)}
//                     </Text>
//                   ) : (
//                     <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//                       {price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//                     </Text>
//                   )}
//                 </TouchableOpacity>
//                 {course.saleEnabled && course.salePrice < course.price && (
//                   <View
//                     style={[
//                       styles.saleTagContainer,
//                       { backgroundColor: currentTheme.saleTagBackgroundColor },
//                     ]}
//                   >
//                     <View
//                       style={[
//                         styles.saleTagHole,
//                         {
//                           backgroundColor: currentTheme.saleTagBackgroundColor,
//                           borderColor: currentTheme.borderColor,
//                         },
//                       ]}
//                     />
//                     <Text style={[styles.saleTagPrice, { color: currentTheme.buttonTextColor }]}>
//                       ${course.salePrice.toFixed(2)}
//                     </Text>
//                     {discountPercentage > 0 && (
//                       <Text style={[styles.saleTagDiscount, { color: currentTheme.buttonTextColor }]}>
//                         {discountPercentage}% OFF
//                       </Text>
//                     )}
//                   </View>
//                 )}
//               </View>
//               {/* <TouchableOpacity
//                 style={[styles.footerEnrollButton, { backgroundColor: currentTheme.primaryColor }]}
//                 onPress={handlePurchase}
//                 disabled={purchaseInProgress}
//               >
//                 {purchaseInProgress ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={[styles.footerEnrollText, { color: currentTheme.buttonTextColor }]}>
//                     {price === 0 ? 'Enroll Now' : 'Buy Now'}
//                   </Text>
//                 )}
//               </TouchableOpacity> */}
//               <TouchableOpacity
//                 style={[styles.footerEnrollButton, { backgroundColor: currentTheme.primaryColor }]}
//                 onPress={handlePurchase}
//                 disabled={buttonloading}
//               >
//                 {buttonloading ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={[styles.footerEnrollText, { color: currentTheme.buttonTextColor }]}>
//                     {price === 0 ? 'Enroll Now' : 'Buy Now'}
//                   </Text>
//                 )}
//               </TouchableOpacity>

//             </View>
//           </View>

//           {/* Additional Ads */}
//           <View style={[styles.adsWrapper, { borderBottomColor: currentTheme.borderColor }]} />
//           <Text
//             style={[
//               styles.adsTitle,
//               { color: currentTheme.textColor, marginBottom: -40 },
//             ]}
//           >
//             Try our New Sale
//           </Text>
//           <AdsSection
//             currentTheme={currentTheme}
//             onAdPress={handleAdPress}
//             refreshSignal={0}
//             templateFilter="sale"
//             marginV={25}
//           />
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default PurchaseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   errorText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   backButton: {
//     position: 'absolute',
//     left: 10,
//     paddingTop: Platform.OS === 'ios' ? 15 : 0,
//   },
//   retryButton: {
//     marginTop: 20,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     fontSize: 16,
//   },
//   scrollContainer: {
//     paddingBottom: 140,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 15,
//   },
//   headerBackButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     textAlign: 'center',
//   },
//   mainContent: {
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   adsWrapper: {
//     width: '100%',
//     marginVertical: 10,
//     borderBottomWidth: 1,
//   },
//   adsTitle: {
//     fontSize: 25,
//     fontWeight: '900',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   cardContainer: {
//     width: '96%',
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 8,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     marginBottom: 20,
//   },
//   courseImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   courseTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   coursePrice: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   courseDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   receiptCard: {
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   receiptTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   receiptRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   receiptLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 0.4,
//   },
//   receiptValue: {
//     fontSize: 14,
//     flex: 0.6,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     marginTop: 20,
//     width: '100%',
//   },
//   priceSection: {
//     position: 'relative',
//     marginRight: 15,
//     justifyContent: 'center',
//   },
//   footerPriceButton: {
//     width: 70,
//     height: 50,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerPriceText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   saleTagContainer: {
//     position: 'absolute',
//     top: -40,
//     right: -40,
//     borderRadius: 10,
//     paddingVertical: 6,
//     paddingHorizontal: Platform.OS === 'ios' ? 8 : 10,
//     minWidth: 70,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowOffset: { width: 1, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3,
//     elevation: 4,
//     zIndex: 10,
//     transform: [{ rotate: '-45deg' }],
//   },
//   saleTagHole: {
//     position: 'absolute',
//     left: -8,
//     top: '50%',
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     borderWidth: 2,
//     transform: [{ translateY: -8 }],
//   },
//   saleTagPrice: {
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   saleTagDiscount: {
//     fontSize: 12,
//     fontWeight: '600',
//     marginTop: 2,
//   },
//   footerEnrollButton: {
//     flex: 1,
//     height: 50,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerEnrollText: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });












// // src/screens/PurchaseScreen.js
// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   SafeAreaView,
//   Dimensions,
//   Image,
//   Alert,
//   ScrollView,
//   RefreshControl,
//   StatusBar,
//   Platform,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useStripe } from '@stripe/stripe-react-native';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// import AdsSection from '../components/AdsSection';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Redux imports – replace direct API calls with thunks!
// import { useDispatch } from 'react-redux';
// import { fetchCourseByIdThunk } from '../store/slices/courseSlice';
// import { fetchPaymentIntentThunk } from '../store/slices/paymentSlice';
// import { enrollInCourseThunk, fetchMyEnrollmentsThunk } from '../store/slices/enrollmentSlice';

// const { width } = Dimensions.get('window');

// // A simple sub-component that displays detailed course info
// const ReceiptCard = ({ course, theme }) => (
//   <View
//     style={[
//       styles.receiptCard,
//       {
//         backgroundColor: theme.backgroundColor,
//         borderColor: theme.borderColor,
//       },
//     ]}
//   >
//     <Text style={[styles.receiptTitle, { color: theme.textColor }]}>
//       {course.title}
//     </Text>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Instructor:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.instructor}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Category:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.category}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Price:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         ${course.price}
//       </Text>
//     </View>

//     {course.saleEnabled && (
//       <View style={styles.receiptRow}>
//         <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//           Sale Price:
//         </Text>
//         <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//           ${course.salePrice}
//         </Text>
//       </View>
//     )}

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Rating:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.rating}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Difficulty:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.difficultyLevel}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Language:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.language}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Lectures:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.numberOfLectures}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Duration:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.totalDuration} hrs
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Description:
//       </Text>
//       <Text
//         style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}
//       >
//         {course.description}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Requirements:
//       </Text>
//       <Text
//         style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}
//       >
//         {course.requirements.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Topics:
//       </Text>
//       <Text
//         style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}
//       >
//         {course.topics.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         What You'll Learn:
//       </Text>
//       <Text
//         style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}
//       >
//         {course.whatYouWillLearn.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Created At:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {new Date(course.createdAt).toLocaleDateString()}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Updated At:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {new Date(course.updatedAt).toLocaleDateString()}
//       </Text>
//     </View>
//   </View>
// );

// const PurchaseScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const insets = useSafeAreaInsets();

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [purchaseInProgress, setPurchaseInProgress] = useState(false);
//   const [error, setError] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   const dispatch = useDispatch();

//   // Load course details via Redux thunk
//   const loadCourse = useCallback(async () => {
//     try {
//       setLoading(true);
//       const result = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
//       if (result.success && result.data) {
//         setCourse(result.data);
//         setError(null);
//       } else {
//         setError(result.message);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [courseId, dispatch]);

//   useEffect(() => {
//     loadCourse();
//   }, [loadCourse]);

//   // Check enrollment status via Redux thunk
//   const checkEnrollmentStatus = useCallback(async () => {
//     if (course) {
//       try {
//         const enrollResult = await dispatch(fetchMyEnrollmentsThunk()).unwrap();
//         if (enrollResult.enrollments) {
//           const alreadyEnrolled = enrollResult.enrollments.some(
//             (enrollment) =>
//               enrollment.course &&
//               enrollment.course._id.toString() === courseId
//           );
//           setIsEnrolled(alreadyEnrolled);
//         }
//       } catch (err) {
//         console.error('Enrollment check error:', err);
//       }
//     }
//   }, [course, courseId, dispatch]);

//   useEffect(() => {
//     checkEnrollmentStatus();
//   }, [course, checkEnrollmentStatus]);

//   const handlePurchase = async () => {
//     if (isEnrolled) {
//       Alert.alert('Already Enrolled', 'You are already enrolled in this course.');
//       return;
//     }

//     // For free courses, enroll directly using Redux thunk
//     if (course.price === 0) {
//       try {
//         setPurchaseInProgress(true);
//         const enrollResult = await dispatch(enrollInCourseThunk(courseId)).unwrap();
//         if (enrollResult) {
//           Alert.alert(
//             'Enrollment Successful',
//             'You have been enrolled in this course!',
//             [{ text: 'OK', onPress: () => navigation.goBack() }]
//           );
//         } else {
//           Alert.alert('Enrollment Failed', 'Something went wrong.');
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message);
//       } finally {
//         setPurchaseInProgress(false);
//       }
//       return;
//     }

//     // For paid courses, process payment with Stripe then enroll
//     try {
//       setPurchaseInProgress(true);
//       const clientSecret = await dispatch(fetchPaymentIntentThunk(course.price)).unwrap();
//       if (!clientSecret) {
//         Alert.alert('Error', 'Could not initiate payment.');
//         return;
//       }

//       const { error: initError } = await initPaymentSheet({
//         paymentIntentClientSecret: clientSecret,
//         merchantDisplayName: 'Your App Name',
//       });
//       if (initError) {
//         Alert.alert('Payment Error', initError.message);
//         return;
//       }

//       const { error: paymentError } = await presentPaymentSheet();
//       if (paymentError) {
//         Alert.alert('Payment Failed', paymentError.message);
//         return;
//       }

//       // Payment success – enroll via Redux thunk
//       const enrollResult = await dispatch(enrollInCourseThunk(courseId)).unwrap();
//       if (enrollResult) {
//         Alert.alert(
//           'Enrollment Successful',
//           'You have been enrolled in this course!',
//           [{ text: 'OK', onPress: () => navigation.goBack() }]
//         );
//       } else {
//         Alert.alert('Enrollment Failed', enrollResult.message);
//       }
//     } catch (error) {
//       Alert.alert('Checkout Failed', error.message || 'An error occurred during checkout.');
//     }
//     setPurchaseInProgress(false);
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadCourse();
//     setRefreshing(false);
//   };

//   const handleAdPress = useCallback(
//     (ad) => {
//       if (ad.adProdtype === 'Course') {
//         navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//       } else {
//         navigation.navigate('ProductPage', { productId: ad.adProdId });
//       }
//     },
//     [navigation]
//   );

//   if (loading) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading course...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !course) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
//             {error || 'Course not found.'}
//           </Text>
//           <TouchableOpacity style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]} onPress={loadCourse}>
//             <Text style={[styles.retryButtonText, { color: currentTheme.buttonTextColor }]}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const { title, price, description, image } = course;

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
//         <TouchableOpacity
//           style={styles.headerBackButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} style={styles.backButton} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Purchase Course
//         </Text>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.mainContent}>
//           {/* Ads with heading */}
//           <View style={[styles.adsWrapper,{borderBottomColor: currentTheme.borderColor}]}>
//             <Text style={[styles.adsTitle, { color: currentTheme.textColor }]}>
//               Get More Excited Course
//             </Text>
//             <AdsSection
//               currentTheme={currentTheme}
//               onAdPress={handleAdPress}
//               refreshSignal={0}
//               templateFilter="newCourse"
//               marginV={25}
//             />
//           </View>

//           {/* Course Card */}
//           <View
//             style={[
//               styles.cardContainer,
//               {
//                 backgroundColor: currentTheme.cardBackground,
//                 shadowColor: currentTheme.textShadowColor,
//               },
//             ]}
//           >
//             {image && (
//               <Image
//                 source={{ uri: image }}
//                 style={styles.courseImage}
//                 resizeMode="cover"
//               />
//             )}
//             <Text style={[styles.courseTitle, { color: currentTheme.textColor }]}>
//               {title}
//             </Text>
//             {price > 0 && (
//               <Text style={[styles.coursePrice, { color: currentTheme.primaryColor }]}>
//                 ${price.toFixed(2)}
//               </Text>
//             )}
//             {description && (
//               <Text
//                 style={[styles.courseDescription, { color: currentTheme.textColor }]}
//               >
//                 {description}
//               </Text>
//             )}

//             {/* Full Course Details Card */}
//             <ReceiptCard course={course} theme={currentTheme} />

//             {/* Purchase Buttons */}
//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[styles.footerPriceButton, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.backgroundColor }]}
//                 disabled
//               >
//                 <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//                   {price && price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[
//                   styles.footerEnrollButton,
//                   { backgroundColor: currentTheme.primaryColor },
//                 ]}
//                 onPress={handlePurchase}
//                 disabled={purchaseInProgress}
//               >
//                 {purchaseInProgress ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={[styles.footerEnrollText, { color: currentTheme.buttonTextColor }]}>
//                     {price === 0 ? 'Enroll Now' : 'Buy Now'}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Additional Ads */}
//           <View style={[styles.adsWrapper,{borderBottomColor: currentTheme.borderColor}]} />
//           <Text
//             style={[
//               styles.adsTitle,
//               { color: currentTheme.textColor, marginBottom: -40 },
//             ]}
//           >
//             Try our New Sale
//           </Text>
//           <AdsSection
//             currentTheme={currentTheme}
//             onAdPress={handleAdPress}
//             refreshSignal={0}
//             templateFilter="sale"
//             marginV={25}
//           />
//         </View>
//       </ScrollView>
//     </View>
//   );
// };

// export default PurchaseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   errorText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },

//   backButton: {
//     position: 'absolute',
//     left: 10,
//     paddingTop: Platform.OS === 'ios' ? 15 : 0,
//     // paddingBottom: Platform.OS === 'ios' ? 0 : 50,
//     // padding: 10,
//   },
//   retryButton: {
//     marginTop: 20,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     // backgroundColor: '#007bff',
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     // color: '#fff',
//     fontSize: 16,
//   },
//   scrollContainer: {
//     paddingBottom: 140,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 20,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 15,
//   },
//   headerBackButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '800',
//     textAlign: 'center',
//   },
//   mainContent: {
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   adsWrapper: {
//     width: '100%',
//     marginVertical: 10,
//     borderBottomWidth: 1,
//     // borderBottomColor: '#ccc',
//   },
//   adsTitle: {
//     fontSize: 25,
//     fontWeight: '900',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   cardContainer: {
//     width: width * 0.96,
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 8,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     marginBottom: 20,
//   },
//   courseImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   courseTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   coursePrice: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   courseDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   receiptCard: {
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   receiptTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   receiptRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   receiptLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 0.4,
//   },
//   receiptValue: {
//     fontSize: 14,
//     flex: 0.6,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     marginTop: 20,
//     width: '100%',
//   },
//   footerPriceButton: {
//     width: 70,
//     height: 50,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     // backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   footerPriceText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   footerEnrollButton: {
//     flex: 1,
//     height: 50,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerEnrollText: {
//     // color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });









// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   StyleSheet,
//   SafeAreaView,
//   Dimensions,
//   Image,
//   Alert,
//   ScrollView,
//   RefreshControl,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useStripe } from '@stripe/stripe-react-native';

// import {
//   fetchCourseById,
//   fetchPaymentIntent,
//   enrollInCourseAPI,
//   getMyEnrollmentsAPI,
// } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import AdsSection from '../components/AdsSection';

// // Get window width for layout
// const { width } = Dimensions.get('window');

// // A simple sub-component that displays detailed course info
// const ReceiptCard = ({ course, theme }) => (
//   <View
//     style={[
//       styles.receiptCard,
//       {
//         backgroundColor: theme.cardBackground,
//         borderColor: theme.primaryColor,
//       },
//     ]}
//   >
//     <Text style={[styles.receiptTitle, { color: theme.textColor }]}>
//       {course.title}
//     </Text>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Instructor:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.instructor}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Category:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.category}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Price:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         ${course.price}
//       </Text>
//     </View>

//     {course.saleEnabled && (
//       <View style={styles.receiptRow}>
//         <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//           Sale Price:
//         </Text>
//         <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//           ${course.salePrice}
//         </Text>
//       </View>
//     )}

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Rating:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.rating}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Difficulty:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.difficultyLevel}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Language:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.language}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Lectures:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.numberOfLectures}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Duration:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {course.totalDuration} hrs
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Description:
//       </Text>
//       <Text
//         style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}
//       >
//         {course.description}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Requirements:
//       </Text>
//       <Text
//         style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}
//       >
//         {course.requirements.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Topics:
//       </Text>
//       <Text
//         style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}
//       >
//         {course.topics.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         What You'll Learn:
//       </Text>
//       <Text
//         style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}
//       >
//         {course.whatYouWillLearn.join(', ')}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Created At:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {new Date(course.createdAt).toLocaleDateString()}
//       </Text>
//     </View>

//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>
//         Updated At:
//       </Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>
//         {new Date(course.updatedAt).toLocaleDateString()}
//       </Text>
//     </View>
//   </View>
// );

// const PurchaseScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [purchaseInProgress, setPurchaseInProgress] = useState(false);
//   const [error, setError] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   // Fetch course data
//   const loadCourse = useCallback(async () => {
//     try {
//       setLoading(true);
//       const result = await fetchCourseById(courseId);
//       if (result.success) {
//         setCourse(result.data);
//         setError(null);
//       } else {
//         setError(result.message);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [courseId]);

//   // On mount, load course
//   useEffect(() => {
//     loadCourse();
//   }, [loadCourse]);

//   // Check if user is already enrolled
//   const checkEnrollmentStatus = useCallback(async () => {
//     if (course) {
//       try {
//         const enrollmentsResult = await getMyEnrollmentsAPI();
//         if (enrollmentsResult.success && enrollmentsResult.data.enrollments) {
//           const alreadyEnrolled = enrollmentsResult.data.enrollments.some(
//             (enrollment) =>
//               enrollment.course &&
//               enrollment.course._id.toString() === courseId
//           );
//           setIsEnrolled(alreadyEnrolled);
//         }
//       } catch (err) {
//         console.error('Enrollment check error:', err);
//       }
//     }
//   }, [course, courseId]);

//   useEffect(() => {
//     checkEnrollmentStatus();
//   }, [course, checkEnrollmentStatus]);

//   // Purchase or Enroll logic
//   const handlePurchase = async () => {
//     if (isEnrolled) {
//       Alert.alert('Already Enrolled', 'You are already enrolled in this course.');
//       return;
//     }

//     // Free course => enroll directly
//     if (course.price === 0) {
//       try {
//         setPurchaseInProgress(true);
//         const enrollResult = await enrollInCourseAPI(courseId);
//         if (enrollResult.success) {
//           Alert.alert(
//             'Enrollment Successful',
//             'You have been enrolled in this course!',
//             [{ text: 'OK', onPress: () => navigation.goBack() }]
//           );
//         } else {
//           Alert.alert('Enrollment Failed', enrollResult.message);
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message);
//       } finally {
//         setPurchaseInProgress(false);
//       }
//       return;
//     }

//     // Paid course => Payment with Stripe
//     try {
//       setPurchaseInProgress(true);
//       // 1. Get Payment Intent
//       const clientSecret = await fetchPaymentIntent(course.price);
//       if (!clientSecret) {
//         Alert.alert('Error', 'Could not initiate payment.');
//         return;
//       }

//       // 2. Init PaymentSheet
//       const { error: initError } = await initPaymentSheet({
//         paymentIntentClientSecret: clientSecret,
//         merchantDisplayName: 'Your App Name',
//       });
//       if (initError) {
//         Alert.alert('Payment Error', initError.message);
//         return;
//       }

//       // 3. Present PaymentSheet
//       const { error: paymentError } = await presentPaymentSheet();
//       if (paymentError) {
//         Alert.alert('Payment Failed', paymentError.message);
//         return;
//       }

//       // 4. If success, enroll user
//       const enrollResult = await enrollInCourseAPI(courseId);
//       if (enrollResult.success) {
//         Alert.alert(
//           'Enrollment Successful',
//           'You have been enrolled in this course!',
//           [{ text: 'OK', onPress: () => navigation.goBack() }]
//         );
//       } else {
//         Alert.alert('Enrollment Failed', enrollResult.message);
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     } finally {
//       setPurchaseInProgress(false);
//     }
//   };

//   // Pull-to-refresh
//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadCourse();
//     setRefreshing(false);
//   };

//   // Ads press
//   const handleAdPress = useCallback(
//     (ad) => {
//       if (ad.adProdtype === 'Course') {
//         navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//       } else {
//         navigation.navigate('ProductPage', { productId: ad.adProdId });
//       }
//     },
//     [navigation]
//   );

//   // Loading State
//   if (loading) {
//     return (
//       <SafeAreaView
//         style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}
//       >
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading course...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   // Error State or missing course
//   if (error || !course) {
//     return (
//       <SafeAreaView
//         style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}
//       >
//         <View style={styles.centerContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
//             {error || 'Course not found.'}
//           </Text>
//           <TouchableOpacity style={styles.retryButton} onPress={loadCourse}>
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const { title, price, description, image } = course;

//   return (
//     <SafeAreaView
//       style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}
//     >
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//       >
//         <TouchableOpacity
//           style={styles.headerBackButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Purchase Course
//         </Text>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
//         }
//       >
//         <View style={styles.mainContent}>
//           {/* Ads with heading */}
//           <View style={styles.adsWrapper}>
//             <Text style={[styles.adsTitle, { color: currentTheme.textColor }]}>
//               Get More Excited Course
//             </Text>
//             <AdsSection
//               currentTheme={currentTheme}
//               onAdPress={handleAdPress}
//               refreshSignal={0}
//               templateFilter="newCourse"
//             />
//           </View>

//           {/* Course Card */}
//           <View
//             style={[
//               styles.cardContainer,
//               {
//                 backgroundColor: currentTheme.cardBackground,
//                 shadowColor: currentTheme.shadowColor,
//               },
//             ]}
//           >
//             {image && (
//               <Image
//                 source={{ uri: image }}
//                 style={styles.courseImage}
//                 resizeMode="cover"
//               />
//             )}
//             <Text style={[styles.courseTitle, { color: currentTheme.textColor }]}>
//               {title}
//             </Text>
//             {price > 0 && (
//               <Text style={[styles.coursePrice, { color: currentTheme.primaryColor }]}>
//                 ${price.toFixed(2)}
//               </Text>
//             )}
//             {description && (
//               <Text
//                 style={[styles.courseDescription, { color: currentTheme.textColor }]}
//               >
//                 {description}
//               </Text>
//             )}

//             {/* Full Course Details Card */}
//             <ReceiptCard course={course} theme={currentTheme} />

//             {/* Purchase Buttons */}
//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[styles.footerPriceButton, { borderColor: currentTheme.primaryColor }]}
//                 disabled
//               >
//                 <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//                   {price && price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[
//                   styles.footerEnrollButton,
//                   { backgroundColor: currentTheme.primaryColor },
//                 ]}
//                 onPress={handlePurchase}
//                 disabled={purchaseInProgress}
//               >
//                 {purchaseInProgress ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={styles.footerEnrollText}>
//                     {price === 0 ? 'Enroll Now' : 'Buy Now'}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>

//           {/* Additional Ads */}
//           <View style={styles.adsWrapper} />
//           <Text
//             style={[
//               styles.adsTitle,
//               { color: currentTheme.textColor, marginBottom: -40 },
//             ]}
//           >
//             Try our New Sale
//           </Text>
//           <AdsSection
//             currentTheme={currentTheme}
//             onAdPress={handleAdPress}
//             refreshSignal={0}
//             templateFilter="sale"
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default PurchaseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   errorText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   retryButton: {
//     marginTop: 20,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     backgroundColor: '#007bff',
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: '#fff',
//     fontSize: 16,
//   },
//   scrollContainer: {
//     paddingBottom: 140,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 15,
//   },
//   headerBackButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   mainContent: {
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   adsWrapper: {
//     width: '100%',
//     marginVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   adsTitle: {
//     fontSize: 25,
//     fontWeight: '900',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   cardContainer: {
//     width: width * 0.96,
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 8,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     marginBottom: 20,
//   },
//   courseImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   courseTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   coursePrice: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   courseDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//     textAlign: 'center',
//     marginBottom: 20,
//   },

//   // ReceiptCard styling
//   receiptCard: {
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   receiptTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   receiptRow: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   receiptLabel: {
//     fontSize: 14,
//     fontWeight: '600',
//     flex: 0.4,
//   },
//   receiptValue: {
//     fontSize: 14,
//     flex: 0.6,
//   },

//   // Footer Buttons
//   buttonContainer: {
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     marginTop: 20,
//     width: '100%',
//   },
//   footerPriceButton: {
//     width: 70,
//     height: 50,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   footerPriceText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   footerEnrollButton: {
//     flex: 1,
//     height: 50,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerEnrollText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });












// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   ActivityIndicator, 
//   StyleSheet, 
//   SafeAreaView, 
//   Dimensions,
//   Image,
//   Alert,
//   ScrollView,
//   RefreshControl,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useStripe } from '@stripe/stripe-react-native';

// import { fetchCourseById, fetchPaymentIntent, enrollInCourseAPI, getMyEnrollmentsAPI } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import AdsSection from '../components/AdsSection';

// const { width } = Dimensions.get('window');

// // ReceiptCard displays full course details in a professional "receipt" style.
// const ReceiptCard = ({ course, theme }) => (
//   <View style={[styles.receiptCard, { backgroundColor: theme.cardBackground, borderColor: theme.primaryColor }]}>
//     <Text style={[styles.receiptTitle, { color: theme.textColor }]}>{course.title}</Text>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Instructor:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{course.instructor}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Category:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{course.category}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Price:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>${course.price}</Text>
//     </View>
//     {course.saleEnabled && (
//       <View style={styles.receiptRow}>
//         <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Sale Price:</Text>
//         <Text style={[styles.receiptValue, { color: theme.textColor }]}>${course.salePrice}</Text>
//       </View>
//     )}
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Rating:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{course.rating}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Difficulty:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{course.difficultyLevel}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Language:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{course.language}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Lectures:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{course.numberOfLectures}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Duration:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{course.totalDuration} hrs</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Description:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>{course.description}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Requirements:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>{course.requirements.join(', ')}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Topics:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>{course.topics.join(', ')}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>What You'll Learn:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor, flex: 1 }]}>{course.whatYouWillLearn.join(', ')}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Created At:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{new Date(course.createdAt).toLocaleDateString()}</Text>
//     </View>
//     <View style={styles.receiptRow}>
//       <Text style={[styles.receiptLabel, { color: theme.textColor }]}>Updated At:</Text>
//       <Text style={[styles.receiptValue, { color: theme.textColor }]}>{new Date(course.updatedAt).toLocaleDateString()}</Text>
//     </View>
//   </View>
// );

// const PurchaseScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [purchaseInProgress, setPurchaseInProgress] = useState(false);
//   const [error, setError] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   const loadCourse = useCallback(async () => {
//     try {
//       setLoading(true);
//       const result = await fetchCourseById(courseId);
//       if (result.success) {
//         console.log('Fetched course:', result.data);
//         setCourse(result.data);
//         setError(null);
//       } else {
//         setError(result.message);
//       }
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [courseId]);

//   useEffect(() => {
//     loadCourse();
//   }, [loadCourse]);

//   const checkEnrollmentStatus = useCallback(async () => {
//     if (course) {
//       try {
//         const enrollmentsResult = await getMyEnrollmentsAPI();
//         if (enrollmentsResult.success && enrollmentsResult.data.enrollments) {
//           const alreadyEnrolled = enrollmentsResult.data.enrollments.some(
//             enrollment =>
//               enrollment.course &&
//               enrollment.course._id.toString() === courseId
//           );
//           setIsEnrolled(alreadyEnrolled);
//         }
//       } catch (err) {
//         console.error('Enrollment check error:', err);
//       }
//     }
//   }, [course, courseId]);

//   useEffect(() => {
//     checkEnrollmentStatus();
//   }, [course, checkEnrollmentStatus]);

//   const handlePurchase = async () => {
//     if (isEnrolled) {
//       Alert.alert('Already Enrolled', 'You are already enrolled in this course.');
//       return;
//     }
    
//     // If the course is free, enroll directly
//     if (course.price === 0) {
//       try {
//         setPurchaseInProgress(true);
//         const enrollResult = await enrollInCourseAPI(courseId);
//         if (enrollResult.success) {
//           Alert.alert('Enrollment Successful', 'You have been enrolled in this course!', [
//             { text: 'OK', onPress: () => navigation.goBack() },
//           ]);
//         } else {
//           Alert.alert('Enrollment Failed', enrollResult.message);
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message);
//       } finally {
//         setPurchaseInProgress(false);
//       }
//       return;
//     }

//     try {
//       setPurchaseInProgress(true);
//       const clientSecret = await fetchPaymentIntent(course.price);
//       if (!clientSecret) {
//         Alert.alert('Error', 'Could not initiate payment.');
//         return;
//       }
//       const { error: initError } = await initPaymentSheet({
//         paymentIntentClientSecret: clientSecret,
//         merchantDisplayName: 'Your App Name',
//       });
//       if (initError) {
//         Alert.alert('Payment Error', initError.message);
//         return;
//       }
//       const { error: paymentError } = await presentPaymentSheet();
//       if (paymentError) {
//         Alert.alert('Payment Failed', paymentError.message);
//         return;
//       }
//       const enrollResult = await enrollInCourseAPI(courseId);
//       if (enrollResult.success) {
//         Alert.alert('Enrollment Successful', 'You have been enrolled in this course!', [
//           { text: 'OK', onPress: () => navigation.goBack() },
//         ]);
//       } else {
//         Alert.alert('Enrollment Failed', enrollResult.message);
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message);
//     } finally {
//       setPurchaseInProgress(false);
//     }
//   };

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadCourse();
//     setRefreshing(false);
//   };

//   const handleAdPress = useCallback((ad) => {  
//     if (ad.adProdtype === 'Course') {
//       navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//     } else {
//       navigation.navigate('ProductPage', { productId: ad.adProdId });
//     }
//   }, [navigation]);

//   if (loading) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading course...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !course) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
//             {error || 'Course not found.'}
//           </Text>
//           <TouchableOpacity style={styles.retryButton} onPress={loadCourse}>
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const { title, price, description, image } = course;

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       {/* Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//       >
//         <TouchableOpacity
//           style={styles.headerBackButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Purchase Course
//         </Text>
//       </LinearGradient>

//       <ScrollView 
//         contentContainerStyle={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//         refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
//       >
//         <View style={styles.mainContent}>
//           {/* Course Card */}
//           <View style={[styles.cardContainer, { backgroundColor: currentTheme.cardBackground, shadowColor: currentTheme.shadowColor }]}>
//             <View style={styles.adsWrapper}>
//               <Text style={[styles.adsTitle, { color: currentTheme.textColor }]}>
//                 Get More Excited Course
//               </Text>
//               <AdsSection 
//                 currentTheme={currentTheme} 
//                 onAdPress={handleAdPress} 
//                 refreshSignal={0} 
//                 templateFilter='newCourse'
//               />
//             </View>
//             {image && (
//               <Image
//                 source={{ uri: image }}
//                 style={styles.courseImage}
//                 resizeMode="cover"
//               />
//             )}
//             <Text style={[styles.courseTitle, { color: currentTheme.textColor }]}>{title}</Text>
//             {price > 0 && (
//               <Text style={[styles.coursePrice, { color: currentTheme.primaryColor }]}>
//                 ${price.toFixed(2)}
//               </Text>
//             )}
//             {description && (
//               <Text style={[styles.courseDescription, { color: currentTheme.textColor }]}>
//                 {description}
//               </Text>
//             )}
//             {/* Receipt Card with full course details */}
//             <ReceiptCard course={course} theme={currentTheme} />
//             {/* Button container using the original button style */}
//             <View style={styles.buttonContainer}>
//               <TouchableOpacity
//                 style={[styles.footerPriceButton, { borderColor: currentTheme.primaryColor }]}
//                 disabled
//               >
//                 <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//                   {price && price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={[styles.footerEnrollButton, { backgroundColor: currentTheme.primaryColor }]}
//                 onPress={handlePurchase}
//                 disabled={purchaseInProgress}
//               >
//                 {purchaseInProgress ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={styles.footerEnrollText}>
//                     {price === 0 ? 'Enroll Now' : 'Buy Now'}
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>

//           <View style={styles.adsWrapper} />
//           <Text style={[styles.adsTitle, { color: currentTheme.textColor, marginBottom: -40 }]}>
//             Try our New Sale
//           </Text>
//           <AdsSection 
//             currentTheme={currentTheme} 
//             onAdPress={handleAdPress} 
//             refreshSignal={0} 
//             templateFilter='sale'
//           />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default PurchaseScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1 },
//   centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   loadingText: { marginTop: 10, fontSize: 16 },
//   errorText: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
//   retryButton: { marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#007bff', borderRadius: 8 },
//   retryButtonText: { color: '#fff', fontSize: 16 },
//   scrollContainer: { paddingBottom: 140 },
//   header: {
//     width: '100%',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 15,
//   },
//   headerBackButton: { position: 'absolute', left: 20, padding: 8 },
//   headerTitle: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
//   mainContent: { alignItems: 'center', paddingHorizontal: 20 },
//   adsWrapper: {
//     width: '100%',
//     marginVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//   },
//   cardContainer: {
//     width: width * 0.96,
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 8,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     marginBottom: 20,
//   },
//   adsTitle: { fontSize: 25, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
//   courseImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 15 },
//   courseTitle: { fontSize: 24, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
//   coursePrice: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
//   courseDescription: { fontSize: 16, lineHeight: 24, textAlign: 'center', marginBottom: 20 },
//   // ReceiptCard styles
//   receiptCard: {
//     width: '100%',
//     borderWidth: 1,
//     borderRadius: 10,
//     padding: 15,
//     marginVertical: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   receiptTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
//   receiptRow: { flexDirection: 'row', marginBottom: 8 },
//   receiptLabel: { fontSize: 14, fontWeight: '600', flex: 0.4 },
//   receiptValue: { fontSize: 14, flex: 0.6 },
//   // Button container remains inline with original button style
//   buttonContainer: { 
//     flexDirection: 'row', 
//     paddingVertical: 10, 
//     paddingHorizontal: 15, 
//     marginTop: 20, 
//     width: '100%' 
//   },
//   footerPriceButton: {
//     width: 70,
//     height: 50,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 10,
//   },
//   footerPriceText: { fontSize: 16, fontWeight: '600' },
//   footerEnrollButton: {
//     flex: 1,
//     height: 50,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerEnrollText: { color: '#fff', fontSize: 18, fontWeight: '600' },
// });






// // src/screens/PurchaseScreen.js
// import React, { useState, useEffect, useContext, useCallback } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   ActivityIndicator, 
//   StyleSheet, 
//   SafeAreaView, 
//   Dimensions,
//   Image,
//   Alert,
//   ScrollView,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useStripe } from '@stripe/stripe-react-native';

// import { fetchCourseById, fetchPaymentIntent, enrollInCourseAPI, getMyEnrollmentsAPI } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// // AdsSection Component
// import AdsSection from '../components/AdsSection';

// const { width } = Dimensions.get('window');

// const PurchaseScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [purchaseInProgress, setPurchaseInProgress] = useState(false);
//   const [error, setError] = useState(null);
//   const [isEnrolled, setIsEnrolled] = useState(false);

//   // Stripe hooks
//   const { initPaymentSheet, presentPaymentSheet } = useStripe();

//   useEffect(() => {
//     const loadCourse = async () => {
//       try {
//         setLoading(true);
//         const result = await fetchCourseById(courseId);
//         if (result.success) {
//           setCourse(result.data);
//           setError(null);
//         } else {
//           setError(result.message);
//         }
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadCourse();
//   }, [courseId]);

//   // Check if user is already enrolled in the course
//   useEffect(() => {
//     if (course) {
//       const checkEnrollmentStatus = async () => {
//         const enrollmentsResult = await getMyEnrollmentsAPI();
//         if (enrollmentsResult.success && enrollmentsResult.data.enrollments) {
//           const alreadyEnrolled = enrollmentsResult.data.enrollments.some(enrollment =>
//             enrollment.course &&
//             enrollment.course._id.toString() === courseId
//           );
//           setIsEnrolled(alreadyEnrolled);
//         }
//       };
//       checkEnrollmentStatus();
//     }
//   }, [course, courseId]);

//   const handlePurchase = async () => {
//     if (isEnrolled) {
//       Alert.alert('Already Enrolled', 'You are already enrolled in this course.');
//       return;
//     }
//     setPurchaseInProgress(true);
//     // Get Payment Intent from backend for this course's price
//     const clientSecret = await fetchPaymentIntent(course.price);
//     if (!clientSecret) {
//       Alert.alert('Error', 'Could not initiate payment.');
//       setPurchaseInProgress(false);
//       return;
//     }
//     // Initialize the Payment Sheet
//     const { error: initError } = await initPaymentSheet({
//       paymentIntentClientSecret: clientSecret,
//       merchantDisplayName: 'Your App Name',
//     });
//     if (initError) {
//       Alert.alert('Payment Error', initError.message);
//       setPurchaseInProgress(false);
//       return;
//     }
//     // Present the Payment Sheet to the user
//     const { error: paymentError } = await presentPaymentSheet();
//     if (paymentError) {
//       Alert.alert('Payment Failed', paymentError.message);
//       setPurchaseInProgress(false);
//       return;
//     }
//     // Payment succeeded, enroll the user in the course
//     const enrollResult = await enrollInCourseAPI(courseId);
//     if (enrollResult.success) {
//       Alert.alert('Enrollment Successful', 'You have been enrolled in this course!', [
//         { text: 'OK', onPress: () => navigation.goBack() },
//       ]);
//     } else {
//       Alert.alert('Enrollment Failed', enrollResult.message);
//     }
//     setPurchaseInProgress(false);
//   };

//   const handleAdPress = useCallback((ad) => {
//     // console.log('handleAdPress', ad.adProdtype);  
    
//     if (ad.adProdtype === 'Course') {
//       navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//     } else {
//       navigation.navigate('ProductPage', { productId: ad.adProdId });
//     }
    
//   }, []);

//   if (loading) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>
//             Loading course...
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (error || !course) {
//     return (
//       <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <View style={styles.centerContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
//             {error || 'Course not found.'}
//           </Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   const { title, price, description, image } = course;

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       {/* Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 0, y: 1 }}
//       >
//         <TouchableOpacity
//           style={styles.headerBackButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           Purchase Course
//         </Text>
//       </LinearGradient>

//       <ScrollView 
//         contentContainerStyle={styles.scrollContainer}
//         showsVerticalScrollIndicator={false}
//       >
//         <View style={styles.mainContent}>


//           {/* Course Card */}
//           <View style={[styles.cardContainer, { backgroundColor: currentTheme.cardBackground, shadowColor: currentTheme.shadowColor }]}>
//             <View style={styles.adsWrapper}>
//               <Text style={[styles.adsTitle, { color: currentTheme.textColor }]}>Get More Excited Course</Text>
//               <AdsSection 
//                 currentTheme={currentTheme} 
//                 onAdPress={handleAdPress} 
//                 refreshSignal={0} 
//                 templateFilter='newCourse'
//               />
//             </View>
//             {image && (
//               <Image
//                 source={{ uri: image }}
//                 style={styles.courseImage}
//                 resizeMode="cover"
//               />
//             )}
//             <Text style={[styles.courseTitle, { color: currentTheme.textColor }]}>{title}</Text>
//             {price > 0 && (
//               <Text style={[styles.coursePrice, { color: currentTheme.primaryColor }]}>
//                 ${price.toFixed(2)}
//               </Text>
//             )}
//             {description && (
//               <Text style={[styles.courseDescription, { color: currentTheme.textColor }]}>
//                 {description}
//               </Text>
//             )}
//             <TouchableOpacity
//               style={styles.purchaseButton}
//               onPress={handlePurchase}
//               disabled={purchaseInProgress}
//             >
//               <LinearGradient
//                 colors={[currentTheme.primaryColor, currentTheme.secondaryColor]}
//                 style={styles.buttonGradient}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//               >
//                 {purchaseInProgress ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <Text style={styles.buttonText}>Buy for ${price.toFixed(2)}</Text>
//                 )}
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>

//           <View style={styles.adsWrapper } />
//           <Text style={[styles.adsTitle, { color: currentTheme.textColor, marginBottom: -40 }]}>Try our New sale</Text>
//           <AdsSection 
//               currentTheme={currentTheme} 
//               onAdPress={handleAdPress} 
//               refreshSignal={0} 
//               templateFilter='sale'
//             />
//             <View />
          
//           {/* Alternate Back Button */}
//           {/* <TouchableOpacity 
//             style={styles.altBackButton} 
//             onPress={() => navigation.goBack()}
//           >
//             <Ionicons name="arrow-back" size={24} color={currentTheme.primaryColor} />
//             <Text style={[styles.altBackText, { color: currentTheme.primaryColor }]}>Back</Text>
//           </TouchableOpacity> */}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default PurchaseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   scrollContainer: {
//     paddingBottom: 30,
//   },
//   // Header styles
//   header: {
//     width: '100%',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//     marginBottom: 15,
//   },
//   headerBackButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     textAlign: 'center',
//   },
//   // Main content container
//   mainContent: {
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   // Ads wrapper
//   adsWrapper: {
//     width: '100%',
//     marginVertical: 30,
//     borderBottomWidth: 1,
//     borderBottomColor: '#ccc',
//     // paddingBottom: 20,

//   },
//   // Card container styles
//   cardContainer: {
//     width: width * 0.9,
//     borderRadius: 20,
//     padding: 20,
//     alignItems: 'center',
//     elevation: 8,
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 6,
//     marginBottom: 20,
//   },
//   adsTitle: {
//     fontSize: 25,
//     fontWeight: '900',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   // Course image styles
//   courseImage: {
//     width: '100%',
//     height: 200,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   // Course title
//   courseTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   // Price styling
//   coursePrice: {
//     fontSize: 20,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   // Description styling
//   courseDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   // Purchase button styling
//   purchaseButton: {
//     width: '100%',
//     marginBottom: 20,
//   },
//   buttonGradient: {
//     paddingVertical: 14,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   // Alternate back button styling
//   altBackButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 15,
//   },
//   altBackText: {
//     marginLeft: 8,
//     fontSize: 16,
//   },
//   // Loading and error styles
//   loadingText: {
//     marginTop: 10,
//     fontSize: 16,
//   },
//   errorText: {
//     fontSize: 16,
//   },
// });
