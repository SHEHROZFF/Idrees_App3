// src/screens/CourseDetailScreen.js

import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import ReviewPopup from '../components/ReviewPopup';

// Redux
import { useDispatch } from 'react-redux';
import { fetchCourseByIdThunk } from '../store/slices/courseSlice';

const CourseDetailScreen = () => {
  const route = useRoute();
  const { courseId } = route.params;
  const navigation = useNavigation();

  // For SafeArea and device dims
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // 1) Define baseWidth, scaleFactor, and scale
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // If you want to keep the same logic for the hero height:
  const headerHeight = useMemo(() => {
    if (width < 360) return scale(180);
    else if (width < 600) return scale(220);
    else return scale(300);
  }, [width, scale]);

  // If you want a hero width slightly smaller than device:
  const headerWidth = width < 480 ? width * 0.97 : width;

  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  // 2) We'll define scaled styles with useMemo
  const styles = useMemo(() => createStyles({ scale, currentTheme, width, height, insets }), [
    scaleFactor,
    currentTheme,
    width,
    height,
    insets,
  ]);

  // Local states
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  const [isReviewPopupVisible, setReviewPopupVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');

  const [selectedVideo, setSelectedVideo] = useState(null);
  const modalVideoRef = useRef(null);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);

  const dispatch = useDispatch();

  // Load the course details
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const result = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
        if (result.success && result.data) {
          setCourse(result.data);
          setError(null);
        } else {
          setError(result.message || 'Failed to load course.');
        }
      } catch (err) {
        setError(err.message || 'Failed to load course.');
      } finally {
        setLoading(false);
      }
    };
    loadCourse();
  }, [courseId, dispatch]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentTheme.primaryColor} />
        <Text style={[styles.loadingText, { color: currentTheme.textColor }]}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: currentTheme.errorTextColor }}>{error}</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: currentTheme.textColor }}>Course not found.</Text>
      </View>
    );
  }

  // Destructure course fields
  const {
    title,
    rating,
    reviews,
    description,
    image,
    videos,
    shortVideoLink,
    difficultyLevel,
    language,
    topics,
    totalDuration,
    numberOfLectures,
    category,
    tags,
    requirements,
    whatYouWillLearn,
    price,
    salePrice,
    saleEnabled,
  } = course;

  const mainVideoUrl =
    shortVideoLink || (videos && videos.length > 0 && videos[0].url);

  const formatCourseDuration = (mins) => {
    const hrs = Math.floor(mins / 60);
    const remaining = mins % 60;
    return hrs > 0 ? `${hrs}h ${remaining}m` : `${mins}m`;
  };

  const formatVideoDuration = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return mins > 0 ? `${mins}m ${remainingSec}s` : `${sec}s`;
  };

  // Enroll button
  const handleEnroll = () => {
    setIsPlaying(false);
    const finalPrice = saleEnabled && salePrice < price ? salePrice : price;
    if (finalPrice && finalPrice > 0) {
      navigation.navigate('PurchaseScreen', { courseId: course._id });
    } else {
      console.log('Enrolling in free course:', course._id);
    }
  };

  // Videos
  const handleVideoPress = (video, index) => {
    if (index === 0) {
      setSelectedVideo(video);
      setModalIsPlaying(true);
      setVideoEnded(false);
    }
  };

  const toggleModalPlayback = async () => {
    if (modalVideoRef.current) {
      const status = await modalVideoRef.current.getStatusAsync();
      if (status.isPlaying) {
        modalVideoRef.current.pauseAsync();
        setModalIsPlaying(false);
      } else {
        modalVideoRef.current.playAsync();
        setModalIsPlaying(true);
      }
    }
  };

  const restartVideo = async () => {
    if (modalVideoRef.current) {
      await modalVideoRef.current.replayAsync();
      setModalIsPlaying(true);
      setVideoEnded(false);
    }
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setCurrentTime(status.positionMillis / 1000);
      setVideoDuration(status.durationMillis / 1000);
      if (status.didJustFinish) {
        setVideoEnded(true);
        setModalIsPlaying(false);
      }
    }
  };

  const progressPercentage =
    videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

  let discountPercentage = 0;
  if (saleEnabled && price > 0 && salePrice < price) {
    discountPercentage = Math.round(((price - salePrice) / price) * 100);
  }

  return (
    <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />

      {/* Enhanced Hero Header */}
      <LinearGradient
        colors={currentTheme.headerBackground}
        style={styles.header}
        start={[0, 0]}
        end={[0, 1]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={styles.iconSizeMedium} color={currentTheme.headerTextColor} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text
            style={[
              styles.headerTitle,
              { color: currentTheme.headerTextColor, width: width * 0.65 },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          {category && (
            <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]} numberOfLines={1}>
              {category} {language && `- ${language}`}
            </Text>
          )}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Media Section */}
        {mainVideoUrl ? (
          <View style={[styles.mediaContainer, { width: headerWidth, height: headerHeight }]}>
            <Video
              source={{ uri: mainVideoUrl }}
              style={styles.media}
              resizeMode="cover"
              shouldPlay={isPlaying}
              isLooping
              isMuted={isMuted}
            />
            <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent']} style={styles.mediaGradient} />
            <View style={styles.videoControls}>
              <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.controlButton}>
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={styles.iconSizeMedium}
                  color="#fff"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.controlButton}>
                <Ionicons
                  name={isMuted ? 'volume-mute' : 'volume-high'}
                  size={styles.iconSizeMedium}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={[styles.mediaContainer, { width: headerWidth, height: headerHeight }]}>
            <Image source={{ uri: image }} style={styles.media} resizeMode="cover" />
            <LinearGradient colors={['rgba(0,0,0,0.3)', 'transparent']} style={styles.mediaGradient} />
          </View>
        )}

        {/* Enhanced Tabs */}
        <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
          <TouchableOpacity
            style={[
              styles.enhancedTabButton,
              selectedTab === 'description' && { backgroundColor: currentTheme.primaryColor },
            ]}
            onPress={() => setSelectedTab('description')}
          >
            <Text
              style={[
                styles.enhancedTabText,
                { color: selectedTab === 'description' ? '#fff' : currentTheme.textColor },
              ]}
            >
              Description
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.enhancedTabButton,
              selectedTab === 'videos' && { backgroundColor: currentTheme.primaryColor },
            ]}
            onPress={() => setSelectedTab('videos')}
          >
            <Text
              style={[
                styles.enhancedTabText,
                { color: selectedTab === 'videos' ? '#fff' : currentTheme.textColor },
              ]}
            >
              Lessons
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'description' ? (
          <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.title, { color: currentTheme.cardTextColor }]}>{title}</Text>
            {/* Rating & Reviews */}
            <View style={styles.ratingContainer}>
              {Array.from({ length: 5 }, (_, index) => {
                const filled = index < Math.floor(rating);
                return (
                  <Ionicons
                    key={index}
                    name={filled ? 'star' : 'star-outline'}
                    size={styles.starIconSize}
                    color={filled ? '#FFD700' : '#FFD70099'}
                    style={styles.starIcon}
                  />
                );
              })}
              <TouchableOpacity onPress={() => setReviewPopupVisible(true)}>
                <Text style={[styles.ratingText, { color: currentTheme.cardTextColor }]}>
                  ({reviews || 0} reviews)
                </Text>
              </TouchableOpacity>
            </View>
            {/* Description */}
            {description?.length > 0 && (
              <Text style={[styles.description, { color: currentTheme.textColor }]}>
                {description}
              </Text>
            )}
            {/* Course Details Card */}
            <View style={[styles.card, styles.detailsCard, { backgroundColor: currentTheme.backgroundColor }]}>
              <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
                Course Details
              </Text>
              {difficultyLevel && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Difficulty:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {difficultyLevel}
                  </Text>
                </View>
              )}
              {language && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Language:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {language}
                  </Text>
                </View>
              )}
              {category && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Category:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {category}
                  </Text>
                </View>
              )}
              {totalDuration > 0 && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Total Duration:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {formatCourseDuration(totalDuration)}
                  </Text>
                </View>
              )}
              {numberOfLectures > 0 && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Lectures:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {numberOfLectures}
                  </Text>
                </View>
              )}
              {tags && tags.length > 0 && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Tags:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {tags.join(', ')}
                  </Text>
                </View>
              )}
            </View>
            {/* Requirements Card */}
            {!!requirements?.length && (
              <View style={[styles.card, styles.detailsCard, { backgroundColor: currentTheme.backgroundColor }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
                  Requirements / Prerequisites
                </Text>
                {requirements.map((req, idx) => (
                  <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
                    • {req}
                  </Text>
                ))}
              </View>
            )}
            {/* What You'll Learn Card */}
            {!!whatYouWillLearn?.length && (
              <View style={[styles.card, styles.detailsCard, { backgroundColor: currentTheme.backgroundColor }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
                  What You'll Learn
                </Text>
                {whatYouWillLearn.map((item, idx) => (
                  <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
                    ✓ {item}
                  </Text>
                ))}
              </View>
            )}
            {/* Topics Covered Card */}
            {!!topics?.length && (
              <View style={[styles.card, styles.detailsCard, { backgroundColor: currentTheme.backgroundColor }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
                  Topics Covered
                </Text>
                {topics.map((topic, idx) => (
                  <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
                    - {topic}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ) : (
          // Videos Tab Content
          <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: scale(10) }]}>
              Course Curriculum
            </Text>
            {videos && videos.length > 0 ? (
              videos.map((video, i) => {
                const isUnlocked = i === 0;
                return (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={isUnlocked ? 0.8 : 1}
                    onPress={() => isUnlocked && handleVideoPress(video, i)}
                    style={[
                      styles.card,
                      styles.videoCard,
                      isUnlocked ? styles.unlockedVideoCard : styles.lockedVideoCard,
                      { backgroundColor: currentTheme.backgroundColor, borderColor: currentTheme.borderColor },
                    ]}
                  >
                    <Image source={{ uri: video.thumbnail || image }} style={styles.videoThumbnail} resizeMode="cover" />
                    <View style={styles.videoInfo}>
                      <Text style={[styles.videoTitle, { color: currentTheme.textColor }]}>
                        {i + 1}. {video.title}
                      </Text>
                      <Text style={[styles.videoDuration, { color: currentTheme.textColor }]}>
                        {formatVideoDuration(video.duration || 0)}
                      </Text>
                    </View>
                    <View style={styles.playIconContainer}>
                      <Ionicons
                        name="play"
                        size={styles.iconSizeMedium}
                        color={isUnlocked ? currentTheme.primaryColor : '#ccc'}
                      />
                    </View>
                    {!isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <Ionicons name="lock-closed" size={styles.iconSizeLarge} color="#fff" />
                        <Text style={[styles.lockText, { color: currentTheme.textColor }]}>
                          Locked
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <Text style={{ color: currentTheme.textColor }}>No videos available.</Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Fixed Footer */}
      <View style={styles.footer}>
        {/* Price Section */}
        <View style={styles.priceSection}>
          <TouchableOpacity
            style={[styles.footerPriceButton, { borderColor: currentTheme.primaryColor, backgroundColor: currentTheme.backgroundColor }]}
            disabled={true}
          >
            {saleEnabled && salePrice < price ? (
              <Text
                style={[
                  styles.footerPriceText,
                  {
                    color: currentTheme.textColor,
                    textDecorationLine: 'line-through',
                    textDecorationStyle: 'solid',
                  },
                ]}
              >
                ${price.toFixed(2)}
              </Text>
            ) : (
              <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
                {price && price > 0 ? `$${price.toFixed(2)}` : 'Free'}
              </Text>
            )}
          </TouchableOpacity>
          {/* Sale Tag */}
          {saleEnabled && price > 0 && salePrice < price && (
            <View style={[styles.saleTagContainer, { backgroundColor: currentTheme.saleTagBackgroundColor }]}>
              <View style={[styles.saleTagHole, { backgroundColor: currentTheme.saleTagBackgroundColor, borderColor: currentTheme.borderColor }]} />
              <Text style={[styles.saleTagPrice, { color: currentTheme.buttonTextColor }]}>
                ${salePrice.toFixed(2)}
              </Text>
              {discountPercentage > 0 && (
                <Text style={[styles.saleTagDiscount, { color: currentTheme.buttonTextColor }]}>
                  {discountPercentage}% OFF
                </Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.footerEnrollButton, { backgroundColor: currentTheme.primaryColor }]}
          onPress={handleEnroll}
        >
          <Text style={[styles.footerEnrollText, { color: currentTheme.buttonTextColor }]}>
            Enroll Now
          </Text>
        </TouchableOpacity>
      </View>

      {/* Video Popup Modal */}
      <Modal
        visible={!!selectedVideo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedVideo(null)}
      >
        <View style={styles.videoModalContainer}>
          <View style={styles.videoModalContent}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedVideo(null)}>
              <Ionicons name="close" size={styles.iconSizeLarge} color="#fff" />
            </TouchableOpacity>
            {selectedVideo && (
              <View style={styles.modalVideoContainer}>
                <Video
                  ref={modalVideoRef}
                  source={{ uri: selectedVideo.url }}
                  style={styles.modalVideo}
                  resizeMode="cover"
                  shouldPlay={modalIsPlaying}
                  isLooping={false}
                  useNativeControls={false}
                  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />
                {/* Custom Controller Overlay */}
                <View style={styles.modalControls}>
                  {videoEnded ? (
                    <TouchableOpacity onPress={restartVideo} style={styles.modalControlButton}>
                      <Ionicons name="refresh" size={styles.iconSizeXL} color="#fff" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={toggleModalPlayback} style={styles.modalControlButton}>
                      <Ionicons name={modalIsPlaying ? 'pause' : 'play'} size={styles.iconSizeXL} color="#fff" />
                    </TouchableOpacity>
                  )}
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
                  </View>
                  <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                      {Math.floor(currentTime)} / {Math.floor(videoDuration)}s
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (modalVideoRef.current) {
                        modalVideoRef.current.setIsMutedAsync(!isMuted);
                        setIsMuted(!isMuted);
                      }
                    }}
                    style={styles.modalControlButton}
                  >
                    <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={styles.iconSizeXL} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Review Popup Modal */}
      <Modal
        visible={isReviewPopupVisible}
        animationType="slide"
        onRequestClose={() => setReviewPopupVisible(false)}
        transparent={true}
      >
        <ReviewPopup
          closePopup={() => setReviewPopupVisible(false)}
          reviewableId={course._id}
          reviewableType="Course"
        />
      </Modal>
    </View>
  );
};

export default CourseDetailScreen;

/** ------------------------------------------------------------------
 *  CREATE STYLES (SCALED)
 * ----------------------------------------------------------------- */
const createStyles = ({ scale, currentTheme, width, height, insets }) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: scale(10),
      fontSize: scale(16),
    },
    header: {
      width: '100%',
      paddingVertical: scale(10),
      paddingHorizontal: scale(20),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomLeftRadius: scale(35),
      borderBottomRightRadius: scale(35),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(4) },
      shadowOpacity: 0.25,
      shadowRadius: scale(6),
      elevation: scale(6),
      marginBottom: scale(8),
      paddingTop: insets.top + scale(10),
    },
    backButton: {
      position: 'absolute',
      left: scale(20),
      padding: scale(10),
      zIndex: 10,
      top: scale(10) + insets.top,
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: scale(24),
      fontWeight: '700',
      textAlign: 'center',
    },
    headerSubtitle: {
      fontSize: scale(15),
      fontWeight: '400',
      marginTop: scale(4),
      textAlign: 'center',
    },
    scrollContent: {
      paddingHorizontal: scale(20),
      paddingBottom: scale(140),
    },

    // Media
    mediaContainer: {
      backgroundColor: '#000',
      borderRadius: scale(20),
      overflow: 'hidden',
      marginBottom: scale(24),
      alignSelf: 'center',
    },
    media: {
      width: '100%',
      height: '100%',
    },
    mediaGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: scale(100),
    },
    videoControls: {
      position: 'absolute',
      bottom: scale(20),
      right: scale(20),
      flexDirection: 'row',
      alignItems: 'center',
    },
    controlButton: {
      backgroundColor: 'rgba(0,0,0,0.65)',
      padding: scale(12),
      borderRadius: scale(35),
      marginLeft: scale(12),
    },

    // Enhanced Tabs
    enhancedTabContainer: {
      flexDirection: 'row',
      borderRadius: scale(25),
      marginHorizontal: scale(20),
      marginBottom: scale(20),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.1,
      shadowRadius: scale(4),
      elevation: scale(2),
    },
    enhancedTabButton: {
      flex: 1,
      paddingVertical: scale(10),
      alignItems: 'center',
      borderRadius: scale(25),
    },
    enhancedTabText: {
      fontSize: scale(16),
      fontWeight: '600',
    },

    // Details Container
    detailsContainer: {
      borderRadius: scale(30),
      padding: scale(20),
      marginHorizontal: scale(-20),
      marginBottom: scale(24),
    },
    card: {
      borderRadius: scale(15),
      padding: scale(15),
      marginVertical: scale(10),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.1,
      shadowRadius: scale(4),
      elevation: scale(3),
    },
    detailsCard: {},
    title: {
      fontSize: scale(28),
      fontWeight: '700',
      marginBottom: scale(12),
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: scale(12),
    },
    starIcon: {
      marginRight: scale(3),
    },
    starIconSize: scale(22),
    ratingText: {
      marginLeft: scale(10),
      fontSize: scale(15),
    },
    description: {
      fontSize: scale(17),
      lineHeight: scale(26),
      marginBottom: scale(16),
    },
    sectionTitle: {
      fontSize: scale(20),
      fontWeight: '700',
      marginBottom: scale(12),
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    detailGroup: {
      flexDirection: 'row',
      marginBottom: scale(8),
    },
    detailLabel: {
      fontWeight: '600',
      width: scale(140),
      marginRight: scale(6),
    },
    detailValue: {
      flex: 1,
    },
    bulletItem: {
      fontSize: scale(16),
      marginLeft: scale(12),
      marginBottom: scale(6),
    },

    // Videos Tab
    videoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: scale(10),
    },
    unlockedVideoCard: {
      borderWidth: scale(2),
    },
    lockedVideoCard: {},
    videoThumbnail: {
      width: scale(120),
      height: scale(80),
      borderRadius: scale(10),
    },
    videoInfo: {
      flex: 1,
      paddingLeft: scale(10),
    },
    videoTitle: {
      fontSize: scale(18),
      fontWeight: '600',
      marginBottom: scale(4),
    },
    videoDuration: {
      fontSize: scale(16),
      color: '#666',
    },
    playIconContainer: {
      position: 'absolute',
      right: scale(20),
      top: scale(30),
      backgroundColor: 'rgba(0,0,0,0.1)',
      padding: scale(10),
      borderRadius: scale(20),
    },
    lockOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: scale(15),
    },
    lockText: {
      fontSize: scale(16),
      fontWeight: '600',
      marginTop: scale(4),
    },

    // Footer
    footer: {
      position: 'absolute',
      bottom: scale(100),
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingVertical: scale(10),
      paddingHorizontal: scale(15),
      alignItems: 'center',
    },
    priceSection: {
      position: 'relative',
      marginRight: scale(15),
      justifyContent: 'center',
    },
    footerPriceButton: {
      width: scale(80),
      height: scale(50),
      borderRadius: scale(20),
      borderWidth: scale(1.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerPriceText: {
      fontSize: scale(16),
      fontWeight: '600',
    },
    saleTagContainer: {
      position: 'absolute',
      top: scale(-40),
      right: scale(-40),
      borderRadius: scale(10),
      paddingVertical: scale(6),
      paddingHorizontal: scale(12),
      minWidth: scale(70),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: scale(1), height: scale(2) },
      shadowOpacity: 0.25,
      shadowRadius: scale(3),
      elevation: scale(4),
      zIndex: 10,
      transform: [{ rotate: '-45deg' }],
    },
    saleTagHole: {
      position: 'absolute',
      left: scale(-8),
      top: '50%',
      width: scale(16),
      height: scale(16),
      borderRadius: scale(8),
      borderWidth: scale(2),
      transform: [{ translateY: -8 }],
    },
    saleTagPrice: {
      fontSize: scale(14),
      fontWeight: '700',
    },
    saleTagDiscount: {
      fontSize: scale(12),
      fontWeight: '600',
      marginTop: scale(2),
    },
    footerEnrollButton: {
      flex: 1,
      height: scale(50),
      borderRadius: scale(20),
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerEnrollText: {
      fontSize: scale(18),
      fontWeight: '600',
    },

    // Video Modal
    videoModalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.9)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoModalContent: {
      width: '90%',
      height: '60%',
      backgroundColor: '#000',
      borderRadius: scale(15),
      overflow: 'hidden',
    },
    modalCloseButton: {
      position: 'absolute',
      top: scale(10),
      right: scale(10),
      zIndex: 1,
    },
    modalVideoContainer: { flex: 1 },
    modalVideo: { width: '100%', height: '100%' },
    modalControls: {
      position: 'absolute',
      bottom: scale(10),
      left: scale(10),
      right: scale(10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalControlButton: {
      backgroundColor: 'rgba(0,0,0,0.7)',
      padding: scale(5),
      borderRadius: scale(25),
      marginLeft: scale(10),
    },
    iconSizeMedium: scale(24),
    iconSizeLarge: scale(28),
    iconSizeXL: scale(30),
    progressContainer: {
      flex: 1,
      height: scale(4),
      backgroundColor: '#444',
      borderRadius: scale(2),
      marginHorizontal: scale(10),
    },
    progressBar: {
      height: scale(4),
      backgroundColor: '#fff',
      borderRadius: scale(2),
    },
    timeContainer: {},
    timeText: {
      color: '#fff',
      fontSize: scale(14),
    },
  });











// // src/screens/CourseDetailScreen.js

// import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   Modal,
//   Platform,
//   useWindowDimensions
// } from 'react-native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import ReviewPopup from '../components/ReviewPopup';

// // 1) Import useDispatch and the relevant Redux thunk
// import { useDispatch } from 'react-redux';
// import { fetchCourseByIdThunk } from '../store/slices/courseSlice';

// // const { width } = Dimensions.get('window');


// const CourseDetailScreen = () => {
//   const route = useRoute();
//   const { courseId } = route.params;
//   const navigation = useNavigation();

//   const insets = useSafeAreaInsets();
//   const { width, height } = useWindowDimensions();

//   const headerHeight = useMemo(() => {
//     if (width < 360) return 180;
//     else if (width < 600) return 220;
//     else return 300;
//   }, [width]);

//   const headerWidth = width < 480 ? width * 0.97 : width;

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Local state for course details
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Video controls for hero video
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);

//   // For Reviews Popup
//   const [isReviewPopupVisible, setReviewPopupVisible] = useState(false);

//   // Tabs: 'description' or 'videos'
//   const [selectedTab, setSelectedTab] = useState('description');

//   // For playing lesson video in popup
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const modalVideoRef = useRef(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [videoDuration, setVideoDuration] = useState(0);
//   const [videoEnded, setVideoEnded] = useState(false);

//   // 2) Redux dispatcher
//   const dispatch = useDispatch();

//   // Fetch course data on mount
//   useEffect(() => {
//     const loadCourse = async () => {
//       try {
//         setLoading(true);
//         // 3) Dispatch the Redux thunk instead of calling fetchCourseById from services
//         const result = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
//         // `result` is what the thunk returned; e.g. { success, data: { ... }, message... }
//         if (result.success && result.data) {
//           setCourse(result.data);
//           setError(null);
//         } else {
//           setError(result.message || 'Failed to load course.');
//         }
//       } catch (err) {
//         setError(err.message || 'Failed to load course.');
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadCourse();
//   }, [courseId, dispatch]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ marginTop: 10, color: currentTheme.textColor }}>
//           Loading...
//         </Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{ color: currentTheme.errorTextColor }}>{error}</Text>
//       </View>
//     );
//   }

//   if (!course) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{ color: currentTheme.textColor }}>Course not found.</Text>
//       </View>
//     );
//   }

//   // Destructure course details
//   const {
//     title,
//     rating,
//     reviews,
//     description,
//     image,
//     videos,
//     shortVideoLink,
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//     price,
//     // Newly added fields
//     salePrice,
//     saleEnabled,
//   } = course;

//   // Choose main media (video if available, else image)
//   const mainVideoUrl =
//     shortVideoLink || (videos && videos.length > 0 && videos[0].url);

//   // Helper functions to format durations
//   const formatCourseDuration = (mins) => {
//     const hrs = Math.floor(mins / 60);
//     const remaining = mins % 60;
//     return hrs > 0 ? `${hrs}h ${remaining}m` : `${mins}m`;
//   };

//   const formatVideoDuration = (sec) => {
//     const mins = Math.floor(sec / 60);
//     const remainingSec = sec % 60;
//     return mins > 0 ? `${mins}m ${remainingSec}s` : `${sec}s`;
//   };

//   // Enroll button handler
//   const handleEnroll = () => {
//     // If there's a price or salePrice, handle purchase, otherwise free enrollment
//     setIsPlaying(false);
//     const finalPrice = saleEnabled && salePrice < price ? salePrice : price;
//     if (finalPrice && finalPrice > 0) {
//       navigation.navigate('PurchaseScreen', { courseId: course._id });
//     } else {
//       console.log('Enrolling in free course:', course._id);
//     }
//   };

//   // Handle lesson video press (assume first lesson is unlocked)
//   const handleVideoPress = (video, index) => {
//     if (index === 0) {
//       setSelectedVideo(video);
//       setModalIsPlaying(true);
//       setVideoEnded(false);
//     }
//   };

//   // Toggle modal video play/pause
//   const toggleModalPlayback = async () => {
//     if (modalVideoRef.current) {
//       const status = await modalVideoRef.current.getStatusAsync();
//       if (status.isPlaying) {
//         modalVideoRef.current.pauseAsync();
//         setModalIsPlaying(false);
//       } else {
//         modalVideoRef.current.playAsync();
//         setModalIsPlaying(true);
//       }
//     }
//   };

//   // Restart video when it ends
//   const restartVideo = async () => {
//     if (modalVideoRef.current) {
//       await modalVideoRef.current.replayAsync();
//       setModalIsPlaying(true);
//       setVideoEnded(false);
//     }
//   };

//   // Update playback status (for custom progress)
//   const handlePlaybackStatusUpdate = (status) => {
//     if (status.isLoaded) {
//       setCurrentTime(status.positionMillis / 1000);
//       setVideoDuration(status.durationMillis / 1000);
//       if (status.didJustFinish) {
//         setVideoEnded(true);
//         setModalIsPlaying(false);
//       }
//     }
//   };

//   // Calculate progress percentage for custom progress bar
//   const progressPercentage =
//     videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

//   // Calculate discount percentage if sale is enabled
//   let discountPercentage = 0;
//   if (saleEnabled && price > 0 && salePrice < price) {
//     discountPercentage = Math.round(((price - salePrice) / price) * 100);
//   }

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       {/* <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={currentTheme.statusBarStyle}
//       /> */}
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Enhanced Hero Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header,{paddingTop: insets.top + 10}]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//       {/* <LinearGradient colors={currentTheme.headerBackground} style={styles.header}> */}
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           {/* <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]} numberOfLines={1}>
//             {title}
//           </Text> */}
//           <Text
//             style={[
//               styles.headerTitle,
//               { color: currentTheme.headerTextColor, width: width * 0.65 }
//             ]}
//             numberOfLines={1}
//           >
//             {title}
//           </Text>

//           {category && (
//             <Text
//               style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}
//               numberOfLines={1}
//               ellipsizeMode="tail"
//             >
//               {category} {language && `- ${language}`}
//             </Text>
//           )}
//         </View>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Media Section */}
//         {mainVideoUrl ? (
//           <View style={[styles.mediaContainer, { width: headerWidth, height: headerHeight }]}>
//             <Video
//               source={{ uri: mainVideoUrl }}
//               style={styles.media}
//               resizeMode="cover"
//               shouldPlay={isPlaying}
//               isLooping
//               isMuted={isMuted}
//             />
//             <LinearGradient
//               colors={['rgba(0,0,0,0.3)', 'transparent']}
//               style={styles.mediaGradient}
//             />
//             <View style={styles.videoControls}>
//               <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.controlButton}>
//                 <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="#fff" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.controlButton}>
//                 <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={26} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <View style={styles.mediaContainer}>
//             <Image source={{ uri: image }} style={styles.media} resizeMode="cover" />
//             <LinearGradient
//               colors={['rgba(0,0,0,0.3)', 'transparent']}
//               style={styles.mediaGradient}
//             />
//           </View>
//         )}

//         {/* Enhanced Tab Navigation */}
//         <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <TouchableOpacity
//             style={[
//               styles.enhancedTabButton,
//               selectedTab === 'description' && { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => setSelectedTab('description')}
//           >
//             <Text
//               style={[
//                 styles.enhancedTabText,
//                 { color: selectedTab === 'description' ? '#fff' : currentTheme.textColor },
//               ]}
//             >
//               Description
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.enhancedTabButton,
//               selectedTab === 'videos' && { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => setSelectedTab('videos')}
//           >
//             <Text
//               style={[
//                 styles.enhancedTabText,
//                 { color: selectedTab === 'videos' ? '#fff' : currentTheme.textColor },
//               ]}
//             >
//               Lessons
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Tab Content */}
//         {selectedTab === 'description' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.title, { color: currentTheme.cardTextColor }]}>{title}</Text>
//             {/* Rating & Reviews */}
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => {
//                 const filled = index < Math.floor(rating);
//                 return (
//                   <Ionicons
//                     key={index}
//                     name={filled ? 'star' : 'star-outline'}
//                     size={22}
//                     color={filled ? '#FFD700' : '#FFD70099'}
//                     style={styles.starIcon}
//                   />
//                 );
//               })}
//               <TouchableOpacity onPress={() => setReviewPopupVisible(true)}>
//                 <Text style={[styles.ratingText, { color: currentTheme.cardTextColor }]}>
//                   ({reviews || 0} reviews)
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             {/* Description */}
//             {description?.length > 0 && (
//               <Text style={[styles.description, { color: currentTheme.textColor }]}>{description}</Text>
//             )}

//             {/* Course Details Card */}
//             <View style={[styles.card, styles.detailsCard, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Course Details
//               </Text>
//               {difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Difficulty:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {difficultyLevel}
//                   </Text>
//                 </View>
//               )}
//               {language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Language:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {language}
//                   </Text>
//                 </View>
//               )}
//               {category && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Category:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {category}
//                   </Text>
//                 </View>
//               )}
//               {totalDuration > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Total Duration:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {formatCourseDuration(totalDuration)}
//                   </Text>
//                 </View>
//               )}
//               {numberOfLectures > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Lectures:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {numberOfLectures}
//                   </Text>
//                 </View>
//               )}
//               {tags && tags.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Tags:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {tags.join(', ')}
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Requirements Card */}
//             {!!requirements?.length && (
//               <View style={[styles.card, styles.detailsCard, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Requirements / Prerequisites
//                 </Text>
//                 {requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* What You'll Learn Card */}
//             {!!whatYouWillLearn?.length && (
//               <View style={[styles.card, styles.detailsCard, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   What You'll Learn
//                 </Text>
//                 {whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* Topics Covered Card */}
//             {!!topics?.length && (
//               <View style={[styles.card, styles.detailsCard, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Topics Covered
//                 </Text>
//                 {topics.map((topic, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     - {topic}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           // Videos Tab Content
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}>
//               Course Curriculum
//             </Text>
//             {videos && videos.length > 0 ? (
//               videos.map((video, i) => {
//                 // Assume first lesson is unlocked.
//                 const isUnlocked = i === 0;
//                 return (
//                   <TouchableOpacity
//                     key={i}
//                     activeOpacity={isUnlocked ? 0.8 : 1}
//                     onPress={() => isUnlocked && handleVideoPress(video, i)}
//                     style={[
//                       styles.card,
//                       styles.videoCard,
//                       isUnlocked ? styles.unlockedVideoCard : styles.lockedVideoCard,
//                       { backgroundColor: currentTheme.backgroundColor,
//                         borderColor: currentTheme.borderColor },
//                     ]}
//                   >
//                     <Image
//                       source={{ uri: video.thumbnail || image }}
//                       style={styles.videoThumbnail}
//                       resizeMode="cover"
//                     />
//                     <View style={styles.videoInfo}>
//                       <Text style={[styles.videoTitle, { color: currentTheme.textColor }]}>
//                         {i + 1}. {video.title}
//                       </Text>
//                       <Text style={[styles.videoDuration, { color: currentTheme.textColor }]}>
//                         {formatVideoDuration(video.duration || 0)}
//                       </Text>
//                     </View>
//                     {/* Always show the play button */}
//                     <View style={styles.playIconContainer}>
//                       <Ionicons
//                         name="play"
//                         size={24}
//                         color={isUnlocked ? currentTheme.primaryColor : '#ccc'}
//                       />
//                     </View>
//                     {/* Add lock overlay if video is locked */}
//                     {!isUnlocked && (
//                       <View style={styles.lockOverlay}>
//                         <Ionicons name="lock-closed" size={28} color="#fff" />
//                         <Text style={[styles.lockText, { color: currentTheme.textColor }]}>Locked</Text>
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 );
//               })
//             ) : (
//               <Text style={{ color: currentTheme.textColor }}>No videos available.</Text>
//             )}
//           </View>
//         )}
//       </ScrollView>

//       {/* Fixed Footer */}
//       <View style={styles.footer}>
//         {/* Price Section (with relative positioning to hold the tag) */}
//         <View style={styles.priceSection}>
//           {/* Original Price Button (always shown) */}
//           <TouchableOpacity
//             style={[styles.footerPriceButton, { borderColor: currentTheme.primaryColor, backgroundColor: currentTheme.backgroundColor }]}
//             disabled={true}
//           >
//             {/* If sale is enabled and salePrice < price, show strikethrough on original price */}
//             {saleEnabled && salePrice < price ? (
//               <Text
//                 style={[
//                   styles.footerPriceText,
//                   {
//                     color: currentTheme.textColor,
//                     textDecorationLine: 'line-through',
//                     textDecorationStyle: 'solid',
//                   },
//                 ]}
//               >
//                 ${price.toFixed(2)}
//               </Text>
//             ) : (
//               <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//                 {price && price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//               </Text>
//             )}
//           </TouchableOpacity>

//           {/* Realistic Tag for sale price & discount */}
//           {saleEnabled && price > 0 && salePrice < price && (
//             <View style={[styles.saleTagContainer, { backgroundColor: currentTheme.saleTagBackgroundColor }]}>
//               {/* The 'hole' circle to mimic a paper price tag */}
//               <View style={[styles.saleTagHole, { backgroundColor: currentTheme.saleTagBackgroundColor,borderColor: currentTheme.borderColor }]} />
//               <Text style={[styles.saleTagPrice, { color: currentTheme.buttonTextColor }]}>${salePrice.toFixed(2)}</Text>
//               {discountPercentage > 0 && (
//                 <Text style={[styles.saleTagDiscount, { color: currentTheme.buttonTextColor }]}>{discountPercentage}% OFF</Text>
//               )}
//             </View>
//           )}
//         </View>

//         <TouchableOpacity
//           style={[styles.footerEnrollButton, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleEnroll}
//         >
//           <Text style={[styles.footerEnrollText, { color: currentTheme.buttonTextColor }]}>Enroll Now</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Video Popup Modal with Custom Controller */}
//       <Modal
//         visible={!!selectedVideo}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setSelectedVideo(null)}
//       >
//         <View style={styles.videoModalContainer}>
//           <View style={styles.videoModalContent}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedVideo(null)}>
//               <Ionicons name="close" size={28} color="#fff" />
//             </TouchableOpacity>
//             {selectedVideo && (
//               <View style={styles.modalVideoContainer}>
//                 <Video
//                   ref={modalVideoRef}
//                   source={{ uri: selectedVideo.url }}
//                   style={styles.modalVideo}
//                   resizeMode="cover"
//                   shouldPlay={modalIsPlaying}
//                   isLooping={false}
//                   useNativeControls={false}
//                   onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
//                 />
//                 {/* Custom Controller Overlay */}
//                 <View style={styles.modalControls}>
//                   {videoEnded ? (
//                     <TouchableOpacity onPress={restartVideo} style={styles.modalControlButton}>
//                       <Ionicons name="refresh" size={30} color="#fff" />
//                     </TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity onPress={toggleModalPlayback} style={styles.modalControlButton}>
//                       <Ionicons name={modalIsPlaying ? 'pause' : 'play'} size={30} color="#fff" />
//                     </TouchableOpacity>
//                   )}
//                   <View style={styles.progressContainer}>
//                     <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
//                   </View>
//                   <View style={styles.timeContainer}>
//                     <Text style={styles.timeText}>
//                       {Math.floor(currentTime)} / {Math.floor(videoDuration)}s
//                     </Text>
//                   </View>
//                   <TouchableOpacity
//                     onPress={() => {
//                       if (modalVideoRef.current) {
//                         modalVideoRef.current.setIsMutedAsync(!isMuted);
//                         setIsMuted(!isMuted);
//                       }
//                     }}
//                     style={styles.modalControlButton}
//                   >
//                     <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={30} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Review Popup Modal */}
//       <Modal
//         visible={isReviewPopupVisible}
//         animationType="slide"
//         onRequestClose={() => setReviewPopupVisible(false)}
//         transparent={true}
//       >
//         <ReviewPopup
//           closePopup={() => setReviewPopupVisible(false)}
//           reviewableId={course._id}
//           reviewableType="Course"
//         />
//       </Modal>
//     </View>
//   );
// };

// export default CourseDetailScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1 },
//   header: {
//     width: '100%',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 35,
//     borderBottomRightRadius: 35,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 6,
//     marginBottom: 8,
//   },
//   backButton: { 
//     position: 'absolute', 
//     left: 20,
//     paddingTop: Platform.OS === 'ios' ? 50 : 10,
//     padding: Platform.OS === 'ios' ? 10 : 10,
//     zIndex: 10 
//   },
//   headerTitleContainer: { alignItems: 'center' },
//   headerTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
//   headerSubtitle: { fontSize: 15, fontWeight: '400', marginTop: 4, textAlign: 'center' },
//   scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

//   // Media Section
//   mediaContainer: {
//     // height: 260,
//     backgroundColor: '#000',
//     borderRadius: 20,
//     overflow: 'hidden',
//     marginBottom: 24,
//     alignSelf: 'center',
//     // marginHorizontal: -20,
//   },
//   media: { width: '100%', height: '100%' },
//   mediaGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 },
//   videoControls: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', alignItems: 'center' },
//   controlButton: { backgroundColor: 'rgba(0,0,0,0.65)', padding: 12, borderRadius: 35, marginLeft: 12 },

//   // Enhanced Tabs
//   enhancedTabContainer: {
//     flexDirection: 'row',
//     borderRadius: 25,
//     marginHorizontal: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   enhancedTabButton: {
//     flex: 1,
//     paddingVertical: 10,
//     alignItems: 'center',
//     borderRadius: 25,
//   },
//   enhancedTabText: { fontSize: 16, fontWeight: '600' },

//   // Details Container (wrapper for tab content)
//   detailsContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     padding: 20,
//     marginHorizontal: -20,
//     marginBottom: 24,
//   },
//   // Card Style for details and video items
//   card: {
//     // backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 15,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   // detailsCard: { backgroundColor: '#fff' },
//   title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
//   ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   starIcon: { marginRight: 3 },
//   ratingText: { marginLeft: 10, fontSize: 15 },
//   description: { fontSize: 17, lineHeight: 26, marginBottom: 16 },
//   // section: { marginTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e6e6e6' },
//   sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
//   detailGroup: { flexDirection: 'row', marginBottom: 8 },
//   detailLabel: { fontWeight: '600', width: 140, marginRight: 6 },
//   detailValue: { flex: 1 },
//   bulletItem: { fontSize: 16, marginLeft: 12, marginBottom: 6 },

//   // Video Card Styles
//   videoCard: { flexDirection: 'row', alignItems: 'center', padding: 10 },
//   unlockedVideoCard: { borderWidth: 2 },
//   lockedVideoCard: {},
//   videoThumbnail: { width: 120, height: 80, borderRadius: 10 },
//   videoInfo: { flex: 1, paddingLeft: 10 },
//   videoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
//   videoDuration: { fontSize: 16, color: '#666' },
//   // Play Icon Overlay (common for both states)
//   playIconContainer: {
//     position: 'absolute',
//     right: 20,
//     top: 30,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     padding: 10,
//     borderRadius: 20,
//   },
//   // Lock Overlay for locked videos
//   lockOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 15,
//   },
//   lockText: { fontSize: 16, fontWeight: '600', marginTop: 4 },

//   // Footer
//   footer: {
//     position: 'absolute',
//     bottom: 100,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//   },
//   // A parent container so we can position the sale tag absolutely
//   priceSection: {
//     position: 'relative',
//     marginRight: 15,
//     justifyContent: 'center',
//   },
//   footerPriceButton: {
//     width: 80,
//     height: 50,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     // backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerPriceText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },

//   // Realistic Sale Tag
//   saleTagContainer: {
//     position: 'absolute',
//     top: -40,
//     right: -40,
//     // backgroundColor: '#d00',
//     borderRadius: 10,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     minWidth: 70,
//     alignItems: 'center',
//     justifyContent: 'center',
//     // A little shadow for more realism
//     shadowColor: '#000',
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
//     // backgroundColor: '#d00',
//     borderWidth: 2,
//     // borderColor: '#fff',
//     transform: [{ translateY: -8 }],
//   },
//   saleTagPrice: {
//     // color: '#fff',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   saleTagDiscount: {
//     // color: '#fff',
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
//   footerEnrollText: {  fontSize: 18, fontWeight: '600' },

//   // Video Modal Styles
//   videoModalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   videoModalContent: {
//     width: '90%',
//     height: '60%',
//     backgroundColor: '#000',
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 1,
//   },
//   modalVideoContainer: { flex: 1 },
//   modalVideo: { width: '100%', height: '100%' },
//   modalControls: {
//     position: 'absolute',
//     bottom: 10,
//     left: 10,
//     right: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   modalControlButton: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     padding: 5,
//     borderRadius: 25,
//     marginLeft: 10,
//   },
//   progressContainer: {
//     flex: 1,
//     height: 4,
//     backgroundColor: '#444',
//     borderRadius: 2,
//     marginHorizontal: 10,
//   },
//   progressBar: {
//     height: 4,
//     backgroundColor: '#fff',
//     borderRadius: 2,
//   },
//   timeContainer: {},
//   timeText: { color: '#fff', fontSize: 14 },
// });











// // CourseDetailScreen.js

// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   Modal,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';

// import { fetchCourseById } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import ReviewPopup from '../components/ReviewPopup';

// const { width } = Dimensions.get('window');

// const CourseDetailScreen = () => {
//   const route = useRoute();
//   const { courseId } = route.params;
//   const navigation = useNavigation();

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Local state for course details
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Video controls for hero video
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);

//   // For Reviews Popup
//   const [isReviewPopupVisible, setReviewPopupVisible] = useState(false);

//   // Tabs: 'description' or 'videos'
//   const [selectedTab, setSelectedTab] = useState('description');

//   // For playing lesson video in popup
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const modalVideoRef = useRef(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [videoDuration, setVideoDuration] = useState(0);
//   const [videoEnded, setVideoEnded] = useState(false);

//   // Fetch course data on mount
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

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ marginTop: 10, color: currentTheme.textColor }}>
//           Loading course details...
//         </Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{ color: 'red' }}>{error}</Text>
//       </View>
//     );
//   }

//   if (!course) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{ color: currentTheme.textColor }}>Course not found.</Text>
//       </View>
//     );
//   }

//   // Destructure course details
//   const {
//     title,
//     rating,
//     reviews,
//     description,
//     image,
//     videos,
//     shortVideoLink,
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//     price,
//     // Newly added fields
//     salePrice,
//     saleEnabled,
//   } = course;

//   // Choose main media (video if available, else image)
//   const mainVideoUrl =
//     shortVideoLink || (videos && videos.length > 0 && videos[0].url);

//   // Helper functions to format durations
//   const formatCourseDuration = (mins) => {
//     const hrs = Math.floor(mins / 60);
//     const remaining = mins % 60;
//     return hrs > 0 ? `${hrs}h ${remaining}m` : `${mins}m`;
//   };

//   const formatVideoDuration = (sec) => {
//     const mins = Math.floor(sec / 60);
//     const remainingSec = sec % 60;
//     return mins > 0 ? `${mins}m ${remainingSec}s` : `${sec}s`;
//   };

//   // Enroll button handler
//   const handleEnroll = () => {
//     // If there's a price or salePrice, handle purchase, otherwise free enrollment
//     const finalPrice = saleEnabled && salePrice < price ? salePrice : price;
//     if (finalPrice && finalPrice > 0) {
//       navigation.navigate('PurchaseScreen', { courseId: course._id });
//     } else {
//       console.log('Enrolling in free course:', course._id);
//     }
//   };

//   // Handle lesson video press (assume first lesson is unlocked)
//   const handleVideoPress = (video, index) => {
//     if (index === 0) {
//       setSelectedVideo(video);
//       setModalIsPlaying(true);
//       setVideoEnded(false);
//     }
//   };

//   // Toggle modal video play/pause
//   const toggleModalPlayback = async () => {
//     if (modalVideoRef.current) {
//       const status = await modalVideoRef.current.getStatusAsync();
//       if (status.isPlaying) {
//         modalVideoRef.current.pauseAsync();
//         setModalIsPlaying(false);
//       } else {
//         modalVideoRef.current.playAsync();
//         setModalIsPlaying(true);
//       }
//     }
//   };

//   // Restart video when it ends
//   const restartVideo = async () => {
//     if (modalVideoRef.current) {
//       await modalVideoRef.current.replayAsync();
//       setModalIsPlaying(true);
//       setVideoEnded(false);
//     }
//   };

//   // Update playback status (for custom progress)
//   const handlePlaybackStatusUpdate = (status) => {
//     if (status.isLoaded) {
//       setCurrentTime(status.positionMillis / 1000);
//       setVideoDuration(status.durationMillis / 1000);
//       if (status.didJustFinish) {
//         setVideoEnded(true);
//         setModalIsPlaying(false);
//       }
//     }
//   };

//   // Calculate progress percentage for custom progress bar
//   const progressPercentage =
//     videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

//   // Calculate discount percentage if sale is enabled
//   let discountPercentage = 0;
//   if (saleEnabled && price > 0 && salePrice < price) {
//     discountPercentage = Math.round(((price - salePrice) / price) * 100);
//   }

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={currentTheme.statusBarStyle}
//       />

//       {/* Enhanced Hero Header */}
//       <LinearGradient colors={currentTheme.headerBackground} style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]} numberOfLines={1}>
//             {title}
//           </Text>
//           {category && (
//             <Text
//               style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}
//               numberOfLines={1}
//               ellipsizeMode="tail"
//             >
//               {category} {language && `- ${language}`}
//             </Text>
//           )}
//         </View>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Media Section */}
//         {mainVideoUrl ? (
//           <View style={styles.mediaContainer}>
//             <Video
//               source={{ uri: mainVideoUrl }}
//               style={styles.media}
//               resizeMode="cover"
//               shouldPlay={isPlaying}
//               isLooping
//               isMuted={isMuted}
//             />
//             <LinearGradient
//               colors={['rgba(0,0,0,0.3)', 'transparent']}
//               style={styles.mediaGradient}
//             />
//             <View style={styles.videoControls}>
//               <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.controlButton}>
//                 <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="#fff" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.controlButton}>
//                 <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={26} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <View style={styles.mediaContainer}>
//             <Image source={{ uri: image }} style={styles.media} resizeMode="cover" />
//             <LinearGradient
//               colors={['rgba(0,0,0,0.3)', 'transparent']}
//               style={styles.mediaGradient}
//             />
//           </View>
//         )}

//         {/* Enhanced Tab Navigation */}
//         <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <TouchableOpacity
//             style={[
//               styles.enhancedTabButton,
//               selectedTab === 'description' && { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => setSelectedTab('description')}
//           >
//             <Text
//               style={[
//                 styles.enhancedTabText,
//                 { color: selectedTab === 'description' ? '#fff' : currentTheme.textColor },
//               ]}
//             >
//               Description
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.enhancedTabButton,
//               selectedTab === 'videos' && { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => setSelectedTab('videos')}
//           >
//             <Text
//               style={[
//                 styles.enhancedTabText,
//                 { color: selectedTab === 'videos' ? '#fff' : currentTheme.textColor },
//               ]}
//             >
//               Lessons
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Tab Content */}
//         {selectedTab === 'description' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.title, { color: currentTheme.cardTextColor }]}>{title}</Text>
//             {/* Rating & Reviews */}
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => {
//                 const filled = index < Math.floor(rating);
//                 return (
//                   <Ionicons
//                     key={index}
//                     name={filled ? 'star' : 'star-outline'}
//                     size={22}
//                     color={filled ? '#FFD700' : '#FFD70099'}
//                     style={styles.starIcon}
//                   />
//                 );
//               })}
//               <TouchableOpacity onPress={() => setReviewPopupVisible(true)}>
//                 <Text style={[styles.ratingText, { color: currentTheme.textColor }]}>
//                   ({reviews || 0} reviews)
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             {/* Description */}
//             {description?.length > 0 && (
//               <Text style={[styles.description, { color: currentTheme.textColor }]}>{description}</Text>
//             )}

//             {/* Course Details Card */}
//             <View style={[styles.card, styles.detailsCard]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Course Details
//               </Text>
//               {difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Difficulty:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{difficultyLevel}</Text>
//                 </View>
//               )}
//               {language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Language:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{language}</Text>
//                 </View>
//               )}
//               {category && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Category:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{category}</Text>
//                 </View>
//               )}
//               {totalDuration > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Total Duration:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {formatCourseDuration(totalDuration)}
//                   </Text>
//                 </View>
//               )}
//               {numberOfLectures > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Lectures:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{numberOfLectures}</Text>
//                 </View>
//               )}
//               {tags && tags.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Tags:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{tags.join(', ')}</Text>
//                 </View>
//               )}
//             </View>

//             {/* Requirements Card */}
//             {!!requirements?.length && (
//               <View style={[styles.card, styles.detailsCard]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Requirements / Prerequisites
//                 </Text>
//                 {requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* What You'll Learn Card */}
//             {!!whatYouWillLearn?.length && (
//               <View style={[styles.card, styles.detailsCard]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   What You'll Learn
//                 </Text>
//                 {whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* Topics Covered Card */}
//             {!!topics?.length && (
//               <View style={[styles.card, styles.detailsCard]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Topics Covered
//                 </Text>
//                 {topics.map((topic, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     - {topic}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           // Videos Tab Content
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}>
//               Course Curriculum
//             </Text>
//             {videos && videos.length > 0 ? (
//               videos.map((video, i) => {
//                 // Assume first lesson is unlocked.
//                 const isUnlocked = i === 0;
//                 return (
//                   <TouchableOpacity
//                     key={i}
//                     activeOpacity={isUnlocked ? 0.8 : 1}
//                     onPress={() => isUnlocked && handleVideoPress(video, i)}
//                     style={[
//                       styles.card,
//                       styles.videoCard,
//                       isUnlocked ? styles.unlockedVideoCard : styles.lockedVideoCard,
//                     ]}
//                   >
//                     <Image
//                       source={{ uri: video.thumbnail || image }}
//                       style={styles.videoThumbnail}
//                       resizeMode="cover"
//                     />
//                     <View style={styles.videoInfo}>
//                       <Text style={[styles.videoTitle, { color: currentTheme.textColor }]}>
//                         {i + 1}. {video.title}
//                       </Text>
//                       <Text style={[styles.videoDuration, { color: currentTheme.textColor }]}>
//                         {formatVideoDuration(video.duration || 0)}
//                       </Text>
//                     </View>
//                     {/* Always show the play button */}
//                     <View style={styles.playIconContainer}>
//                       <Ionicons
//                         name="play"
//                         size={24}
//                         color={isUnlocked ? currentTheme.primaryColor : '#ccc'}
//                       />
//                     </View>
//                     {/* Add lock overlay if video is locked */}
//                     {!isUnlocked && (
//                       <View style={styles.lockOverlay}>
//                         <Ionicons name="lock-closed" size={28} color="#fff" />
//                         <Text style={styles.lockText}>Locked</Text>
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 );
//               })
//             ) : (
//               <Text style={{ color: currentTheme.textColor }}>No videos available.</Text>
//             )}
//           </View>
//         )}
//       </ScrollView>

