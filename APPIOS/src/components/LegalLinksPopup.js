// src/components/LegalLinksPopup.js
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import DynamicContentPopup from './DynamicContentPopup';
import { fetchPolicyThunk } from '../store/slices/policySlice';
import { useDispatch } from 'react-redux';

const baseWidth = 375; // baseline width, e.g., iPhone 8

const LegalLinksPopup = ({
  textStyle = {},
  containerStyle = {},
  separator = ' | ',
  staticContent,
  themeStyles,
  headerBackground,
  headerTextColor = '#fff',
}) => {
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupType, setPopupType] = useState('');
  const { width } = useWindowDimensions();
  const baseWidth = width > 375 ? 400 : 400;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;
  const dispatch = useDispatch();

  const fetchContentWithRedux = useCallback(
    (type) => dispatch(fetchPolicyThunk(type)).unwrap(),
    [dispatch]
  );
  
  const openPopup = (type) => {
    setPopupType(type);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setPopupType('');
  };

  // Dynamically computed styles based on the current screen width.
  const styles = useMemo(() => StyleSheet.create({
    linksContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    linkText: {
      fontWeight: 'bold',
      fontSize: scale(12),
    },
    separator: {
      fontSize: scale(12),
      marginHorizontal: scale(5),
    },
  }), [scaleFactor]);

  return (
    <View style={containerStyle}>
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => openPopup('privacy')}>
          <Text style={[styles.linkText, textStyle]}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={[styles.separator, textStyle]}>{separator}</Text>
        <TouchableOpacity onPress={() => openPopup('terms')}>
          <Text style={[styles.linkText, textStyle]}>Terms of Use</Text>
        </TouchableOpacity>
      </View>
      <DynamicContentPopup
        visible={popupVisible}
        type={popupType}
        onClose={closePopup}
        staticContent={staticContent}
        themeStyles={themeStyles}
        headerBackground={headerBackground}
        headerTextColor={headerTextColor}
        fetchContent={fetchContentWithRedux}
      />
    </View>
  );
};

export default LegalLinksPopup;







// // src/components/LegalLinksPopup.js
// import React, { useState, useCallback } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import DynamicContentPopup from './DynamicContentPopup';
// // import { fetchPolicy } from '../services/api';
// import { fetchPolicyThunk } from '../store/slices/policySlice';
// import { useDispatch } from 'react-redux';

// const LegalLinksPopup = ({
//   textStyle = {},
//   containerStyle = {},
//   separator = ' | ',
//   // fetchContent,
//   staticContent,
//   themeStyles,
//   headerBackground,
//   headerTextColor = '#fff',
// }) => {
//   const [popupVisible, setPopupVisible] = useState(false);
//   const [popupType, setPopupType] = useState('');

//   const dispatch = useDispatch();

//   const fetchContentWithRedux = useCallback(
//     (type) => dispatch(fetchPolicyThunk(type)).unwrap(),
//     [dispatch]
//   );
  
//   const openPopup = (type) => {
//     setPopupType(type);
//     setPopupVisible(true);
//   };

//   const closePopup = () => {
//     setPopupVisible(false);
//     setPopupType('');
//   };

//   return (
//     <View style={containerStyle}>
//       <View style={styles.linksContainer}>
//         <TouchableOpacity onPress={() => openPopup('privacy')}>
//           <Text style={[styles.linkText, textStyle]}>Privacy Policy</Text>
//         </TouchableOpacity>
//         <Text style={[styles.separator, textStyle]}>{separator}</Text>
//         <TouchableOpacity onPress={() => openPopup('terms')}>
//           <Text style={[styles.linkText, textStyle]}>Terms of Use</Text>
//         </TouchableOpacity>
//       </View>
//       <DynamicContentPopup
//         visible={popupVisible}
//         type={popupType}
//         onClose={closePopup}
//         // fetchContent={fetchContent}
//         staticContent={staticContent}
//         themeStyles={themeStyles}
//         headerBackground={headerBackground}
//         headerTextColor={headerTextColor}
//         fetchContent={fetchContentWithRedux}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   linksContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   linkText: {
//     fontWeight: 'bold',
//     fontSize: 12,
//   },
//   separator: {
//     fontSize: 12,
//     marginHorizontal: 5,
//   },
// });

// export default LegalLinksPopup;
