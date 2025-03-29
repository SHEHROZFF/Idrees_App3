// src/screens/EnrolledCourseScreen.js

import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { PieChart } from 'react-native-chart-kit';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

// Redux
import { useDispatch } from 'react-redux';
import {
  fetchMyEnrollmentsThunk,
  updateLessonProgressThunk,
} from '../store/slices/enrollmentSlice';
import { fetchCourseByIdThunk } from '../store/slices/courseSlice';

// Your custom alert
import CustomAlert from '../components/CustomAlert';

const EnrolledCourseScreen = () => {
  // 1) Grab dimensions
  const { width, height } = useWindowDimensions();

  // 2) Define baseWidth & scaleFactor. Then define scale(...)
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // We'll define the styles in a useMemo:
  const styles = useMemo(() => createScaledStyles({ width, height, scale }), [
    width,
    height,
    scaleFactor,
  ]);

  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const navigation = useNavigation();
  const route = useRoute();
  const { courseId } = route.params;
  const insets = useSafeAreaInsets();

  // Local states
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('overview');

  // Alert state
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertButtons, setCustomAlertButtons] = useState([]);

  // Lesson Video Modal
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalIsPlaying, setModalIsPlaying] = useState(true);
  const [videoStatus, setVideoStatus] = useState({});
  const videoRef = useRef(null);
  const [hasSeeked, setHasSeeked] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  // Fade anim for content
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch();

  // Helper for showing custom alert
  const showAlert = (title, message, buttons) => {
    setCustomAlertTitle(title);
    setCustomAlertMessage(message);
    setCustomAlertButtons(buttons || []);
    setCustomAlertVisible(true);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // 1) fetch course data
        const courseRes = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
        if (courseRes.success) {
          setCourse(courseRes.data);
        } else {
          showAlert('Error', courseRes.message);
        }
        // 2) fetch my enrollments
        const enrollRes = await dispatch(fetchMyEnrollmentsThunk()).unwrap();
        if (enrollRes.enrollments) {
          const found = enrollRes.enrollments.find((en) => en.course._id === courseId);
          if (found) {
            setEnrollment(found);
          } else {
            showAlert('Error', 'Enrollment not found for this course.');
          }
        } else {
          showAlert('Error', 'Failed to fetch enrollments.');
        }
      } catch (error) {
        showAlert('Error', error.message || 'An error occurred while loading data.');
      } finally {
        setLoading(false);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    };
    loadData();
  }, [courseId, dispatch]);

  const calculateOverallProgress = () => {
    if (!course || !course.videos || !enrollment) return 0;
    const totalLessons = course.videos.length;
    const completedLessons = (enrollment.lessonsProgress || []).filter(
      (lp) => lp.completed
    ).length;
    return totalLessons > 0 ? completedLessons / totalLessons : 0;
  };

  const handleLessonPress = (lesson) => {
    setVideoLoading(true);
    setSelectedLesson(lesson);
    setModalIsPlaying(true);
    setHasSeeked(false);
  };

  const onPlaybackStatusUpdate = (status) => {
    setVideoStatus(status);
    // Mark as complete if 90% done
    if (
      status.isLoaded &&
      status.durationMillis > 0 &&
      status.positionMillis / status.durationMillis >= 0.9 &&
      selectedLesson &&
      (!enrollment.lessonsProgress ||
        !enrollment.lessonsProgress.find(
          (lp) => lp.lessonId === selectedLesson._id && lp.completed
        ))
    ) {
      markLessonCompleted(selectedLesson);
    }
  };

  const handleVideoLoad = async () => {
    if (!hasSeeked && selectedLesson) {
      const progress = enrollment.lessonsProgress?.find(
        (lp) => lp.lessonId === selectedLesson._id
      );
      if (progress && progress.watchedDuration > 0) {
        await videoRef.current.setPositionAsync(progress.watchedDuration);
        setHasSeeked(true);
      }
    }
    setVideoLoading(false);
  };

  const markLessonCompleted = async (lesson) => {
    if (!enrollment) return;
    const lessonId = lesson._id;
    const currentProgress = enrollment.lessonsProgress || [];
    const updatedProgress = currentProgress.some((lp) => lp.lessonId === lessonId)
      ? currentProgress.map((lp) =>
          lp.lessonId === lessonId
            ? {
                ...lp,
                watchedDuration: videoStatus.positionMillis || 0,
                completed: true,
              }
            : lp
        )
      : [
          ...currentProgress,
          {
            lessonId,
            watchedDuration: videoStatus.positionMillis || 0,
            completed: true,
          },
        ];
    setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });

    try {
      const updateRes = await dispatch(
        updateLessonProgressThunk({
          courseId,
          progressData: {
            lessonId,
            watchedDuration: videoStatus.positionMillis || 0,
            completed: true,
          },
        })
      ).unwrap();
      if (!updateRes.success) {
        showAlert('Error', updateRes.message || 'Failed to update lesson progress.');
      }
    } catch (error) {
      showAlert('Error', error.message || 'Failed to update lesson progress.');
    }
  };

  const closeModal = async () => {
    if (selectedLesson && videoStatus?.isLoaded) {
      const progressUpdate = {
        lessonId: selectedLesson._id,
        watchedDuration: videoStatus.positionMillis || 0,
        completed: videoStatus.positionMillis / videoStatus.durationMillis >= 0.9,
      };
      try {
        const updateRes = await dispatch(
          updateLessonProgressThunk({
            courseId,
            progressData: progressUpdate,
          })
        ).unwrap();

        if (!updateRes.success) {
          showAlert('Error', updateRes.message || 'Failed to update lesson progress.');
        } else {
          const currentProgress = enrollment.lessonsProgress || [];
          const updatedProgress = currentProgress.some(
            (lp) => lp.lessonId === selectedLesson._id
          )
            ? currentProgress.map((lp) =>
                lp.lessonId === selectedLesson._id
                  ? {
                      ...lp,
                      watchedDuration: progressUpdate.watchedDuration,
                      completed: progressUpdate.completed,
                    }
                  : lp
              )
            : [
                ...currentProgress,
                {
                  lessonId: selectedLesson._id,
                  watchedDuration: progressUpdate.watchedDuration,
                  completed: progressUpdate.completed,
                },
              ];
          setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
        }
      } catch (err) {
        showAlert('Error', err.message || 'Failed to update lesson progress.');
      }
    }
    setSelectedLesson(null);
    setModalIsPlaying(false);
  };

  if (loading || !course || !enrollment) {
    return (
      <SafeAreaView
        style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}
      >
        <ActivityIndicator size="large" color={currentTheme.primaryColor} />
      </SafeAreaView>
    );
  }

  const overallProgress = calculateOverallProgress();
  const chartData = [
    {
      name: 'Completed',
      population: Math.round(overallProgress * 100),
      color: currentTheme.primaryColor,
      legendFontColor: currentTheme.textColor,
      legendFontSize: scale(12),
    },
    {
      name: 'Remaining',
      population: 100 - Math.round(overallProgress * 100),
      color: currentTheme.borderColor,
      legendFontColor: currentTheme.textColor,
      legendFontSize: scale(12),
    },
  ];

  return (
    <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />

      {/* Header */}
      <LinearGradient
        colors={currentTheme.headerBackground}
        style={[styles.header, { paddingTop: insets.top + scale(8) }]}
        start={[0, 0]}
        end={[0, 1]}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={scale(24)} color={currentTheme.headerTextColor} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
            {course.title}
          </Text>
          <View style={styles.progressWrapper}>
            <View
              style={[
                styles.horizontalProgressContainer,
                { backgroundColor: currentTheme.borderColor },
              ]}
            >
              <View
                style={[
                  styles.horizontalProgressBar,
                  {
                    width: `${Math.round(overallProgress * 100)}%`,
                    backgroundColor: currentTheme.primaryColor,
                  },
                ]}
              />
              <Text style={[styles.progressText, { color: currentTheme.headerTextColor }]}>
                {Math.round(overallProgress * 100)}%
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            selectedTab === 'overview' && { backgroundColor: currentTheme.primaryColor },
          ]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text
            style={[
              styles.enhancedTabText,
              { color: selectedTab === 'overview' ? '#fff' : currentTheme.textColor },
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.enhancedTabButton,
            selectedTab === 'lessons' && { backgroundColor: currentTheme.primaryColor },
          ]}
          onPress={() => setSelectedTab('lessons')}
        >
          <Text
            style={[
              styles.enhancedTabText,
              { color: selectedTab === 'lessons' ? '#fff' : currentTheme.textColor },
            ]}
          >
            Lessons
          </Text>
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={{ flex: 1, opacity: fadeAnim }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'overview' ? (
          <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
            {/* Course Description Card */}
            <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
              <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>
                {course.title}
              </Text>
              <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
                {course.description}
              </Text>
            </View>

            {/* Course Details Card */}
            <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
              <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
                Course Details
              </Text>
              <View style={styles.detailGroup}>
                <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                  Instructor:
                </Text>
                <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                  {course.instructor}
                </Text>
              </View>
              <View style={styles.detailGroup}>
                <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                  Duration:
                </Text>
                <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                  {course.totalDuration} mins
                </Text>
              </View>
              {course.difficultyLevel && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Difficulty:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {course.difficultyLevel}
                  </Text>
                </View>
              )}
              {course.language && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Language:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {course.language}
                  </Text>
                </View>
              )}
              {course.topics && course.topics.length > 0 && (
                <View style={styles.detailGroup}>
                  <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
                    Topics:
                  </Text>
                  <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
                    {course.topics.join(', ')}
                  </Text>
                </View>
              )}
            </View>

            {/* Progress Graph Card */}
            <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
              <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
                Your Progress
              </Text>
              <PieChart
                data={chartData}
                width={width - scale(40)}
                height={scale(150)}
                chartConfig={{
                  backgroundColor: currentTheme.cardBackground,
                  backgroundGradientFrom: currentTheme.cardBackground,
                  backgroundGradientTo: currentTheme.cardBackground,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: (opacity = 1) => currentTheme.textColor,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft={String(scale(15))}
                center={[scale(10), 0]}
                absolute
              />
            </View>

            {/* Requirements Card */}
            {course.requirements?.length > 0 && (
              <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
                  Requirements
                </Text>
                {course.requirements.map((req, idx) => (
                  <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
                    • {req}
                  </Text>
                ))}
              </View>
            )}
            {/* What You'll Learn Card */}
            {course.whatYouWillLearn?.length > 0 && (
              <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
                <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
                  What You'll Learn
                </Text>
                {course.whatYouWillLearn.map((item, idx) => (
                  <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
                    ✓ {item}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ) : (
          // Lesson list
          <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: scale(10) }]}>
              Lessons
            </Text>
            {course.videos.map((lesson) => {
              const lessonProgress = enrollment.lessonsProgress?.find(
                (lp) => lp.lessonId === lesson._id
              );
              const isCompleted = lessonProgress && lessonProgress.completed;
              return (
                <TouchableOpacity
                  key={lesson._id}
                  style={[
                    styles.lessonCard,
                    {
                      borderColor: currentTheme.borderColor,
                      backgroundColor: currentTheme.backgroundColor,
                    },
                  ]}
                  onPress={() => handleLessonPress(lesson)}
                >
                  <View style={styles.lessonInfo}>
                    <Ionicons name="play-circle" size={scale(20)} color={currentTheme.primaryColor} />
                    <Text style={[styles.lessonTitle, { color: currentTheme.textColor }]}>
                      {lesson.title}
                    </Text>
                  </View>
                  {isCompleted && (
                    <Ionicons
                      name="checkmark-circle"
                      size={scale(22)}
                      color={currentTheme.primaryColor}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Animated.ScrollView>

      {/* Fullscreen Modal for Lesson Playback */}
      <Modal
        visible={!!selectedLesson}
        animationType="slide"
        onRequestClose={closeModal}
        transparent={false}
      >
        <SafeAreaView
          style={[styles.modalFullContainer, { backgroundColor: '#000' }]}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
              <Ionicons name="close" size={scale(28)} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.videoFullContainer}>
            {selectedLesson && (
              <Video
                ref={videoRef}
                source={{ uri: selectedLesson.url }}
                style={styles.videoFullPlayer}
                resizeMode="contain"
                shouldPlay={modalIsPlaying}
                useNativeControls
                onLoad={handleVideoLoad}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
              />
            )}
            {videoLoading && (
              <ActivityIndicator
                style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
                size="large"
                color={currentTheme.primaryColor}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        buttons={
          customAlertButtons.length
            ? customAlertButtons
            : [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
        }
        onClose={() => setCustomAlertVisible(false)}
      />
    </View>
  );
};

export default EnrolledCourseScreen;

/** ------------------------------------------------------------------
 *  CREATE SCALED STYLES
 * ----------------------------------------------------------------- */
const createScaledStyles = ({ width, height, scale }) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Header
    header: {
      width: '100%',
      paddingVertical: scale(8),
      paddingHorizontal: scale(16),
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
    },
    backButton: {
      position: 'absolute',
      left: scale(20),
      padding: scale(10),
      zIndex: 10,
    },
    headerTitleContainer: {
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: scale(20),
      fontWeight: '700',
      width: '70%',
      textAlign: 'center',
    },
    progressWrapper: {
      marginTop: scale(6),
      alignItems: 'center',
    },
    horizontalProgressContainer: {
      width: scale(200),
      height: scale(12),
      borderRadius: scale(25),
      overflow: 'hidden',
      marginBottom: scale(2),
      flexDirection: 'row',
      alignItems: 'center',
      position: 'relative',
    },
    horizontalProgressBar: {
      height: '100%',
    },
    progressText: {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      fontSize: scale(10),
      fontWeight: '600',
    },

    // Tab
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

    // Content
    scrollContent: {
      paddingHorizontal: scale(20),
      paddingBottom: scale(30),
    },
    detailsContainer: {
      borderTopLeftRadius: scale(30),
      borderTopRightRadius: scale(30),
      borderBottomLeftRadius: scale(30),
      borderBottomRightRadius: scale(30),
      padding: scale(20),
      marginHorizontal: scale(-20),
      marginBottom: scale(24),
    },
    card: {
      borderRadius: scale(15),
      padding: scale(15),
      marginBottom: scale(15),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.1,
      shadowRadius: scale(4),
      elevation: scale(3),
    },
    cardTitle: {
      fontSize: scale(20),
      fontWeight: '700',
      marginBottom: scale(10),
    },
    cardText: {
      fontSize: scale(16),
      lineHeight: scale(24),
    },
    sectionTitle: {
      fontSize: scale(18),
      fontWeight: '700',
      marginBottom: scale(10),
    },
    detailGroup: {
      flexDirection: 'row',
      marginBottom: scale(8),
    },
    detailLabel: {
      fontWeight: '600',
      width: scale(100),
    },
    detailValue: {
      flex: 1,
    },
    bulletItem: {
      fontSize: scale(16),
      marginLeft: scale(12),
      marginBottom: scale(6),
    },

    // Lessons
    lessonCard: {
      padding: scale(15),
      borderRadius: scale(12),
      borderWidth: scale(1),
      marginBottom: scale(10),
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(2) },
      shadowOpacity: 0.1,
      shadowRadius: scale(3),
      elevation: scale(2),
    },
    lessonInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    lessonTitle: {
      fontSize: scale(16),
      marginLeft: scale(8),
      fontWeight: '500',
    },

    // Fullscreen Modal
    modalFullContainer: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      padding: scale(10),
    },
    modalCloseButton: {
      padding: scale(6),
    },
    videoFullContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    videoFullPlayer: {
      width: '100%',
      height: '100%',
    },
  });










// // src/screens/EnrolledCourseScreen.js

// import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Modal,
//   Animated,
//   Platform,
//   useWindowDimensions,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import { PieChart } from 'react-native-chart-kit';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Redux
// import { useDispatch } from 'react-redux';
// import {
//   fetchMyEnrollmentsThunk,
//   updateLessonProgressThunk,
// } from '../store/slices/enrollmentSlice';
// import { fetchCourseByIdThunk } from '../store/slices/courseSlice';

// // Your custom alert
// import CustomAlert from '../components/CustomAlert';

// const EnrolledCourseScreen = () => {
//   // 1) Grab dimensions
//   const { width, height } = useWindowDimensions();

//   // 2) Define baseWidth & scaleFactor. Then define scale(...)
//   const baseWidth = width > 375 ? 460 : 500;
//   const scaleFactor = width / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   // We'll define the styles in a useMemo:
//   const styles = useMemo(() => createScaledStyles({ width, height, scale, scaleFactor }), [
//     width,
//     height,
//     scaleFactor,
//   ]);

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;
//   const insets = useSafeAreaInsets();

//   // Local states
//   const [course, setCourse] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState('overview');

//   // Alert state
//   const [customAlertVisible, setCustomAlertVisible] = useState(false);
//   const [customAlertTitle, setCustomAlertTitle] = useState('');
//   const [customAlertMessage, setCustomAlertMessage] = useState('');
//   const [customAlertButtons, setCustomAlertButtons] = useState([]);

//   // Lesson Video Modal
//   const [selectedLesson, setSelectedLesson] = useState(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [videoStatus, setVideoStatus] = useState({});
//   const videoRef = useRef(null);
//   const [hasSeeked, setHasSeeked] = useState(false);
//   const [videoLoading, setVideoLoading] = useState(true);

//   // Fade anim for content
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const dispatch = useDispatch();

//   // Helper for showing custom alert
//   const showAlert = (title, message, buttons) => {
//     setCustomAlertTitle(title);
//     setCustomAlertMessage(message);
//     setCustomAlertButtons(buttons || []);
//     setCustomAlertVisible(true);
//   };

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const courseRes = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
//         if (courseRes.success) {
//           setCourse(courseRes.data);
//         } else {
//           showAlert('Error', courseRes.message);
//         }

//         const enrollRes = await dispatch(fetchMyEnrollmentsThunk()).unwrap();
//         if (enrollRes.enrollments) {
//           const found = enrollRes.enrollments.find((en) => en.course._id === courseId);
//           if (found) {
//             setEnrollment(found);
//           } else {
//             showAlert('Error', 'Enrollment not found for this course.');
//           }
//         } else {
//           showAlert('Error', 'Failed to fetch enrollments.');
//         }
//       } catch (error) {
//         showAlert('Error', error.message || 'An error occurred while loading data.');
//       } finally {
//         setLoading(false);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }).start();
//       }
//     };
//     loadData();
//   }, [courseId, dispatch]);

//   const calculateOverallProgress = () => {
//     if (!course || !course.videos || !enrollment) return 0;
//     const totalLessons = course.videos.length;
//     const completedLessons = (enrollment.lessonsProgress || []).filter(
//       (lp) => lp.completed
//     ).length;
//     return totalLessons > 0 ? completedLessons / totalLessons : 0;
//   };

//   const handleLessonPress = (lesson) => {
//     setVideoLoading(true);
//     setSelectedLesson(lesson);
//     setModalIsPlaying(true);
//     setHasSeeked(false);
//   };

//   const onPlaybackStatusUpdate = (status) => {
//     setVideoStatus(status);
//     if (
//       status.isLoaded &&
//       status.durationMillis > 0 &&
//       status.positionMillis / status.durationMillis >= 0.9 &&
//       selectedLesson &&
//       (!enrollment.lessonsProgress ||
//         !enrollment.lessonsProgress.find(
//           (lp) => lp.lessonId === selectedLesson._id && lp.completed
//         ))
//     ) {
//       markLessonCompleted(selectedLesson);
//     }
//   };

//   const handleVideoLoad = async () => {
//     if (!hasSeeked && selectedLesson) {
//       const progress = enrollment.lessonsProgress?.find(
//         (lp) => lp.lessonId === selectedLesson._id
//       );
//       if (progress && progress.watchedDuration > 0) {
//         await videoRef.current.setPositionAsync(progress.watchedDuration);
//         setHasSeeked(true);
//       }
//     }
//     setVideoLoading(false);
//   };

//   const markLessonCompleted = async (lesson) => {
//     if (!enrollment) return;
//     const lessonId = lesson._id;
//     const currentProgress = enrollment.lessonsProgress || [];
//     const updatedProgress = currentProgress.some((lp) => lp.lessonId === lessonId)
//       ? currentProgress.map((lp) =>
//           lp.lessonId === lessonId
//             ? {
//                 ...lp,
//                 watchedDuration: videoStatus.positionMillis || 0,
//                 completed: true,
//               }
//             : lp
//         )
//       : [
//           ...currentProgress,
//           {
//             lessonId,
//             watchedDuration: videoStatus.positionMillis || 0,
//             completed: true,
//           },
//         ];
//     setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });

//     try {
//       const updateRes = await dispatch(
//         updateLessonProgressThunk({
//           courseId,
//           progressData: {
//             lessonId,
//             watchedDuration: videoStatus.positionMillis || 0,
//             completed: true,
//           },
//         })
//       ).unwrap();
//       if (!updateRes.success) {
//         showAlert('Error', updateRes.message || 'Failed to update lesson progress.');
//       }
//     } catch (error) {
//       showAlert('Error', error.message || 'Failed to update lesson progress.');
//     }
//   };

//   const closeModal = async () => {
//     if (selectedLesson && videoStatus?.isLoaded) {
//       const progressUpdate = {
//         lessonId: selectedLesson._id,
//         watchedDuration: videoStatus.positionMillis || 0,
//         completed: videoStatus.positionMillis / videoStatus.durationMillis >= 0.9,
//       };
//       try {
//         const updateRes = await dispatch(
//           updateLessonProgressThunk({
//             courseId,
//             progressData: progressUpdate,
//           })
//         ).unwrap();

//         if (!updateRes.success) {
//           showAlert('Error', updateRes.message || 'Failed to update lesson progress.');
//         } else {
//           const currentProgress = enrollment.lessonsProgress || [];
//           const updatedProgress = currentProgress.some(
//             (lp) => lp.lessonId === selectedLesson._id
//           )
//             ? currentProgress.map((lp) =>
//                 lp.lessonId === selectedLesson._id
//                   ? {
//                       ...lp,
//                       watchedDuration: progressUpdate.watchedDuration,
//                       completed: progressUpdate.completed,
//                     }
//                   : lp
//               )
//             : [
//                 ...currentProgress,
//                 {
//                   lessonId: selectedLesson._id,
//                   watchedDuration: progressUpdate.watchedDuration,
//                   completed: progressUpdate.completed,
//                 },
//               ];
//           setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//         }
//       } catch (err) {
//         showAlert('Error', err.message || 'Failed to update lesson progress.');
//       }
//     }
//     setSelectedLesson(null);
//     setModalIsPlaying(false);
//   };

//   if (loading || !course || !enrollment) {
//     return (
//       <SafeAreaView
//         style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}
//       >
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//       </SafeAreaView>
//     );
//   }

//   const overallProgress = calculateOverallProgress();
//   const chartData = [
//     {
//       name: 'Completed',
//       population: Math.round(overallProgress * 100),
//       color: currentTheme.primaryColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: scale(12),
//     },
//     {
//       name: 'Remaining',
//       population: 100 - Math.round(overallProgress * 100),
//       color: currentTheme.borderColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: scale(12),
//     },
//   ];

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header, { paddingTop: insets.top + scale(8) }]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons
//             name="arrow-back"
//             size={scale(24)}
//             color={currentTheme.headerTextColor}
//           />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text
//             style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}
//             numberOfLines={1}
//           >
//             {course.title}
//           </Text>
//           <View style={styles.progressWrapper}>
//             <View
//               style={[
//                 styles.horizontalProgressContainer,
//                 { backgroundColor: currentTheme.borderColor },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.horizontalProgressBar,
//                   {
//                     width: `${Math.round(overallProgress * 100)}%`,
//                     backgroundColor: currentTheme.primaryColor,
//                   },
//                 ]}
//               />
//               <Text
//                 style={[
//                   styles.progressText,
//                   {
//                     color: currentTheme.headerTextColor,
//                   },
//                 ]}
//               >
//                 {Math.round(overallProgress * 100)}%
//               </Text>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>

//       <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//         <TouchableOpacity
//           style={[
//             styles.enhancedTabButton,
//             selectedTab === 'overview' && { backgroundColor: currentTheme.primaryColor },
//           ]}
//           onPress={() => setSelectedTab('overview')}
//         >
//           <Text
//             style={[
//               styles.enhancedTabText,
//               { color: selectedTab === 'overview' ? '#fff' : currentTheme.textColor },
//             ]}
//           >
//             Overview
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.enhancedTabButton,
//             selectedTab === 'lessons' && { backgroundColor: currentTheme.primaryColor },
//           ]}
//           onPress={() => setSelectedTab('lessons')}
//         >
//           <Text
//             style={[
//               styles.enhancedTabText,
//               { color: selectedTab === 'lessons' ? '#fff' : currentTheme.textColor },
//             ]}
//           >
//             Lessons
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Animated.ScrollView
//         style={{ flex: 1, opacity: fadeAnim }}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {selectedTab === 'overview' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {/* Course Description Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>
//                 {course.title}
//               </Text>
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 {course.description}
//               </Text>
//             </View>

//             {/* Course Details Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Course Details
//               </Text>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                   Instructor:
//                 </Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                   {course.instructor}
//                 </Text>
//               </View>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                   Duration:
//                 </Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                   {course.totalDuration} mins
//                 </Text>
//               </View>
//               {course.difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Difficulty:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.difficultyLevel}
//                   </Text>
//                 </View>
//               )}
//               {course.language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Language:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.language}
//                   </Text>
//                 </View>
//               )}
//               {course.topics && course.topics.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Topics:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.topics.join(', ')}
//                   </Text>
//                 </View>
//               )}
//             </View>

//             {/* Progress Graph Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Your Progress
//               </Text>
//               <PieChart
//                 data={chartData}
//                 width={width - scale(40)}
//                 height={scale(150)}
//                 chartConfig={{
//                   backgroundColor: currentTheme.cardBackground,
//                   backgroundGradientFrom: currentTheme.cardBackground,
//                   backgroundGradientTo: currentTheme.cardBackground,
//                   color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   labelColor: (opacity = 1) => currentTheme.textColor,
//                 }}
//                 accessor="population"
//                 backgroundColor="transparent"
//                 paddingLeft={scale(15).toString()}
//                 center={[scale(10), 0]}
//                 absolute
//               />
//             </View>

//             {/* Requirements Card */}
//             {course.requirements?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Requirements
//                 </Text>
//                 {course.requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}
//             {/* What You'll Learn Card */}
//             {course.whatYouWillLearn?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   What You'll Learn
//                 </Text>
//                 {course.whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: scale(10) }]}>
//               Lessons
//             </Text>
//             {course.videos.map((lesson) => {
//               const lessonProgress = enrollment.lessonsProgress?.find(
//                 (lp) => lp.lessonId === lesson._id
//               );
//               const isCompleted = lessonProgress && lessonProgress.completed;
//               return (
//                 <TouchableOpacity
//                   key={lesson._id}
//                   style={[
//                     styles.lessonCard,
//                     {
//                       borderColor: currentTheme.borderColor,
//                       backgroundColor: currentTheme.backgroundColor,
//                     },
//                   ]}
//                   onPress={() => handleLessonPress(lesson)}
//                 >
//                   <View style={styles.lessonInfo}>
//                     <Ionicons
//                       name="play-circle"
//                       size={scale(20)}
//                       color={currentTheme.primaryColor}
//                     />
//                     <Text style={[styles.lessonTitle, { color: currentTheme.textColor }]}>
//                       {lesson.title}
//                     </Text>
//                   </View>
//                   {isCompleted && (
//                     <Ionicons
//                       name="checkmark-circle"
//                       size={scale(22)}
//                       color={currentTheme.primaryColor}
//                     />
//                   )}
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         )}
//       </Animated.ScrollView>

//       {/* Modal for Lesson Playback */}
//       <Modal visible={!!selectedLesson} animationType="slide" onRequestClose={closeModal} transparent>
//         <View style={styles.modalContainer}>
//           <View style={[styles.modalContent, { backgroundColor: currentTheme.backgroundColor }]}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
//               <Ionicons name="close" size={scale(28)} color={currentTheme.textColor} />
//             </TouchableOpacity>
//             {selectedLesson && (
//               <Video
//                 ref={videoRef}
//                 source={{ uri: selectedLesson.url }}
//                 style={styles.videoPlayer}
//                 useNativeControls
//                 resizeMode="cover"
//                 shouldPlay={modalIsPlaying}
//                 onLoad={handleVideoLoad}
//                 onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//               />
//             )}
//             {videoLoading && (
//               <ActivityIndicator
//                 style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}
//                 size="large"
//                 color={currentTheme.primaryColor}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>

//       {/* Custom Alert */}
//       <CustomAlert
//         visible={customAlertVisible}
//         title={customAlertTitle}
//         message={customAlertMessage}
//         buttons={
//           customAlertButtons.length
//             ? customAlertButtons
//             : [{ text: 'OK', onPress: () => setCustomAlertVisible(false) }]
//         }
//         onClose={() => setCustomAlertVisible(false)}
//       />
//     </View>
//   );
// };

// export default EnrolledCourseScreen;

// /** ------------------------------------------------------------------
//  *  CREATE SCALED STYLES
//  * ----------------------------------------------------------------- */
// const createScaledStyles = ({ width, height, scale, scaleFactor }) =>
//   StyleSheet.create({
//     safeArea: {
//       flex: 1,
//     },
//     loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     header: {
//       width: '100%',
//       paddingVertical: scale(8),
//       paddingHorizontal: scale(16),
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       borderBottomLeftRadius: scale(35),
//       borderBottomRightRadius: scale(35),
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: scale(4) },
//       shadowOpacity: 0.25,
//       shadowRadius: scale(6),
//       elevation: scale(6),
//       marginBottom: scale(8),
//     },
//     backButton: {
//       position: 'absolute',
//       left: scale(20),
//       padding: scale(10),
//       zIndex: 10,
//     },
//     headerTitleContainer: {
//       alignItems: 'center',
//     },
//     headerTitle: {
//       fontSize: scale(20),
//       fontWeight: '700',
//       width: '70%',
//       textAlign: 'center',
//     },
//     progressWrapper: {
//       marginTop: scale(6),
//       alignItems: 'center',
//     },
//     horizontalProgressContainer: {
//       width: scale(200),
//       height: scale(12),
//       borderRadius: scale(25),
//       overflow: 'hidden',
//       marginBottom: scale(2),
//       flexDirection: 'row',
//       alignItems: 'center',
//       position: 'relative',
//     },
//     horizontalProgressBar: {
//       height: '100%',
//     },
//     progressText: {
//       position: 'absolute',
//       width: '100%',
//       textAlign: 'center',
//       fontSize: scale(10),
//       fontWeight: '600',
//     },
//     enhancedTabContainer: {
//       flexDirection: 'row',
//       borderRadius: scale(25),
//       marginHorizontal: scale(20),
//       marginBottom: scale(20),
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: scale(2) },
//       shadowOpacity: 0.1,
//       shadowRadius: scale(4),
//       elevation: scale(2),
//     },
//     enhancedTabButton: {
//       flex: 1,
//       paddingVertical: scale(10),
//       alignItems: 'center',
//       borderRadius: scale(25),
//     },
//     enhancedTabText: {
//       fontSize: scale(16),
//       fontWeight: '600',
//     },
//     scrollContent: {
//       paddingHorizontal: scale(20),
//       paddingBottom: scale(30),
//     },
//     detailsContainer: {
//       borderTopLeftRadius: scale(30),
//       borderTopRightRadius: scale(30),
//       borderBottomLeftRadius: scale(30),
//       borderBottomRightRadius: scale(30),
//       padding: scale(20),
//       marginHorizontal: scale(-20),
//       marginBottom: scale(24),
//     },
//     card: {
//       borderRadius: scale(15),
//       padding: scale(15),
//       marginBottom: scale(15),
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: scale(2) },
//       shadowOpacity: 0.1,
//       shadowRadius: scale(4),
//       elevation: scale(3),
//     },
//     cardTitle: {
//       fontSize: scale(20),
//       fontWeight: '700',
//       marginBottom: scale(10),
//     },
//     cardText: {
//       fontSize: scale(16),
//       lineHeight: scale(24),
//     },
//     sectionTitle: {
//       fontSize: scale(18),
//       fontWeight: '700',
//       marginBottom: scale(10),
//     },
//     detailGroup: {
//       flexDirection: 'row',
//       marginBottom: scale(8),
//     },
//     detailLabel: {
//       fontWeight: '600',
//       width: scale(100),
//     },
//     detailValue: {
//       flex: 1,
//     },
//     bulletItem: {
//       fontSize: scale(16),
//       marginLeft: scale(12),
//       marginBottom: scale(6),
//     },
//     lessonCard: {
//       padding: scale(15),
//       borderRadius: scale(12),
//       borderWidth: scale(1),
//       marginBottom: scale(10),
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: scale(2) },
//       shadowOpacity: 0.1,
//       shadowRadius: scale(3),
//       elevation: scale(2),
//     },
//     lessonInfo: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     lessonTitle: {
//       fontSize: scale(16),
//       marginLeft: scale(8),
//       fontWeight: '500',
//     },
//     modalContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: 'rgba(0,0,0,0.85)',
//     },
//     modalContent: {
//       width: scale(300),
//       height: scale(200),
//       borderRadius: scale(15),
//       overflow: 'hidden',
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     modalCloseButton: {
//       position: 'absolute',
//       top: scale(10),
//       right: scale(10),
//       zIndex: 10,
//     },
//     videoPlayer: {
//       width: '100%',
//       height: '100%',
//     },
//   });





// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Modal,
//   Alert,
//   Animated,
//   Platform,
//   useWindowDimensions,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import { PieChart } from 'react-native-chart-kit';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // --- Redux imports ---
// import { useDispatch } from 'react-redux';
// import {
//   fetchMyEnrollmentsThunk,
//   updateLessonProgressThunk,
// } from '../store/slices/enrollmentSlice';
// import { fetchCourseByIdThunk } from '../store/slices/courseSlice';

// const EnrolledCourseScreen = () => {
//   // Use the responsive hook here
//   const { width, height } = useWindowDimensions();
//   // Create a styles object that uses the current dimensions
//   const styles = createStyles(width, height);

//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;

//   // Local states for course/enrollment as before
//   const [course, setCourse] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState('overview');

//   const insets = useSafeAreaInsets();

//   // For lesson video modal
//   const [selectedLesson, setSelectedLesson] = useState(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [videoStatus, setVideoStatus] = useState({});
//   const videoRef = useRef(null);
//   const [hasSeeked, setHasSeeked] = useState(false);

//   // Fade animation for scroll content
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Redux dispatcher
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         // Fetch course details from Redux
//         const courseRes = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
//         if (courseRes.success) {
//           setCourse(courseRes.data);
//         } else {
//           Alert.alert('Error', courseRes.message);
//         }

//         // Fetch enrollments from Redux
//         const enrollRes = await dispatch(fetchMyEnrollmentsThunk()).unwrap();
//         if (enrollRes.enrollments) {
//           const found = enrollRes.enrollments.find((en) => en.course._id === courseId);
//           if (found) {
//             setEnrollment(found);
//           } else {
//             Alert.alert('Error', 'Enrollment not found for this course.');
//           }
//         } else {
//           Alert.alert('Error', 'Failed to fetch enrollments.');
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message || 'An error occurred while loading data.');
//       } finally {
//         setLoading(false);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }).start();
//       }
//     };
//     loadData();
//   }, [courseId, dispatch, fadeAnim]);

