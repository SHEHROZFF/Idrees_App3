// src/screens/AICoursesScreen.js

import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  TextInput,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

// Theming
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

// Lottie animation imports
import lotti1 from '../../assets/lotti1.json';
import lotti2 from '../../assets/lotti2.json';
import robo from '../../assets/robo.json';

// Child Components
import CustomHeader from '../components/CustomHeader';
import CourseCard from '../components/CourseCard';
import FeaturedReel from '../components/FeaturedReel';
import AdsSection from '../components/AdsSection';

// Redux pieces
import { useDispatch } from 'react-redux';
import { fetchCoursesThunk, searchCoursesThunk } from '../store/slices/courseSlice';

const PAGE_LIMIT = 10;

/* ---------------------------------------------------------------------------
   1) AICoursesHeader - with scaled styling
--------------------------------------------------------------------------- */
const AICoursesHeader = memo(function AICoursesHeader({
  currentTheme,
  adsRefresh,
  courses,
  onAdPress,
  onSearchResults,
  scale,
  scaleFactor,
  width,
}) {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // ----- Local search states -----
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localSuggestions, setLocalSuggestions] = useState([]);
  const [showLocalSuggestions, setShowLocalSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  /* ---------------------------------------------------------------------------
     STYLES (Scaled) for the header portion
  --------------------------------------------------------------------------- */
  const stylesHeader = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          overflow: 'hidden',
          borderBottomLeftRadius: scale(40),
          borderBottomRightRadius: scale(40),
          borderTopLeftRadius: scale(40),
          borderTopRightRadius: scale(40),
          position: 'relative',
          // we can pick a "base" height and scale it
          height: scale(220),
        },
        lottieContainer1: {
          ...StyleSheet.absoluteFillObject,
          borderBottomLeftRadius: scale(40),
          borderBottomRightRadius: scale(40),
          alignItems: 'center',
        },
        waveLottie1: {
          width: '120%',
          height: '120%',
        },
        lottieContainer2: {
          ...StyleSheet.absoluteFillObject,
          borderBottomLeftRadius: scale(40),
          borderBottomRightRadius: scale(40),
          alignItems: 'flex-end',
        },
        waveLottie2: {
          width: '45%',
          height: '45%',
        },
        lottieContainer3: {
          ...StyleSheet.absoluteFillObject,
          borderBottomLeftRadius: scale(40),
          borderBottomRightRadius: scale(40),
          alignItems: 'flex-start',
          left: -scale(30),
        },
        waveLottie3: {
          width: '45%',
          height: '50%',
        },
        heroContent: {
          flex: 1,
          zIndex: 2,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: scale(25),
        },
        headerTitle: {
          fontWeight: '800',
          marginBottom: scale(6),
          textShadowOffset: { width: 0, height: scale(2) },
          textShadowRadius: scale(4),
        },
        headerSubtitle: {
          marginBottom: scale(12),
          opacity: 0.9,
          textShadowOffset: { width: 0, height: scale(1) },
          textShadowRadius: scale(2),
        },
        searchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: scale(25),
          elevation: 4,
          width: '100%',
          paddingHorizontal: scale(10),
          marginTop: scale(15),
        },
        searchInput: {
          flex: 1,
          fontSize: scale(16),
          paddingVertical: scale(10),
        },
        // Suggestions
        suggestionsContainer: {
          marginHorizontal: scale(10),
          marginTop: scale(-40),
          borderRadius: scale(12),
          elevation: 6,
          padding: scale(10),
          zIndex: 1,
        },
        adsHeading1: {
          fontSize: scale(18),
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: scale(10),
          marginTop: scale(20),
          borderWidth: scale(2),
          borderRadius: scale(30),
          padding: scale(10),
          width: '60%',
          alignSelf:'center',
          borderColor: currentTheme.borderColor, 
          backgroundColor: currentTheme.cardBackground,
          fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' ,
          // textDecorationLine: 'underline',
          textShadowColor: 'rgba(0, 0, 0, 0.9)',
          textShadowOffset: { width: 0, height: scale(1) },
          color: currentTheme.secondaryColor,
        },
        adsHeading2 : {
          fontSize: scale(22),
          fontWeight: '900',
          textAlign: 'center',
          marginBottom: scale(10),
          marginTop: scale(20),
          borderWidth: scale(5),
          borderRadius: scale(30),
          paddingHorizontal: scale(10),
          borderColor: currentTheme.textColor, 
          backgroundColor: currentTheme.backgroundColor,
          fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' ,
          width:'70%',
          alignSelf: 'center',
          // textDecorationLine: 'underline',
          textShadowColor: 'rgba(0, 0, 0, 0.9)',
          textShadowOffset: { width: 0, height: scale(1) },
          color: currentTheme.secondaryColor,
        },
        suggestionItem: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: scale(10),
          borderBottomWidth: 0.6,
        },
        suggestionImageContainer: {
          position: 'relative',
          marginRight: scale(12),
        },
        suggestionImage: {
          width: scale(50),
          height: scale(50),
          borderRadius: scale(25),
        },
        featuredBadge: {
          position: 'absolute',
          bottom: scale(-4),
          right: scale(-4),
          paddingHorizontal: Platform.OS === 'ios' ? scale(2) : scale(4),
          borderRadius: scale(10),
        },
        featuredText: {
          fontSize: scale(10),
          fontWeight: '600',
        },
        suggestionContent: {
          flex: 1,
        },
        suggestionTitle: {
          fontSize: scale(16),
          fontWeight: '700',
        },
        suggestionDescription: {
          fontSize: scale(12),
          marginTop: scale(2),
        },
        suggestionStats: {
          flexDirection: 'row',
          marginTop: scale(4),
        },
        suggestionRating: {
          fontSize: scale(12),
          marginRight: scale(10),
        },
        suggestionReviews: {
          fontSize: scale(12),
        },
        // Section heading
        sectionWrapper: {
          marginHorizontal: scale(15),
          marginTop: scale(20),
        },
        sectionTitle: {
          fontSize: scale(22),
          fontWeight: '700',
        },
        sectionDivider: {
          height: scale(2),
          marginVertical: scale(8),
          borderRadius: scale(2),
        },
      }),
    [scaleFactor, currentTheme]
  );

  /* ---------------------------------------------------------------------------
     SUGGESTIONS / SEARCH LOGIC
  --------------------------------------------------------------------------- */
  const handleSuggestionPress = useCallback(
    (course) => {
      setLocalSearchTerm(course.title);
      setShowLocalSuggestions(false);
      navigation.navigate('CourseDetailScreen', { courseId: course.id });
    },
    [navigation]
  );

  const renderSuggestionItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[
          stylesHeader.suggestionItem,
          { borderBottomColor: currentTheme.borderColor },
        ]}
        onPress={() => handleSuggestionPress(item)}
      >
        <View style={stylesHeader.suggestionImageContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={stylesHeader.suggestionImage}
            />
          ) : (
            <Ionicons name="book-outline" size={scale(32)} color="#555" />
          )}
          {item.isFeatured && (
            <View
              style={[
                stylesHeader.featuredBadge,
                { backgroundColor: currentTheme.badgeBackgroundColor },
              ]}
            >
              <Text
                style={[
                  stylesHeader.featuredText,
                  { color: currentTheme.badgeTextColor },
                ]}
              >
                Featured
              </Text>
            </View>
          )}
        </View>
        <View style={stylesHeader.suggestionContent}>
          <Text
            style={[stylesHeader.suggestionTitle, { color: currentTheme.textColor }]}
          >
            {item.title}
          </Text>
          <Text
            style={[
              stylesHeader.suggestionDescription,
              { color: currentTheme.textColor },
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View style={stylesHeader.suggestionStats}>
            <Text
              style={[stylesHeader.suggestionRating, { color: currentTheme.textColor }]}
            >
              {item.rating}⭐
            </Text>
            <Text
              style={[stylesHeader.suggestionReviews, { color: currentTheme.textColor }]}
            >
              {item.reviews} reviews
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [stylesHeader, currentTheme, handleSuggestionPress, scale]
  );

  // Debounced search
  const handleSearch = useCallback(async () => {
    const term = localSearchTerm.trim();
    if (!term) {
      setLocalSuggestions([]);
      setShowLocalSuggestions(false);
      onSearchResults?.([]);
      setIsSearching(false);
      return;
    }
    try {
      setIsSearching(true);
      const resultAction = await dispatch(searchCoursesThunk(term));
      if (searchCoursesThunk.fulfilled.match(resultAction)) {
        const foundCourses = resultAction.payload.data || [];
        const mapped = foundCourses.map((c) => ({ ...c, id: c._id }));
        setLocalSuggestions(mapped);
        setShowLocalSuggestions(true);
        onSearchResults?.(mapped);
      } else {
        setLocalSuggestions([]);
        setShowLocalSuggestions(false);
        onSearchResults?.([]);
      }
    } catch (err) {
      console.log('search error', err);
      setLocalSuggestions([]);
      setShowLocalSuggestions(false);
      onSearchResults?.([]);
    } finally {
      setIsSearching(false);
    }
  }, [localSearchTerm, onSearchResults, dispatch]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [localSearchTerm, handleSearch]);

  /* ---------------------------------------------------------------------------
     RETURN
  --------------------------------------------------------------------------- */
  return (
    <View>
      {/* Hero Header Container */}
      <View style={stylesHeader.headerContainer}>
        {/* Lottie Animated Backgrounds */}
        <View style={stylesHeader.lottieContainer1}>
          <LottieView source={lotti1} autoPlay loop style={stylesHeader.waveLottie1} />
        </View>
        <View style={stylesHeader.lottieContainer2}>
          <LottieView source={lotti2} autoPlay loop style={stylesHeader.waveLottie2} />
        </View>
        <View style={stylesHeader.lottieContainer3}>
          <LottieView source={robo} autoPlay loop style={stylesHeader.waveLottie3} />
        </View>

        {/* Overlay Gradient */}
        <LinearGradient
          colors={currentTheme.aiheader}
          style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
          start={[0, 0]}
          end={[1, 1]}
        />

        {/* Hero Text & Search */}
        <View style={stylesHeader.heroContent}>
          <Text
            style={[
              stylesHeader.headerTitle,
              {
                color: currentTheme.headerTextColor,
                textShadowColor: currentTheme.textShadowColor,
                fontSize: scale(36),
                textAlign: 'center',
              },
            ]}
          >
            AI Courses
          </Text>
          <Text
            style={[
              stylesHeader.headerSubtitle,
              {
                color: currentTheme.headerTextColor,
                textShadowColor: currentTheme.textShadowColor,
                fontSize: scale(18),
                textAlign: 'center',
              },
            ]}
          >
            Elevate your skills with modern AI education
          </Text>

          {/* Search bar */}
          <View
            style={[
              stylesHeader.searchRow,
              { backgroundColor: currentTheme.cardBackground },
            ]}
          >
            <Ionicons
              name="search"
              size={scale(25)}
              color={currentTheme.searchIconColor}
              style={{ marginHorizontal: scale(8) }}
            />
            <TextInput
              placeholder="Search courses..."
              placeholderTextColor={currentTheme.placeholderTextColor}
              style={[
                stylesHeader.searchInput,
                { color: currentTheme.textColor },
              ]}
              value={localSearchTerm}
              onChangeText={setLocalSearchTerm}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {isSearching && (
              <ActivityIndicator
                size="small"
                color={currentTheme.primaryColor}
                style={{ marginRight: scale(8) }}
              />
            )}
          </View>
        </View>
      </View>

      {/* Suggestions */}
      {localSearchTerm.trim() !== '' && !isSearching && localSuggestions.length > 0 && (
        <View
          style={[
            stylesHeader.suggestionsContainer,
            { backgroundColor: currentTheme.cardBackground },
          ]}
        >
          <FlatList
            data={localSuggestions}
            keyExtractor={(item) => item.id}
            renderItem={renderSuggestionItem}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Ads Section */}
      <AdsSection
        currentTheme={currentTheme}
        onAdPress={onAdPress}
        refreshSignal={adsRefresh}
        templateFilter="promo"
        marginV={-5}
        headingShow={true}
        headingText='Promtions for you'
        headingStyle={stylesHeader.adsHeading1}
      />

      {/* Featured Courses */}
      <FeaturedReel currentTheme={currentTheme} />

      {/* Another Ads Section */}
      <AdsSection
        currentTheme={currentTheme}
        onAdPress={onAdPress}
        refreshSignal={adsRefresh}
        templateFilter="newCourse"
        marginV={20}
        headingShow={true}
        headingText='New Courses On Board'
        headingStyle={stylesHeader.adsHeading2}
      />

      {/* "All Courses" section title */}
      {courses.length > 0 && (
        <View style={stylesHeader.sectionWrapper}>
          <Text style={[stylesHeader.sectionTitle, { color: currentTheme.cardTextColor }]}>
            All Courses
          </Text>
          <View
            style={[
              stylesHeader.sectionDivider,
              { backgroundColor: currentTheme.borderColor },
            ]}
          />
        </View>
      )}
    </View>
  );
});

