// src/screens/HelpScreen.js
import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';
import DynamicContentPopup from '../components/DynamicContentPopup';
import { useDispatch } from 'react-redux';
import { fetchPolicyThunk } from '../store/slices/policySlice';



const HelpScreen = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  const dispatch = useDispatch();

  // Dynamic scaling function
  const baseWidth = width > 375 ? 460 : 500;
  const scale = (size) => (size * width) / baseWidth;

  // State for dynamic content popup (for FAQ, Contact, Terms & Privacy)
  const [policyPopupVisible, setPolicyPopupVisible] = useState(false);
  const [policyType, setPolicyType] = useState('');

  const handleFAQPress = () => {
    setPolicyType('faq');
    setPolicyPopupVisible(true);
  };

  const handleContactUsPress = () => {
    setPolicyType('contact');
    setPolicyPopupVisible(true);
  };

  const handleTermsPress = () => {
    setPolicyType('terms');
    setPolicyPopupVisible(true);
  };

  const handlePrivacyPress = () => {
    setPolicyType('privacy');
    setPolicyPopupVisible(true);
  };

  const fetchContentWithRedux = (type) => {
    return dispatch(fetchPolicyThunk(type)).unwrap();
  };

  // Responsive styles computed with useMemo
  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
        },
        scrollContainer: {
          paddingBottom: scale(30),
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
        cardsContainer: {
          marginHorizontal: scale(20),
        },
        card: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: scale(13),
          paddingHorizontal: scale(16),
          borderWidth: 1,
          borderRadius: scale(16),
          marginBottom: scale(15),
          elevation: 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: scale(2) },
          shadowOpacity: 0.15,
          shadowRadius: scale(3),
          backgroundColor: currentTheme.cardBackground,
          borderColor: currentTheme.borderColor,
        },
        cardRow: {
          flexDirection: 'row',
          alignItems: 'center',
        },
        cardText: {
          fontSize: scale(16),
          fontWeight: '500',
          flexShrink: 1,
        },
        icon: {
          marginRight: scale(15),
        },
      }),
    [width, currentTheme]
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
            Help & Support
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.card}
            onPress={handleFAQPress}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <Ionicons name="help-circle" size={scale(24)} color={currentTheme.primaryColor} style={styles.icon} />
              <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
                Frequently Asked Questions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(24)} color={currentTheme.placeholderTextColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={handleContactUsPress}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <Ionicons name="mail" size={scale(24)} color={currentTheme.primaryColor} style={styles.icon} />
              <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
                Contact Us
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(24)} color={currentTheme.placeholderTextColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={handleTermsPress}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <Ionicons name="document-text" size={scale(24)} color={currentTheme.primaryColor} style={styles.icon} />
              <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
                Terms & Conditions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(24)} color={currentTheme.placeholderTextColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={handlePrivacyPress}
            activeOpacity={0.8}
          >
            <View style={styles.cardRow}>
              <Ionicons name="lock-closed" size={scale(24)} color={currentTheme.primaryColor} style={styles.icon} />
              <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
                Privacy Policy
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={scale(24)} color={currentTheme.placeholderTextColor} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Dynamic Content Popup for FAQ, Contact, Terms & Privacy */}
      <DynamicContentPopup
        type={policyType}
        visible={policyPopupVisible}
        onClose={() => setPolicyPopupVisible(false)}
        themeStyles={currentTheme}
        headerBackground={currentTheme.headerBackground}
        headerTextColor={currentTheme.headerTextColor}
        fetchContent={fetchContentWithRedux}
      />
    </View>
  );
};

export default HelpScreen;







// // src/screens/HelpScreen.js
// import React, { useContext, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   StatusBar
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import DynamicContentPopup from '../components/DynamicContentPopup';
// // import { fetchPolicy } from '../services/api';
// import { useDispatch } from 'react-redux';
// import { fetchPolicyThunk } from '../store/slices/policySlice';


// const HelpScreen = () => {
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;
//   const dispatch = useDispatch();

//   const insets = useSafeAreaInsets();

//   // State for dynamic content popup (for FAQ, Contact, Terms & Privacy)
//   const [policyPopupVisible, setPolicyPopupVisible] = useState(false);
//   const [policyType, setPolicyType] = useState('');