//   const calculateOverallProgress = () => {
//     if (!course || !course.videos || !enrollment) return 0;
//     const totalLessons = course.videos.length;
//     const completedLessons = (enrollment.lessonsProgress || []).filter(
//       (lp) => lp.completed
//     ).length;
//     return totalLessons > 0 ? completedLessons / totalLessons : 0;
//   };

//   const handleLessonPress = (lesson) => {
//     setSelectedLesson(lesson);
//     setModalIsPlaying(true);
//     setHasSeeked(false);
//   };

//   const onPlaybackStatusUpdate = (status) => {
//     setVideoStatus(status);
//     if (
//       status.isLoaded &&
//       status.durationMillis > 0 &&
//       status.positionMillis / status.durationMillis >= 0.9 &&
//       selectedLesson &&
//       (!enrollment.lessonsProgress ||
//         !enrollment.lessonsProgress.find(
//           (lp) => lp.lessonId === selectedLesson._id && lp.completed
//         ))
//     ) {
//       markLessonCompleted(selectedLesson);
//     }
//   };

//   const handleVideoLoad = () => {
//     if (!hasSeeked && selectedLesson) {
//       const progress = enrollment.lessonsProgress?.find(
//         (lp) => lp.lessonId === selectedLesson._id
//       );
//       if (progress && progress.watchedDuration > 0) {
//         videoRef.current.setPositionAsync(progress.watchedDuration);
//         setHasSeeked(true);
//       }
//     }
//   };