/* ---------------------------------------------------------------------------
   2) Main Screen - AICoursesScreen with scaled styling
--------------------------------------------------------------------------- */
const AICoursesScreen = () => {
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const navigation = useNavigation();

  const { width, height } = useWindowDimensions();

  // 1) Setup scale
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // 2) Local states
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [adsRefresh, setAdsRefresh] = useState(0);

  // 3) Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 4) Decide columns
  const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
  const cardWidth = useMemo(() => {
    const totalMargin = scale(20) * (numColumns + 1);
    return (width - totalMargin) / numColumns;
    // Alternatively, you might just do: return scale(200) for each card, etc.
  }, [width, numColumns, scale]);

  // 5) Redux
  const dispatch = useDispatch();

  // 6) fetchData (Redux thunk)
  const fetchData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
          setPage(1);
          setHasMore(true);
          setAdsRefresh((prev) => prev + 1);
        } else if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const currentPage = isRefresh ? 1 : page;
        const resultAction = await dispatch(
          fetchCoursesThunk({ page: currentPage, limit: PAGE_LIMIT })
        );

        if (fetchCoursesThunk.fulfilled.match(resultAction)) {
          const newCourses = resultAction.payload.data || [];
          if (isRefresh) {
            setCourses(newCourses.map((c) => ({ ...c, id: c._id })));
            setPage(2);
          } else {
            setCourses((prev) => {
              const existingIds = new Set(prev.map((item) => item.id));
              const filtered = newCourses.filter((item) => !existingIds.has(item._id));
              return [...prev, ...filtered.map((c) => ({ ...c, id: c._id }))];
            });
            setPage(currentPage + 1);
          }
          if (newCourses.length < PAGE_LIMIT) {
            setHasMore(false);
          }
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else {
          console.log('fetchData error:', resultAction.payload);
        }
      } catch (err) {
        console.log('fetchData error', err);
      } finally {
        setRefreshing(false);
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [page, dispatch, fadeAnim]
  );

  const refreshAll = useCallback(() => {
    setHasMore(true);
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    refreshAll();
  }, []);

  /* ---------------------------------------------------------------------------
     handleAdPress
  --------------------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------------------
     RENDER COURSE
  --------------------------------------------------------------------------- */
  const renderCourse = useCallback(
    ({ item }) => (
      <CourseCard
        course={item}
        cardWidth={cardWidth}
        currentTheme={currentTheme}
      />
    ),
    [cardWidth, currentTheme]
  );

  /* ---------------------------------------------------------------------------
     getItemLayout
  --------------------------------------------------------------------------- */
  const getItemLayout = useCallback(
    (_, index) => {
      // approximate card height
      const CARD_HEIGHT = scale(300);
      const row = Math.floor(index / numColumns);
      return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
    },
    [numColumns, scale]
  );

  /* ---------------------------------------------------------------------------
     handleLoadMoreCourses
  --------------------------------------------------------------------------- */
  const handleLoadMoreCourses = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchData();
    }
  }, [loadingMore, hasMore, fetchData]);

  /* ---------------------------------------------------------------------------
     STYLES
  --------------------------------------------------------------------------- */
  const stylesMain = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: currentTheme.backgroundColor,
        },
        contentContainer: {
          flex: 1,
          opacity: 1,
        },
        listContent: {
          paddingHorizontal: scale(10),
          paddingBottom: scale(100),
        },
        emptyContainer: {
          flex: 1,
          marginTop: scale(50),
          alignItems: 'center',
        },
        emptyText: {
          fontSize: scale(18),
        },
        loadingScreen: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loadingOverlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99,
        },
        footer: {
          paddingVertical: scale(20),
          alignItems: 'center',
        },
      }),
    [scaleFactor, currentTheme]
  );

  /* ---------------------------------------------------------------------------
     MAIN RENDER
  --------------------------------------------------------------------------- */
  if (loading && courses.length === 0 && !refreshing) {
    return (
      <SafeAreaView style={[stylesMain.loadingScreen]}>
        <ActivityIndicator size="large" color={currentTheme.primaryColor} />
        <Text style={{ color: currentTheme.textColor, marginTop: scale(10) }}>
          Loading courses...
        </Text>
      </SafeAreaView>
    );
  }

  const renderEmptyComponent = () => (
    <View style={stylesMain.emptyContainer}>
      <Text style={[stylesMain.emptyText, { color: currentTheme.textColor }]}>
        No courses available.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={stylesMain.footer}>
        <ActivityIndicator size="small" color={currentTheme.primaryColor} />
      </View>
    );
  };

  return (
    <View style={stylesMain.container}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />
      <CustomHeader />

      <Animated.View style={[stylesMain.contentContainer, { opacity: fadeAnim }]}>
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={renderCourse}
          numColumns={numColumns}
          ListHeaderComponent={
            <AICoursesHeader
              currentTheme={currentTheme}
              adsRefresh={adsRefresh}
              courses={courses}
              onAdPress={handleAdPress}
              onSearchResults={(suggestions) => {
                // optional callback after search
              }}
              /* pass scale-related items to header so it can do scaled styling */
              width={width}
              scaleFactor={scaleFactor}
              scale={scale}
            />
          }
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooter}
          contentContainerStyle={stylesMain.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshAll}
              tintColor={currentTheme.primaryColor}
            />
          }
          onEndReached={handleLoadMoreCourses}
          onEndReachedThreshold={0.5}
          removeClippedSubviews
          initialNumToRender={6}
          windowSize={5}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          getItemLayout={getItemLayout}
        />
      </Animated.View>

      {loading && courses.length > 0 && (
        <View
          style={[
            stylesMain.loadingOverlay,
            { backgroundColor: currentTheme.backgroundColor + 'cc' },
          ]}
        >
          <ActivityIndicator size="large" color={currentTheme.primaryColor} />
          <Text style={{ color: currentTheme.textColor, marginTop: scale(10) }}>
            Loading...
          </Text>
        </View>
      )}
    </View>
  );
};

export default AICoursesScreen;













// // src/screens/AICoursesScreen.js

// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useMemo,
//   useRef,
//   memo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   TextInput,
//   Image,
//   SafeAreaView,
//   Platform,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import LottieView from 'lottie-react-native';

// // Theming
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Lottie animation imports
// import lotti1 from '../../assets/lotti1.json';
// import lotti2 from '../../assets/lotti2.json';
// import robo from '../../assets/robo.json';

// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// // Redux pieces
// import { useDispatch } from 'react-redux';
// import { fetchCoursesThunk, searchCoursesThunk } from '../store/slices/courseSlice';

// const PAGE_LIMIT = 10;

// /* ---------------------------------------------------------------------------
//    1) AICoursesHeader - with responsive header height and font sizes
// --------------------------------------------------------------------------- */
// const AICoursesHeader = memo(function AICoursesHeader({
//   currentTheme,
//   adsRefresh,
//   courses,
//   onAdPress,
//   onSearchResults,
// }) {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();
//   const { width } = useWindowDimensions();

//   // Compute responsive header height
//   const headerHeight = useMemo(() => {
//     if (width < 360) return 180;
//     else if (width < 600) return 220;
//     else return 300;
//   }, [width]);

//   // Responsive font sizes for header title and subtitle
//   const headerFontSize = useMemo(() => {
//     if (width < 360) return 28;
//     else if (width < 600) return 36;
//     else return 44;
//   }, [width]);

//   const headerSubtitleFontSize = useMemo(() => {
//     if (width < 360) return 14;
//     else if (width < 600) return 18;
//     else return 22;
//   }, [width]);

//   // Local search states
//   const [localSearchTerm, setLocalSearchTerm] = useState('');
//   const [localSuggestions, setLocalSuggestions] = useState([]);
//   const [showLocalSuggestions, setShowLocalSuggestions] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);

//   // Pressing on a suggestion
//   const handleSuggestionPress = useCallback(
//     (course) => {
//       setLocalSearchTerm(course.title);
//       setShowLocalSuggestions(false);
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // Render each suggestion item
//   const renderSuggestionItem = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={[styles.suggestionItem, { borderBottomColor: currentTheme.borderColor }]}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View
//               style={[
//                 styles.featuredBadge,
//                 { backgroundColor: currentTheme.badgeBackgroundColor },
//               ]}
//             >
//               <Text style={[styles.featuredText, { color: currentTheme.badgeTextColor }]}>
//                 Featured
//               </Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text style={[styles.suggestionTitle, { color: currentTheme.textColor }]}>
//             {item.title}
//           </Text>
//           <Text
//             style={[styles.suggestionDescription, { color: currentTheme.textColor }]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text style={[styles.suggestionRating, { color: currentTheme.textColor }]}>
//               {item.rating}⭐
//             </Text>
//             <Text style={[styles.suggestionReviews, { color: currentTheme.textColor }]}>
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // Actual search function (debounced by useEffect)
//   const handleSearch = useCallback(async () => {
//     const term = localSearchTerm.trim();
//     if (!term) {
//       setLocalSuggestions([]);
//       setShowLocalSuggestions(false);
//       onSearchResults?.([]);
//       setIsSearching(false);
//       return;
//     }
//     try {
//       setIsSearching(true);
//       const resultAction = await dispatch(searchCoursesThunk(term));
//       if (searchCoursesThunk.fulfilled.match(resultAction)) {
//         const foundCourses = resultAction.payload.data || [];
//         const mapped = foundCourses.map((c) => ({ ...c, id: c._id }));
//         setLocalSuggestions(mapped);
//         setShowLocalSuggestions(true);
//         onSearchResults?.(mapped);
//       } else {
//         setLocalSuggestions([]);
//         setShowLocalSuggestions(false);
//         onSearchResults?.([]);
//       }
//     } catch (err) {
//       console.log('search error', err);
//       setLocalSuggestions([]);
//       setShowLocalSuggestions(false);
//       onSearchResults?.([]);
//     } finally {
//       setIsSearching(false);
//     }
//   }, [localSearchTerm, onSearchResults, dispatch]);

//   // Debounce search on keystroke
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       handleSearch();
//     }, 300);
//     return () => clearTimeout(delayDebounceFn);
//   }, [localSearchTerm, handleSearch]);

//   return (
//     <View>
//       {/* Hero Header Container */}
//       <View style={[styles.headerContainer, { height: headerHeight }]}>
//         {/* Lottie Animated Backgrounds */}
//         <View style={styles.lottieContainer1}>
//           <LottieView source={lotti1} autoPlay loop style={styles.waveLottie1} />
//         </View>
//         <View style={styles.lottieContainer2}>
//           <LottieView source={lotti2} autoPlay loop style={styles.waveLottie2} />
//         </View>
//         <View style={styles.lottieContainer3}>
//           <LottieView source={robo} autoPlay loop style={styles.waveLottie3} />
//         </View>

//         {/* Overlay Gradient */}
//         <LinearGradient
//           colors={currentTheme.aiheader}
//           style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
//           start={[0, 0]}
//           end={[1, 1]}
//         />

//         {/* Hero Text & Search */}
//         <View style={styles.heroContent}>
//           <Text
//             style={[
//               styles.headerTitle,
//               {
//                 color: currentTheme.headerTextColor,
//                 textShadowColor: currentTheme.textShadowColor,
//                 fontSize: headerFontSize,
//                 textAlign:'center'
//               },
//             ]}
//           >
//             AI Courses
//           </Text>
//           <Text
//             style={[
//               styles.headerSubtitle,
//               {
//                 color: currentTheme.headerTextColor,
//                 textShadowColor: currentTheme.textShadowColor,
//                 fontSize: headerSubtitleFontSize,
//                 textAlign:'center'
//               },
//             ]}
//           >
//             Elevate your skills with modern AI education
//           </Text>

//           {/* Search bar */}
//           <View
//             style={[
//               styles.searchRow,
//               { backgroundColor: currentTheme.cardBackground },
//             ]}
//           >
//             <Ionicons
//               name="search"
//               size={25}
//               color={currentTheme.searchIconColor}
//               style={{ marginHorizontal: 8 }}
//             />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={localSearchTerm}
//               onChangeText={setLocalSearchTerm}
//               autoCapitalize="none"
//               returnKeyType="search"
//             />
//             {/* Inline spinner while searching */}
//             {isSearching && (
//               <ActivityIndicator
//                 size="small"
//                 color={currentTheme.primaryColor}
//                 style={{ marginRight: 8 }}
//               />
//             )}
//           </View>
//         </View>
//       </View>

//       {/* Suggestions Container: displayed only when not searching and there are suggestions */}
//       {localSearchTerm.trim() !== '' && !isSearching && localSuggestions.length > 0 && (
//         <View style={[styles.suggestionsContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <FlatList
//             data={localSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestionItem}
//             keyboardShouldPersistTaps="handled"
//           />
//         </View>
//       )}

//       {/* Ads Section */}
//       <AdsSection
//         currentTheme={currentTheme}
//         onAdPress={onAdPress}
//         refreshSignal={adsRefresh}
//         templateFilter="promo"
//         marginV={-5}
//       />
//       {/* Featured Courses */}
//       <FeaturedReel currentTheme={currentTheme} />
//       {/* Another Ads Section */}
//       <AdsSection
//         currentTheme={currentTheme}
//         onAdPress={onAdPress}
//         refreshSignal={adsRefresh}
//         templateFilter="newCourse"
//         marginV={20}
//       />
//       {/* "All Courses" section title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             All Courses
//           </Text>
//           <View style={[styles.sectionDivider, { backgroundColor: currentTheme.borderColor }]} />
//         </View>
//       )}
//     </View>
//   );
// });

// /* ---------------------------------------------------------------------------
//    2) Main Screen - AICoursesScreen with responsive grid & card widths
// --------------------------------------------------------------------------- */
// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // Local states
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // Animations
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Decide columns based on device width
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   const dispatch = useDispatch();

