// src/screens/MarketPage.js

import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import { Portal } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

// Contexts / Themes
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { CartContext } from '../contexts/CartContext';
import { FavouritesContext } from '../contexts/FavouritesContext';

// Components
import CustomHeader from '../components/CustomHeader';
import CustomAlert from '../components/CustomAlert';
import AdsSection from '../components/AdsSection';

// Lottie assets
import computer from '../../assets/Animation - 1740678222898.json';
import bulb from '../../assets/Animation - 1740679157646.json';
import reader from '../../assets/marketreader.json';

// 1) Redux imports
import { useDispatch } from 'react-redux';
import { fetchAllProducts } from '../store/slices/productSlice';

/* Custom hook to debounce a value */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const MarketPage = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const { addToCart } = useContext(CartContext);
  const { favouriteItems, addToFavourites, removeFromFavourites } = useContext(FavouritesContext);

  // Redux dispatcher
  const dispatch = useDispatch();

  // State
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Default');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Custom Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Ads refresh
  const [adsRefresh, setAdsRefresh] = useState(0);

  // Window size
  const { width, height } = useWindowDimensions();

  // Similar approach to LoginScreen: define a base width, scaleFactor, and scale function
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  /* --------------------------------------------------------------------------
   * FETCH PRODUCTS (using Redux thunk)
   * ------------------------------------------------------------------------*/
  const fetchAllProductsLocal = useCallback(
    async (isRefreshing = false) => {
      try {
        if (isRefreshing) {
          setRefreshing(true);
          // Force AdsSection to refresh
          setAdsRefresh((prev) => prev + 1);
        } else {
          setLoading(true);
        }

        // 2) Dispatch our Redux thunk instead of fetchProducts() from services
        const result = await dispatch(fetchAllProducts()).unwrap();

        if (isRefreshing) setRefreshing(false);
        else setLoading(false);

        // `result` is the payload we returned in the slice
        if (result.success && result.data?.data) {
          setProducts(result.data.data);
          setError(null);
        } else {
          throw new Error(result.message || 'Failed to fetch products.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setLoading(false);
        setRefreshing(false);
        setError(err.message);

        setAlertTitle('Error');
        setAlertMessage(err.message || 'Failed to fetch products.');
        setAlertIcon('alert-circle');
        setAlertButtons([
          {
            text: 'Retry',
            onPress: () => {
              setAlertVisible(false);
              fetchAllProductsLocal(isRefreshing);
            },
          },
        ]);
        setAlertVisible(true);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    // On mount, fetch products
    fetchAllProductsLocal();
  }, [fetchAllProductsLocal]);

  /* --------------------------------------------------------------------------
   * SORTING
   * ------------------------------------------------------------------------*/
  const sortData = useCallback((dataToSort, option) => {
    let sortedData = [...dataToSort];
    if (option === 'Name (A-Z)') {
      sortedData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (option === 'Name (Z-A)') {
      sortedData.sort((a, b) => b.name.localeCompare(a.name));
    } else if (option === 'Price (Low to High)') {
      sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (option === 'Price (High to Low)') {
      sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    return sortedData;
  }, []);

  const handleSortOption = useCallback((option) => {
    setSortOption(option);
    setSortModalVisible(false);
  }, []);

  /* --------------------------------------------------------------------------
   * SEARCH (Debounce & Filter)
   * ------------------------------------------------------------------------*/
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredData = useMemo(() => {
    let data = products;
    if (debouncedSearchQuery) {
      data = products.filter((item) => {
        const itemData = `${item.subjectName} ${item.subjectCode} ${item.name}`.toUpperCase();
        return itemData.includes(debouncedSearchQuery.toUpperCase());
      });
    }
    return sortData(data, sortOption);
  }, [products, debouncedSearchQuery, sortOption, sortData]);

  const handleSearch = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  /* --------------------------------------------------------------------------
   * LAYOUT CALCULATIONS
   * ------------------------------------------------------------------------*/
  // Decide how many columns to show
  const numColumns = useMemo(() => {
    if (width <= 375) return 1;
    if (width <= 800) return 2;
    if (width <= 1200) return 3;
    return 4;
  }, [width]);

  // Card width is computed from # of columns
  const cardWidth = useMemo(() => {
    // Each column has a 20px margin on left/right
    const totalMargin = 20 * (numColumns + 1);
    const availableWidth = width - totalMargin;
    return availableWidth / numColumns;
  }, [width, numColumns]);

  /* --------------------------------------------------------------------------
   * CART & FAVORITES
   * ------------------------------------------------------------------------*/
  const handleAddToCart = useCallback(
    (item) => {
      const added = addToCart(item);
      if (added) {
        setAlertTitle('Success');
        setAlertMessage(`${item.name} has been added to your cart.`);
        setAlertIcon('cart');
      } else {
        setAlertTitle('Info');
        setAlertMessage(`${item.name} is already in your cart.`);
        setAlertIcon('information-circle');
      }
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    },
    [addToCart]
  );

  const handleToggleFavorite = useCallback(
    (item) => {
      const isFavourite = favouriteItems.some((fav) => fav._id === item._id);
      if (isFavourite) {
        removeFromFavourites(item._id);
        setAlertTitle('Removed');
        setAlertMessage(`${item.name} removed from Favourites.`);
        setAlertIcon('heart-dislike-outline');
      } else {
        addToFavourites(item);
        setAlertTitle('Added');
        setAlertMessage(`${item.name} added to Favourites.`);
        setAlertIcon('heart');
      }
      setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
      setAlertVisible(true);
    },
    [favouriteItems, addToFavourites, removeFromFavourites]
  );

  /* --------------------------------------------------------------------------
   * ADS
   * ------------------------------------------------------------------------*/
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

  // We can define a safe "headerWidth" if we want smaller margins on narrower devices
  const headerWidth = width < 480 ? width * 0.95 : width;

  /* --------------------------------------------------------------------------
   * STYLES (using scale factor)
   * ------------------------------------------------------------------------*/
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: currentTheme.backgroundColor,
        },
        // For the large hero area
        headerContainer: {
          position: 'relative',
          // We’ll scale this height
          height: scale(180),
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          borderBottomLeftRadius: scale(40),
          borderBottomRightRadius: scale(40),
          borderTopLeftRadius: scale(40),
          borderTopRightRadius: scale(40),
          marginBottom: scale(20),
          marginTop: scale(-8),
        },
        // Lottie containers
        lottieContainer1: {
          ...StyleSheet.absoluteFillObject,
          borderBottomLeftRadius: scale(40),
          borderBottomRightRadius: scale(40),
          alignItems: 'flex-start',
        },
        lottie1: {
          width: '160%',
          height: '90%',
        },
        lottieContainer2: {
          ...StyleSheet.absoluteFillObject,
          borderBottomLeftRadius: scale(40),
          borderBottomRightRadius: scale(40),
          alignItems: 'flex-end',
        },
        lottie2: {
          width: '160%',
          height: '120%',
        },
        lottieContainer3: {
          ...StyleSheet.absoluteFillObject,
          alignItems: 'center',
          top: scale(30),
          right: scale(30),
        },
        lottie3: {
          width: '100%',
          height: '100%',
        },
        heroContent: {
          alignItems: 'center',
          paddingHorizontal: scale(20),
        },
        title: {
          fontWeight: 'bold',
          textShadowOffset: { width: 0, height: scale(2) },
          textShadowRadius: scale(4),
        },
        subTitle: {
          marginTop: scale(8),
          textShadowOffset: { width: 0, height: scale(1) },
          textShadowRadius: scale(3),
        },

        // Search & Sort
        searchSortContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginHorizontal: scale(20),
          marginBottom: scale(10),
          marginTop: scale(-50),
        },
        searchContainer: {
          flexDirection: 'row',
          borderRadius: scale(30),
          paddingHorizontal: scale(15),
          alignItems: 'center',
          flex: 1,
          height: scale(50),
          elevation: 3,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: scale(3),
        },
        searchIcon: {
          marginRight: scale(8),
        },
        searchInput: {
          flex: 1,
          minWidth: 0,
          flexShrink: 1,
        },
        sortButton: {
          marginLeft: scale(10),
          padding: scale(14),
          borderRadius: scale(30),
          elevation: 3,
        },

        // Ads can be placed if you want a custom container around them
        adsContainer: {
          marginVertical: scale(-35),
          right: scale(10),
        },

        // List
        listContent: {
          paddingBottom: scale(20),
          paddingHorizontal: scale(10),
          paddingTop: scale(5),
        },
        singleColumnContent: {
          alignItems: 'center',
        },

        // Card
        card: {
          borderRadius: scale(10),
          marginBottom: scale(15),
          marginHorizontal: scale(10),
          elevation: 2,
          minHeight: scale(300),
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: scale(2),
        },
        cardTouchable: {
          flex: 1,
        },
        cardImage: {
          width: '100%',
          height: scale(140),
        },
        favoriteIcon: {
          position: 'absolute',
          top: scale(12),
          right: scale(12),
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: scale(20),
          padding: scale(5),
        },
        cardContent: {
          padding: scale(10),
        },
        cardTitle: {
          fontSize: scale(16),
          fontWeight: '600',
          marginBottom: scale(3),
        },
        cardSubtitle: {
          fontSize: scale(14),
          marginBottom: scale(5),
        },
        ratingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        reviewCount: {
          fontSize: scale(12),
          marginLeft: scale(5),
        },
        cardPrice: {
          fontSize: scale(16),
          fontWeight: 'bold',
          marginTop: scale(6),
        },
        cartIcon: {
          position: 'absolute',
          bottom: scale(20),
          right: scale(10),
          borderRadius: scale(20),
          padding: scale(8),
          elevation: 5,
          shadowColor: '#000',
          shadowOpacity: 0.15,
          shadowRadius: scale(2),
        },

        // Sort Modal
        modalBackground: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        modalOverlay: {
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.3)',
        },
        modalContent: {
          width: '80%',
          borderRadius: scale(15),
          padding: scale(20),
          elevation: scale(10),
          alignItems: 'center',
        },
        modalLabel: {
          fontSize: scale(20),
          fontWeight: '700',
          marginBottom: scale(15),
        },
        modalOption: {
          width: '100%',
          paddingVertical: scale(10),
        },
        modalOptionText: {
          fontSize: scale(16),
          textAlign: 'center',
        },

        // Loading, Error, Empty
        loadingOverlay: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
        },
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: scale(20),
        },
        errorText: {
          fontSize: scale(18),
          marginBottom: scale(20),
          textAlign: 'center',
        },
        retryButton: {
          paddingVertical: scale(10),
          paddingHorizontal: scale(20),
          borderRadius: scale(20),
        },
        retryButtonText: {
          fontSize: scale(16),
          fontWeight: '600',
        },
        emptyContainer: {
          alignItems: 'center',
        },
        emptyText: {
          fontSize: scale(18),
          marginTop: scale(15),
        },
      }),
    [scaleFactor, currentTheme, theme]
  );

  /* --------------------------------------------------------------------------
   * HEADER COMPONENT
   * ------------------------------------------------------------------------*/
  const headerComponent = useMemo(() => {
    return (
      <>
        {/* Hero Header with 3 Lottie animations */}
        <View style={[styles.headerContainer, { width: headerWidth }]}>
          <View style={styles.lottieContainer1}>
            <LottieView source={computer} autoPlay loop style={styles.lottie1} />
          </View>
          <View style={styles.lottieContainer2}>
            <LottieView source={bulb} autoPlay loop style={styles.lottie2} />
          </View>
          <View style={styles.lottieContainer3}>
            <LottieView source={reader} autoPlay loop style={styles.lottie3} />
          </View>

          {/* Overlay gradient for blending */}
          <LinearGradient
            colors={currentTheme.marketheader}
            style={[
              StyleSheet.absoluteFill,
              {
                borderBottomLeftRadius: scale(40),
                borderBottomRightRadius: scale(40),
              },
            ]}
          />

          {/* Title & Subtitle */}
          <View style={styles.heroContent}>
            <Text
              style={[
                styles.title,
                {
                  color: currentTheme.headerTextColor,
                  textShadowColor: currentTheme.textShadowColor,
                  fontSize: scale(32),
                },
              ]}
            >
              Marketplace
            </Text>
            <Text
              style={[
                styles.subTitle,
                {
                  color: currentTheme.headerTextColor,
                  textShadowColor: currentTheme.textShadowColor,
                  fontSize: scale(16),
                },
              ]}
            >
              Discover amazing exams & study materials
            </Text>
          </View>
        </View>

        {/* Search & Sort Row */}
        <View style={styles.searchSortContainer}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: currentTheme.cardBackground },
            ]}
          >
            <Ionicons
              name="search"
              size={scale(20)}
              color={currentTheme.placeholderTextColor}
              style={[
                styles.searchIcon,
                { color: currentTheme.searchIconColor },
              ]}
            />
            <TextInput
              style={[
                styles.searchInput,
                { color: currentTheme.textColor, fontSize: scale(14) },
              ]}
              placeholder="Subject, Code, or Exam Name"
              placeholderTextColor={currentTheme.placeholderTextColor}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sortButton,
              { backgroundColor: currentTheme.primaryColor },
            ]}
            onPress={() => setSortModalVisible(true)}
          >
            <MaterialIcons name="sort" size={scale(24)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Ads Section */}
        <AdsSection
          currentTheme={currentTheme}
          onAdPress={handleAdPress}
          refreshSignal={adsRefresh}
          templateFilter="sale"
          marginV={-25}
          headingShow={false}
        />
      </>
    );
  }, [
    currentTheme,
    searchQuery,
    adsRefresh,
    handleAdPress,
    handleSearch,
    styles,
    headerWidth,
    scale,
  ]);

  /* --------------------------------------------------------------------------
   * RENDER ITEM (FlatList)
   * ------------------------------------------------------------------------*/
  const renderItem = useCallback(
    ({ item }) => {
      const isFavorite = favouriteItems.some((favItem) => favItem._id === item._id);

      return (
        <View
          style={[
            styles.card,
            {
              backgroundColor: currentTheme.cardBackground,
              width: cardWidth,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('ProductPage', { productId: item._id })}
            activeOpacity={0.8}
            style={styles.cardTouchable}
          >
            <Image
              source={{ uri: item.image }}
              style={styles.cardImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.favoriteIcon}
              onPress={() => handleToggleFavorite(item)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={scale(24)}
                color={
                  isFavorite
                    ? '#E91E63'
                    : currentTheme.placeholderTextColor
                }
              />
            </TouchableOpacity>

            <View style={styles.cardContent}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: currentTheme.cardTextColor },
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={[
                  styles.cardSubtitle,
                  { color: currentTheme.textColor },
                ]}
                numberOfLines={1}
              >
                {item.subjectName} ({item.subjectCode})
              </Text>

              {/* Ratings */}
              <View style={styles.ratingContainer}>
                {Array.from({ length: 5 }, (_, idx) => (
                  <Ionicons
                    key={idx}
                    name={idx < Math.floor(item.ratings) ? 'star' : 'star-outline'}
                    size={scale(16)}
                    color="#FFD700"
                  />
                ))}
                <Text
                  style={[
                    styles.reviewCount,
                    { color: currentTheme.textColor },
                  ]}
                >
                  ({item.numberOfReviews})
                </Text>
              </View>

              <Text
                style={[
                  styles.cardPrice,
                  { color: currentTheme.priceColor },
                ]}
              >
                ${item.price}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Add to Cart Button */}
          <TouchableOpacity
            style={[
              styles.cartIcon,
              { backgroundColor: currentTheme.primaryColor },
            ]}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons name="cart-outline" size={scale(24)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      );
    },
    [
      favouriteItems,
      currentTheme,
      navigation,
      cardWidth,
      handleToggleFavorite,
      handleAddToCart,
      styles,
      scale,
    ]
  );

  /* --------------------------------------------------------------------------
   * MAIN RENDER
   * ------------------------------------------------------------------------*/
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />

      {/* Top Navigation Header */}
      <CustomHeader />

      {/* Sort Modal */}
      {sortModalVisible && (
        <Portal>
          <Modal
            visible={sortModalVisible}
            animationType="fade"
            transparent
            onRequestClose={() => setSortModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <TouchableWithoutFeedback
                onPress={() => setSortModalVisible(false)}
              >
                <View style={styles.modalOverlay} />
              </TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: currentTheme.cardBackground },
                ]}
              >
                <Text
                  style={[
                    styles.modalLabel,
                    { color: currentTheme.cardTextColor },
                  ]}
                >
                  Sort By
                </Text>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSortOption('Name (A-Z)')}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.textColor },
                    ]}
                  >
                    Name (A-Z)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSortOption('Name (Z-A)')}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.textColor },
                    ]}
                  >
                    Name (Z-A)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSortOption('Price (Low to High)')}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.textColor },
                    ]}
                  >
                    Price (Low to High)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSortOption('Price (High to Low)')}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.textColor },
                    ]}
                  >
                    Price (High to Low)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => handleSortOption('Default')}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: currentTheme.textColor },
                    ]}
                  >
                    Default
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </Portal>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={currentTheme.primaryColor} />
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text
            style={[styles.errorText, { color: currentTheme.errorTextColor }]}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchAllProductsLocal()}
            style={[
              styles.retryButton,
              { backgroundColor: currentTheme.primaryColor },
            ]}
          >
            <Text
              style={[
                styles.retryButtonText,
                { color: currentTheme.textColor },
              ]}
            >
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main List */}
      {!error && (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={headerComponent}
          contentContainerStyle={[
            styles.listContent,
            numColumns === 1 && styles.singleColumnContent,
          ]}
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search"
                  size={scale(80)}
                  color={currentTheme.placeholderTextColor}
                />
                <Text
                  style={[styles.emptyText, { color: currentTheme.textColor }]}
                >
                  No results found.
                </Text>
              </View>
            )
          }
          numColumns={numColumns}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          key={numColumns} // re-render if layout changes
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchAllProductsLocal(true)}
              tintColor={currentTheme.primaryColor}
            />
          }
        />
      )}

      {/* Custom Alert */}
      <Portal>
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          icon={alertIcon}
          onClose={() => setAlertVisible(false)}
          buttons={alertButtons}
        />
      </Portal>
    </View>
  );
};