//   const markLessonCompleted = async (lesson) => {
//     if (!enrollment) return;
//     const lessonId = lesson._id;
//     const currentProgress = enrollment.lessonsProgress || [];
//     const updatedProgress = currentProgress.some((lp) => lp.lessonId === lessonId)
//       ? currentProgress.map((lp) =>
//           lp.lessonId === lessonId
//             ? { ...lp, watchedDuration: videoStatus.positionMillis || 0, completed: true }
//             : lp
//         )
//       : [
//           ...currentProgress,
//           { lessonId, watchedDuration: videoStatus.positionMillis || 0, completed: true },
//         ];
//     setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });

//     try {
//       const updateRes = await dispatch(
//         updateLessonProgressThunk({
//           courseId,
//           progressData: {
//             lessonId,
//             watchedDuration: videoStatus.positionMillis || 0,
//             completed: true,
//           },
//         })
//       ).unwrap();
//       if (!updateRes.success) {
//         Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to update lesson progress.');
//     }
//   };

//   const closeModal = async () => {
//     if (selectedLesson && videoStatus?.isLoaded) {
//       const progressUpdate = {
//         lessonId: selectedLesson._id,
//         watchedDuration: videoStatus.positionMillis || 0,
//         completed: videoStatus.positionMillis / videoStatus.durationMillis >= 0.9,
//       };
//       try {
//         const updateRes = await dispatch(
//           updateLessonProgressThunk({
//             courseId,
//             progressData: progressUpdate,
//           })
//         ).unwrap();