//   const handleFAQPress = () => {
//     setPolicyType('faq');
//     setPolicyPopupVisible(true);
//   };

//   const handleContactUsPress = () => {
//     setPolicyType('contact');
//     setPolicyPopupVisible(true);
//   };

//   const handleTermsPress = () => {
//     setPolicyType('terms');
//     setPolicyPopupVisible(true);
//   };

//   const handlePrivacyPress = () => {
//     setPolicyType('privacy');
//     setPolicyPopupVisible(true);
//   };

//   const fetchContentWithRedux = (type) => {
//     return dispatch(fetchPolicyThunk(type)).unwrap();
//   };

//   return (
//     <View style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//         <StatusBar
//           backgroundColor={currentTheme.headerBackground[0]}
//           barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
//         />
//         <LinearGradient
//           colors={currentTheme.headerBackground}
//           style={[styles.header, { paddingTop: insets.top + 10 }]}
//           start={[0, 0]}
//           end={[0, 1]}
//         >
//           <Text style={[styles.headerTitle, { color: currentTheme.headerTextColor }]}>
//             Help & Support
//           </Text>
//         </LinearGradient>

//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <View style={styles.cardsContainer}>
//           <TouchableOpacity
//             style={[styles.card, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}
//             onPress={handleFAQPress}
//             activeOpacity={0.8}
//           >
//             <View style={styles.cardRow}>
//               <Ionicons name="help-circle" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 Frequently Asked Questions
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.card, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}
//             onPress={handleContactUsPress}
//             activeOpacity={0.8}
//           >
//             <View style={styles.cardRow}>
//               <Ionicons name="mail" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>Contact Us</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.card, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}
//             onPress={handleTermsPress}
//             activeOpacity={0.8}
//           >
//             <View style={styles.cardRow}>
//               <Ionicons name="document-text" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 Terms & Conditions
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.card, { borderColor: currentTheme.borderColor, backgroundColor: currentTheme.cardBackground }]}
//             onPress={handlePrivacyPress}
//             activeOpacity={0.8}
//           >
//             <View style={styles.cardRow}>
//               <Ionicons name="lock-closed" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 Privacy Policy
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Dynamic Content Popup for FAQ, Contact, Terms & Privacy */}
//       <DynamicContentPopup
//         type={policyType}
//         visible={policyPopupVisible}
//         onClose={() => setPolicyPopupVisible(false)}
//         themeStyles={currentTheme}
//         headerBackground={currentTheme.headerBackground}
//         headerTextColor={currentTheme.headerTextColor}
//         fetchContent={fetchContentWithRedux}
//       />
//     </View>
//   );
// };

// export default HelpScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   scrollContainer: {
//     paddingBottom: 30,
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
//   cardsContainer: {
//     marginHorizontal: 20,
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 13,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderRadius: 16,
//     marginBottom: 15,
//     // backgroundColor: 'rgba(255,255,255,0.95)',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   cardRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cardText: {
//     fontSize: 16,
//     fontWeight: '500',
//     flexShrink: 1,
//   },
//   icon: {
//     marginRight: 15,
//   },
// });









// // src/screens/HelpScreen.js
// import React, { useContext, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   Animated,
//   Dimensions,
//   Modal,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';
// import DynamicContentPopup from '../components/DynamicContentPopup'; // updated import
// import { fetchPolicy } from '../services/api';

// const { width, height } = Dimensions.get('window');

// // Reusable Help Modal Component (for FAQ and Contact Us)
// const HelpModal = ({
//   visible,
//   onClose,
//   title,
//   description,
//   themeStyles,
//   headerBackground,
//   headerTextColor,
// }) => {
//   return (
//     <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
//       <View style={styles.modalBackground}>
//         <View style={[styles.modalContainer, { backgroundColor: themeStyles.cardBackground }]}>
//           <LinearGradient
//             colors={headerBackground}
//             style={styles.modalHeader}
//             start={[0, 0]}
//             end={[1, 0]}
//           >
//             <Text style={[styles.modalTitle, { color: headerTextColor }]}>{title}</Text>
//             <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
//               <Ionicons name="close" size={24} color={headerTextColor} />
//             </TouchableOpacity>
//           </LinearGradient>
//           <ScrollView contentContainerStyle={styles.modalBodyContent} showsVerticalScrollIndicator={false}>
//             <Text style={[styles.modalDescription, { color: themeStyles.textColor }]}>{description}</Text>
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const HelpScreen = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation refs (for potential future use)
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const colorAnim = useRef(new Animated.Value(0)).current;

//   // State for static modal (FAQ & Contact Us)
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalTitle, setModalTitle] = useState('');
//   const [modalDescription, setModalDescription] = useState('');

//   // New state for dynamic content popup (for Terms & Privacy)
//   const [policyPopupVisible, setPolicyPopupVisible] = useState(false);
//   const [policyType, setPolicyType] = useState('');

//   const openModal = (title, description) => {
//     setModalTitle(title);
//     setModalDescription(description);
//     setModalVisible(true);
//   };

//   const closeModal = () => setModalVisible(false);

//   const handleFAQPress = () => {
//     setPolicyType('faq');
//     setPolicyPopupVisible(true);
//   };

//   const handleContactUsPress = () => {
//     setPolicyType('contact');
//     setPolicyPopupVisible(true);
//   };

//   // Dynamic popup handlers for Terms & Privacy
//   const handleTermsPress = () => {
//     setPolicyType('terms');
//     setPolicyPopupVisible(true);
//   };

//   const handlePrivacyPress = () => {
//     setPolicyType('privacy');
//     setPolicyPopupVisible(true);
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         <LinearGradient
//           colors={currentTheme.headerBackground}
//           style={styles.uniqueHeader}
//           start={[0, 0]}
//           end={[1, 1]}
//         >
//           <Text style={[styles.uniqueHeaderTitle, { color: currentTheme.headerTextColor }]}>
//             Help & Support
//           </Text>
//         </LinearGradient>

//         <View style={styles.cardsContainer}>
//           <TouchableOpacity
//             style={[styles.card, { borderColor: currentTheme.borderColor }]}
//             onPress={handleFAQPress}
//             activeOpacity={0.8}
//           >
//             <View style={styles.cardRow}>
//               <Ionicons name="help-circle" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 Frequently Asked Questions
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.card, { borderColor: currentTheme.borderColor }]}
//             onPress={handleContactUsPress}
//             activeOpacity={0.8}
//           >
//             <View style={styles.cardRow}>
//               <Ionicons name="mail" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>Contact Us</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.card, { borderColor: currentTheme.borderColor }]}
//             onPress={handleTermsPress}
//             activeOpacity={0.8}
//           >
//             <View style={styles.cardRow}>
//               <Ionicons name="document-text" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 Terms & Conditions
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.card, { borderColor: currentTheme.borderColor }]}
//             onPress={handlePrivacyPress}
//             activeOpacity={0.8}
//           >
//             <View style={styles.cardRow}>
//               <Ionicons name="lock-closed" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>
//                 Privacy Policy
//               </Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Static HelpModal for FAQ & Contact Us */}
//       {/* <HelpModal
//         visible={modalVisible}
//         onClose={closeModal}
//         title={modalTitle}
//         description={modalDescription}
//         themeStyles={currentTheme}
//         headerBackground={currentTheme.headerBackground}
//         headerTextColor={currentTheme.headerTextColor}
//       /> */}

//       {/* Dynamic Content Popup for Terms & Privacy */}
//       <DynamicContentPopup
//         type={policyType}
//         visible={policyPopupVisible}
//         onClose={() => setPolicyPopupVisible(false)}
//         themeStyles={currentTheme}
//         headerBackground={currentTheme.headerBackground}
//         headerTextColor={currentTheme.headerTextColor}
//         fetchContent={fetchPolicy}
//       />
//     </SafeAreaView>
//   );
// };

