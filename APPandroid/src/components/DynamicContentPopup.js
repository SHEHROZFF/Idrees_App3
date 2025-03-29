// src/components/DynamicContentPopup.js
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RenderHTML from 'react-native-render-html';

// const baseWidth = 375; // Baseline width for scaling

const DynamicContentPopup = ({
  type = '',                      // e.g., 'privacy', 'terms', 'about', 'faq'
  visible = false,
  onClose = () => {},
  themeStyles = { 
    cardBackground: '#fff', 
    textColor: '#000', 
    primaryColor: '#007AFF' 
  },
  headerBackground = ['#007AFF', '#00A1FF'],
  headerTextColor = '#fff',
  fetchContent,
  staticContent,
  titleOverride = '',
}) => {
  const { width, height } = useWindowDimensions();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Compute scaling factor and helper
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // Return an appropriate title based on the type or override
  const getTitle = useCallback(() => {
    if (titleOverride) return titleOverride;
    switch (type) {
      case 'privacy':
        return 'Privacy Policy';
      case 'terms':
        return 'Terms of Use';
      case 'about':
        return 'About Us';
      case 'faq':
        return 'Frequently Asked Questions';
      case 'contact':
        return 'Contact Us';
      default:
        return 'Information';
    }
  }, [type, titleOverride]);

  // Load content either via a fetch function or static content
  const loadContent = useCallback(() => {
    setError(null);
    if (fetchContent) {
      setLoading(true);
      fetchContent(type)
        .then((response) => {
          if (response.success) {
            setContent(response.data.content);
          } else {
            setError('Failed to load content.');
          }
        })
        .catch(() => setError('Failed to load content.'))
        .finally(() => setLoading(false));
    } else if (staticContent) {
      setContent(staticContent);
    }
  }, [fetchContent, staticContent, type]);

  useEffect(() => {
    if (visible) {
      loadContent();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim, loadContent]);

  // Prepare the HTML source from fetched content
  const source = { html: content };

  // Responsive styles computed with useMemo
  const styles = useMemo(() => StyleSheet.create({
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      borderRadius: scale(20),
      elevation: 6,
      overflow: 'hidden',
      backgroundColor: themeStyles.cardBackground,
      width: width * 0.9,
      maxHeight: height * 0.8,
      opacity: fadeAnim,
    },
    modalHeader: {
      paddingHorizontal: scale(15),
      paddingVertical: scale(15),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    modalCloseButton: {
      padding: scale(8),
      borderRadius: scale(20),
    },
    modalBodyContent: {
      paddingHorizontal: scale(15),
      paddingVertical: scale(10),
    },
    errorContainer: {
      alignItems: 'center',
      marginVertical: scale(20),
    },
    retryButton: {
      padding: scale(10),
    },
  }), [width, height, themeStyles, fadeAnim, scale]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.modalBackground}>
        <Animated.View style={styles.modalContainer}>
          <LinearGradient
            colors={headerBackground}
            style={styles.modalHeader}
            start={[0, 0]}
            end={[1, 0]}
          >
            <RenderHTML
              contentWidth={width * 0.9}
              source={{
                html: `<h1 style="color:${headerTextColor}; font-size:${scale(22)}px; font-weight:700; margin:0;">${getTitle()}</h1>`,
              }}
            />
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} accessibilityLabel="Close Modal">
              <Ionicons name="close" size={scale(24)} color={headerTextColor} />
            </TouchableOpacity>
          </LinearGradient>
          <ScrollView contentContainerStyle={styles.modalBodyContent} showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator size="small" color={themeStyles.primaryColor} />
            ) : error ? (
              <View style={styles.errorContainer}>
                <RenderHTML
                  contentWidth={width * 0.9}
                  source={{
                    html: `<p style="color:${themeStyles.textColor}; font-size:${scale(16)}px;">${error}</p>`,
                  }}
                />
                <TouchableOpacity onPress={loadContent} style={styles.retryButton}>
                  <RenderHTML
                    contentWidth={width * 0.9}
                    source={{
                      html: `<p style="color:${themeStyles.primaryColor}; font-size:${scale(16)}px; font-weight:600; margin:0;">Retry</p>`,
                    }}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <RenderHTML
                contentWidth={width * 0.9}
                source={source}
                baseStyle={{
                  color: themeStyles.textColor,
                  fontSize: scale(16),
                  lineHeight: scale(24),
                }}
              />
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default DynamicContentPopup;










// // src/components/DynamicContentPopup.js
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   Modal,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   useWindowDimensions,
//   Animated,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import RenderHTML from 'react-native-render-html';

// const DynamicContentPopup = ({
//   type = '',                      // e.g., 'privacy', 'terms', 'about', 'faq'
//   visible = false,
//   onClose = () => {},
//   // Default theme styles if not provided
//   themeStyles = { 
//     cardBackground: '#fff', 
//     textColor: '#000', 
//     primaryColor: '#007AFF' 
//   },
//   // Default header gradient colors and text color
//   headerBackground = ['#007AFF', '#00A1FF'],
//   headerTextColor = '#fff',
//   fetchContent,
//   staticContent,
//   titleOverride = '',
// }) => {
//   const { width, height } = useWindowDimensions();
//   const [content, setContent] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Return an appropriate title based on the type or override
//   const getTitle = useCallback(() => {
//     if (titleOverride) return titleOverride;
//     switch (type) {
//       case 'privacy':
//         return 'Privacy Policy';
//       case 'terms':
//         return 'Terms of Use';
//       case 'about':
//         return 'About Us';
//       case 'faq':
//         return 'Frequently Asked Questions';
//       case 'contact':
//         return 'Contact Us';
//       default:
//         return 'Information';
//     }
//   }, [type, titleOverride]);

//   // Load content either via a fetch function or static content
//   const loadContent = useCallback(() => {
//     setError(null);
//     if (fetchContent) {
//       setLoading(true);
//       fetchContent(type)
//         .then((response) => {
//           if (response.success) {
//             setContent(response.data.content);
//           } else {
//             setError('Failed to load content.');
//           }
//         })
//         .catch(() => setError('Failed to load content.'))
//         .finally(() => setLoading(false));
//     } else if (staticContent) {
//       setContent(staticContent);
//     }
//   }, [fetchContent, staticContent, type]);

//   useEffect(() => {
//     if (visible) {
//       loadContent();
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       fadeAnim.setValue(0);
//     }
//   }, [visible, fadeAnim, loadContent]);

//   // Prepare the HTML source from fetched content
//   const source = { html: content };

//   return (
//     <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose} accessibilityViewIsModal={true}>
//       <View style={styles.modalBackground}>
//         <Animated.View
//           style={[
//             styles.modalContainer,
//             { backgroundColor: themeStyles.cardBackground, width: width * 0.9, maxHeight: height * 0.8, opacity: fadeAnim },
//           ]}
//         >
//           <LinearGradient
//             colors={headerBackground}
//             style={styles.modalHeader}
//             start={[0, 0]}
//             end={[1, 0]}
//           >
//             <RenderHTML
//               contentWidth={width * 0.9}
//               source={{
//                 html: `<h1 style="color:${headerTextColor}; font-size:22px; font-weight:700; margin:0;">${getTitle()}</h1>`,
//               }}
//             />
//             <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} accessibilityLabel="Close Modal">
//               <Ionicons name="close" size={24} color={headerTextColor} />
//             </TouchableOpacity>
//           </LinearGradient>
//           <ScrollView contentContainerStyle={styles.modalBodyContent} showsVerticalScrollIndicator={false}>
//             {loading ? (
//               <ActivityIndicator size="small" color={themeStyles.primaryColor} />
//             ) : error ? (
//               <View style={styles.errorContainer}>
//                 <RenderHTML
//                   contentWidth={width * 0.9}
//                   source={{
//                     html: `<p style="color:${themeStyles.textColor}; font-size:16px;">${error}</p>`,
//                   }}
//                 />
//                 <TouchableOpacity onPress={loadContent} style={styles.retryButton}>
//                   <RenderHTML
//                     contentWidth={width * 0.9}
//                     source={{
//                       html: `<p style="color:${themeStyles.primaryColor}; font-size:16px; font-weight:600; margin:0;">Retry</p>`,
//                     }}
//                   />
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <RenderHTML
//                 contentWidth={width * 0.9}
//                 source={source}
//                 baseStyle={{
//                   color: themeStyles.textColor,
//                   fontSize: 16,
//                   lineHeight: 24,
//                 }}
//               />
//             )}
//           </ScrollView>
//         </Animated.View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     borderRadius: 20,
//     elevation: 6,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   modalCloseButton: {
//     padding: 8,
//     borderRadius: 20,
//   },
//   modalBodyContent: {
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   errorContainer: {
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   retryButton: {
//     padding: 10,
//   },
// });

// export default DynamicContentPopup;





// // src/components/DynamicContentPopup.js
// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   Modal,
//   View,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
//   Animated,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import RenderHTML from 'react-native-render-html';

// const { width, height } = Dimensions.get('window');

// const DynamicContentPopup = ({
//   type = '',                      // e.g., 'privacy', 'terms', 'about', 'faq'
//   visible = false,
//   onClose = () => {},
//   // Default theme styles if not provided
//   themeStyles = { 
//     cardBackground: '#fff', 
//     textColor: '#000', 
//     primaryColor: '#007AFF' 
//   },
//   // Default header gradient colors and text color
//   headerBackground = ['#007AFF', '#00A1FF'],
//   headerTextColor = '#fff',
//   fetchContent,
//   staticContent,
//   titleOverride = '',
// }) => {
//   const [content, setContent] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   // Return an appropriate title based on the type or override
//   const getTitle = useCallback(() => {
//     if (titleOverride) return titleOverride;
//     switch (type) {
//       case 'privacy':
//         return 'Privacy Policy';
//       case 'terms':
//         return 'Terms of Use';
//       case 'about':
//         return 'About Us';
//       case 'faq':
//         return 'Frequently Asked Questions';
//       case 'contact':
//         return 'Contact Us';
//       default:
//         return 'Information';
//     }
//   }, [type, titleOverride]);

//   // Load content either via a fetch function or static content
//   const loadContent = useCallback(() => {
//     setError(null);
//     if (fetchContent) {
//       setLoading(true);
//       fetchContent(type)
//         .then((response) => {
//           if (response.success) {
//             setContent(response.data.content);
//           } else {
//             setError('Failed to load content.');
//           }
//         })
//         .catch(() => setError('Failed to load content.'))
//         .finally(() => setLoading(false));
//     } else if (staticContent) {
//       setContent(staticContent);
//     }
//   }, [fetchContent, staticContent, type]);

//   useEffect(() => {
//     if (visible) {
//       loadContent();
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 300,
//         useNativeDriver: true,
//       }).start();
//     } else {
//       // Reset opacity immediately when not visible
//       fadeAnim.setValue(0);
//     }
//   }, [visible, fadeAnim, loadContent]);

//   // Prepare the HTML source from fetched content
//   const source = { html: content };

//   return (
//     <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
//       <View style={styles.modalBackground}>
//         <Animated.View
//           style={[
//             styles.modalContainer,
//             { backgroundColor: themeStyles.cardBackground, opacity: fadeAnim },
//           ]}
//         >
//           <LinearGradient
//             colors={headerBackground}
//             style={styles.modalHeader}
//             start={[0, 0]}
//             end={[1, 0]}
//           >
//             {/* Render header title as HTML */}
//             <RenderHTML
//               contentWidth={width * 0.9}
//               source={{
//                 html: `<h1 style="color:${headerTextColor}; font-size:22px; font-weight:700; margin:0;">${getTitle()}</h1>`,
//               }}
//             />
//             <TouchableOpacity
//               onPress={onClose}
//               style={styles.modalCloseButton}
//               accessibilityLabel="Close Modal"
//             >
//               <Ionicons name="close" size={24} color={headerTextColor} />
//             </TouchableOpacity>
//           </LinearGradient>
//           <ScrollView
//             contentContainerStyle={styles.modalBodyContent}
//             showsVerticalScrollIndicator={false}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color={themeStyles.primaryColor} />
//             ) : error ? (
//               <View style={styles.errorContainer}>
//                 <RenderHTML
//                   contentWidth={width * 0.9}
//                   source={{
//                     html: `<p style="color:${themeStyles.textColor}; font-size:16px;">${error}</p>`,
//                   }}
//                 />
//                 <TouchableOpacity onPress={loadContent} style={styles.retryButton}>
//                   <RenderHTML
//                     contentWidth={width * 0.9}
//                     source={{
//                       html: `<p style="color:${themeStyles.primaryColor}; font-size:16px; font-weight:600; margin:0;">Retry</p>`,
//                     }}
//                   />
//                 </TouchableOpacity>
//               </View>
//             ) : (
//               <RenderHTML
//                 contentWidth={width * 0.9}
//                 source={source}
//                 baseStyle={{
//                   color: themeStyles.textColor,
//                   fontSize: 16,
//                   lineHeight: 24,
//                 }}
//               />
//             )}
//           </ScrollView>
//         </Animated.View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
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
//     elevation: 6,
//     overflow: 'hidden',
//   },
//   modalHeader: {
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   modalCloseButton: {
//     padding: 8,
//     borderRadius: 20,
//   },
//   modalBodyContent: {
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   errorContainer: {
//     alignItems: 'center',
//     marginVertical: 20,
//   },
//   retryButton: {
//     padding: 10,
//   },
// });

// export default DynamicContentPopup;






// // src/components/DynamicContentPopup.js
// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';

// const { width, height } = Dimensions.get('window');

// const DynamicContentPopup = ({
//   type,              // e.g., 'privacy', 'terms', 'about', 'faq'
//   visible,
//   onClose,
//   themeStyles,
//   headerBackground,
//   headerTextColor,
//   fetchContent,      // function to fetch content dynamically (optional)
//   staticContent,     // or pass static content if no BE call is needed
//   titleOverride,     // explicit title override if needed
// }) => {
//   const [content, setContent] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (visible) {
//       if (fetchContent) {
//         setLoading(true);
//         fetchContent(type)
//           .then((response) => {
//             if (response.success) {
//               setContent(response.data.content);
//             } else {
//               setContent('Failed to load content.');
//             }
//           })
//           .catch(() => setContent('Failed to load content.'))
//           .finally(() => setLoading(false));
//       } else if (staticContent) {
//         setContent(staticContent);
//       }
//     }
//   }, [visible, type]);

//   const getTitle = () => {
//     if (titleOverride) return titleOverride;
//     switch (type) {
//       case 'privacy':
//         return 'Privacy Policy';
//       case 'terms':
//         return 'Terms of Use';
//       case 'about':
//         return 'About Us';
//       case 'faq':
//         return 'Frequently Asked Questions';
//       case 'contact':
//         return 'Contact Us';
//       default:
//         return 'Information';
//     }
//   };

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
//             <Text style={[styles.modalTitle, { color: headerTextColor }]}>{getTitle()}</Text>
//             <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
//               <Ionicons name="close" size={24} color={headerTextColor} />
//             </TouchableOpacity>
//           </LinearGradient>
//           <ScrollView
//             contentContainerStyle={styles.modalBodyContent}
//             showsVerticalScrollIndicator={false}
//           >
//             {loading ? (
//               <ActivityIndicator size="small" color={themeStyles.primaryColor} />
//             ) : (
//               <Text style={[styles.modalDescription, { color: themeStyles.textColor }]}>
//                 {content}
//               </Text>
//             )}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
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
//     elevation: 6,
//   },
//   modalHeader: {
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
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

// export default DynamicContentPopup;







// // src/components/PolicyPopup.js
// import React, { useState, useEffect } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
//   StyleSheet,
//   Dimensions,
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { LinearGradient } from 'expo-linear-gradient';
// import { fetchPolicy } from '../services/api';

// const { width, height } = Dimensions.get('window');

// const PolicyPopup = ({
//   type,
//   visible,
//   onClose,
//   themeStyles, // e.g., currentTheme from context (lightTheme/darkTheme)
//   headerBackground, // gradient colors array, e.g., currentTheme.headerBackground
//   headerTextColor,  // header text color, e.g., currentTheme.headerTextColor
// }) => {
//   const [content, setContent] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (visible) {
//       const loadPolicy = async () => {
//         setLoading(true);
//         const response = await fetchPolicy(type);
//         if (response.success) {
//           setContent(response.data.content);
//         } else {
//           setContent('Failed to load policy.');
//         }
//         setLoading(false);
//       };
//       loadPolicy();
//     }
//   }, [visible, type]);

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
//             <Text style={[styles.modalTitle, { color: headerTextColor }]}>
//               {type === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
//             </Text>
//             <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
//               <Ionicons name="close" size={24} color={headerTextColor} />
//             </TouchableOpacity>
//           </LinearGradient>
//           {/* Modal Body */}
//           <ScrollView contentContainerStyle={styles.modalBodyContent} showsVerticalScrollIndicator={false}>
//             {loading ? (
//               <ActivityIndicator size="small" color={themeStyles.primaryColor} />
//             ) : (
//               <Text style={[styles.modalDescription, { color: themeStyles.textColor }]}>
//                 {content}
//               </Text>
//             )}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
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
//     elevation: 6,
//   },
//   modalHeader: {
//     paddingHorizontal: 15,
//     paddingVertical: 15,
//     flexDirection: 'row',
//     alignItems: 'center',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
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

// export default PolicyPopup;
