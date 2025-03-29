// src/screens/FavouritesPage.js
import React, { useContext, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import { FavouritesContext } from '../contexts/FavouritesContext';
import CustomAlert from '../components/CustomAlert';



const FavouritesPage = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Favourites Context
  const { favouriteItems, removeFromFavourites, clearFavourites } = useContext(FavouritesContext);

  // CustomAlert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState('');
  const [alertButtons, setAlertButtons] = useState([]);

  // Hide header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Responsive scaling function based on current width
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // Render a single favourite item
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductPage', { productId: item._id })}
      activeOpacity={0.8}
    >
      <View style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.borderColor }]}>
        <Image source={{ uri: item.image }} style={[styles.itemImage, { width: scale(60), height: scale(60) }]} />
        <View style={styles.itemDetails}>
          <Text style={[styles.itemName, { color: currentTheme.cardTextColor, fontSize: scale(16) }]} numberOfLines={1}>
            {item.examName || item.name}
          </Text>
          <Text style={[styles.itemSubtitle, { color: currentTheme.textColor, fontSize: scale(14) }]} numberOfLines={1}>
            {item.subjectName} ({item.subjectCode})
          </Text>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            removeFromFavourites(item._id);
          }}
          accessibilityLabel={`Remove ${item.examName || item.name} from favourites`}
        >
          <Ionicons name="heart-dislike-outline" size={scale(24)} color="#E53935" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Clear all favourites
  const handleClearFavourites = () => {
    setAlertTitle('Clear Favourites');
    setAlertMessage('Are you sure you want to clear all favourite items?');
    setAlertIcon('heart-dislike-outline');
    setAlertButtons([
      { text: 'Cancel', onPress: () => setAlertVisible(false) },
      {
        text: 'Yes',
        onPress: () => {
          clearFavourites();
          setAlertVisible(false);
        },
      },
    ]);
    setAlertVisible(true);
  };

  // Responsive styles using useMemo so they update when dimensions change.
  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        header: {
          width: '100%',
          paddingVertical: scale(10),
          paddingHorizontal: scale(15),
          borderBottomLeftRadius: scale(30),
          borderBottomRightRadius: scale(30),
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(3) },
          shadowOpacity: 0.25,
          shadowRadius: scale(4),
          marginBottom: scale(15),
          alignItems: 'center',
        },
        headerTitleContainer: {
          alignItems: 'center',
        },
        headerTitle: {
          fontSize: scale(26),
          fontWeight: '800',
        },
        headerSubtitle: {
          fontSize: scale(14),
          marginTop: scale(4),
          fontWeight: '500',
        },
        listContent: {
          paddingHorizontal: scale(20),
          paddingBottom: scale(40),
        },
        itemContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: scale(12),
          marginBottom: scale(15),
          borderRadius: scale(12),
          borderWidth: 1,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(1) },
          shadowOpacity: 0.07,
          shadowRadius: scale(2),
        },
        itemImage: {
          borderRadius: scale(12),
          marginRight: scale(12),
        },
        itemDetails: {
          flex: 1,
          marginRight: scale(10),
        },
        itemName: {
          fontWeight: 'bold',
        },
        itemSubtitle: {
          marginTop: scale(2),
        },
        footer: {
          marginTop: scale(15),
          alignItems: 'center',
        },
        clearButton: {
          paddingVertical: scale(12),
          paddingHorizontal: scale(20),
          borderRadius: scale(30),
          elevation: 3,
        },
        clearButtonText: {
          fontSize: scale(16),
          fontWeight: '600',
        },
        emptyContainer: {
          alignItems: 'center',
          marginTop: scale(40),
        },
        emptyText: {
          fontSize: scale(16),
          marginTop: scale(15),
          textAlign: 'center',
          paddingHorizontal: scale(20),
        },
      }),
    [scaleFactor, width]
  );

  return (
    <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <StatusBar
        backgroundColor={currentTheme.headerBackground[0]}
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
      />
      <LinearGradient
        colors={currentTheme.headerBackground}
        style={[styles.header, { paddingTop: insets.top + scale(10) }]}
        start={[0, 0]}
        end={[0, 1]}
      >
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
            Your Favourites
          </Text>
          <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
            Browse your saved items
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={favouriteItems}
        keyExtractor={(item) => item._id.toString()}
        renderItem={renderItem}
        contentContainerStyle={[styles.listContent, { paddingBottom: scale(100) }]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={scale(80)} color={currentTheme.placeholderTextColor} />
            <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
              You have no favourite items.
            </Text>
          </View>
        }
        ListFooterComponent={
          favouriteItems.length > 0 && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: currentTheme.primaryColor }]}
                onPress={handleClearFavourites}
              >
                <Text style={[styles.clearButtonText, { color: currentTheme.buttonTextColor }]}>
                  Clear Favourites
                </Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        icon={alertIcon}
        buttons={alertButtons}
      />
    </View>
  );
};

export default FavouritesPage;










// // src/screens/FavouritesPage.js
// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomAlert from '../components/CustomAlert';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';


// const FavouritesPage = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   const insets = useSafeAreaInsets();

//   // Favourites
//   const { favouriteItems, removeFromFavourites, clearFavourites } = useContext(FavouritesContext);

//   // CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Hide header
//   useEffect(() => {
//     navigation.setOptions({ headerShown: false });
//   }, [navigation]);

//   // Render single favourite item
//   // const renderItem = ({ item }) => (
//   //   <View style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.borderColor }]}>
//   //     <Image source={{ uri: item.image }} style={styles.itemImage} />
//   //     <View style={styles.itemDetails}>
//   //       <Text style={[styles.itemName, { color: currentTheme.cardTextColor }]} numberOfLines={1}>
//   //         {item.examName || item.name}
//   //       </Text>
//   //       <Text style={[styles.itemSubtitle, { color: currentTheme.textColor }]} numberOfLines={1}>
//   //         {item.subjectName} ({item.subjectCode})
//   //       </Text>
//   //     </View>
//   //     <TouchableOpacity
//   //       onPress={() => removeFromFavourites(item._id)}
//   //       accessibilityLabel={`Remove ${item.examName || item.name} from favourites`}
//   //     >
//   //       <Ionicons name="heart-dislike-outline" size={24} color="#E53935" />
//   //     </TouchableOpacity>
//   //   </View>
//   // );
//   const renderItem = ({ item }) => (
//     <TouchableOpacity
//       onPress={() => navigation.navigate('ProductPage', { productId: item._id })}
//       activeOpacity={0.8} // tweak as desired
//     >
//       <View style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground, borderColor: currentTheme.borderColor }]}>
//         <Image source={{ uri: item.image }} style={styles.itemImage} />
//         <View style={styles.itemDetails}>
//           <Text style={[styles.itemName, { color: currentTheme.cardTextColor }]} numberOfLines={1}>
//             {item.examName || item.name}
//           </Text>
//           <Text style={[styles.itemSubtitle, { color: currentTheme.textColor }]} numberOfLines={1}>
//             {item.subjectName} ({item.subjectCode})
//           </Text>
//         </View>
//         <TouchableOpacity
//           onPress={(e) => {
//             // Prevent the card's onPress from firing when removing favourite
//             e.stopPropagation();
//             removeFromFavourites(item._id);
//           }}
//           accessibilityLabel={`Remove ${item.examName || item.name} from favourites`}
//         >
//           <Ionicons name="heart-dislike-outline" size={24} color="#E53935" />
//         </TouchableOpacity>
//       </View>
//     </TouchableOpacity>
//   );
  

//   // Clear all favourites
//   const handleClearFavourites = () => {
//     setAlertTitle('Clear Favourites');
//     setAlertMessage('Are you sure you want to clear all favourite items?');
//     setAlertIcon('heart-dislike-outline');
//     setAlertButtons([
//       { text: 'Cancel', onPress: () => setAlertVisible(false), backgroundColor: '#AAAAAA' },
//       {
//         text: 'Yes',
//         onPress: () => {
//           clearFavourites();
//           setAlertVisible(false);
//         },
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[0]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={[styles.header,{paddingTop: insets.top + 10}]}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Your Favourites
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Browse your saved items
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Favourites List */}
//       <FlatList
//         data={favouriteItems}
//         keyExtractor={(item) => item._id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="heart-outline" size={80} color={currentTheme.placeholderTextColor} />
//             <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//               You have no favourite items.
//             </Text>
//           </View>
//         }
//         // Footer with Clear button
//         ListFooterComponent={
//           favouriteItems.length > 0 && (
//             <View style={styles.footer}>
//               <TouchableOpacity
//                 style={[styles.clearButton, { backgroundColor: currentTheme.primaryColor }]}
//                 onPress={handleClearFavourites}
//               >
//                 <Text style={[styles.clearButtonText, { color: currentTheme.buttonTextColor }]}>Clear Favourites</Text>
//               </TouchableOpacity>
//             </View>
//           )
//         }
//       />

