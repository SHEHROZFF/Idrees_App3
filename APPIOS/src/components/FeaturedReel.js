import React, { useCallback, useEffect, useState, memo, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import Carousel from 'react-native-reanimated-carousel';
import { useDispatch, useSelector } from 'react-redux';

import { fetchFeaturedReelsThunk } from '../store/slices/courseSlice';

const REELS_LIMIT = 5;
const PRELOAD_THRESHOLD = 4;

function FeaturedReel({ currentTheme }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Pull from Redux
  const {
    featuredReels,
    featuredReelsLoading,
    featuredReelsError,
    featuredReelsPage,
    featuredReelsHasMore,
  } = useSelector((state) => state.courses);

  // For the modal full-screen display
  const [modalVisible, setModalVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Dimensions
  const { width, height } = useWindowDimensions();

  // Scalings
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // Recalculated styles only when scaleFactor or theme changes
  const styles = useMemo(() => createStyles(scale, currentTheme, width, height), [
    scaleFactor,
    currentTheme,
    width,
    height,
  ]);

  // ---------------------------------------------------------------------------
  // 1) INITIAL LOAD / REFRESH
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // On mount, fetch the initial reels
    dispatch(fetchFeaturedReelsThunk({ page: 1, limit: REELS_LIMIT, loadMore: false }));
  }, [dispatch]);

  // ---------------------------------------------------------------------------
  // 2) OPEN THE MODAL AND VIEW A SPECIFIC REEL
  // ---------------------------------------------------------------------------
  const handlePressReel = useCallback(
    (index) => {
      if (featuredReels.length === 0) return;
      const safeIndex = Math.max(0, Math.min(index, featuredReels.length - 1));
      setCurrentIndex(safeIndex);
      setModalVisible(true);
    },
    [featuredReels]
  );

  // ---------------------------------------------------------------------------
  // 3) HORIZONTAL LIST RENDER
  // ---------------------------------------------------------------------------
  const renderHorizontalItem = useCallback(
    ({ item, index }) => {
      const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
      const difficulty = item.difficultyLevel || 'Beginner';

      return (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.reelCard}
          onPress={() => handlePressReel(index)}
        >
          <View style={styles.mediaContainer}>
            {item.shortVideoLink ? (
              <Video
                source={{ uri: item.shortVideoLink }}
                rate={1.0}
                volume={1.0}
                isMuted
                resizeMode="cover"
                shouldPlay={false}
                style={styles.reelMedia}
              />
            ) : (
              <Image source={{ uri: item.image }} style={styles.reelMedia} resizeMode="cover" />
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              style={styles.reelOverlay}
            />
          </View>

          {/* Circular thumbnail in top-right */}
          <View style={[styles.topRightImageContainer, { borderColor: currentTheme.borderColor }]}>
            <Image
              source={{ uri: item.image }}
              style={styles.topRightImage}
              resizeMode="cover"
            />
          </View>

          {/* Title & Stats */}
          <View style={styles.horizontalInfoOverlay}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.reelTitle,
                  {
                    color: currentTheme.reelTitleColor,
                    textShadowColor: currentTheme.textShadowColor,
                  },
                ]}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              {item.shortVideoLink && (
                <Ionicons
                  name="play-circle"
                  size={scale(22)}
                  color="#fff"
                  style={{ marginLeft: scale(5) }}
                />
              )}
            </View>
            <View style={styles.statsRow}>
              <Text
                style={[
                  styles.statsText,
                  {
                    color: currentTheme.reelTitleColor,
                    textShadowColor: currentTheme.textShadowColor,
                  },
                ]}
              >
                <MaterialIcons name="signal-cellular-alt" size={scale(14)} color="#f9c74f" />
                {` ${difficulty}`}
              </Text>
              <Text
                style={[
                  styles.statsText,
                  {
                    color: currentTheme.reelTitleColor,
                    textShadowColor: currentTheme.textShadowColor,
                  },
                ]}
              >
                <Ionicons name="star" size={scale(14)} color="#f9c74f" />
                {` ${ratingText}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [styles, currentTheme, handlePressReel, scale]
  );

  // ---------------------------------------------------------------------------
  // 4) LOAD MORE WHEN SCROLLING VERTICALLY
  // ---------------------------------------------------------------------------
  const loadMoreReels = useCallback(() => {
    if (featuredReelsLoading) return; // Prevent double loads
    if (!featuredReelsHasMore) return; // No more to load

    dispatch(
      fetchFeaturedReelsThunk({
        page: featuredReelsPage,
        limit: REELS_LIMIT,
        loadMore: true,
      })
    );
  }, [dispatch, featuredReelsLoading, featuredReelsHasMore, featuredReelsPage]);

  // ---------------------------------------------------------------------------
  // 5) VERTICAL CAROUSEL RENDER
  // ---------------------------------------------------------------------------
  const handleSnapToItem = useCallback(
    (index) => {
      setCurrentIndex(index);
      // If within threshold of the end, try loading more:
      if (index >= featuredReels.length - PRELOAD_THRESHOLD) {
        loadMoreReels();
      }
    },
    [featuredReels, loadMoreReels]
  );

  const renderVerticalItem = useCallback(
    ({ item, index }) => {
      const isCurrent = index === currentIndex;
      const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
      const difficulty = item.difficultyLevel || 'Beginner';

      return (
        <View style={[styles.fullReelContainer, { width, height }]}>
          {item.shortVideoLink ? (
            <Video
              source={{ uri: item.shortVideoLink }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="contain"
              shouldPlay={isCurrent}
              style={styles.fullScreenMedia}
            />
          ) : (
            <Image
              source={{ uri: item.image }}
              style={styles.fullScreenMedia}
              resizeMode="cover"
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.85)']}
            style={[styles.fullOverlay, { height: height * 0.3 }]}
          />

          {/* Minimalist Detail Overlay */}
          <View style={styles.detailOverlay}>
            <ScrollView contentContainerStyle={styles.detailContent} showsVerticalScrollIndicator={false}>
              <Text
                style={[
                  styles.detailTitle,
                  { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                ]}
              >
                {item.title}
              </Text>

              {/* Basic Info Row */}
              <View style={styles.detailRow}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={scale(16)} color="#FFD700" />
                  <Text style={[styles.detailRatingText, { color: currentTheme.ratingColor }]}>
                    {ratingText}
                  </Text>
                </View>
                <View style={styles.infoContainer}>
                  <Text
                    style={[
                      styles.detailInfo,
                      { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                    ]}
                  >
                    Difficulty: {difficulty}
                  </Text>
                  <Text
                    style={[
                      styles.detailInfo,
                      { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                    ]}
                  >
                    Language: {item.language || 'English'}
                  </Text>
                </View>
              </View>

              {/* Another Info Row */}
              <View style={styles.detailRow}>
                <Text
                  style={[
                    styles.detailInfo,
                    { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                  ]}
                >
                  Lectures: {item.numberOfLectures || 0}
                </Text>
                <Text
                  style={[
                    styles.detailInfo,
                    { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                  ]}
                >
                  Duration: {Math.floor((item.totalDuration || 0) / 60)} mins
                </Text>
              </View>

              {item.price > 0 && (
                <Text
                  style={[
                    styles.detailPrice,
                    { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                  ]}
                >
                  Price: ${item.price.toFixed(2)}
                </Text>
              )}
              {item.category && (
                <Text
                  style={[
                    styles.detailInfo,
                    { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                  ]}
                >
                  Category: {item.category}
                </Text>
              )}

              {/* Learning Points */}
              {Array.isArray(item.whatYouWillLearn) && item.whatYouWillLearn.length > 0 && (
                <View style={styles.learnContainer}>
                  <Text
                    style={[
                      styles.learnTitle,
                      { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                    ]}
                  >
                    What you'll learn:
                  </Text>
                  {item.whatYouWillLearn.map((point, idx) => (
                    <View style={styles.bulletRow} key={idx}>
                      <Ionicons
                        name="checkmark-circle"
                        size={scale(16)}
                        color="#4CAF50"
                        style={styles.bulletIcon}
                      />
                      <Text
                        style={[
                          styles.bulletText,
                          { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
                        ]}
                      >
                        {point}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {item.instructor && (
                <Text
                  style={[
                    styles.detailInfo,
                    {
                      marginTop: scale(10),
                      color: currentTheme.reelTitleColor,
                      textShadowColor: currentTheme.textShadowColor,
                    },
                  ]}
                >
                  Instructor: {item.instructor}
                </Text>
              )}
            </ScrollView>

            {/* "Enroll Now" button */}
            <TouchableOpacity
              style={styles.enrollButton}
              onPress={() => {
                setModalVisible(false);
                // Wait for the modal to close before navigating
                setTimeout(() => {
                  navigation.navigate('PurchaseScreen', { courseId: item._id });
                }, 300);
              }}
            >
              <LinearGradient colors={currentTheme.verticalreelsButtonColor} style={styles.enrollButtonBg}>
                <Text style={[styles.enrollButtonText, { color: currentTheme.buttonTextColor }]}>
                  Enroll Now
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [currentIndex, navigation, height, width, currentTheme, styles, scale]
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  if (!featuredReelsLoading && featuredReels.length === 0) {
    // Possibly an error or just no data
    // If there's an error, you might want to display it here
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header with Featured Courses title */}
      <View style={styles.headerContainer}>
        <Text style={[styles.featuredHeading, { color: currentTheme.cardTextColor }]}>
          Featured Courses
        </Text>
        <View style={[styles.sectionDivider, { backgroundColor: currentTheme.borderColor }]} />
      </View>

      {/* Horizontal FlatList limited to 6 reels */}
      <FlatList
        data={featuredReels.slice(0, 6)}
        horizontal
        keyExtractor={(item) => item._id}
        renderItem={renderHorizontalItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: scale(15) }}
      />

      {/* Show a small loader if still fetching initial reels */}
      {featuredReelsLoading && featuredReels.length === 0 && (
        <ActivityIndicator style={{ marginTop: scale(10) }} color={currentTheme.primaryColor} />
      )}

      {/* Full-screen vertical modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={false}>
        <View style={styles.modalContainer}>
          {featuredReels.length > 0 && (
            <Carousel
              data={featuredReels}
              renderItem={renderVerticalItem}
              vertical
              width={width}
              height={height}
              defaultIndex={Math.min(currentIndex, featuredReels.length - 1)}
              onSnapToItem={handleSnapToItem}
              autoPlay={false}
              loop={false}
              mode="default"
            />
          )}

          {/* "Loading More" overlay if we're fetching more pages */}
          {featuredReelsLoading && featuredReelsHasMore && (
            <View style={[styles.loadingMoreOverlay, { backgroundColor: currentTheme.textShadowColor }]}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={[styles.loadingText, { color: currentTheme.reelTitleColor }]}>
                Loading...
              </Text>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close-circle" size={scale(36)} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

export default memo(FeaturedReel);

// ---------------------------------------------------------------------------
// Helper: createStyles
// ---------------------------------------------------------------------------
function createStyles(scale, currentTheme, width, height) {
  return StyleSheet.create({
    headerContainer: {
      paddingHorizontal: scale(15),
      marginBottom: scale(10),
    },
    featuredHeading: {
      fontSize: scale(22),
      fontWeight: '700',
    },
    sectionDivider: {
      height: scale(2),
      marginVertical: scale(8),
      borderRadius: scale(2),
    },
    // Horizontal Reel Card
    reelCard: {
      borderRadius: scale(15),
      overflow: 'hidden',
      marginRight: scale(15),
      width: scale(147),
      height: scale(240),
      backgroundColor: '#000',
      elevation: 6,
      position: 'relative',
    },
    mediaContainer: {
      flex: 1,
    },
    reelMedia: {
      width: '100%',
      height: '100%',
    },
    reelOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: scale(60),
      justifyContent: 'flex-end',
      borderRadius: scale(15),
    },
    topRightImageContainer: {
      position: 'absolute',
      top: scale(6),
      right: scale(6),
      width: scale(42),
      height: scale(42),
      borderRadius: scale(21),
      overflow: 'hidden',
      borderWidth: scale(2),
      zIndex: 5,
    },
    topRightImage: {
      width: '100%',
      height: '100%',
    },
    horizontalInfoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: scale(8),
      paddingVertical: scale(6),
      zIndex: 10,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(2),
    },
    reelTitle: {
      fontSize: scale(15),
      fontWeight: '700',
      textShadowOffset: { width: scale(1), height: scale(1) },
      textShadowRadius: scale(3),
      maxWidth: scale(100),
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statsText: {
      fontSize: scale(12),
      marginRight: scale(8),
    },
    // Modal / Vertical Carousel
    modalContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    closeButton: {
      position: 'absolute',
      top: scale(40),
      right: scale(20),
      zIndex: 99,
    },
    fullReelContainer: {
      backgroundColor: '#000',
    },
    fullScreenMedia: {
      width: '100%',
      height: '100%',
    },
    fullOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
    },
    // Minimalist Detail Overlay
    detailOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: scale(20),
      paddingVertical: scale(10),
    },
    detailContent: {
      paddingBottom: scale(30),
    },
    detailTitle: {
      fontSize: scale(22),
      fontWeight: 'bold',
      marginBottom: scale(8),
      textShadowOffset: { width: scale(1), height: scale(1) },
      textShadowRadius: scale(3),
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: scale(6),
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailRatingText: {
      marginLeft: scale(4),
      fontSize: scale(16),
      fontWeight: 'bold',
    },
    infoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailInfo: {
      fontSize: scale(14),
      marginRight: scale(12),
    },
    detailPrice: {
      fontSize: scale(16),
      fontWeight: '600',
      marginBottom: scale(6),
    },
    learnContainer: {
      marginTop: scale(10),
    },
    learnTitle: {
      fontWeight: '600',
      marginBottom: scale(6),
      fontSize: scale(15),
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(4),
    },
    bulletIcon: {
      marginRight: scale(6),
    },
    bulletText: {
      fontSize: scale(14),
      flexShrink: 1,
    },
    // Enroll Button Footer
    enrollButton: {
      marginBottom: scale(30),
      borderRadius: scale(8),
      overflow: 'hidden',
    },
    enrollButtonBg: {
      paddingVertical: scale(12),
      alignItems: 'center',
      borderRadius: scale(8),
    },
    enrollButtonText: {
      fontWeight: '600',
      fontSize: scale(16),
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    // Loading More Overlay
    loadingMoreOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: scale(10),
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: scale(10),
    },
    loadingText: {
      marginTop: scale(4),
      fontSize: scale(14),
      fontWeight: '600',
    },
  });
}













// import React, { useCallback, useState, useEffect, memo, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
//   useWindowDimensions,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import Carousel from 'react-native-reanimated-carousel';
// import { useDispatch } from 'react-redux';
// import { fetchFeaturedReelsThunk } from '../store/slices/courseSlice';

// const REELS_LIMIT = 5; // how many reels to load per page
// const PRELOAD_THRESHOLD = 4;

// function FeaturedReel({ currentTheme }) {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   const navigation = useNavigation();
//   const dispatch = useDispatch();

//   // For the modal full-screen display
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Get dynamic dimensions
//   const { width, height } = useWindowDimensions();

//   // 1) Define scale factor
//   const baseWidth = width > 375 ? 460 : 500; 
//   const scaleFactor = width / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   // 2) useMemo for styles to recalc only when scaleFactor or theme changes
//   const styles = useMemo(
//     () =>
//       StyleSheet.create({
//         headerContainer: {
//           paddingHorizontal: scale(15),
//           marginBottom: scale(10),
//         },
//         featuredHeading: {
//           // marginTop: scale(10),
//           fontSize: scale(22),
//           fontWeight: '700',
//         },
//         sectionDivider: {
//           height: scale(2),
//           marginVertical: scale(8),
//           borderRadius: scale(2),
//         },
//         // Horizontal Reel Card
//         reelCard: {
//           borderRadius: scale(15),
//           overflow: 'hidden',
//           marginRight: scale(15),
//           width: scale(147),
//           height: scale(240),
//           backgroundColor: '#000',
//           elevation: 6,
//           position: 'relative',
//         },
//         mediaContainer: {
//           flex: 1,
//         },
//         reelMedia: {
//           width: '100%',
//           height: '100%',
//         },
//         reelOverlay: {
//           position: 'absolute',
//           left: 0,
//           right: 0,
//           bottom: 0,
//           height: scale(60),
//           justifyContent: 'flex-end',
//           borderRadius: scale(15),
//         },
//         topRightImageContainer: {
//           position: 'absolute',
//           top: scale(6),
//           right: scale(6),
//           width: scale(42),
//           height: scale(42),
//           borderRadius: scale(21),
//           overflow: 'hidden',
//           borderWidth: scale(2),
//           zIndex: 5,
//         },
//         topRightImage: {
//           width: '100%',
//           height: '100%',
//         },
//         horizontalInfoOverlay: {
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           right: 0,
//           paddingHorizontal: scale(8),
//           paddingVertical: scale(6),
//           zIndex: 10,
//         },
//         titleRow: {
//           flexDirection: 'row',
//           alignItems: 'center',
//           marginBottom: scale(2),
//         },
//         reelTitle: {
//           fontSize: scale(15),
//           fontWeight: '700',
//           textShadowOffset: { width: scale(1), height: scale(1) },
//           textShadowRadius: scale(3),
//           maxWidth: scale(100),
//         },
//         statsRow: {
//           flexDirection: 'row',
//           alignItems: 'center',
//           justifyContent: 'space-between',
//         },
//         statsText: {
//           fontSize: scale(12),
//           marginRight: scale(8),
//         },
//         // Modal / Vertical Carousel
//         modalContainer: {
//           flex: 1,
//           backgroundColor: '#000',
//         },
//         closeButton: {
//           position: 'absolute',
//           top: scale(40),
//           right: scale(20),
//           zIndex: 99,
//         },
//         fullReelContainer: {
//           // Width and height set inline for responsiveness
//           backgroundColor: '#000',
//         },
//         fullScreenMedia: {
//           width: '100%',
//           height: '100%',
//         },
//         fullOverlay: {
//           position: 'absolute',
//           left: 0,
//           right: 0,
//           bottom: 0,
//           justifyContent: 'flex-end',
//         },
//         // Minimalist Detail Overlay
//         detailOverlay: {
//           position: 'absolute',
//           bottom: 0,
//           left: 0,
//           right: 0,
//           paddingHorizontal: scale(20),
//           paddingVertical: scale(10),
//         },
//         detailContent: {
//           paddingBottom: scale(30),
//         },
//         detailTitle: {
//           fontSize: scale(22),
//           fontWeight: 'bold',
//           marginBottom: scale(8),
//           textShadowOffset: { width: scale(1), height: scale(1) },
//           textShadowRadius: scale(3),
//         },
//         detailRow: {
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           marginBottom: scale(6),
//         },
//         ratingContainer: {
//           flexDirection: 'row',
//           alignItems: 'center',
//         },
//         detailRatingText: {
//           marginLeft: scale(4),
//           fontSize: scale(16),
//           fontWeight: 'bold',
//         },
//         infoContainer: {
//           flexDirection: 'row',
//           alignItems: 'center',
//         },
//         detailInfo: {
//           fontSize: scale(14),
//           marginRight: scale(12),
//         },
//         detailPrice: {
//           fontSize: scale(16),
//           fontWeight: '600',
//           marginBottom: scale(6),
//         },
//         learnContainer: {
//           marginTop: scale(10),
//         },
//         learnTitle: {
//           fontWeight: '600',
//           marginBottom: scale(6),
//           fontSize: scale(15),
//         },
//         bulletRow: {
//           flexDirection: 'row',
//           alignItems: 'center',
//           marginBottom: scale(4),
//         },
//         bulletIcon: {
//           marginRight: scale(6),
//         },
//         bulletText: {
//           fontSize: scale(14),
//           flexShrink: 1,
//         },
//         // Enroll Button Footer
//         enrollButton: {
//           // marginTop: scale(10),
//           marginBottom: scale(30),
//           borderRadius: scale(8),
//           overflow: 'hidden',
//         },
//         enrollButtonBg: {
//           paddingVertical: scale(12),
//           alignItems: 'center',
//           borderRadius: scale(8),
//         },
//         enrollButtonText: {
//           fontWeight: '600',
//           fontSize: scale(16),
//           textTransform: 'uppercase',
//           letterSpacing: 0.5,
//         },
//         // Loading More Overlay
//         loadingMoreOverlay: {
//           position: 'absolute',
//           left: 0,
//           right: 0,
//           bottom: scale(10),
//           alignItems: 'center',
//           justifyContent: 'center',
//           paddingVertical: scale(10),
//         },
//         loadingText: {
//           marginTop: scale(4),
//           fontSize: scale(14),
//           fontWeight: '600',
//         },
//       }),
//     [scaleFactor, currentTheme]
//   );

//   // ---------------------------------------------------------------------------
//   // FETCH REELS using Redux thunk
//   // ---------------------------------------------------------------------------
//   const loadReels = useCallback(
//     async (reset = false) => {
//       try {
//         setLoading(true);
//         const nextPage = reset ? 1 : page;
//         const result = await dispatch(
//           fetchFeaturedReelsThunk({ page: nextPage, limit: REELS_LIMIT })
//         ).unwrap();

//         const newReels = result.data.map((r) => ({
//           ...r,
//           id: r._id,
//         }));
//         setReels((prev) => (reset ? newReels : [...prev, ...newReels]));
//         setHasMore(newReels.length >= REELS_LIMIT);
//         setPage(reset ? 2 : nextPage + 1);
//       } catch (err) {
//         console.warn('Error fetching reels', err);
//         setHasMore(false);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [page, dispatch]
//   );

//   useEffect(() => {
//     loadReels(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // HORIZONTAL TEASER (FlatList)
//   // ---------------------------------------------------------------------------
//   const handlePressReel = useCallback(
//     (index) => {
//       if (reels.length === 0) return;
//       const safeIndex = Math.max(0, Math.min(index, reels.length - 1));
//       setCurrentIndex(safeIndex);
//       setModalVisible(true);
//     },
//     [reels]
//   );

//   const renderHorizontalItem = ({ item, index }) => {
//     const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//     const difficulty = item.difficultyLevel || 'Beginner';

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={styles.reelCard}
//         onPress={() => handlePressReel(index)}
//       >
//         <View style={styles.mediaContainer}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted
//               resizeMode="cover"
//               shouldPlay={false}
//               style={styles.reelMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.reelMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.6)']}
//             style={styles.reelOverlay}
//           />
//         </View>
//         <View style={[styles.topRightImageContainer, { borderColor: currentTheme.borderColor }]}>
//           <Image
//             source={{ uri: item.image }}
//             style={styles.topRightImage}
//             resizeMode="cover"
//           />
//         </View>
//         <View style={styles.horizontalInfoOverlay}>
//           <View style={styles.titleRow}>
//             <Text
//               style={[
//                 styles.reelTitle,
//                 {
//                   color: currentTheme.reelTitleColor,
//                   textShadowColor: currentTheme.textShadowColor,
//                 },
//               ]}
//               numberOfLines={1}
//             >
//               {item.title}
//             </Text>
//             {item.shortVideoLink && (
//               <Ionicons name="play-circle" size={scale(22)} color="#fff" style={{ marginLeft: scale(5) }} />
//             )}
//           </View>
//           <View style={styles.statsRow}>
//             <Text
//               style={[
//                 styles.statsText,
//                 {
//                   color: currentTheme.reelTitleColor,
//                   textShadowColor: currentTheme.textShadowColor,
//                 },
//               ]}
//             >
//               <MaterialIcons name="signal-cellular-alt" size={scale(14)} color="#f9c74f" />
//               {` ${difficulty}`}
//             </Text>
//             <Text
//               style={[
//                 styles.statsText,
//                 {
//                   color: currentTheme.reelTitleColor,
//                   textShadowColor: currentTheme.textShadowColor,
//                 },
//               ]}
//             >
//               <Ionicons name="star" size={scale(14)} color="#f9c74f" />
//               {` ${ratingText}`}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ---------------------------------------------------------------------------
//   // MODAL & VERTICAL CAROUSEL
//   // ---------------------------------------------------------------------------
//   const handleSnapToItem = useCallback(
//     (index) => {
//       setCurrentIndex(index);
//       // Trigger loading when within PRELOAD_THRESHOLD of the end
//       if (index >= reels.length - PRELOAD_THRESHOLD && hasMore && !loading) {
//         loadReels();
//       }
//     },
//     [reels.length, hasMore, loading, loadReels]
//   );

//   const renderVerticalItem = useCallback(
//     ({ item, index }) => {
//       const isCurrent = index === currentIndex;
//       const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//       const difficulty = item.difficultyLevel || 'Beginner';

//       return (
//         <View
//           style={[
//             styles.fullReelContainer,
//             {
//               width,
//               height,
//               backgroundColor: currentTheme.verticalreelsBgColor,
//             },
//           ]}
//         >
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted={false}
//               resizeMode="contain"
//               shouldPlay={isCurrent}
//               style={styles.fullScreenMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.fullScreenMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.85)']}
//             style={[styles.fullOverlay, { height: height * 0.3 }]}
//           />
//           {/* Minimalist Detail Overlay */}
//           <View style={styles.detailOverlay}>
//             <ScrollView
//               contentContainerStyle={styles.detailContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <Text
//                 style={[
//                   styles.detailTitle,
//                   {
//                     color: currentTheme.reelTitleColor,
//                     textShadowColor: currentTheme.textShadowColor,
//                   },
//                 ]}
//               >
//                 {item.title}
//               </Text>
//               <View style={styles.detailRow}>
//                 <View style={styles.ratingContainer}>
//                   <Ionicons name="star" size={scale(16)} color="#FFD700" />
//                   <Text
//                     style={[
//                       styles.detailRatingText,
//                       { color: currentTheme.ratingColor },
//                     ]}
//                   >
//                     {ratingText}
//                   </Text>
//                 </View>
//                 <View style={styles.infoContainer}>
//                   <Text
//                     style={[
//                       styles.detailInfo,
//                       {
//                         color: currentTheme.reelTitleColor,
//                         textShadowColor: currentTheme.textShadowColor,
//                       },
//                     ]}
//                   >
//                     Difficulty: {difficulty}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.detailInfo,
//                       {
//                         color: currentTheme.reelTitleColor,
//                         textShadowColor: currentTheme.textShadowColor,
//                       },
//                     ]}
//                   >
//                     Language: {item.language || 'English'}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text
//                   style={[
//                     styles.detailInfo,
//                     {
//                       color: currentTheme.reelTitleColor,
//                       textShadowColor: currentTheme.textShadowColor,
//                     },
//                   ]}
//                 >
//                   Lectures: {item.numberOfLectures || 0}
//                 </Text>
//                 <Text
//                   style={[
//                     styles.detailInfo,
//                     {
//                       color: currentTheme.reelTitleColor,
//                       textShadowColor: currentTheme.textShadowColor,
//                     },
//                   ]}
//                 >
//                   Duration: {Math.floor((item.totalDuration || 0) / 60)} mins
//                 </Text>
//               </View>
//               {item.price > 0 && (
//                 <Text
//                   style={[
//                     styles.detailPrice,
//                     {
//                       color: currentTheme.reelTitleColor,
//                       textShadowColor: currentTheme.textShadowColor,
//                     },
//                   ]}
//                 >
//                   Price: ${item.price.toFixed(2)}
//                 </Text>
//               )}
//               {item.category && (
//                 <Text
//                   style={[
//                     styles.detailInfo,
//                     {
//                       color: currentTheme.reelTitleColor,
//                       textShadowColor: currentTheme.textShadowColor,
//                     },
//                   ]}
//                 >
//                   Category: {item.category}
//                 </Text>
//               )}
//               {Array.isArray(item.whatYouWillLearn) && item.whatYouWillLearn.length > 0 && (
//                 <View style={styles.learnContainer}>
//                   <Text
//                     style={[
//                       styles.learnTitle,
//                       {
//                         color: currentTheme.reelTitleColor,
//                         textShadowColor: currentTheme.textShadowColor,
//                       },
//                     ]}
//                   >
//                     What you'll learn:
//                   </Text>
//                   {item.whatYouWillLearn.map((point, idx) => (
//                     <View style={styles.bulletRow} key={idx}>
//                       <Ionicons
//                         name="checkmark-circle"
//                         size={scale(16)}
//                         color="#4CAF50"
//                         style={styles.bulletIcon}
//                       />
//                       <Text
//                         style={[
//                           styles.bulletText,
//                           {
//                             color: currentTheme.reelTitleColor,
//                             textShadowColor: currentTheme.textShadowColor,
//                           },
//                         ]}
//                       >
//                         {point}
//                       </Text>
//                     </View>
//                   ))}
//                 </View>
//               )}
//               {item.instructor && (
//                 <Text
//                   style={[
//                     styles.detailInfo,
//                     {
//                       marginTop: scale(10),
//                       color: currentTheme.reelTitleColor,
//                       textShadowColor: currentTheme.textShadowColor,
//                     },
//                   ]}
//                 >
//                   Instructor: {item.instructor}
//                 </Text>
//               )}
//             </ScrollView>
//             <TouchableOpacity
//               style={styles.enrollButton}
//               onPress={() => navigation.navigate('PurchaseScreen', { courseId: item.id })}
//             >
//               <LinearGradient
//                 colors={currentTheme.verticalreelsButtonColor}
//                 style={styles.enrollButtonBg}
//               >
//                 <Text style={[styles.enrollButtonText, { color: currentTheme.buttonTextColor }]}>
//                   Enroll Now
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     },
//     [currentIndex, navigation, height, width, currentTheme, scale]
//   );

//   // ---------------------------------------------------------------------------
//   // RENDER
//   // ---------------------------------------------------------------------------
//   if (reels.length === 0 && loading) {
//     return (
//       <View style={{ paddingVertical: scale(20) }}>
//         <Text style={{ color: currentTheme?.cardTextColor || '#000' }}>
//           Loading featured reels...
//         </Text>
//       </View>
//     );
//   }

//   if (reels.length === 0 && !loading) {
//     return null;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Header with Featured Courses title */}
//       <View style={styles.headerContainer}>
//         <Text style={[styles.featuredHeading, { color: currentTheme.cardTextColor }]}>
//           Featured Courses
//         </Text>
//         <View
//           style={[styles.sectionDivider, { backgroundColor: currentTheme.borderColor }]}
//         />
//       </View>

//       {/* Horizontal FlatList limited to 6 reels */}
//       <FlatList
//         data={reels.slice(0, 6)}
//         horizontal
//         keyExtractor={(item) => item.id}
//         renderItem={renderHorizontalItem}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingRight: scale(15) }}
//       />

//       {/* Full-screen vertical modal */}
//       <Modal visible={modalVisible} animationType="slide" transparent={false}>
//         <View style={styles.modalContainer}>
//           {reels.length > 0 && (
//             <Carousel
//               data={reels}
//               renderItem={renderVerticalItem}
//               vertical
//               width={width}
//               height={height}
//               defaultIndex={Math.min(currentIndex, reels.length - 1)}
//               onSnapToItem={handleSnapToItem}
//               autoPlay={false}
//               loop={false}
//               mode="default"
//             />
//           )}
//           {loading && hasMore && (
//             <View
//               style={[
//                 styles.loadingMoreOverlay,
//                 { backgroundColor: currentTheme.textShadowColor },
//               ]}
//             >
//               <ActivityIndicator size="large" color="#fff" />
//               <Text style={[styles.loadingText, { color: currentTheme.reelTitleColor }]}>
//                 Loading...
//               </Text>
//             </View>
//           )}
//           <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//             <Ionicons name="close-circle" size={scale(36)} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// export default memo(FeaturedReel);














// import React, { useCallback, useState, useEffect, memo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Modal,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
//   useWindowDimensions,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import Carousel from 'react-native-reanimated-carousel';
// import { useDispatch } from 'react-redux';
// import { fetchFeaturedReelsThunk } from '../store/slices/courseSlice';

// const REELS_LIMIT = 5; // how many reels to load per page
// const PRELOAD_THRESHOLD = 4;

// function FeaturedReel({ currentTheme }) {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   const navigation = useNavigation();
//   const dispatch = useDispatch();

//   // For the modal full-screen display
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Get dynamic dimensions
//   const { width, height } = useWindowDimensions();

//   // ---------------------------------------------------------------------------
//   // FETCH REELS using Redux thunk
//   // ---------------------------------------------------------------------------
//   const loadReels = useCallback(
//     async (reset = false) => {
//       try {
//         setLoading(true);
//         const nextPage = reset ? 1 : page;
//         const result = await dispatch(
//           fetchFeaturedReelsThunk({ page: nextPage, limit: REELS_LIMIT })
//         ).unwrap();
//         console.log('resultdsadsa', result);
        
//         // Expecting result.data to be an array
//         const newReels = result.data.map((r) => ({
//           ...r,
//           id: r._id,
//         }));
//         setReels((prev) => (reset ? newReels : [...prev, ...newReels]));
//         setHasMore(newReels.length >= REELS_LIMIT);
//         setPage(reset ? 2 : nextPage + 1);
//       } catch (err) {
//         console.warn('Error fetching reels', err);
//         setHasMore(false);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [page, dispatch]
//   );

//   useEffect(() => {
//     loadReels(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // HORIZONTAL TEASER (FlatList)
//   // ---------------------------------------------------------------------------
//   const handlePressReel = useCallback(
//     (index) => {
//       if (reels.length === 0) return;
//       const safeIndex = Math.max(0, Math.min(index, reels.length - 1));
//       setCurrentIndex(safeIndex);
//       setModalVisible(true);
//     },
//     [reels]
//   );

//   const renderHorizontalItem = ({ item, index }) => {
//     const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//     const difficulty = item.difficultyLevel || 'Beginner';

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={styles.reelCard}
//         onPress={() => handlePressReel(index)}
//       >
//         <View style={styles.mediaContainer}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted
//               resizeMode="cover"
//               shouldPlay={false}
//               style={styles.reelMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.reelMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.6)']}
//             style={styles.reelOverlay}
//           />
//         </View>
//         <View style={[styles.topRightImageContainer, { borderColor: currentTheme.borderColor }]}>
//           <Image
//             source={{ uri: item.image }}
//             style={styles.topRightImage}
//             resizeMode="cover"
//           />
//         </View>
//         <View style={styles.horizontalInfoOverlay}>
//           <View style={styles.titleRow}>
//             <Text
//               style={[
//                 styles.reelTitle,
//                 { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//               ]}
//               numberOfLines={1}
//             >
//               {item.title}
//             </Text>
//             {item.shortVideoLink && (
//               <Ionicons name="play-circle" size={22} color="#fff" style={{ marginLeft: 5 }} />
//             )}
//           </View>
//           <View style={styles.statsRow}>
//             <Text
//               style={[
//                 styles.statsText,
//                 { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//               ]}
//             >
//               <MaterialIcons name="signal-cellular-alt" size={14} color="#f9c74f" />
//               {` ${difficulty}`}
//             </Text>
//             <Text
//               style={[
//                 styles.statsText,
//                 { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//               ]}
//             >
//               <Ionicons name="star" size={14} color="#f9c74f" />
//               {` ${ratingText}`}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ---------------------------------------------------------------------------
//   // MODAL & VERTICAL CAROUSEL
//   // ---------------------------------------------------------------------------
//   const handleSnapToItem = useCallback(
//     (index) => {
//       setCurrentIndex(index);
//       // Trigger loading when within PRELOAD_THRESHOLD of the end
//       if (index >= reels.length - PRELOAD_THRESHOLD && hasMore && !loading) {
//         loadReels();
//       }
//     },
//     [reels.length, hasMore, loading, loadReels]
//   );

//   const renderVerticalItem = useCallback(
//     ({ item, index }) => {
//       const isCurrent = index === currentIndex;
//       const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//       const difficulty = item.difficultyLevel || 'Beginner';

//       return (
//         <View style={[styles.fullReelContainer, { width, height, backgroundColor: currentTheme.verticalreelsBgColor }]}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted={false}
//               resizeMode="contain"
//               shouldPlay={isCurrent}
//               style={styles.fullScreenMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.fullScreenMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.85)']}
//             style={[styles.fullOverlay, { height: height * 0.3 }]}
//           />
//           {/* Minimalist Detail Overlay */}
//           <View style={styles.detailOverlay}>
//             <ScrollView
//               contentContainerStyle={styles.detailContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <Text
//                 style={[
//                   styles.detailTitle,
//                   { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                 ]}
//               >
//                 {item.title}
//               </Text>
//               <View style={styles.detailRow}>
//                 <View style={styles.ratingContainer}>
//                   <Ionicons name="star" size={16} color="#FFD700" />
//                   <Text style={[styles.detailRatingText, { color: currentTheme.ratingColor }]}>
//                     {ratingText}
//                   </Text>
//                 </View>
//                 <View style={styles.infoContainer}>
//                   <Text
//                     style={[
//                       styles.detailInfo,
//                       { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                     ]}
//                   >
//                     Difficulty: {difficulty}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.detailInfo,
//                       { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                     ]}
//                   >
//                     Language: {item.language || 'English'}
//                   </Text>
//                 </View>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text
//                   style={[
//                     styles.detailInfo,
//                     { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                   ]}
//                 >
//                   Lectures: {item.numberOfLectures || 0}
//                 </Text>
//                 <Text
//                   style={[
//                     styles.detailInfo,
//                     { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                   ]}
//                 >
//                   Duration: {Math.floor((item.totalDuration || 0) / 60)} mins
//                 </Text>
//               </View>
//               {item.price > 0 && (
//                 <Text
//                   style={[
//                     styles.detailPrice,
//                     { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                   ]}
//                 >
//                   Price: ${item.price.toFixed(2)}
//                 </Text>
//               )}
//               {item.category && (
//                 <Text
//                   style={[
//                     styles.detailInfo,
//                     { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                   ]}
//                 >
//                   Category: {item.category}
//                 </Text>
//               )}
//               {Array.isArray(item.whatYouWillLearn) && item.whatYouWillLearn.length > 0 && (
//                 <View style={styles.learnContainer}>
//                   <Text
//                     style={[
//                       styles.learnTitle,
//                       { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                     ]}
//                   >
//                     What you'll learn:
//                   </Text>
//                   {item.whatYouWillLearn.map((point, idx) => (
//                     <View style={styles.bulletRow} key={idx}>
//                       <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.bulletIcon} />
//                       <Text
//                         style={[
//                           styles.bulletText,
//                           { color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                         ]}
//                       >
//                         {point}
//                       </Text>
//                     </View>
//                   ))}
//                 </View>
//               )}
//               {item.instructor && (
//                 <Text
//                   style={[
//                     styles.detailInfo,
//                     { marginTop: 10, color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor },
//                   ]}
//                 >
//                   Instructor: {item.instructor}
//                 </Text>
//               )}
//             </ScrollView>
//             <TouchableOpacity
//               style={styles.enrollButton}
//               onPress={() => navigation.navigate('PurchaseScreen', { courseId: item.id })}
//             >
//               <LinearGradient
//                 colors={currentTheme.verticalreelsButtonColor}
//                 style={styles.enrollButtonBg}
//               >
//                 <Text style={[styles.enrollButtonText, { color: currentTheme.buttonTextColor }]}>
//                   Enroll Now
//                 </Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     },
//     [currentIndex, navigation, height, width, currentTheme]
//   );

//   // ---------------------------------------------------------------------------
//   // RENDER
//   // ---------------------------------------------------------------------------
//   if (reels.length === 0 && loading) {
//     return (
//       <View style={{ paddingVertical: 20 }}>
//         <Text style={{ color: currentTheme?.cardTextColor || '#000' }}>
//           Loading featured reels...
//         </Text>
//       </View>
//     );
//   }

//   if (reels.length === 0 && !loading) {
//     return null;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Header with Featured Courses title */}
//       <View style={styles.headerContainer}>
//         <Text style={[styles.featuredHeading, { color: currentTheme.cardTextColor }]}>
//           Featured Courses
//         </Text>
//         <View style={[styles.sectionDivider, { backgroundColor: currentTheme.borderColor }]} />
//       </View>

//       {/* Horizontal FlatList limited to 6 reels */}
//       <FlatList
//         data={reels.slice(0, 6)}
//         horizontal
//         keyExtractor={(item) => item.id}
//         renderItem={renderHorizontalItem}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingRight: 15 }}
//       />

//       {/* Full-screen vertical modal */}
//       <Modal visible={modalVisible} animationType="slide" transparent={false}>
//         <View style={styles.modalContainer}>
//           {reels.length > 0 && (
//             <Carousel
//               data={reels}
//               renderItem={renderVerticalItem}
//               vertical
//               width={width}
//               height={height}
//               defaultIndex={Math.min(currentIndex, reels.length - 1)}
//               onSnapToItem={handleSnapToItem}
//               autoPlay={false}
//               loop={false}
//               mode="default"
//             />
//           )}
//           {loading && hasMore && (
//             <View
//               style={[
//                 styles.loadingMoreOverlay,
//                 { backgroundColor: currentTheme.textShadowColor },
//               ]}
//             >
//               <ActivityIndicator size="large" color="#fff" />
//               <Text style={[styles.loadingText, { color: currentTheme.reelTitleColor }]}>
//                 Loading...
//               </Text>
//             </View>
//           )}
//           <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//             <Ionicons name="close-circle" size={36} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// export default memo(FeaturedReel);

// const styles = StyleSheet.create({
//   headerContainer: {
//     paddingHorizontal: 15,
//     marginBottom: 10,
//   },
//   featuredHeading: {
//     marginTop: 10,
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     marginVertical: 8,
//     borderRadius: 2,
//   },
//   // Horizontal Reel Card
//   reelCard: {
//     borderRadius: 15,
//     overflow: 'hidden',
//     marginRight: 15,
//     width: 145,
//     height: 220,
//     backgroundColor: '#000',
//     elevation: 6,
//     position: 'relative',
//   },
//   mediaContainer: {
//     flex: 1,
//   },
//   reelMedia: {
//     width: '100%',
//     height: '100%',
//   },
//   reelOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: 60,
//     justifyContent: 'flex-end',
//     borderRadius: 15,
//   },
//   topRightImageContainer: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     overflow: 'hidden',
//     borderWidth: 2,
//     zIndex: 5,
//   },
//   topRightImage: {
//     width: '100%',
//     height: '100%',
//   },
//   horizontalInfoOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     zIndex: 10,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 2,
//   },
//   reelTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//     maxWidth: 100,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   statsText: {
//     fontSize: 12,
//     marginRight: 8,
//   },
//   // Modal / Vertical Carousel
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 99,
//   },
//   fullReelContainer: {
//     // Width and height will be set inline for responsiveness.
//     backgroundColor: '#000',
//   },
//   fullScreenMedia: {
//     width: '100%',
//     height: '100%',
//   },
//   fullOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'flex-end',
//   },
//   // Minimalist Detail Overlay
//   detailOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   detailContent: {
//     paddingBottom: 30,
//   },
//   detailTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailRatingText: {
//     marginLeft: 4,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   infoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailInfo: {
//     fontSize: 14,
//     marginRight: 12,
//   },
//   detailPrice: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   learnContainer: {
//     marginTop: 10,
//   },
//   learnTitle: {
//     fontWeight: '600',
//     marginBottom: 6,
//     fontSize: 15,
//   },
//   bulletRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   bulletIcon: {
//     marginRight: 6,
//   },
//   bulletText: {
//     fontSize: 14,
//     flexShrink: 1,
//   },
//   // Enroll Button Footer
//   enrollButton: {
//     marginTop: 10,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   enrollButtonBg: {
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   enrollButtonText: {
//     fontWeight: '600',
//     fontSize: 16,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   // Loading More Overlay
//   loadingMoreOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 10,
//   },
//   loadingText: {
//     marginTop: 4,
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });









// import React, { useCallback, useState, useEffect, memo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Modal,
//   Dimensions,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import Carousel from 'react-native-reanimated-carousel';

// // Removed direct API import
// // import { fetchFeaturedReels } from '../services/api';
// import { useDispatch } from 'react-redux';
// import { fetchFeaturedReelsThunk } from '../store/slices/courseSlice';

// const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
// const REELS_LIMIT = 5; // how many reels to load per page
// const PRELOAD_THRESHOLD = 4;

// function FeaturedReel({ currentTheme }) {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   const navigation = useNavigation();
//   const dispatch = useDispatch();

//   // For the modal full-screen display
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // ---------------------------------------------------------------------------
//   // FETCH REELS using Redux thunk
//   // ---------------------------------------------------------------------------
//   const loadReels = useCallback(
//     async (reset = false) => {
//       try {
//         setLoading(true);
//         const nextPage = reset ? 1 : page;
//         const result = await dispatch(
//           fetchFeaturedReelsThunk({ page: nextPage, limit: REELS_LIMIT })
//         ).unwrap();
//         console.log('resultdsadsa', result);
        
//         // Expecting result.reels to be an array
//         const newReels = result.data.map((r) => ({
//           ...r,
//           id: r._id,
//         }));
//         setReels((prev) => (reset ? newReels : [...prev, ...newReels]));
//         setHasMore(newReels.length >= REELS_LIMIT);
//         setPage(reset ? 2 : nextPage + 1);
//       } catch (err) {
//         console.warn('Error fetching reels', err);
//         setHasMore(false);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [page, dispatch]
//   );

//   useEffect(() => {
//     loadReels(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // HORIZONTAL TEASER (FlatList)
//   // ---------------------------------------------------------------------------
//   const handlePressReel = useCallback(
//     (index) => {
//       if (reels.length === 0) return;
//       const safeIndex = Math.max(0, Math.min(index, reels.length - 1));
//       setCurrentIndex(safeIndex);
//       setModalVisible(true);
//     },
//     [reels]
//   );

//   const renderHorizontalItem = ({ item, index }) => {
//     const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//     const difficulty = item.difficultyLevel || 'Beginner';

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={styles.reelCard}
//         onPress={() => handlePressReel(index)}
//       >
//         <View style={styles.mediaContainer}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted
//               resizeMode="cover"
//               shouldPlay={false}
//               style={styles.reelMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.reelMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.6)']}
//             style={styles.reelOverlay}
//           />
//         </View>
//         <View style={[styles.topRightImageContainer,{borderColor: currentTheme.borderColor}]}>
//           <Image
//             source={{ uri: item.image }}
//             style={styles.topRightImage}
//             resizeMode="cover"
//           />
//         </View>
//         <View style={styles.horizontalInfoOverlay}>
//           <View style={styles.titleRow}>
//             <Text style={[styles.reelTitle,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]} numberOfLines={1}>
//               {item.title}
//             </Text>
//             {item.shortVideoLink && (
//               <Ionicons name="play-circle" size={22} color="#fff" style={{ marginLeft: 5 }} />
//             )}
//           </View>
//           <View style={styles.statsRow}>
//             <Text style={[styles.statsText,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>
//               <MaterialIcons name="signal-cellular-alt" size={14} color="#f9c74f" />
//               {` ${difficulty}`}
//             </Text>
//             <Text style={[styles.statsText,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>
//               <Ionicons name="star" size={14} color="#f9c74f" />
//               {` ${ratingText}`}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ---------------------------------------------------------------------------
//   // MODAL & VERTICAL CAROUSEL
//   // ---------------------------------------------------------------------------
//   const handleSnapToItem = useCallback(
//     (index) => {
//       setCurrentIndex(index);
//       // Trigger loading when within PRELOAD_THRESHOLD of the end
//       if (index >= reels.length - PRELOAD_THRESHOLD && hasMore && !loading) {
//         loadReels();
//       }
//     },
//     [reels.length, hasMore, loading, loadReels]
//   );

//   const renderVerticalItem = useCallback(
//     ({ item, index }) => {
//       const isCurrent = index === currentIndex;
//       const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//       const difficulty = item.difficultyLevel || 'Beginner';

//       return (
//         <View style={[styles.fullReelContainer,{backgroundColor: currentTheme.verticalreelsBgColor}]}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted={false}
//               resizeMode="contain"
//               shouldPlay={isCurrent}
//               style={styles.fullScreenMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.fullScreenMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.85)']}
//             style={styles.fullOverlay}
//           />
//           {/* Minimalist Detail Overlay */}
//           <View style={styles.detailOverlay}>
//             <ScrollView
//               contentContainerStyle={styles.detailContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <Text style={[styles.detailTitle,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>{item.title}</Text>
//               <View style={styles.detailRow}>
//                 <View style={styles.ratingContainer}>
//                   <Ionicons name="star" size={16} color="#FFD700" />
//                   <Text style={[styles.detailRatingText,{ color:currentTheme.ratingColor}]}>{ratingText}</Text>
//                 </View>
//                 <View style={styles.infoContainer}>
//                   <Text style={[styles.detailInfo,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>Difficulty: {difficulty}</Text>
//                   <Text style={[styles.detailInfo,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>Language: {item.language || 'English'}</Text>
//                 </View>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={[styles.detailInfo,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>Lectures: {item.numberOfLectures || 0}</Text>
//                 <Text style={[styles.detailInfo,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>Duration: {Math.floor((item.totalDuration || 0) / 60)} mins</Text>
//               </View>
//               {item.price > 0 && (
//                 <Text style={[styles.detailPrice,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>Price: ${item.price.toFixed(2)}</Text>
//               )}
//               {item.category && (
//                 <Text style={[styles.detailInfo,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>Category: {item.category}</Text>
//               )}
//               {Array.isArray(item.whatYouWillLearn) && item.whatYouWillLearn.length > 0 && (
//                 <View style={styles.learnContainer}>
//                   <Text style={[styles.learnTitle,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>What you'll learn:</Text>
//                   {item.whatYouWillLearn.map((point, idx) => (
//                     <View style={styles.bulletRow} key={idx}>
//                       <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.bulletIcon} />
//                       <Text style={[styles.bulletText,{color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor}]}>{point}</Text>
//                     </View>
//                   ))}
//                 </View>
//               )}
//               {item.instructor && (
//                 <Text style={[styles.detailInfo, { marginTop: 10, color: currentTheme.reelTitleColor, textShadowColor: currentTheme.textShadowColor }]}>
//                   Instructor: {item.instructor}
//                 </Text>
//               )}
//             </ScrollView>
//             <TouchableOpacity
//               style={styles.enrollButton}
//               onPress={() => navigation.navigate('PurchaseScreen', { courseId: item.id })}
//             >
//               <LinearGradient
//                 colors={currentTheme.verticalreelsButtonColor}
//                 style={styles.enrollButtonBg}
//               >
//                 <Text style={[styles.enrollButtonText,{color: currentTheme.buttonTextColor}]}>Enroll Now</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     },
//     [currentIndex, navigation]
//   );

//   // ---------------------------------------------------------------------------
//   // RENDER
//   // ---------------------------------------------------------------------------
//   if (reels.length === 0 && loading) {
//     return (
//       <View style={{ paddingVertical: 20 }}>
//         <Text style={{ color: currentTheme?.cardTextColor || '#000' }}>
//           Loading featured reels...
//         </Text>
//       </View>
//     );
//   }

//   if (reels.length === 0 && !loading) {
//     return null;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Header with Featured Courses title */}
//       <View style={styles.headerContainer}>
//         <Text style={[styles.featuredHeading, { color: currentTheme.cardTextColor }]}>
//           Featured Courses
//         </Text>
//         <View style={[styles.sectionDivider, { backgroundColor: currentTheme.borderColor }]} />
//       </View>

//       {/* Horizontal FlatList limited to 6 reels */}
//       <FlatList
//         data={reels.slice(0, 6)}
//         horizontal
//         keyExtractor={(item) => item.id}
//         renderItem={renderHorizontalItem}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingRight: 15 }}
//       />

//       {/* Full-screen vertical modal */}
//       <Modal visible={modalVisible} animationType="slide" transparent={false}>
//         <View style={styles.modalContainer}>
//           {reels.length > 0 && (
//             <Carousel
//               data={reels}
//               renderItem={renderVerticalItem}
//               vertical
//               width={viewportWidth}
//               height={viewportHeight}
//               defaultIndex={Math.min(currentIndex, reels.length - 1)}
//               onSnapToItem={handleSnapToItem}
//               autoPlay={false}
//               loop={false}
//               mode="default"
//             />
//           )}
//           {loading && hasMore && (
//             <View style={[styles.loadingMoreOverlay, { backgroundColor: currentTheme.textShadowColor }]}>
//               <ActivityIndicator size="large" color="#fff" />
//               <Text style={[styles.loadingText,{color: currentTheme.reelTitleColor}]}>Loading...</Text>
//             </View>
//           )}
//           <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//             <Ionicons name="close-circle" size={36} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// export default memo(FeaturedReel);

// const styles = StyleSheet.create({
//   headerContainer: {
//     paddingHorizontal: 15,
//     marginBottom: 10,
//   },
//   featuredHeading: {
//     marginTop: 10,
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     // backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//     // marginHorizontal: 15,
//   },
//   // Horizontal Reel Card
//   reelCard: {
//     borderRadius: 15,
//     overflow: 'hidden',
//     marginRight: 15,
//     width: 145,
//     height: 220,
//     backgroundColor: '#000',
//     elevation: 6,
//     position: 'relative',
//   },
//   mediaContainer: {
//     flex: 1,
//   },
//   reelMedia: {
//     width: '100%',
//     height: '100%',
//   },
//   reelOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: 60,
//     justifyContent: 'flex-end',
//     borderRadius: 15,
//   },
//   topRightImageContainer: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     overflow: 'hidden',
//     borderWidth: 2,
//     // borderColor: '#fff',
//     zIndex: 5,
//   },
//   topRightImage: {
//     width: '100%',
//     height: '100%',
//   },
//   horizontalInfoOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     zIndex: 10,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 2,
//   },
//   reelTitle: {
//     // color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//     // textShadowColor: 'rgba(0,0,0,0.8)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//     maxWidth: 100,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   statsText: {
//     // color: '#fff',
//     fontSize: 12,
//     marginRight: 8,
//   },
//   // Modal / Vertical Carousel
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 99,
//   },
//   fullReelContainer: {
//     width: viewportWidth,
//     height: viewportHeight,
//     // backgroundColor: '#000',
//   },
//   fullScreenMedia: {
//     width: '100%',
//     height: '100%',
//   },
//   fullOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: viewportHeight * 0.3,
//     justifyContent: 'flex-end',
//   },
//   // Minimalist Detail Overlay
//   detailOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   detailContent: {
//     paddingBottom: 30,
//   },
//   detailTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     // color: '#fff',
//     // textShadowColor: 'rgba(0,0,0,0.6)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailRatingText: {
//     // color: '#FFD700',
//     marginLeft: 4,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   infoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailInfo: {
//     // color: '#ddd',
//     fontSize: 14,
//     marginRight: 12,
//   },
//   detailPrice: {
//     // color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   learnContainer: {
//     marginTop: 10,
//   },
//   learnTitle: {
//     fontWeight: '600',
//     marginBottom: 6,
//     fontSize: 15,
//     // color: '#fff',
//   },
//   bulletRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   bulletIcon: {
//     marginRight: 6,
//   },
//   bulletText: {
//     // color: '#ddd',
//     fontSize: 14,
//     flexShrink: 1,
//   },
//   // Enroll Button Footer
//   enrollButton: {
//     marginTop: 10,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   enrollButtonBg: {
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   enrollButtonText: {
//     // color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   // Loading More Overlay
//   loadingMoreOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     // backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     paddingVertical: 10,
//   },
//   loadingText: {
//     // color: '#fff',
//     marginTop: 4,
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });











// // src/components/FeaturedReel.js
// import React, { useCallback, useState, useEffect, memo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Modal,
//   Dimensions,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import Carousel from 'react-native-reanimated-carousel';

// import { fetchFeaturedReels } from '../services/api';

// const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
// const REELS_LIMIT = 5; // how many reels to load per page
// const PRELOAD_THRESHOLD = 4;

// function FeaturedReel({ currentTheme }) {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   const navigation = useNavigation();

//   // For the modal full-screen display
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // ---------------------------------------------------------------------------
//   // FETCH REELS
//   // ---------------------------------------------------------------------------
//   const loadReels = useCallback(async (reset = false) => {
//     try {
//       setLoading(true);
//       const nextPage = reset ? 1 : page;
//       const response = await fetchFeaturedReels(nextPage, REELS_LIMIT);
//       if (response.success) {
//         const newReels = response.data.map((r) => ({
//           ...r,
//           id: r._id,
//         }));
//         setReels((prev) => {
//           if (reset) return newReels;
//           const existingIds = new Set(prev.map((item) => item.id));
//           const filtered = newReels.filter((item) => !existingIds.has(item.id));
//           return [...prev, ...filtered];
//         });
//         setHasMore(newReels.length >= REELS_LIMIT);
//         setPage(reset ? 2 : nextPage + 1);
//       }
//     } catch (err) {
//       console.warn('Error fetching reels', err);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   useEffect(() => {
//     loadReels(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // HORIZONTAL TEASER (FlatList)
//   // ---------------------------------------------------------------------------
//   const handlePressReel = useCallback(
//     (index) => {
//       if (reels.length === 0) return;
//       const safeIndex = Math.max(0, Math.min(index, reels.length - 1));
//       setCurrentIndex(safeIndex);
//       setModalVisible(true);
//     },
//     [reels]
//   );

//   const renderHorizontalItem = ({ item, index }) => {
//     const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//     const difficulty = item.difficultyLevel || 'Beginner';

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={styles.reelCard}
//         onPress={() => handlePressReel(index)}
//       >
//         <View style={styles.mediaContainer}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted
//               resizeMode="cover"
//               shouldPlay={false}
//               style={styles.reelMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.reelMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.6)']}
//             style={styles.reelOverlay}
//           />
//         </View>
//         <View style={styles.topRightImageContainer}>
//           <Image
//             source={{ uri: item.image }}
//             style={styles.topRightImage}
//             resizeMode="cover"
//           />
//         </View>
//         <View style={styles.horizontalInfoOverlay}>
//           <View style={styles.titleRow}>
//             <Text style={styles.reelTitle} numberOfLines={1}>
//               {item.title}
//             </Text>
//             {item.shortVideoLink && (
//               <Ionicons name="play-circle" size={22} color="#fff" style={{ marginLeft: 5 }} />
//             )}
//           </View>
//           <View style={styles.statsRow}>
//             <Text style={styles.statsText}>
//               <MaterialIcons name="signal-cellular-alt" size={14} color="#f9c74f" />
//               {` ${difficulty}`}
//             </Text>
//             <Text style={styles.statsText}>
//               <Ionicons name="star" size={14} color="#f9c74f" />
//               {` ${ratingText}`}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ---------------------------------------------------------------------------
//   // MODAL & VERTICAL CAROUSEL
//   // ---------------------------------------------------------------------------
//   const handleSnapToItem = useCallback(
//     (index) => {
//       setCurrentIndex(index);
//       // Trigger loading when within PRELOAD_THRESHOLD of the end
//       if (index >= reels.length - PRELOAD_THRESHOLD && hasMore && !loading) {
//         loadReels();
//       }
//     },
//     [reels.length, hasMore, loading, loadReels]
//   );

//   const renderVerticalItem = useCallback(
//     ({ item, index }) => {
//       const isCurrent = index === currentIndex;
//       const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//       const difficulty = item.difficultyLevel || 'Beginner';

//       return (
//         <View style={styles.fullReelContainer}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted={false}
//               resizeMode="contain"
//               shouldPlay={isCurrent}
//               style={styles.fullScreenMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.fullScreenMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.85)']}
//             style={styles.fullOverlay}
//           />
//           {/* Minimalist Detail Overlay */}
//           <View style={styles.detailOverlay}>
//             <ScrollView
//               contentContainerStyle={styles.detailContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <Text style={styles.detailTitle}>{item.title}</Text>
//               <View style={styles.detailRow}>
//                 <View style={styles.ratingContainer}>
//                   <Ionicons name="star" size={16} color="#FFD700" />
//                   <Text style={styles.detailRatingText}>{ratingText}</Text>
//                 </View>
//                 <View style={styles.infoContainer}>
//                   <Text style={styles.detailInfo}>Difficulty: {difficulty}</Text>
//                   <Text style={styles.detailInfo}>Language: {item.language || 'English'}</Text>
//                 </View>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailInfo}>Lectures: {item.numberOfLectures || 0}</Text>
//                 <Text style={styles.detailInfo}>Duration: {Math.floor((item.totalDuration || 0) / 60)} mins</Text>
//               </View>
//               {item.price > 0 && (
//                 <Text style={styles.detailPrice}>Price: ${item.price.toFixed(2)}</Text>
//               )}
//               {item.category && (
//                 <Text style={styles.detailInfo}>Category: {item.category}</Text>
//               )}
//               {Array.isArray(item.whatYouWillLearn) && item.whatYouWillLearn.length > 0 && (
//                 <View style={styles.learnContainer}>
//                   <Text style={styles.learnTitle}>What you'll learn:</Text>
//                   {item.whatYouWillLearn.map((point, idx) => (
//                     <View style={styles.bulletRow} key={idx}>
//                       <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.bulletIcon} />
//                       <Text style={styles.bulletText}>{point}</Text>
//                     </View>
//                   ))}
//                 </View>
//               )}
//               {item.instructor && (
//                 <Text style={[styles.detailInfo, { marginTop: 10 }]}>
//                   Instructor: {item.instructor}
//                 </Text>
//               )}
//             </ScrollView>
//             {/* <TouchableOpacity 
//               style={styles.enrollButton}
//               onPress={() =>
//                 navigation.navigate('PurchaseScreen', { courseId: item.id })
//               }
//             >
//               <Text style={styles.enrollButtonText}>Enroll Now</Text>
//             </TouchableOpacity> */}
//             <TouchableOpacity
//               style={styles.enrollButton}
//               onPress={() => navigation.navigate('PurchaseScreen', { courseId: item.id })}
//             >
//               <LinearGradient
//                 colors={['#F7B733', '#FC4A1A']}
//                 style={styles.enrollButtonBg}
//               >
//                 <Text style={styles.enrollButtonText}>Enroll Now</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </View>
//         </View>
//       );
//     },
//     [currentIndex, navigation]
//   );

//   // ---------------------------------------------------------------------------
//   // RENDER
//   // ---------------------------------------------------------------------------
//   if (reels.length === 0 && loading) {
//     return (
//       <View style={{ paddingVertical: 20 }}>
//         <Text style={{ color: currentTheme?.cardTextColor || '#000' }}>
//           Loading featured reels...
//         </Text>
//       </View>
//     );
//   }

//   if (reels.length === 0 && !loading) {
//     return null;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Header with Featured Courses title */}
//       <View style={styles.headerContainer}>
//         <Text style={[styles.featuredHeading, { color: currentTheme.cardTextColor }]}>
//           Featured Courses
//         </Text>
        
//       <View style={styles.sectionDivider} />
//       </View>

//       {/* Horizontal FlatList limited to 6 reels */}
//       <FlatList
//         data={reels.slice(0, 6)}
//         horizontal
//         keyExtractor={(item) => item.id}
//         renderItem={renderHorizontalItem}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingRight: 15 }}
//       />

//       {/* Full-screen vertical modal */}
//       <Modal visible={modalVisible} animationType="slide" transparent={false}>
//         <View style={styles.modalContainer}>
//           {reels.length > 0 && (
//             <Carousel
//               data={reels}
//               renderItem={renderVerticalItem}
//               vertical
//               width={viewportWidth}
//               height={viewportHeight}
//               defaultIndex={Math.min(currentIndex, reels.length - 1)}
//               onSnapToItem={handleSnapToItem}
//               autoPlay={false}
//               loop={false}
//               mode="default"
//             />
//           )}
//           {loading && hasMore && (
//             <View style={styles.loadingMoreOverlay}>
//               <ActivityIndicator size="large" color="#fff" />
//               <Text style={styles.loadingText}>Loading more reels...</Text>
//             </View>
//           )}
//           <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//             <Ionicons name="close-circle" size={36} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// export default memo(FeaturedReel);

// const styles = StyleSheet.create({
//   headerContainer: {
//     paddingHorizontal: 15,
//     marginBottom: 10,
//   },
//   featuredHeading: {
//     marginTop: 10,
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   // Horizontal Reel Card
//   reelCard: {
//     borderRadius: 15,
//     overflow: 'hidden',
//     marginRight: 15,
//     width: 145,
//     height: 220,
//     backgroundColor: '#000',
//     elevation: 6,
//     position: 'relative',
//   },
//   mediaContainer: {
//     flex: 1,
//   },
//   reelMedia: {
//     width: '100%',
//     height: '100%',
//   },
//   reelOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: 60,
//     justifyContent: 'flex-end',
//     borderRadius: 15,
//   },
//   topRightImageContainer: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#fff',
//     zIndex: 5,
//   },
//   topRightImage: {
//     width: '100%',
//     height: '100%',
//   },
//   horizontalInfoOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     zIndex: 10,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 2,
//   },
//   reelTitle: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//     textShadowColor: 'rgba(0,0,0,0.8)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//     maxWidth: 100,
//   },
//   sectionDivider: {
//     height: 2,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   statsText: {
//     color: '#fff',
//     fontSize: 12,
//     marginRight: 8,
//   },
//   // Modal / Vertical Carousel
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 99,
//   },
//   fullReelContainer: {
//     width: viewportWidth,
//     height: viewportHeight,
//     backgroundColor: '#000',
//   },
//   fullScreenMedia: {
//     width: '100%',
//     height: '100%',
//   },
//   fullOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: viewportHeight * 0.3,
//     justifyContent: 'flex-end',
//   },
//   // Minimalist Detail Overlay (no card bg)
//   detailOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   detailContent: {
//     paddingBottom: 30,
//   },
//   detailTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#fff',
//     textShadowColor: 'rgba(0,0,0,0.6)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailRatingText: {
//     color: '#FFD700',
//     marginLeft: 4,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   infoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailInfo: {
//     color: '#ddd',
//     fontSize: 14,
//     marginRight: 12,
//   },
//   detailPrice: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   learnContainer: {
//     marginTop: 10,
//   },
//   learnTitle: {
//     fontWeight: '600',
//     marginBottom: 6,
//     fontSize: 15,
//     color: '#fff',
//   },
//   bulletRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   bulletIcon: {
//     marginRight: 6,
//   },
//   bulletText: {
//     color: '#ddd',
//     fontSize: 14,
//     flexShrink: 1,
//   },
//   // Enroll Button Footer
//   // enrollButton: {
//   //   backgroundColor: '#4CAF50',
//   //   paddingVertical: 12,
//   //   borderRadius: 8,
//   //   alignItems: 'center',
//   //   marginTop: 10,
//   // },
//   // enrollButtonText: {
//   //   color: '#fff',
//   //   fontWeight: '600',
//   //   fontSize: 16,
//   // },
//   enrollButton: {
//     marginTop: 10,
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   enrollButtonBg: {
//     paddingVertical: 12,
//     alignItems: 'center',
//     borderRadius: 8,
//   },
//   enrollButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//     textTransform: 'uppercase',
//     letterSpacing: 0.5,
//   },
//   // Enhanced Loading More Overlay
//   loadingMoreOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     paddingVertical: 10,
//   },
//   loadingText: {
//     color: '#fff',
//     marginTop: 4,
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });








// // src/components/FeaturedReel.js
// import React, { useCallback, useState, useEffect, memo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Image,
//   Modal,
//   Dimensions,
//   StyleSheet,
//   ActivityIndicator,
//   FlatList,
//   ScrollView,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import Carousel from 'react-native-reanimated-carousel';

// import { fetchFeaturedReels } from '../services/api';

// const { width: viewportWidth, height: viewportHeight } = Dimensions.get('window');
// const REELS_LIMIT = 5; // how many reels to load per page

// function FeaturedReel({ currentTheme }) {
//   const [reels, setReels] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   const navigation = useNavigation();

//   // For the modal full-screen display
//   const [modalVisible, setModalVisible] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // ---------------------------------------------------------------------------
//   // FETCH REELS
//   // ---------------------------------------------------------------------------
//   const loadReels = useCallback(async (reset = false) => {
//     try {
//       setLoading(true);
//       const nextPage = reset ? 1 : page;
//       const response = await fetchFeaturedReels(nextPage, REELS_LIMIT);
//       if (response.success) {
//         const newReels = response.data.map((r) => ({
//           ...r,
//           id: r._id,
//         }));
//         setReels((prev) => {
//           if (reset) return newReels;
//           const existingIds = new Set(prev.map((item) => item.id));
//           const filtered = newReels.filter((item) => !existingIds.has(item.id));
//           return [...prev, ...filtered];
//         });
//         setHasMore(newReels.length >= REELS_LIMIT);
//         setPage(reset ? 2 : nextPage + 1);
//       }
//     } catch (err) {
//       console.warn('Error fetching reels', err);
//       setHasMore(false);
//     } finally {
//       setLoading(false);
//     }
//   }, [page]);

//   useEffect(() => {
//     loadReels(true);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // HORIZONTAL TEASER (FlatList)
//   // ---------------------------------------------------------------------------
//   const handlePressReel = useCallback(
//     (index) => {
//       if (reels.length === 0) return;
//       const safeIndex = Math.max(0, Math.min(index, reels.length - 1));
//       setCurrentIndex(safeIndex);
//       setModalVisible(true);
//     },
//     [reels]
//   );

//   const renderHorizontalItem = ({ item, index }) => {
//     const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//     const difficulty = item.difficultyLevel || 'Beginner';

//     return (
//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={styles.reelCard}
//         onPress={() => handlePressReel(index)}
//       >
//         <View style={styles.mediaContainer}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted
//               resizeMode="cover"
//               shouldPlay={false}
//               style={styles.reelMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.reelMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.6)']}
//             style={styles.reelOverlay}
//           />
//         </View>
//         <View style={styles.topRightImageContainer}>
//           <Image
//             source={{ uri: item.image }}
//             style={styles.topRightImage}
//             resizeMode="cover"
//           />
//         </View>
//         <View style={styles.horizontalInfoOverlay}>
//           <View style={styles.titleRow}>
//             <Text style={styles.reelTitle} numberOfLines={1}>
//               {item.title}
//             </Text>
//             {item.shortVideoLink && (
//               <Ionicons name="play-circle" size={22} color="#fff" style={{ marginLeft: 5 }} />
//             )}
//           </View>
//           <View style={styles.statsRow}>
//             <Text style={styles.statsText}>
//               <MaterialIcons name="signal-cellular-alt" size={14} color="#f9c74f" />
//               {` ${difficulty}`}
//             </Text>
//             <Text style={styles.statsText}>
//               <Ionicons name="star" size={14} color="#f9c74f" />
//               {` ${ratingText}`}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };

//   // ---------------------------------------------------------------------------
//   // MODAL & VERTICAL CAROUSEL
//   // ---------------------------------------------------------------------------
//   // const handleSnapToItem = useCallback(
//   //   (index) => {
//   //     setCurrentIndex(index);
//   //     if (index >= reels.length - 1 && hasMore && !loading) {
//   //       loadReels();
//   //     }
//   //   },
//   //   [reels.length, hasMore, loading, loadReels]
//   // );
// // Add a preload threshold constant
// const PRELOAD_THRESHOLD = 4;

// const handleSnapToItem = useCallback(
//   (index) => {
//     setCurrentIndex(index);
//     // Trigger loading when within PRELOAD_THRESHOLD of the end
//     if (index >= reels.length - PRELOAD_THRESHOLD && hasMore && !loading) {
//       loadReels();
//     }
//   },
//   [reels.length, hasMore, loading, loadReels]
// );

//   const renderVerticalItem = useCallback(
//     ({ item, index }) => {
//       const isCurrent = index === currentIndex;
//       const ratingText = item.rating > 0 ? `${item.rating.toFixed(1)}` : 'N/A';
//       const difficulty = item.difficultyLevel || 'Beginner';

//       return (
//         <View style={styles.fullReelContainer}>
//           {item.shortVideoLink ? (
//             <Video
//               source={{ uri: item.shortVideoLink }}
//               rate={1.0}
//               volume={1.0}
//               isMuted={false}
//               resizeMode="contain"
//               shouldPlay={isCurrent}
//               style={styles.fullScreenMedia}
//             />
//           ) : (
//             <Image
//               source={{ uri: item.image }}
//               style={styles.fullScreenMedia}
//               resizeMode="cover"
//             />
//           )}
//           <LinearGradient
//             colors={['transparent', 'rgba(0,0,0,0.85)']}
//             style={styles.fullOverlay}
//           />
//           {/* Minimalist Detail Overlay */}
//           <View style={styles.detailOverlay}>
//             <ScrollView
//               contentContainerStyle={styles.detailContent}
//               showsVerticalScrollIndicator={false}
//             >
//               <Text style={styles.detailTitle}>{item.title}</Text>
//               <View style={styles.detailRow}>
//                 <View style={styles.ratingContainer}>
//                   <Ionicons name="star" size={16} color="#FFD700" />
//                   <Text style={styles.detailRatingText}>{ratingText}</Text>
//                 </View>
//                 <View style={styles.infoContainer}>
//                   <Text style={styles.detailInfo}>Difficulty: {difficulty}</Text>
//                   <Text style={styles.detailInfo}>Language: {item.language || 'English'}</Text>
//                 </View>
//               </View>
//               <View style={styles.detailRow}>
//                 <Text style={styles.detailInfo}>Lectures: {item.numberOfLectures || 0}</Text>
//                 <Text style={styles.detailInfo}>Duration: {Math.floor((item.totalDuration || 0) / 60)} mins</Text>
//               </View>
//               {item.price > 0 && (
//                 <Text style={styles.detailPrice}>Price: ${item.price.toFixed(2)}</Text>
//               )}
//               {item.category && (
//                 <Text style={styles.detailInfo}>Category: {item.category}</Text>
//               )}
//               {Array.isArray(item.whatYouWillLearn) && item.whatYouWillLearn.length > 0 && (
//                 <View style={styles.learnContainer}>
//                   <Text style={styles.learnTitle}>What you'll learn:</Text>
//                   {item.whatYouWillLearn.map((point, idx) => (
//                     <View style={styles.bulletRow} key={idx}>
//                       <Ionicons name="checkmark-circle" size={16} color="#4CAF50" style={styles.bulletIcon} />
//                       <Text style={styles.bulletText}>{point}</Text>
//                     </View>
//                   ))}
//                 </View>
//               )}
//               {item.instructor && (
//                 <Text style={[styles.detailInfo, { marginTop: 10 }]}>
//                   Instructor: {item.instructor}
//                 </Text>
//               )}
//             </ScrollView>
//             {/* <TouchableOpacity style={styles.enrollButton}>
//               <Text style={styles.enrollButtonText}>Enroll Now</Text>
//             </TouchableOpacity> */}
//           <TouchableOpacity 
//             style={styles.enrollButton}
//             onPress={() =>
//               // navigation.navigate('CourseDetailScreen', { courseId: item.id })
//               navigation.navigate('PurchaseScreen', { courseId: item.id })
//             }
//           >
//             <Text style={styles.enrollButtonText}>Enroll Now</Text>
//           </TouchableOpacity>
//           </View>
//         </View>
//       );
//     },
//     [currentIndex]
//   );

//   // ---------------------------------------------------------------------------
//   // RENDER
//   // ---------------------------------------------------------------------------
//   if (reels.length === 0 && loading) {
//     return (
//       <View style={{ paddingVertical: 20 }}>
//         <Text style={{ color: currentTheme?.cardTextColor || '#000' }}>
//           Loading featured reels...
//         </Text>
//       </View>
//     );
//   }

//   if (reels.length === 0 && !loading) {
//     return null;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {/* Horizontal FlatList limited to 6 reels */}
//       <FlatList
//         data={reels.slice(0, 6)}
//         horizontal
//         keyExtractor={(item) => item.id}
//         renderItem={renderHorizontalItem}
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ paddingRight: 15 }}
//       />

//       {/* Full-screen vertical modal */}
//       <Modal visible={modalVisible} animationType="slide" transparent={false}>
//         <View style={styles.modalContainer}>
//           {reels.length > 0 && (
//             <Carousel
//               data={reels}
//               renderItem={renderVerticalItem}
//               vertical
//               width={viewportWidth}
//               height={viewportHeight}
//               defaultIndex={Math.min(currentIndex, reels.length - 1)}
//               onSnapToItem={handleSnapToItem}
//               autoPlay={false}
//               loop={false}
//               mode="default"
//             />
//           )}
//           {loading && hasMore && (
//             <View style={styles.loadingMoreOverlay}>
//               <ActivityIndicator size="large" color="#fff" />
//               <Text style={styles.loadingText}>Loading more reels...</Text>
//             </View>
//           )}
//           <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
//             <Ionicons name="close-circle" size={36} color="#fff" />
//           </TouchableOpacity>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// export default memo(FeaturedReel);

// const styles = StyleSheet.create({
//   // Horizontal Reel Card
//   reelCard: {
//     borderRadius: 15,
//     overflow: 'hidden',
//     marginRight: 15,
//     width: 145,
//     height: 220,
//     backgroundColor: '#000',
//     elevation: 6,
//     position: 'relative',
//   },
//   mediaContainer: {
//     flex: 1,
//   },
//   reelMedia: {
//     width: '100%',
//     height: '100%',
//   },
//   reelOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: 60,
//     justifyContent: 'flex-end',
//     borderRadius: 15,
//   },
//   topRightImageContainer: {
//     position: 'absolute',
//     top: 6,
//     right: 6,
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#fff',
//     zIndex: 5,
//   },
//   topRightImage: {
//     width: '100%',
//     height: '100%',
//   },
//   horizontalInfoOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 8,
//     paddingVertical: 6,
//     zIndex: 10,
//   },
//   titleRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 2,
//   },
//   reelTitle: {
//     color: '#fff',
//     fontSize: 15,
//     fontWeight: '700',
//     textShadowColor: 'rgba(0,0,0,0.8)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//     maxWidth: 100,
//   },
//   statsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   statsText: {
//     color: '#fff',
//     fontSize: 12,
//     marginRight: 8,
//   },

//   // Modal / Vertical Carousel
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#000',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: 40,
//     right: 20,
//     zIndex: 99,
//   },
//   fullReelContainer: {
//     width: viewportWidth,
//     height: viewportHeight,
//     backgroundColor: '#000',
//   },
//   fullScreenMedia: {
//     width: '100%',
//     height: '100%',
//   },
//   fullOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: viewportHeight * 0.3,
//     justifyContent: 'flex-end',
//   },
//   // Minimalist Detail Overlay (no card bg)
//   detailOverlay: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//   },
//   detailContent: {
//     paddingBottom: 30, // ensures content isn't hidden
//   },
//   detailTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 8,
//     color: '#fff',
//     textShadowColor: 'rgba(0,0,0,0.6)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailRatingText: {
//     color: '#FFD700',
//     marginLeft: 4,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   infoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   detailInfo: {
//     color: '#ddd',
//     fontSize: 14,
//     marginRight: 12,
//   },
//   detailPrice: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   learnContainer: {
//     marginTop: 10,
//   },
//   learnTitle: {
//     fontWeight: '600',
//     marginBottom: 6,
//     fontSize: 15,
//     color: '#fff',
//   },
//   bulletRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 4,
//   },
//   bulletIcon: {
//     marginRight: 6,
//   },
//   bulletText: {
//     color: '#ddd',
//     fontSize: 14,
//     flexShrink: 1,
//   },
//   // Enroll Button Footer
//   enrollButton: {
//     backgroundColor: '#4CAF50',
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   enrollButtonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },

//   // Enhanced Loading More Overlay
//   loadingMoreOverlay: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     paddingVertical: 10,
//   },
//   loadingText: {
//     color: '#fff',
//     marginTop: 4,
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });




