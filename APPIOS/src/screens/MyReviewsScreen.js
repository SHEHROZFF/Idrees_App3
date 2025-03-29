// src/screens/MyReviewsScreen.js

import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Redux thunks
import {
  fetchMyReviewsThunk,
  deleteReviewThunk,
  updateReviewThunk,
} from '../store/slices/reviewSlice';

// Theming & Context
import CustomAlert from '../components/CustomAlert';
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

const placeholderAvatar =
  'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

const MyReviewsScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  // Grab device width/height for dynamic scaling
  const { width, height } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // Create scaled styles
  const styles = useMemo(() => createStyles({ scale, width, height }), [scaleFactor]);

  // Theme
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // Redux store
  const { myReviews, loading, error } = useSelector((state) => state.reviews);

  // Edit popup states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);
  const [alertIcon, setAlertIcon] = useState('');

  // Pull-to-refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Animated values (for edit modal)
  const modalScale = useRef(new Animated.Value(0.7)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Show custom alert
  const showAlert = useCallback(
    (title, message, icon = '', buttons = [{ text: 'OK', onPress: () => {} }]) => {
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertIcon(icon);
      setAlertButtons(buttons);
      setAlertVisible(true);
    },
    []
  );

  // Fetch reviews on mount
  useEffect(() => {
    dispatch(fetchMyReviewsThunk());
  }, [dispatch]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchMyReviewsThunk());
    setRefreshing(false);
  }, [dispatch]);

  // Animate modal in/out
  useEffect(() => {
    if (showEditModal) {
      Animated.parallel([
        Animated.timing(modalScale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.poly(4)),
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ]).start();
    } else {
      // Reset values when closed
      modalScale.setValue(0.7);
      modalOpacity.setValue(0);
    }
  }, [showEditModal, modalScale, modalOpacity]);

  /* ----------------------------------------------
   *  Delete Review
   * --------------------------------------------*/
  const handleDelete = async (reviewId) => {
    try {
      const result = await dispatch(deleteReviewThunk(reviewId)).unwrap();
      console.log('resultin screb', result);
      

      if (!result || !result.success) {
        showAlert('Error', 'Failed to delete review.', 'warning',[{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      } else {
        // If successful, re-fetch the reviews and show success alert
        dispatch(fetchMyReviewsThunk());
        showAlert('Success', 'Review deleted successfully.', 'checkmark-circle',[{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      }
    } catch (err) {
      showAlert('Error', err?.message || 'Failed to delete review.', 'close-circle',[{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    }
  };

  /* ----------------------------------------------
   *  Open Edit Modal
   * --------------------------------------------*/
  const handleOpenEdit = (review) => {
    setEditReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setShowEditModal(true);
  };

  /* ----------------------------------------------
   *  Save Edited Review
   * --------------------------------------------*/
  const handleSaveEdit = async () => {
    if (!editReview) return;

    if (editRating < 1 || editRating > 5) {
      showAlert('Invalid Rating', 'Rating must be between 1 and 5.', 'alert-circle',[{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      return;
    }

    if (!editComment.trim()) {
      showAlert('Empty Comment', 'Please enter a comment.', 'information-circle',[{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        reviewId: editReview._id,
        rating: editRating,
        comment: editComment,
      };
      const result = await dispatch(updateReviewThunk(payload)).unwrap();

      if (!result || !result.success) {
        showAlert('Error', 'Failed to update review.', 'close-circle',[{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      } else {
        // Re-fetch to update the list
        dispatch(fetchMyReviewsThunk());
        showAlert('Success', 'Review updated successfully!', 'checkmark-circle',[{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      }
    } catch (err) {
      showAlert('Error', err?.message || 'Failed to update review.', 'close-circle',[{ text: 'OK', onPress: () => setAlertVisible(false) }]);
    } finally {
      setSubmitting(false);
      setShowEditModal(false);
    }
  };

  /* ----------------------------------------------
   *  Render Star Rating for Edit
   * --------------------------------------------*/
  const renderStarRating = () => (
    <View style={styles.starRatingContainer}>
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < editRating;
        return (
          <TouchableOpacity key={index} onPress={() => setEditRating(index + 1)}>
            <Ionicons
              name={isFilled ? 'star' : 'star-outline'}
              size={scale(30)}
              color="#FFD700"
              style={styles.starIcon}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );

  /* ----------------------------------------------
   *  Render Each Item in the List
   * --------------------------------------------*/
  const renderItem = ({ item }) => (
    <View style={[styles.reviewCard, { backgroundColor: currentTheme.cardBackground }]}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: item?.user?.profileImage || placeholderAvatar }}
          style={styles.avatar}
        />
        <View style={styles.reviewInfo}>
          <Text style={[styles.reviewTitle, { color: currentTheme.textColor }]}>
            {item.reviewable?.title || item.reviewable?.name || 'Item'}
          </Text>
          <View style={styles.reviewRating}>
            {Array.from({ length: 5 }, (_, idx) => {
              const fillStar = idx < item.rating;
              return (
                <Ionicons
                  key={idx}
                  name={fillStar ? 'star' : 'star-outline'}
                  size={scale(14)}
                  color="#FFD700"
                />
              );
            })}
          </View>
        </View>
      </View>

      <Text style={[styles.reviewComment, { color: currentTheme.textColor }]}>
        {item.comment}
      </Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: currentTheme.primaryColor }]}
          onPress={() => handleOpenEdit(item)}
        >
          <Ionicons
            name="create-outline"
            size={scale(16)}
            color={currentTheme.buttonTextColor}
            style={{ marginRight: scale(6) }}
          />
          <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: currentTheme.errorTextColor }]}
          onPress={() => handleDelete(item._id)}
        >
          <Ionicons
            name="trash-outline"
            size={scale(16)}
            color={currentTheme.buttonTextColor}
            style={{ marginRight: scale(6) }}
          />
          <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /* ----------------------------------------------
   *  Loading State
   * --------------------------------------------*/
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
        <ActivityIndicator size="large" color={currentTheme.primaryColor} style={styles.loader} />
      </View>
    );
  }

  /* ----------------------------------------------
   *  Error State
   * --------------------------------------------*/
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
        <Text style={{ color: currentTheme.errorTextColor }}>{error}</Text>
      </View>
    );
  }

  /* ----------------------------------------------
   *  Main Return
   * --------------------------------------------*/
  return (
    <View style={[styles.container]}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />
      {/* Subtle gradient behind main content */}
      <LinearGradient
        colors={[currentTheme.backgroundColor, currentTheme.cardBackground]}
        style={StyleSheet.absoluteFill}
        start={[0, 0]}
        end={[1, 1]}
      />

      <LinearGradient
        colors={currentTheme.headerBackground}
        style={[styles.header, { paddingTop: insets.top + scale(10) }]}
        start={[0, 0]}
        end={[0, 1]}
      >
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={scale(24)} color={currentTheme.headerTextColor} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: currentTheme.headerTextColor }]}>
          My Reviews
        </Text>
      </LinearGradient>

      {/* If user has reviews, show list; otherwise show an empty message */}
      {myReviews?.length > 0 ? (
        <FlatList
          data={myReviews}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: scale(10), paddingBottom: scale(40) }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={currentTheme.primaryColor}
            />
          }
        />
      ) : (
        <View style={styles.noReviewsContainer}>
          <Ionicons
            name="sad-outline"
            size={scale(40)}
            color={currentTheme.placeholderTextColor}
            style={{ marginBottom: scale(10) }}
          />
          <Text style={{ color: currentTheme.textColor, fontSize: scale(16), textAlign: 'center' }}>
            You have no reviews yet. Share your thoughts on a product or service!
          </Text>
        </View>
      )}

      {/* Edit Review Modal */}
      <Modal visible={showEditModal} transparent animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: currentTheme.cardBackground,
                transform: [{ scale: modalScale }],
                opacity: modalOpacity,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
            >
              <Ionicons name="close" size={scale(24)} color={currentTheme.textColor} />
            </TouchableOpacity>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={{ paddingBottom: scale(20) }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modalTitle, { color: currentTheme.textColor }]}>
                Edit Your Review
              </Text>

              {/* Star Rating */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: currentTheme.textColor }]}>Rating:</Text>
                {renderStarRating()}
              </View>

              {/* Comment */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: currentTheme.textColor }]}>Comment:</Text>
                <TextInput
                  style={[
                    styles.textArea,
                    {
                      borderColor: currentTheme.borderColor,
                      color: currentTheme.textColor,
                      backgroundColor: currentTheme.backgroundColor,
                    },
                  ]}
                  placeholder="Share your thoughts..."
                  placeholderTextColor={currentTheme.placeholderTextColor}
                  value={editComment}
                  onChangeText={setEditComment}
                  multiline
                />
              </View>

              {/* Save & Cancel Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: currentTheme.primaryColor }]}
                  onPress={handleSaveEdit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>
                      Save
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: currentTheme.errorTextColor }]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={[styles.buttonText, { color: currentTheme.buttonTextColor }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

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
  );
};

export default MyReviewsScreen;

/** ------------------------------------------------------------------
 *  STYLES (SCALED)
 * ----------------------------------------------------------------- */
const createStyles = ({ scale, width, height }) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    header: {
      paddingVertical: scale(15),
      paddingHorizontal: scale(20),
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomLeftRadius: scale(40),
      borderBottomRightRadius: scale(40),
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(5) },
      shadowOpacity: 0.3,
      shadowRadius: scale(8),
      marginBottom: scale(20),
    },
    headerBackButton: {
      position: 'absolute',
      left: scale(20),
      paddingVertical: scale(8),
      paddingHorizontal: scale(8),
    },
    headerText: {
      fontSize: scale(26),
      fontWeight: '700',
      textAlign: 'center',
    },
    noReviewsContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: scale(20),
    },
    // Review card
    reviewCard: {
      borderRadius: scale(15),
      padding: scale(15),
      marginBottom: scale(12),
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.3,
      shadowRadius: scale(4),
      elevation: 3,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(8),
    },
    avatar: {
      width: scale(45),
      height: scale(45),
      borderRadius: scale(22.5),
      marginRight: scale(10),
    },
    reviewInfo: {
      flex: 1,
    },
    reviewTitle: {
      fontSize: scale(18),
      fontWeight: '600',
    },
    reviewRating: {
      flexDirection: 'row',
      marginTop: scale(4),
    },
    reviewComment: {
      fontSize: scale(16),
      lineHeight: scale(22),
      marginVertical: scale(8),
    },
    // Buttons
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: scale(12),
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: scale(8),
      paddingHorizontal: scale(14),
      paddingVertical: scale(10),
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.3,
      shadowRadius: scale(3),
      elevation: 2,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: scale(8),
      paddingHorizontal: scale(14),
      paddingVertical: scale(10),
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.3,
      shadowRadius: scale(3),
      elevation: 2,
    },
    buttonText: {
      fontSize: scale(16),
      fontWeight: '600',
    },
    // Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: scale(20),
    },
    modalContainer: {
      width: width * 0.9,
      maxHeight: height * 0.85,
      borderRadius: scale(20),
      padding: scale(20),
      position: 'relative',
    },
    modalScroll: {
      marginTop: scale(10),
    },
    modalCloseButton: {
      position: 'absolute',
      top: scale(12),
      right: scale(12),
      padding: scale(8),
      borderRadius: scale(16),
      zIndex: 2,
    },
    modalTitle: {
      fontSize: scale(22),
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: scale(18),
    },
    // Form elements
    formGroup: {
      marginBottom: scale(16),
    },
    label: {
      fontSize: scale(18),
      fontWeight: '600',
      marginBottom: scale(8),
    },
    starRatingContainer: {
      flexDirection: 'row',
      marginTop: scale(5),
    },
    starIcon: {
      marginHorizontal: scale(4),
    },
    textArea: {
      borderWidth: scale(1),
      borderRadius: scale(10),
      padding: scale(12),
      height: scale(90),
      fontSize: scale(16),
      textAlignVertical: 'top',
    },
    // Modal action buttons
    saveButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: scale(14),
      borderRadius: scale(8),
      marginRight: scale(5),
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.3,
      shadowRadius: scale(4),
      elevation: 2,
    },
    cancelButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: scale(14),
      borderRadius: scale(8),
      marginLeft: scale(5),
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { width: 0, height: scale(3) },
      shadowOpacity: 0.3,
      shadowRadius: scale(4),
      elevation: 2,
    },
  });