//         if (!updateRes.success) {
//           Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//         } else {
//           const currentProgress = enrollment.lessonsProgress || [];
//           const updatedProgress = currentProgress.some(
//             (lp) => lp.lessonId === selectedLesson._id
//           )
//             ? currentProgress.map((lp) =>
//                 lp.lessonId === selectedLesson._id
//                   ? {
//                       ...lp,
//                       watchedDuration: progressUpdate.watchedDuration,
//                       completed: progressUpdate.completed,
//                     }
//                   : lp
//               )
//             : [
//                 ...currentProgress,
//                 {
//                   lessonId: selectedLesson._id,
//                   watchedDuration: progressUpdate.watchedDuration,
//                   completed: progressUpdate.completed,
//                 },
//               ];
//           setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//         }
//       } catch (err) {
//         Alert.alert('Error', err.message || 'Failed to update lesson progress.');
//       }
//     }
//     setSelectedLesson(null);
//     setModalIsPlaying(false);
//   };

//   if (loading || !course || !enrollment) {
//     return (
//       <SafeAreaView
//         style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}
//       >
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//       </SafeAreaView>
//     );
//   }

//   const overallProgress = calculateOverallProgress();
//   const chartData = [
//     {
//       name: 'Completed',
//       population: Math.round(overallProgress * 100),
//       color: currentTheme.primaryColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//     {
//       name: 'Remaining',
//       population: 100 - Math.round(overallProgress * 100),
//       color: currentTheme.borderColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//   ];

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header, { paddingTop: insets.top }]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text
//             style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}
//             numberOfLines={1}
//           >
//             {course.title}
//           </Text>
//           <View style={styles.progressWrapper}>
//             <View
//               style={[styles.horizontalProgressContainer, { backgroundColor: currentTheme.borderColor }]}
//             >
//               <View
//                 style={[
//                   styles.horizontalProgressBar,
//                   {
//                     width: `${Math.round(overallProgress * 100)}%`,
//                     backgroundColor: currentTheme.primaryColor,
//                   },
//                 ]}
//               />
//               <Text
//                 style={[
//                   styles.progressText,
//                   {
//                     color: currentTheme.headerTextColor,
//                     position: 'absolute',
//                     width: '100%',
//                     textAlign: 'center',
//                   },
//                 ]}
//               >
//                 {Math.round(overallProgress * 100)}%
//               </Text>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>

//       <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//         <TouchableOpacity
//           style={[
//             styles.enhancedTabButton,
//             selectedTab === 'overview' && { backgroundColor: currentTheme.primaryColor },
//           ]}
//           onPress={() => setSelectedTab('overview')}
//         >
//           <Text
//             style={[
//               styles.enhancedTabText,
//               { color: selectedTab === 'overview' ? '#fff' : currentTheme.textColor },
//             ]}
//           >
//             Overview
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.enhancedTabButton,
//             selectedTab === 'lessons' && { backgroundColor: currentTheme.primaryColor },
//           ]}
//           onPress={() => setSelectedTab('lessons')}
//         >
//           <Text
//             style={[
//               styles.enhancedTabText,
//               { color: selectedTab === 'lessons' ? '#fff' : currentTheme.textColor },
//             ]}
//           >
//             Lessons
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Animated.ScrollView
//         style={{ flex: 1, opacity: fadeAnim }}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {selectedTab === 'overview' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {/* Course Description Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>
//                 {course.title}
//               </Text>
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 {course.description}
//               </Text>
//             </View>
//             {/* Course Details Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Course Details
//               </Text>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                   Instructor:
//                 </Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                   {course.instructor}
//                 </Text>
//               </View>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                   Duration:
//                 </Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                   {course.totalDuration} mins
//                 </Text>
//               </View>
//               {course.difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Difficulty:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.difficultyLevel}
//                   </Text>
//                 </View>
//               )}
//               {course.language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Language:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.language}
//                   </Text>
//                 </View>
//               )}
//               {course.topics && course.topics.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Topics:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.topics.join(', ')}
//                   </Text>
//                 </View>
//               )}
//             </View>
//             {/* Progress Graph Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Your Progress
//               </Text>
//               <PieChart
//                 data={chartData}
//                 width={width - 40}
//                 height={150}
//                 chartConfig={{
//                   backgroundColor: currentTheme.cardBackground,
//                   backgroundGradientFrom: currentTheme.cardBackground,
//                   backgroundGradientTo: currentTheme.cardBackground,
//                   color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   labelColor: (opacity = 1) => currentTheme.textColor,
//                 }}
//                 accessor="population"
//                 backgroundColor="transparent"
//                 paddingLeft="15"
//                 center={[10, 0]}
//                 absolute
//               />
//             </View>
//             {/* Requirements Card */}
//             {course.requirements?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Requirements
//                 </Text>
//                 {course.requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}
//             {/* What You'll Learn Card */}
//             {course.whatYouWillLearn?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   What You'll Learn
//                 </Text>
//                 {course.whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}>
//               Lessons
//             </Text>
//             {course.videos.map((lesson) => {
//               const lessonProgress = enrollment.lessonsProgress?.find(
//                 (lp) => lp.lessonId === lesson._id
//               );
//               const isCompleted = lessonProgress && lessonProgress.completed;
//               return (
//                 <TouchableOpacity
//                   key={lesson._id}
//                   style={[
//                     styles.lessonCard,
//                     { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.backgroundColor },
//                   ]}
//                   onPress={() => handleLessonPress(lesson)}
//                 >
//                   <View style={styles.lessonInfo}>
//                     <Ionicons name="play-circle" size={20} color={currentTheme.primaryColor} />
//                     <Text style={[styles.lessonTitle, { color: currentTheme.textColor }]}>
//                       {lesson.title}
//                     </Text>
//                   </View>
//                   {isCompleted && (
//                     <Ionicons name="checkmark-circle" size={22} color={currentTheme.primaryColor} />
//                   )}
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         )}
//       </Animated.ScrollView>

//       {/* Modal for Lesson Playback */}
//       <Modal visible={!!selectedLesson} animationType="slide" onRequestClose={closeModal} transparent>
//         <View style={styles.modalContainer}>
//           <View style={[styles.modalContent, { backgroundColor: currentTheme.backgroundColor }]}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
//               <Ionicons name="close" size={28} color={currentTheme.textColor} />
//             </TouchableOpacity>
//             {selectedLesson && (
//               <Video
//                 ref={videoRef}
//                 source={{ uri: selectedLesson.url }}
//                 style={styles.videoPlayer}
//                 useNativeControls
//                 resizeMode="cover"
//                 shouldPlay={modalIsPlaying}
//                 onLoad={handleVideoLoad}
//                 onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default EnrolledCourseScreen;

// const createStyles = (width, height) =>
//   StyleSheet.create({
//     safeArea: {
//       flex: 1,
//     },
//     loadingContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     header: {
//       width: '100%',
//       paddingVertical: 8,
//       paddingHorizontal: width * 0.05,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       borderBottomLeftRadius: width * 0.1,
//       borderBottomRightRadius: width * 0.1,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: height * 0.005 },
//       shadowOpacity: 0.25,
//       shadowRadius: 6,
//       elevation: 6,
//       marginBottom: 8,
//     },
//     backButton: {
//       position: 'absolute',
//       left: 20,
//       paddingTop: Platform.OS === 'ios' ? 50 : 10,
//       padding: 10,
//       zIndex: 10,
//     },
//     headerTitleContainer: {
//       alignItems: 'center',
//     },
//     headerTitle: {
//       fontSize: width * 0.06,
//       fontWeight: '700',
//       width: width * 0.65,
//       textAlign: 'center',
//     },
//     progressWrapper: {
//       marginTop: 8,
//       alignItems: 'center',
//     },
//     horizontalProgressContainer: {
//       width: width * 0.7,
//       height: 12,
//       borderRadius: 25,
//       overflow: 'hidden',
//       marginBottom: 2,
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     horizontalProgressBar: {
//       height: '100%',
//     },
//     progressText: {
//       fontSize: 10,
//       fontWeight: '600',
//       marginLeft: 5,
//     },
//     enhancedTabContainer: {
//       flexDirection: 'row',
//       borderRadius: 25,
//       marginHorizontal: width * 0.05,
//       marginBottom: 20,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 2,
//     },
//     enhancedTabButton: {
//       flex: 1,
//       paddingVertical: 10,
//       alignItems: 'center',
//       borderRadius: 25,
//     },
//     enhancedTabText: {
//       fontSize: 16,
//       fontWeight: '600',
//     },
//     scrollContent: {
//       paddingHorizontal: width * 0.05,
//       paddingBottom: 30,
//     },
//     detailsContainer: {
//       borderTopLeftRadius: 30,
//       borderTopRightRadius: 30,
//       borderBottomLeftRadius: 30,
//       borderBottomRightRadius: 30,
//       padding: 20,
//       marginHorizontal: -20,
//       marginBottom: 24,
//     },
//     card: {
//       borderRadius: 15,
//       padding: 15,
//       marginBottom: 15,
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 4,
//       elevation: 3,
//     },
//     cardTitle: {
//       fontSize: 24,
//       fontWeight: '700',
//       marginBottom: 10,
//     },
//     cardText: {
//       fontSize: 16,
//       lineHeight: 24,
//     },
//     sectionTitle: {
//       fontSize: 22,
//       fontWeight: '700',
//       marginBottom: 10,
//     },
//     detailGroup: {
//       flexDirection: 'row',
//       marginBottom: 8,
//     },
//     detailLabel: {
//       fontWeight: '600',
//       width: 120,
//     },
//     detailValue: {
//       flex: 1,
//     },
//     bulletItem: {
//       fontSize: 16,
//       marginLeft: 12,
//       marginBottom: 6,
//     },
//     lessonCard: {
//       padding: 15,
//       borderRadius: 12,
//       borderWidth: 1,
//       marginBottom: 10,
//       flexDirection: 'row',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       shadowColor: '#000',
//       shadowOffset: { width: 0, height: 2 },
//       shadowOpacity: 0.1,
//       shadowRadius: 3,
//       elevation: 2,
//     },
//     lessonInfo: {
//       flexDirection: 'row',
//       alignItems: 'center',
//     },
//     lessonTitle: {
//       fontSize: 18,
//       marginLeft: 8,
//       fontWeight: '500',
//     },
//     modalContainer: {
//       flex: 1,
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: 'rgba(0,0,0,0.85)',
//     },
//     modalContent: {
//       width: width * 0.9,
//       height: width * 0.6,
//       borderRadius: 15,
//       overflow: 'hidden',
//       justifyContent: 'center',
//       alignItems: 'center',
//     },
//     modalCloseButton: {
//       position: 'absolute',
//       top: 10,
//       right: 10,
//       zIndex: 10,
//     },
//     videoPlayer: {
//       width: '100%',
//       height: '100%',
//     },
//   });










// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   Modal,
//   Alert,
//   Animated,
//   Platform
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import { PieChart } from 'react-native-chart-kit';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // --- Redux imports ---
// import { useDispatch } from 'react-redux';
// import {
//   fetchMyEnrollmentsThunk,
//   updateLessonProgressThunk,
// } from '../store/slices/enrollmentSlice';
// import { fetchCourseByIdThunk } from '../store/slices/courseSlice';

// const { width, height } = Dimensions.get('window');

// const EnrolledCourseScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;

//   // Local states for course/enrollment as before
//   const [course, setCourse] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState('overview');

//   const insets = useSafeAreaInsets();

//   // For lesson video modal
//   const [selectedLesson, setSelectedLesson] = useState(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [videoStatus, setVideoStatus] = useState({});
//   const videoRef = useRef(null);
//   const [hasSeeked, setHasSeeked] = useState(false);

//   // Fade animation for scroll content
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Redux dispatcher
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         // Fetch course details from Redux
//         const courseRes = await dispatch(fetchCourseByIdThunk(courseId)).unwrap();
//         if (courseRes.success) {
//           setCourse(courseRes.data);
//         } else {
//           Alert.alert('Error', courseRes.message);
//         }

//         // Fetch enrollments from Redux
//         const enrollRes = await dispatch(fetchMyEnrollmentsThunk()).unwrap();
//         if (enrollRes.enrollments) {
//           const found = enrollRes.enrollments.find((en) => en.course._id === courseId);
//           if (found) {
//             setEnrollment(found);
//           } else {
//             Alert.alert('Error', 'Enrollment not found for this course.');
//           }
//         } else {
//           Alert.alert('Error', 'Failed to fetch enrollments.');
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message || 'An error occurred while loading data.');
//       } finally {
//         setLoading(false);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }).start();
//       }
//     };
//     loadData();
//   }, [courseId, dispatch, fadeAnim]);