//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         onClose={() => setAlertVisible(false)}
//         icon={alertIcon}
//         buttons={alertButtons}
//       />
//     </View>
//   );
// };

// export default FavouritesPage;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   header: {
//     width: '100%',
//     paddingVertical: 10,
//     paddingHorizontal: 15,
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.25,
//     shadowRadius: 4,
//     marginBottom: 15,
//     alignItems: 'center',
//   },
//   headerTitleContainer: {
//     alignItems: 'center',
//   },
//   headerTitle: {
//     fontSize: 26,
//     fontWeight: '800',
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     marginTop: 4,
//     fontWeight: '500',
//   },
//   listContent: {
//     paddingHorizontal: 20,
//     paddingBottom: 40,
//   },
//   itemContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 12,
//     marginBottom: 15,
//     borderRadius: 12,
//     borderWidth: 1,
//     // borderColor: '#E0E0E0',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.07,
//     shadowRadius: 2,
//   },
//   itemImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 12,
//     marginRight: 12,
//   },
//   itemDetails: {
//     flex: 1,
//     marginRight: 10,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   itemSubtitle: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   footer: {
//     marginTop: 15,
//     alignItems: 'center',
//   },
//   clearButton: {
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 30,
//     elevation: 3,
//   },
//   clearButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     marginTop: 40,
//   },
//   emptyText: {
//     fontSize: 16,
//     marginTop: 15,
//     textAlign: 'center',
//     paddingHorizontal: 20,
//   },
// });









// // src/screens/FavouritesPage.js

// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomAlert from '../components/CustomAlert';

// const { width } = Dimensions.get('window');

// const FavouritesPage = () => {
//   const navigation = useNavigation();

//   // Theme
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Favourites
//   const { favouriteItems, removeFromFavourites, clearFavourites } =
//     useContext(FavouritesContext);

//   // CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Hide header
//   useEffect(() => {
//     navigation.setOptions({ headerShown: false });
//   }, [navigation]);

//   // Render single favourite item
//   const renderItem = ({ item }) => (
//     <View style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground }]}>
//       <Image source={{ uri: item.image }} style={styles.itemImage} />
//       <View style={styles.itemDetails}>
//         <Text style={[styles.itemName, { color: currentTheme.cardTextColor }]}>{item.examName}</Text>
//         <Text style={[styles.itemSubtitle, { color: currentTheme.textColor }]}>
//           {item.subjectName} ({item.subjectCode})
//         </Text>
//       </View>
//       <TouchableOpacity
//         onPress={() => removeFromFavourites(item._id)}
//         accessibilityLabel={`Remove ${item.examName} from favourites`}
//       >
//         <Ionicons name="heart-dislike-outline" size={24} color="#E53935" />
//       </TouchableOpacity>
//     </View>
//   );

//   // Clear all favourites
//   const handleClearFavourites = () => {
//     setAlertTitle('Clear Favourites');
//     setAlertMessage('Are you sure you want to clear all favourite items?');
//     setAlertIcon('heart-dislike-outline');
//     setAlertButtons([
//       { text: 'Cancel', onPress: () => setAlertVisible(false), backgroundColor: '#AAAAAA' },
//       {
//         text: 'Yes',
//         onPress: () => {
//           clearFavourites();
//           setAlertVisible(false);
//         },
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Unified Curved Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Your Favourites
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Browse your favourite items
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Favourites List with Footer as part of scroll */}
//       <FlatList
//         data={favouriteItems}
//         keyExtractor={(item) => item._id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]} // extra bottom padding
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="heart-outline" size={80} color={currentTheme.placeholderTextColor} />
//             <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//               You have no favourite items.
//             </Text>
//           </View>
//         }
//         ListFooterComponent={
//           favouriteItems.length > 0 && (
//             <View style={styles.footer}>
//               <TouchableOpacity
//                 style={[styles.clearButton, { backgroundColor: currentTheme.primaryColor }]}
//                 onPress={handleClearFavourites}
//               >
//                 <Text style={[styles.clearButtonText, { color: '#FFFFFF' }]}>
//                   Clear Favourites
//                 </Text>
//               </TouchableOpacity>
//             </View>
//           )
//         }
//       />