//   // Fetch courses via Redux thunk
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           setAdsRefresh((prev) => prev + 1);
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const resultAction = await dispatch(
//           fetchCoursesThunk({ page: currentPage, limit: PAGE_LIMIT })
//         );

//         if (fetchCoursesThunk.fulfilled.match(resultAction)) {
//           const newCourses = resultAction.payload.data || [];
//           if (isRefresh) {
//             setCourses(newCourses.map((c) => ({ ...c, id: c._id })));
//             setPage(2);
//           } else {
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter((item) => !existingIds.has(item._id));
//               return [...prev, ...filtered.map((c) => ({ ...c, id: c._id }))];
//             });
//             setPage(currentPage + 1);
//           }
//           if (newCourses.length < PAGE_LIMIT) {
//             setHasMore(false);
//           }
//           Animated.timing(fadeAnim, {
//             toValue: 1,
//             duration: 300,
//             useNativeDriver: true,
//           }).start();
//         } else {
//           console.log('fetchData error:', resultAction.payload);
//         }
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, dispatch, fadeAnim]
//   );

//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   useEffect(() => {
//     refreshAll();
//   }, []);

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

//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   const getItemLayout = useCallback(
//     (_, index) => {
//       const CARD_HEIGHT = 300;
//       const row = Math.floor(index / numColumns);
//       return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//     },
//     [numColumns]
//   );

//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView
//         style={[styles.loadingScreen, { backgroundColor: currentTheme.backgroundColor }]}
//       >
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//         No courses available.
//       </Text>
//     </View>
//   );

//   const renderFooter = () => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <CustomHeader />
//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           ListHeaderComponent={
//             <AICoursesHeader
//               currentTheme={currentTheme}
//               adsRefresh={adsRefresh}
//               courses={courses}
//               onAdPress={handleAdPress}
//               onSearchResults={(suggestions) => {
//                 // optional callback after search
//               }}
//             />
//           }
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>
//       {loading && courses.length > 0 && (
//         <View
//           style={[
//             styles.loadingOverlay,
//             { backgroundColor: currentTheme.backgroundColor + 'cc' },
//           ]}
//         >
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>Loading...</Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default AICoursesScreen;

// /* ---------------------------------------------------------------------------
//    Styles
// --------------------------------------------------------------------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   adsContainer: {
//     marginVertical: -15,
//   },
//   headerContainer: {
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     // marginHorizontal: -10,
//     position: 'relative',
//   },
//   lottieContainer1: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'center',
//   },
//   waveLottie1: {
//     width: '120%',
//     height: '120%',
//   },
//   lottieContainer2: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-end',
//   },
//   waveLottie2: {
//     width: '45%',
//     height: '45%',
//   },
//   lottieContainer3: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-start',
//     left: -30,
//   },
//   waveLottie3: {
//     width: '45%',
//     height: '50%',
//   },
//   heroContent: {
//     flex: 1,
//     zIndex: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 25,
//   },
//   headerTitle: {
//     fontWeight: '800',
//     marginBottom: 6,
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     marginBottom: 12,
//     opacity: 0.9,
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderRadius: 25,
//     elevation: 4,
//     width: '100%',
//     paddingHorizontal: 10,
//     marginTop: 15,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 10,
//   },
//   suggestionsContainer: {
//     marginHorizontal: 10,
//     marginTop: -40,
//     borderRadius: 12,
//     elevation: 6,
//     padding: 10,
//     zIndex: 1,
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     paddingHorizontal: Platform.OS === 'ios' ? 2 : 4,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginTop: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     marginVertical: 8,
//     borderRadius: 2,
//   },
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });









// // src/screens/AICoursesScreen.js

// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useMemo,
//   useRef,
//   memo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   TextInput,
//   Image,
//   SafeAreaView,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import LottieView from 'lottie-react-native';

// // Theming
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Lottie animation imports
// import lotti1 from '../../assets/lotti1.json';
// import lotti2 from '../../assets/lotti2.json';
// import robo from '../../assets/robo.json';

// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// // Redux pieces
// import { useDispatch } from 'react-redux';
// import { fetchCoursesThunk, searchCoursesThunk } from '../store/slices/courseSlice';

// const PAGE_LIMIT = 10;
// const HEADER_HEIGHT = 220;

// /* ---------------------------------------------------------------------------
//    1) AICoursesHeader - reverted to previous behavior without scroll management
// --------------------------------------------------------------------------- */
// const AICoursesHeader = memo(function AICoursesHeader({
//   currentTheme,
//   adsRefresh,
//   courses,
//   onAdPress,
//   onSearchResults,
// }) {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();

//   // Local search states
//   const [localSearchTerm, setLocalSearchTerm] = useState('');
//   const [localSuggestions, setLocalSuggestions] = useState([]);
//   const [showLocalSuggestions, setShowLocalSuggestions] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);

//   // Pressing on a suggestion
//   const handleSuggestionPress = useCallback(
//     (course) => {
//       setLocalSearchTerm(course.title);
//       setShowLocalSuggestions(false);
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // Render each suggestion item
//   const renderSuggestionItem = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={[styles.suggestionItem,{borderBottomColor: currentTheme.borderColor}]}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View style={[styles.featuredBadge,{backgroundColor: currentTheme.badgeBackgroundColor}]}>
//               <Text style={[styles.featuredText,{color: currentTheme.badgeTextColor}]}>Featured</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text style={[styles.suggestionTitle, { color: currentTheme.textColor }]}>
//             {item.title}
//           </Text>
//           <Text
//             style={[styles.suggestionDescription, { color: currentTheme.textColor }]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text style={[styles.suggestionRating, { color: currentTheme.textColor }]}>
//               {item.rating}⭐
//             </Text>
//             <Text style={[styles.suggestionReviews, { color: currentTheme.textColor }]}>
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // Actual search function (debounced by useEffect)
//   const handleSearch = useCallback(async () => {
//     const term = localSearchTerm.trim();
//     if (!term) {
//       setLocalSuggestions([]);
//       setShowLocalSuggestions(false);
//       onSearchResults?.([]);
//       setIsSearching(false);
//       return;
//     }
//     try {
//       setIsSearching(true);
//       const resultAction = await dispatch(searchCoursesThunk(term));
//       if (searchCoursesThunk.fulfilled.match(resultAction)) {
//         const foundCourses = resultAction.payload.data || [];
//         const mapped = foundCourses.map((c) => ({ ...c, id: c._id }));
//         setLocalSuggestions(mapped);
//         setShowLocalSuggestions(true);
//         onSearchResults?.(mapped);
//       } else {
//         setLocalSuggestions([]);
//         setShowLocalSuggestions(false);
//         onSearchResults?.([]);
//       }
//     } catch (err) {
//       console.log('search error', err);
//       setLocalSuggestions([]);
//       setShowLocalSuggestions(false);
//       onSearchResults?.([]);
//     } finally {
//       setIsSearching(false);
//     }
//   }, [localSearchTerm, onSearchResults, dispatch]);

//   // Debounce search on keystroke
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       handleSearch();
//     }, 300);
//     return () => clearTimeout(delayDebounceFn);
//   }, [localSearchTerm, handleSearch]);

//   return (
//     <View>
//       {/* Hero Header Container */}
//       <View style={styles.headerContainer}>
//         {/* Lottie Animated Backgrounds */}
//         <View style={styles.lottieContainer1}>
//           <LottieView source={lotti1} autoPlay loop style={styles.waveLottie1} />
//         </View>
//         <View style={styles.lottieContainer2}>
//           <LottieView source={lotti2} autoPlay loop style={styles.waveLottie2} />
//         </View>
//         <View style={styles.lottieContainer3}>
//           <LottieView source={robo} autoPlay loop style={styles.waveLottie3} />
//         </View>

//         {/* Overlay Gradient */}
//         <LinearGradient
//           colors={currentTheme.aiheader}
//           style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
//           start={[0, 0]}
//           end={[1, 1]}
//         />

//         {/* Hero Text & Search */}
//         <View style={styles.heroContent}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor, textShadowColor: currentTheme.textShadowColor }]}>
//             AI Courses
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor,textShadowColor: currentTheme.textShadowColor }]}>
//             Elevate your skills with modern AI education
//           </Text>

//           {/* Search bar */}
//           <View style={[styles.searchRow,{ backgroundColor: currentTheme.inputSearchBackgroundColor }]}>
//             <Ionicons name="search" size={25} color={currentTheme.searchIconColor} style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={localSearchTerm}
//               onChangeText={setLocalSearchTerm}
//               autoCapitalize="none"
//               returnKeyType="search"
//             />
//             {/* Inline spinner while searching */}
//             {isSearching && (
//               <ActivityIndicator size="small" color={currentTheme.primaryColor} style={{ marginRight: 8 }} />
//             )}
//           </View>
//         </View>
//       </View>

//       {/* Suggestions Container: displayed only when not searching and there are suggestions */}
//       {localSearchTerm.trim() !== '' && !isSearching && localSuggestions.length > 0 && (
//         <View style={[styles.suggestionsContainer, { backgroundColor: currentTheme.backgroundColor }]}>
//           <FlatList
//             data={localSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestionItem}
//             keyboardShouldPersistTaps="handled"
//           />
//         </View>
//       )}