//       {/* Fixed Footer */}
//       <View style={styles.footer}>
//         {/* Price Section (with relative positioning to hold the tag) */}
//         <View style={styles.priceSection}>
//           {/* Original Price Button (always shown) */}
//           <TouchableOpacity
//             style={[styles.footerPriceButton, { borderColor: currentTheme.primaryColor }]}
//             disabled={true}
//           >
//             {/* If sale is enabled and salePrice < price, show strikethrough on original price */}
//             {saleEnabled && salePrice < price ? (
//               <Text
//                 style={[
//                   styles.footerPriceText,
//                   {
//                     color: currentTheme.textColor,
//                     textDecorationLine: 'line-through',
//                     textDecorationStyle: 'solid',
//                   },
//                 ]}
//               >
//                 ${price.toFixed(2)}
//               </Text>
//             ) : (
//               <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//                 {price && price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//               </Text>
//             )}
//           </TouchableOpacity>

//           {/* Realistic Tag for sale price & discount */}
//           {saleEnabled && price > 0 && salePrice < price && (
//             <View style={styles.saleTagContainer}>
//               {/* The 'hole' circle to mimic a paper price tag */}
//               <View style={styles.saleTagHole} />
//               <Text style={styles.saleTagPrice}>${salePrice.toFixed(2)}</Text>
//               {discountPercentage > 0 && (
//                 <Text style={styles.saleTagDiscount}>{discountPercentage}% OFF</Text>
//               )}
//             </View>
//           )}
//         </View>

