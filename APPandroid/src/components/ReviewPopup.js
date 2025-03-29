// src/components/ReviewPopup.js
import React, {
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Theme & Context
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { UserContext } from '../contexts/UserContext';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviews, addOrUpdateReviewThunk } from '../store/slices/reviewSlice';

// Components
import CustomAlert from './CustomAlert';

const placeholderAvatar = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const ReviewPopup = ({ closePopup, reviewableId, reviewableType }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Theme
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Window dimensions
  const { width, height } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // Styles
  const styles = useMemo(() => createStyles({ width, height, scale, currentTheme }), [
    width,
    height,
    scaleFactor,
    currentTheme,
  ]);

  // Redux store: rename reviews → allReviews for clarity; set default to []
  const { allReviews = [], loading, error } = useSelector((state) => state.reviews);

  // Local states
  const [showAddReviewForm, setShowAddReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Auth context
  const { isAuthenticated } = useContext(UserContext);

  // Fetch product reviews when mounted or if reviewable changes
  useEffect(() => {
    dispatch(fetchReviews({ reviewableId, reviewableType }));
  }, [dispatch, reviewableId, reviewableType]);

  /* ──────────────────────────────────────────────────────────
   *  Add Review Button → if not logged in, ask user to login
   * ────────────────────────────────────────────────────────── */
  const handleAddReviewClick = useCallback(() => {
    if (!isAuthenticated) {
      setAlertTitle('Authentication Required');
      setAlertMessage('You need to be logged in to add a review.');
      setAlertIcon('warning');
      setAlertButtons([
        { text: 'Cancel', onPress: () => setAlertVisible(false) },
        {
          text: 'Login',
          onPress: () => {
            setShowAddReviewForm(false);
            closePopup();
            navigation.navigate('Login');
            setAlertVisible(false);
          },
        },
      ]);
      setAlertVisible(true);
      return;
    }
    setShowAddReviewForm(true);
  }, [isAuthenticated, closePopup, navigation]);

  /* ──────────────────────────────────────────────────────────
   *  Submit the New Review
   * ────────────────────────────────────────────────────────── */
  const handleSubmitReview = useCallback(async () => {
    if (rating < 1 || rating > 5) {
      setAlertTitle('Error');
      setAlertMessage('Please provide a rating between 1 and 5.');
      setAlertIcon('alert-circle-outline');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }
    if (!comment.trim()) {
      setAlertTitle('Empty Comment');
      setAlertMessage('Please enter a comment.');
      setAlertIcon('information-circle');
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
      return;
    }

    try {
      setSubmitting(true);
      const result = await dispatch(
        addOrUpdateReviewThunk({ reviewableId, reviewableType, rating, comment })
      ).unwrap();

      if (result) {
        // Refresh reviews after submission
        dispatch(fetchReviews({ reviewableId, reviewableType }));

        // Reset form
        setRating(0);
        setComment('');
        setShowAddReviewForm(false);

        // Show success alert
        setAlertTitle('Success');
        setAlertMessage('Your review has been submitted.');
        setAlertIcon('checkmark-circle');
        setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
        setAlertVisible(true);
      } else {
        setAlertTitle('Error');
        setAlertMessage(result.message || 'Failed to submit review.');
        setAlertIcon('close-circle');
        setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
        setAlertVisible(true);
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setAlertTitle('Error');
      setAlertMessage(typeof err === 'string' ? err : err?.message || 'Failed to submit review.');
      setAlertIcon('close-circle');
      setAlertButtons([
        {
          text: 'OK',
          onPress: () => {
            setAlertVisible(false);
            setTimeout(() => {
              closePopup();
            }, 100);
          },
        },
      ]);
      setAlertVisible(true);
    } finally {
      setSubmitting(false);
    }
  }, [
    rating,
    comment,
    reviewableId,
    reviewableType,
    dispatch,
    closePopup,
  ]);

  /* ──────────────────────────────────────────────────────────
   *  Render a Single Review
   * ────────────────────────────────────────────────────────── */
  const renderReview = useCallback(
    (review) => (
      <View
        key={review._id}
        style={[styles.reviewItem, { backgroundColor: currentTheme.backgroundColor }]}
      >
        <View style={styles.reviewHeader}>
          <Image
            source={{ uri: review.user?.profileImage || placeholderAvatar }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: currentTheme.textColor }]}>
              {review.user?.name || 'Anonymous'}
            </Text>
            <View style={styles.ratingContainer}>
              {Array.from({ length: 5 }, (_, index) => (
                <Ionicons
                  key={index}
                  name={index < Math.floor(review.rating) ? 'star' : 'star-outline'}
                  size={styles.starSizeSmall}
                  color="#FFD700"
                />
              ))}
            </View>
          </View>
        </View>
        <Text style={[styles.reviewDate, { color: currentTheme.placeholderTextColor }]}>
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
        <Text style={[styles.reviewComment, { color: currentTheme.textColor }]}>
          {review.comment}
        </Text>
      </View>
    ),
    [styles, currentTheme]
  );

  /* ──────────────────────────────────────────────────────────
   *  Render the Add Review Form
   * ────────────────────────────────────────────────────────── */
  const renderAddReviewForm = useCallback(() => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.formContainer}
    >
      <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>Add a Review</Text>
      {/* Rating */}
      <View style={styles.ratingInputContainer}>
        <Text style={[styles.label, { color: currentTheme.textColor }]}>Your Rating:</Text>
        <View style={styles.starRatingContainer}>
          {Array.from({ length: 5 }, (_, index) => (
            <TouchableOpacity key={index} onPress={() => setRating(index + 1)}>
              <Ionicons
                name={index < rating ? 'star' : 'star-outline'}
                size={styles.starSizeLarge}
                color="#FFD700"
                style={styles.starIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* Comment */}
      <View style={styles.commentInputContainer}>
        <Text style={[styles.label, { color: currentTheme.textColor }]}>Your Comment:</Text>
        <TextInput
          style={[
            styles.commentInput,
            {
              borderColor: currentTheme.borderColor,
              color: currentTheme.textColor,
              backgroundColor: currentTheme.backgroundColor || '#fff',
            },
          ]}
          multiline
          numberOfLines={4}
          placeholder="Write your review here..."
          placeholderTextColor={currentTheme.placeholderTextColor}
          value={comment}
          onChangeText={setComment}
        />
      </View>
      {/* Buttons */}
      <View style={styles.formButtonsContainer}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: currentTheme.primaryColor }]}
          onPress={handleSubmitReview}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.submitButtonText, { color: currentTheme.buttonTextColor }]}>
              Submit Review
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: currentTheme.errorTextColor || '#888' }]}
          onPress={() => {
            setShowAddReviewForm(false);
            setRating(0);
            setComment('');
          }}
        >
          <Text style={[styles.cancelButtonText, { color: currentTheme.buttonTextColor }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  ), [
    rating,
    comment,
    submitting,
    styles,
    currentTheme,
    handleSubmitReview,
  ]);

  /* ──────────────────────────────────────────────────────────
   *  Main Render
   * ────────────────────────────────────────────────────────── */
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.modalBackground}>
        <View style={[styles.modalContainer, { backgroundColor: currentTheme.cardBackground }]}>
          {/* Close button (only show if not loading) */}
          {!loading && (
            <TouchableOpacity
              style={styles.topRightCloseButton}
              onPress={closePopup}
              accessibilityLabel="Close Reviews"
              accessibilityRole="button"
            >
              <Ionicons
                name="close"
                size={styles.iconSizeMedium}
                color={currentTheme.textColor}
              />
            </TouchableOpacity>
          )}

          {/* Main ScrollView for reviews & form */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color={currentTheme.primaryColor}
              style={{ flex: 1, justifyContent: 'center' }}
            />
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: currentTheme.errorColor }]}>
                {error}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {showAddReviewForm ? (
                renderAddReviewForm()
              ) : (
                <>
                  <Text style={[styles.sectionTitle, { color: currentTheme.textColor }]}>
                    Reviews
                  </Text>
                  {allReviews.length > 0 ? (
                    allReviews.map(renderReview)
                  ) : (
                    <Text style={[styles.noReviewsText, { color: currentTheme.textColor }]}>
                      No reviews yet. Be the first to share your feedback!
                    </Text>
                  )}
                </>
              )}
            </ScrollView>
          )}

          {/* Add Review button (only if not adding & no error) */}
          {!showAddReviewForm && !loading && !error && (
            <TouchableOpacity
              style={[styles.addReviewButton, { backgroundColor: currentTheme.primaryColor }]}
              onPress={handleAddReviewClick}
              accessibilityLabel="Add a Review"
              accessibilityRole="button"
            >
              <Ionicons
                name="star"
                size={styles.iconSizeSmall}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.addReviewButtonText, { color: currentTheme.buttonTextColor }]}>
                Add a Review
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Custom Alert */}
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          icon={alertIcon}
          onClose={() => setAlertVisible(false)}
          buttons={alertButtons}
        />
      </View>
    </SafeAreaView>
  );
};