// export default HelpScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   scrollContainer: {
//     paddingBottom: 30,
//   },
//   uniqueHeader: {
//     width: '100%',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     marginBottom: 25,
//   },
//   uniqueHeaderTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//   },
//   cardsContainer: {
//     marginHorizontal: 20,
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 13,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderRadius: 16,
//     marginBottom: 15,
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   cardRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cardText: {
//     fontSize: 16,
//     fontWeight: '500',
//     flexShrink: 1,
//   },
//   icon: {
//     marginRight: 15,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     maxHeight: height * 0.8,
//     borderRadius: 20,
//     padding: 20,
//     elevation: 6,
//   },
//   modalHeader: {
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     flex: 1,
//     textAlign: 'left',
//   },
//   modalCloseButton: {
//     padding: 8,
//     borderRadius: 20,
//   },
//   modalBodyContent: {
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   modalDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//   },
// });







// // src/screens/HelpScreen.js

// import React, { useContext, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   SafeAreaView,
//   Animated,
//   Modal,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { LinearGradient } from 'expo-linear-gradient';

// import { ThemeContext } from '../../ThemeContext';
// import { lightTheme, darkTheme } from '../../themes';

// const { width, height } = Dimensions.get('window');

// // Reusable Help Modal Component with invisible scrollbar
// const HelpModal = ({
//   visible,
//   onClose,
//   title,
//   description,
//   themeStyles,
//   headerBackground,
//   headerTextColor,
// }) => {
//   return (
//     <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
//       <View style={styles.modalBackground}>
//         <View style={[styles.modalContainer, { backgroundColor: themeStyles.cardBackground }]}>
//           {/* Modal Header */}
//           <LinearGradient
//             colors={headerBackground}
//             style={styles.modalHeader}
//             start={[0, 0]}
//             end={[1, 0]}
//           >
//             <Text style={[styles.modalTitle, { color: headerTextColor }]}>{title}</Text>
//             <TouchableOpacity
//               onPress={onClose}
//               style={styles.modalCloseButton}
//               accessibilityLabel="Close Popup"
//               accessibilityRole="button"
//             >
//               <Ionicons name="close" size={24} color={headerTextColor} />
//             </TouchableOpacity>
//           </LinearGradient>
//           {/* Modal Body with scrollbar hidden */}
//           <ScrollView contentContainerStyle={styles.modalBodyContent} showsVerticalScrollIndicator={false}>
//             <Text style={[styles.modalDescription, { color: themeStyles.textColor }]}>{description}</Text>
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const HelpScreen = () => {
//   const navigation = useNavigation();
//   const { theme } = useContext(ThemeContext);
//   const currentTheme = theme === 'light' ? lightTheme : darkTheme;

//   // Animation refs (for potential future use)
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const rotateAnim = useRef(new Animated.Value(0)).current;
//   const colorAnim = useRef(new Animated.Value(0)).current;

//   // State for modal popup
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalTitle, setModalTitle] = useState('');
//   const [modalDescription, setModalDescription] = useState('');

//   // Open modal with provided content
//   const openModal = (title, description) => {
//     setModalTitle(title);
//     setModalDescription(description);
//     setModalVisible(true);
//   };

//   const closeModal = () => setModalVisible(false);

//   // Handlers for each Help Option
//   const handleFAQPress = () => {
//     const faqContent = `
// Frequently Asked Questions:

// 1. How do I register?
//    - Go to our sign-up page, fill in your details, and verify your email.

// 2. How can I reset my password?
//    - Click on "Forgot Password" and follow the instructions.

// 3. What payment methods do you accept?
//    - We accept credit cards, PayPal, and more.

// More details coming soon.
//     `;
//     openModal('Frequently Asked Questions', faqContent);
//   };

//   const handleContactUsPress = () => {
//     const contactContent = `
// Contact Us:

// • Email: Idri.gueye@gmail.com
// • Phone (US): 1-800-123-4567
// • Phone (International): +1-234-567-8900

// Our support team is available Monday to Friday, 9 AM - 6 PM (EST).
//     `;
//     openModal('Contact Us', contactContent);
//   };

//   const handleTermsPress = () => {
//     const termsContent = `
// Terms and Conditions:

// 1. Eligibility: You must be 18+ or have parental consent.
// 2. Service Usage: Do not use our service for illegal activities.
// 3. Intellectual Property: All content is owned by House Of Cert.
// 4. Liability: We assume no liability for damages.
// 5. Modifications: Terms may be updated periodically.
//     `;
//     openModal('Terms & Conditions', termsContent);
//   };

//   const handlePrivacyPress = () => {
//     const privacyContent = `
// Privacy Policy:

// We value your privacy. We collect personal data only as necessary, use it to enhance our service, and secure it with robust measures.
//     `;
//     openModal('Privacy Policy', privacyContent);
//   };

//   return (
//     <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
//       <ScrollView contentContainerStyle={styles.scrollContainer}>
//         {/* Unique Gradient Header */}
//         <LinearGradient
//           colors={currentTheme.headerBackground}
//           style={styles.uniqueHeader}
//           start={[0, 0]}
//           end={[1, 1]}
//         >
//           <Text style={[styles.uniqueHeaderTitle, { color: currentTheme.headerTextColor }]}>
//             Help & Support
//           </Text>
//         </LinearGradient>

//         {/* Help Options rendered as cards */}
//         <View style={styles.cardsContainer}>
//           {/* FAQ */}
//           <TouchableOpacity style={[styles.card, { borderColor: currentTheme.borderColor }]} onPress={handleFAQPress} activeOpacity={0.8}>
//             <View style={styles.cardRow}>
//               <Ionicons name="help-circle" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>Frequently Asked Questions</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           {/* Contact Us */}
//           <TouchableOpacity style={[styles.card, { borderColor: currentTheme.borderColor }]} onPress={handleContactUsPress} activeOpacity={0.8}>
//             <View style={styles.cardRow}>
//               <Ionicons name="mail" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>Contact Us</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           {/* Terms & Conditions */}
//           <TouchableOpacity style={[styles.card, { borderColor: currentTheme.borderColor }]} onPress={handleTermsPress} activeOpacity={0.8}>
//             <View style={styles.cardRow}>
//               <Ionicons name="document-text" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>Terms & Conditions</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>

//           {/* Privacy Policy */}
//           <TouchableOpacity style={[styles.card, { borderColor: currentTheme.borderColor }]} onPress={handlePrivacyPress} activeOpacity={0.8}>
//             <View style={styles.cardRow}>
//               <Ionicons name="lock-closed" size={24} color={currentTheme.primaryColor} style={styles.icon} />
//               <Text style={[styles.cardText, { color: currentTheme.textColor }]}>Privacy Policy</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={24} color={currentTheme.placeholderTextColor} />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* Reusable Help Modal */}
//       <HelpModal
//         visible={modalVisible}
//         onClose={closeModal}
//         title={modalTitle}
//         description={modalDescription}
//         themeStyles={currentTheme}
//         headerBackground={currentTheme.headerBackground}
//         headerTextColor={currentTheme.headerTextColor}
//       />
//     </SafeAreaView>
//   );
// };

// export default HelpScreen;

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//   },
//   scrollContainer: {
//     paddingBottom: 30,
//   },
//   uniqueHeader: {
//     width: '100%',
//     paddingVertical: 15,
//     paddingHorizontal: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderBottomLeftRadius: 40,
//     borderBottomRightRadius: 40,
//     elevation: 6,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     marginBottom: 25,
//   },
//   uniqueHeaderTitle: {
//     fontSize: 28,
//     fontWeight: '700',
//   },
//   cardsContainer: {
//     marginHorizontal: 20,
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 13,
//     paddingHorizontal: 16,
//     borderWidth: 1,
//     borderRadius: 16,
//     marginBottom: 15,
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.15,
//     shadowRadius: 3,
//   },
//   cardRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   cardText: {
//     fontSize: 16,
//     fontWeight: '500',
//     flexShrink: 1,
//   },
//   icon: {
//     marginRight: 15,
//   },
//   /* Modal Styles */
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     width: width * 0.9,
//     maxHeight: height * 0.8,
//     borderRadius: 20,
//     padding: 20,
//     elevation: 6,
//   },
//   modalHeader: {
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   modalTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     flex: 1,
//     textAlign: 'left',
//   },
//   modalCloseButton: {
//     padding: 8,
//     borderRadius: 20,
//   },
//   modalBodyContent: {
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   modalDescription: {
//     fontSize: 16,
//     lineHeight: 24,
//   },
// });