//   const calculateOverallProgress = () => {
//     if (!course || !course.videos || !enrollment) return 0;
//     const totalLessons = course.videos.length;
//     const completedLessons = (enrollment.lessonsProgress || []).filter(
//       (lp) => lp.completed
//     ).length;
//     return totalLessons > 0 ? completedLessons / totalLessons : 0;
//   };

//   const handleLessonPress = (lesson) => {
//     setSelectedLesson(lesson);
//     setModalIsPlaying(true);
//     setHasSeeked(false);
//   };

//   const onPlaybackStatusUpdate = (status) => {
//     setVideoStatus(status);
//     if (
//       status.isLoaded &&
//       status.durationMillis > 0 &&
//       status.positionMillis / status.durationMillis >= 0.9 &&
//       selectedLesson &&
//       (!enrollment.lessonsProgress ||
//         !enrollment.lessonsProgress.find(
//           (lp) => lp.lessonId === selectedLesson._id && lp.completed
//         ))
//     ) {
//       markLessonCompleted(selectedLesson);
//     }
//   };

//   const handleVideoLoad = () => {
//     if (!hasSeeked && selectedLesson) {
//       const progress = enrollment.lessonsProgress?.find(
//         (lp) => lp.lessonId === selectedLesson._id
//       );
//       if (progress && progress.watchedDuration > 0) {
//         videoRef.current.setPositionAsync(progress.watchedDuration);
//         setHasSeeked(true);
//       }
//     }
//   };

//   const markLessonCompleted = async (lesson) => {
//     if (!enrollment) return;
//     const lessonId = lesson._id;
//     const currentProgress = enrollment.lessonsProgress || [];
//     const updatedProgress = currentProgress.some((lp) => lp.lessonId === lessonId)
//       ? currentProgress.map((lp) =>
//           lp.lessonId === lessonId
//             ? { ...lp, watchedDuration: videoStatus.positionMillis || 0, completed: true }
//             : lp
//         )
//       : [
//           ...currentProgress,
//           { lessonId, watchedDuration: videoStatus.positionMillis || 0, completed: true },
//         ];
//     // Update local state so UI immediately shows progress
//     setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });

//     // Dispatch Redux thunk to update the server
//     try {
//       const updateRes = await dispatch(
//         updateLessonProgressThunk({
//           courseId,
//           progressData: {
//             lessonId,
//             watchedDuration: videoStatus.positionMillis || 0,
//             completed: true,
//           },
//         })
//       ).unwrap();
//       if (!updateRes.success) {
//         Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//       }
//     } catch (error) {
//       Alert.alert('Error', error.message || 'Failed to update lesson progress.');
//     }
//   };

//   const closeModal = async () => {
//     if (selectedLesson && videoStatus?.isLoaded) {
//       const progressUpdate = {
//         lessonId: selectedLesson._id,
//         watchedDuration: videoStatus.positionMillis || 0,
//         completed: videoStatus.positionMillis / videoStatus.durationMillis >= 0.9,
//       };
//       try {
//         const updateRes = await dispatch(
//           updateLessonProgressThunk({
//             courseId,
//             progressData: progressUpdate,
//           })
//         ).unwrap();

//         if (!updateRes.success) {
//           Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//         } else {
//           const currentProgress = enrollment.lessonsProgress || [];
//           const updatedProgress = currentProgress.some(
//             (lp) => lp.lessonId === selectedLesson._id
//           )
//             ? currentProgress.map((lp) =>
//                 lp.lessonId === selectedLesson._id
//                   ? {
//                       ...lp,
//                       watchedDuration: progressUpdate.watchedDuration,
//                       completed: progressUpdate.completed,
//                     }
//                   : lp
//               )
//             : [
//                 ...currentProgress,
//                 {
//                   lessonId: selectedLesson._id,
//                   watchedDuration: progressUpdate.watchedDuration,
//                   completed: progressUpdate.completed,
//                 },
//               ];
//           setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//         }
//       } catch (err) {
//         Alert.alert('Error', err.message || 'Failed to update lesson progress.');
//       }
//     }
//     setSelectedLesson(null);
//     setModalIsPlaying(false);
//   };

//   if (loading || !course || !enrollment) {
//     return (
//       <SafeAreaView
//         style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}
//       >
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//       </SafeAreaView>
//     );
//   }

//   const overallProgress = calculateOverallProgress();
//   const chartData = [
//     {
//       name: 'Completed',
//       population: Math.round(overallProgress * 100),
//       color: currentTheme.primaryColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//     {
//       name: 'Remaining',
//       population: 100 - Math.round(overallProgress * 100),
//       color: currentTheme.borderColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//   ];

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header, { paddingTop: insets.top}]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text
//             style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}
//             numberOfLines={1}
//           >
//             {course.title}
//           </Text>
//           <View style={styles.progressWrapper}>
//             <View
//               style={[styles.horizontalProgressContainer, { backgroundColor: currentTheme.borderColor }]}
//             >
//               <View
//                 style={[
//                   styles.horizontalProgressBar,
//                   {
//                     width: `${Math.round(overallProgress * 100)}%`,
//                     backgroundColor: currentTheme.primaryColor,
//                   },
//                 ]}
//               />
//               <Text
//                 style={[
//                   styles.progressText,
//                   {
//                     color: currentTheme.headerTextColor,
//                     position: 'absolute',
//                     width: '100%',
//                     textAlign: 'center',
//                   },
//                 ]}
//               >
//                 {Math.round(overallProgress * 100)}%
//               </Text>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>

//       {/* Enhanced Tab Navigation */}
//       <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//         <TouchableOpacity
//           style={[
//             styles.enhancedTabButton,
//             selectedTab === 'overview' && { backgroundColor: currentTheme.primaryColor },
//           ]}
//           onPress={() => setSelectedTab('overview')}
//         >
//           <Text
//             style={[
//               styles.enhancedTabText,
//               { color: selectedTab === 'overview' ? '#fff' : currentTheme.textColor },
//             ]}
//           >
//             Overview
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[
//             styles.enhancedTabButton,
//             selectedTab === 'lessons' && { backgroundColor: currentTheme.primaryColor },
//           ]}
//           onPress={() => setSelectedTab('lessons')}
//         >
//           <Text
//             style={[
//               styles.enhancedTabText,
//               { color: selectedTab === 'lessons' ? '#fff' : currentTheme.textColor },
//             ]}
//           >
//             Lessons
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Animated.ScrollView
//         style={{ flex: 1, opacity: fadeAnim }}
//         contentContainerStyle={styles.scrollContent}
//         showsVerticalScrollIndicator={false}
//       >
//         {selectedTab === 'overview' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {/* Course Description Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>
//                 {course.title}
//               </Text>
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 {course.description}
//               </Text>
//             </View>
//             {/* Course Details Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Course Details
//               </Text>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                   Instructor:
//                 </Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                   {course.instructor}
//                 </Text>
//               </View>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                   Duration:
//                 </Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                   {course.totalDuration} mins
//                 </Text>
//               </View>
//               {course.difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Difficulty:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.difficultyLevel}
//                   </Text>
//                 </View>
//               )}
//               {course.language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Language:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.language}
//                   </Text>
//                 </View>
//               )}
//               {course.topics && course.topics.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>
//                     Topics:
//                   </Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>
//                     {course.topics.join(', ')}
//                   </Text>
//                 </View>
//               )}
//             </View>
//             {/* Progress Graph Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>
//                 Your Progress
//               </Text>
//               <PieChart
//                 data={chartData}
//                 width={width - 40}
//                 height={150}
//                 chartConfig={{
//                   backgroundColor: currentTheme.cardBackground,
//                   backgroundGradientFrom: currentTheme.cardBackground,
//                   backgroundGradientTo: currentTheme.cardBackground,
//                   color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   labelColor: (opacity = 1) => currentTheme.textColor,
//                 }}
//                 accessor="population"
//                 backgroundColor="transparent"
//                 paddingLeft="15"
//                 center={[10, 0]}
//                 absolute
//               />
//             </View>
//             {/* Requirements Card */}
//             {course.requirements?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   Requirements
//                 </Text>
//                 {course.requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}
//             {/* What You'll Learn Card */}
//             {course.whatYouWillLearn?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.backgroundColor }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>
//                   What You'll Learn
//                 </Text>
//                 {course.whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text
//               style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}
//             >
//               Lessons
//             </Text>
//             {course.videos.map((lesson) => {
//               const lessonProgress = enrollment.lessonsProgress?.find(
//                 (lp) => lp.lessonId === lesson._id
//               );
//               const isCompleted = lessonProgress && lessonProgress.completed;
//               return (
//                 <TouchableOpacity
//                   key={lesson._id}
//                   style={[
//                     styles.lessonCard,
//                     { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.backgroundColor },
//                   ]}
//                   onPress={() => handleLessonPress(lesson)}
//                 >
//                   <View style={styles.lessonInfo}>
//                     <Ionicons name="play-circle" size={20} color={currentTheme.primaryColor} />
//                     <Text style={[styles.lessonTitle, { color: currentTheme.textColor }]}>
//                       {lesson.title}
//                     </Text>
//                   </View>
//                   {isCompleted && (
//                     <Ionicons name="checkmark-circle" size={22} color={currentTheme.primaryColor} />
//                   )}
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         )}
//       </Animated.ScrollView>

//       {/* Modal for Lesson Playback */}
//       <Modal visible={!!selectedLesson} animationType="slide" onRequestClose={closeModal} transparent>
//         <View style={styles.modalContainer}>
//           <View style={[styles.modalContent, { backgroundColor: currentTheme.backgroundColor }]}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
//               <Ionicons name="close" size={28} color={currentTheme.textColor} />
//             </TouchableOpacity>
//             {selectedLesson && (
//               <Video
//                 ref={videoRef}
//                 source={{ uri: selectedLesson.url }}
//                 style={styles.videoPlayer}
//                 useNativeControls
//                 resizeMode="cover"
//                 shouldPlay={modalIsPlaying}
//                 onLoad={handleVideoLoad}
//                 onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// export default EnrolledCourseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 8,
//     paddingHorizontal: width * 0.05,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: width * 0.1,
//     borderBottomRightRadius: width * 0.1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: height * 0.005 },
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
//     zIndex: 10,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: width * 0.06,
//     fontWeight: '700',
//     width: width * 0.65,
//     textAlign: 'center',
//   },
//   progressWrapper: {
//     marginTop: 8,
//     alignItems: 'center',
//   },
//   horizontalProgressContainer: {
//     width: width * 0.7,
//     height: 12,
//     borderRadius: 25,
//     overflow: 'hidden',
//     marginBottom: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   horizontalProgressBar: {
//     height: '100%',
//   },
//   progressText: {
//     fontSize: 10,
//     fontWeight: '600',
//     marginLeft: 5,
//   },
//   enhancedTabContainer: {
//     flexDirection: 'row',
//     borderRadius: 25,
//     marginHorizontal: width * 0.05,
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
//   enhancedTabText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   scrollContent: {
//     paddingHorizontal: width * 0.05,
//     paddingBottom: 30,
//   },
//   detailsContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     padding: 20,
//     marginHorizontal: -20,
//     marginBottom: 24,
//   },
//   card: {
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     // color: '#333',
//   },
//   cardText: {
//     fontSize: 16,
//     lineHeight: 24,
//     // color: '#555',
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 10,
//   },
//   detailGroup: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   detailLabel: {
//     fontWeight: '600',
//     width: 120,
//     // color: '#555',
//   },
//   detailValue: {
//     flex: 1,
//     // color: '#555',
//   },
//   bulletItem: {
//     fontSize: 16,
//     marginLeft: 12,
//     marginBottom: 6,
//     // color: '#555',
//   },
//   lessonCard: {
//     padding: 15,
//     borderRadius: 12,
//     borderWidth: 1,
//     marginBottom: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   lessonInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   lessonTitle: {
//     fontSize: 18,
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.85)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: width * 0.9,
//     height: width * 0.6,
//     borderRadius: 15,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 10,
//   },
//   videoPlayer: {
//     width: '100%',
//     height: '100%',
//   },
// });