//         <TouchableOpacity
//           style={[styles.footerEnrollButton, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleEnroll}
//         >
//           <Text style={styles.footerEnrollText}>Enroll Now</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Video Popup Modal with Custom Controller */}
//       <Modal
//         visible={!!selectedVideo}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setSelectedVideo(null)}
//       >
//         <View style={styles.videoModalContainer}>
//           <View style={styles.videoModalContent}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedVideo(null)}>
//               <Ionicons name="close" size={28} color="#fff" />
//             </TouchableOpacity>
//             {selectedVideo && (
//               <View style={styles.modalVideoContainer}>
//                 <Video
//                   ref={modalVideoRef}
//                   source={{ uri: selectedVideo.url }}
//                   style={styles.modalVideo}
//                   resizeMode="cover"
//                   shouldPlay={modalIsPlaying}
//                   isLooping={false}
//                   useNativeControls={false}
//                   onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
//                 />
//                 {/* Custom Controller Overlay */}
//                 <View style={styles.modalControls}>
//                   {videoEnded ? (
//                     <TouchableOpacity onPress={restartVideo} style={styles.modalControlButton}>
//                       <Ionicons name="refresh" size={30} color="#fff" />
//                     </TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity onPress={toggleModalPlayback} style={styles.modalControlButton}>
//                       <Ionicons name={modalIsPlaying ? 'pause' : 'play'} size={30} color="#fff" />
//                     </TouchableOpacity>
//                   )}
//                   <View style={styles.progressContainer}>
//                     <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
//                   </View>
//                   <View style={styles.timeContainer}>
//                     <Text style={styles.timeText}>
//                       {Math.floor(currentTime)} / {Math.floor(videoDuration)}s
//                     </Text>
//                   </View>
//                   <TouchableOpacity
//                     onPress={() => {
//                       if (modalVideoRef.current) {
//                         modalVideoRef.current.setIsMutedAsync(!isMuted);
//                         setIsMuted(!isMuted);
//                       }
//                     }}
//                     style={styles.modalControlButton}
//                   >
//                     <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={30} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Review Popup Modal */}
//       <Modal
//         visible={isReviewPopupVisible}
//         animationType="slide"
//         onRequestClose={() => setReviewPopupVisible(false)}
//         transparent={true}
//       >
//         <ReviewPopup
//           closePopup={() => setReviewPopupVisible(false)}
//           reviewableId={course._id}
//           reviewableType="Course"
//         />
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default CourseDetailScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1 },
//   header: {
//     width: '100%',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 35,
//     borderBottomRightRadius: 35,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 6,
//     marginBottom: 8,
//   },
//   backButton: { position: 'absolute', left: 20, padding: 10, zIndex: 10 },
//   headerTitleContainer: { alignItems: 'center' },
//   headerTitle: { fontSize: 24, fontWeight: '700', width: width * 0.65, textAlign: 'center' },
//   headerSubtitle: { fontSize: 15, fontWeight: '400', marginTop: 4, width: width * 0.6, textAlign: 'center' },
//   scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