//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         onClose={() => setAlertVisible(false)}
//         icon={alertIcon}
//         buttons={alertButtons}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safeArea: { flex: 1 },
//   header: {
//     width: '100%',
//     paddingVertical: 8,
//     paddingHorizontal: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 30,
//     borderBottomRightRadius: 30,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 0.3,
//     shadowRadius: 4,
//   },
//   headerTitleContainer: { alignItems: 'center' },
//   headerTitle: { fontSize: 22, fontWeight: '700' },
//   headerSubtitle: { fontSize: 14, marginTop: 4 },
//   listContent: { padding: 20, paddingBottom: 100 },
//   itemContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 10,
//     marginBottom: 15,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#E0E0E0',
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//   },
//   itemImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
//   itemDetails: { flex: 1 },
//   itemName: { fontSize: 16, fontWeight: 'bold' },
//   itemSubtitle: { fontSize: 14, marginTop: 2 },
//   footer: { marginTop: 20, alignItems: 'center' },
//   clearButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30 },
//   clearButtonText: { fontSize: 16, fontWeight: 'bold' },
//   emptyContainer: { alignItems: 'center', marginTop: 50 },
//   emptyText: { fontSize: 16, marginTop: 15, textAlign: 'center' },
// });

// export default FavouritesPage;











// // src/screens/FavouritesPage.js

// import React, { useContext, useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext } from '../contexts/FavouritesContext';
// import CustomAlert from '../components/CustomAlert'; // Import CustomAlert

// const { width, height } = Dimensions.get('window');

// const FavouritesPage = () => {
//   const navigation = useNavigation();

//   // Access theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Access favourites context
//   const { favouriteItems, removeFromFavourites, clearFavourites } = useContext(FavouritesContext);

//   // State for controlling the CustomAlert
//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertTitle, setAlertTitle] = useState('');
//   const [alertMessage, setAlertMessage] = useState('');
//   const [alertIcon, setAlertIcon] = useState('');
//   const [alertButtons, setAlertButtons] = useState([]);

//   // Hide the default header provided by React Navigation
//   useEffect(() => {
//     navigation.setOptions({
//       headerShown: false,
//     });
//   }, [navigation]);

//   // Render individual favourite item
//   const renderItem = ({ item }) => (
//     <View style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground }]}>
//       <Image source={{ uri: item.image }} style={styles.itemImage} />
//       <View style={styles.itemDetails}>
//         <Text style={[styles.itemName, { color: currentTheme.cardTextColor }]}>
//           {item.examName}
//         </Text>
//         <Text style={[styles.itemSubtitle, { color: currentTheme.textColor }]}>
//           {item.subjectName} ({item.subjectCode})
//         </Text>
//       </View>
//       <TouchableOpacity
//         onPress={() => removeFromFavourites(item._id)}
//         accessibilityLabel={`Remove ${item.examName} from favourites`}
//         accessibilityRole="button"
//       >
//         <Ionicons name="heart-dislike-outline" size={24} color="#E53935" />
//       </TouchableOpacity>
//     </View>
//   );

//   const handleClearFavourites = () => {
//     setAlertTitle('Clear Favourites');
//     setAlertMessage('Are you sure you want to clear all favourite items?');
//     setAlertIcon('heart-dislike-outline');
//     setAlertButtons([
//       {
//         text: 'Cancel',
//         onPress: () => setAlertVisible(false),
//         backgroundColor: '#AAAAAA',
//       },
//       {
//         text: 'Yes',
//         onPress: () => {
//           clearFavourites();
//           setAlertVisible(false);
//         },
//       },
//     ]);
//     setAlertVisible(true);
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         {/* Header Title and Subtitle */}
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Your Favourites
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Browse your favourite items
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Favourite Items List */}
//       <FlatList
//         data={favouriteItems}
//         keyExtractor={(item) => item._id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons
//               name="heart-outline"
//               size={80}
//               color={currentTheme.placeholderTextColor}
//             />
//             <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//               You have no favourite items.
//             </Text>
//           </View>
//         }
//       />