export default MarketPage;












// // src/screens/MarketPage.js

// import React, {
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
//   useMemo,
// } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   Modal,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   useWindowDimensions,
//   RefreshControl,
// } from 'react-native';
// import { Portal } from 'react-native-paper';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import LottieView from 'lottie-react-native';

// // Contexts / Themes
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext';

// // Components
// import CustomHeader from '../components/CustomHeader';
// import CustomAlert from '../components/CustomAlert';
// import AdsSection from '../components/AdsSection';

// // Lottie assets
// import computer from '../../assets/Animation - 1740678222898.json';
// import bulb from '../../assets/Animation - 1740679157646.json';
// import reader from '../../assets/marketreader.json';

// // 1) Redux imports
// import { useDispatch } from 'react-redux';
// import { fetchAllProducts } from '../store/slices/productSlice';

// /* Custom hook to debounce a value */
// function useDebounce(value, delay) {
//   const [debouncedValue, setDebouncedValue] = useState(value);
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//   return debouncedValue;
// }

// const MarketPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const { addToCart } = useContext(CartContext);
//   const { favouriteItems, addToFavourites, removeFromFavourites } = useContext(FavouritesContext);

//   // Redux dispatcher
//   const dispatch = useDispatch();

//   // State
//   const [products, setProducts] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOption, setSortOption] = useState('Default');
//   const [sortModalVisible, setSortModalVisible] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Ads refresh
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // Window size
//   const { width, height } = useWindowDimensions();

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

//   const searchInputFontSize = useMemo(() => {
//     if (width < 360) return 8;
//     else if (width < 600) return 12;
//     else return 22;
//   }, [width]);

//   /* --------------------------------------------------------------------------
//    * FETCH PRODUCTS (using Redux thunk)
//    * ------------------------------------------------------------------------*/
//   const fetchAllProductsLocal = useCallback(
//     async (isRefreshing = false) => {
//       try {
//         if (isRefreshing) {
//           setRefreshing(true);
//           // Force AdsSection to refresh
//           setAdsRefresh((prev) => prev + 1);
//         } else {
//           setLoading(true);
//         }

//         // 2) Dispatch our Redux thunk instead of fetchProducts() from services
//         const result = await dispatch(fetchAllProducts()).unwrap();

//         if (isRefreshing) setRefreshing(false);
//         else setLoading(false);

//         // `result` is the payload we returned in the slice
//         if (result.success && result.data?.data) {
//           // user code expects: setProducts(response.data.data)
//           setProducts(result.data.data);
//           setError(null);
//         } else {
//           throw new Error(result.message || 'Failed to fetch products.');
//         }
//       } catch (err) {
//         console.error('Fetch error:', err);
//         setLoading(false);
//         setRefreshing(false);
//         setError(err.message);

//         setAlertTitle('Error');
//         setAlertMessage(err.message || 'Failed to fetch products.');
//         setAlertIcon('alert-circle');
//         setAlertButtons([
//           {
//             text: 'Retry',
//             onPress: () => {
//               setAlertVisible(false);
//               fetchAllProductsLocal(isRefreshing);
//             },
//           },
//         ]);
//         setAlertVisible(true);
//       }
//     },
//     [dispatch]
//   );

//   useEffect(() => {
//     // 3) On mount, fetch products
//     fetchAllProductsLocal();
//   }, [fetchAllProductsLocal]);

//   /* --------------------------------------------------------------------------
//    * SORTING
//    * ------------------------------------------------------------------------*/
//   const sortData = useCallback((dataToSort, option) => {
//     let sortedData = [...dataToSort];
//     if (option === 'Name (A-Z)') {
//       sortedData.sort((a, b) => a.name.localeCompare(b.name));
//     } else if (option === 'Name (Z-A)') {
//       sortedData.sort((a, b) => b.name.localeCompare(a.name));
//     } else if (option === 'Price (Low to High)') {
//       sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//     } else if (option === 'Price (High to Low)') {
//       sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//     }
//     return sortedData;
//   }, []);

//   const handleSortOption = useCallback((option) => {
//     setSortOption(option);
//     setSortModalVisible(false);
//   }, []);

//   /* --------------------------------------------------------------------------
//    * SEARCH (Debounce & Filter)
//    * ------------------------------------------------------------------------*/
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);

//   const filteredData = useMemo(() => {
//     let data = products;
//     if (debouncedSearchQuery) {
//       data = products.filter((item) => {
//         const itemData = `${item.subjectName} ${item.subjectCode} ${item.name}`.toUpperCase();
//         return itemData.includes(debouncedSearchQuery.toUpperCase());
//       });
//     }
//     return sortData(data, sortOption);
//   }, [products, debouncedSearchQuery, sortOption, sortData]);

//   const handleSearch = useCallback((text) => {
//     setSearchQuery(text);
//   }, []);

//   /* --------------------------------------------------------------------------
//    * LAYOUT CALCULATIONS
//    * ------------------------------------------------------------------------*/
//   const numColumns = useMemo(() => {
//     if (width <= 375) return 1;
//     if (width <= 800) return 2;
//     if (width <= 1200) return 3;
//     return 4;
//   }, [width]);

//   const cardWidth = useMemo(() => {
//     // Each column has a 20px margin on left/right
//     const totalMargin = 20 * (numColumns + 1);
//     const availableWidth = width - totalMargin;
//     return availableWidth / numColumns;
//   }, [width, numColumns]);

//   /* --------------------------------------------------------------------------
//    * CART & FAVORITES
//    * ------------------------------------------------------------------------*/
//   const handleAddToCart = useCallback(
//     (item) => {
//       const added = addToCart(item);
//       if (added) {
//         setAlertTitle('Success');
//         setAlertMessage(`${item.name} has been added to your cart.`);
//         setAlertIcon('cart');
//       } else {
//         setAlertTitle('Info');
//         setAlertMessage(`${item.name} is already in your cart.`);
//         setAlertIcon('information-circle');
//       }
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     },
//     [addToCart]
//   );

//   const handleToggleFavorite = useCallback(
//     (item) => {
//       const isFavourite = favouriteItems.some((fav) => fav._id === item._id);
//       if (isFavourite) {
//         removeFromFavourites(item._id);
//         setAlertTitle('Removed');
//         setAlertMessage(`${item.name} removed from Favourites.`);
//         setAlertIcon('heart-dislike-outline');
//       } else {
//         addToFavourites(item);
//         setAlertTitle('Added');
//         setAlertMessage(`${item.name} added to Favourites.`);
//         setAlertIcon('heart');
//       }
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     },
//     [favouriteItems, addToFavourites, removeFromFavourites]
//   );

//   /* --------------------------------------------------------------------------
//    * ADS
//    * ------------------------------------------------------------------------*/
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

//   const headerWidth = width < 480 ? width * 0.95 : width;

//   // We can memoize AdsSection, but leaving as is:
//   // const AdsSectionMemo = useMemo(() => React.memo(AdsSection), []);

//   /* --------------------------------------------------------------------------
//    * HEADER COMPONENT
//    * ------------------------------------------------------------------------*/
//   const headerComponent = useMemo(
//     () => (
//       <>
//         {/* Hero Header with 3 Lottie animations */}
//         <View style={[styles.headerContainer,{width: headerWidth, height:headerHeight}]}>
//           <View style={styles.lottieContainer1}>
//             <LottieView source={computer} autoPlay loop style={styles.lottie1} />
//           </View>
//           <View style={styles.lottieContainer2}>
//             <LottieView source={bulb} autoPlay loop style={styles.lottie2} />
//           </View>
//           <View style={styles.lottieContainer3}>
//             <LottieView source={reader} autoPlay loop style={styles.lottie3} />
//           </View>

//           {/* Overlay gradient for blending */}
//           <LinearGradient
//             colors={currentTheme.marketheader}
//             style={[
//               StyleSheet.absoluteFill,
//               { borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
//             ]}
//           />

//           {/* Title & Subtitle */}
//           <View style={styles.heroContent}>
//             <Text style={[styles.title, { color: currentTheme.headerTextColor, textShadowColor: currentTheme.textShadowColor,fontSize: headerFontSize, textAlign: 'center' }]}>
//               Marketplace
//             </Text>
//             <Text style={[styles.subTitle, { color: currentTheme.headerTextColor, textShadowColor: currentTheme.textShadowColor,fontSize: headerSubtitleFontSize , textAlign: 'center' }]}>
//               Discover amazing exams & study materials
//             </Text>
//           </View>
//         </View>

//         {/* Search & Sort Row */}
//         <View style={styles.searchSortContainer}>
//           <View
//             style={[
//               styles.searchContainer,
//               { backgroundColor: currentTheme.cardBackground },
//             ]}
//           >
//             <Ionicons
//               name="search"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={[styles.searchIcon, { color: currentTheme.searchIconColor }]}
//             />
//             <TextInput
//               style={[styles.searchInput, { color: currentTheme.textColor, fontSize: searchInputFontSize }]}
//               placeholder="Subject, Code, or Exam Name"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               value={searchQuery}
//               onChangeText={handleSearch}
//               returnKeyType="search"
//             />
//           </View>
//           <TouchableOpacity
//             style={[styles.sortButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => setSortModalVisible(true)}
//           >
//             <MaterialIcons name="sort" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         {/* Ads Section */}
//         {/* <View style={styles.adsContainer}> */}
//           <AdsSection
//             currentTheme={currentTheme}
//             onAdPress={handleAdPress}
//             refreshSignal={adsRefresh}
//             templateFilter="sale"
//             marginV={-25}
//           />
//         {/* </View> */}
//       </>
//     ),
//     [currentTheme, searchQuery, adsRefresh, handleAdPress, handleSearch]
//   );

//   /* --------------------------------------------------------------------------
//    * RENDER ITEM (FlatList)
//    * ------------------------------------------------------------------------*/
//   const renderItem = useCallback(
//     ({ item }) => {
//       const isFavorite = favouriteItems.some((favItem) => favItem._id === item._id);

//       return (
//         <View
//           style={[
//             styles.card,
//             {
//               backgroundColor: currentTheme.cardBackground,
//               width: cardWidth,
//             },
//           ]}
//         >
//           <TouchableOpacity
//             onPress={() => navigation.navigate('ProductPage', { productId: item._id })}
//             activeOpacity={0.8}
//             style={styles.cardTouchable}
//           >
//             <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
//             <TouchableOpacity style={styles.favoriteIcon} onPress={() => handleToggleFavorite(item)}>
//               <Ionicons
//                 name={isFavorite ? 'heart' : 'heart-outline'}
//                 size={24}
//                 color={isFavorite ? '#E91E63' : currentTheme.placeholderTextColor}
//               />
//             </TouchableOpacity>

//             <View style={styles.cardContent}>
//               <Text
//                 style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}
//                 numberOfLines={1}
//               >
//                 {item.name}
//               </Text>
//               <Text
//                 style={[styles.cardSubtitle, { color: currentTheme.textColor }]}
//                 numberOfLines={1}
//               >
//                 {item.subjectName} ({item.subjectCode})
//               </Text>

//               {/* Ratings */}
//               <View style={styles.ratingContainer}>
//                 {Array.from({ length: 5 }, (_, idx) => (
//                   <Ionicons
//                     key={idx}
//                     name={idx < Math.floor(item.ratings) ? 'star' : 'star-outline'}
//                     size={16}
//                     color="#FFD700"
//                   />
//                 ))}
//                 <Text style={[styles.reviewCount, { color: currentTheme.textColor }]}>
//                   ({item.numberOfReviews})
//                 </Text>
//               </View>

//               <Text style={[styles.cardPrice, { color: currentTheme.priceColor }]}>
//                 ${item.price}
//               </Text>
//             </View>
//           </TouchableOpacity>

//           {/* Add to Cart Button */}
//           <TouchableOpacity
//             style={[styles.cartIcon, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => handleAddToCart(item)}
//           >
//             <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       );
//     },
//     [
//       favouriteItems,
//       currentTheme,
//       navigation,
//       cardWidth,
//       handleToggleFavorite,
//       handleAddToCart,
//     ]
//   );

