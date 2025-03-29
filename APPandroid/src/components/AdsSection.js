// File: src/components/AdsSection.js
import React, { useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, useWindowDimensions, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdsThunk } from '../store/slices/adsSlice';
import AdsList from './AdsList';

const AdsSection = ({
  currentTheme,
  onAdPress,
  refreshSignal,
  categoryFilter,
  templateFilter = 'all',
  marginV = 0,
  headingText = 'Latest Ads',
  headingShow = true,
  headingStyle = {}
}) => {
  const dispatch = useDispatch();
  const adsData = useSelector((state) => state.ads.data);
  const loading = useSelector((state) => state.ads.loading);

  const { width } = useWindowDimensions();
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  const styles = StyleSheet.create({
    sectionWrapper: {
      // marginVertical: scale(marginV),
      borderRadius: scale(20),
    },
    loadingContainer: {
      marginVertical: scale(20),
      alignItems: 'center',
    },
    templateGroup: {},
    adsHeading: {
      fontSize: scale(28),
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: scale(10),
      marginTop: scale(20),
      fontFamily: 'AvenirNext-Regular' ,
      textDecorationLine: 'underline'
    },
  });

  const getAds = useCallback(() => {
    dispatch(fetchAdsThunk());
  }, [dispatch]);

  useEffect(() => {
    getAds();
  }, [getAds, refreshSignal]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={currentTheme?.primaryColor || '#000'} />
      </View>
    );
  }

  // Filter by category
  let filteredAds = adsData;
  if (categoryFilter) {
    if (typeof categoryFilter === 'string') {
      filteredAds = filteredAds.filter((ad) => ad.category === categoryFilter);
    } else if (Array.isArray(categoryFilter)) {
      filteredAds = filteredAds.filter((ad) => categoryFilter.includes(ad.category));
    }
  }

  if (!filteredAds.length) return null;

  // Group by template
  const grouped = {};
  filteredAds.forEach((ad) => {
    const key = ad.templateId || 'newCourse';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ad);
  });

  // If templateFilter != 'all', override grouping
  const groupedAds =
    templateFilter === 'all'
      ? grouped
      : { [templateFilter]: filteredAds.filter((ad) => ad.templateId === templateFilter) };

  return (
    <View style={styles.sectionWrapper}>
      {Object.keys(groupedAds).map((templateKey) => (
        <View key={templateKey} style={styles.templateGroup}>
          {headingShow && <Text style={headingStyle}>{headingText}</Text>}
          <AdsList
            ads={groupedAds[templateKey]}
            onAdPress={onAdPress}
            currentTheme={currentTheme}
          />
        </View>
      ))}
    </View>
  );
};

export default AdsSection;












// // AdsSection.js
// import React, { useEffect, useCallback } from 'react';
// import { View, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
// import { useDispatch, useSelector } from 'react-redux';
// import { fetchAdsThunk } from '../store/slices/adsSlice'; // or courseSlice
// import AdsList from './AdsList';

// const AdsSection = ({
//   currentTheme,
//   onAdPress,
//   refreshSignal,
//   categoryFilter,
//   templateFilter = 'all',
//   marginV = 0,
// }) => {
//   const dispatch = useDispatch();

//   // Grab ads + loading state from Redux
//   const adsData = useSelector((state) => state.ads.data);
//   const loading = useSelector((state) => state.ads.loading);

//   const { width } = useWindowDimensions();
//   const baseWidth = width > 375 ? 460 : 500;
//   const scaleFactor = width / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   const styles = StyleSheet.create({
//     sectionWrapper: {
//       marginVertical: scale(marginV),
//       borderRadius: scale(20),
//     },
//     loadingContainer: {
//       marginVertical: scale(20),
//       alignItems: 'center',
//     },
//     templateGroup: {},
//   });

//   // Fire off your thunk once
//   const getAds = useCallback(() => {
//     dispatch(fetchAdsThunk());
//   }, [dispatch]);

//   // Also re-fetch if parent passes a "refreshSignal" prop
//   useEffect(() => {
//     getAds();
//   }, [getAds, refreshSignal]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color={currentTheme?.primaryColor || '#000'} />
//       </View>
//     );
//   }

//   // Filter by category
//   let filteredAds = adsData;
//   if (categoryFilter) {
//     if (typeof categoryFilter === 'string') {
//       filteredAds = filteredAds.filter((ad) => ad.category === categoryFilter);
//     } else if (Array.isArray(categoryFilter)) {
//       filteredAds = filteredAds.filter((ad) => categoryFilter.includes(ad.category));
//     }
//   }