//       {/* Ads Section */}
//       {/* <View style={styles.adsContainer}> */}
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={onAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="promo"
//           marginV={-5}
//         />
//       {/* </View> */}
//       {/* Featured Courses */}
//       <FeaturedReel currentTheme={currentTheme} />
//       {/* Another Ads Section */}
//       {/* <View style={{ marginVertical: 10 }}> */}
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={onAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="newCourse"
//           marginV={20}
//         />
//       {/* </View> */}
//       {/* "All Courses" section title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             All Courses
//           </Text>
//           <View style={[styles.sectionDivider, { backgroundColor: currentTheme.borderColor }]} />
//         </View>
//       )}
//     </View>
//   );
// });

// /* ---------------------------------------------------------------------------
//    2) Main Screen - AICoursesScreen
// --------------------------------------------------------------------------- */
// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // Local states
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // Animations
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Decide columns
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   const dispatch = useDispatch();

//   // Fetch courses via Redux thunk
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           setAdsRefresh((prev) => prev + 1);
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const resultAction = await dispatch(
//           fetchCoursesThunk({ page: currentPage, limit: PAGE_LIMIT })
//         );

//         if (fetchCoursesThunk.fulfilled.match(resultAction)) {
//           const newCourses = resultAction.payload.data || [];
//           if (isRefresh) {
//             setCourses(newCourses.map((c) => ({ ...c, id: c._id })));
//             setPage(2);
//           } else {
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter((item) => !existingIds.has(item._id));
//               return [...prev, ...filtered.map((c) => ({ ...c, id: c._id }))];
//             });
//             setPage(currentPage + 1);
//           }
//           if (newCourses.length < PAGE_LIMIT) {
//             setHasMore(false);
//           }
//           Animated.timing(fadeAnim, {
//             toValue: 1,
//             duration: 300,
//             useNativeDriver: true,
//           }).start();
//         } else {
//           console.log('fetchData error:', resultAction.payload);
//         }
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, dispatch, fadeAnim]
//   );

//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   useEffect(() => {
//     refreshAll();
//   }, []);

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

//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   const getItemLayout = useCallback(
//     (_, index) => {
//       const CARD_HEIGHT = 300;
//       const row = Math.floor(index / numColumns);
//       return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//     },
//     [numColumns]
//   );

//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.loadingScreen, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//         No courses available.
//       </Text>
//     </View>
//   );

//   const renderFooter = () => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={
//           currentTheme.headerBackground[0]
//         }
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <CustomHeader />
//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           ListHeaderComponent={(
//             <AICoursesHeader
//               currentTheme={currentTheme}
//               adsRefresh={adsRefresh}
//               courses={courses}
//               onAdPress={handleAdPress}
//               onSearchResults={(suggestions) => {
//                 // optional callback after search
//               }}
//             />
//           )}
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>
//       {loading && courses.length > 0 && (
//         <View
//           style={[
//             styles.loadingOverlay,
//             { backgroundColor: currentTheme.backgroundColor + 'cc' },
//           ]}
//         >
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//             Loading...
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// };

// export default AICoursesScreen;

// /* ---------------------------------------------------------------------------
//    Styles - reverted suggestion container styles (no scroll tweaks)
// --------------------------------------------------------------------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   adsContainer: {
//     marginVertical: -15,
//   },
//   headerContainer: {
//     height: HEADER_HEIGHT,
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginHorizontal: -10,
//     position: 'relative',
//   },
//   lottieContainer1: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'center',
//   },
//   waveLottie1: {
//     width: '120%',
//     height: '120%',
//   },
//   lottieContainer2: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-end',
//   },
//   waveLottie2: {
//     width: '45%',
//     height: '45%',
//   },
//   lottieContainer3: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-start',
//     left: -30,
//   },
//   waveLottie3: {
//     width: '45%',
//     height: '50%',
//   },
//   heroContent: {
//     flex: 1,
//     zIndex: 2,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 25,
//   },
//   headerTitle: {
//     fontSize: 36,
//     fontWeight: '800',
//     marginBottom: 6,
//     // textShadowColor: 'rgba(0, 0, 0, 0.9)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     marginBottom: 12,
//     opacity: 0.9,
//     // textShadowColor: 'rgba(0, 0, 0, 0.9)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     // backgroundColor: 'transparent',
//     borderRadius: 25,
//     elevation: 4,
//     width: '100%',
//     paddingHorizontal: 10,
//     marginTop: 15,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 10,
//   },
//   suggestionsContainer: {
//     marginHorizontal: 10,
//     marginTop: -40,
//     borderRadius: 12,
//     elevation: 6,
//     padding: 10,
//     zIndex: 1,
//     // No maxHeight here—behaves as before
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     // borderBottomColor: '#ddd',
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     // backgroundColor: '#FFD700',
//     paddingHorizontal: 4,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//     // color: '#fff',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginTop: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     // backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });






// // src/screens/AICoursesScreen.js

// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useRef,
//   useMemo,
//   memo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   TextInput,
//   Image,
//   SafeAreaView,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import LottieView from 'lottie-react-native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Lottie animation imports - update paths as needed
// import lotti1 from '../../assets/lotti1.json';
// import lotti2 from '../../assets/lotti2.json';
// import robo from '../../assets/robo.json'

// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// // Services
// import { fetchCourses, searchCoursesAPI } from '../services/api';

// // Pagination limit for courses
// const PAGE_LIMIT = 10;
// const HEADER_HEIGHT = 220;

// /* ---------------------------------------------------------------------------
//    1) AICoursesHeader - separate, memoized component
//    --------------------------------------------------------------------------- */
// const AICoursesHeader = memo(function AICoursesHeader({
//   currentTheme,
//   adsRefresh,
//   courses,
//   onAdPress,
//   onSearchResults,
// }) {
//   const navigation = useNavigation();

//   // Local search states
//   const [localSearchTerm, setLocalSearchTerm] = useState('');
//   const [localSuggestions, setLocalSuggestions] = useState([]);
//   const [showLocalSuggestions, setShowLocalSuggestions] = useState(false);

//   // Pressing on a suggestion
//   const handleSuggestionPress = useCallback(
//     (course) => {
//       setLocalSearchTerm(course.title);
//       setShowLocalSuggestions(false);
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // Render each suggestion item
//   const renderSuggestionItem = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={styles.suggestionItem}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View style={styles.featuredBadge}>
//               <Text style={styles.featuredText}>Featured</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text style={[styles.suggestionTitle, { color: currentTheme.textColor }]}>
//             {item.title}
//           </Text>
//           <Text
//             style={[styles.suggestionDescription, { color: currentTheme.textColor }]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text style={[styles.suggestionRating, { color: currentTheme.textColor }]}>
//               {item.rating}⭐
//             </Text>
//             <Text style={[styles.suggestionReviews, { color: currentTheme.textColor }]}>
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // Actual search function (debounced by useEffect)
//   const handleSearch = useCallback(async () => {
//     try {
//       const term = localSearchTerm.trim();
//       if (!term) {
//         setLocalSuggestions([]);
//         setShowLocalSuggestions(false);
//         onSearchResults?.([]);
//         return;
//       }
//       const result = await searchCoursesAPI(term);
//       if (result.success && result.data) {
//         const mapped = result.data.map((c) => ({ ...c, id: c._id }));
//         setLocalSuggestions(mapped);
//         setShowLocalSuggestions(true);
//         onSearchResults?.(mapped);
//       } else {
//         setLocalSuggestions([]);
//         setShowLocalSuggestions(false);
//         onSearchResults?.([]);
//       }
//     } catch (err) {
//       console.log('search error', err);
//       setLocalSuggestions([]);
//       setShowLocalSuggestions(false);
//       onSearchResults?.([]);
//     }
//   }, [localSearchTerm, onSearchResults]);

//   // Debounce search on keystroke
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       handleSearch();
//     }, 300);
//     return () => clearTimeout(delayDebounceFn);
//   }, [localSearchTerm, handleSearch]);

//   return (
//     <View>
//       {/* Hero Header Container */}
//       <View style={styles.headerContainer}>
//         {/* Lottie Animated Background #1 */}
//         <View style={styles.lottieContainer1}>
//           <LottieView
//             source={lotti1}
//             autoPlay
//             loop
//             style={styles.waveLottie1}
//           />
//         </View>

//         {/* Lottie Animated Background #2 */}
//         <View style={styles.lottieContainer2}>
//           <LottieView
//             source={lotti2}
//             autoPlay
//             loop
//             style={styles.waveLottie2}
//           />
//         </View>

//         {/* Lottie Animated Background #3 */}
//         <View style={styles.lottieContainer3}>
//           <LottieView
//             source={robo}
//             autoPlay
//             loop
//             style={styles.waveLottie3}
//           />
//         </View>

//         {/* Overlay Gradient - you can change these colors for header tint */}
//         <LinearGradient
//           colors={currentTheme.aiheader}
//           style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
//           start={[0, 0]}
//           end={[1, 1]}
//         />

//         {/* Hero Text & Search */}
//         <View style={styles.heroContent}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             AI Courses
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Elevate your skills with modern AI education
//           </Text>

//           {/* Search bar */}
//           <View style={styles.searchRow}>
//             <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor="#999"
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={localSearchTerm}
//               onChangeText={setLocalSearchTerm}
//               autoCapitalize="none"
//               returnKeyType="search"
//             />
//           </View>
//         </View>
//       </View>

//       {/* If suggestions exist, display them */}
//       {showLocalSuggestions && localSuggestions.length > 0 && (
//         <View style={[styles.suggestionsContainer, { backgroundColor: currentTheme.backgroundColor }]}>
//           <FlatList
//             data={localSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestionItem}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={5}
//             maxToRenderPerBatch={8}
//             windowSize={11}
//           />
//         </View>
//       )}

//       {/* Ads Section */}
//       <View style={styles.adsContainer}>
//           <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={onAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="promo"
//         />
//       </View>
//       {/* Featured Courses */}
//       <FeaturedReel currentTheme={currentTheme} />

//       {/* Another Ads Section */}
//       <View style={{ marginVertical: 10}}>
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={onAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="newCourse"
//         />
//       </View>

//       {/* "All Courses" section title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             All Courses
//           </Text>
//           <View style={styles.sectionDivider} />
//         </View>
//       )}
//     </View>
//   );
// });

// /* ---------------------------------------------------------------------------
//    2) Main Screen - AICoursesScreen
//    --------------------------------------------------------------------------- */
// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // Course state
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   // Loading states
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // Ads refresh trigger
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // Animations
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Adjust columns based on device width
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   // Fetch courses (paged)
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           setAdsRefresh((prev) => prev + 1); // Trigger ads to refresh
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const coursesResponse = await fetchCourses(currentPage, PAGE_LIMIT);

//         if (coursesResponse.success) {
//           const newCourses = coursesResponse.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));

//           if (isRefresh) {
//             setCourses(newCourses);
//             setPage(2);
//           } else {
//             // Add only new unique courses
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter((item) => !existingIds.has(item.id));
//               return [...prev, ...filtered];
//             });
//             setPage(currentPage + 1);
//           }

//           if (newCourses.length < PAGE_LIMIT) {
//             setHasMore(false);
//           }
//         }

//         // Fade in
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, fadeAnim]
//   );

//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   useEffect(() => {
//     refreshAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Ad press
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

//   // Course item rendering
//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   // For performance: get item layout
//   const getItemLayout = useCallback(
//     (_, index) => {
//       const CARD_HEIGHT = 300;
//       const row = Math.floor(index / numColumns);
//       return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//     },
//     [numColumns]
//   );

//   // Pagination
//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   // If no data at all and we are loading
//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.loadingScreen, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   // Empty list
//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//         No courses available.
//       </Text>
//     </View>
//   );

//   // Footer
//   const renderFooter = () => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={
//           currentTheme.headerBackground
//             ? currentTheme.headerBackground[0]
//             : currentTheme.primaryColor
//         }
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />

//       {/* Custom Header (Top Navigation) */}
//       <CustomHeader />

//       {/* Content */}
//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           ListHeaderComponent={(
//             <AICoursesHeader
//               currentTheme={currentTheme}
//               adsRefresh={adsRefresh}
//               courses={courses}
//               onAdPress={handleAdPress}
//               onSearchResults={(suggestions) => {
//                 // optional callback
//               }}
//             />
//           )}
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>

//       {/* Overlay loader if new data is loading but we already have some courses */}
//       {loading && courses.length > 0 && (
//         <View
//           style={[
//             styles.loadingOverlay,
//             { backgroundColor: currentTheme.backgroundColor + 'cc' },
//           ]}
//         >
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//             Loading...
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default AICoursesScreen;

// /* ---------------------------------------------------------------------------
//    Styles
//    --------------------------------------------------------------------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   adsContainer: {
//     marginVertical: -15,
//   },
//   /* 
//    * HERO HEADER 
//    */
//   headerContainer: {
//     height: HEADER_HEIGHT,
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginHorizontal: -10,
//     position: 'relative',
//     // If you'd like a base background color behind Lottie, uncomment:
//     // backgroundColor: '#dbeafe',
//   },
//   lottieContainer1: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     // zIndex: 1,
//     alignItems:'center'
//   },
//   waveLottie1: {
//     width: '120%',
//     height: '120%',
//     // alignItems: 'flex-start',
//   },
//   lottieContainer2: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-end',
//     // zIndex: 1,
//   },
//   waveLottie2: {
//     width: '45%',
//     height: '45%',
//   },
//   lottieContainer3: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-start',
//     left: -30,
//     // zIndex: 1,
//   },
//   waveLottie3: {
//     width: '45%',
//     height: '50%',
//   },
//   heroContent: {
//     flex: 1,
//     zIndex: 2, // ensure it's above the Lotties
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 25,
//   },
//   headerTitle: {
//     fontSize: 36,
//     fontWeight: '800',
//     marginBottom: 6,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     marginBottom: 12,
//     opacity: 0.9,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     elevation: 4,
//     width: '100%',
//     paddingHorizontal: 10,
//     marginTop: 15,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 10,
//   },

//   /* 
//    * SUGGESTIONS 
//    */
//   suggestionsContainer: {
//     marginHorizontal: 10,
//     marginTop: -40,
//     borderRadius: 12,
//     elevation: 6,
//     padding: 10,
//     zIndex: 1,
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     borderBottomColor: '#ddd',
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 4,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },

//   /* 
//    * MAIN CONTENT 
//    */
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },

//   /* 
//    * EMPTY 
//    */
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },

//   /* 
//    * LOADING 
//    */
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });











// // src/screens/AICoursesScreen.js

// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useRef,
//   useMemo,
//   memo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   TextInput,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// import LottieView from 'lottie-react-native';
// import lotti1 from '../../assets/lotti1.json';
// import lotti2 from '../../assets/lotti2.json'; 
// // or wherever your Lottie JSON is stored


// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// // Services
// import {
//   fetchCourses,
//   searchCoursesAPI,
// } from '../services/api';

// // Pagination limit for courses
// const PAGE_LIMIT = 10;
// const HEADER_HEIGHT = 220;

// /* ---------------------------------------------------------------------------
//    1) AICoursesHeader - separate, memoized component
//    --------------------------------------------------------------------------- */
// const AICoursesHeader = memo(function AICoursesHeader({
//   currentTheme,
//   adsRefresh,
//   courses,
//   onAdPress,
//   onSearchResults, // callback to pass final search suggestions up
// }) {
//   const navigation = useNavigation();

//   // Local search states, so typing doesn't re-render the entire screen
//   const [localSearchTerm, setLocalSearchTerm] = useState('');
//   const [localSuggestions, setLocalSuggestions] = useState([]);
//   const [showLocalSuggestions, setShowLocalSuggestions] = useState(false);

//   // Handle pressing on a suggestion
//   const handleSuggestionPress = useCallback(
//     (course) => {
//       // Fill the input with that course title, hide suggestions
//       setLocalSearchTerm(course.title);
//       setShowLocalSuggestions(false);
//       // Navigate to course detail
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // Render each suggestion item
//   const renderSuggestionItem = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={styles.suggestionItem}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View style={styles.featuredBadge}>
//               <Text style={styles.featuredText}>Featured</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text style={[styles.suggestionTitle, { color: currentTheme.textColor }]}>
//             {item.title}
//           </Text>
//           <Text
//             style={[styles.suggestionDescription, { color: currentTheme.textColor }]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text style={[styles.suggestionRating, { color: currentTheme.textColor }]}>
//               {item.rating}⭐
//             </Text>
//             <Text style={[styles.suggestionReviews, { color: currentTheme.textColor }]}>
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // Actual search function invoked on keystroke (debounced)
//   const handleSearch = useCallback(async () => {
//     try {
//       const term = localSearchTerm.trim();
//       if (!term) {
//         setLocalSuggestions([]);
//         setShowLocalSuggestions(false);
//         onSearchResults && onSearchResults([]);
//         return;
//       }
//       const result = await searchCoursesAPI(term);
//       if (result.success && result.data) {
//         const mapped = result.data.map((c) => ({ ...c, id: c._id }));
//         setLocalSuggestions(mapped);
//         setShowLocalSuggestions(true);
//         // Let parent know about it (optional)
//         onSearchResults && onSearchResults(mapped);
//       } else {
//         setLocalSuggestions([]);
//         setShowLocalSuggestions(false);
//         onSearchResults && onSearchResults([]);
//       }
//     } catch (err) {
//       console.log('search error', err);
//       setLocalSuggestions([]);
//       setShowLocalSuggestions(false);
//       onSearchResults && onSearchResults([]);
//     }
//   }, [localSearchTerm, onSearchResults]);

//   // Debounce search on keystroke
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       handleSearch();
//     }, 300);
//     return () => clearTimeout(delayDebounceFn);
//   }, [localSearchTerm, handleSearch]);

//   return (
//     <View>
//       {/* Hero / Gradient Header */}
//       <View style={[styles.headerContainer]}>
//       {/* Lottie Animated Wave Background */}
//       <View style={styles.lottieContainer1}>
//         <LottieView
//           source={lotti1}
//           autoPlay
//           loop
//           style={styles.waveLottie1}
//           // You can experiment with speed or progress for different effects
//         />
//       </View>
//            {/* Lottie Animated Wave Background */}
//            <View style={styles.lottieContainer2}>
//         <LottieView
//           source={lotti2}
//           autoPlay
//           loop
//           style={styles.waveLottie2}
//           // You can experiment with speed or progress for different effects
//         />
//       </View>