//   /* --------------------------------------------------------------------------
//    * MAIN RENDER
//    * ------------------------------------------------------------------------*/
//   return (
//     <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />

//       {/* Top Navigation Header */}
//       <CustomHeader />

//       {/* Sort Modal */}
//       {sortModalVisible && (
//       <Portal>
//         <Modal
//           visible={sortModalVisible}
//           animationType="fade"
//           transparent
//           onRequestClose={() => setSortModalVisible(false)}
//         >
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
//               <View style={styles.modalOverlay} />
//             </TouchableWithoutFeedback>
//             <View
//               style={[
//                 styles.modalContent,
//                 { backgroundColor: currentTheme.cardBackground },
//               ]}
//             >
//               <Text style={[styles.modalLabel, { color: currentTheme.cardTextColor }]}>
//                 Sort By
//               </Text>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (A-Z)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Name (A-Z)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (Z-A)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Name (Z-A)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (Low to High)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (Low to High)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (High to Low)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (High to Low)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Default')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Default
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       </Portal>  
//       )}

//       {/* Loading Overlay */}
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         </View>
//       )}

//       {/* Error State */}
//       {error && !loading && (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>{error}</Text>
//           <TouchableOpacity
//             onPress={() => fetchAllProductsLocal()}
//             style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
//           >
//             <Text style={[styles.retryButtonText, { color: currentTheme.textColor }]}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Main List */}
//       {!error && (
//         <FlatList
//           data={filteredData}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           ListHeaderComponent={headerComponent}
//           contentContainerStyle={[
//             styles.listContent,
//             numColumns === 1 && styles.singleColumnContent,
//             { paddingBottom: 100 },
//           ]}
//           ListEmptyComponent={
//             !loading && (
//               <View style={styles.emptyContainer}>
//                 <Ionicons name="search" size={80} color={currentTheme.placeholderTextColor} />
//                 <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                   No results found.
//                 </Text>
//               </View>
//             )
//           }
//           numColumns={numColumns}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           key={numColumns} // re-render if layout changes
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => fetchAllProductsLocal(true)}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//         />
//       )}

//       {/* Custom Alert */}

//       <Portal>
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//       </Portal>
//     </View>
//   );
// };

// export default MarketPage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   adsContainer: {
//     marginVertical: -35,
//     right: 10,
//   },
//   /* ----------------
//    * HEADER (Hero)
//    * ---------------*/
//   headerContainer: {
//     position: 'relative',
//     // height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginBottom: 20,
//     marginTop: -8,
//   },
//   lottieContainer1: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-start',
//   },
//   lottie1: {
//     width: '160%',
//     height: '90%',
//   },
//   lottieContainer2: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-end',
//   },
//   lottie2: {
//     width: '160%',
//     height: '120%',
//   },
//   lottieContainer3: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: 'center',
//     top: 30,
//     right: 30,
//   },
//   lottie3: {
//     width: '100%',
//     height: '100%',
//   },
//   heroContent: {
//     // zIndex: 2,
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   title: {
//     // fontSize: 32,
//     fontWeight: 'bold',
//     // textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   subTitle: {
//     // fontSize: 16,
//     marginTop: 8,
//     // textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },

//   /* ----------------
//    * SEARCH & SORT
//    * ---------------*/
//   searchSortContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginBottom: 10,
//     marginTop: -50, // lifts above the next content
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//     flex: 1,
//     height: 50,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     minWidth: 0,
//     flexShrink: 1,
//     // fontSize: 14,
//   },
//   sortButton: {
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 30,
//     elevation: 3,
//   },

//   /* ----------------
//    * LIST & CARDS
//    * ---------------*/
//   listContent: {
//     paddingBottom: 20,
//     paddingHorizontal: 10,
//     paddingTop: 5,
//   },
//   singleColumnContent: {
//     alignItems: 'center',
//   },
//   card: {
//     borderRadius: 10,
//     marginBottom: 15,
//     marginHorizontal: 10,
//     elevation: 2,
//     minHeight: 300,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cardTouchable: {
//     flex: 1,
//   },
//   cardImage: {
//     width: '100%',
//     height: 140,
//   },
//   favoriteIcon: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   cardContent: {
//     padding: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 3,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   reviewCount: {
//     fontSize: 12,
//     marginLeft: 5,
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 6,
//   },
//   cartIcon: {
//     position: 'absolute',
//     bottom: 20,
//     right: 10,
//     borderRadius: 20,
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 2,
//   },

//   /* ----------------
//    * MODAL SORT
//    * ---------------*/
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   modalContent: {
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     alignItems: 'center',
//   },
//   modalLabel: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 15,
//   },
//   modalOption: {
//     width: '100%',
//     paddingVertical: 10,
//   },
//   modalOptionText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },

//   /* ----------------
//    * EMPTY, LOADING, ERROR
//    * ---------------*/
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   retryButtonText: {
//     // color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
// });











// // src/screens/MarketPage.js

// import React, {
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
//   useMemo,
// } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   Modal,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   useWindowDimensions,
//   RefreshControl,
// } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';
// import LottieView from 'lottie-react-native';

// // Contexts / Themes
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext';

// // Components
// import CustomHeader from '../components/CustomHeader';
// import CustomAlert from '../components/CustomAlert';
// import AdsSection from '../components/AdsSection';

// // Services / API
// import { fetchProducts } from '../services/api';

// // Lottie assets
// import computer from '../../assets/Animation - 1740678222898.json';
// import bulb from '../../assets/Animation - 1740679157646.json';
// import reader from '../../assets/marketreader.json';

// /* Custom hook to debounce a value */
// function useDebounce(value, delay) {
//   const [debouncedValue, setDebouncedValue] = useState(value);
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//   return debouncedValue;
// }

// const MarketPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const { addToCart } = useContext(CartContext);
//   const { favouriteItems, addToFavourites, removeFromFavourites } = useContext(FavouritesContext);

//   // State
//   const [products, setProducts] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOption, setSortOption] = useState('Default');
//   const [sortModalVisible, setSortModalVisible] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // Custom Alert states
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Ads refresh
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // Window size
//   const { width } = useWindowDimensions();

//   /* --------------------------------------------------------------------------
//    * FETCH PRODUCTS
//    * ------------------------------------------------------------------------*/
//   const fetchAllProducts = useCallback(async (isRefreshing = false) => {
//     try {
//       if (isRefreshing) {
//         setRefreshing(true);
//         // Force AdsSection to refresh
//         setAdsRefresh((prev) => prev + 1);
//       } else {
//         setLoading(true);
//       }

//       const response = await fetchProducts();
//       if (isRefreshing) setRefreshing(false);
//       else setLoading(false);

//       if (response.success) {
//         setProducts(response.data.data);
//         setError(null);
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err.message);
//       setLoading(false);
//       setRefreshing(false);

//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch products.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'Retry',
//           onPress: () => {
//             setAlertVisible(false);
//             fetchAllProducts(isRefreshing);
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAllProducts();
//   }, [fetchAllProducts]);

//   /* --------------------------------------------------------------------------
//    * SORTING
//    * ------------------------------------------------------------------------*/
//   const sortData = useCallback((dataToSort, option) => {
//     let sortedData = [...dataToSort];
//     if (option === 'Name (A-Z)') {
//       sortedData.sort((a, b) => a.name.localeCompare(b.name));
//     } else if (option === 'Name (Z-A)') {
//       sortedData.sort((a, b) => b.name.localeCompare(a.name));
//     } else if (option === 'Price (Low to High)') {
//       sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//     } else if (option === 'Price (High to Low)') {
//       sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//     }
//     return sortedData;
//   }, []);

//   const handleSortOption = useCallback((option) => {
//     setSortOption(option);
//     setSortModalVisible(false);
//   }, []);

//   /* --------------------------------------------------------------------------
//    * SEARCH (Debounce & Filter)
//    * ------------------------------------------------------------------------*/
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);

//   const filteredData = useMemo(() => {
//     let data = products;
//     if (debouncedSearchQuery) {
//       data = products.filter((item) => {
//         const itemData = `${item.subjectName} ${item.subjectCode} ${item.name}`.toUpperCase();
//         return itemData.includes(debouncedSearchQuery.toUpperCase());
//       });
//     }
//     return sortData(data, sortOption);
//   }, [products, debouncedSearchQuery, sortOption, sortData]);

//   const handleSearch = useCallback((text) => {
//     setSearchQuery(text);
//   }, []);

//   /* --------------------------------------------------------------------------
//    * LAYOUT CALCULATIONS
//    * ------------------------------------------------------------------------*/
//   const numColumns = useMemo(() => {
//     if (width <= 375) return 1;
//     if (width <= 800) return 2;
//     if (width <= 1200) return 3;
//     return 4;
//   }, [width]);

//   const cardWidth = useMemo(() => {
//     // Each column has a 20px margin on left/right
//     const totalMargin = 20 * (numColumns + 1);
//     const availableWidth = width - totalMargin;
//     return availableWidth / numColumns;
//   }, [width, numColumns]);

//   /* --------------------------------------------------------------------------
//    * CART & FAVORITES
//    * ------------------------------------------------------------------------*/
//   const handleAddToCart = useCallback(
//     (item) => {
//       const added = addToCart(item);
//       if (added) {
//         setAlertTitle('Success');
//         setAlertMessage(`${item.name} has been added to your cart.`);
//         setAlertIcon('cart');
//       } else {
//         setAlertTitle('Info');
//         setAlertMessage(`${item.name} is already in your cart.`);
//         setAlertIcon('information-circle');
//       }
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     },
//     [addToCart]
//   );

//   const handleToggleFavorite = useCallback(
//     (item) => {
//       const isFavourite = favouriteItems.some((fav) => fav._id === item._id);
//       if (isFavourite) {
//         removeFromFavourites(item._id);
//         setAlertTitle('Removed');
//         setAlertMessage(`${item.name} removed from Favourites.`);
//         setAlertIcon('heart-dislike-outline');
//       } else {
//         addToFavourites(item);
//         setAlertTitle('Added');
//         setAlertMessage(`${item.name} added to Favourites.`);
//         setAlertIcon('heart');
//       }
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     },
//     [favouriteItems, addToFavourites, removeFromFavourites]
//   );

//   /* --------------------------------------------------------------------------
//    * ADS
//    * ------------------------------------------------------------------------*/
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

//   const AdsSectionMemo = useMemo(() => React.memo(AdsSection), []);

//   /* --------------------------------------------------------------------------
//    * HEADER COMPONENT
//    * ------------------------------------------------------------------------*/
//   const headerComponent = useMemo(
//     () => (
//       <>
//         {/* Hero Header with 3 Lottie animations */}
//         <View style={styles.headerContainer}>
//           <View style={styles.lottieContainer1}>
//             <LottieView source={computer} autoPlay loop style={styles.lottie1} />
//           </View>
//           <View style={styles.lottieContainer2}>
//             <LottieView source={bulb} autoPlay loop style={styles.lottie2} />
//           </View>
//           <View style={styles.lottieContainer3}>
//             <LottieView source={reader} autoPlay loop style={styles.lottie3} />
//           </View>

//           {/* Overlay gradient for blending (Update your theme if needed) */}
//           <LinearGradient
//             colors={currentTheme.marketheader}
//             style={[StyleSheet.absoluteFill, {
//               borderBottomLeftRadius: 40,
//               borderBottomRightRadius: 40,
//             }]}
//           />

//           {/* Title & Subtitle */}
//           <View style={styles.heroContent}>
//             <Text style={[styles.title, { color: currentTheme.headerTextColor }]}>
//               Marketplace
//             </Text>
//             <Text style={[styles.subTitle, { color: currentTheme.headerTextColor }]}>
//               Discover amazing exams & study materials
//             </Text>
//           </View>
//         </View>

//         {/* Search & Sort Row */}
//         <View style={styles.searchSortContainer}>
//           <View
//             style={[
//               styles.searchContainer,
//               { backgroundColor: currentTheme.cardBackground },
//             ]}
//           >
//             <Ionicons
//               name="search"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.searchIcon}
//             />
//             <TextInput
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               placeholder="Subject, Code, or Exam Name"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               value={searchQuery}
//               onChangeText={handleSearch}
//               returnKeyType="search"
//             />
//           </View>
//           <TouchableOpacity
//             style={[styles.sortButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => setSortModalVisible(true)}
//           >
//             <MaterialIcons name="sort" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         {/* Ads Section */}
//         <View style={styles.adsContainer}>
//           <AdsSectionMemo
//             currentTheme={currentTheme}
//             onAdPress={handleAdPress}
//             refreshSignal={adsRefresh}
//             templateFilter="sale"
//           />
//         </View>
//       </>
//     ),
//     [currentTheme, searchQuery, adsRefresh, handleAdPress, handleSearch]
//   );

//   /* --------------------------------------------------------------------------
//    * RENDER ITEM (FlatList)
//    * ------------------------------------------------------------------------*/
//   const renderItem = useCallback(
//     ({ item }) => {
//       const isFavorite = favouriteItems.some((favItem) => favItem._id === item._id);

//       return (
//         <View
//           style={[
//             styles.card,
//             {
//               backgroundColor: currentTheme.cardBackground,
//               width: cardWidth,
//             },
//           ]}
//         >
//           <TouchableOpacity
//             onPress={() => navigation.navigate('ProductPage', { productId: item._id })}
//             activeOpacity={0.8}
//             style={styles.cardTouchable}
//           >
//             <Image
//               source={{ uri: item.image }}
//               style={styles.cardImage}
//               resizeMode="cover"
//             />
//             <TouchableOpacity
//               style={styles.favoriteIcon}
//               onPress={() => handleToggleFavorite(item)}
//             >
//               <Ionicons
//                 name={isFavorite ? 'heart' : 'heart-outline'}
//                 size={24}
//                 color={
//                   isFavorite ? '#E91E63' : currentTheme.placeholderTextColor
//                 }
//               />
//             </TouchableOpacity>

//             <View style={styles.cardContent}>
//               <Text
//                 style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}
//                 numberOfLines={1}
//               >
//                 {item.name}
//               </Text>
//               <Text
//                 style={[styles.cardSubtitle, { color: currentTheme.textColor }]}
//                 numberOfLines={1}
//               >
//                 {item.subjectName} ({item.subjectCode})
//               </Text>

//               {/* Ratings */}
//               <View style={styles.ratingContainer}>
//                 {Array.from({ length: 5 }, (_, idx) => (
//                   <Ionicons
//                     key={idx}
//                     name={idx < Math.floor(item.ratings) ? 'star' : 'star-outline'}
//                     size={16}
//                     color="#FFD700"
//                   />
//                 ))}
//                 <Text style={[styles.reviewCount, { color: currentTheme.textColor }]}>
//                   ({item.numberOfReviews})
//                 </Text>
//               </View>

//               <Text style={[styles.cardPrice, { color: currentTheme.cardTextColor }]}>
//                 ${item.price}
//               </Text>
//             </View>
//           </TouchableOpacity>

//           {/* Add to Cart Button */}
//           <TouchableOpacity
//             style={[styles.cartIcon, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => handleAddToCart(item)}
//           >
//             <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       );
//     },
//     [favouriteItems, currentTheme, navigation, cardWidth, handleToggleFavorite, handleAddToCart]
//   );