//   if (!filteredAds?.length) return null;

//   // Group by template if needed
//   const grouped = {};
//   filteredAds.forEach((ad) => {
//     const key = ad.templateId || 'newCourse';
//     if (!grouped[key]) grouped[key] = [];
//     grouped[key].push(ad);
//   });

//   // If templateFilter != 'all', override grouping
//   const groupedAds =
//     templateFilter === 'all'
//       ? grouped
//       : { [templateFilter]: filteredAds.filter((ad) => ad.templateId === templateFilter) };

//   return (
//     <View style={styles.sectionWrapper}>
//       {Object.keys(groupedAds).map((templateKey) => (
//         <View key={templateKey} style={styles.templateGroup}>
//           <AdsList
//             ads={groupedAds[templateKey]}
//             onAdPress={onAdPress}
//             currentTheme={currentTheme}
//           />
//         </View>
//       ))}
//     </View>
//   );
// };

// export default AdsSection;










// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { View, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
// import { useDispatch } from 'react-redux';
// import { fetchAdsThunk } from '../store/slices/courseSlice';
// import AdsList from './AdsList';

// const AdsSection = ({
//   currentTheme,
//   onAdPress,
//   refreshSignal,
//   categoryFilter,
//   templateFilter = 'all',
//   marginV = 0,
// }) => {
//   const [ads, setAds] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const dispatch = useDispatch();

//   // 1) Match your LoginScreen approach for scaling
//   const { width } = useWindowDimensions();
//   const baseWidth = width > 375 ? 460 : 500;
//   const scaleFactor = width / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   // 2) Create styles in a useMemo, referencing scale(...)
//   const styles = useMemo(
//     () =>
//       StyleSheet.create({
//         sectionWrapper: {
//           marginVertical: scale(marginV),
//           borderRadius: scale(20),
//         },
//         loadingContainer: {
//           marginVertical: scale(20),
//           alignItems: 'center',
//         },
//         templateGroup: {
//           // If you want spacing between different template groups:
//           // marginBottom: scale(15),
//         },
//       }),
//     [scaleFactor, marginV]
//   );

//   // Group ads by templateId
//   const groupAdsByTemplate = useCallback((adsArray) => {
//     return adsArray.reduce((groups, ad) => {
//       const key = ad.templateId || 'newCourse';
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(ad);
//       return groups;
//     }, {});
//   }, []);

//   // Fetch ads via Redux thunk
//   const getAds = useCallback(async () => {
//     setLoading(true);
//     try {
//       const result = await dispatch(fetchAdsThunk()).unwrap();
//       let fetchedAds = result.data || [];

//       // Filter by category if given
//       if (categoryFilter) {
//         if (typeof categoryFilter === 'string') {
//           fetchedAds = fetchedAds.filter((ad) => ad.category === categoryFilter);
//         } else if (Array.isArray(categoryFilter)) {
//           fetchedAds = fetchedAds.filter((ad) => categoryFilter.includes(ad.category));
//         }
//       }
//       setAds(fetchedAds);
//     } catch (error) {
//       console.error('Ads fetch error', error);
//       setAds([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [categoryFilter, dispatch]);

//   useEffect(() => {
//     getAds();
//   }, [getAds, refreshSignal]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }

//   if (!ads.length) return null;

//   // Either show all templates or just one
//   const adsToShow =
//     templateFilter === 'all'
//       ? groupAdsByTemplate(ads)
//       : { [templateFilter]: ads.filter((ad) => ad.templateId === templateFilter) };

//   return (
//     <View style={styles.sectionWrapper}>
//       {Object.keys(adsToShow).map((templateKey) => (
//         <View key={templateKey} style={styles.templateGroup}>
//           <AdsList
//             ads={adsToShow[templateKey]}
//             onAdPress={onAdPress}
//             currentTheme={currentTheme}
//           />
//         </View>
//       ))}
//     </View>
//   );
// };

// export default AdsSection;












// import React, { useState, useEffect, useCallback } from 'react';
// import { View, ActivityIndicator, StyleSheet } from 'react-native';
// import AdsList from './AdsList';
// // Removed direct API import
// // import { fetchAds } from '../services/api';
// import { useDispatch } from 'react-redux';
// import { fetchAdsThunk } from '../store/slices/courseSlice';