// // src/screens/EnrolledCourseScreen.js
// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   Modal,
//   Alert,
//   Animated,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import { PieChart } from 'react-native-chart-kit';
// import {
//   fetchCourseById,
//   getMyEnrollmentsAPI,
//   updateLessonProgressAPI,
// } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width, height } = Dimensions.get('window');

// const EnrolledCourseScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;

//   const [course, setCourse] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState('overview');

//   // For lesson video modal
//   const [selectedLesson, setSelectedLesson] = useState(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [videoStatus, setVideoStatus] = useState({});
//   const videoRef = useRef(null);
//   const [hasSeeked, setHasSeeked] = useState(false);

//   // Fade animation for scroll content
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const courseRes = await fetchCourseById(courseId);
//         if (courseRes.success) {
//           setCourse(courseRes.data);
//         } else {
//           Alert.alert('Error', courseRes.message);
//         }
//         const enrollRes = await getMyEnrollmentsAPI();
//         if (enrollRes.success) {
//           const found = enrollRes.data.enrollments.find(
//             (en) => en.course._id === courseId
//           );
//           if (found) {
//             setEnrollment(found);
//           } else {
//             Alert.alert('Error', 'Enrollment not found for this course.');
//           }
//         } else {
//           Alert.alert('Error', enrollRes.message);
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message);
//       } finally {
//         setLoading(false);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }).start();
//       }
//     };
//     loadData();
//   }, [courseId]);

//   const calculateOverallProgress = () => {
//     if (!course || !course.videos || !enrollment) return 0;
//     const totalLessons = course.videos.length;
//     const completedLessons = (enrollment.lessonsProgress || []).filter(
//       (lp) => lp.completed
//     ).length;
//     return totalLessons > 0 ? completedLessons / totalLessons : 0;
//   };

//   const handleLessonPress = (lesson) => {
//     setSelectedLesson(lesson);
//     setModalIsPlaying(true);
//     setHasSeeked(false);
//   };

//   const onPlaybackStatusUpdate = (status) => {
//     setVideoStatus(status);
//     if (
//       status.isLoaded &&
//       status.durationMillis > 0 &&
//       status.positionMillis / status.durationMillis >= 0.9 &&
//       selectedLesson &&
//       (!enrollment.lessonsProgress ||
//         !enrollment.lessonsProgress.find(
//           (lp) => lp.lessonId === selectedLesson._id && lp.completed
//         ))
//     ) {
//       markLessonCompleted(selectedLesson);
//     }
//   };

//   const handleVideoLoad = () => {
//     if (!hasSeeked && selectedLesson) {
//       const progress = enrollment.lessonsProgress?.find(
//         (lp) => lp.lessonId === selectedLesson._id
//       );
//       if (progress && progress.watchedDuration > 0) {
//         videoRef.current.setPositionAsync(progress.watchedDuration);
//         setHasSeeked(true);
//       }
//     }
//   };

//   const markLessonCompleted = async (lesson) => {
//     const lessonId = lesson._id;
//     const currentProgress = enrollment.lessonsProgress || [];
//     const updatedProgress = currentProgress.some((lp) => lp.lessonId === lessonId)
//       ? currentProgress.map((lp) =>
//           lp.lessonId === lessonId
//             ? { ...lp, watchedDuration: videoStatus.positionMillis || 0, completed: true }
//             : lp
//         )
//       : [
//           ...currentProgress,
//           { lessonId, watchedDuration: videoStatus.positionMillis || 0, completed: true },
//         ];
//     setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//     const updateRes = await updateLessonProgressAPI(courseId, {
//       lessonId,
//       watchedDuration: videoStatus.positionMillis || 0,
//       completed: true,
//     });
//     if (!updateRes.success) {
//       Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//     }
//   };

//   const closeModal = async () => {
//     if (selectedLesson && videoStatus?.isLoaded) {
//       const progressUpdate = {
//         lessonId: selectedLesson._id,
//         watchedDuration: videoStatus.positionMillis || 0,
//         completed: videoStatus.positionMillis / videoStatus.durationMillis >= 0.9,
//       };
//       const updateRes = await updateLessonProgressAPI(courseId, progressUpdate);
//       if (!updateRes.success) {
//         Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//       } else {
//         const currentProgress = enrollment.lessonsProgress || [];
//         const updatedProgress = currentProgress.some((lp) => lp.lessonId === selectedLesson._id)
//           ? currentProgress.map((lp) =>
//               lp.lessonId === selectedLesson._id
//                 ? { ...lp, watchedDuration: videoStatus.positionMillis || 0, completed: progressUpdate.completed }
//                 : lp
//             )
//           : [
//               ...currentProgress,
//               { lessonId: selectedLesson._id, watchedDuration: videoStatus.positionMillis || 0, completed: progressUpdate.completed },
//             ];
//         setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//       }
//     }
//     setSelectedLesson(null);
//     setModalIsPlaying(false);
//   };

//   if (loading || !course || !enrollment) {
//     return (
//       <SafeAreaView style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//       </SafeAreaView>
//     );
//   }

//   const overallProgress = calculateOverallProgress();
//   const chartData = [
//     {
//       name: 'Completed',
//       population: Math.round(overallProgress * 100),
//       color: currentTheme.primaryColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//     {
//       name: 'Remaining',
//       population: 100 - Math.round(overallProgress * 100),
//       color: currentTheme.borderColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//   ];

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar backgroundColor={currentTheme.headerBackground[1]} barStyle={currentTheme.statusBarStyle} />

//       {/* Enhanced Hero Header with Horizontal Progress Bar */}
//       <LinearGradient colors={currentTheme.headerBackground} style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]} numberOfLines={1}>
//             {course.title}
//           </Text>
//           <View style={styles.progressWrapper}>
//           <View style={[styles.horizontalProgressContainer, { backgroundColor: currentTheme.borderColor }]}>
//               <View
//                 style={[
//                   styles.horizontalProgressBar,
//                   { width: `${Math.round(overallProgress * 100)}%`, backgroundColor: currentTheme.primaryColor },
//                 ]}
//               />
//               <Text
//                 style={[
//                   styles.progressText,
//                   {
//                     color: currentTheme.headerTextColor,
//                     position: 'absolute',
//                     width: '100%',
//                     textAlign: 'center',
//                   },
//                 ]}
//               >
//                 {Math.round(overallProgress * 100)}%
//               </Text>
//             </View>
//           </View>
//         </View>
//       </LinearGradient>

//       {/* Enhanced Tab Navigation */}
//       <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//         <TouchableOpacity
//           style={[styles.enhancedTabButton, selectedTab === 'overview' && { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => setSelectedTab('overview')}
//         >
//           <Text style={[styles.enhancedTabText, { color: selectedTab === 'overview' ? '#fff' : currentTheme.textColor }]}>
//             Overview
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.enhancedTabButton, selectedTab === 'lessons' && { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => setSelectedTab('lessons')}
//         >
//           <Text style={[styles.enhancedTabText, { color: selectedTab === 'lessons' ? '#fff' : currentTheme.textColor }]}>
//             Lessons
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Animated.ScrollView style={{ flex: 1, opacity: fadeAnim }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {selectedTab === 'overview' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {/* Course Description Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>{course.title}</Text>
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>{course.description}</Text>
//             </View>
//             {/* Course Details Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>Course Details</Text>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Instructor:</Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.instructor}</Text>
//               </View>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Duration:</Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.totalDuration} mins</Text>
//               </View>
//               {course.difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Difficulty:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.difficultyLevel}</Text>
//                 </View>
//               )}
//               {course.language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Language:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.language}</Text>
//                 </View>
//               )}
//               {course.topics && course.topics.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Topics:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.topics.join(', ')}</Text>
//                 </View>
//               )}
//             </View>
//             {/* Progress Graph Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>Your Progress</Text>
//               <PieChart
//                 data={chartData}
//                 width={width - 40}
//                 height={150}
//                 chartConfig={{
//                   backgroundColor: currentTheme.cardBackground,
//                   backgroundGradientFrom: currentTheme.cardBackground,
//                   backgroundGradientTo: currentTheme.cardBackground,
//                   color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   labelColor: (opacity = 1) => currentTheme.textColor,
//                 }}
//                 accessor="population"
//                 backgroundColor="transparent"
//                 paddingLeft="15"
//                 center={[10, 0]}
//                 absolute
//               />
//             </View>
//             {/* Requirements Card */}
//             {course.requirements?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>Requirements</Text>
//                 {course.requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}
//             {/* What You'll Learn Card */}
//             {course.whatYouWillLearn?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>What You'll Learn</Text>
//                 {course.whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}>Lessons</Text>
//             {course.videos.map((lesson) => {
//               const lessonProgress = enrollment.lessonsProgress?.find((lp) => lp.lessonId === lesson._id);
//               const isCompleted = lessonProgress && lessonProgress.completed;
//               return (
//                 <TouchableOpacity
//                   key={lesson._id}
//                   style={[styles.lessonCard, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}
//                   onPress={() => handleLessonPress(lesson)}
//                 >
//                   <View style={styles.lessonInfo}>
//                     <Ionicons name="play-circle" size={20} color={currentTheme.primaryColor} />
//                     <Text style={[styles.lessonTitle, { color: currentTheme.textColor }]}>{lesson.title}</Text>
//                   </View>
//                   {isCompleted && <Ionicons name="checkmark-circle" size={22} color={currentTheme.primaryColor} />}
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         )}
//       </Animated.ScrollView>

//       {/* Modal for Lesson Playback */}
//       <Modal visible={!!selectedLesson} animationType="slide" onRequestClose={closeModal} transparent>
//         <View style={styles.modalContainer}>
//           <View style={[styles.modalContent, { backgroundColor: currentTheme.backgroundColor }]}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
//               <Ionicons name="close" size={28} color={currentTheme.textColor} />
//             </TouchableOpacity>
//             {selectedLesson && (
//               <Video
//                 ref={videoRef}
//                 source={{ uri: selectedLesson.url }}
//                 style={styles.videoPlayer}
//                 useNativeControls
//                 resizeMode="cover"
//                 shouldPlay={modalIsPlaying}
//                 onLoad={handleVideoLoad}
//                 onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default EnrolledCourseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 8, // responsive vertical padding
//     paddingHorizontal: width * 0.05, // responsive horizontal padding
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: width * 0.1, // responsive radius
//     borderBottomRightRadius: width * 0.1,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: height * 0.005 },
//     shadowOpacity: 0.25,
//     shadowRadius: 6,
//     elevation: 6,
//     marginBottom: 8,
//   },
//   backButton: {
//     position: 'absolute',
//     left: width * 0.05,
//     padding: 10,
//     zIndex: 10,
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: width * 0.06, // responsive font size
//     fontWeight: '700',
//     width: width * 0.65,
//     textAlign: 'center',
//   },
//   progressWrapper: {
//     marginTop: 8,
//     alignItems: 'center',
//   },
//   horizontalProgressContainer: {
//     width: width * 0.7, // responsive width
//     height: 12,
//     borderRadius: 25,
//     overflow: 'hidden',
//     marginBottom: 2,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   horizontalProgressBar: {
//     height: '100%',
//   },
//   progressText: {
//     fontSize: 10,
//     fontWeight: '600',
//     marginLeft: 5,
//   },
//   enhancedTabContainer: {
//     flexDirection: 'row',
//     borderRadius: 25,
//     marginHorizontal: width * 0.05,
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
//   enhancedTabText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   scrollContent: {
//     paddingHorizontal: width * 0.05,
//     paddingBottom: 30,
//   },
//   detailsContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 20,
//     marginHorizontal: -20,
//     marginBottom: 24,
//   },
//   card: {
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     color: '#333',
//   },
//   cardText: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#555',
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 10,
//   },
//   detailGroup: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   detailLabel: {
//     fontWeight: '600',
//     width: 120,
//     color: '#555',
//   },
//   detailValue: {
//     flex: 1,
//     color: '#555',
//   },
//   bulletItem: {
//     fontSize: 16,
//     marginLeft: 12,
//     marginBottom: 6,
//     color: '#555',
//   },
//   lessonCard: {
//     padding: 15,
//     borderRadius: 12,
//     borderWidth: 1,
//     marginBottom: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   lessonInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   lessonTitle: {
//     fontSize: 18,
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.85)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: width * 0.9,
//     height: width * 0.6,
//     borderRadius: 15,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 10,
//   },
//   videoPlayer: {
//     width: '100%',
//     height: '100%',
//   },
// });