//       {/* Overlay for gradient tint or color overlay (optional) */}
//       <LinearGradient
//         colors={['rgba(102, 126, 234, 0.6)', 'rgba(100, 182, 255, 0.6)']}
//         style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
//         start={[0, 0]}
//         end={[1, 1]}
//       />

//       {/* Hero Text & Search */}
//       <View style={styles.heroContent}>
//         <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//           AI Courses
//         </Text>
//         <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//           Elevate your skills with modern AI education
//         </Text>

//         {/* Search bar + button */}
//         <View style={styles.searchRow}>
//           <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//           <TextInput
//             placeholder="Search courses..."
//             placeholderTextColor="#999"
//             style={[styles.searchInput, { color: currentTheme.textColor }]}
//             value={localSearchTerm}
//             onChangeText={setLocalSearchTerm}
//             autoCapitalize="none"
//             returnKeyType="search"
//           />
//         </View>
//       </View>
//     </View>
//       {/* <View style={styles.headerArea}>
//         <LinearGradient
//           colors={currentTheme.headerBackground || ['#667EEA', '#64B6FF']}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         >
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             AI Courses
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Elevate your skills with modern AI education
//           </Text>

          
//           <View style={styles.searchRow}>
//             <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor="#999"
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={localSearchTerm}
//               onChangeText={setLocalSearchTerm}
//               autoCapitalize="none"
//               returnKeyType="search"
//             />
//           </View>
//         </LinearGradient>
//       </View> */}

//       {/* Suggestions list */}
//       {showLocalSuggestions && localSuggestions.length > 0 && (
//         <View style={[styles.suggestionsContainer, { backgroundColor: currentTheme.backgroundColor }]}>
//           <FlatList
//             data={localSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestionItem}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={5}
//             maxToRenderPerBatch={8}
//             windowSize={11}
//           />
//         </View>
//       )}

//       {/* Ads Section */}
//       <AdsSection
//         currentTheme={currentTheme}
//         onAdPress={onAdPress}
//         refreshSignal={adsRefresh}
//         templateFilter="promo"
//       />

//       {/* Featured Courses */}
//       <FeaturedReel currentTheme={currentTheme} />

//       {/* Another Ads Section */}
//       <View style={{ marginTop: 25, marginBottom: 25 }}>
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={onAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="newCourse"
//         />
//       </View>

//       {/* All Courses Title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             All Courses
//           </Text>
//           <View style={styles.sectionDivider} />
//         </View>
//       )}
//     </View>
//   );
// });

// /* ---------------------------------------------------------------------------
//    2) Main Screen
//    --------------------------------------------------------------------------- */
// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // ----------------------- Course State -----------------------
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   // Loading states
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // ----------------------- Ads Refresh Signal -----------------------
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // Animation
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Layout calculations
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   // ---------------------------------------------------------------------------
//   // fetchData
//   // ---------------------------------------------------------------------------
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           // Trigger ads refresh
//           setAdsRefresh((prev) => prev + 1);
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const coursesResponse = await fetchCourses(currentPage, PAGE_LIMIT);

//         if (coursesResponse.success) {
//           const newCourses = coursesResponse.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));

//           if (isRefresh) {
//             setCourses(newCourses);
//             setPage(2);
//           } else {
//             // Only add non-duplicate courses
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter((item) => !existingIds.has(item.id));
//               return [...prev, ...filtered];
//             });
//             setPage(currentPage + 1);
//           }

//           if (newCourses.length < PAGE_LIMIT) {
//             setHasMore(false);
//           }
//         }

//         // Simple fade-in
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, fadeAnim]
//   );

//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   useEffect(() => {
//     refreshAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // Handle Ad Press
//   // ---------------------------------------------------------------------------
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

//   // ---------------------------------------------------------------------------
//   // Renders
//   // ---------------------------------------------------------------------------
//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   const getItemLayout = useCallback((_, index) => {
//     const CARD_HEIGHT = 300;
//     const row = Math.floor(index / numColumns);
//     return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//   }, [numColumns]);

//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   // If no data at all (initial load)
//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.loadingScreen, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//         No courses available.
//       </Text>
//     </View>
//   );

//   const renderFooter = () => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={
//           currentTheme.headerBackground
//             ? currentTheme.headerBackground[0]
//             : currentTheme.primaryColor
//         }
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />

//       {/* Custom Header (pinned at top) */}
//       <CustomHeader />

//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           // Instead of using a function, we pass a stable component:
//           ListHeaderComponent={(
//             <AICoursesHeader
//               currentTheme={currentTheme}
//               adsRefresh={adsRefresh}
//               courses={courses}
//               onAdPress={handleAdPress}
//               // Optional: If you want to track search suggestions in parent:
//               onSearchResults={(suggestions) => {
//                 // For example, if you want to do something with them.
//                 // Not strictly required. Just left here for reference.
//               }}
//             />
//           )}
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>

//       {/* Overlay loader if new data is loading but some courses already exist */}
//       {loading && courses.length > 0 && (
//         <View style={[
//           styles.loadingOverlay,
//           { backgroundColor: currentTheme.backgroundColor + 'cc' },
//         ]}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//             Loading...
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default AICoursesScreen;

// /* ---------------------------------------------------------------------------
//    Styles
//    --------------------------------------------------------------------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   // Add a new container for the entire header
//   headerContainer: {
//     height: HEADER_HEIGHT,
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginHorizontal: -10,
//     position: 'relative',
//     // Optional shadow/elevation if you like
//     // elevation: 8,
//     // shadowColor: '#000',
//     // shadowOpacity: 0.3,
//     // shadowRadius: 10,
//     // shadowOffset: { width: 0, height: 5 },
//   },
//   lottieContainer1: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     zIndex: 1,
//   },
//   waveLottie1: {
//     width: '120%',  // experiment with sizing to fill wide screens
//     height: '120%',
//     // zIndex: 1,
//     alignItems: 'flex-end',
//     // If you want the wave to be anchored differently, adjust 
//     // or transform the wave
//   },
//   lottieContainer2: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-start',
//   },
//   waveLottie2: {
//     width: '70%',  // experiment with sizing to fill wide screens
//     height: '70%',
//     // If you want the wave to be anchored differently, adjust 
//     // or transform the wave
//   },
//   heroContent: {
//     flex: 1,
//     zIndex: 2, // ensure this is above the Lottie background
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingHorizontal: 25,
//   },
//   headerTitle: {
//     fontSize: 36,
//     fontWeight: '800',
//     marginBottom: 6,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     marginBottom: 12,
//     opacity: 0.9,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     elevation: 4,
//     width: '100%',
//     paddingHorizontal: 10,
//     marginTop: 15,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 10,
//   },
//   // // Hero Header
//   // headerArea: {
//   //   height: HEADER_HEIGHT,
//   //   overflow: 'hidden',
//   //   borderBottomLeftRadius: 40,
//   //   borderBottomRightRadius: 40,
//   //   borderTopLeftRadius: 40,
//   //   borderTopRightRadius: 40,
//   //   elevation: 8,
//   //   shadowColor: '#000',
//   //   shadowOpacity: 0.3,
//   //   shadowRadius: 10,
//   //   shadowOffset: { width: 0, height: 5 },
//   //   marginHorizontal: -10,
//   // },
//   // headerGradient: {
//   //   flex: 1,
//   //   paddingHorizontal: 25,
//   //   justifyContent: 'center',
//   //   alignItems: 'center',
//   // },
//   // headerTitle: {
//   //   fontSize: 36,
//   //   fontWeight: '800',
//   //   marginBottom: 6,
//   //   textShadowColor: 'rgba(0, 0, 0, 0.3)',
//   //   textShadowOffset: { width: 0, height: 2 },
//   //   textShadowRadius: 4,
//   // },
//   // headerSubtitle: {
//   //   fontSize: 18,
//   //   marginBottom: 12,
//   //   opacity: 0.9,
//   //   textShadowColor: 'rgba(0, 0, 0, 0.3)',
//   //   textShadowOffset: { width: 0, height: 1 },
//   //   textShadowRadius: 2,
//   // },

//   // // Search Bar
//   // searchRow: {
//   //   flexDirection: 'row',
//   //   alignItems: 'center',
//   //   backgroundColor: '#fff',
//   //   borderRadius: 25,
//   //   elevation: 4,
//   //   shadowColor: '#000',
//   //   shadowOffset: { width: 0, height: 2 },
//   //   shadowOpacity: 0.2,
//   //   shadowRadius: 3,
//   //   width: '100%',
//   //   paddingHorizontal: 10,
//   // },
//   // searchInput: {
//   //   flex: 1,
//   //   fontSize: 16,
//   //   paddingVertical: 10,
//   // },
//   searchButton: {
//     backgroundColor: '#999',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginLeft: 8,
//   },

//   // Suggestions
//   suggestionsContainer: {
//     marginHorizontal: 10,
//     marginTop: -40,
//     borderRadius: 12,
//     elevation: 6,
//     padding: 10,
//     zIndex: 1,
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     borderBottomColor: '#ddd',
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 4,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },

//   // Main content
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingBottom: 40,
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },

//   // Empty list
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },

//   // Loading
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },

//   // Footer loading
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });









// // src/screens/AICoursesScreen.js

// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useRef,
//   useMemo,
//   memo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   TextInput,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// // Services
// import {
//   fetchCourses,
//   searchCoursesAPI,
// } from '../services/api';

// // Pagination limit for courses
// const PAGE_LIMIT = 10;
// const HEADER_HEIGHT = 220;

// /* ---------------------------------------------------------------------------
//    1) AICoursesHeader - separate, memoized component
//    --------------------------------------------------------------------------- */
// const AICoursesHeader = memo(function AICoursesHeader({
//   currentTheme,
//   adsRefresh,
//   courses,
//   onAdPress,
//   onSearchResults, // callback to pass final search suggestions up
// }) {
//   const navigation = useNavigation();

//   // Local search states, so typing doesn't re-render the entire screen
//   const [localSearchTerm, setLocalSearchTerm] = useState('');
//   const [localSuggestions, setLocalSuggestions] = useState([]);
//   const [showLocalSuggestions, setShowLocalSuggestions] = useState(false);

//   // Handle pressing on a suggestion
//   const handleSuggestionPress = useCallback(
//     (course) => {
//       // Fill the input with that course title, hide suggestions
//       setLocalSearchTerm(course.title);
//       setShowLocalSuggestions(false);
//       // Navigate to course detail
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // Render each suggestion item
//   const renderSuggestionItem = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={styles.suggestionItem}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View style={styles.featuredBadge}>
//               <Text style={styles.featuredText}>Featured</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text style={[styles.suggestionTitle, { color: currentTheme.textColor }]}>
//             {item.title}
//           </Text>
//           <Text
//             style={[styles.suggestionDescription, { color: currentTheme.textColor }]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text style={[styles.suggestionRating, { color: currentTheme.textColor }]}>
//               {item.rating}⭐
//             </Text>
//             <Text style={[styles.suggestionReviews, { color: currentTheme.textColor }]}>
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // Actual search function invoked when user taps the search button
//   const handleSearch = useCallback(async () => {
//     try {
//       const term = localSearchTerm.trim();
//       if (!term) {
//         setLocalSuggestions([]);
//         setShowLocalSuggestions(false);
//         return;
//       }
//       const result = await searchCoursesAPI(term);
//       if (result.success && result.data) {
//         const mapped = result.data.map((c) => ({ ...c, id: c._id }));
//         setLocalSuggestions(mapped);
//         setShowLocalSuggestions(true);
//         // Let parent know about it (optional)
//         onSearchResults && onSearchResults(mapped);
//       } else {
//         setLocalSuggestions([]);
//         setShowLocalSuggestions(false);
//         onSearchResults && onSearchResults([]);
//       }
//     } catch (err) {
//       console.log('search error', err);
//       setLocalSuggestions([]);
//       setShowLocalSuggestions(false);
//       onSearchResults && onSearchResults([]);
//     }
//   }, [localSearchTerm, onSearchResults]);

//   return (
//     <View>
//       {/* Hero / Gradient Header */}
//       <View style={styles.headerArea}>
//         <LinearGradient
//           colors={currentTheme.headerBackground || ['#667EEA', '#64B6FF']}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         >
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             AI Courses
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Elevate your skills with modern AI education
//           </Text>

//           {/* Search bar + button */}
//           <View style={styles.searchRow}>
//             <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor="#999"
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={localSearchTerm}
//               onChangeText={setLocalSearchTerm}
//               autoCapitalize="none"
//               returnKeyType="search"
//             />

//             <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
//               <Ionicons name="arrow-forward-circle-sharp" size={24} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </LinearGradient>
//       </View>

//       {/* Suggestions list */}
//       {showLocalSuggestions && localSuggestions.length > 0 && (
//         <View style={[styles.suggestionsContainer, { backgroundColor: currentTheme.backgroundColor }]}>
//           <FlatList
//             data={localSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestionItem}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={5}
//             maxToRenderPerBatch={8}
//             windowSize={11}
//           />
//         </View>
//       )}

//       {/* Ads Section */}
//       <AdsSection
//         currentTheme={currentTheme}
//         onAdPress={onAdPress}
//         refreshSignal={adsRefresh}
//         templateFilter="promo"
//       />

//       {/* Featured Courses */}
//       <FeaturedReel currentTheme={currentTheme} />