//   /* --------------------------------------------------------------------------
//    * MAIN RENDER
//    * ------------------------------------------------------------------------*/
//   return (
//     <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />

//       {/* Top Navigation Header */}
//       <CustomHeader />

//       {/* Sort Modal */}
//       {sortModalVisible && (
//         <Modal
//           visible={sortModalVisible}
//           animationType="fade"
//           transparent
//           onRequestClose={() => setSortModalVisible(false)}
//         >
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
//               <View style={styles.modalOverlay} />
//             </TouchableWithoutFeedback>
//             <View
//               style={[
//                 styles.modalContent,
//                 { backgroundColor: currentTheme.cardBackground },
//               ]}
//             >
//               <Text style={[styles.modalLabel, { color: currentTheme.cardTextColor }]}>
//                 Sort By
//               </Text>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Name (A-Z)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Name (A-Z)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Name (Z-A)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Name (Z-A)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (Low to High)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (Low to High)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (High to Low)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (High to Low)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Default')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Default
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Loading Overlay */}
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         </View>
//       )}

//       {/* Error State */}
//       {error && !loading && (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>
//             {error}
//           </Text>
//           <TouchableOpacity
//             onPress={() => fetchAllProducts()}
//             style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Main List */}
//       {!error && (
//         <FlatList
//           data={filteredData}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           ListHeaderComponent={headerComponent}
//           contentContainerStyle={[
//             styles.listContent,
//             numColumns === 1 && styles.singleColumnContent,
//             { paddingBottom: 100 },
//           ]}
//           ListEmptyComponent={
//             !loading && (
//               <View style={styles.emptyContainer}>
//                 <Ionicons
//                   name="search"
//                   size={80}
//                   color={currentTheme.placeholderTextColor}
//                 />
//                 <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                   No results found.
//                 </Text>
//               </View>
//             )
//           }
//           numColumns={numColumns}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           key={numColumns} // re-render if layout changes
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => fetchAllProducts(true)}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//         />
//       )}

//       {/* Custom Alert */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default MarketPage;

// /* --------------------------------------------------------------------------
//    STYLES
//    ------------------------------------------------------------------------*/
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   adsContainer: {
//     marginVertical: -35,
//     right: 10,
//   },
//   /* ----------------
//    * HEADER (Hero)
//    * ---------------*/
//   headerContainer: {
//     position: 'relative',
//     height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginBottom: 20,
//     marginTop: -8,
//   },
//   lottieContainer1: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-start',
//   },
//   lottie1: {
//     width: '160%',
//     height: '90%',
//     // bottom: 80,
//     // Adjust as needed
//   },
//   lottieContainer2: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'flex-end',
//   },
//   lottie2: {
//     width: '160%',
//     height: '120%',
//     // bottom: 80,
//     // Adjust as needed
//   },
//   lottieContainer3: {
//     ...StyleSheet.absoluteFillObject,
//     alignItems: 'center',
//     top: 30,
//     right: 30,
//     // justifyContent: 'center',
//   },
//   lottie3: {
//     width: '100%',
//     height: '100%',
//   },
//   heroContent: {
//     zIndex: 2,
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   subTitle: {
//     fontSize: 16,
//     marginTop: 8,
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },

//   /* ----------------
//    * SEARCH & SORT
//    * ---------------*/
//   searchSortContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginBottom: 10,
//     marginTop: -50, // lifts above the next content
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//     flex: 1,
//     height: 50,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     minWidth: 0,
//     flexShrink: 1,
//     fontSize: 14,
//   },
//   sortButton: {
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 30,
//     elevation: 3,
//   },

//   /* ----------------
//    * LIST & CARDS
//    * ---------------*/
//   listContent: {
//     paddingBottom: 20,
//     paddingHorizontal: 10,
//     paddingTop: 5,
//   },
//   singleColumnContent: {
//     alignItems: 'center',
//   },
//   card: {
//     borderRadius: 10,
//     marginBottom: 15,
//     marginHorizontal: 10,
//     elevation: 2,
//     minHeight: 300,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cardTouchable: {
//     flex: 1,
//   },
//   cardImage: {
//     width: '100%',
//     height: 140,
//   },
//   favoriteIcon: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   cardContent: {
//     padding: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 3,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   reviewCount: {
//     fontSize: 12,
//     marginLeft: 5,
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 6,
//   },
//   cartIcon: {
//     position: 'absolute',
//     bottom: 20,
//     right: 10,
//     borderRadius: 20,
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 2,
//   },

//   /* ----------------
//    * MODAL SORT
//    * ---------------*/
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   modalContent: {
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     alignItems: 'center',
//   },
//   modalLabel: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 15,
//   },
//   modalOption: {
//     width: '100%',
//     paddingVertical: 10,
//   },
//   modalOptionText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },

//   /* ----------------
//    * EMPTY, LOADING, ERROR
//    * ---------------*/
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
// });











// // src/screens/MarketPage.js

// import React, {
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
//   useMemo,
// } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   Modal,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   useWindowDimensions,
//   RefreshControl,
// } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomHeader from '../components/CustomHeader';
// import CustomAlert from '../components/CustomAlert';
// import AdsSection from '../components/AdsSection';

// import { fetchProducts } from '../services/api';

// import LottieView from 'lottie-react-native';
// import computer from '../../assets/Animation - 1740678222898.json'; 
// import bulb from '../../assets/Animation - 1740679157646.json';
// import reader from '../../assets/marketreader.json';

// /* Custom hook to debounce a value */
// function useDebounce(value, delay) {
//   const [debouncedValue, setDebouncedValue] = useState(value);
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedValue(value);
//     }, delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//   return debouncedValue;
// }

// const MarketPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const { addToCart } = useContext(CartContext);
//   const { favouriteItems, addToFavourites, removeFromFavourites } =
//     useContext(FavouritesContext);

//   const [products, setProducts] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOption, setSortOption] = useState('Default');
//   const [sortModalVisible, setSortModalVisible] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const [adsRefresh, setAdsRefresh] = useState(0);

//   const { width } = useWindowDimensions();

//   // --------------------------------------------------------------------
//   // API CALL: FETCH PRODUCTS
//   // --------------------------------------------------------------------
//   const fetchAllProducts = useCallback(async (isRefreshing = false) => {
//     try {
//       if (isRefreshing) {
//         setRefreshing(true);
//         // Force AdsSection to refresh
//         setAdsRefresh((prev) => prev + 1);
//       } else {
//         setLoading(true);
//       }
//       const response = await fetchProducts();
//       if (isRefreshing) setRefreshing(false);
//       else setLoading(false);

//       if (response.success) {
//         setProducts(response.data.data);
//         setError(null);
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err.message);
//       setLoading(false);
//       setRefreshing(false);

//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch products.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'Retry',
//           onPress: () => {
//             setAlertVisible(false);
//             fetchAllProducts(isRefreshing);
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   }, []);

//   useEffect(() => {
//     fetchAllProducts();
//   }, [fetchAllProducts]);

//   // --------------------------------------------------------------------
//   // SORTING FUNCTION
//   // --------------------------------------------------------------------
//   const sortData = useCallback((dataToSort, option) => {
//     let sortedData = [...dataToSort];
//     if (option === 'Name (A-Z)') {
//       sortedData.sort((a, b) => a.name.localeCompare(b.name));
//     } else if (option === 'Name (Z-A)') {
//       sortedData.sort((a, b) => b.name.localeCompare(a.name));
//     } else if (option === 'Price (Low to High)') {
//       sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//     } else if (option === 'Price (High to Low)') {
//       sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//     }
//     return sortedData;
//   }, []);

//   const handleSortOption = useCallback((option) => {
//     setSortOption(option);
//     setSortModalVisible(false);
//   }, []);

//   // --------------------------------------------------------------------
//   // SEARCH: Debounce the query & compute filtered data via memoization
//   // --------------------------------------------------------------------
//   const debouncedSearchQuery = useDebounce(searchQuery, 300);

//   const filteredData = useMemo(() => {
//     let data = products;
//     if (debouncedSearchQuery) {
//       data = products.filter((item) => {
//         const itemData = `${item.subjectName} ${item.subjectCode} ${item.name}`.toUpperCase();
//         return itemData.includes(debouncedSearchQuery.toUpperCase());
//       });
//     }
//     return sortData(data, sortOption);
//   }, [products, debouncedSearchQuery, sortOption, sortData]);

//   const handleSearch = useCallback((text) => {
//     setSearchQuery(text);
//   }, []);

//   // --------------------------------------------------------------------
//   // LAYOUT CALCULATIONS
//   // --------------------------------------------------------------------
//   const numColumns = useMemo(() => {
//     if (width <= 375) return 1;
//     if (width <= 800) return 2;
//     if (width <= 1200) return 3;
//     return 4;
//   }, [width]);

//   const cardWidth = useMemo(() => {
//     // Margins: 20 per column-gap (left-right)
//     const totalMargin = 20 * (numColumns + 1);
//     const availableWidth = width - totalMargin;
//     return availableWidth / numColumns;
//   }, [width, numColumns]);

//   // --------------------------------------------------------------------
//   // CART & FAVOURITES HANDLERS
//   // --------------------------------------------------------------------
//   const handleAddToCart = useCallback(
//     (item) => {
//       const added = addToCart(item);
//       if (added) {
//         setAlertTitle('Success');
//         setAlertMessage(`${item.name} has been added to your cart.`);
//         setAlertIcon('cart');
//       } else {
//         setAlertTitle('Info');
//         setAlertMessage(`${item.name} is already in your cart.`);
//         setAlertIcon('information-circle');
//       }
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     },
//     [addToCart]
//   );

//   const handleToggleFavorite = useCallback(
//     (item) => {
//       const isFavourite = favouriteItems.some((fav) => fav._id === item._id);
//       if (isFavourite) {
//         removeFromFavourites(item._id);
//         setAlertTitle('Removed');
//         setAlertMessage(`${item.name} removed from Favourites.`);
//         setAlertIcon('heart-dislike-outline');
//       } else {
//         addToFavourites(item);
//         setAlertTitle('Added');
//         setAlertMessage(`${item.name} added to Favourites.`);
//         setAlertIcon('heart');
//       }
//       setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//       setAlertVisible(true);
//     },
//     [favouriteItems, addToFavourites, removeFromFavourites]
//   );

//   // --------------------------------------------------------------------
//   // ADS SECTION HANDLER
//   // --------------------------------------------------------------------
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

//   const AdsSectionMemo = useMemo(() => React.memo(AdsSection), []);

//   // --------------------------------------------------------------------
//   // LIST HEADER COMPONENT
//   // --------------------------------------------------------------------
//   const headerComponent = useMemo(
//     () => (
//       <>
//       <View style={styles.headerContainer}>
//         {/* Lottie wave background */}
//         <View style={styles.lottieContainer1}>
//           <LottieView
//             source={computer}
//             autoPlay
//             loop
//             style={styles.Lottie1}
//           />
//         </View>
//         <View style={styles.lottieContainer2}>
//           <LottieView
//             source={bulb}
//             autoPlay
//             loop
//             style={styles.Lottie2}
//           />
//         </View>
//         <View style={styles.lottieContainer3}>
//           <LottieView
//             source={reader}
//             autoPlay
//             loop
//             style={styles.Lottie3}
//           />
//         </View>

//         {/* Optional overlay gradient for blending */}
//         <LinearGradient
//           colors={currentTheme.marketheader}
//           style={[StyleSheet.absoluteFill, { borderBottomLeftRadius: 40, borderBottomRightRadius: 40 }]}
//         />

//         {/* Hero Text */}
//         <View style={styles.heroContent}>
//           <Text style={[styles.title, { color: currentTheme.headerTextColor }]}>
//             Marketplace
//           </Text>
//           <Text style={[styles.subTitle, { color: currentTheme.headerTextColor }]}>
//             Discover amazing exams & study materials
//           </Text>
//         </View>
//       </View>
//         {/* The hero header */}
//         {/* <View style={styles.header}>
//           <LinearGradient
//             colors={currentTheme.headerBackground}
//             style={styles.headerGradient}
//             start={[0, 0]}
//             end={[0, 1]}
//           />
//           <Text style={[styles.title, { color: currentTheme.headerTextColor }]}>
//             Marketplace
//           </Text>
//           <Text
//             style={[styles.subTitle, { color: currentTheme.headerTextColor }]}
//           >
//             Discover amazing exams & study materials
//           </Text>
//         </View> */}

//         {/* The search and sort container */}
//         <View style={styles.searchSortContainer}>
//           <View
//             style={[
//               styles.searchContainer,
//               { backgroundColor: currentTheme.cardBackground },
//             ]}
//           >
//             <Ionicons
//               name="search"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.searchIcon}
//             />
//             <TextInput
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               placeholder="Subject, Code, or Exam Name"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               value={searchQuery}
//               onChangeText={handleSearch}
//               returnKeyType="search"
//             />
//           </View>
//           <TouchableOpacity
//             style={[
//               styles.sortButton,
//               { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => setSortModalVisible(true)}
//           >
//             <MaterialIcons name="sort" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         {/* Additional offset if needed */}
//         {/* <View style={{ marginTop: -30 }} /> */}

//         {/* Ads Section */}
//         <AdsSectionMemo
//           currentTheme={currentTheme}
//           onAdPress={handleAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="sale"
//         />
//       </>
//     ),
//     [
//       currentTheme,
//       searchQuery,
//       adsRefresh,
//       handleAdPress,
//       handleSearch,
//       sortModalVisible,
//     ]
//   );

//   // --------------------------------------------------------------------
//   // RENDER ITEM (for FlatList)
//   // --------------------------------------------------------------------
//   const renderItem = useCallback(
//     ({ item }) => {
//       const isFavorite = favouriteItems.some(
//         (favItem) => favItem._id === item._id
//       );
//       return (
//         <View
//           style={[
//             styles.card,
//             {
//               backgroundColor: currentTheme.cardBackground,
//               width: cardWidth,
//             },
//           ]}
//         >
//           <TouchableOpacity
//             onPress={() =>
//               navigation.navigate('ProductPage', { productId: item._id })
//             }
//             activeOpacity={0.8}
//             style={styles.cardTouchable}
//           >
//             <Image
//               source={{ uri: item.image }}
//               style={styles.cardImage}
//               resizeMode="cover"
//             />
//             <TouchableOpacity
//               style={styles.favoriteIcon}
//               onPress={() => handleToggleFavorite(item)}
//             >
//               <Ionicons
//                 name={isFavorite ? 'heart' : 'heart-outline'}
//                 size={24}
//                 color={
//                   isFavorite
//                     ? '#E91E63'
//                     : currentTheme.placeholderTextColor
//                 }
//               />
//             </TouchableOpacity>

//             <View style={styles.cardContent}>
//               <Text
//                 style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}
//                 numberOfLines={1}
//               >
//                 {item.name}
//               </Text>
//               <Text
//                 style={[styles.cardSubtitle, { color: currentTheme.textColor }]}
//                 numberOfLines={1}
//               >
//                 {item.subjectName} ({item.subjectCode})
//               </Text>