// // src/screens/EnrolledCourseScreen.js
// import React, { useState, useEffect, useContext, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   SafeAreaView,
//   StatusBar,
//   Dimensions,
//   Modal,
//   Alert,
//   Animated,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import { PieChart } from 'react-native-chart-kit';
// import {
//   fetchCourseById,
//   getMyEnrollmentsAPI,
//   updateLessonProgressAPI,
// } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width } = Dimensions.get('window');

// const EnrolledCourseScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;

//   const [course, setCourse] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedTab, setSelectedTab] = useState('overview');

//   // For lesson video modal
//   const [selectedLesson, setSelectedLesson] = useState(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [videoStatus, setVideoStatus] = useState({});
//   const videoRef = useRef(null);
//   const [hasSeeked, setHasSeeked] = useState(false);

//   // Fade animation for scroll content
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const courseRes = await fetchCourseById(courseId);
//         if (courseRes.success) {
//           setCourse(courseRes.data);
//         } else {
//           Alert.alert('Error', courseRes.message);
//         }
//         const enrollRes = await getMyEnrollmentsAPI();
//         if (enrollRes.success) {
//           const found = enrollRes.data.enrollments.find(
//             (en) => en.course._id === courseId
//           );
//           if (found) {
//             setEnrollment(found);
//           } else {
//             Alert.alert('Error', 'Enrollment not found for this course.');
//           }
//         } else {
//           Alert.alert('Error', enrollRes.message);
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message);
//       } finally {
//         setLoading(false);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }).start();
//       }
//     };
//     loadData();
//   }, [courseId]);

//   const calculateOverallProgress = () => {
//     if (!course || !course.videos || !enrollment) return 0;
//     const totalLessons = course.videos.length;
//     const completedLessons = (enrollment.lessonsProgress || []).filter(
//       (lp) => lp.completed
//     ).length;
//     return totalLessons > 0 ? completedLessons / totalLessons : 0;
//   };

//   const handleLessonPress = (lesson) => {
//     setSelectedLesson(lesson);
//     setModalIsPlaying(true);
//     setHasSeeked(false);
//   };

//   const onPlaybackStatusUpdate = (status) => {
//     setVideoStatus(status);
//     if (
//       status.isLoaded &&
//       status.durationMillis > 0 &&
//       status.positionMillis / status.durationMillis >= 0.9 &&
//       selectedLesson &&
//       (!enrollment.lessonsProgress ||
//         !enrollment.lessonsProgress.find(
//           (lp) => lp.lessonId === selectedLesson._id && lp.completed
//         ))
//     ) {
//       markLessonCompleted(selectedLesson);
//     }
//   };

//   const handleVideoLoad = () => {
//     if (!hasSeeked && selectedLesson) {
//       const progress = enrollment.lessonsProgress?.find(
//         (lp) => lp.lessonId === selectedLesson._id
//       );
//       if (progress && progress.watchedDuration > 0) {
//         videoRef.current.setPositionAsync(progress.watchedDuration);
//         setHasSeeked(true);
//       }
//     }
//   };

//   const markLessonCompleted = async (lesson) => {
//     const lessonId = lesson._id;
//     const currentProgress = enrollment.lessonsProgress || [];
//     const updatedProgress = currentProgress.some((lp) => lp.lessonId === lessonId)
//       ? currentProgress.map((lp) =>
//           lp.lessonId === lessonId
//             ? { ...lp, watchedDuration: videoStatus.positionMillis || 0, completed: true }
//             : lp
//         )
//       : [
//           ...currentProgress,
//           { lessonId, watchedDuration: videoStatus.positionMillis || 0, completed: true },
//         ];
//     setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//     const updateRes = await updateLessonProgressAPI(courseId, {
//       lessonId,
//       watchedDuration: videoStatus.positionMillis || 0,
//       completed: true,
//     });
//     if (!updateRes.success) {
//       Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//     }
//   };

//   const closeModal = async () => {
//     if (selectedLesson && videoStatus?.isLoaded) {
//       const progressUpdate = {
//         lessonId: selectedLesson._id,
//         watchedDuration: videoStatus.positionMillis || 0,
//         completed: videoStatus.positionMillis / videoStatus.durationMillis >= 0.9,
//       };
//       const updateRes = await updateLessonProgressAPI(courseId, progressUpdate);
//       if (!updateRes.success) {
//         Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//       } else {
//         const currentProgress = enrollment.lessonsProgress || [];
//         const updatedProgress = currentProgress.some((lp) => lp.lessonId === selectedLesson._id)
//           ? currentProgress.map((lp) =>
//               lp.lessonId === selectedLesson._id
//                 ? { ...lp, watchedDuration: videoStatus.positionMillis || 0, completed: progressUpdate.completed }
//                 : lp
//             )
//           : [
//               ...currentProgress,
//               { lessonId: selectedLesson._id, watchedDuration: videoStatus.positionMillis || 0, completed: progressUpdate.completed },
//             ];
//         setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//       }
//     }
//     setSelectedLesson(null);
//     setModalIsPlaying(false);
//   };

//   if (loading || !course || !enrollment) {
//     return (
//       <SafeAreaView style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//       </SafeAreaView>
//     );
//   }

//   const overallProgress = calculateOverallProgress();
//   const chartData = [
//     {
//       name: 'Completed',
//       population: Math.round(overallProgress * 100),
//       color: currentTheme.primaryColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//     {
//       name: 'Remaining',
//       population: 100 - Math.round(overallProgress * 100),
//       color: currentTheme.borderColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//   ];

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar backgroundColor={currentTheme.headerBackground[1]} barStyle={currentTheme.statusBarStyle} />

//       {/* Enhanced Hero Header with Horizontal Progress Bar */}
//       <LinearGradient colors={currentTheme.headerBackground} style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]} numberOfLines={1}>
//             {course.title}
//           </Text>
//           <View style={styles.progressWrapper}>
//             <View style={[styles.horizontalProgressContainer, { backgroundColor: currentTheme.borderColor }]}>
//               <View
//                 style={[
//                   styles.horizontalProgressBar,
//                   { width: `${Math.round(overallProgress * 100)}%`, backgroundColor: currentTheme.primaryColor },
//                 ]}
//               />
//             <Text style={[styles.progressText, { color: currentTheme.headerTextColor }]}>{Math.round(overallProgress * 100)}%</Text>

//             </View>
//           </View>
//         </View>
//       </LinearGradient>

//       {/* Enhanced Tab Navigation */}
//       <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//         <TouchableOpacity
//           style={[styles.enhancedTabButton, selectedTab === 'overview' && { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => setSelectedTab('overview')}
//         >
//           <Text style={[styles.enhancedTabText, { color: selectedTab === 'overview' ? '#fff' : currentTheme.textColor }]}>
//             Overview
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.enhancedTabButton, selectedTab === 'lessons' && { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => setSelectedTab('lessons')}
//         >
//           <Text style={[styles.enhancedTabText, { color: selectedTab === 'lessons' ? '#fff' : currentTheme.textColor }]}>
//             Lessons
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Animated.ScrollView style={{ flex: 1, opacity: fadeAnim }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {selectedTab === 'overview' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {/* Course Description Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>{course.title}</Text>
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>{course.description}</Text>
//             </View>
//             {/* Course Details Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>Course Details</Text>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Instructor:</Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.instructor}</Text>
//               </View>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Duration:</Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.totalDuration} mins</Text>
//               </View>
//               {course.difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Difficulty:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.difficultyLevel}</Text>
//                 </View>
//               )}
//               {course.language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Language:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.language}</Text>
//                 </View>
//               )}
//               {course.topics && course.topics.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Topics:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.topics.join(', ')}</Text>
//                 </View>
//               )}
//             </View>
//             {/* Progress Graph Card */}
//             <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>Your Progress</Text>
//               <PieChart
//                 data={chartData}
//                 width={width - 40}
//                 height={150}
//                 chartConfig={{
//                   backgroundColor: currentTheme.cardBackground,
//                   backgroundGradientFrom: currentTheme.cardBackground,
//                   backgroundGradientTo: currentTheme.cardBackground,
//                   color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   labelColor: (opacity = 1) => currentTheme.textColor,
//                 }}
//                 accessor="population"
//                 backgroundColor="transparent"
//                 paddingLeft="15"
//                 center={[10, 0]}
//                 absolute
//               />
//             </View>
//             {/* Requirements Card */}
//             {course.requirements?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>Requirements</Text>
//                 {course.requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}
//             {/* What You'll Learn Card */}
//             {course.whatYouWillLearn?.length > 0 && (
//               <View style={[styles.card, { backgroundColor: currentTheme.cardBackground }]}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>What You'll Learn</Text>
//                 {course.whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}>Lessons</Text>
//             {course.videos.map((lesson) => {
//               const lessonProgress = enrollment.lessonsProgress?.find((lp) => lp.lessonId === lesson._id);
//               const isCompleted = lessonProgress && lessonProgress.completed;
//               return (
//                 <TouchableOpacity
//                   key={lesson._id}
//                   style={[styles.lessonCard, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}
//                   onPress={() => handleLessonPress(lesson)}
//                 >
//                   <View style={styles.lessonInfo}>
//                     <Ionicons name="play-circle" size={20} color={currentTheme.primaryColor} />
//                     <Text style={[styles.lessonTitle, { color: currentTheme.textColor }]}>{lesson.title}</Text>
//                   </View>
//                   {isCompleted && <Ionicons name="checkmark-circle" size={22} color={currentTheme.primaryColor} />}
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         )}
//       </Animated.ScrollView>

//       {/* Modal for Lesson Playback */}
//       <Modal visible={!!selectedLesson} animationType="slide" onRequestClose={closeModal} transparent>
//         <View style={styles.modalContainer}>
//           <View style={[styles.modalContent, { backgroundColor: currentTheme.backgroundColor }]}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
//               <Ionicons name="close" size={28} color={currentTheme.textColor} />
//             </TouchableOpacity>
//             {selectedLesson && (
//               <Video
//                 ref={videoRef}
//                 source={{ uri: selectedLesson.url }}
//                 style={styles.videoPlayer}
//                 useNativeControls
//                 resizeMode="cover"
//                 shouldPlay={modalIsPlaying}
//                 onLoad={handleVideoLoad}
//                 onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default EnrolledCourseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 8,
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
//   progressWrapper: {
//     marginTop: 8,
//     alignItems: 'center',
//   },
//   horizontalProgressContainer: {
//     width: 280,
//     height: 15,
//     borderRadius: 25,
//     overflow: 'hidden',
//     marginBottom: 2,
//     left: 10,
//     flexDirection: 'row',
//   },
//   horizontalProgressBar: {
//     height: '100%',
//   },
//   progressText: {
//     fontSize: 10,
//     fontWeight: '600',
//     right: 80,
//   },
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
//   enhancedTabText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   detailsContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 20,
//     marginHorizontal: -20,
//     marginBottom: 24,
//   },
//   card: {
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     color: '#333',
//   },
//   cardText: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#555',
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 10,
//   },
//   detailGroup: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   detailLabel: {
//     fontWeight: '600',
//     width: 120,
//     color: '#555',
//   },
//   detailValue: {
//     flex: 1,
//     color: '#555',
//   },
//   bulletItem: {
//     fontSize: 16,
//     marginLeft: 12,
//     marginBottom: 6,
//     color: '#555',
//   },
//   lessonCard: {
//     padding: 15,
//     borderRadius: 12,
//     borderWidth: 1,
//     marginBottom: 10,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   lessonInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   lessonTitle: {
//     fontSize: 18,
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.85)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: width * 0.9,
//     height: width * 0.6,
//     borderRadius: 15,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 10,
//   },
//   videoPlayer: {
//     width: '100%',
//     height: '100%',
//   },
// });











// // src/screens/EnrolledCourseScreen.js
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
//   Alert,
//   Animated,
// } from 'react-native';
// import { useRoute, useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Video } from 'expo-av';
// import * as Progress from 'react-native-progress';
// import { PieChart } from 'react-native-chart-kit';
// import {
//   fetchCourseById,
//   getMyEnrollmentsAPI,
//   updateLessonProgressAPI,
// } from '../services/api';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width } = Dimensions.get('window');

// const EnrolledCourseScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { courseId } = route.params;

//   const [course, setCourse] = useState(null);
//   const [enrollment, setEnrollment] = useState(null);
//   const [loading, setLoading] = useState(true);
//   // Two tabs: 'overview' (all details) and 'lessons'
//   const [selectedTab, setSelectedTab] = useState('overview');

//   // For lesson video modal
//   const [selectedLesson, setSelectedLesson] = useState(null);
//   const [modalIsPlaying, setModalIsPlaying] = useState(true);
//   const [videoStatus, setVideoStatus] = useState({});
//   const videoRef = useRef(null);
//   const [hasSeeked, setHasSeeked] = useState(false);