/* ──────────────────────────────────────────────────────────
 *  Create Styles (scaled)
 * ────────────────────────────────────────────────────────── */
const createStyles = ({ width, height, scale, currentTheme }) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      width: width * 0.9,
      maxHeight: height * 0.9,
      borderRadius: scale(20),
      padding: scale(20),
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.25,
      shadowRadius: scale(3.84),
      elevation: scale(5),
    },
    topRightCloseButton: {
      position: 'absolute',
      top: scale(15),
      right: scale(15),
      padding: scale(8),
      borderRadius: scale(15),
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      zIndex: 1,
    },
    modalScroll: {
      marginTop: scale(15),
    },
    sectionTitle: {
      fontSize: scale(22),
      fontWeight: '700',
      marginBottom: scale(20),
      textAlign: 'center',
    },
    // Review item
    reviewItem: {
      borderRadius: scale(15),
      padding: scale(15),
      marginBottom: scale(15),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(1) },
      shadowOpacity: 0.08,
      shadowRadius: scale(2.22),
      elevation: scale(2),
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(10),
    },
    avatar: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
    },
    userInfo: {
      marginLeft: scale(15),
      flex: 1,
    },
    userName: {
      fontSize: scale(16),
      fontWeight: '600',
    },
    ratingContainer: {
      flexDirection: 'row',
      marginTop: scale(3),
    },
    reviewDate: {
      fontSize: scale(12),
      marginBottom: scale(6),
    },
    reviewComment: {
      fontSize: scale(14),
      lineHeight: scale(20),
    },
    noReviewsText: {
      fontSize: scale(16),
      textAlign: 'center',
      marginTop: scale(30),
    },
    // Buttons
    addReviewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: scale(14),
      borderRadius: scale(25),
      marginTop: scale(10),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.25,
      shadowRadius: scale(3.84),
      elevation: scale(3),
    },
    addReviewButtonText: {
      fontSize: scale(18),
      fontWeight: '600',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: scale(16),
      marginHorizontal: scale(10),
      textAlign: 'center',
    },
    // Add-review form
    formContainer: {
      paddingBottom: scale(20),
    },
    ratingInputContainer: {
      marginBottom: scale(20),
    },
    label: {
      fontSize: scale(16),
      fontWeight: '600',
      marginBottom: scale(8),
    },
    starRatingContainer: {
      flexDirection: 'row',
    },
    starIcon: {
      marginHorizontal: scale(5),
    },
    commentInputContainer: {
      marginBottom: scale(20),
    },
    commentInput: {
      height: scale(100),
      borderWidth: scale(1),
      borderRadius: scale(10),
      padding: scale(10),
      textAlignVertical: 'top',
      fontSize: scale(16),
    },
    formButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    submitButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: scale(14),
      borderRadius: scale(25),
      marginRight: scale(5),
      elevation: scale(2),
    },
    submitButtonText: {
      fontSize: scale(16),
      fontWeight: '600',
    },
    cancelButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: scale(14),
      borderRadius: scale(25),
      marginLeft: scale(5),
      elevation: scale(2),
    },
    cancelButtonText: {
      fontSize: scale(16),
      fontWeight: '600',
    },
    // Scaled Ionicon sizes
    iconSizeMedium: scale(24),
    iconSizeSmall: scale(20),
    starSizeSmall: scale(16),
    starSizeLarge: scale(32),
  });

export default memo(ReviewPopup);