//   // Media Section
//   mediaContainer: {
//     height: 260,
//     backgroundColor: '#000',
//     borderRadius: 20,
//     overflow: 'hidden',
//     marginBottom: 24,
//     marginHorizontal: -20,
//   },
//   media: { width: '100%', height: '100%' },
//   mediaGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 },
//   videoControls: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', alignItems: 'center' },
//   controlButton: { backgroundColor: 'rgba(0,0,0,0.65)', padding: 12, borderRadius: 35, marginLeft: 12 },

//   // Enhanced Tabs
//   enhancedTabContainer: {
//     flexDirection: 'row',
//     borderRadius: 25,
//     marginHorizontal: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   enhancedTabButton: {
//     flex: 1,
//     paddingVertical: 10,
//     alignItems: 'center',
//     borderRadius: 25,
//   },
//   enhancedTabText: { fontSize: 16, fontWeight: '600' },

//   // Details Container (wrapper for tab content)
//   detailsContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     padding: 20,
//     marginHorizontal: -20,
//     marginBottom: 24,
//   },
//   // Card Style for details and video items
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 15,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   detailsCard: { backgroundColor: '#fff' },
//   title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
//   ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   starIcon: { marginRight: 3 },
//   ratingText: { marginLeft: 10, fontSize: 17, fontWeight: '500' },
//   description: { fontSize: 17, lineHeight: 26, marginBottom: 16 },
//   section: { marginTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e6e6e6' },
//   sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
//   detailGroup: { flexDirection: 'row', marginBottom: 8 },
//   detailLabel: { fontWeight: '600', width: 140, marginRight: 6 },
//   detailValue: { flex: 1 },
//   bulletItem: { fontSize: 16, marginLeft: 12, marginBottom: 6 },