//   // Fade animation for scroll content
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const courseRes = await fetchCourseById(courseId);
//         if (courseRes.success) {
//           setCourse(courseRes.data);
//         } else {
//           Alert.alert('Error', courseRes.message);
//         }
//         const enrollRes = await getMyEnrollmentsAPI();
//         if (enrollRes.success) {
//           const found = enrollRes.data.enrollments.find(
//             (en) => en.course._id === courseId
//           );
//           if (found) {
//             setEnrollment(found);
//           } else {
//             Alert.alert('Error', 'Enrollment not found for this course.');
//           }
//         } else {
//           Alert.alert('Error', enrollRes.message);
//         }
//       } catch (error) {
//         Alert.alert('Error', error.message);
//       } finally {
//         setLoading(false);
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 500,
//           useNativeDriver: true,
//         }).start();
//       }
//     };
//     loadData();
//   }, [courseId]);

//   const calculateOverallProgress = () => {
//     if (!course || !course.videos || !enrollment) return 0;
//     const totalLessons = course.videos.length;
//     const completedLessons = (enrollment.lessonsProgress || []).filter(
//       (lp) => lp.completed
//     ).length;
//     return totalLessons > 0 ? completedLessons / totalLessons : 0;
//   };

//   const handleLessonPress = (lesson) => {
//     setSelectedLesson(lesson);
//     setModalIsPlaying(true);
//     setHasSeeked(false);
//   };

//   const onPlaybackStatusUpdate = (status) => {
//     setVideoStatus(status);
//     if (
//       status.isLoaded &&
//       status.durationMillis > 0 &&
//       status.positionMillis / status.durationMillis >= 0.9 &&
//       selectedLesson &&
//       (!enrollment.lessonsProgress ||
//         !enrollment.lessonsProgress.find(
//           (lp) => lp.lessonId === selectedLesson._id && lp.completed
//         ))
//     ) {
//       markLessonCompleted(selectedLesson);
//     }
//   };

//   const handleVideoLoad = () => {
//     if (!hasSeeked && selectedLesson) {
//       const progress = enrollment.lessonsProgress?.find(
//         (lp) => lp.lessonId === selectedLesson._id
//       );
//       if (progress && progress.watchedDuration > 0) {
//         videoRef.current.setPositionAsync(progress.watchedDuration);
//         setHasSeeked(true);
//       }
//     }
//   };

//   const markLessonCompleted = async (lesson) => {
//     const lessonId = lesson._id;
//     const currentProgress = enrollment.lessonsProgress || [];
//     const updatedProgress = currentProgress.some((lp) => lp.lessonId === lessonId)
//       ? currentProgress.map((lp) =>
//           lp.lessonId === lessonId
//             ? { ...lp, watchedDuration: videoStatus.positionMillis || 0, completed: true }
//             : lp
//         )
//       : [
//           ...currentProgress,
//           { lessonId, watchedDuration: videoStatus.positionMillis || 0, completed: true },
//         ];
//     setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//     const updateRes = await updateLessonProgressAPI(courseId, {
//       lessonId,
//       watchedDuration: videoStatus.positionMillis || 0,
//       completed: true,
//     });
//     if (!updateRes.success) {
//       Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//     }
//   };

//   const closeModal = async () => {
//     if (selectedLesson && videoStatus?.isLoaded) {
//       const progressUpdate = {
//         lessonId: selectedLesson._id,
//         watchedDuration: videoStatus.positionMillis || 0,
//         completed: videoStatus.positionMillis / videoStatus.durationMillis >= 0.9,
//       };
//       const updateRes = await updateLessonProgressAPI(courseId, progressUpdate);
//       if (!updateRes.success) {
//         Alert.alert('Error', updateRes.message || 'Failed to update lesson progress.');
//       } else {
//         const currentProgress = enrollment.lessonsProgress || [];
//         const updatedProgress = currentProgress.some((lp) => lp.lessonId === selectedLesson._id)
//           ? currentProgress.map((lp) =>
//               lp.lessonId === selectedLesson._id
//                 ? { ...lp, watchedDuration: videoStatus.positionMillis || 0, completed: progressUpdate.completed }
//                 : lp
//             )
//           : [
//               ...currentProgress,
//               { lessonId: selectedLesson._id, watchedDuration: videoStatus.positionMillis || 0, completed: progressUpdate.completed },
//             ];
//         setEnrollment({ ...enrollment, lessonsProgress: updatedProgress });
//       }
//     }
//     setSelectedLesson(null);
//     setModalIsPlaying(false);
//   };

//   if (loading || !course || !enrollment) {
//     return (
//       <SafeAreaView style={[styles.loadingContainer, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//       </SafeAreaView>
//     );
//   }

//   const overallProgress = calculateOverallProgress();
//   // Prepare data for the pie chart (donut style)
//   const chartData = [
//     {
//       name: 'Completed',
//       population: Math.round(overallProgress * 100),
//       color: currentTheme.primaryColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//     {
//       name: 'Remaining',
//       population: 100 - Math.round(overallProgress * 100),
//       color: currentTheme.borderColor,
//       legendFontColor: currentTheme.textColor,
//       legendFontSize: 12,
//     },
//   ];

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar backgroundColor={currentTheme.headerBackground[1]} barStyle={currentTheme.statusBarStyle} />

//       {/* Hero Header */}
//       <LinearGradient colors={currentTheme.headerBackground} style={styles.header}>
//         <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]} numberOfLines={1}>
//             {course.title}
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Overall Progress: {Math.round(overallProgress * 100)}%
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Enhanced Tab Navigation */}
//       <View style={[styles.enhancedTabContainer, { backgroundColor: currentTheme.cardBackground }]}>
//         <TouchableOpacity
//           style={[styles.enhancedTabButton, selectedTab === 'overview' && { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => setSelectedTab('overview')}
//         >
//           <Text style={[styles.enhancedTabText, { color: selectedTab === 'overview' ? '#fff' : currentTheme.textColor }]}>
//             Overview
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.enhancedTabButton, selectedTab === 'lessons' && { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => setSelectedTab('lessons')}
//         >
//           <Text style={[styles.enhancedTabText, { color: selectedTab === 'lessons' ? '#fff' : currentTheme.textColor }]}>
//             Lessons
//           </Text>
//         </TouchableOpacity>
//       </View>

//       <Animated.ScrollView style={{ flex: 1, opacity: fadeAnim }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {selectedTab === 'overview' ? (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             {/* Course Description Card */}
//             <View style={styles.card}>
//               <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>{course.title}</Text>
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>{course.description}</Text>
//             </View>
//             {/* Course Details Card */}
//             <View style={styles.card}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>Course Details</Text>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Instructor:</Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.instructor}</Text>
//               </View>
//               <View style={styles.detailGroup}>
//                 <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Duration:</Text>
//                 <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.totalDuration} mins</Text>
//               </View>
//               {course.difficultyLevel && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Difficulty:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.difficultyLevel}</Text>
//                 </View>
//               )}
//               {course.language && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Language:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.language}</Text>
//                 </View>
//               )}
//               {course.topics && course.topics.length > 0 && (
//                 <View style={styles.detailGroup}>
//                   <Text style={[styles.detailLabel, { color: currentTheme.textColor }]}>Topics:</Text>
//                   <Text style={[styles.detailValue, { color: currentTheme.textColor }]}>{course.topics.join(', ')}</Text>
//                 </View>
//               )}
//             </View>
//             {/* Progress Graph Card */}
//             <View style={styles.card}>
//               <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor }]}>Your Progress</Text>
//               <PieChart
//                 data={chartData}
//                 width={width - 40}
//                 height={150}
//                 chartConfig={{
//                   backgroundColor: currentTheme.cardBackground,
//                   backgroundGradientFrom: currentTheme.cardBackground,
//                   backgroundGradientTo: currentTheme.cardBackground,
//                   color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   labelColor: (opacity = 1) => currentTheme.textColor,
//                 }}
//                 accessor="population"
//                 backgroundColor="transparent"
//                 paddingLeft="15"
//                 center={[10, 0]}
//                 absolute
//               />
//             </View>
//             {/* Requirements Card */}
//             {course.requirements?.length > 0 && (
//               <View style={styles.card}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>Requirements</Text>
//                 {course.requirements.map((req, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     • {req}
//                   </Text>
//                 ))}
//               </View>
//             )}
//             {/* What You'll Learn Card */}
//             {course.whatYouWillLearn?.length > 0 && (
//               <View style={styles.card}>
//                 <Text style={[styles.sectionTitle, { color: currentTheme.secondaryColor }]}>What You'll Learn</Text>
//                 {course.whatYouWillLearn.map((item, idx) => (
//                   <Text key={idx} style={[styles.bulletItem, { color: currentTheme.textColor }]}>
//                     ✓ {item}
//                   </Text>
//                 ))}
//               </View>
//             )}
//           </View>
//         ) : (
//           <View style={[styles.detailsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//             <Text style={[styles.sectionTitle, { color: currentTheme.primaryColor, marginBottom: 10 }]}>Lessons</Text>
//             {course.videos.map((lesson) => {
//               const lessonProgress = enrollment.lessonsProgress?.find((lp) => lp.lessonId === lesson._id);
//               const isCompleted = lessonProgress && lessonProgress.completed;
//               return (
//                 <TouchableOpacity
//                   key={lesson._id}
//                   style={[styles.lessonCard, { borderColor: currentTheme.borderColor }]}
//                   onPress={() => handleLessonPress(lesson)}
//                 >
//                   <View style={styles.lessonInfo}>
//                     <Ionicons name="play-circle" size={20} color={currentTheme.primaryColor} />
//                     <Text style={[styles.lessonTitle, { color: currentTheme.textColor }]}>{lesson.title}</Text>
//                   </View>
//                   {isCompleted && <Ionicons name="checkmark-circle" size={22} color={currentTheme.primaryColor} />}
//                 </TouchableOpacity>
//               );
//             })}
//           </View>
//         )}
//       </Animated.ScrollView>

//       {/* Modal for Lesson Playback */}
//       <Modal visible={!!selectedLesson} animationType="slide" onRequestClose={closeModal} transparent>
//         <View style={styles.modalContainer}>
//           <View style={[styles.modalContent, { backgroundColor: currentTheme.backgroundColor }]}>
//             <TouchableOpacity style={styles.modalCloseButton} onPress={closeModal}>
//               <Ionicons name="close" size={28} color={currentTheme.textColor} />
//             </TouchableOpacity>
//             {selectedLesson && (
//               <Video
//                 ref={videoRef}
//                 source={{ uri: selectedLesson.url }}
//                 style={styles.videoPlayer}
//                 useNativeControls
//                 resizeMode="cover"
//                 shouldPlay={modalIsPlaying}
//                 onLoad={handleVideoLoad}
//                 onPlaybackStatusUpdate={onPlaybackStatusUpdate}
//               />
//             )}
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// export default EnrolledCourseScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   // Enhanced Hero Header
//   header: {
//     width: '100%',
//     paddingVertical: 16,
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
//   // Enhanced Tab Navigation
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
//   enhancedTabText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   scrollContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 30,
//   },
//   // Details Container (card-style)
//   detailsContainer: {
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 20,
//     marginHorizontal: -20,
//     marginBottom: 24,
//   },
//   // Card styles for details sections
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 15,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   cardTitle: {
//     fontSize: 24,
//     fontWeight: '700',
//     marginBottom: 10,
//     color: '#333',
//   },
//   cardText: {
//     fontSize: 16,
//     lineHeight: 24,
//     color: '#555',
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     marginBottom: 10,
//   },
//   detailGroup: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   detailLabel: {
//     fontWeight: '600',
//     width: 120,
//     color: '#555',
//   },
//   detailValue: {
//     flex: 1,
//     color: '#555',
//   },
//   bulletItem: {
//     fontSize: 16,
//     marginLeft: 12,
//     marginBottom: 6,
//     color: '#555',
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#333',
//   },
//   description: {
//     fontSize: 17,
//     lineHeight: 26,
//     color: '#555',
//   },
//   // Lesson Cards
//   lessonCard: {
//     padding: 15,
//     borderRadius: 12,
//     borderWidth: 1,
//     marginBottom: 10,
//     backgroundColor: '#fff',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   lessonInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   lessonTitle: {
//     fontSize: 18,
//     marginLeft: 8,
//     fontWeight: '500',
//   },
//   // Modal for video playback
//   modalContainer: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.85)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     width: width * 0.9,
//     height: width * 0.6,
//     borderRadius: 15,
//     overflow: 'hidden',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalCloseButton: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     zIndex: 10,
//   },
//   videoPlayer: {
//     width: '100%',
//     height: '100%',
//   },
// });