//       {/* Another Ads Section */}
//       <View style={{ marginTop: 25, marginBottom: 25 }}>
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={onAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="newCourse"
//         />
//       </View>

//       {/* All Courses Title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             All Courses
//           </Text>
//           <View style={styles.sectionDivider} />
//         </View>
//       )}
//     </View>
//   );
// });



// /* ---------------------------------------------------------------------------
//    2) Main Screen
//    --------------------------------------------------------------------------- */
// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // ----------------------- Course State -----------------------
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   // Loading states
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // ----------------------- Ads Refresh Signal -----------------------
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // Animation
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Layout calculations
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   // ---------------------------------------------------------------------------
//   // fetchData
//   // ---------------------------------------------------------------------------
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           // Trigger ads refresh
//           setAdsRefresh((prev) => prev + 1);
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const coursesResponse = await fetchCourses(currentPage, PAGE_LIMIT);

//         if (coursesResponse.success) {
//           const newCourses = coursesResponse.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));

//           if (isRefresh) {
//             setCourses(newCourses);
//             setPage(2);
//           } else {
//             // Only add non-duplicate courses
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter((item) => !existingIds.has(item.id));
//               return [...prev, ...filtered];
//             });
//             setPage(currentPage + 1);
//           }

//           if (newCourses.length < PAGE_LIMIT) {
//             setHasMore(false);
//           }
//         }

//         // Simple fade-in
//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, fadeAnim]
//   );

//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   useEffect(() => {
//     refreshAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // Handle Ad Press
//   // ---------------------------------------------------------------------------
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

//   // ---------------------------------------------------------------------------
//   // Renders
//   // ---------------------------------------------------------------------------
//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   const getItemLayout = useCallback((_, index) => {
//     const CARD_HEIGHT = 300;
//     const row = Math.floor(index / numColumns);
//     return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//   }, [numColumns]);

//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   // If no data at all (initial load)
//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.loadingScreen, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   const renderEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//         No courses available.
//       </Text>
//     </View>
//   );

//   const renderFooter = () => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={
//           currentTheme.headerBackground
//             ? currentTheme.headerBackground[0]
//             : currentTheme.primaryColor
//         }
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />

//       {/* Custom Header (pinned at top) */}
//       <CustomHeader />

//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           // Instead of using a function, we pass a stable component:
//           ListHeaderComponent={(
//             <AICoursesHeader
//               currentTheme={currentTheme}
//               adsRefresh={adsRefresh}
//               courses={courses}
//               onAdPress={handleAdPress}
//               // Optional: If you want to track search suggestions in parent:
//               onSearchResults={(suggestions) => {
//                 // For example, if you want to do something with them.
//                 // Not strictly required. Just left here for reference.
//               }}
//             />
//           )}
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>

//       {/* Overlay loader if new data is loading but some courses already exist */}
//       {loading && courses.length > 0 && (
//         <View style={[
//           styles.loadingOverlay,
//           { backgroundColor: currentTheme.backgroundColor + 'cc' },
//         ]}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//             Loading...
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default AICoursesScreen;

// /* ---------------------------------------------------------------------------
//    Styles
//    --------------------------------------------------------------------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   // Hero Header
//   headerArea: {
//     height: HEADER_HEIGHT,
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//     marginHorizontal: -10,
//   },
//   headerGradient: {
//     flex: 1,
//     paddingHorizontal: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 36,
//     fontWeight: '800',
//     marginBottom: 6,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     marginBottom: 12,
//     opacity: 0.9,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },

//   // Search Bar
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//     width: '100%',
//     paddingHorizontal: 10,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 0,
//   },
//   searchButton: {
//     backgroundColor: '#999',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginLeft: 8,
//   },

//   // Suggestions
//   suggestionsContainer: {
//     marginHorizontal: 10,
//     marginTop: 10,
//     borderRadius: 12,
//     elevation: 6,
//     padding: 10,
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     borderBottomColor: '#ddd',
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 4,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },

//   // Main content
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingBottom: 40,
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },

//   // Empty list
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },

//   // Loading
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },

//   // Footer loading
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });









// // src/screens/AICoursesScreen.js

// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useRef,
//   useMemo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   TextInput,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// import {
//   fetchCourses,
//   searchCoursesAPI,
// } from '../services/api';

// // Pagination limit for courses
// const PAGE_LIMIT = 10;

// // We’ll still use this to size our hero header, if desired:
// const HEADER_HEIGHT = 220;

// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // ----------------------- Course State -----------------------
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   // Loading states
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // ----------------------- Ads Refresh Signal -----------------------
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // ----------------------- Search State -----------------------
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const searchTimeout = useRef(null);

//   // Animation & Layout
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   // ---------------------------------------------------------------------------
//   // fetch courses
//   // ---------------------------------------------------------------------------
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           // Also trigger ads refresh
//           setAdsRefresh((prev) => prev + 1);
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const coursesResponse = await fetchCourses(currentPage, PAGE_LIMIT);

//         if (coursesResponse.success) {
//           const newCourses = coursesResponse.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));

//           if (isRefresh) {
//             setCourses(newCourses);
//             setPage(2);
//           } else {
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter(
//                 (item) => !existingIds.has(item.id)
//               );
//               return [...prev, ...filtered];
//             });
//             setPage(currentPage + 1);
//           }

//           if (newCourses.length < PAGE_LIMIT) {
//             setHasMore(false);
//           }
//         }

//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, fadeAnim]
//   );

//   // Refresh all
//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   // on mount
//   useEffect(() => {
//     refreshAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // search (debounced 200ms)
//   // ---------------------------------------------------------------------------
//   const handleSearchChange = useCallback((text) => {
//     setSearchTerm(text.trim());
//     if (searchTimeout.current) {
//       clearTimeout(searchTimeout.current);
//     }

//     if (!text.trim()) {
//       setSearchSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     searchTimeout.current = setTimeout(async () => {
//       try {
//         const result = await searchCoursesAPI(text.trim());
//         if (result.success && result.data) {
//           const mapped = result.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));
//           setSearchSuggestions(mapped);
//           setShowSuggestions(true);
//         } else {
//           setSearchSuggestions([]);
//           setShowSuggestions(false);
//         }
//       } catch (err) {
//         console.log('search error', err);
//         setSearchSuggestions([]);
//         setShowSuggestions(false);
//       }
//     }, 200);
//   }, []);

//   const handleSuggestionPress = useCallback(
//     (course) => {
//       setSearchTerm(course.title);
//       setShowSuggestions(false);
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // ---------------------------------------------------------------------------
//   // Render suggestion (rich card view)
//   // ---------------------------------------------------------------------------
//   const renderSuggestion = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={styles.suggestionItem}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View style={styles.featuredBadge}>
//               <Text style={styles.featuredText}>Featured</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text
//             style={[
//               styles.suggestionTitle,
//               { color: currentTheme.textColor },
//             ]}
//           >
//             {item.title}
//           </Text>
//           <Text
//             style={[
//               styles.suggestionDescription,
//               { color: currentTheme.textColor },
//             ]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text
//               style={[styles.suggestionRating, { color: currentTheme.textColor }]}
//             >
//               {item.rating}⭐
//             </Text>
//             <Text
//               style={[styles.suggestionReviews, { color: currentTheme.textColor }]}
//             >
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // ---------------------------------------------------------------------------
//   // Load more courses
//   // ---------------------------------------------------------------------------
//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   // ---------------------------------------------------------------------------
//   // Handle ad press
//   // ---------------------------------------------------------------------------
//   const handleAdPress = useCallback((ad) => {
//     if (ad.adProdtype === 'Course') {
//       navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//     } else {
//       navigation.navigate('ProductPage', { productId: ad.adProdId });
//     }
//   }, [navigation]);

//   // ---------------------------------------------------------------------------
//   // Rendering courses
//   // ---------------------------------------------------------------------------
//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   const getItemLayout = useCallback(
//     (_, index) => {
//       const CARD_HEIGHT = 300;
//       const row = Math.floor(index / numColumns);
//       return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//     },
//     [numColumns]
//   );

//   // ---------------------------------------------------------------------------
//   // List Header
//   // ---------------------------------------------------------------------------
//   const renderHeader = useCallback(() => (
//     <View>
//       {/* Hero / Gradient Header */}
//       <View style={styles.headerArea}>
//         <LinearGradient
//           colors={currentTheme.headerBackground || ['#667EEA', '#64B6FF']}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         >
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             AI Courses
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Elevate your skills with modern AI education
//           </Text>
//           <View style={styles.searchBarContainer}>
//             <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor="#999"
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={searchTerm}
//               onChangeText={handleSearchChange}
//             />
//           </View>
//         </LinearGradient>
//       </View>

//       {/* Search Suggestions (scrolls away with content) */}
//       {showSuggestions && searchSuggestions.length > 0 && (
//         <View style={[styles.suggestionsContainer, { backgroundColor: currentTheme.backgroundColor }]}>
//           <FlatList
//             data={searchSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestion}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={5}
//             maxToRenderPerBatch={8}
//             windowSize={11}
//           />
//         </View>
//       )}

//       {/* Ads Section */}
//       <AdsSection
//         currentTheme={currentTheme}
//         onAdPress={handleAdPress}
//         refreshSignal={adsRefresh}
//         templateFilter="promo"
//       />

//       {/* Featured Courses */}
//       <FeaturedReel currentTheme={currentTheme} />

//       {/* Another Ads Section */}
//       <View style={{ marginTop: 25, marginBottom: 25 }}>
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={handleAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="newCourse"
//         />
//       </View>

//       {/* All Courses Title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             All Courses
//           </Text>
//           <View style={styles.sectionDivider} />
//         </View>
//       )}
//     </View>
//   ), [
//     currentTheme,
//     handleAdPress,
//     courses.length,
//     adsRefresh,
//     showSuggestions,
//     searchSuggestions,
//     searchTerm,
//     handleSearchChange,
//     renderSuggestion,
//   ]);

//   // ---------------------------------------------------------------------------
//   // Empty component
//   // ---------------------------------------------------------------------------
//   const renderEmptyComponent = useCallback(() => (
//     <View style={styles.emptyContainer}>
//       <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//         No courses available.
//       </Text>
//     </View>
//   ), [currentTheme]);

//   // ---------------------------------------------------------------------------
//   // Footer
//   // ---------------------------------------------------------------------------
//   const renderFooter = useCallback(() => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }, [loadingMore, currentTheme]);

//   // If no data at all (initial load)
//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.loadingScreen, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={
//           currentTheme.headerBackground
//             ? currentTheme.headerBackground[0]
//             : currentTheme.primaryColor
//         }
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />

//       {/* Custom Header (pinned at top) */}
//       <CustomHeader />

//       {/* Main Content (FlatList + Animated fade-in) */}
//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           ListHeaderComponent={renderHeader}
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>

//       {/* Overlay loader if loading in background (but we already have data) */}
//       {loading && courses.length > 0 && (
//         <View style={[
//           styles.loadingOverlay,
//           { backgroundColor: currentTheme.backgroundColor + 'cc' },
//         ]}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>Loading...</Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default AICoursesScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   // Hero Header
//   headerArea: {
//     height: HEADER_HEIGHT,
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//     marginHorizontal: -10,
//   },
//   headerGradient: {
//     flex: 1,
//     paddingHorizontal: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 36,
//     fontWeight: '800',
//     marginBottom: 6,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     marginBottom: 12,
//     opacity: 0.9,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   searchBarContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     height: 50,
//     width: '100%',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 0,
//   },

//   // Suggestions
//   suggestionsContainer: {
//     marginHorizontal: 10,
//     marginTop: 10,
//     borderRadius: 12,
//     elevation: 6,
//     padding: 10,
//     // no absolute positioning – it will scroll naturally with content
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     borderBottomColor: '#ddd',
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 4,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },

//   // Loading
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },

//   // Main content
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingBottom: 40,
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },

//   // Empty list
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },

//   // Footer loading
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });











// // src/screens/AICoursesScreen.js
// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useRef,
//   useMemo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   TouchableOpacity,
//   Animated,
//   TextInput,
//   Image,
//   useWindowDimensions,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// import { fetchCourses, searchCoursesAPI } from '../services/api';

// const PAGE_LIMIT = 10;
// const HEADER_HEIGHT = 240;

// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // Course/Pagination
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   // Loading
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // Ads
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // Search
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const searchTimeout = useRef(null);

//   // Animation
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Layout
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   // Fetch courses
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           setAdsRefresh((prev) => prev + 1);
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const coursesResponse = await fetchCourses(currentPage, PAGE_LIMIT);

//         if (coursesResponse.success) {
//           const newCourses = coursesResponse.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));