//   // Video Card Styles
//   videoCard: { flexDirection: 'row', alignItems: 'center', padding: 10 },
//   unlockedVideoCard: { borderWidth: 2, borderColor: '#00C851' },
//   lockedVideoCard: {},
//   videoThumbnail: { width: 120, height: 80, borderRadius: 10 },
//   videoInfo: { flex: 1, paddingLeft: 10 },
//   videoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
//   videoDuration: { fontSize: 16, color: '#666' },
//   // Play Icon Overlay (common for both states)
//   playIconContainer: {
//     position: 'absolute',
//     right: 20,
//     top: 30,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     padding: 10,
//     borderRadius: 20,
//   },
//   // Lock Overlay for locked videos
//   lockOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 15,
//   },
//   lockText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 4 },

//   // Footer
//   footer: {
//     position: 'absolute',
//     bottom: 100,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//   },
//   // A parent container so we can position the sale tag absolutely
//   priceSection: {
//     position: 'relative',
//     marginRight: 15,
//     justifyContent: 'center',
//   },
//   footerPriceButton: {
//     width: 80,
//     height: 50,
//     borderRadius: 20,
//     borderWidth: 1.5,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerPriceText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },

//   // Realistic Sale Tag
//   saleTagContainer: {
//     position: 'absolute',
//     top: -40,
//     right: -40,
//     backgroundColor: '#d00',
//     borderRadius: 10,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     minWidth: 70,
//     alignItems: 'center',
//     justifyContent: 'center',
//     // A little shadow for more realism
//     shadowColor: '#000',
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
//     backgroundColor: '#d00',
//     borderWidth: 2,
//     borderColor: '#fff',
//     transform: [{ translateY: -8 }],
//   },
//   saleTagPrice: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '700',
//   },
//   saleTagDiscount: {
//     color: '#fff',
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
//   footerEnrollText: { color: '#fff', fontSize: 18, fontWeight: '600' },