//               <View style={styles.ratingContainer}>
//                 {Array.from({ length: 5 }, (_, idx) => (
//                   <Ionicons
//                     key={idx}
//                     name={
//                       idx < Math.floor(item.ratings)
//                         ? 'star'
//                         : 'star-outline'
//                     }
//                     size={16}
//                     color="#FFD700"
//                   />
//                 ))}
//                 <Text
//                   style={[
//                     styles.reviewCount,
//                     { color: currentTheme.textColor },
//                   ]}
//                 >
//                   ({item.numberOfReviews})
//                 </Text>
//               </View>

//               <Text
//                 style={[styles.cardPrice, { color: currentTheme.cardTextColor }]}
//               >
//                 ${item.price}
//               </Text>
//             </View>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[
//               styles.cartIcon,
//               { backgroundColor: currentTheme.primaryColor },
//             ]}
//             onPress={() => handleAddToCart(item)}
//           >
//             <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>
//       );
//     },
//     [favouriteItems, currentTheme, navigation, cardWidth, handleToggleFavorite, handleAddToCart]
//   );

//   // --------------------------------------------------------------------
//   // MAIN RENDER
//   // --------------------------------------------------------------------
//   return (
//     <View
//       style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}
//     >
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <CustomHeader />

//       {/* The sort modal */}
//       {sortModalVisible && (
//         <Modal
//           visible={sortModalVisible}
//           animationType="fade"
//           transparent={true}
//           onRequestClose={() => setSortModalVisible(false)}
//         >
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback
//               onPress={() => setSortModalVisible(false)}
//             >
//               <View style={styles.modalOverlay} />
//             </TouchableWithoutFeedback>
//             <View
//               style={[
//                 styles.modalContent,
//                 { backgroundColor: currentTheme.cardBackground },
//               ]}
//             >
//               <Text
//                 style={[styles.modalLabel, { color: currentTheme.cardTextColor }]}
//               >
//                 Sort By
//               </Text>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Name (A-Z)')}
//               >
//                 <Text
//                   style={[
//                     styles.modalOptionText,
//                     { color: currentTheme.textColor },
//                   ]}
//                 >
//                   Name (A-Z)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Name (Z-A)')}
//               >
//                 <Text
//                   style={[
//                     styles.modalOptionText,
//                     { color: currentTheme.textColor },
//                   ]}
//                 >
//                   Name (Z-A)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (Low to High)')}
//               >
//                 <Text
//                   style={[
//                     styles.modalOptionText,
//                     { color: currentTheme.textColor },
//                   ]}
//                 >
//                   Price (Low to High)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (High to Low)')}
//               >
//                 <Text
//                   style={[
//                     styles.modalOptionText,
//                     { color: currentTheme.textColor },
//                   ]}
//                 >
//                   Price (High to Low)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Default')}
//               >
//                 <Text
//                   style={[
//                     styles.modalOptionText,
//                     { color: currentTheme.textColor },
//                   ]}
//                 >
//                   Default
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Loader */}
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         </View>
//       )}

//       {/* Error */}
//       {error && !loading && (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>
//             {error}
//           </Text>
//           <TouchableOpacity
//             onPress={() => fetchAllProducts()}
//             style={[
//               styles.retryButton,
//               { backgroundColor: currentTheme.primaryColor },
//             ]}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Main List */}
//       {!error && (
//         <FlatList
//           data={filteredData}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           ListHeaderComponent={headerComponent}
//           contentContainerStyle={[
//             styles.listContent,
//             numColumns === 1 && styles.singleColumnContent,
//             { paddingBottom: 100 },
//           ]}
//           ListEmptyComponent={
//             !loading && (
//               <View style={styles.emptyContainer}>
//                 <Ionicons
//                   name="search"
//                   size={80}
//                   color={currentTheme.placeholderTextColor}
//                 />
//                 <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                   No results found.
//                 </Text>
//               </View>
//             )
//           }
//           numColumns={numColumns}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           key={numColumns}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => fetchAllProducts(true)}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//         />
//       )}

//       {/* Alert */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default MarketPage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   // Header
//   headerContainer: {
//     position: 'relative',
//     height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginBottom: 20,
//     marginTop: -8,
//     // elevation: 6,
//     // shadowColor: '#000',
//     // shadowOpacity: 0.2,
//     // shadowRadius: 4,
//   },
  // lottieContainer1: {
  //   ...StyleSheet.absoluteFillObject,
  //   borderBottomLeftRadius: 40,
  //   borderBottomRightRadius: 40,
  //   alignItems: 'flex-start',
  // },
  // Lottie1: {
  //   width: '160%',
  //   height: '90%',
  //   // bottom: 80,
  //   // Adjust as needed
  // },
  // lottieContainer2: {
  //   ...StyleSheet.absoluteFillObject,
  //   borderBottomLeftRadius: 40,
  //   borderBottomRightRadius: 40,
  //   alignItems: 'flex-end',
  // },
  // Lottie2: {
  //   width: '160%',
  //   height: '90%',
  //   // bottom: 80,
  //   // Adjust as needed
  // },
//   lottieContainer3: {
//     ...StyleSheet.absoluteFillObject,
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     alignItems: 'center',
//   },
//   Lottie3: {
//     top: 40,
//     right: 20,
//     width: '70%',
//     height: '70%',
//     // bottom: 80,
//     // Adjust as needed
//   },
//   heroContent: {
//     zIndex: 2,
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   subTitle: {
//     fontSize: 16,
//     marginTop: 8,
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },
//   // header: {
//   //   position: 'relative',
//   //   height: 180,
//   //   justifyContent: 'center',
//   //   alignItems: 'center',
//   //   overflow: 'hidden',
//   //   borderBottomLeftRadius: 40,
//   //   borderBottomRightRadius: 40,
//   //   marginBottom: 20,
//   //   marginTop: -8,
//   //   elevation: 6,
//   //   shadowColor: '#000',
//   //   shadowOpacity: 0.2,
//   //   shadowRadius: 4,
//   // },
//   // headerGradient: {
//   //   position: 'absolute',
//   //   width: '100%',
//   //   height: '100%',
//   //   borderBottomLeftRadius: 40,
//   //   borderBottomRightRadius: 40,
//   // },
//   // title: {
//   //   fontSize: 32,
//   //   fontWeight: 'bold',
//   //   zIndex: 1,
//   //   textShadowColor: 'rgba(0,0,0,0.4)',
//   //   textShadowOffset: { width: 0, height: 2 },
//   //   textShadowRadius: 4,
//   // },
//   // subTitle: {
//   //   fontSize: 16,
//   //   marginTop: 8,
//   //   zIndex: 1,
//   //   textShadowColor: 'rgba(0,0,0,0.4)',
//   //   textShadowOffset: { width: 0, height: 1 },
//   //   textShadowRadius: 3,
//   // },
//   // Search & Sort
//   searchSortContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginBottom: 10,
//     marginTop: -50,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//     flex: 1,
//     height: 50,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     minWidth: 0,
//     flexShrink: 1,
//     fontSize: 14,
//   },
//   sortButton: {
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 30,
//     elevation: 3,
//   },
//   // Modal Sort
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   modalContent: {
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     alignItems: 'center',
//   },
//   modalLabel: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 15,
//   },
//   modalOption: {
//     width: '100%',
//     paddingVertical: 10,
//   },
//   modalOptionText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   // List
//   listContent: {
//     paddingBottom: 20,
//     paddingHorizontal: 10,
//     paddingTop: 5,
//   },
//   singleColumnContent: {
//     alignItems: 'center',
//   },
//   // Card
//   card: {
//     borderRadius: 10,
//     marginBottom: 15,
//     marginHorizontal: 10,
//     elevation: 2,
//     minHeight: 300,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cardTouchable: {
//     flex: 1,
//   },
//   cardImage: {
//     width: '100%',
//     height: 140,
//   },
//   favoriteIcon: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   cardContent: {
//     padding: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 3,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   reviewCount: {
//     fontSize: 12,
//     marginLeft: 5,
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 6,
//   },
//   cartIcon: {
//     position: 'absolute',
//     bottom: 20,
//     right: 10,
//     borderRadius: 20,
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 2,
//   },
//   // Loaders & Errors
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
// });








// // src/screens/MarketPage.js

// import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   Modal,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   useWindowDimensions,
//   RefreshControl,
// } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { debounce } from 'lodash';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomHeader from '../components/CustomHeader';
// import CustomAlert from '../components/CustomAlert';
// import AdsSection from '../components/AdsSection';

// import { fetchProducts } from '../services/api';

// const MarketPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const { addToCart } = useContext(CartContext);
//   const { favouriteItems, addToFavourites, removeFromFavourites } =
//     useContext(FavouritesContext);

//   const [products, setProducts] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOption, setSortOption] = useState('Default');
//   const [sortModalVisible, setSortModalVisible] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const { width } = useWindowDimensions();
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   // --------------------------------------------------------------
//   // FETCH PRODUCTS
//   // --------------------------------------------------------------
//   const fetchAllProducts = async (isRefreshing = false) => {
//     try {
//       if (isRefreshing) {
//         setRefreshing(true);
//         // Force AdsSection to refresh
//         setAdsRefresh((prev) => prev + 1);
//       } else {
//         setLoading(true);
//       }
//       const response = await fetchProducts();
//       if (isRefreshing) setRefreshing(false);
//       else setLoading(false);

//       if (response.success) {
//         setProducts(response.data.data);
//         setFilteredData(sortData(response.data.data, sortOption));
//         setError(null);
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err.message);
//       setLoading(false);
//       setRefreshing(false);