//           if (isRefresh) {
//             setCourses(newCourses);
//             setPage(2);
//           } else {
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter(
//                 (item) => !existingIds.has(item.id)
//               );
//               return [...prev, ...filtered];
//             });
//             setPage(currentPage + 1);
//           }

//           if (newCourses.length < PAGE_LIMIT) setHasMore(false);
//         }

//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, fadeAnim]
//   );

//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   useEffect(() => {
//     refreshAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Search (debounced)
//   const handleSearchChange = useCallback((text) => {
//     setSearchTerm(text.trim());
//     if (searchTimeout.current) {
//       clearTimeout(searchTimeout.current);
//     }

//     if (!text.trim()) {
//       setSearchSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     searchTimeout.current = setTimeout(async () => {
//       try {
//         const result = await searchCoursesAPI(text.trim());
//         if (result.success && result.data) {
//           const mapped = result.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));
//           setSearchSuggestions(mapped);
//           setShowSuggestions(true);
//         } else {
//           setSearchSuggestions([]);
//           setShowSuggestions(false);
//         }
//       } catch (err) {
//         console.log('search error', err);
//         setSearchSuggestions([]);
//         setShowSuggestions(false);
//       }
//     }, 250);
//   }, []);

//   const handleSuggestionPress = useCallback(
//     (course) => {
//       setSearchTerm(course.title);
//       setShowSuggestions(false);
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // Render suggestion
//   const renderSuggestion = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={styles.suggestionItem}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View style={styles.featuredBadge}>
//               <Text style={styles.featuredText}>Featured</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text
//             style={[
//               styles.suggestionTitle,
//               { color: currentTheme.textColor },
//             ]}
//           >
//             {item.title}
//           </Text>
//           <Text
//             style={[
//               styles.suggestionDescription,
//               { color: currentTheme.textColor },
//             ]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text
//               style={[
//                 styles.suggestionRating,
//                 { color: currentTheme.textColor },
//               ]}
//             >
//               {item.rating}⭐
//             </Text>
//             <Text
//               style={[
//                 styles.suggestionReviews,
//                 { color: currentTheme.textColor },
//               ]}
//             >
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // Load more
//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   // Handle Ad Press
//   const handleAdPress = useCallback((ad) => {
//     if (ad.adProdtype === 'Course') {
//       navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//     } else {
//       navigation.navigate('ProductPage', { productId: ad.adProdId });
//     }
//   }, [navigation]);

//   // Render course card
//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   const getItemLayout = useCallback(
//     (_, index) => {
//       const CARD_HEIGHT = 300;
//       const row = Math.floor(index / numColumns);
//       return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//     },
//     [numColumns]
//   );

//   const renderHeader = useCallback(() => (
//     <View>
//       {/* Ads, Featured, Additional Ads... */}
//       <AdsSection
//         currentTheme={currentTheme}
//         onAdPress={handleAdPress}
//         refreshSignal={adsRefresh}
//         templateFilter="promo"
//       />
//       <FeaturedReel currentTheme={currentTheme} />
//       <View style={{ marginTop: 25, marginBottom: 25 }}>
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={handleAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="newCourse"
//         />
//       </View>
//       {/* All Courses Title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text
//             style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}
//           >
//             All Courses
//           </Text>
//           <View style={styles.sectionDivider} />
//         </View>
//       )}
//     </View>
//   ), [currentTheme, handleAdPress, courses.length, adsRefresh]);

//   const renderEmptyComponent = useCallback(
//     () => (
//       <View style={styles.emptyContainer}>
//         <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//           No courses available.
//         </Text>
//       </View>
//     ),
//     [currentTheme]
//   );

//   const renderFooter = useCallback(() => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }, [loadingMore, currentTheme]);

//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView
//         style={[
//           styles.loadingScreen,
//           { backgroundColor: currentTheme.backgroundColor },
//         ]}
//       >
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
//     >
//       <StatusBar
//         backgroundColor={
//           currentTheme.headerBackground
//             ? currentTheme.headerBackground[0]
//             : currentTheme.primaryColor
//         }
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <CustomHeader />

//       {/* Hero Header */}
//       <View style={styles.headerArea}>
//         <LinearGradient
//           colors={currentTheme.headerBackground || ['#667EEA', '#64B6FF']}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         >
//           <Text
//             style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}
//           >
//             AI Courses
//           </Text>
//           <Text
//             style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}
//           >
//             Elevate your skills with modern AI education
//           </Text>
//           <View style={styles.searchBarContainer}>
//             <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor="#999"
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={searchTerm}
//               onChangeText={handleSearchChange}
//             />
//           </View>
//         </LinearGradient>
//       </View>

//       {showSuggestions && searchSuggestions.length > 0 && (
//         <View style={styles.suggestionsContainer}>
//           <FlatList
//             data={searchSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestion}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={5}
//             maxToRenderPerBatch={8}
//             windowSize={11}
//           />
//         </View>
//       )}

//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           ListHeaderComponent={renderHeader}
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>

//       {loading && courses.length > 0 && (
//         <View
//           style={[
//             styles.loadingOverlay,
//             { backgroundColor: currentTheme.backgroundColor + 'cc' },
//           ]}
//         >
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//             Loading...
//           </Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default AICoursesScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerArea: {
//     height: HEADER_HEIGHT,
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     marginHorizontal: -10,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//     zIndex: 1,
//   },
//   headerGradient: {
//     flex: 1,
//     paddingHorizontal: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//   },
//   headerTitle: {
//     fontSize: 38,
//     fontWeight: '900',
//     marginBottom: 6,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     fontSize: 16,
//     marginBottom: 15,
//     fontWeight: '600',
//     opacity: 0.9,
//     textShadowColor: 'rgba(0, 0, 0, 0.2)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   searchBarContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     height: 50,
//     width: '100%',
//     elevation: 4,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 0,
//   },
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },
//   suggestionsContainer: {
//     position: 'absolute',
//     top: HEADER_HEIGHT - 38,
//     left: 30,
//     right: 30,
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     elevation: 8,
//     padding: 10,
//     zIndex: 999,
//     maxHeight: 300,
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     borderBottomColor: '#ddd',
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 4,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingBottom: 40,
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//   },
//   sectionDivider: {
//     height: 2,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });







// // src/screens/AICoursesScreen.js
// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useRef,
//   useMemo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   TextInput,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// import {
//   fetchCourses,
//   searchCoursesAPI,
// } from '../services/api';

// // Pagination limit for courses
// const PAGE_LIMIT = 10;
// const HEADER_HEIGHT = 220;

// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // ----------------------- Course State -----------------------
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   // Loading states
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // ----------------------- Ads Refresh Signal -----------------------
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // ----------------------- Search State -----------------------
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const searchTimeout = useRef(null);

//   // Animations & Layout
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   // ---------------------------------------------------------------------------
//   // fetch courses only (ads now handled in AdsSection)
//   // ---------------------------------------------------------------------------
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           // Also trigger ads refresh
//           setAdsRefresh(prev => prev + 1);
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const coursesResponse = await fetchCourses(currentPage, PAGE_LIMIT);
//         // console.log('fetchCourses response', coursesResponse.data);
        
//         if (coursesResponse.success) {
//           const newCourses = coursesResponse.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));

//           if (isRefresh) {
//             setCourses(newCourses);
//             setPage(2);
//           } else {
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter(
//                 (item) => !existingIds.has(item.id)
//               );
//               return [...prev, ...filtered];
//             });
//             setPage(currentPage + 1);
//           }

//           if (newCourses.length < PAGE_LIMIT) {
//             setHasMore(false);
//           }
//         }

//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, fadeAnim]
//   );

//   // Refresh all
//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   // on mount
//   useEffect(() => {
//     refreshAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // search (debounced 200ms)
//   // ---------------------------------------------------------------------------
//   const handleSearchChange = useCallback((text) => {
//     setSearchTerm(text.trim());
//     if (searchTimeout.current) {
//       clearTimeout(searchTimeout.current);
//     }

//     if (!text.trim()) {
//       setSearchSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     searchTimeout.current = setTimeout(async () => {
//       try {
//         const result = await searchCoursesAPI(text.trim());
//         if (result.success && result.data) {
//           const mapped = result.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));
//           setSearchSuggestions(mapped);
//           setShowSuggestions(true);
//         } else {
//           setSearchSuggestions([]);
//           setShowSuggestions(false);
//         }
//       } catch (err) {
//         console.log('search error', err);
//         setSearchSuggestions([]);
//         setShowSuggestions(false);
//       }
//     }, 200);
//   }, []);

//   const handleSuggestionPress = useCallback(
//     (course) => {
//       setSearchTerm(course.title);
//       setShowSuggestions(false);
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // ---------------------------------------------------------------------------
//   // Render suggestion (rich card view)
//   // ---------------------------------------------------------------------------
//   const renderSuggestion = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={styles.suggestionItem}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View style={styles.featuredBadge}>
//               <Text style={styles.featuredText}>Featured</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text style={[styles.suggestionTitle, { color: currentTheme.textColor }]}>
//             {item.title}
//           </Text>
//           <Text
//             style={[styles.suggestionDescription, { color: currentTheme.textColor }]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text style={[styles.suggestionRating, { color: currentTheme.textColor }]}>
//               {item.rating}⭐
//             </Text>
//             <Text style={[styles.suggestionReviews, { color: currentTheme.textColor }]}>
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // ---------------------------------------------------------------------------
//   // Load more courses
//   // ---------------------------------------------------------------------------
//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   // UI Handler for ads
//   const handleAdPress = useCallback((ad) => {
//     // console.log('handleAdPress', ad.adProdtype);  
    
//     if (ad.adProdtype === 'Course') {
//       navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//     } else {
//       navigation.navigate('ProductPage', { productId: ad.adProdId });
//     }
    
//   }, []);

//   // Render items
//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   const getItemLayout = useCallback(
//     (_, index) => {
//       const CARD_HEIGHT = 300;
//       const row = Math.floor(index / numColumns);
//       return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//     },
//     [numColumns]
//   );

//   // ---------------------------------------------------------------------------
//   // Conditional Sections in Header
//   // ---------------------------------------------------------------------------
//   const renderHeader = useCallback(() => (
//     <View>
//       {/* <View style={styles.headerArea}>
//         <LinearGradient
//           colors={currentTheme.headerBackground || ['#667EEA', '#64B6FF']}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         >
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             AI Courses
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Elevate your skills with modern AI education
//           </Text>
//           <View style={styles.searchBarContainer}>
//             <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor="#999"
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={searchTerm}
//               onChangeText={handleSearchChange}
//             />
//           </View>
//         </LinearGradient>
//       </View>
//       {showSuggestions && searchSuggestions.length > 0 && (
//         <View style={styles.suggestionsContainer}>
//           <FlatList
//             data={searchSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestion}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={5}
//             maxToRenderPerBatch={8}
//             windowSize={11}
//           />
//         </View>
//       )} */}
//       <AdsSection
//         currentTheme={currentTheme}
//         onAdPress={handleAdPress}
//         refreshSignal={adsRefresh}
//         // categoryFilter= 'Technology'
//         templateFilter="promo"
//       />
//       {/* Featured Courses */}
//       <FeaturedReel currentTheme={currentTheme} />
//       {/* Ads Section now fully separated */}
//       <View style={{marginTop: 25, marginBottom: 25}}>
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={handleAdPress}
//           refreshSignal={adsRefresh}
//           // categoryFilter= 'Technology'
//           templateFilter="newCourse"
//         />
//       </View>

//       {/* All Courses title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             All Courses
//           </Text>
//           <View style={styles.sectionDivider} />
//         </View>
//       )}
//     </View>
//   ), [currentTheme, handleAdPress, courses.length, adsRefresh]);

//   const renderEmptyComponent = useCallback(
//     () => (
//       <View style={styles.emptyContainer}>
//         <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//           No courses available.
//         </Text>
//       </View>
//     ),
//     [currentTheme]
//   );

//   const renderFooter = useCallback(() => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }, [loadingMore, currentTheme]);

//   // If no data at all (initial load)
//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.loadingScreen, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={
//           currentTheme.headerBackground
//             ? currentTheme.headerBackground[0]
//             : currentTheme.primaryColor
//         }
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Custom Header */}
//       <CustomHeader />

//       {/* Hero/Gradient Header */}
//       <View style={styles.headerArea}>
//         <LinearGradient
//           colors={currentTheme.headerBackground || ['#667EEA', '#64B6FF']}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         >
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             AI Courses
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Elevate your skills with modern AI education
//           </Text>
//           <View style={styles.searchBarContainer}>
//             <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor="#999"
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={searchTerm}
//               onChangeText={handleSearchChange}
//             />
//           </View>
//         </LinearGradient>
//       </View>

//       {/* Suggestion dropdown */}
//       {showSuggestions && searchSuggestions.length > 0 && (
//         <View style={styles.suggestionsContainer}>
//           <FlatList
//             data={searchSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestion}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={5}
//             maxToRenderPerBatch={8}
//             windowSize={11}
//           />
//         </View>
//       )}

//       {/* Content */}
//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           ListHeaderComponent={renderHeader}
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>

//       {/* Overlay loader if loading in background */}
//       {loading && courses.length > 0 && (
//         <View style={[styles.loadingOverlay, { backgroundColor: currentTheme.backgroundColor + 'cc' }]}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>Loading...</Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default AICoursesScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerArea: {
//     height: HEADER_HEIGHT,
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     // marginTop: -8,
//     // width: '100%',
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//     zIndex: 1,
//     marginHorizontal: -10,
//   },
//   headerGradient: {
//     flex: 1,
//     paddingHorizontal: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 36,
//     fontWeight: '800',
//     marginBottom: 6,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     marginBottom: 12,
//     opacity: 0.9,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   searchBarContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     height: 50,
//     width: '100%',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 0,
//   },
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },
//   suggestionsContainer: {
//     position: 'absolute',
//     top: HEADER_HEIGHT - 38,
//     left: 30,
//     right: 30,
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     elevation: 6,
//     padding: 10,
//     zIndex: 999,
//     maxHeight: 300,
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     borderBottomColor: '#ddd',
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 4,
//     // paddingVertical: 2,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingBottom: 40,
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     // marginTop: 15,
//   },
//   sectionDivider: {
//     height: 2,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });











// // src/screens/AICoursesScreen.js
// import React, {
//   useState,
//   useEffect,
//   useContext,
//   useCallback,
//   useRef,
//   useMemo,
// } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   StatusBar,
//   ActivityIndicator,
//   RefreshControl,
//   Alert,
//   TouchableOpacity,
//   useWindowDimensions,
//   Animated,
//   TextInput,
//   Image,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// // Child Components
// import CustomHeader from '../components/CustomHeader';
// import CourseCard from '../components/CourseCard';
// import FeaturedReel from '../components/FeaturedReel';
// import AdsSection from '../components/AdsSection';

// import {
//   fetchCourses,
//   searchCoursesAPI,
// } from '../services/api';

// // Pagination limit for courses
// const PAGE_LIMIT = 10;
// const HEADER_HEIGHT = 220;

// const AICoursesScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const navigation = useNavigation();
//   const { width } = useWindowDimensions();

//   // ----------------------- Course State -----------------------
//   const [courses, setCourses] = useState([]);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(true);

//   // Loading states
//   const [loading, setLoading] = useState(false);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

//   // ----------------------- Ads Refresh Signal -----------------------
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // ----------------------- Search State -----------------------
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchSuggestions, setSearchSuggestions] = useState([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const searchTimeout = useRef(null);

//   // Animations & Layout
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const numColumns = useMemo(() => (width < 600 ? 1 : 2), [width]);
//   const cardWidth = useMemo(() => {
//     const totalMargin = 20 * (numColumns + 1);
//     return (width - totalMargin) / numColumns;
//   }, [width, numColumns]);

//   // ---------------------------------------------------------------------------
//   // fetch courses only (ads now handled in AdsSection)
//   // ---------------------------------------------------------------------------
//   const fetchData = useCallback(
//     async (isRefresh = false) => {
//       try {
//         if (isRefresh) {
//           setRefreshing(true);
//           setPage(1);
//           setHasMore(true);
//           // Also trigger ads refresh
//           setAdsRefresh(prev => prev + 1);
//         } else if (page === 1) {
//           setLoading(true);
//         } else {
//           setLoadingMore(true);
//         }

//         const currentPage = isRefresh ? 1 : page;
//         const coursesResponse = await fetchCourses(currentPage, PAGE_LIMIT);
//         // console.log('fetchCourses response', coursesResponse.data);
        
//         if (coursesResponse.success) {
//           const newCourses = coursesResponse.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));

//           if (isRefresh) {
//             setCourses(newCourses);
//             setPage(2);
//           } else {
//             setCourses((prev) => {
//               const existingIds = new Set(prev.map((item) => item.id));
//               const filtered = newCourses.filter(
//                 (item) => !existingIds.has(item.id)
//               );
//               return [...prev, ...filtered];
//             });
//             setPage(currentPage + 1);
//           }

//           if (newCourses.length < PAGE_LIMIT) {
//             setHasMore(false);
//           }
//         }

//         Animated.timing(fadeAnim, {
//           toValue: 1,
//           duration: 300,
//           useNativeDriver: true,
//         }).start();
//       } catch (err) {
//         console.log('fetchData error', err);
//       } finally {
//         setRefreshing(false);
//         setLoading(false);
//         setLoadingMore(false);
//       }
//     },
//     [page, fadeAnim]
//   );

//   // Refresh all
//   const refreshAll = useCallback(() => {
//     setHasMore(true);
//     fetchData(true);
//   }, [fetchData]);

//   // on mount
//   useEffect(() => {
//     refreshAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // ---------------------------------------------------------------------------
//   // search (debounced 200ms)
//   // ---------------------------------------------------------------------------
//   const handleSearchChange = useCallback((text) => {
//     setSearchTerm(text.trim());
//     if (searchTimeout.current) {
//       clearTimeout(searchTimeout.current);
//     }

//     if (!text.trim()) {
//       setSearchSuggestions([]);
//       setShowSuggestions(false);
//       return;
//     }

//     searchTimeout.current = setTimeout(async () => {
//       try {
//         const result = await searchCoursesAPI(text.trim());
//         if (result.success && result.data) {
//           const mapped = result.data.map((c) => ({
//             ...c,
//             id: c._id,
//           }));
//           setSearchSuggestions(mapped);
//           setShowSuggestions(true);
//         } else {
//           setSearchSuggestions([]);
//           setShowSuggestions(false);
//         }
//       } catch (err) {
//         console.log('search error', err);
//         setSearchSuggestions([]);
//         setShowSuggestions(false);
//       }
//     }, 200);
//   }, []);

//   const handleSuggestionPress = useCallback(
//     (course) => {
//       setSearchTerm(course.title);
//       setShowSuggestions(false);
//       navigation.navigate('CourseDetailScreen', { courseId: course.id });
//     },
//     [navigation]
//   );

//   // ---------------------------------------------------------------------------
//   // Render suggestion (rich card view)
//   // ---------------------------------------------------------------------------
//   const renderSuggestion = useCallback(
//     ({ item }) => (
//       <TouchableOpacity
//         style={styles.suggestionItem}
//         onPress={() => handleSuggestionPress(item)}
//       >
//         <View style={styles.suggestionImageContainer}>
//           {item.image ? (
//             <Image source={{ uri: item.image }} style={styles.suggestionImage} />
//           ) : (
//             <Ionicons name="book-outline" size={32} color="#555" />
//           )}
//           {item.isFeatured && (
//             <View style={styles.featuredBadge}>
//               <Text style={styles.featuredText}>Featured</Text>
//             </View>
//           )}
//         </View>
//         <View style={styles.suggestionContent}>
//           <Text style={[styles.suggestionTitle, { color: currentTheme.textColor }]}>
//             {item.title}
//           </Text>
//           <Text
//             style={[styles.suggestionDescription, { color: currentTheme.textColor }]}
//             numberOfLines={2}
//           >
//             {item.description}
//           </Text>
//           <View style={styles.suggestionStats}>
//             <Text style={[styles.suggestionRating, { color: currentTheme.textColor }]}>
//               {item.rating}⭐
//             </Text>
//             <Text style={[styles.suggestionReviews, { color: currentTheme.textColor }]}>
//               {item.reviews} reviews
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     ),
//     [currentTheme, handleSuggestionPress]
//   );

//   // ---------------------------------------------------------------------------
//   // Load more courses
//   // ---------------------------------------------------------------------------
//   const handleLoadMoreCourses = useCallback(() => {
//     if (!loadingMore && hasMore) {
//       fetchData();
//     }
//   }, [loadingMore, hasMore, fetchData]);

//   // UI Handler for ads
//   const handleAdPress = useCallback((ad) => {
//     Alert.alert('Ad Pressed', ad.title);
//   }, []);

//   // Render items
//   const renderCourse = useCallback(
//     ({ item }) => (
//       <CourseCard course={item} cardWidth={cardWidth} currentTheme={currentTheme} />
//     ),
//     [cardWidth, currentTheme]
//   );

//   const getItemLayout = useCallback(
//     (_, index) => {
//       const CARD_HEIGHT = 300;
//       const row = Math.floor(index / numColumns);
//       return { length: CARD_HEIGHT, offset: row * CARD_HEIGHT, index };
//     },
//     [numColumns]
//   );

//   // ---------------------------------------------------------------------------
//   // Conditional Sections in Header
//   // ---------------------------------------------------------------------------
//   const renderHeader = useCallback(() => (
//     <View>
//       <AdsSection
//         currentTheme={currentTheme}
//         onAdPress={handleAdPress}
//         refreshSignal={adsRefresh}
//         // categoryFilter= 'Technology'
//         templateFilter="promo"
//       />
//       {/* Featured Courses */}
//       <FeaturedReel currentTheme={currentTheme} />
//       {/* Ads Section now fully separated */}
//       <View style={{marginTop: 25, marginBottom: 25}}>
//         <AdsSection
//           currentTheme={currentTheme}
//           onAdPress={handleAdPress}
//           refreshSignal={adsRefresh}
//           // categoryFilter= 'Technology'
//           templateFilter="newCourse"
//         />
//       </View>

//       {/* All Courses title */}
//       {courses.length > 0 && (
//         <View style={styles.sectionWrapper}>
//           <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//             All Courses
//           </Text>
//           <View style={styles.sectionDivider} />
//         </View>
//       )}
//     </View>
//   ), [currentTheme, handleAdPress, courses.length, adsRefresh]);

//   const renderEmptyComponent = useCallback(
//     () => (
//       <View style={styles.emptyContainer}>
//         <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//           No courses available.
//         </Text>
//       </View>
//     ),
//     [currentTheme]
//   );

//   const renderFooter = useCallback(() => {
//     if (!loadingMore) return null;
//     return (
//       <View style={styles.footer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }, [loadingMore, currentTheme]);

//   // If no data at all (initial load)
//   if (loading && courses.length === 0 && !refreshing) {
//     return (
//       <SafeAreaView style={[styles.loadingScreen, { backgroundColor: currentTheme.backgroundColor }]}>
//         <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>
//           Loading courses...
//         </Text>
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={
//           currentTheme.headerBackground
//             ? currentTheme.headerBackground[0]
//             : currentTheme.primaryColor
//         }
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Custom Header */}
//       <CustomHeader />

//       {/* Hero/Gradient Header */}
//       <View style={styles.headerArea}>
//         <LinearGradient
//           colors={currentTheme.headerBackground || ['#667EEA', '#64B6FF']}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         >
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             AI Courses
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Elevate your skills with modern AI education
//           </Text>
//           {/* Enhanced Search Bar */}
//           <View style={styles.searchBarContainer}>
//             <Ionicons name="search" size={20} color="#999" style={{ marginHorizontal: 8 }} />
//             <TextInput
//               placeholder="Search courses..."
//               placeholderTextColor="#999"
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               value={searchTerm}
//               onChangeText={handleSearchChange}
//             />
//           </View>
//         </LinearGradient>
//       </View>

//       {/* Suggestion dropdown */}
//       {showSuggestions && searchSuggestions.length > 0 && (
//         <View style={styles.suggestionsContainer}>
//           <FlatList
//             data={searchSuggestions}
//             keyExtractor={(item) => item.id}
//             renderItem={renderSuggestion}
//             keyboardShouldPersistTaps="handled"
//             initialNumToRender={5}
//             maxToRenderPerBatch={8}
//             windowSize={11}
//           />
//         </View>
//       )}

//       {/* Content */}
//       <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
//         <FlatList
//           data={courses}
//           keyExtractor={(item) => item.id}
//           renderItem={renderCourse}
//           numColumns={numColumns}
//           ListHeaderComponent={renderHeader}
//           ListEmptyComponent={renderEmptyComponent}
//           ListFooterComponent={renderFooter}
//           contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//           showsVerticalScrollIndicator={false}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={refreshAll}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//           onEndReached={handleLoadMoreCourses}
//           onEndReachedThreshold={0.5}
//           removeClippedSubviews
//           initialNumToRender={6}
//           windowSize={5}
//           maxToRenderPerBatch={10}
//           updateCellsBatchingPeriod={50}
//           getItemLayout={getItemLayout}
//         />
//       </Animated.View>

//       {/* Overlay loader if loading in background */}
//       {loading && courses.length > 0 && (
//         <View style={[styles.loadingOverlay, { backgroundColor: currentTheme.backgroundColor + 'cc' }]}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//           <Text style={{ color: currentTheme.textColor, marginTop: 10 }}>Loading...</Text>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// export default AICoursesScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   headerArea: {
//     height: HEADER_HEIGHT,
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginTop: -8,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//   },
//   headerGradient: {
//     flex: 1,
//     paddingHorizontal: 25,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 36,
//     fontWeight: '800',
//     marginBottom: 6,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   headerSubtitle: {
//     fontSize: 18,
//     marginBottom: 12,
//     opacity: 0.9,
//     textShadowColor: 'rgba(0, 0, 0, 0.3)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 2,
//   },
//   searchBarContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     paddingHorizontal: 15,
//     height: 50,
//     width: '100%',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3,
//   },
//   searchInput: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 0,
//   },
//   loadingScreen: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 99,
//   },
//   suggestionsContainer: {
//     position: 'absolute',
//     top: HEADER_HEIGHT + 40,
//     left: 30,
//     right: 30,
//     backgroundColor: '#fff',
//     borderRadius: 25,
//     elevation: 6,
//     padding: 10,
//     zIndex: 999,
//     maxHeight: 300,
//   },
//   suggestionItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     borderBottomWidth: 0.6,
//     borderBottomColor: '#ddd',
//   },
//   suggestionImageContainer: {
//     position: 'relative',
//     marginRight: 12,
//   },
//   suggestionImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//   },
//   featuredBadge: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     backgroundColor: '#FFD700',
//     paddingHorizontal: 4,
//     // paddingVertical: 2,
//     borderRadius: 10,
//   },
//   featuredText: {
//     fontSize: 10,
//     fontWeight: '600',
//     color: '#fff',
//   },
//   suggestionContent: {
//     flex: 1,
//   },
//   suggestionTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//   },
//   suggestionDescription: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   suggestionStats: {
//     flexDirection: 'row',
//     marginTop: 4,
//   },
//   suggestionRating: {
//     fontSize: 12,
//     marginRight: 10,
//   },
//   suggestionReviews: {
//     fontSize: 12,
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   listContent: {
//     paddingBottom: 40,
//     paddingHorizontal: 10,
//   },
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//   },
//   sectionTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     // marginTop: 15,
//   },
//   sectionDivider: {
//     height: 2,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     marginVertical: 8,
//     borderRadius: 2,
//   },
//   emptyContainer: {
//     flex: 1,
//     marginTop: 50,
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//   },
//   footer: {
//     paddingVertical: 20,
//     alignItems: 'center',
//   },
// });