//   // Video Modal Styles
//   videoModalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   videoModalContent: {
//     width: '90%',
//     height: '60%',
//     backgroundColor: '#000',
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 1,
//   },
//   modalVideoContainer: { flex: 1 },
//   modalVideo: { width: '100%', height: '100%' },
//   modalControls: {
//     position: 'absolute',
//     bottom: 10,
//     left: 10,
//     right: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   modalControlButton: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     padding: 5,
//     borderRadius: 25,
//     marginLeft: 10,
//   },
//   progressContainer: {
//     flex: 1,
//     height: 4,
//     backgroundColor: '#444',
//     borderRadius: 2,
//     marginHorizontal: 10,
//   },
//   progressBar: {
//     height: 4,
//     backgroundColor: '#fff',
//     borderRadius: 2,
//   },
//   timeContainer: {},
//   timeText: { color: '#fff', fontSize: 14 },
// });









// // CourseDetailScreen.js

// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   Modal,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';

// import { fetchCourseById } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import ReviewPopup from '../components/ReviewPopup';

// const { width } = Dimensions.get('window');

// const CourseDetailScreen = () => {
//   const route = useRoute();
//   const { courseId } = route.params;
//   const navigation = useNavigation();

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Local state for course details
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Video controls for hero video
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);

//   // For Reviews Popup
//   const [isReviewPopupVisible, setReviewPopupVisible] = useState(false);

//   // Tabs: 'description' or 'videos'
//   const [selectedTab, setSelectedTab] = useState('description');

//   // For playing lesson video in popup
//   const [selectedVideo, setSelectedVideo] = useState(null);
//   const modalVideoRef = useRef(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [videoDuration, setVideoDuration] = useState(0);
//   const [videoEnded, setVideoEnded] = useState(false);

//   // Fetch course data on mount
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

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ marginTop: 10, color: currentTheme.textColor }}>
//           Loading course details...
//         </Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{ color: 'red' }}>{error}</Text>
//       </View>
//     );
//   }

//   if (!course) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{ color: currentTheme.textColor }}>Course not found.</Text>
//       </View>
//     );
//   }

//   // Destructure course details
//   const {
//     title,
//     rating,
//     reviews,
//     description,
//     image,
//     videos,
//     shortVideoLink,
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//     price,
//   } = course;

//   // Choose main media (video if available, else image)
//   const mainVideoUrl =
//     shortVideoLink || (videos && videos.length > 0 && videos[0].url);

//   // Helper functions to format durations
//   const formatCourseDuration = (mins) => {
//     const hrs = Math.floor(mins / 60);
//     const remaining = mins % 60;
//     return hrs > 0 ? `${hrs}h ${remaining}m` : `${mins}m`;
//   };

//   const formatVideoDuration = (sec) => {
//     const mins = Math.floor(sec / 60);
//     const remainingSec = sec % 60;
//     return mins > 0 ? `${mins}m ${remainingSec}s` : `${sec}s`;
//   };

//   // Enroll button handler
//   const handleEnroll = () => {
//     if (price && price > 0) {
//       navigation.navigate('PurchaseScreen', { courseId: course._id });
//     } else {
//       console.log('Enrolling in free course:', course._id);
//     }
//   };

//   // Handle lesson video press (assume first lesson is unlocked)
//   const handleVideoPress = (video, index) => {
//     if (index === 0) {
//       setSelectedVideo(video);
//       setModalIsPlaying(true);
//       setVideoEnded(false);
//     }
//   };

//   // Toggle modal video play/pause
//   const toggleModalPlayback = async () => {
//     if (modalVideoRef.current) {
//       const status = await modalVideoRef.current.getStatusAsync();
//       if (status.isPlaying) {
//         modalVideoRef.current.pauseAsync();
//         setModalIsPlaying(false);
//       } else {
//         modalVideoRef.current.playAsync();
//         setModalIsPlaying(true);
//       }
//     }
//   };

//   // Restart video when it ends
//   const restartVideo = async () => {
//     if (modalVideoRef.current) {
//       await modalVideoRef.current.replayAsync();
//       setModalIsPlaying(true);
//       setVideoEnded(false);
//     }
//   };

//   // Update playback status (for custom progress)
//   const handlePlaybackStatusUpdate = (status) => {
//     if (status.isLoaded) {
//       setCurrentTime(status.positionMillis / 1000);
//       setVideoDuration(status.durationMillis / 1000);
//       if (status.didJustFinish) {
//         setVideoEnded(true);
//         setModalIsPlaying(false);
//       }
//     }
//   };

//   // Calculate progress percentage for custom progress bar
//   const progressPercentage =
//     videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={currentTheme.statusBarStyle}
//       />

//       {/* Enhanced Hero Header */}
//       <LinearGradient colors={currentTheme.headerBackground} style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]} numberOfLines={1}>
//             {title}
//           </Text>
//           {category && (
//             <Text
//               style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}
//               numberOfLines={1}
//               ellipsizeMode="tail"
//             >
//               {category} {language && `- ${language}`}
//             </Text>
//           )}
//         </View>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Media Section */}
//         {mainVideoUrl ? (
//           <View style={styles.mediaContainer}>
//             <Video
//               source={{ uri: mainVideoUrl }}
//               style={styles.media}
//               resizeMode="cover"
//               shouldPlay={isPlaying}
//               isLooping
//               isMuted={isMuted}
//             />
//             <LinearGradient
//               colors={['rgba(0,0,0,0.3)', 'transparent']}
//               style={styles.mediaGradient}
//             />
//             <View style={styles.videoControls}>
//               <TouchableOpacity onPress={() => setIsPlaying(!isPlaying)} style={styles.controlButton}>
//                 <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color="#fff" />
//               </TouchableOpacity>
//               <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.controlButton}>
//                 <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={26} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <View style={styles.mediaContainer}>
//             <Image source={{ uri: image }} style={styles.media} resizeMode="cover" />
//             <LinearGradient
//               colors={['rgba(0,0,0,0.3)', 'transparent']}
//               style={styles.mediaGradient}
//             />
//           </View>
//         )}