// const AdsSection = ({ currentTheme, onAdPress, refreshSignal, categoryFilter, templateFilter = 'all',marginV }) => {
//   const [ads, setAds] = useState([]);
//   const [loading, setLoading] = useState(false);
  
//   const dispatch = useDispatch();

//   // Group ads by templateId
//   const groupAdsByTemplate = (adsArray) =>
//     adsArray.reduce((groups, ad) => {
//       const key = ad.templateId || 'newCourse';
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(ad);
//       return groups;
//     }, {});

//   const getAds = useCallback(async () => {
//     setLoading(true);
//     try {
//       const result = await dispatch(fetchAdsThunk()).unwrap();
//       let fetchedAds = result.data || [];
//       // console.log("ads",result);
      
//       if (categoryFilter) {
//         if (typeof categoryFilter === 'string') {
//           fetchedAds = fetchedAds.filter(ad => ad.category === categoryFilter);
//         } else if (Array.isArray(categoryFilter)) {
//           fetchedAds = fetchedAds.filter(ad => categoryFilter.includes(ad.category));
//         }
//       }
//       setAds(fetchedAds);
//     } catch (error) {
//       console.error('Ads fetch error', error);
//       setAds([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [categoryFilter, dispatch]);

//   useEffect(() => {
//     getAds();
//   }, [getAds, refreshSignal]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }
//   if (!ads.length) return null;

//   const adsToShow = templateFilter === 'all'
//     ? groupAdsByTemplate(ads)
//     : { [templateFilter]: ads.filter(ad => ad.templateId === templateFilter) };

//   return (
//     <View style={[styles.sectionWrapper,{marginVertical:marginV}]}>
//       {Object.keys(adsToShow).map((templateKey) => (
//         <View key={templateKey} style={styles.templateGroup}>
//           <AdsList ads={adsToShow[templateKey]} onAdPress={onAdPress} currentTheme={currentTheme} />
//         </View>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   sectionWrapper: {
//     // marginHorizontal: 0,
//     // paddingVertical: 15,
//     borderRadius: 20,
//   },
//   // Uncomment and adjust the templateGroup style if needed
//   // templateGroup: { marginBottom: 25 },
//   groupHeader: {
//     fontSize: 26,
//     fontWeight: '800',
//     textAlign: 'center',
//   },
//   sectionDivider: {
//     height: 4,
//     backgroundColor: '#00aced',
//     borderRadius: 3,
//     marginHorizontal: 100,
//   },
//   loadingContainer: {
//     marginVertical: 20,
//     alignItems: 'center',
//   },
// });

// export default AdsSection;










// import React, { useState, useEffect, useCallback } from 'react';
// import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
// import AdsList from './AdsList';
// import { fetchAds } from '../services/api';

// const AdsSection = ({ currentTheme, onAdPress, refreshSignal, categoryFilter, templateFilter = 'all' }) => {
//   const [ads, setAds] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Group ads by templateId
//   const groupAdsByTemplate = (adsArray) =>
//     adsArray.reduce((groups, ad) => {
//       const key = ad.templateId || 'newCourse';
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(ad);
//       return groups;
//     }, {});

//   const getAds = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await fetchAds();
//       if (response?.success) {
//         let fetchedAds = response.data.data || [];
//         if (categoryFilter) {
//           if (typeof categoryFilter === 'string') {
//             fetchedAds = fetchedAds.filter(ad => ad.category === categoryFilter);
//           } else if (Array.isArray(categoryFilter)) {
//             fetchedAds = fetchedAds.filter(ad => categoryFilter.includes(ad.category));
//           }
//         }
//         setAds(fetchedAds);
//       } else {
//         setAds([]);
//       }
//     } catch (error) {
//       console.error('Ads fetch error', error);
//       setAds([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [categoryFilter]);

//   useEffect(() => {
//     getAds();
//   }, [getAds, refreshSignal]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }
//   if (!ads.length) return null;

//   const adsToShow = templateFilter === 'all'
//     ? groupAdsByTemplate(ads)
//     : { [templateFilter]: ads.filter(ad => ad.templateId === templateFilter) };