//       {/* Clear Favourites Button */}
//       {favouriteItems.length > 0 && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={[styles.clearButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={handleClearFavourites}
//             accessibilityLabel="Clear Favourites"
//             accessibilityRole="button"
//           >
//             <Text style={[styles.clearButtonText, { color: '#FFFFFF' }]}>Clear Favourites</Text>
//           </TouchableOpacity>
//         </View>
//       )}

//       {/* CustomAlert Component */}
//       <CustomAlert
//         visible={alertVisible}
//         title={alertTitle}
//         message={alertMessage}
//         onClose={() => setAlertVisible(false)}
//         icon={alertIcon}
//         buttons={alertButtons}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//     safeArea: {
//       flex: 1,
//     },
//     header: {
//       width: '100%',
//       paddingVertical: 5,
//       paddingHorizontal: 15,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       elevation: 4,
//       shadowColor: '#000',
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       shadowOpacity: 0.25,
//       shadowRadius: 3.84,
//     },
//     backButton: {
//       position: 'absolute',
//       left: 15,
//       top: 10,
//       padding: 8,
//     },
//     headerTitleContainer: {
//       alignItems: 'center',
//     },
//     headerTitle: {
//       fontSize: 24,
//       fontWeight: '700',
//     },
//     headerSubtitle: {
//       fontSize: 16,
//       fontWeight: '400',
//       marginTop: 4,
//     },
//     listContent: {
//       padding: 20,
//       paddingBottom: 100,
//     },
//     itemContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 10,
//       marginBottom: 15,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: '#E0E0E0',
//     },
//     itemImage: {
//       width: 60,
//       height: 60,
//       borderRadius: 10,
//       marginRight: 10,
//     },
//     itemDetails: {
//       flex: 1,
//     },
//     itemName: {
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     itemSubtitle: {
//       fontSize: 14,
//       color: '#757575',
//     },
//     footer: {
//       position: 'absolute',
//       bottom: 0,
//       width: '100%',
//       padding: 15,
//       alignItems: 'center',
//     },
//     clearButton: {
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       borderRadius: 30,
//     },
//     clearButtonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     emptyContainer: {
//       alignItems: 'center',
//       marginTop: 50,
//     },
//     emptyText: {
//       fontSize: 18,
//       marginTop: 15,
//     },
//   });


// export default FavouritesPage;















// // src/screens/FavouritesPage.js

// import React, { useContext, useEffect } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
//   SafeAreaView,
//   Alert,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import { FavouritesContext } from '../contexts/FavouritesContext';

// const { width, height } = Dimensions.get('window');

// const FavouritesPage = () => {
//   const navigation = useNavigation();

//   // Access theme from context
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Access favourites context
//   const { favouriteItems, removeFromFavourites, clearFavourites } = useContext(FavouritesContext);

//   // Hide the default header provided by React Navigation
//   useEffect(() => {
//     navigation.setOptions({
//       headerShown: false,
//     });
//   }, [navigation]);

//   // Render individual favourite item
//   const renderItem = ({ item }) => (
//     <View style={[styles.itemContainer, { backgroundColor: currentTheme.cardBackground }]}>
//       <Image source={{ uri: item.image }} style={styles.itemImage} />
//       <View style={styles.itemDetails}>
//         <Text style={[styles.itemName, { color: currentTheme.cardTextColor }]}>
//           {item.examName}
//         </Text>
//         <Text style={[styles.itemSubtitle, { color: currentTheme.textColor }]}>
//           {item.subjectName} ({item.subjectCode})
//         </Text>
//       </View>
//       <TouchableOpacity
//         onPress={() => removeFromFavourites(item._id)}
//         accessibilityLabel={`Remove ${item.examName} from favourites`}
//         accessibilityRole="button"
//       >
//         <Ionicons name="heart-dislike-outline" size={24} color="#E53935" />
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <StatusBar
//         backgroundColor={currentTheme.headerBackground[1]}
//         barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//       />
//       {/* Header */}
//       <LinearGradient
//         colors={currentTheme.headerBackground}
//         style={styles.header}
//         start={[0, 0]}
//         end={[0, 1]}
//       >
//         {/* Back Button */}
//         {/* <TouchableOpacity
//           style={styles.backButton}
//           onPress={() => navigation.goBack()}
//           accessibilityLabel="Go Back"
//           accessibilityRole="button"
//         >
//           <Ionicons name="arrow-back" size={24} color={currentTheme.headerTextColor} />
//         </TouchableOpacity> */}

//         {/* Header Title and Subtitle */}
//         <View style={styles.headerTitleContainer}>
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Your Favourites
//           </Text>
//           <Text style={[styles.headerSubtitle, { color: currentTheme.headerTextColor }]}>
//             Browse your favourite items
//           </Text>
//         </View>
//       </LinearGradient>

//       {/* Favourite Items List */}
//       <FlatList
//         data={favouriteItems}
//         keyExtractor={(item) => item._id.toString()}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons
//               name="heart-outline"
//               size={80}
//               color={currentTheme.placeholderTextColor}
//             />
//             <Text style={[styles.emptyText, { color: currentTheme.textColor }]}>
//               You have no favourite items.
//             </Text>
//           </View>
//         }
//       />

//       {/* Clear Favourites Button */}
//       {favouriteItems.length > 0 && (
//         <View style={styles.footer}>
//           <TouchableOpacity
//             style={[styles.clearButton, { backgroundColor: currentTheme.primaryColor }]}
//             onPress={() => {
//               Alert.alert(
//                 'Clear Favourites',
//                 'Are you sure you want to clear all favourite items?',
//                 [
//                   { text: 'Cancel', style: 'cancel' },
//                   { text: 'Yes', onPress: () => clearFavourites() },
//                 ],
//                 { cancelable: true }
//               );
//             }}
//             accessibilityLabel="Clear Favourites"
//             accessibilityRole="button"
//           >
//             <Text style={[styles.clearButtonText, { color: '#FFFFFF' }]}>Clear Favourites</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };

// // Styles for the components
// const styles = StyleSheet.create({
//     safeArea: {
//       flex: 1,
//     },
//     header: {
//       width: '100%',
//       paddingVertical: 5,
//       paddingHorizontal: 15,
//       flexDirection: 'row',
//       alignItems: 'center',
//       justifyContent: 'center',
//       elevation: 4,
//       shadowColor: '#000',
//       shadowOffset: {
//         width: 0,
//         height: 2,
//       },
//       shadowOpacity: 0.25,
//       shadowRadius: 3.84,
//     },
//     backButton: {
//       position: 'absolute',
//       left: 15,
//       top: 10,
//       padding: 8,
//     },
//     headerTitleContainer: {
//       alignItems: 'center',
//     },
//     headerTitle: {
//       fontSize: 24,
//       fontWeight: '700',
//     },
//     headerSubtitle: {
//       fontSize: 16,
//       fontWeight: '400',
//       marginTop: 4,
//     },
//     listContent: {
//       padding: 20,
//       paddingBottom: 100,
//     },
//     itemContainer: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       padding: 10,
//       marginBottom: 15,
//       borderRadius: 10,
//       borderWidth: 1,
//       borderColor: '#E0E0E0',
//     },
//     itemImage: {
//       width: 60,
//       height: 60,
//       borderRadius: 10,
//       marginRight: 10,
//     },
//     itemDetails: {
//       flex: 1,
//     },
//     itemName: {
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     itemSubtitle: {
//       fontSize: 14,
//       color: '#757575',
//     },
//     footer: {
//       position: 'absolute',
//       bottom: 0,
//       width: '100%',
//       padding: 15,
//       alignItems: 'center',
//     },
//     clearButton: {
//       paddingVertical: 10,
//       paddingHorizontal: 20,
//       borderRadius: 30,
//     },
//     clearButtonText: {
//       fontSize: 16,
//       fontWeight: 'bold',
//     },
//     emptyContainer: {
//       alignItems: 'center',
//       marginTop: 50,
//     },
//     emptyText: {
//       fontSize: 18,
//       marginTop: 15,
//     },
//   });

// export default FavouritesPage;