//         {/* Enhanced Tab Navigation */}
//         <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <TouchableOpacity
//             style={[
//               styles.enhancedTabButton,
//               selectedTab === 'description' && { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => setSelectedTab('description')}
//           >
//             <Text style={[styles.enhancedTabText, { color: selectedTab === 'description' ? '#fff' : currentTheme.textColor }]}>
//               Description
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.enhancedTabButton,
//               selectedTab === 'videos' && { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => setSelectedTab('videos')}
//           >
//             <Text style={[styles.enhancedTabText, { color: selectedTab === 'videos' ? '#fff' : currentTheme.textColor }]}>
//               Lessons
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Tab Content */}
//         {selectedTab === 'description' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.title, { color: currentTheme.cardTextColor }]}>{title}</Text>
//             {/* Rating & Reviews */}
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => {
//                 const filled = index < Math.floor(rating);
//                 return (
//                   <Ionicons
//                     key={index}
//                     name={filled ? 'star' : 'star-outline'}
//                     size={22}
//                     color={filled ? '#FFD700' : '#FFD70099'}
//                     style={styles.starIcon}
//                   />
//                 );
//               })}
//               <TouchableOpacity onPress={() => setReviewPopupVisible(true)}>
//                 <Text style={[styles.ratingText, { color: currentTheme.textColor }]}>
//                   ({reviews || 0} reviews)
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             {/* Description */}
//             {description?.length > 0 && (
//               <Text style={[styles.description, { color: currentTheme.textColor }]}>{description}</Text>
//             )}

//             {/* Course Details Card */}
//             <View style={[styles.card, styles.detailsCard]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Course Details
//               </Text>
//               {difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Difficulty:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{difficultyLevel}</Text>
//                 </View>
//               )}
//               {language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Language:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{language}</Text>
//                 </View>
//               )}
//               {category && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Category:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{category}</Text>
//                 </View>
//               )}
//               {totalDuration > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Total Duration:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{formatCourseDuration(totalDuration)}</Text>
//                 </View>
//               )}
//               {numberOfLectures > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Lectures:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{numberOfLectures}</Text>
//                 </View>
//               )}
//               {tags && tags.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Tags:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{tags.join(', ')}</Text>
//                 </View>
//               )}
//             </View>

//             {/* Requirements Card */}
//             {!!requirements?.length && (
//               <View style={[styles.card, styles.detailsCard]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Requirements / Prerequisites
//                 </Text>
//                 {requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* What You'll Learn Card */}
//             {!!whatYouWillLearn?.length && (
//               <View style={[styles.card, styles.detailsCard]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   What You'll Learn
//                 </Text>
//                 {whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* Topics Covered Card */}
//             {!!topics?.length && (
//               <View style={[styles.card, styles.detailsCard]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Topics Covered
//                 </Text>
//                 {topics.map((topic, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     - {topic}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           // Videos Tab Content
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}>
//               Course Curriculum
//             </Text>
//             {videos && videos.length > 0 ? (
//               videos.map((video, i) => {
//                 // Assume first lesson is unlocked.
//                 const isUnlocked = i === 0;
//                 return (
//                   <TouchableOpacity
//                     key={i}
//                     activeOpacity={isUnlocked ? 0.8 : 1}
//                     onPress={() => isUnlocked && handleVideoPress(video, i)}
//                     style={[
//                       styles.card,
//                       styles.videoCard,
//                       isUnlocked ? styles.unlockedVideoCard : styles.lockedVideoCard,
//                     ]}
//                   >
//                     <Image
//                       source={{ uri: video.thumbnail || image }}
//                       style={styles.videoThumbnail}
//                       resizeMode="cover"
//                     />
//                     <View style={styles.videoInfo}>
//                       <Text style={[styles.videoTitle, { color: currentTheme.textColor }]}>
//                         {i + 1}. {video.title}
//                       </Text>
//                       <Text style={[styles.videoDuration, { color: currentTheme.textColor }]}>
//                         {formatVideoDuration(video.duration || 0)}
//                       </Text>
//                     </View>
//                     {/* Always show the play button */}
//                     <View style={styles.playIconContainer}>
//                       <Ionicons
//                         name="play"
//                         size={24}
//                         color={isUnlocked ? currentTheme.primaryColor : '#ccc'}
//                       />
//                     </View>
//                     {/* Add lock overlay if video is locked */}
//                     {!isUnlocked && (
//                       <View style={styles.lockOverlay}>
//                         <Ionicons name="lock-closed" size={28} color="#fff" />
//                         <Text style={styles.lockText}>Locked</Text>
//                       </View>
//                     )}
//                   </TouchableOpacity>
//                 );
//               })
//             ) : (
//               <Text style={{ color: currentTheme.textColor }}>No videos available.</Text>
//             )}
//           </View>
//         )}
//       </ScrollView>

//       {/* Fixed Footer */}
//       <View style={styles.footer}>
//         <TouchableOpacity
//           style={[styles.footerPriceButton, { borderColor: currentTheme.primaryColor }]}
//           disabled={true}
//         >
//           <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//             {price && price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.footerEnrollButton, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={handleEnroll}
//         >
//           <Text style={styles.footerEnrollText}>Enroll Now</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Video Popup Modal with Custom Controller */}
//       <Modal
//         visible={!!selectedVideo}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setSelectedVideo(null)}
//       >
//         <View style={styles.videoModalContainer}>
//           <View style={styles.videoModalContent}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedVideo(null)}>
//               <Ionicons name="close" size={28} color="#fff" />
//             </TouchableOpacity>
//             {selectedVideo && (
//               <View style={styles.modalVideoContainer}>
//                 <Video
//                   ref={modalVideoRef}
//                   source={{ uri: selectedVideo.url }}
//                   style={styles.modalVideo}
//                   resizeMode="cover"
//                   shouldPlay={modalIsPlaying}
//                   isLooping={false}
//                   useNativeControls={false}
//                   onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
//                 />
//                 {/* Custom Controller Overlay */}
//                 <View style={styles.modalControls}>
//                   {videoEnded ? (
//                     <TouchableOpacity onPress={restartVideo} style={styles.modalControlButton}>
//                       <Ionicons name="refresh" size={30} color="#fff" />
//                     </TouchableOpacity>
//                   ) : (
//                     <TouchableOpacity onPress={toggleModalPlayback} style={styles.modalControlButton}>
//                       <Ionicons name={modalIsPlaying ? 'pause' : 'play'} size={30} color="#fff" />
//                     </TouchableOpacity>
//                   )}
//                   <View style={styles.progressContainer}>
//                     <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
//                   </View>
//                   <View style={styles.timeContainer}>
//                     <Text style={styles.timeText}>
//                       {Math.floor(currentTime)} / {Math.floor(videoDuration)}s
//                     </Text>
//                   </View>
//                   <TouchableOpacity
//                     onPress={() => {
//                       if (modalVideoRef.current) {
//                         modalVideoRef.current.setIsMutedAsync(!isMuted);
//                         setIsMuted(!isMuted);
//                       }
//                     }}
//                     style={styles.modalControlButton}
//                   >
//                     <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={30} color="#fff" />
//                   </TouchableOpacity>
//                 </View>
//               </View>
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Review Popup Modal */}
//       <Modal
//         visible={isReviewPopupVisible}
//         animationType="slide"
//         onRequestClose={() => setReviewPopupVisible(false)}
//         transparent={true}
//       >
//         <ReviewPopup
//           closePopup={() => setReviewPopupVisible(false)}
//           reviewableId={course._id}
//           reviewableType="Course"
//         />
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default CourseDetailScreen;

// const styles = StyleSheet.create({
//   safeArea: { flex: 1 },
//   header: {
//     width: '100%',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 35,
//     borderBottomRightRadius: 35,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 6,
//     marginBottom: 8,
//   },
//   backButton: { position: 'absolute', left: 20, padding: 10, zIndex: 10 },
//   headerTitleContainer: { alignItems: 'center' },
//   headerTitle: { fontSize: 24, fontWeight: '700', width: width * 0.65, textAlign: 'center' },
//   headerSubtitle: { fontSize: 15, fontWeight: '400', marginTop: 4, width: width * 0.6, textAlign: 'center' },
//   scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
//   loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   // Media Section
//   mediaContainer: {
//     height: 260,
//     backgroundColor: '#000',
//     borderRadius: 20,
//     overflow: 'hidden',
//     marginBottom: 24,
//     marginHorizontal: -20,
//   },
//   media: { width: '100%', height: '100%' },
//   mediaGradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 100 },
//   videoControls: { position: 'absolute', bottom: 20, right: 20, flexDirection: 'row', alignItems: 'center' },
//   controlButton: { backgroundColor: 'rgba(0,0,0,0.65)', padding: 12, borderRadius: 35, marginLeft: 12 },
//   // Enhanced Tabs
//   enhancedTabContainer: {
//     flexDirection: 'row',
//     borderRadius: 25,
//     marginHorizontal: 20,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   enhancedTabButton: {
//     flex: 1,
//     paddingVertical: 10,
//     alignItems: 'center',
//     borderRadius: 25,
//   },
//   enhancedTabText: { fontSize: 16, fontWeight: '600' },
//   // Details Container (wrapper for tab content)
//   detailsContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     padding: 20,
//     marginHorizontal: -20,
//     marginBottom: 24,
//   },
//   // Card Style for details and video items
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 15,
//     marginVertical: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   detailsCard: { backgroundColor: '#fff' },
//   title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
//   ratingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
//   starIcon: { marginRight: 3 },
//   ratingText: { marginLeft: 10, fontSize: 17, fontWeight: '500' },
//   description: { fontSize: 17, lineHeight: 26, marginBottom: 16 },
//   section: { marginTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e6e6e6' },
//   sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
//   detailGroup: { flexDirection: 'row', marginBottom: 8 },
//   detailLabel: { fontWeight: '600', width: 140, marginRight: 6 },
//   detailValue: { flex: 1 },
//   bulletItem: { fontSize: 16, marginLeft: 12, marginBottom: 6 },
//   // Video Card Styles
//   videoCard: { flexDirection: 'row', alignItems: 'center', padding: 10 },
//   unlockedVideoCard: { borderWidth: 2, borderColor: '#00C851' },
//   lockedVideoCard: {},
//   videoThumbnail: { width: 120, height: 80, borderRadius: 10 },
//   videoInfo: { flex: 1, paddingLeft: 10 },
//   videoTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
//   videoDuration: { fontSize: 16, color: '#666' },
//   // Play Icon Overlay (common for both states)
//   playIconContainer: {
//     position: 'absolute',
//     right: 20,
//     top: 30,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     padding: 10,
//     borderRadius: 20,
//   },
//   // Lock Overlay for locked videos
//   lockOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 15,
//   },
//   lockText: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 4 },
//   // Footer
//   footer: {
//     position: 'absolute',
//     bottom: 100,
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
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
//   footerEnrollButton: { flex: 1, height: 50, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
//   footerEnrollText: { color: '#fff', fontSize: 18, fontWeight: '600' },
//   // Video Modal Styles
//   videoModalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.9)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   videoModalContent: {
//     width: '90%',
//     height: '60%',
//     backgroundColor: '#000',
//     borderRadius: 15,
//     overflow: 'hidden',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 1,
//   },
//   modalVideoContainer: { flex: 1 },
//   modalVideo: { width: '100%', height: '100%' },
//   modalControls: {
//     position: 'absolute',
//     bottom: 10,
//     left: 10,
//     right: 10,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   modalControlButton: {
//     backgroundColor: 'rgba(0,0,0,0.7)',
//     padding: 5,
//     borderRadius: 25,
//     marginLeft: 10,
//   },
//   progressContainer: {
//     flex: 1,
//     height: 4,
//     backgroundColor: '#444',
//     borderRadius: 2,
//     marginHorizontal: 10,
//   },
//   progressBar: {
//     height: 4,
//     backgroundColor: '#fff',
//     borderRadius: 2,
//   },
//   timeContainer: {},
//   timeText: { color: '#fff', fontSize: 14 },
// });










// // CourseDetailScreen.js

// import React, { useState, useEffect, useContext } from 'react';
// import {
//   View,
//   Text,
//   Image,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   Modal,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';

// import { fetchCourseById } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import ReviewPopup from '../components/ReviewPopup';

// const { width } = Dimensions.get('window');

// const CourseDetailScreen = () => {
//   const route = useRoute();
//   const { courseId } = route.params;
//   const navigation = useNavigation();

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Local state for course details
//   const [course, setCourse] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Video controls
//   const [isPlaying, setIsPlaying] = useState(true);
//   const [isMuted, setIsMuted] = useState(false);

//   // For Reviews Popup
//   const [isReviewPopupVisible, setReviewPopupVisible] = useState(false);

//   // Tabs: 'description' or 'videos'
//   const [selectedTab, setSelectedTab] = useState('description');

//   // Fetch course data on mount
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

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ marginTop: 10, color: currentTheme.textColor }}>
//           Loading course details...
//         </Text>
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{ color: 'red' }}>{error}</Text>
//       </View>
//     );
//   }

//   if (!course) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={{ color: currentTheme.textColor }}>Course not found.</Text>
//       </View>
//     );
//   }

//   // Destructure course details
//   const {
//     title,
//     rating,
//     reviews,
//     description,
//     image,
//     videos,
//     shortVideoLink,
//     difficultyLevel,
//     language,
//     topics,
//     totalDuration,
//     numberOfLectures,
//     category,
//     tags,
//     requirements,
//     whatYouWillLearn,
//     price,
//   } = course;