//   return (
//     <View style={styles.sectionWrapper}>
//       {Object.keys(adsToShow).map((templateKey) => (
//         <View key={templateKey} style={styles.templateGroup}>
//            {/* <Text style={[styles.groupHeader, { color: currentTheme.cardTextColor }]}>
//              {templateKey.charAt(0).toUpperCase() + templateKey.slice(1)} Ads
//            </Text> */}
//           {/* <View style={styles.sectionDivider} /> */}
//           <AdsList ads={adsToShow[templateKey]} onAdPress={onAdPress} currentTheme={currentTheme} />
//         </View>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   sectionWrapper: {
//     marginHorizontal: 15,
//     // marginBottom: 20,
//     paddingVertical: 15,
//     borderRadius: 20,
//   },
//   // templateGroup: { marginBottom: 30 },
//     // templateGroup: { marginBottom: 25 },
//   groupHeader: {
//     fontSize: 26,
//     fontWeight: '800',
//     // marginBottom: 5,
//     textAlign: 'center',
//   },
//   sectionDivider: {
//     height: 4,
//     backgroundColor: '#00aced',
//     // marginVertical: 10,
//     borderRadius: 3,
//     marginHorizontal: 100,
//   },
//   loadingContainer: { marginVertical: 20, alignItems: 'center' },
// });

// export default AdsSection;


// // src/components/AdsSection.js
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// import AdsList from './AdsList';
// import { fetchAds } from '../services/api';

// const AdsSection = ({ currentTheme, onAdPress, refreshSignal, categoryFilter, templateFilter = 'all' }) => {
//   const [ads, setAds] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Group ads by templateId
//   const groupAdsByTemplate = (adsArray) =>
//     adsArray.reduce((groups, ad) => {
//       const key = ad.templateId || 'newCourse';
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(ad);
//       return groups;
//     }, {});

//   const getAds = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await fetchAds();
//       if (response?.success) {
//         let fetchedAds = response.data?.data || [];
//         if (categoryFilter) {
//           if (typeof categoryFilter === 'string') {
//             fetchedAds = fetchedAds.filter(ad => ad.category === categoryFilter);
//           } else if (Array.isArray(categoryFilter)) {
//             fetchedAds = fetchedAds.filter(ad => categoryFilter.includes(ad.category));
//           }
//         }
//         setAds(fetchedAds);
//       } else {
//         setAds([]);
//       }
//     } catch (error) {
//       console.error('Ads fetch error', error);
//       setAds([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [categoryFilter]);

//   useEffect(() => {
//     getAds();
//   }, [getAds, refreshSignal]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }
//   if (!ads.length) return null;

//   const adsToShow = templateFilter === 'all'
//     ? groupAdsByTemplate(ads)
//     : { [templateFilter]: ads.filter(ad => ad.templateId === templateFilter) };

//   return (
//     <View style={styles.sectionWrapper}>
//       {Object.keys(adsToShow).map((templateKey) => (
//         <View key={templateKey} style={styles.templateGroup}>
//           <Text style={[styles.groupHeader, { color: currentTheme.cardTextColor }]}>
//             {templateKey.charAt(0).toUpperCase() + templateKey.slice(1)} Ads
//           </Text>
//           <View style={styles.sectionDivider} />
//           <AdsList
//             ads={adsToShow[templateKey]}
//             onAdPress={onAdPress}
//             currentTheme={currentTheme}
//           />
//         </View>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   sectionWrapper: {
//     marginHorizontal: 15,
//     marginBottom: 20,
//     paddingVertical: 15,
//     backgroundColor: 'rgba(255,255,255,0.95)',
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOpacity: 0.12,
//     shadowRadius: 10,
//     elevation: 4,
//   },
//   templateGroup: { marginBottom: 25 },
//   groupHeader: {
//     fontSize: 26,
//     fontWeight: '800',
//     marginBottom: 5,
//     textAlign: 'center',
//   },
//   sectionDivider: {
//     height: 4,
//     backgroundColor: '#00aced',
//     marginVertical: 10,
//     borderRadius: 3,
//     marginHorizontal: 50,
//   },
//   loadingContainer: { marginVertical: 10, alignItems: 'center' },
// });

// export default AdsSection;












// // src/components/AdsSection.js
// import React, { useState, useEffect, useCallback } from 'react';
// import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// import AdsList from './AdsList';
// import { fetchAds } from '../services/api';