//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch products.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'Retry',
//           onPress: () => {
//             setAlertVisible(false);
//             fetchAllProducts(isRefreshing);
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   useEffect(() => {
//     fetchAllProducts();
//     // Cleanup if needed
//   }, []);

//   // --------------------------------------------------------------
//   // SORT & SEARCH
//   // --------------------------------------------------------------
//   const sortData = (dataToSort, option) => {
//     let sortedData = [...dataToSort];
//     if (option === 'Name (A-Z)') {
//       sortedData.sort((a, b) => a.name.localeCompare(b.name));
//     } else if (option === 'Name (Z-A)') {
//       sortedData.sort((a, b) => b.name.localeCompare(a.name));
//     } else if (option === 'Price (Low to High)') {
//       sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//     } else if (option === 'Price (High to Low)') {
//       sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//     }
//     return sortedData;
//   };

//   const handleSortOption = (option) => {
//     setSortOption(option);
//     setFilteredData(sortData(filteredData, option));
//     setSortModalVisible(false);
//   };

//   const filterData = (text) => {
//     const newData = products.filter((item) => {
//       const itemData = `
//         ${item.subjectName.toUpperCase()}
//         ${item.subjectCode.toUpperCase()}
//         ${item.name.toUpperCase()}
//       `;
//       const textData = text.toUpperCase();
//       return itemData.indexOf(textData) > -1;
//     });
//     setFilteredData(sortData(newData, sortOption));
//   };

//   const debouncedFilter = useCallback(debounce(filterData, 300), [products, sortOption]);

//   const handleSearch = (text) => {
//     setSearchQuery(text);
//     debouncedFilter(text);
//   };

//   // Re-sort if `products` or `sortOption` changes
//   useEffect(() => {
//     setFilteredData(sortData(products, sortOption));
//     return () => {
//       debouncedFilter.cancel();
//     };
//   }, [products]);

//   // --------------------------------------------------------------
//   // LAYOUT & RENDER
//   // --------------------------------------------------------------
//   const getNumberOfColumns = () => {
//     if (width <= 375) return 1;
//     if (width <= 800) return 2;
//     if (width <= 1200) return 3;
//     return 4;
//   };
//   const numColumns = getNumberOfColumns();

//   const getCardWidth = () => {
//     // Margins: 20 per column-gap (left-right)
//     const totalMargin = 20 * (numColumns + 1);
//     const availableWidth = width - totalMargin;
//     return availableWidth / numColumns;
//   };

//   // --------------------------------------------------------------
//   // ADD / REMOVE CART & FAVORITES
//   // --------------------------------------------------------------
//   const handleAddToCart = (item) => {
//     const added = addToCart(item);
//     if (added) {
//       setAlertTitle('Success');
//       setAlertMessage(`${item.name} has been added to your cart.`);
//       setAlertIcon('cart');
//     } else {
//       setAlertTitle('Info');
//       setAlertMessage(`${item.name} is already in your cart.`);
//       setAlertIcon('information-circle');
//     }
//     setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//     setAlertVisible(true);
//   };

//   const handleToggleFavorite = (item) => {
//     const isFavourite = favouriteItems.some((fav) => fav._id === item._id);
//     if (isFavourite) {
//       removeFromFavourites(item._id);
//       setAlertTitle('Removed');
//       setAlertMessage(`${item.name} removed from Favourites.`);
//       setAlertIcon('heart-dislike-outline');
//     } else {
//       addToFavourites(item);
//       setAlertTitle('Added');
//       setAlertMessage(`${item.name} added to Favourites.`);
//       setAlertIcon('heart');
//     }
//     setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//     setAlertVisible(true);
//   };

//   // --------------------------------------------------------------
//   // ADS SECTION
//   // --------------------------------------------------------------
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

//   const AdsSectionMemo = React.memo(AdsSection);

//   // --------------------------------------------------------------
//   // LIST HEADER COMPONENT (Including the original "header" + search)
//   // --------------------------------------------------------------
//   const headerComponent = useMemo(
//     () => (
//       <>
//         {/* The original header */}
//         <View style={styles.header}>
//           <LinearGradient
//             colors={currentTheme.headerBackground}
//             style={styles.headerGradient}
//             start={[0, 0]}
//             end={[0, 1]}
//           />
//           <Text style={[styles.title, { color: currentTheme.headerTextColor }]}>
//             Marketplace
//           </Text>
//           <Text style={[styles.subTitle, { color: currentTheme.headerTextColor }]}>
//             Discover amazing exams & study materials
//           </Text>
//         </View>

//         {/* The search and sort container */}
//         <View style={styles.searchSortContainer}>
//           <View
//             style={[
//               styles.searchContainer,
//               { backgroundColor: currentTheme.cardBackground },
//             ]}
//           >
//             <Ionicons
//               name="search"
//               size={20}
//               color={currentTheme.placeholderTextColor}
//               style={styles.searchIcon}
//             />
//             <TextInput
//               style={[styles.searchInput, { color: currentTheme.textColor }]}
//               placeholder="Subject, Code, or Exam Name"
//               placeholderTextColor={currentTheme.placeholderTextColor}
//               value={searchQuery}
//               onChangeText={handleSearch}
//               returnKeyType="search"
//             />
//           </View>
//           <TouchableOpacity
//             style={[styles.sortButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => setSortModalVisible(true)}
//           >
//             <MaterialIcons name="sort" size={24} color="#FFFFFF" />
//           </TouchableOpacity>
//         </View>

//         {/* Additional offset if needed */}
//         <View style={{ marginTop: -30 }} />

//         {/* Ads Section */}
//         <AdsSectionMemo
//           currentTheme={currentTheme}
//           onAdPress={handleAdPress}
//           refreshSignal={adsRefresh}
//           templateFilter="sale"
//         />
//       </>
//     ),
//     [currentTheme, searchQuery, adsRefresh, handleAdPress, sortModalVisible]
//   );

//   // --------------------------------------------------------------
//   // FLATLIST RENDER ITEM
//   // --------------------------------------------------------------
//   const renderItem = ({ item }) => {
//     const isFavorite = favouriteItems.some((favItem) => favItem._id === item._id);
//     return (
//       <View
//         style={[
//           styles.card,
//           {
//             backgroundColor: currentTheme.cardBackground,
//             width: getCardWidth(),
//           },
//         ]}
//       >
//         <TouchableOpacity
//           onPress={() => navigation.navigate('ProductPage', { productId: item._id })}
//           activeOpacity={0.8}
//           style={styles.cardTouchable}
//         >
//           <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
//           <TouchableOpacity style={styles.favoriteIcon} onPress={() => handleToggleFavorite(item)}>
//             <Ionicons
//               name={isFavorite ? 'heart' : 'heart-outline'}
//               size={24}
//               color={isFavorite ? '#E91E63' : currentTheme.placeholderTextColor}
//             />
//           </TouchableOpacity>

//           <View style={styles.cardContent}>
//             <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]} numberOfLines={1}>
//               {item.name}
//             </Text>
//             <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]} numberOfLines={1}>
//               {item.subjectName} ({item.subjectCode})
//             </Text>

//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, idx) => (
//                 <Ionicons
//                   key={idx}
//                   name={idx < Math.floor(item.ratings) ? 'star' : 'star-outline'}
//                   size={16}
//                   color="#FFD700"
//                 />
//               ))}
//               <Text style={[styles.reviewCount, { color: currentTheme.textColor }]}>
//                 ({item.numberOfReviews})
//               </Text>
//             </View>

//             <Text style={[styles.cardPrice, { color: currentTheme.cardTextColor }]}>
//               ${item.price}
//             </Text>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.cartIcon, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => handleAddToCart(item)}
//         >
//           <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // --------------------------------------------------------------
//   // MAIN RETURN
//   // --------------------------------------------------------------
//   return (
//     <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <CustomHeader />

//       {/* The sort modal */}
//       {sortModalVisible && (
//         <Modal
//           visible={sortModalVisible}
//           animationType="fade"
//           transparent={true}
//           onRequestClose={() => setSortModalVisible(false)}
//         >
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
//               <View style={styles.modalOverlay} />
//             </TouchableWithoutFeedback>
//             <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.modalLabel, { color: currentTheme.cardTextColor }]}>
//                 Sort By
//               </Text>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (A-Z)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Name (A-Z)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (Z-A)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Name (Z-A)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (Low to High)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (Low to High)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (High to Low)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (High to Low)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Default')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Default
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Loader */}
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         </View>
//       )}

//       {/* Error */}
//       {error && !loading && (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>{error}</Text>
//           <TouchableOpacity
//             onPress={() => fetchAllProducts()}
//             style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Main List */}
//       {!error && (
//         <FlatList
//           data={filteredData}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           ListHeaderComponent={headerComponent}
//           contentContainerStyle={[
//             styles.listContent,
//             numColumns === 1 && styles.singleColumnContent,
//             { paddingBottom: 100 },
//           ]}
//           ListEmptyComponent={
//             !loading && (
//               <View style={styles.emptyContainer}>
//                 <Ionicons
//                   name="search"
//                   size={80}
//                   color={currentTheme.placeholderTextColor}
//                 />
//                 <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                   No results found.
//                 </Text>
//               </View>
//             )
//           }
//           numColumns={numColumns}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           key={numColumns}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => fetchAllProducts(true)}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//         />
//       )}

//       {/* Alert */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default MarketPage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   // Header
//   header: {
//     position: 'relative',
//     height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     marginBottom: 20,
//     marginTop: -8,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   headerGradient: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     zIndex: 1,
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   subTitle: {
//     fontSize: 16,
//     marginTop: 8,
//     zIndex: 1,
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },
//   // Search & Sort
//   searchSortContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginBottom: 10,
//     marginTop: -50,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//     flex: 1,
//     height: 50,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     minWidth: 0,
//     flexShrink: 1,
//     fontSize: 14,
//   },
//   sortButton: {
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 30,
//     elevation: 3,
//   },
//   // Modal Sort
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   modalContent: {
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     alignItems: 'center',
//   },
//   modalLabel: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 15,
//   },
//   modalOption: {
//     width: '100%',
//     paddingVertical: 10,
//   },
//   modalOptionText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   // List
//   listContent: {
//     paddingBottom: 20,
//     paddingHorizontal: 10,
//     paddingTop: 5,
//   },
//   singleColumnContent: {
//     alignItems: 'center',
//   },
//   // Card
//   card: {
//     borderRadius: 10,
//     marginBottom: 15,
//     marginHorizontal: 10,
//     elevation: 2,
//     minHeight: 300,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cardTouchable: {
//     flex: 1,
//   },
//   cardImage: {
//     width: '100%',
//     height: 140,
//   },
//   favoriteIcon: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   cardContent: {
//     padding: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 3,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   reviewCount: {
//     fontSize: 12,
//     marginLeft: 5,
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 6,
//   },
//   cartIcon: {
//     position: 'absolute',
//     bottom: 20,
//     right: 10,
//     borderRadius: 20,
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 2,
//   },
//   // Loaders & Errors
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
// });











// // src/screens/MarketPage.js
// import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   Modal,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   useWindowDimensions,
//   RefreshControl,
// } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { debounce } from 'lodash';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomHeader from '../components/CustomHeader';
// import CustomAlert from '../components/CustomAlert';
// import AdsSection from '../components/AdsSection';

// import { fetchProducts } from '../services/api';

// const MarketPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const { addToCart } = useContext(CartContext);
//   const { favouriteItems, addToFavourites, removeFromFavourites } =
//     useContext(FavouritesContext);

//   const [products, setProducts] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);

//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOption, setSortOption] = useState('Default');
//   const [sortModalVisible, setSortModalVisible] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   const { width } = useWindowDimensions();
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   const handleAdPress = useCallback((ad) => {
//     if (ad.adProdtype === 'Course') {
//       navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//     } else {
//       navigation.navigate('ProductPage', { productId: ad.adProdId });
//     }
//   }, [navigation]);

//   const fetchAllProducts = async (isRefreshing = false) => {
//     try {
//       if (isRefreshing) {
//         setRefreshing(true);
//         // Force AdsSection to refresh by updating its refreshSignal
//         setAdsRefresh((prev) => prev + 1);
//       } else {
//         setLoading(true);
//       }
//       const response = await fetchProducts();
//       if (isRefreshing) setRefreshing(false);
//       else setLoading(false);

//       if (response.success) {
//         setProducts(response.data.data);
//         setFilteredData(sortData(response.data.data, sortOption));
//         setError(null);
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err.message);
//       setLoading(false);
//       setRefreshing(false);

//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch products.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'Retry',
//           onPress: () => {
//             setAlertVisible(false);
//             fetchAllProducts(isRefreshing);
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   useEffect(() => {
//     fetchAllProducts();
//   }, []);

//   const getNumberOfColumns = () => {
//     if (width <= 375) return 1;
//     if (width <= 800) return 2;
//     if (width <= 1200) return 3;
//     return 4;
//   };
//   const numColumns = getNumberOfColumns();

//   const sortData = (dataToSort, option) => {
//     let sortedData = [...dataToSort];
//     if (option === 'Name (A-Z)') {
//       sortedData.sort((a, b) => a.name.localeCompare(b.name));
//     } else if (option === 'Name (Z-A)') {
//       sortedData.sort((a, b) => b.name.localeCompare(a.name));
//     } else if (option === 'Price (Low to High)') {
//       sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//     } else if (option === 'Price (High to Low)') {
//       sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//     }
//     return sortedData;
//   };

//   const handleSortOption = (option) => {
//     setSortOption(option);
//     setFilteredData(sortData(filteredData, option));
//     setSortModalVisible(false);
//   };

//   const filterData = (text) => {
//     const newData = products.filter((item) => {
//       const itemData = `
//         ${item.subjectName.toUpperCase()}
//         ${item.subjectCode.toUpperCase()}
//         ${item.name.toUpperCase()}
//       `;
//       const textData = text.toUpperCase();
//       return itemData.indexOf(textData) > -1;
//     });
//     setFilteredData(sortData(newData, sortOption));
//   };

//   const debouncedFilter = useCallback(debounce(filterData, 300), [products, sortOption]);

//   const handleSearch = (text) => {
//     setSearchQuery(text);
//     debouncedFilter(text);
//   };

//   // Add to Cart
//   const handleAddToCart = (item) => {
//     const added = addToCart(item);
//     if (added) {
//       setAlertTitle('Success');
//       setAlertMessage(`${item.name} has been added to your cart.`);
//       setAlertIcon('cart');
//     } else {
//       setAlertTitle('Info');
//       setAlertMessage(`${item.name} is already in your cart.`);
//       setAlertIcon('information-circle');
//     }
//     setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//     setAlertVisible(true);
//   };

//   // Toggle Favorite
//   const handleToggleFavorite = (item) => {
//     const isFavourite = favouriteItems.some((fav) => fav._id === item._id);
//     if (isFavourite) {
//       removeFromFavourites(item._id);
//       setAlertTitle('Removed');
//       setAlertMessage(`${item.name} removed from Favourites.`);
//       setAlertIcon('heart-dislike-outline');
//     } else {
//       addToFavourites(item);
//       setAlertTitle('Added');
//       setAlertMessage(`${item.name} added to Favourites.`);
//       setAlertIcon('heart');
//     }
//     setAlertButtons([{ text: 'OK', onPress: () => setAlertVisible(false) }]);
//     setAlertVisible(true);
//   };

//   const AdsSectionMemo = React.memo(AdsSection);
//   const headerComponent = useMemo(() => (
//     <>
//       <View style={{ marginTop: -30 }} />
//       <AdsSectionMemo
//         currentTheme={currentTheme}
//         onAdPress={handleAdPress}
//         refreshSignal={adsRefresh}
//         templateFilter="sale"
//       />
//     </>
//   ), [currentTheme, handleAdPress, adsRefresh]);
  
//   const getCardWidth = () => {
//     const totalMargin = 20 * (numColumns + 1);
//     const availableWidth = width - totalMargin;
//     return availableWidth / numColumns;
//   };

//   useEffect(() => {
//     setFilteredData(sortData(products, sortOption));
//     return () => {
//       debouncedFilter.cancel();
//     };
//   }, [products]);

//   const renderItem = ({ item }) => {
//     const isFavorite = favouriteItems.some((favItem) => favItem._id === item._id);
//     return (
//       <View
//         style={[
//           styles.card,
//           {
//             backgroundColor: currentTheme.cardBackground,
//             width: getCardWidth(),
//           },
//         ]}
//       >
//         <TouchableOpacity
//           onPress={() => navigation.navigate('ProductPage', { productId: item._id })}
//           activeOpacity={0.8}
//           style={styles.cardTouchable}
//         >
//           <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
//           <TouchableOpacity style={styles.favoriteIcon} onPress={() => handleToggleFavorite(item)}>
//             <Ionicons
//               name={isFavorite ? 'heart' : 'heart-outline'}
//               size={24}
//               color={isFavorite ? '#E91E63' : currentTheme.placeholderTextColor}
//             />
//           </TouchableOpacity>

//           <View style={styles.cardContent}>
//             <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]} numberOfLines={1}>
//               {item.name}
//             </Text>
//             <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]} numberOfLines={1}>
//               {item.subjectName} ({item.subjectCode})
//             </Text>

//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => (
//                 <Ionicons
//                   key={index}
//                   name={index < Math.floor(item.ratings) ? 'star' : 'star-outline'}
//                   size={16}
//                   color="#FFD700"
//                 />
//               ))}
//               <Text style={[styles.reviewCount, { color: currentTheme.textColor }]}>
//                 ({item.numberOfReviews})
//               </Text>
//             </View>

//             <Text style={[styles.cardPrice, { color: currentTheme.cardTextColor }]}>
//               ${item.price}
//             </Text>
//           </View>
//         </TouchableOpacity>

//         <TouchableOpacity
//           style={[styles.cartIcon, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => handleAddToCart(item)}
//         >
//           <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   return (
//     <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <CustomHeader />

//       <View style={styles.header}>
//         <LinearGradient
//           colors={currentTheme.headerBackground}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         />
//         <Text style={[styles.title, { color: currentTheme.headerTextColor }]}>
//           Marketplace
//         </Text>
//         <Text style={[styles.subTitle, { color: currentTheme.headerTextColor }]}>
//           Discover amazing exams & study materials
//         </Text>
//       </View>

//       <View style={styles.searchSortContainer}>
//         <View
//           style={[
//             styles.searchContainer,
//             { backgroundColor: currentTheme.cardBackground },
//           ]}
//         >
//           <Ionicons
//             name="search"
//             size={20}
//             color={currentTheme.placeholderTextColor}
//             style={styles.searchIcon}
//           />
//           <TextInput
//             style={[styles.searchInput, { color: currentTheme.textColor }]}
//             placeholder="Subject, Code, or Exam Name"
//             placeholderTextColor={currentTheme.placeholderTextColor}
//             value={searchQuery}
//             onChangeText={handleSearch}
//             returnKeyType="search"
//           />
//         </View>
//         <TouchableOpacity
//           style={[styles.sortButton, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => setSortModalVisible(true)}
//         >
//           <MaterialIcons name="sort" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>

//       {sortModalVisible && (
//         <Modal
//           visible={sortModalVisible}
//           animationType="fade"
//           transparent={true}
//           onRequestClose={() => setSortModalVisible(false)}
//         >
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
//               <View style={styles.modalOverlay} />
//             </TouchableWithoutFeedback>
//             <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.modalLabel, { color: currentTheme.cardTextColor }]}>
//                 Sort By
//               </Text>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (A-Z)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Name (A-Z)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (Z-A)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Name (Z-A)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (Low to High)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (Low to High)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (High to Low)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (High to Low)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Default')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Default
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}

//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         </View>
//       )}

//       {error && !loading && (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>{error}</Text>
//           <TouchableOpacity
//             onPress={() => fetchAllProducts()}
//             style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {!error && (
//         <FlatList
//           data={filteredData}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           contentContainerStyle={[
//             styles.listContent,
//             numColumns === 1 && styles.singleColumnContent,
//             { paddingBottom: 100 },
//           ]}
//           ListHeaderComponent={headerComponent}
//           ListEmptyComponent={
//             !loading && (
//               <View style={styles.emptyContainer}>
//                 <Ionicons
//                   name="search"
//                   size={80}
//                   color={currentTheme.placeholderTextColor}
//                 />
//                 <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                   No results found.
//                 </Text>
//               </View>
//             )
//           }
//           numColumns={numColumns}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           key={numColumns}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => fetchAllProducts(true)}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//         />
//       )}

//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default MarketPage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     position: 'relative',
//     height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     marginBottom: 20,
//     marginTop: -8,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   headerGradient: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     zIndex: 1,
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   subTitle: {
//     fontSize: 16,
//     marginTop: 8,
//     zIndex: 1,
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },
//   searchSortContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginBottom: 10,
//     marginTop: -50,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//     flex: 1,
//     height: 50,
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     minWidth: 0,
//     flexShrink: 1,
//     fontSize: 14,
//   },
//   sortButton: {
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 30,
//     elevation: 3,
//   },
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   modalContent: {
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     alignItems: 'center',
//   },
//   modalLabel: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 15,
//   },
//   modalOption: {
//     width: '100%',
//     paddingVertical: 10,
//   },
//   modalOptionText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   listContent: {
//     paddingBottom: 20,
//     paddingHorizontal: 10,
//     paddingTop: 5,
//   },
//   singleColumnContent: {
//     alignItems: 'center',
//   },
//   card: {
//     borderRadius: 10,
//     marginBottom: 15,
//     marginHorizontal: 10,
//     elevation: 2,
//     minHeight: 300,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   cardTouchable: {
//     flex: 1,
//   },
//   cardImage: {
//     width: '100%',
//     height: 140,
//   },
//   favoriteIcon: {
//     position: 'absolute',
//     top: 12,
//     right: 12,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   cardContent: {
//     padding: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 3,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   reviewCount: {
//     fontSize: 12,
//     marginLeft: 5,
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 6,
//   },
//   cartIcon: {
//     position: 'absolute',
//     bottom: 20,
//     right: 10,
//     borderRadius: 20,
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOpacity: 0.15,
//     shadowRadius: 2,
//   },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
// });








// // src/screens/MarketPage.js

// import React, { useState, useContext, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   Modal,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   useWindowDimensions,
//   RefreshControl,
// } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { debounce } from 'lodash';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomHeader from '../components/CustomHeader';
// import CustomAlert from '../components/CustomAlert';
// import AdsSection from '../components/AdsSection';

// import { fetchProducts } from '../services/api';

// const MarketPage = () => {
//   const navigation = useNavigation();

//   // Theme
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Cart & Favourites
//   const { addToCart } = useContext(CartContext);
//   const { favouriteItems, addToFavourites, removeFromFavourites } = useContext(FavouritesContext);

//   // Product Data
//   const [products, setProducts] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);

//   // States
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOption, setSortOption] = useState('Default');
//   const [sortModalVisible, setSortModalVisible] = useState(false);

//   // Loading, Error, Refresh
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // Alert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // For responsive columns
//   const { width } = useWindowDimensions();

//   // ----------------------- Ads Refresh Signal -----------------------
//   const [adsRefresh, setAdsRefresh] = useState(0);

//   const handleAdPress = useCallback((ad) => {
//     // console.log('handleAdPress', ad.adProdtype);  
    
//     if (ad.adProdtype === 'Course') {
//       navigation.navigate('CourseDetailScreen', { courseId: ad.adProdId });
//     } else {
//       navigation.navigate('ProductPage', { productId: ad.adProdId });
//     }
    
//   }, []);

//   // Fetch All Products
//   const fetchAllProducts = async (isRefreshing = false) => {
//     try {
//       if (isRefreshing) setRefreshing(true);
//       else setLoading(true);

//       const response = await fetchProducts();

//       if (isRefreshing) setRefreshing(false);
//       else setLoading(false);

//       if (response.success) {
//         setProducts(response.data.data);
//         setFilteredData(sortData(response.data.data, sortOption));
//         setError(null);
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err.message);
//       setLoading(false);
//       setRefreshing(false);

//       // Show error alert with retry
//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch products.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'Retry',
//           onPress: () => {
//             setAlertVisible(false);
//             fetchAllProducts(isRefreshing);
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   useEffect(() => {
//     fetchAllProducts();
//   }, []);

//   // Responsive Columns
//   const getNumberOfColumns = () => {
//     if (width <= 375) return 1; // Small screens
//     if (width <= 800) return 2; // Medium screens
//     if (width <= 1200) return 3; // Large screens
//     return 4; // Extra large screens
//   };

//   const numColumns = getNumberOfColumns();

//   // Sorting
//   const sortData = (dataToSort, option) => {
//     let sortedData = [...dataToSort];
//     if (option === 'Name (A-Z)') {
//       sortedData.sort((a, b) => a.name.localeCompare(b.name));
//     } else if (option === 'Name (Z-A)') {
//       sortedData.sort((a, b) => b.name.localeCompare(a.name));
//     } else if (option === 'Price (Low to High)') {
//       sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//     } else if (option === 'Price (High to Low)') {
//       sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//     }
//     return sortedData;
//   };

//   const handleSortOption = (option) => {
//     setSortOption(option);
//     setFilteredData(sortData(filteredData, option));
//     setSortModalVisible(false);
//   };

//   // Debounced Search
//   const filterData = (text) => {
//     const newData = products.filter((item) => {
//       const itemData = `
//         ${item.subjectName.toUpperCase()}
//         ${item.subjectCode.toUpperCase()}
//         ${item.name.toUpperCase()}
//       `;
//       const textData = text.toUpperCase();
//       return itemData.indexOf(textData) > -1;
//     });
//     setFilteredData(sortData(newData, sortOption));
//   };

//   const debouncedFilter = useCallback(debounce(filterData, 300), [products, sortOption]);

//   const handleSearch = (text) => {
//     setSearchQuery(text);
//     debouncedFilter(text);
//   };

//   // Add to Cart
//   const handleAddToCart = (item) => {
//     const added = addToCart(item);
//     if (added) {
//       setAlertTitle('Success');
//       setAlertMessage(`${item.name} has been added to your cart.`);
//       setAlertIcon('cart');
//     } else {
//       setAlertTitle('Info');
//       setAlertMessage(`${item.name} is already in your cart.`);
//       setAlertIcon('information-circle');
//     }
//     setAlertButtons([
//       {
//         text: 'OK',
//         onPress: () => setAlertVisible(false),
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   // Toggle Favorite
//   const handleToggleFavorite = (item) => {
//     const isFavourite = favouriteItems.some((favItem) => favItem._id === item._id);
//     if (isFavourite) {
//       removeFromFavourites(item._id);
//       setAlertTitle('Removed from Favourites');
//       setAlertMessage(`${item.name} has been removed from your favourites.`);
//       setAlertIcon('heart-dislike-outline');
//     } else {
//       addToFavourites(item);
//       setAlertTitle('Added to Favourites');
//       setAlertMessage(`${item.name} has been added to your favourites.`);
//       setAlertIcon('heart');
//     }
//     setAlertButtons([
//       {
//         text: 'OK',
//         onPress: () => setAlertVisible(false),
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   // Render a single product card
//   const renderItem = ({ item }) => {
//     const isFavorite = favouriteItems.some((favItem) => favItem._id === item._id);

//     return (
//       <View style={[styles.card, { backgroundColor: currentTheme.cardBackground, width: getCardWidth() }]}>
//         {/* Touchable area for details */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('ProductPage', { productId: item._id })}
//           activeOpacity={0.8}
//           style={styles.cardTouchable}
//         >
//           <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />

//           {/* Favorite Icon */}
//           <TouchableOpacity style={styles.favoriteIcon} onPress={() => handleToggleFavorite(item)}>
//             <Ionicons
//               name={isFavorite ? 'heart' : 'heart-outline'}
//               size={24}
//               color={isFavorite ? '#E91E63' : currentTheme.placeholderTextColor}
//             />
//           </TouchableOpacity>

//           {/* Content */}
//           <View style={styles.cardContent}>
//             <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>{item.name}</Text>
//             <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]}>
//               {item.subjectName} ({item.subjectCode})
//             </Text>

//             {/* Rating */}
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => (
//                 <Ionicons
//                   key={index}
//                   name={index < Math.floor(item.ratings) ? 'star' : 'star-outline'}
//                   size={16}
//                   color="#FFD700"
//                 />
//               ))}
//               <Text style={[styles.reviewCount, { color: currentTheme.textColor }]}>({item.numberOfReviews})</Text>
//             </View>

//             {/* Price */}
//             <Text style={[styles.cardPrice, { color: currentTheme.cardTextColor }]}>${item.price}</Text>
//           </View>
//         </TouchableOpacity>

//         {/* Cart Icon (Add to Cart) */}
//         <TouchableOpacity
//           style={[styles.cartIcon, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => handleAddToCart(item)}
//         >
//           <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // Compute dynamic card width
//   const getCardWidth = () => {
//     const totalMargin = 20 * (numColumns + 1); // horizontal margin between cards
//     const availableWidth = width - totalMargin;
//     return availableWidth / numColumns;
//   };

//   useEffect(() => {
//     // Sort initially based on default
//     setFilteredData(sortData(products, sortOption));
//     // Cleanup
//     return () => {
//       debouncedFilter.cancel();
//     };
//   }, [products]);

//   return (
//     <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar backgroundColor={currentTheme.headerBackground[1]} barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      
//       {/* Optional Custom Header */}
//       <CustomHeader />

//       {/* Enhanced Header Title Section */}
//       <View style={styles.header}>
//         <LinearGradient
//           colors={currentTheme.headerBackground}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         />
//         <Text style={[styles.title, { color: currentTheme.headerTextColor }]}>Marketplace</Text>
//         <Text style={[styles.subTitle, { color: currentTheme.headerTextColor }]}>
//           Discover amazing exams & study materials
//         </Text>
//       </View>

//       {/* Search & Sort */}
//       <View style={styles.searchSortContainer}>
//         <View style={[styles.searchContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <Ionicons name="search" size={20} color={currentTheme.placeholderTextColor} style={styles.searchIcon} />
//           <TextInput
//             style={[styles.searchInput, { color: currentTheme.textColor }]}
//             placeholder="Subject, Code, or Exam Name"
//             placeholderTextColor={currentTheme.placeholderTextColor}
//             value={searchQuery}
//             onChangeText={handleSearch}
//             returnKeyType="search"
//             multiline={false}
//             textAlignVertical="center"
//             numberOfLines={1}
//             allowFontScaling={false}
//           />
//         </View>
//         <TouchableOpacity style={[styles.sortButton, { backgroundColor: currentTheme.primaryColor }]} onPress={() => setSortModalVisible(true)}>
//           <MaterialIcons name="sort" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>

//       {/* Sort Modal */}
//       {sortModalVisible && (
//         <Modal visible={sortModalVisible} animationType="fade" transparent={true} onRequestClose={() => setSortModalVisible(false)}>
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
//               <View style={styles.modalOverlay} />
//             </TouchableWithoutFeedback>
//             <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.modalLabel, { color: currentTheme.cardTextColor }]}>Sort By</Text>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (A-Z)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Name (A-Z)</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (Z-A)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Name (Z-A)</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Price (Low to High)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Price (Low to High)</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Price (High to Low)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Price (High to Low)</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Default')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Default</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Loading Overlay */}
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         </View>
//       )}

//       {/* Error View (Inline) */}
//       {error && !loading && (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>{error}</Text>
//           <TouchableOpacity onPress={() => fetchAllProducts()} style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}>
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Product List */}
//       {!error && (
//         <FlatList
//           data={filteredData}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           contentContainerStyle={[
//             styles.listContent,
//             numColumns === 1 && styles.singleColumnContent,
//             { paddingBottom: 100 }
//           ]}
//           ListHeaderComponent={() => (
//             <>
//               {/* Your AdsSection now scrolls with the products */}
//               <View style={{ marginTop: -30 }} />
//                 <AdsSection
//                   currentTheme={currentTheme}
//                   onAdPress={handleAdPress}
//                   refreshSignal={adsRefresh}
//                   templateFilter="sale"
//                 />
//               <View />
//               {/* You can add additional header content here if needed */}
//             </>
//           )}
//           ListEmptyComponent={
//             !loading && (
//               <View style={styles.emptyContainer}>
//                 <Ionicons name="search" size={80} color={currentTheme.placeholderTextColor} />
//                 <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>No results found.</Text>
//               </View>
//             )
//           }
//           numColumns={numColumns}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           key={numColumns}
//           refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchAllProducts(true)} tintColor={currentTheme.primaryColor} />}
//         />
//       )}

//       {/* Custom Alert */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default MarketPage;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   // Enhanced Header
//   header: {
//     position: 'relative',
//     height: 180,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     borderTopLeftRadius: 40,
//     borderTopRightRadius: 40,
//     marginBottom: 20,
//     marginTop: -8,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 5 },
//   },
//   headerGradient: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//   },
//   title: {
//     fontSize: 34,
//     fontWeight: 'bold',
//     zIndex: 1,
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 2 },
//     textShadowRadius: 4,
//   },
//   subTitle: {
//     fontSize: 16,
//     marginTop: 8,
//     zIndex: 1,
//     textShadowColor: 'rgba(0,0,0,0.4)',
//     textShadowOffset: { width: 0, height: 1 },
//     textShadowRadius: 3,
//   },
//   // Search & Sort
//   searchSortContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginBottom: 10,
//     marginTop: -50,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//     flex: 1,
//     height: 55,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3.84,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,
//     minWidth: 0,
//     flexShrink: 1,
//     fontSize: 14,
//     lineHeight: 18,
//     paddingVertical: 0,
//   },
//   sortButton: {
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 30,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3.84,
//   },
//   // Modal (Sort)
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   modalContent: {
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     alignItems: 'center',
//   },
//   modalLabel: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 15,
//   },
//   modalOption: {
//     width: '100%',
//     paddingVertical: 10,
//   },
//   modalOptionText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   // Products List
//   listContent: {
//     paddingBottom: 20,
//     paddingHorizontal: 10,
//     paddingTop: 5,
//   },
//   singleColumnContent: {
//     alignItems: 'center',
//   },
//   // Card
//   card: {
//     borderRadius: 10,
//     marginBottom: 15,
//     marginHorizontal: 10,
//     elevation: 3,
//     minHeight: 300,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3.84,
//   },
//   cardTouchable: {
//     flex: 1,
//   },
//   cardImage: {
//     width: '100%',
//     height: 140,
//   },
//   favoriteIcon: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   cardContent: {
//     padding: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 3,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   reviewCount: {
//     fontSize: 12,
//     marginLeft: 5,
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 6,
//   },
//   cartIcon: {
//     position: 'absolute',
//     bottom: 20,
//     right: 10,
//     borderRadius: 20,
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3.84,
//   },
//   // Loading Overlay
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.4)',
//     zIndex: 999,
//   },
//   // Error
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Empty List
//   emptyContainer: {
//     alignItems: 'center',
//     // marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
// });








// // src/screens/MarketPage.js

// import React, { useState, useContext, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   Modal,
//   TouchableWithoutFeedback,
//   ActivityIndicator,
//   useWindowDimensions,
//   RefreshControl,
// } from 'react-native';
// import { Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { debounce } from 'lodash';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { CartContext } from '../contexts/CartContext';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomHeader from '../components/CustomHeader';
// import CustomAlert from '../components/CustomAlert';

// import { fetchProducts } from '../services/api';

// const MarketPage = () => {
//   const navigation = useNavigation();

//   // Theme
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Cart & Favourites
//   const { addToCart } = useContext(CartContext);
//   const { favouriteItems, addToFavourites, removeFromFavourites } =
//     useContext(FavouritesContext);

//   // Product Data
//   const [products, setProducts] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);

//   // States
//   const [searchQuery, setSearchQuery] = useState('');
//   const [sortOption, setSortOption] = useState('Default');
//   const [sortModalVisible, setSortModalVisible] = useState(false);

//   // Loading, Error, Refresh
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // Alert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // For responsive columns
//   const { width } = useWindowDimensions();

//   // Fetch All Products
//   const fetchAllProducts = async (isRefreshing = false) => {
//     try {
//       if (isRefreshing) setRefreshing(true);
//       else setLoading(true);

//       const response = await fetchProducts();

//       if (isRefreshing) setRefreshing(false);
//       else setLoading(false);

//       if (response.success) {
//         setProducts(response.data.data);
//         setFilteredData(sortData(response.data.data, sortOption));
//         setError(null);
//       } else {
//         throw new Error(response.message);
//       }
//     } catch (err) {
//       console.error('Fetch error:', err);
//       setError(err.message);
//       setLoading(false);
//       setRefreshing(false);

//       // Show error alert with retry
//       setAlertTitle('Error');
//       setAlertMessage(err.message || 'Failed to fetch products.');
//       setAlertIcon('alert-circle');
//       setAlertButtons([
//         {
//           text: 'Retry',
//           onPress: () => {
//             setAlertVisible(false);
//             fetchAllProducts(isRefreshing);
//           },
//         },
//       ]);
//       setAlertVisible(true);
//     }
//   };

//   useEffect(() => {
//     fetchAllProducts();
//   }, []);

//   // Responsive Columns
//   const getNumberOfColumns = () => {
//     if (width <= 375) return 1; // Small screens
//     if (width <= 800) return 2; // Medium screens
//     if (width <= 1200) return 3; // Large screens
//     return 4; // Extra large screens
//   };

//   const numColumns = getNumberOfColumns();

//   // Sorting
//   const sortData = (dataToSort, option) => {
//     let sortedData = [...dataToSort];
//     if (option === 'Name (A-Z)') {
//       sortedData.sort((a, b) => a.name.localeCompare(b.name));
//     } else if (option === 'Name (Z-A)') {
//       sortedData.sort((a, b) => b.name.localeCompare(a.name));
//     } else if (option === 'Price (Low to High)') {
//       sortedData.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
//     } else if (option === 'Price (High to Low)') {
//       sortedData.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
//     }
//     return sortedData;
//   };

//   const handleSortOption = (option) => {
//     setSortOption(option);
//     setFilteredData(sortData(filteredData, option));
//     setSortModalVisible(false);
//   };

//   // Debounced Search
//   const filterData = (text) => {
//     const newData = products.filter((item) => {
//       const itemData = `
//         ${item.subjectName.toUpperCase()}
//         ${item.subjectCode.toUpperCase()}
//         ${item.name.toUpperCase()}
//       `;
//       const textData = text.toUpperCase();
//       return itemData.indexOf(textData) > -1;
//     });
//     setFilteredData(sortData(newData, sortOption));
//   };

//   const debouncedFilter = useCallback(debounce(filterData, 300), [products, sortOption]);

//   const handleSearch = (text) => {
//     setSearchQuery(text);
//     debouncedFilter(text);
//   };

//   // Add to Cart
//   const handleAddToCart = (item) => {
//     const added = addToCart(item);
//     if (added) {
//       setAlertTitle('Success');
//       setAlertMessage(`${item.name} has been added to your cart.`);
//       setAlertIcon('cart');
//     } else {
//       setAlertTitle('Info');
//       setAlertMessage(`${item.name} is already in your cart.`);
//       setAlertIcon('information-circle');
//     }
//     setAlertButtons([
//       {
//         text: 'OK',
//         onPress: () => setAlertVisible(false),
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   // Toggle Favorite
//   const handleToggleFavorite = (item) => {
//     const isFavourite = favouriteItems.some((favItem) => favItem._id === item._id);
//     if (isFavourite) {
//       removeFromFavourites(item._id);
//       setAlertTitle('Removed from Favourites');
//       setAlertMessage(`${item.name} has been removed from your favourites.`);
//       setAlertIcon('heart-dislike-outline');
//     } else {
//       addToFavourites(item);
//       setAlertTitle('Added to Favourites');
//       setAlertMessage(`${item.name} has been added to your favourites.`);
//       setAlertIcon('heart');
//     }
//     setAlertButtons([
//       {
//         text: 'OK',
//         onPress: () => setAlertVisible(false),
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   // Render a single product card
//   const renderItem = ({ item }) => {
//     const isFavorite = favouriteItems.some((favItem) => favItem._id === item._id);

//     return (
//       <View style={[styles.card, { backgroundColor: currentTheme.cardBackground, width: getCardWidth() }]}>
//         {/* Touchable area for details */}
//         <TouchableOpacity
//           onPress={() => navigation.navigate('ProductPage', { item })}
//           activeOpacity={0.8}
//           style={styles.cardTouchable}
//         >
//           <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />

//           {/* Favorite Icon */}
//           <TouchableOpacity
//             style={styles.favoriteIcon}
//             onPress={() => handleToggleFavorite(item)}
//           >
//             <Ionicons
//               name={isFavorite ? 'heart' : 'heart-outline'}
//               size={24}
//               color={isFavorite ? '#E91E63' : currentTheme.placeholderTextColor}
//             />
//           </TouchableOpacity>

//           {/* Content */}
//           <View style={styles.cardContent}>
//             <Text style={[styles.cardTitle, { color: currentTheme.cardTextColor }]}>
//               {item.name}
//             </Text>
//             <Text style={[styles.cardSubtitle, { color: currentTheme.textColor }]}>
//               {item.subjectName} ({item.subjectCode})
//             </Text>

//             {/* Rating */}
//             <View style={styles.ratingContainer}>
//               {Array.from({ length: 5 }, (_, index) => (
//                 <Ionicons
//                   key={index}
//                   name={index < Math.floor(item.ratings) ? 'star' : 'star-outline'}
//                   size={16}
//                   color="#FFD700"
//                 />
//               ))}
//               <Text style={[styles.reviewCount, { color: currentTheme.textColor }]}>
//                 ({item.numberOfReviews})
//               </Text>
//             </View>

//             {/* Price */}
//             <Text style={[styles.cardPrice, { color: currentTheme.cardTextColor }]}>
//               ${item.price}
//             </Text>
//           </View>
//         </TouchableOpacity>

//         {/* Cart Icon (Add to Cart) */}
//         <TouchableOpacity
//           style={[styles.cartIcon, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => handleAddToCart(item)}
//         >
//           <Ionicons name="cart-outline" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>
//     );
//   };

//   // Compute dynamic card width
//   const getCardWidth = () => {
//     const totalMargin = 20 * (numColumns + 1); // horizontal margin between cards
//     const availableWidth = width - totalMargin;
//     return availableWidth / numColumns;
//   };

//   useEffect(() => {
//     // Sort initially based on default
//     setFilteredData(sortData(products, sortOption));
//     // Cleanup
//     return () => {
//       debouncedFilter.cancel();
//     };
//   }, [products]);

//   return (
//     <View style={[styles.container, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />

//       {/* Optional Custom Header */}
//       <CustomHeader />

//       {/* Header Title Section */}
//       <View style={styles.header}>
//         <LinearGradient
//           colors={currentTheme.headerBackground}
//           style={styles.headerGradient}
//           start={[0, 0]}
//           end={[0, 1]}
//         />
//         <Text style={[styles.title, { color: currentTheme.headerTextColor }]}>
//           Marketplace
//         </Text>
//         <Text style={[styles.subTitle, { color: currentTheme.headerTextColor }]}>
//           Discover amazing exams & study materials
//         </Text>
//       </View>

//       {/* Search & Sort */}
//       <View style={styles.searchSortContainer}>
//         <View style={[styles.searchContainer, { backgroundColor: currentTheme.cardBackground }]}>
//           <Ionicons
//             name="search"
//             size={20} // slightly smaller icon
//             color={currentTheme.placeholderTextColor}
//             style={styles.searchIcon}
//           />
//           <TextInput
//             style={[styles.searchInput, { color: currentTheme.textColor }]}
//             placeholder="Subject, Code, or Exam Name"
//             placeholderTextColor={currentTheme.placeholderTextColor}
//             value={searchQuery}
//             onChangeText={handleSearch}
//             returnKeyType="search"
//             multiline={false}        // ensure single line
//             textAlignVertical="center"
//             numberOfLines={1}       // keep placeholder in one line
//             allowFontScaling={false}
//           />
//         </View>
//         <TouchableOpacity
//           style={[styles.sortButton, { backgroundColor: currentTheme.primaryColor }]}
//           onPress={() => setSortModalVisible(true)}
//         >
//           <MaterialIcons name="sort" size={24} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>

//       {/* Sort Modal */}
//       {sortModalVisible && (
//         <Modal
//           visible={sortModalVisible}
//           animationType="fade"
//           transparent={true}
//           onRequestClose={() => setSortModalVisible(false)}
//         >
//           <View style={styles.modalBackground}>
//             <TouchableWithoutFeedback onPress={() => setSortModalVisible(false)}>
//               <View style={styles.modalOverlay} />
//             </TouchableWithoutFeedback>
//             <View style={[styles.modalContent, { backgroundColor: currentTheme.cardBackground }]}>
//               <Text style={[styles.modalLabel, { color: currentTheme.cardTextColor }]}>
//                 Sort By
//               </Text>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (A-Z)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Name (A-Z)</Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Name (Z-A)')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Name (Z-A)</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (Low to High)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (Low to High)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 style={styles.modalOption}
//                 onPress={() => handleSortOption('Price (High to Low)')}
//               >
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>
//                   Price (High to Low)
//                 </Text>
//               </TouchableOpacity>
//               <TouchableOpacity style={styles.modalOption} onPress={() => handleSortOption('Default')}>
//                 <Text style={[styles.modalOptionText, { color: currentTheme.textColor }]}>Default</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </Modal>
//       )}

//       {/* Loading Overlay */}
//       {loading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color={currentTheme.primaryColor} />
//         </View>
//       )}

//       {/* Error View (Inline) */}
//       {error && !loading && (
//         <View style={styles.errorContainer}>
//           <Text style={[styles.errorText, { color: currentTheme.errorTextColor }]}>{error}</Text>
//           <TouchableOpacity
//             onPress={() => fetchAllProducts()}
//             style={[styles.retryButton, { backgroundColor: currentTheme.primaryColor }]}
//           >
//             <Text style={styles.retryButtonText}>Retry</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* Product List */}
//       {!error && (
//         <FlatList
//           data={filteredData}
//           keyExtractor={(item) => item._id}
//           renderItem={renderItem}
//           contentContainerStyle={[
//             styles.listContent,
//             numColumns === 1 && styles.singleColumnContent,
//             { paddingBottom: 100 } 
//           ]}
//           ListEmptyComponent={
//             !loading && (
//               <View style={styles.emptyContainer}>
//                 <Ionicons
//                   name="search"
//                   size={80}
//                   color={currentTheme.placeholderTextColor}
//                 />
//                 <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//                   No results found.
//                 </Text>
//               </View>
//             )
//           }
//           numColumns={numColumns}
//           showsVerticalScrollIndicator={false}
//           keyboardShouldPersistTaps="handled"
//           key={numColumns}
//           refreshControl={
//             <RefreshControl
//               refreshing={refreshing}
//               onRefresh={() => fetchAllProducts(true)}
//               tintColor={currentTheme.primaryColor}
//             />
//           }
//         />
//       )}

//       {/* Custom Alert */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         icon={alertIcon}
//         onClose={() => setAlertVisible(false)}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default MarketPage;

// /* -------------------------------------------
//    Styles
// ------------------------------------------- */
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   // Header
//   header: {
//     position: 'relative',
//     height: 160,
//     justifyContent: 'center',
//     alignItems: 'center',
//     overflow: 'hidden',
//   },
//   headerGradient: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     zIndex: 1,
//   },
//   subTitle: {
//     fontSize: 14,
//     marginTop: 6,
//     zIndex: 1,
//   },
//   // Search & Sort
//   searchSortContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: -30,
//     marginHorizontal: 20,
//     marginBottom: 10,
//   },
//   searchContainer: {
//     flexDirection: 'row',
//     borderRadius: 30,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//     flex: 1,
//     height: 55,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3.84,
//   },
//   searchIcon: {
//     marginRight: 8,
//   },
//   searchInput: {
//     flex: 1,             // ensures the input can expand
//     minWidth: 0,         // allows placeholder to shrink
//     flexShrink: 1,       // prevents text from truncating
//     fontSize: 14,        // slightly bigger font for clarity
//     lineHeight: 18,      // helps with vertical centering
//     paddingVertical: 0,
//   },
//   sortButton: {
//     marginLeft: 10,
//     padding: 14,
//     borderRadius: 30,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3.84,
//   },
//   // Modal (Sort)
//   modalBackground: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalOverlay: {
//     position: 'absolute',
//     width: '100%',
//     height: '100%',
//     backgroundColor: 'rgba(0,0,0,0.3)',
//   },
//   modalContent: {
//     width: '80%',
//     borderRadius: 15,
//     padding: 20,
//     elevation: 10,
//     alignItems: 'center',
//   },
//   modalLabel: {
//     fontSize: 20,
//     fontWeight: '700',
//     marginBottom: 15,
//   },
//   modalOption: {
//     width: '100%',
//     paddingVertical: 10,
//   },
//   modalOptionText: {
//     fontSize: 16,
//     textAlign: 'center',
//   },
//   // Products List
//   listContent: {
//     paddingBottom: 20,
//     paddingHorizontal: 10,
//     paddingTop: 5,
//   },
//   singleColumnContent: {
//     alignItems: 'center',
//   },
//   // Card
//   card: {
//     borderRadius: 10,
//     marginBottom: 15,
//     marginHorizontal: 10,
//     elevation: 3,
//     minHeight: 300,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3.84,
//   },
//   cardTouchable: {
//     flex: 1,
//   },
//   cardImage: {
//     width: '100%',
//     height: 140,
//   },
//   favoriteIcon: {
//     position: 'absolute',
//     top: 10,
//     right: 10,
//     backgroundColor: 'rgba(255,255,255,0.8)',
//     borderRadius: 20,
//     padding: 5,
//   },
//   cardContent: {
//     padding: 10,
//   },
//   cardTitle: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 3,
//   },
//   cardSubtitle: {
//     fontSize: 14,
//     marginBottom: 5,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   reviewCount: {
//     fontSize: 12,
//     marginLeft: 5,
//   },
//   cardPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginTop: 6,
//   },
//   cartIcon: {
//     position: 'absolute',
//     bottom: 20,
//     right: 10,
//     borderRadius: 20,
//     padding: 8,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 3.84,
//   },
//   // Loading Overlay
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255,255,255,0.4)',
//     zIndex: 999,
//   },
//   // Error
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   errorText: {
//     fontSize: 18,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   retryButton: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   // Empty List
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 50,
//   },
//   emptyText: {
//     fontSize: 18,
//     marginTop: 15,
//   },
// });