//   // Choose main media (video if available, else image)
//   const mainVideoUrl =
//     shortVideoLink || (videos && videos.length > 0 && videos[0].url);

//   // Helper to format duration
//   const formatCourseDuration = (mins) => {
//     const hrs = Math.floor(mins / 60);
//     const remaining = mins % 60;
//     return hrs > 0 ? `${hrs}h ${remaining}m` : `${mins}m`;
//   };

//   const formatVideoDuration = (sec) => {
//     const mins = Math.floor(sec / 60);
//     const remainingSec = sec % 60;
//     return mins > 0 ? `${mins}m ${remainingSec}s` : `${sec}s`;
//   };

//   // Handlers for the footer buttons
//   const handleEnroll = () => {
//     if (price && price > 0) {
//       navigation.navigate('PurchaseScreen', { courseId: course._id });
//     } else {
//       console.log('Enrolling in free course:', course._id);
//     }
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={currentTheme.statusBarStyle}
//       />

//       {/* Enhanced Hero Header */}
//       <LinearGradient colors={currentTheme.headerBackground} style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]} numberOfLines={1}>
//             {title}
//           </Text>
//           {category && (
//             <Text
//               style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}
//               numberOfLines={1}
//               ellipsizeMode="tail"
//             >
//               {category} {language && `- ${language}`}
//             </Text>
//           )}
//         </View>
//       </LinearGradient>

//       <ScrollView
//         contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Media Section */}
//         {mainVideoUrl ? (
//           <View style={styles.mediaContainer}>
//             <Video
//               source={{ uri: mainVideoUrl }}
//               style={styles.media}
//               resizeMode="cover"
//               shouldPlay={isPlaying}
//               isLooping
//               isMuted={isMuted}
//             />
//             <LinearGradient
//               colors={['rgba(0,0,0,0.3)', 'transparent']}
//               style={styles.mediaGradient}
//             />
//             <View style={styles.videoControls}>
//               <TouchableOpacity
//                 onPress={() => setIsPlaying(!isPlaying)}
//                 style={styles.controlButton}
//               >
//                 <Ionicons
//                   name={isPlaying ? 'pause' : 'play'}
//                   size={26}
//                   color="#fff"
//                 />
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={() => setIsMuted(!isMuted)}
//                 style={styles.controlButton}
//               >
//                 <Ionicons
//                   name={isMuted ? 'volume-mute' : 'volume-high'}
//                   size={26}
//                   color="#fff"
//                 />
//               </TouchableOpacity>
//             </View>
//           </View>
//         ) : (
//           <View style={styles.mediaContainer}>
//             <Image source={{ uri: image }} style={styles.media} resizeMode="cover" />
//             <LinearGradient
//               colors={['rgba(0,0,0,0.3)', 'transparent']}
//               style={styles.mediaGradient}
//             />
//           </View>
//         )}

//         {/* Tab Navigation */}
//         <View style={styles.tabContainer}>
//           <TouchableOpacity
//             style={[
//               styles.tabButton,
//               selectedTab === 'description' && {
//                 borderBottomColor: currentTheme.primaryColor,
//                 borderBottomWidth: 3,
//               },
//             ]}
//             onPress={() => setSelectedTab('description')}
//           >
//             <Text style={[styles.tabText, { color: currentTheme.textColor }]}>Description</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[
//               styles.tabButton,
//               selectedTab === 'videos' && {
//                 borderBottomColor: currentTheme.primaryColor,
//                 borderBottomWidth: 3,
//               },
//             ]}
//             onPress={() => setSelectedTab('videos')}
//           >
//             <Text style={[styles.tabText, { color: currentTheme.textColor }]}>Videos</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Tab Content */}
//         {selectedTab === 'description' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.title, { color: currentTheme.cardTextColor }]}>{title}</Text>
//             {/* Rating & Reviews */}
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => {
//                 const filled = index < Math.floor(rating);
//                 return (
//                   <Ionicons
//                     key={index}
//                     name={filled ? 'star' : 'star-outline'}
//                     size={22}
//                     color={filled ? '#FFD700' : '#FFD70099'}
//                     style={styles.starIcon}
//                   />
//                 );
//               })}
//               <TouchableOpacity onPress={() => setReviewPopupVisible(true)}>
//                 <Text style={[styles.ratingText, { color: currentTheme.textColor }]}>
//                   ({reviews || 0} reviews)
//                 </Text>
//               </TouchableOpacity>
//             </View>
//             {/* Description */}
//             {description?.length > 0 && (
//               <Text style={[styles.description, { color: currentTheme.textColor }]}>{description}</Text>
//             )}

//             {/* Course Details */}
//             <View style={styles.section}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Course Details
//               </Text>
//               {difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Difficulty:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {difficultyLevel}
//                   </Text>
//                 </View>
//               )}
//               {language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Language:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {language}
//                   </Text>
//                 </View>
//               )}
//               {category && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Category:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {category}
//                   </Text>
//                 </View>
//               )}
//               {totalDuration > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Total Duration:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {formatCourseDuration(totalDuration)}
//                   </Text>
//                 </View>
//               )}
//               {numberOfLectures > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Lectures:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {numberOfLectures}
//                   </Text>
//                 </View>
//               )}
//               {tags && tags.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Tags:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {tags.join(', ')}
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Requirements */}
//             {!!requirements?.length && (
//               <View style={styles.section}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Requirements / Prerequisites
//                 </Text>
//                 {requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* What You'll Learn */}
//             {!!whatYouWillLearn?.length && (
//               <View style={styles.section}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   What You'll Learn
//                 </Text>
//                 {whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}

//             {/* Topics Covered */}
//             {!!topics?.length && (
//               <View style={styles.section}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Topics Covered
//                 </Text>
//                 {topics.map((topic, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     - {topic}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           // Videos Tab Content
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}>
//               Course Curriculum
//             </Text>
//             {videos && videos.length > 0 ? (
//               videos.map((video, i) => (
//                 <View key={i} style={styles.videoItem}>
//                   <Image
//                     source={{ uri: video.thumbnail || image }}
//                     style={styles.videoThumbnail}
//                     resizeMode="cover"
//                   />
//                   <View style={styles.videoInfo}>
//                     <Text style={[styles.videoTitle, { color: currentTheme.textColor }]}>
//                       {i + 1}. {video.title}
//                     </Text>
//                     <Text style={[styles.videoDuration, { color: currentTheme.textColor }]}>
//                       {formatVideoDuration(video.duration || 0)}
//                     </Text>
//                   </View>
//                   {i !== 0 && (
//                     <View style={styles.lockOverlay}>
//                       <Ionicons name="lock-closed" size={28} color="#fff" />
//                       <Text style={styles.lockText}>Locked</Text>
//                     </View>
//                   )}
//                 </View>
//               ))
//             ) : (
//               <Text style={{ color: currentTheme.textColor }}>No videos available.</Text>
//             )}
//           </View>
//         )}
//       </ScrollView>

//       {/* Fixed Footer (transparent background) */}
//       <View style={styles.footer}>
//         {/* Price Button */}
//         <TouchableOpacity
//           style={[
//             styles.footerPriceButton,
//             {
//               borderColor: currentTheme.primaryColor,
//             },
//           ]}
//           disabled={true}
//         >
//           <Text style={[styles.footerPriceText, { color: currentTheme.textColor }]}>
//             {price && price > 0 ? `$${price.toFixed(2)}` : 'Free'}
//           </Text>
//         </TouchableOpacity>

//         {/* Enroll Button */}
//         <TouchableOpacity
//           style={[
//             styles.footerEnrollButton,
//             { backgroundColor: currentTheme.primaryColor },
//           ]}
//           onPress={handleEnroll}
//         >
//           <Text style={styles.footerEnrollText}>Enroll Now</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Review Popup Modal */}
//       <Modal
//         visible={isReviewPopupVisible}
//         animationType="slide"
//         onRequestClose={() => setReviewPopupVisible(false)}
//         transparent={true}
//       >
//         <ReviewPopup
//           closePopup={() => setReviewPopupVisible(false)}
//           reviewableId={course._id}
//           reviewableType="Course"
//         />
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default CourseDetailScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 35,
//     borderBottomRightRadius: 35,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 6,
//     marginBottom: 8,
//   },
//   backButton: {
//     position: 'absolute',
//     left: 20,
//     padding: 10,
//     zIndex: 10,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     width: width * 0.65,
//     textAlign: 'center',
//   },
//   headerSubtitle: {
//     fontSize: 15,
//     fontWeight: '400',
//     marginTop: 4,
//     width: width * 0.6,
//     textAlign: 'center',
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // Media Section
//   mediaContainer: {
//     height: 260,
//     backgroundColor: '#000',
//     borderRadius: 20,
//     overflow: 'hidden',
//     marginBottom: 24,
//     marginHorizontal: -20,
//   },
//   media: {
//     width: '100%',
//     height: '100%',
//   },
//   mediaGradient: {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     bottom: 0,
//     height: 100,
//   },
//   videoControls: {
//     position: 'absolute',
//     bottom: 20,
//     right: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   controlButton: {
//     backgroundColor: 'rgba(0,0,0,0.65)',
//     padding: 12,
//     borderRadius: 35,
//     marginLeft: 12,
//   },
//   // Tabs
//   tabContainer: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     borderBottomWidth: 1,
//     borderBottomColor: '#ddd',
//     marginBottom: 16,
//   },
//   tabButton: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 10,
//   },
//   tabText: {
//     fontSize: 17,
//     fontWeight: '600',
//   },
//   // Details Container
//   detailsContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -3 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 4,
//     marginHorizontal: -20,
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     marginBottom: 12,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//   },
//   starIcon: {
//     marginRight: 3,
//   },
//   ratingText: {
//     marginLeft: 10,
//     fontSize: 17,
//     fontWeight: '500',
//   },
//   description: {
//     fontSize: 17,
//     lineHeight: 26,
//     marginBottom: 16,
//   },
//   section: {
//     marginTop: 20,
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#e6e6e6',
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 12,
//     textTransform: 'uppercase',
//     letterSpacing: 0.8,
//   },
//   detailGroup: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   detailLabel: {
//     fontWeight: '600',
//     width: 140,
//     marginRight: 6,
//   },
//   detailValue: {
//     flex: 1,
//   },
//   bulletItem: {
//     fontSize: 16,
//     marginLeft: 12,
//     marginBottom: 6,
//   },
//   // Videos Tab Styles
//   videoItem: {
//     flexDirection: 'row',
//     marginBottom: 20,
//     backgroundColor: '#fafafa',
//     borderRadius: 15,
//     overflow: 'hidden',
//     position: 'relative',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 5,
//     elevation: 3,
//   },
//   videoThumbnail: {
//     width: 130,
//     height: 90,
//   },
//   videoInfo: {
//     flex: 1,
//     padding: 14,
//     justifyContent: 'center',
//   },
//   videoTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   videoDuration: {
//     fontSize: 16,
//     marginTop: 6,
//   },
//   // Lock Overlay for Locked Videos
//   lockOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   lockText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: '600',
//     marginTop: 4,
//   },
//   // Footer (Transparent)
//   footer: {
//     position: 'absolute',
//     bottom: 100, // lifts above the custom tab bar
//     left: 0,
//     right: 0,
//     flexDirection: 'row',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     // backgroundColor: 'transparent' by default, so it won't show any block
//   },
//   footerPriceButton: {
//     width: 70,
//     height: 50,
//     borderRadius: 20, // slightly bolder corners
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
//     borderRadius: 20, // bigger radius for a sleeker look
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   footerEnrollText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: '600',
//   },
// });