// const AdsSection = ({ currentTheme, onAdPress, refreshSignal, categoryFilter }) => {
//   const [ads, setAds] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const getAds = useCallback(async () => {
//     setLoading(true);
//     try {
//       const response = await fetchAds();
//       // Our API returns nested data: response.data.data
//       if (response?.success) {
//         let filteredAds = response.data?.data || [];
//         if (categoryFilter) {
//           if (typeof categoryFilter === 'string') {
//             filteredAds = filteredAds.filter(ad => ad.category === categoryFilter);
//           } else if (Array.isArray(categoryFilter)) {
//             filteredAds = filteredAds.filter(ad => categoryFilter.includes(ad.category));
//           }
//         }
//         setAds(filteredAds);
//       } else {
//         setAds([]);
//       }
//     } catch (error) {
//       console.error('Ads fetch error', error);
//       setAds([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [categoryFilter]);

//   useEffect(() => {
//     getAds();
//   }, [getAds, refreshSignal]);

//   if (loading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
//       </View>
//     );
//   }
//   if (!ads.length) return null;

//   return (
//     <View style={styles.sectionWrapper}>
//       <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
//         Sponsored Ads {categoryFilter ? `- ${Array.isArray(categoryFilter) ? categoryFilter.join(', ') : categoryFilter}` : ''}
//       </Text>
//       <View style={styles.sectionDivider} />
//       <AdsList ads={ads} onAdPress={onAdPress} currentTheme={currentTheme} />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   // sectionWrapper: {
//   //   marginHorizontal: 15,
//   //   marginBottom: 20,
//   //   paddingVertical: 15,
//   //   paddingHorizontal: 10,
//   //   backgroundColor: 'rgba(255,255,255,0.95)',
//   //   borderRadius: 12,
//   //   shadowColor: '#000',
//   //   shadowOpacity: 0.12,
//   //   shadowRadius: 10,
//   //   elevation: 4,
//   // },
//   sectionTitle: {
//     fontSize: 26,
//     fontWeight: '800',
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   sectionDivider: {
//     height: 4,
//     backgroundColor: '#00aced',
//     marginVertical: 15,
//     borderRadius: 3,
//     marginHorizontal: 50,
//   },
//   loadingContainer: {
//     marginVertical: 10,
//     alignItems: 'center',
//   },
// });

// export default AdsSection;










// // import React, { useState, useEffect, useCallback } from 'react';
// // import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// // import AdsList from './AdsList';
// // import { fetchAds } from '../services/api';

// // const AdsSection = ({ currentTheme, onAdPress, refreshSignal, categoryFilter }) => {
// //   const [ads, setAds] = useState([]);
// //   const [loading, setLoading] = useState(false);

// //   const getAds = useCallback(async () => {
// //     setLoading(true);
// //     try {
// //       const response = await fetchAds();
// //       if (response?.success) {
// //         // If categoryFilter is an array, filter ads that match any; otherwise, filter by single string.
// //         const filteredAds = Array.isArray(categoryFilter) && categoryFilter.length
// //           ? response.data.filter((ad) => categoryFilter.includes(ad.category))
// //           : categoryFilter
// //           ? response.data.filter((ad) => ad.category === categoryFilter)
// //           : response.data;
// //         setAds(filteredAds);
// //       } else {
// //         setAds([]);
// //       }
// //     } catch (error) {
// //       console.error('Ads fetch error', error);
// //       setAds([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [categoryFilter]);

// //   useEffect(() => {
// //     getAds();
// //   }, [getAds, refreshSignal]);

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="small" color={currentTheme.primaryColor} />
// //       </View>
// //     );
// //   }

// //   if (!ads.length) return null;

// //   return (
// //     <View style={styles.sectionWrapper}>
// //       <Text style={[styles.sectionTitle, { color: currentTheme.cardTextColor }]}>
// //         Sponsored Ads {categoryFilter ? `- ${Array.isArray(categoryFilter) ? categoryFilter.join(', ') : categoryFilter}` : ''}
// //       </Text>
// //       <View style={styles.sectionDivider} />
// //       <AdsList ads={ads} onAdPress={onAdPress} currentTheme={currentTheme} category={categoryFilter} />
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   sectionWrapper: {
// //     marginHorizontal: 15,
// //     marginBottom: 20,
// //   },
// //   sectionTitle: {
// //     fontSize: 22,
// //     fontWeight: '700',
// //     marginTop: 15,
// //   },
// //   sectionDivider: {
// //     height: 2,
// //     backgroundColor: 'rgba(0,0,0,0.1)',
// //     marginVertical: 8,
// //     borderRadius: 2,
// //   },
// //   loadingContainer: {
// //     marginVertical: 10,
// //     alignItems: 'center',
// //   },
// // });

// // export default AdsSection;
