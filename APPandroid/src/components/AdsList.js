// File: src/components/AdsList.js
import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

import AdCard from './AdCard';

const AdsList = ({ ads, onAdPress, currentTheme }) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const baseWidth = screenWidth > 375 ? 460 : 500;
  const scaleFactor = screenWidth / baseWidth;
  const scale = (size) => size * scaleFactor;

  if (!ads || !ads.length) return null;

  // Determine template
  const templateId = ads[0]?.templateId || 'newCourse';

  // Decide some config based on template
  let carouselConfigCustom = {};
  let continuousScroll = false;
  if (templateId === 'promo') {
    carouselConfigCustom = { mode: 'default', autoPlay: false };
    continuousScroll = true;
  } else if (templateId === 'newCourse') {
    carouselConfigCustom = {
      mode: 'horizontal-stack',
      autoPlay: true,
      autoPlayInterval: 2500,
      scrollAnimationDuration: 600,
      modeConfig: {
        activeStackOffset: -40 * scaleFactor,
        inactiveStackScale: 1,
        inactiveStackOffset: 10 * scaleFactor,
      },
    };
  } else if (templateId === 'sale') {
    carouselConfigCustom = {
      mode: 'horizontal-stack',
      autoPlay: true,
      autoPlayInterval: 3000,
      scrollAnimationDuration: 800,
    };
  } else if (templateId === 'event') {
    carouselConfigCustom = { mode: 'tinder', autoPlay: false };
  } else {
    carouselConfigCustom = {
      mode: 'default',
      autoPlay: true,
      autoPlayInterval: 3000,
      scrollAnimationDuration: 800,
    };
  }

  // Show pagination for these templates
  const paginationTemplates = ['event'];
  const shouldShowPagination = paginationTemplates.includes(templateId);

  // Default dimensions per template id – think of it as a tailor-made wardrobe for each ad
  const defaultDimensions = {
    promo: { cardWidth: 350, cardHeight: 310 },
    newCourse: { cardWidth: 500, cardHeight: 300 },
    sale: { cardWidth: 470, cardHeight: 260 },
    event: { cardWidth: 520, cardHeight: 280 },
    default: { cardWidth: 500, cardHeight: 260 },
  };

  const { cardWidth: defaultCardWidth, cardHeight: defaultCardHeight } =
    defaultDimensions[templateId] || defaultDimensions.default;

  // Possibly override card dimension from ad data
  const override = ads[0]?.customStyles?.templateOverride || {};
  let finalCardWidth = override.cardWidth ? scale(override.cardWidth) : scale(defaultCardWidth);
  let finalCardHeight = override.cardHeight ? scale(override.cardHeight) : scale(defaultCardHeight);

  // Cap to 40% of screen height
  const maxCardHeight = screenHeight * 0.4;
  if (finalCardHeight > maxCardHeight) finalCardHeight = maxCardHeight;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          justifyContent: 'center',
          alignItems: 'center',
          // marginVertical: scale(40),
        },
        carousel: {
          marginVertical: scale(20),
        },
        animatedItem: {
          justifyContent: 'center',
          alignItems: 'center',
        },
        marqueeContainer: {
          flexDirection: 'row',
          overflow: 'hidden',
          alignItems: 'center',
        },
        marqueeItem: {},
        paginationContainer: {
          position: 'absolute',
          bottom: scale(18),
          flexDirection: 'row',
          alignSelf: 'center',
        },
        paginationDot: {
          width: scale(8),
          height: scale(8),
          borderRadius: scale(4),
          marginHorizontal: scale(4),
        },
      }),
    [scaleFactor]
  );

  const CARD_MARGIN = scale(10);
  const scrollX = useSharedValue(0);

  // If continuous, do the marquee effect
  useEffect(() => {
    if (continuousScroll) {
      const totalScrollDistance = ads.length * (finalCardWidth + CARD_MARGIN * 2);
      const animate = () => {
        scrollX.value = withTiming(
          totalScrollDistance,
          { duration: 15000, easing: Easing.linear },
          (finished) => {
            if (finished) {
              scrollX.value = 0;
              runOnJS(animate)();
            }
          }
        );
      };
      animate();
    }
  }, [continuousScroll, finalCardWidth, ads.length, CARD_MARGIN, scrollX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: continuousScroll ? -scrollX.value : 0 }],
  }));

  const renderPagination = (index) => (
    <View style={styles.paginationContainer}>
      {ads.map((_, i) => (
        <View
          key={i}
          style={[
            styles.paginationDot,
            {
              backgroundColor: i === index ? currentTheme?.primaryColor || '#00aced' : '#ccc',
            },
          ]}
        />
      ))}
    </View>
  );

  const renderItem = ({ item, index }) => {
    // Optionally add some flair—rotate the card slightly for newCourse templates
    let extraStyle = {};
    if (templateId === 'newCourse') {
      extraStyle = {
        transform: [{ rotate: index % 2 === 0 ? '4deg' : '-4deg' }],
      };
    }

    return (
      <Animated.View
        style={[
          styles.animatedItem,
          {
            width: finalCardWidth,
            height: finalCardHeight,
            marginHorizontal: CARD_MARGIN,
          },
          continuousScroll && animatedStyle,
          extraStyle,
        ]}
      >
        <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
        {!continuousScroll && shouldShowPagination && renderPagination(index)}
      </Animated.View>
    );
  };

  if (continuousScroll) {
    // Marquee style
    return (
      <View style={[styles.container, { height: finalCardHeight }]}>
        <Animated.View style={[styles.marqueeContainer, animatedStyle, { height: finalCardHeight }]}>
          {ads.concat(ads).map((item, index) => (
            <View
              key={index}
              style={{
                width: finalCardWidth,
                height: finalCardHeight,
                marginHorizontal: CARD_MARGIN,
              }}
            >
              <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
            </View>
          ))}
        </Animated.View>
      </View>
    );
  }

  // Otherwise, normal slider
  return (
    <View style={[styles.container, { height: finalCardHeight }]}>
      <Carousel
        data={ads}
        renderItem={renderItem}
        width={finalCardWidth + CARD_MARGIN * 2}
        height={finalCardHeight}
        loop
        autoPlay={carouselConfigCustom.autoPlay}
        autoPlayInterval={carouselConfigCustom.autoPlayInterval}
        scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
        mode={carouselConfigCustom.mode}
        modeConfig={carouselConfigCustom.modeConfig || {}}
        style={styles.carousel}
        snapEnabled
      />
    </View>
  );
};

export default AdsList;










// // File: src/components/AdsList.js
// import React, { useEffect, useMemo } from 'react';
// import { StyleSheet, View, useWindowDimensions } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
//   runOnJS,
// } from 'react-native-reanimated';

// import AdCard from './AdCard';

// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   const { width: screenWidth, height: screenHeight } = useWindowDimensions();
//   const baseWidth = screenWidth > 375 ? 460 : 500;
//   const scaleFactor = screenWidth / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   if (!ads || !ads.length) return null;

//   // Determine template
//   const templateId = ads[0]?.templateId || 'newCourse';

//   // Decide some config based on template
//   let carouselConfigCustom = {};
//   let continuousScroll = false;
//   if (templateId === 'promo') {
//     carouselConfigCustom = { mode: 'default', autoPlay: false };
//     continuousScroll = true;
//   } else if (templateId === 'newCourse') {
//     carouselConfigCustom = {
//       mode: 'horizontal-stack',
//       autoPlay: true,
//       autoPlayInterval: 2500,
//       scrollAnimationDuration: 600,
//       modeConfig: {
//         activeStackOffset: -40 * scaleFactor,
//         inactiveStackScale: 1,
//         inactiveStackOffset: 10 * scaleFactor,
//       },
//     };
//   } else if (templateId === 'sale') {
//     carouselConfigCustom = {
//       mode: 'horizontal-stack',
//       autoPlay: true,
//       autoPlayInterval: 3000,
//       scrollAnimationDuration: 800,
//     };
//   } else if (templateId === 'event') {
//     carouselConfigCustom = { mode: 'tinder', autoPlay: false };
//   } else {
//     carouselConfigCustom = {
//       mode: 'default',
//       autoPlay: true,
//       autoPlayInterval: 3000,
//       scrollAnimationDuration: 800,
//     };
//   }

//   // Show pagination for these templates
//   const paginationTemplates = ['event'];
//   const shouldShowPagination = paginationTemplates.includes(templateId);

//   // Possibly override card dimension from ad data
//   const override = ads[0]?.customStyles?.templateOverride || {};
//   const defaultCardWidth = templateId === 'sale' ? 470 : 500;
//   const defaultCardHeight = templateId === 'newCourse' ? 300 : 260;

//   let finalCardWidth = override.cardWidth ? scale(override.cardWidth) : scale(defaultCardWidth);
//   let finalCardHeight = override.cardHeight ? scale(override.cardHeight) : scale(defaultCardHeight);

//   // Cap to 40% of screen height
//   const maxCardHeight = screenHeight * 0.4;
//   if (finalCardHeight > maxCardHeight) finalCardHeight = maxCardHeight;

//   const styles = useMemo(
//     () =>
//       StyleSheet.create({
//         container: {
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginVertical: scale(40),
//         },
//         carousel: {
//           marginVertical: scale(20),
//         },
//         animatedItem: {
//           justifyContent: 'center',
//           alignItems: 'center',
//         },
//         marqueeContainer: {
//           flexDirection: 'row',
//           overflow: 'hidden',
//           alignItems: 'center',
//         },
//         marqueeItem: {},
//         paginationContainer: {
//           position: 'absolute',
//           bottom: scale(18),
//           flexDirection: 'row',
//           alignSelf: 'center',
//         },
//         paginationDot: {
//           width: scale(8),
//           height: scale(8),
//           borderRadius: scale(4),
//           marginHorizontal: scale(4),
//         },
//       }),
//     [scaleFactor]
//   );

//   const CARD_MARGIN = scale(10);
//   const scrollX = useSharedValue(0);

//   // If continuous, do the marquee effect
//   useEffect(() => {
//     if (continuousScroll) {
//       const totalScrollDistance = ads.length * (finalCardWidth + CARD_MARGIN * 2);
//       const animate = () => {
//         scrollX.value = withTiming(
//           totalScrollDistance,
//           { duration: 15000, easing: Easing.linear },
//           (finished) => {
//             if (finished) {
//               scrollX.value = 0;
//               runOnJS(animate)();
//             }
//           }
//         );
//       };
//       animate();
//     }
//   }, [continuousScroll, finalCardWidth, ads.length, CARD_MARGIN, scrollX]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? -scrollX.value : 0 }],
//   }));

//   const renderPagination = (index) => (
//     <View style={styles.paginationContainer}>
//       {ads.map((_, i) => (
//         <View
//           key={i}
//           style={[
//             styles.paginationDot,
//             {
//               backgroundColor: i === index ? currentTheme?.primaryColor || '#00aced' : '#ccc',
//             },
//           ]}
//         />
//       ))}
//     </View>
//   );

//   const renderItem = ({ item, index }) => {
//     // Optionally do random transforms for fun
//     let extraStyle = {};
//     if (templateId === 'newCourse') {
//       extraStyle = {
//         transform: [{ rotate: index % 2 === 0 ? '4deg' : '-4deg' }],
//       };
//     }

//     return (
//       <Animated.View
//         style={[
//           styles.animatedItem,
//           {
//             width: finalCardWidth,
//             height: finalCardHeight,
//             marginHorizontal: CARD_MARGIN,
//           },
//           continuousScroll && animatedStyle,
//           extraStyle,
//         ]}
//       >
//         <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//         {!continuousScroll && shouldShowPagination && renderPagination(index)}
//       </Animated.View>
//     );
//   };

//   if (continuousScroll) {
//     // Marquee style
//     return (
//       <View style={[styles.container, { height: finalCardHeight }]}>
//         <Animated.View
//           style={[styles.marqueeContainer, animatedStyle, { height: finalCardHeight }]}
//         >
//           {ads.concat(ads).map((item, index) => (
//             <View
//               key={index}
//               style={{
//                 width: finalCardWidth,
//                 height: finalCardHeight,
//                 marginHorizontal: CARD_MARGIN,
//               }}
//             >
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       </View>
//     );
//   }

//   // Otherwise normal slider
//   return (
//     <View style={[styles.container, { height: finalCardHeight }]}>
//       <Carousel
//         data={ads}
//         renderItem={renderItem}
//         width={finalCardWidth + CARD_MARGIN * 2}
//         height={finalCardHeight}
//         loop
//         autoPlay={carouselConfigCustom.autoPlay}
//         autoPlayInterval={carouselConfigCustom.autoPlayInterval}
//         scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
//         mode={carouselConfigCustom.mode}
//         modeConfig={carouselConfigCustom.modeConfig || {}}
//         style={styles.carousel}
//         snapEnabled
//       />
//     </View>
//   );
// };

// export default AdsList;












// // AdsList.js

// import React, { useEffect, useMemo } from 'react';
// import { StyleSheet, View, useWindowDimensions } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
//   runOnJS,
// } from 'react-native-reanimated';

// import AdCard from './AdCard';

// /**
//  * A horizontal list or continuous marquee of Ads.
//  * Determines appropriate layout mode, dimension scaling, etc.
//  */
// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   const { width: screenWidth, height: screenHeight } = useWindowDimensions();

//   // Baseline approach
//   const baseWidth = screenWidth > 375 ? 460 : 500;
//   const scaleFactor = screenWidth / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   if (!ads || !ads.length) return null;

//   // Grab the template from the first ad (assuming they're all the same group)
//   const templateId = ads[0]?.templateId || 'newCourse';

//   // Basic config
//   let carouselConfigCustom = {};
//   let continuousScroll = false;
//   switch (templateId) {
//     case 'promo':
//       carouselConfigCustom = { mode: 'default', autoPlay: false };
//       continuousScroll = true; // marquee style
//       break;
//     case 'newCourse':
//       carouselConfigCustom = {
//         mode: 'horizontal-stack',
//         autoPlay: true,
//         autoPlayInterval: 2500,
//         scrollAnimationDuration: 600,
//         modeConfig: {
//           activeStackOffset: -40 * scaleFactor,
//           inactiveStackScale: 1,
//           inactiveStackOffset: 10 * scaleFactor,
//         },
//       };
//       break;
//     case 'sale':
//       carouselConfigCustom = {
//         mode: 'horizontal-stack',
//         autoPlay: true,
//         autoPlayInterval: 3000,
//         scrollAnimationDuration: 800,
//       };
//       break;
//     case 'event':
//       carouselConfigCustom = { mode: 'tinder', autoPlay: false };
//       break;
//     default:
//       carouselConfigCustom = {
//         mode: 'default',
//         autoPlay: true,
//         autoPlayInterval: 3000,
//         scrollAnimationDuration: 800,
//       };
//       break;
//   }

//   // Optional pagination only in certain templates
//   const paginationTemplates = ['event'];
//   const shouldShowPagination = paginationTemplates.includes(templateId);

//   // Possibly override card dimension from ad data
//   const override = ads[0]?.customStyles?.templateOverride || {};
//   const defaultCardWidth = templateId === 'sale' ? 330 : 300;
//   const defaultCardHeight = templateId === 'newCourse' ? 250 : 260;

//   let finalCardWidth = override.cardWidth ? scale(override.cardWidth) : scale(defaultCardWidth);
//   let finalCardHeight = override.cardHeight ? scale(override.cardHeight) : scale(defaultCardHeight);

//   // Cap at 40% of screen height
//   const maxCardHeight = screenHeight * 0.4;
//   if (finalCardHeight > maxCardHeight) {
//     finalCardHeight = maxCardHeight;
//   }

//   const styles = useMemo(
//     () =>
//       StyleSheet.create({
//         container: {
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginVertical: scale(0),
//         },
//         carousel: {
//           marginVertical: scale(20),
//         },
//         animatedItem: {
//           justifyContent: 'center',
//           alignItems: 'center',
//         },
//         marqueeContainer: {
//           flexDirection: 'row',
//           overflow: 'hidden',
//           alignItems: 'center',
//         },
//         marqueeItem: {},
//         paginationContainer: {
//           position: 'absolute',
//           bottom: scale(18),
//           flexDirection: 'row',
//           alignSelf: 'center',
//         },
//         paginationDot: {
//           width: scale(8),
//           height: scale(8),
//           borderRadius: scale(4),
//           marginHorizontal: scale(4),
//         },
//       }),
//     [scaleFactor]
//   );

//   const CARD_MARGIN = scale(10);

//   // Continuous scroll effect
//   const scrollX = useSharedValue(0);

//   useEffect(() => {
//     if (continuousScroll) {
//       const effectiveCardWidth = finalCardWidth + CARD_MARGIN * 2;
//       const totalScrollDistance = ads.length * effectiveCardWidth;

//       const animate = () => {
//         scrollX.value = withTiming(
//           totalScrollDistance,
//           { duration: 15000, easing: Easing.linear },
//           (finished) => {
//             if (finished) {
//               scrollX.value = 0;
//               runOnJS(animate)(); // loop
//             }
//           }
//         );
//       };
//       animate();
//     }
//   }, [continuousScroll, finalCardWidth, ads.length, CARD_MARGIN, scrollX]);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ translateX: continuousScroll ? -scrollX.value : 0 }],
//     };
//   });

//   const renderPagination = (index) => (
//     <View style={styles.paginationContainer}>
//       {ads.map((_, i) => (
//         <View
//           key={i}
//           style={[
//             styles.paginationDot,
//             {
//               backgroundColor: i === index ? currentTheme?.primaryColor || '#00aced' : '#ccc',
//             },
//           ]}
//         />
//       ))}
//     </View>
//   );

//   const renderItem = ({ item, index }) => {
//     return (
//       <Animated.View
//         style={[
//           styles.animatedItem,
//           {
//             width: finalCardWidth,
//             height: finalCardHeight,
//             marginHorizontal: CARD_MARGIN,
//           },
//           continuousScroll && animatedStyle,
//         ]}
//       >
//         <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//         {!continuousScroll && shouldShowPagination && renderPagination(index)}
//       </Animated.View>
//     );
//   };

//   // 1) If continuous scrolling, do marquee-like approach:
//   if (continuousScroll) {
//     return (
//       <View style={[styles.container, { height: finalCardHeight }]}>
//         <Animated.View
//           style={[
//             styles.marqueeContainer,
//             animatedStyle,
//             { height: finalCardHeight, paddingHorizontal: CARD_MARGIN },
//           ]}
//         >
//           {ads.concat(ads).map((item, index) => (
//             <View
//               key={index}
//               style={{
//                 width: finalCardWidth,
//                 height: finalCardHeight,
//                 marginHorizontal: CARD_MARGIN,
//               }}
//             >
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       </View>
//     );
//   }

//   // 2) Otherwise, a normal carousel approach
//   return (
//     <View style={[styles.container, { height: finalCardHeight }]}>
//       <Carousel
//         data={ads}
//         renderItem={renderItem}
//         width={finalCardWidth + CARD_MARGIN * 2}
//         height={finalCardHeight}
//         loop
//         autoPlay={carouselConfigCustom.autoPlay}
//         autoPlayInterval={carouselConfigCustom.autoPlayInterval}
//         scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
//         mode={carouselConfigCustom.mode}
//         modeConfig={carouselConfigCustom.modeConfig || {}}
//         style={styles.carousel}
//         snapEnabled
//       />
//     </View>
//   );
// };

// export default AdsList;











// import React, { useEffect, useMemo } from 'react';
// import { StyleSheet, View, useWindowDimensions } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
//   runOnJS,
// } from 'react-native-reanimated';

// import AdCard from './AdCard';

// /**
//  * This now matches your LoginScreen scaling approach:
//  *   baseWidth = width > 375 ? 460 : 500
//  *   scaleFactor = width / baseWidth
//  */
// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   const { width: screenWidth, height: screenHeight } = useWindowDimensions();

//   // 1) Matching your LoginScreen approach
//   const baseWidth = screenWidth > 375 ? 460 : 500;
//   const scaleFactor = screenWidth / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   // 2) If no ads, return early
//   if (!ads || !ads.length) return null;

//   // Determine the template
//   const templateId = ads[0]?.templateId || 'newCourse';

//   // Basic config
//   let carouselConfigCustom = {};
//   let continuousScroll = false;
//   if (templateId === 'promo') {
//     carouselConfigCustom = { mode: 'default', autoPlay: false };
//     continuousScroll = true;
//   } else if (templateId === 'newCourse') {
//     carouselConfigCustom = {
//       mode: 'horizontal-stack',
//       autoPlay: true,
//       autoPlayInterval: 2500,
//       scrollAnimationDuration: 600,
//       modeConfig: {
//         activeStackOffset: -40 * scaleFactor,
//         inactiveStackScale: 1,
//         inactiveStackOffset: 10 * scaleFactor,
//       },
//     };
//   } else if (templateId === 'sale') {
//     carouselConfigCustom = {
//       mode: 'horizontal-stack',
//       autoPlay: true,
//       autoPlayInterval: 3000,
//       scrollAnimationDuration: 800,
//     };
//   } else if (templateId === 'event') {
//     carouselConfigCustom = { mode: 'tinder', autoPlay: false };
//   } else {
//     carouselConfigCustom = {
//       mode: 'default',
//       autoPlay: true,
//       autoPlayInterval: 3000,
//       scrollAnimationDuration: 800,
//     };
//   }

//   // Show pagination for these templates
//   const paginationTemplates = ['event'];
//   const shouldShowPagination = paginationTemplates.includes(templateId);

//   // Check for custom overrides
//   const override = ads[0]?.customStyles?.templateOverride || {};
//   const defaultCardWidth = templateId === 'sale' ? 330 : 300;
//   const defaultCardHeight = templateId === 'newCourse' ? 250 : 260;

//   // Our final card dimensions
//   const finalCardWidth = override.cardWidth ? scale(override.cardWidth) : scale(defaultCardWidth);
//   let finalCardHeight = override.cardHeight ? scale(override.cardHeight) : scale(defaultCardHeight);

//   // Cap to 40% of screen
//   const maxCardHeight = screenHeight * 0.4;
//   if (finalCardHeight > maxCardHeight) finalCardHeight = maxCardHeight;

//   // We can define local styles in a useMemo so they recalc on dimension changes
//   const styles = useMemo(
//     () =>
//       StyleSheet.create({
//         container: {
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginVertical: scale(10),
//         },
//         carousel: {
//           marginVertical: scale(20),
//         },
//         animatedItem: {
//           justifyContent: 'center',
//           alignItems: 'center',
//         },
//         marqueeContainer: {
//           flexDirection: 'row',
//           overflow: 'hidden',
//           alignItems: 'center',
//         },
//         marqueeItem: {},
//         paginationContainer: {
//           position: 'absolute',
//           bottom: scale(18),
//           flexDirection: 'row',
//           alignSelf: 'center',
//         },
//         paginationDot: {
//           width: scale(8),
//           height: scale(8),
//           borderRadius: scale(4),
//           marginHorizontal: scale(4),
//         },
//       }),
//     [scaleFactor]
//   );

//   const CARD_MARGIN = scale(10);

//   // For continuous scroll
//   const scrollX = useSharedValue(0);

//   useEffect(() => {
//     if (continuousScroll) {
//       const effectiveCardWidth = finalCardWidth + CARD_MARGIN * 2;
//       const totalScrollDistance = ads.length * effectiveCardWidth;

//       // Animate function
//       const animate = () => {
//         scrollX.value = withTiming(
//           totalScrollDistance,
//           { duration: 15000, easing: Easing.linear },
//           (finished) => {
//             if (finished) {
//               scrollX.value = 0;
//               runOnJS(animate)(); // loop
//             }
//           }
//         );
//       };
//       animate();
//     }
//   }, [continuousScroll, finalCardWidth, ads.length, CARD_MARGIN, scrollX]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? -scrollX.value : 0 }],
//   }));

//   // Render pagination
//   const renderPagination = (index) => (
//     <View style={styles.paginationContainer}>
//       {ads.map((_, i) => (
//         <View
//           key={i}
//           style={[
//             styles.paginationDot,
//             {
//               backgroundColor: i === index ? currentTheme.primaryColor || '#00aced' : '#ccc',
//             },
//           ]}
//         />
//       ))}
//     </View>
//   );

//   const renderItem = ({ item, index }) => {
//     let extraStyle = {};
//     if (templateId === 'newCourse') {
//       extraStyle = {
//         transform: [{ rotate: index % 2 === 0 ? '5deg' : '-5deg' }],
//       };
//     }

//     return (
//       <Animated.View
//         style={[
//           styles.animatedItem,
//           {
//             width: finalCardWidth,
//             height: finalCardHeight,
//             marginHorizontal: CARD_MARGIN,
//           },
//           continuousScroll && animatedStyle,
//           extraStyle,
//         ]}
//       >
//         <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//         {!continuousScroll && shouldShowPagination && renderPagination(index)}
//       </Animated.View>
//     );
//   };

//   if (continuousScroll) {
//     // Marquee-style continuous scrolling
//     return (
//       <View style={[styles.container, { height: finalCardHeight }]}>
//         <Animated.View
//           style={[
//             styles.marqueeContainer,
//             animatedStyle,
//             { height: finalCardHeight, paddingHorizontal: CARD_MARGIN },
//           ]}
//         >
//           {ads.concat(ads).map((item, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.marqueeItem,
//                 {
//                   width: finalCardWidth,
//                   height: finalCardHeight,
//                   marginHorizontal: CARD_MARGIN,
//                 },
//               ]}
//             >
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       </View>
//     );
//   }

//   // Otherwise normal carousel
//   return (
//     <View style={[styles.container, { height: finalCardHeight }]}>
//       <Carousel
//         data={ads}
//         renderItem={renderItem}
//         width={finalCardWidth + CARD_MARGIN * 2}
//         height={finalCardHeight}
//         loop
//         autoPlay={carouselConfigCustom.autoPlay}
//         autoPlayInterval={carouselConfigCustom.autoPlayInterval}
//         scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
//         mode={carouselConfigCustom.mode}
//         modeConfig={carouselConfigCustom.modeConfig || {}}
//         style={styles.carousel}
//         snapEnabled
//       />
//     </View>
//   );
// };

// export default AdsList;










// import React, { useEffect } from 'react';
// import { StyleSheet, View, useWindowDimensions } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withTiming,
//   Easing,
//   runOnJS,
// } from 'react-native-reanimated';
// import AdCard from './AdCard';

// // Set your design baseline width (from your original design)
// const guidelineBaseWidth = 375;

// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   const { width: screenWidth, height: screenHeight } = useWindowDimensions();

//   // Scale helper: adjusts size relative to screen width
//   const scale = (size) => (screenWidth / guidelineBaseWidth) * size;

//   // Determine template type from first ad (default to newCourse)
//   const templateId = ads[0]?.templateId || 'newCourse';
//   // console.log(ads.length, templateId);

//   let carouselConfigCustom = {};
//   let continuousScroll = false;
//   if (templateId === 'promo') {
//     carouselConfigCustom = { mode: 'default', autoPlay: false };
//     continuousScroll = true;
//   } else if (templateId === 'newCourse') {
//     carouselConfigCustom = {
//       mode: 'horizontal-stack',
//       autoPlay: true,
//       autoPlayInterval: 2500,
//       scrollAnimationDuration: 600,
//       modeConfig: {
//         activeStackOffset: -40 * (screenWidth / guidelineBaseWidth),
//         inactiveStackScale: 1,
//         inactiveStackOffset: 10 * (screenWidth / guidelineBaseWidth),
//       },
//     };
//   } else if (templateId === 'sale') {
//     carouselConfigCustom = { mode: 'horizontal-stack', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   } else if (templateId === 'event') {
//     carouselConfigCustom = { mode: 'tinder', autoPlay: false };
//   } else {
//     carouselConfigCustom = { mode: 'default', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   }

//   const paginationTemplates = ['event'];
//   const shouldShowPagination = paginationTemplates.includes(templateId);

//   // Use custom or default dimensions
//   const override = ads[0]?.customStyles?.templateOverride || {};
//   const defaultCardWidth = templateId === 'sale' ? 330 : 300;
//   const defaultCardHeight = templateId === 'newCourse' ? 250 : 260;

//   const finalCardWidth = override.cardWidth ? scale(override.cardWidth) : scale(defaultCardWidth);
//   let finalCardHeight = override.cardHeight ? scale(override.cardHeight) : scale(defaultCardHeight);

//   // Clamp height if exceeds 40% of screen height
//   const maxCardHeight = screenHeight * 0.4;
//   if (finalCardHeight > maxCardHeight) {
//     finalCardHeight = maxCardHeight;
//   }

//   // Constant margin for each card
//   const CARD_MARGIN = 10;
  
//   // Shared value for continuous scroll
//   const scrollX = useSharedValue(0);
//   useEffect(() => {
//     if (continuousScroll) {
//       // Effective width per card including left/right margins
//       const effectiveCardWidth = finalCardWidth + CARD_MARGIN * 2;
//       // Total scroll distance for one set of promo cards
//       const totalScrollDistance = ads.length * effectiveCardWidth;

//       // Recursive animation loop for smooth continuous scroll
//       const animate = () => {
//         scrollX.value = withTiming(
//           totalScrollDistance,
//           { duration: 15000, easing: Easing.linear },
//           (finished) => {
//             if (finished) {
//               scrollX.value = 0; // reset to start position
//               runOnJS(animate)(); // call animate on the JS thread
//             }
//           }
//         );
//       };
//       animate();
//     }
//   }, [continuousScroll, finalCardWidth, ads.length, CARD_MARGIN, scrollX]);

//   // Use negative translate to move leftwards
//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? -scrollX.value : 0 }],
//   }));

//   const renderPagination = (index) => (
//     <View style={styles.paginationContainer}>
//       {ads.map((_, i) => (
//         <View
//           key={i}
//           style={[
//             styles.paginationDot,
//             { backgroundColor: i === index ? currentTheme.primaryColor || '#00aced' : '#ccc' },
//           ]}
//         />
//       ))}
//     </View>
//   );

//   const renderItem = ({ item, index }) => {
//     let extraStyle = {};
//     if (templateId === 'newCourse') {
//       extraStyle = { transform: [{ rotate: index % 2 === 0 ? '5deg' : '-5deg' }] };
//     }
//     return (
//       <Animated.View
//         style={[
//           styles.animatedItem,
//           { width: finalCardWidth, height: finalCardHeight, marginHorizontal: CARD_MARGIN },
//           continuousScroll && animatedStyle,
//           extraStyle,
//         ]}
//       >
//         <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//         {!continuousScroll && shouldShowPagination && renderPagination(index)}
//       </Animated.View>
//     );
//   };

//   return (
//     <View style={[styles.container, { height: finalCardHeight }]}>
//       {continuousScroll ? (
//         <Animated.View
//           style={[
//             styles.marqueeContainer,
//             animatedStyle,
//             { height: finalCardHeight, paddingHorizontal: CARD_MARGIN },
//           ]}
//         >
//           {ads.concat(ads).map((item, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.marqueeItem,
//                 { width: finalCardWidth, height: finalCardHeight, marginHorizontal: CARD_MARGIN },
//               ]}
//             >
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       ) : (
//         <Carousel
//           data={ads}
//           renderItem={renderItem}
//           width={finalCardWidth + CARD_MARGIN * 2}
//           height={finalCardHeight}
//           loop
//           autoPlay={carouselConfigCustom.autoPlay}
//           autoPlayInterval={carouselConfigCustom.autoPlayInterval}
//           scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
//           mode={carouselConfigCustom.mode}
//           modeConfig={carouselConfigCustom.modeConfig || {}}
//           style={styles.carousel}
//           snapEnabled
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { justifyContent: 'center', alignItems: 'center', marginVertical: 0 },
//   carousel: { marginVertical: 20 },
//   animatedItem: { justifyContent: 'center', alignItems: 'center' },
//   marqueeContainer: { flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
//   marqueeItem: {},
//   paginationContainer: { position: 'absolute', bottom: 18, flexDirection: 'row', alignSelf: 'center' },
//   paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
// });

// export default AdsList;









// import React, { useEffect } from 'react';
// import { StyleSheet, View, useWindowDimensions } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, {
//   useSharedValue,
//   useAnimatedStyle,
//   withRepeat,
//   withTiming,
//   Easing,
// } from 'react-native-reanimated';
// import AdCard from './AdCard';

// // Set your design baseline width (from your original design)
// const guidelineBaseWidth = 375;

// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   const { width: screenWidth, height: screenHeight } = useWindowDimensions();

//   // Helper scaling function: scales a given size relative to screen width
//   const scale = (size) => (screenWidth / guidelineBaseWidth) * size;

//   // Determine template type from first ad (default to newCourse)
//   const templateId = ads[0]?.templateId || 'newCourse';

//   // Configure carousel settings per template
//   let carouselConfigCustom = {};
//   let continuousScroll = false;
//   if (templateId === 'promo') {
//     carouselConfigCustom = { mode: 'default', autoPlay: false };
//     continuousScroll = true;
//   } else if (templateId === 'newCourse') {
//     carouselConfigCustom = {
//       mode: 'horizontal-stack',
//       autoPlay: true,
//       autoPlayInterval: 2500,
//       scrollAnimationDuration: 600,
//       modeConfig: {
//         activeStackOffset: -40 * (screenWidth / guidelineBaseWidth),
//         inactiveStackScale: 1,
//         inactiveStackOffset: 10 * (screenWidth / guidelineBaseWidth),
//       },
//     };
//   } else if (templateId === 'sale') {
//     carouselConfigCustom = { mode: 'horizontal-stack', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   } else if (templateId === 'event') {
//     carouselConfigCustom = { mode: 'tinder', autoPlay: false };
//   } else {
//     carouselConfigCustom = { mode: 'default', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   }

//   // For templates like "event" where we show pagination dots
//   const paginationTemplates = ['event'];
//   const shouldShowPagination = paginationTemplates.includes(templateId);

//   // Use your templateStyles dimensions as the baseline.
//   // If there is a custom override, use that; otherwise, use the default numbers.
//   const override = ads[0]?.customStyles?.templateOverride || {};
//   const defaultCardWidth = templateId === 'sale' ? 330 : 300;
//   const defaultCardHeight = templateId === 'newCourse' ? 250 : 260;

//   // Calculate final dimensions using our scale helper
//   const finalCardWidth = override.cardWidth ? scale(override.cardWidth) : scale(defaultCardWidth);
//   let finalCardHeight = override.cardHeight ? scale(override.cardHeight) : scale(defaultCardHeight);

//   // Optional: if the computed card height exceeds 40% of screen height, clamp it
//   const maxCardHeight = screenHeight * 0.4;
//   if (finalCardHeight > maxCardHeight) {
//     finalCardHeight = maxCardHeight;
//   }

//   // For continuous scroll (promo) animations
//   const scrollX = useSharedValue(0);
//   useEffect(() => {
//     if (continuousScroll) {
//       scrollX.value = withRepeat(
//         withTiming(-finalCardWidth, { duration: 7000, easing: Easing.linear }),
//         -1,
//         false
//       );
//     }
//   }, [continuousScroll, finalCardWidth, scrollX]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? scrollX.value : 0 }],
//   }));

//   const renderPagination = (index) => (
//     <View style={styles.paginationContainer}>
//       {ads.map((_, i) => (
//         <View
//           key={i}
//           style={[
//             styles.paginationDot,
//             { backgroundColor: i === index ? currentTheme.primaryColor || '#00aced' : '#ccc' },
//           ]}
//         />
//       ))}
//     </View>
//   );

//   // Optionally add extra rotation for newCourse mode
//   const renderItem = ({ item, index }) => {
//     let extraStyle = {};
//     if (templateId === 'newCourse') {
//       extraStyle = { transform: [{ rotate: index % 2 === 0 ? '5deg' : '-5deg' }] };
//     }
//     return (
//       <Animated.View
//         style={[
//           styles.animatedItem,
//           { width: finalCardWidth, height: finalCardHeight },
//           continuousScroll && animatedStyle,
//           extraStyle,
//         ]}
//       >
//         <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//         {!continuousScroll && shouldShowPagination && renderPagination(index)}
//       </Animated.View>
//     );
//   };

//   return (
//     <View style={[styles.container, { height: finalCardHeight }]}>
//       {continuousScroll ? (
//         <Animated.View style={[styles.marqueeContainer, animatedStyle, { height: finalCardHeight }]}>
//           {ads.concat(ads).map((item, index) => (
//             <View key={index} style={[styles.marqueeItem, { width: finalCardWidth, height: finalCardHeight }]}>
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       ) : (
//         <Carousel
//           data={ads}
//           renderItem={renderItem}
//           width={finalCardWidth}
//           height={finalCardHeight}
//           loop
//           autoPlay={carouselConfigCustom.autoPlay}
//           autoPlayInterval={carouselConfigCustom.autoPlayInterval}
//           scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
//           mode={carouselConfigCustom.mode}
//           modeConfig={carouselConfigCustom.modeConfig || {}}
//           style={styles.carousel}
//           snapEnabled
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { justifyContent: 'center', alignItems: 'center', marginVertical: 0 },
//   // carousel: { marginVertical: 20 },
//   animatedItem: { justifyContent: 'center', alignItems: 'center' },
//   marqueeContainer: { flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
//   marqueeItem: { marginHorizontal: 10 },
//   paginationContainer: { position: 'absolute', bottom: 18, flexDirection: 'row', alignSelf: 'center' },
//   paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
// });

// export default AdsList;









// import React, { useEffect } from 'react';
// import { StyleSheet, View, Dimensions } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
// import AdCard from './AdCard';

// const { width: screenWidth } = Dimensions.get('window');
// const baseWidth = 375; // Design baseline width
// const scale = screenWidth / baseWidth;

// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   // Determine template type from the first ad
//   const templateId = ads[0]?.templateId || 'newCourse';

//   // Set unique carousel configuration based on templateId
//   let carouselConfigCustom = {};
//   let continuousScroll = false;
  
//   if (templateId === 'promo') {
//     carouselConfigCustom = { mode: 'default', autoPlay: false };
//     continuousScroll = true;
//   } else if (templateId === 'newCourse') {
//     // Use horizontal-stack mode with custom modeConfig for deck-like overlapping
//     carouselConfigCustom = { 
//       mode: 'horizontal-stack', 
//       autoPlay: true, 
//       autoPlayInterval: 2500, 
//       scrollAnimationDuration: 600,
//       modeConfig: { 
//         activeStackOffset: -40 * scale,
//         inactiveStackScale: 1,
//         inactiveStackOffset: 10 * scale,
//       }
//     };
//   } else if (templateId === 'sale') {
//     carouselConfigCustom = { mode: 'horizontal-stack', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   } else if (templateId === 'event') {
//     carouselConfigCustom = { mode: 'tinder', autoPlay: false };
//   } else {
//     carouselConfigCustom = { mode: 'default', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   }

//   // Show pagination only on selective templates
//   const paginationTemplates = [ 'event'];
//   const shouldShowPagination = paginationTemplates.includes(templateId);

//   // Use template-specific dimensions with responsive scaling
//   const override = ads[0]?.customStyles?.templateOverride || {};
//   const defaultCardWidth = templateId === 'sale' ? 330 : 300;
//   const defaultCardHeight = templateId === 'newCourse' ? 250 : 260;
//   const finalCardWidth = override.cardWidth ? override.cardWidth * scale : defaultCardWidth * scale;
//   const finalCardHeight = override.cardHeight ? override.cardHeight * scale : defaultCardHeight * scale;

//   // Continuous scroll marquee effect if enabled
//   const scrollX = useSharedValue(0);
//   useEffect(() => {
//     if (continuousScroll) {
//       scrollX.value = withRepeat(
//         withTiming(-finalCardWidth, { duration: 7000, easing: Easing.linear }),
//         -1,
//         false
//       );
//     }
//   }, [continuousScroll, finalCardWidth, scrollX]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? scrollX.value : 0 }],
//   }));

//   // Render pagination dots if applicable
//   const renderPagination = (index) => (
//     <View style={styles.paginationContainer}>
//       {ads.map((_, i) => (
//         <View
//           key={i}
//           style={[
//             styles.paginationDot,
//             { backgroundColor: i === index ? currentTheme.primaryColor || '#00aced' : '#ccc' },
//           ]}
//         />
//       ))}
//     </View>
//   );

//   // Optionally apply alternating rotation for New Course mode
//   const renderItem = ({ item, index }) => {
//     let extraStyle = {};
//     if (templateId === 'newCourse') {
//       extraStyle = { transform: [{ rotate: index % 2 === 0 ? '5deg' : '-5deg' }] };
//     }
//     return (
//       <Animated.View
//         style={[
//           styles.animatedItem,
//           { width: finalCardWidth, height: finalCardHeight },
//           continuousScroll && animatedStyle,
//           extraStyle,
//         ]}
//       >
//         <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//         {!continuousScroll && shouldShowPagination && renderPagination(index)}
//       </Animated.View>
//     );
//   };

//   return (
//     <View style={[styles.container, { height: finalCardHeight }]}>
//       {continuousScroll ? (
//         <Animated.View style={[styles.marqueeContainer, animatedStyle, { height: finalCardHeight }]}>
//           {ads.concat(ads).map((item, index) => (
//             <View key={index} style={[styles.marqueeItem, { width: finalCardWidth, height: finalCardHeight }]}>
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       ) : (
//         <Carousel
//           data={ads}
//           renderItem={renderItem}
//           width={finalCardWidth}
//           height={finalCardHeight}
//           loop
//           autoPlay={carouselConfigCustom.autoPlay}
//           autoPlayInterval={carouselConfigCustom.autoPlayInterval}
//           scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
//           mode={carouselConfigCustom.mode}
//           modeConfig={carouselConfigCustom.modeConfig || {}}
//           style={styles.carousel}
//           snapEnabled
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
//   carousel: { marginVertical: 20 },
//   animatedItem: { justifyContent: 'center', alignItems: 'center' },
//   marqueeContainer: { flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
//   marqueeItem: { marginHorizontal: 10 },
//   paginationContainer: { position: 'absolute', bottom: 8, flexDirection: 'row', alignSelf: 'center' },
//   paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
// });

// export default AdsList;









// import React, { useEffect } from 'react';
// import { StyleSheet, View } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
// import AdCard from './AdCard';

// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   // Determine template type from the first ad
//   const templateId = ads[0]?.templateId || 'newCourse';

//   // Set unique carousel configuration based on templateId
//   let carouselConfigCustom = {};
//   let continuousScroll = false;
  
//   if (templateId === 'promo') {
//     carouselConfigCustom = { mode: 'default', autoPlay: false };
//     continuousScroll = true;
//   } else if (templateId === 'newCourse') {
//     // For New Course, use horizontal-stack mode with custom configuration
//     // that causes the cards to overlap like a deck.
//     carouselConfigCustom = { 
//       mode: 'horizontal-stack', 
//       autoPlay: true, 
//       autoPlayInterval: 2500, 
//       scrollAnimationDuration: 600,
//       modeConfig: { 
//         activeStackOffset: -40,  // negative offset moves active card leftward
//         inactiveStackScale: 1,   // keep inactive cards at full scale
//         inactiveStackOffset: 10, // slight positive offset for spacing
//       }
//     };
//   } else if (templateId === 'sale') {
//     carouselConfigCustom = { mode: 'horizontal-stack', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   } else if (templateId === 'event') {
//     carouselConfigCustom = { mode: 'tinder', autoPlay: false };
//   } else {
//     carouselConfigCustom = { mode: 'default', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   }

//   // Only show pagination on selective templates
//   const paginationTemplates = ['newCourse', 'event'];
//   const shouldShowPagination = paginationTemplates.includes(templateId);

//   // Use template-specific dimensions if provided via templateOverride; else fallback to defaults.
//   const override = ads[0]?.customStyles?.templateOverride || {};
//   const finalCardWidth = override.cardWidth || (templateId === 'sale' ? 330 : 300);
//   const finalCardHeight = override.cardHeight || (templateId === 'newCourse' ? 250 : 260);

//   // Continuous scroll marquee effect if enabled
//   const scrollX = useSharedValue(0);
//   useEffect(() => {
//     if (continuousScroll) {
//       scrollX.value = withRepeat(
//         withTiming(-finalCardWidth, { duration: 7000, easing: Easing.linear }),
//         -1,
//         false
//       );
//     }
//   }, [continuousScroll, finalCardWidth, scrollX]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? scrollX.value : 0 }],
//   }));

//   // Render pagination dots if applicable
//   const renderPagination = (index) => (
//     <View style={styles.paginationContainer}>
//       {ads.map((_, i) => (
//         <View
//           key={i}
//           style={[
//             styles.paginationDot,
//             { backgroundColor: i === index ? currentTheme.primaryColor || '#00aced' : '#ccc' },
//           ]}
//         />
//       ))}
//     </View>
//   );

//   // Apply alternating rotation for New Course mode (optional)
//   const renderItem = ({ item, index }) => {
//     let extraStyle = {};
//     if (templateId === 'newCourse') {
//       extraStyle = { transform: [{ rotate: index % 2 === 0 ? '5deg' : '-5deg' }] };
//     }
//     return (
//       <Animated.View
//         style={[
//           styles.animatedItem,
//           { width: finalCardWidth, height: finalCardHeight },
//           continuousScroll && animatedStyle,
//           extraStyle,
//         ]}
//       >
//         <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//         {!continuousScroll && shouldShowPagination && renderPagination(index)}
//       </Animated.View>
//     );
//   };

//   return (
//     <View style={[styles.container, { height: finalCardHeight }]}>
//       {continuousScroll ? (
//         <Animated.View style={[styles.marqueeContainer, animatedStyle, { height: finalCardHeight }]}>
//           {ads.concat(ads).map((item, index) => (
//             <View key={index} style={[styles.marqueeItem, { width: finalCardWidth, height: finalCardHeight }]}>
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       ) : (
//         <Carousel
//           data={ads}
//           renderItem={renderItem}
//           width={finalCardWidth}
//           height={finalCardHeight}
//           loop
//           autoPlay={carouselConfigCustom.autoPlay}
//           autoPlayInterval={carouselConfigCustom.autoPlayInterval}
//           scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
//           mode={carouselConfigCustom.mode}
//           modeConfig={carouselConfigCustom.modeConfig || {}}
//           style={styles.carousel}
//           snapEnabled
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
//   carousel: { marginVertical: 20 },
//   animatedItem: { justifyContent: 'center', alignItems: 'center' },
//   marqueeContainer: { flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
//   marqueeItem: { marginHorizontal: 10 },
//   paginationContainer: { position: 'absolute', bottom: 8, flexDirection: 'row', alignSelf: 'center' },
//   paginationDot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 4 },
// });

// export default AdsList;





// import React, { useEffect } from 'react';
// import { StyleSheet, View, Text } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
// import AdCard from './AdCard';

// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   // Determine template type from the first ad
//   const templateId = ads[0]?.templateId || 'newCourse';

//   // Set unique carousel configuration based on templateId
//   let carouselConfigCustom = {};
//   let continuousScroll = false;
  
//   if (templateId === 'promo') {
//     // For promo ads, use continuous marquee scrolling
//     carouselConfigCustom = { mode: 'default', autoPlay: false };
//     continuousScroll = true;
//   } else if (templateId === 'newCourse') {
//     // For new course, use a stacked carousel with faster autoplay
//     carouselConfigCustom = { mode: 'stack', autoPlay: true, autoPlayInterval: 2500, scrollAnimationDuration: 600 };
//   } else if (templateId === 'sale') {
//     // For sale, use horizontal-stack effect with standard timing
//     carouselConfigCustom = { mode: 'horizontal-stack', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   } else if (templateId === 'event') {
//     // For events, use a Tinder-like carousel without autoplay
//     carouselConfigCustom = { mode: 'tinder', autoPlay: false };
//   } else {
//     carouselConfigCustom = { mode: 'default', autoPlay: true, autoPlayInterval: 3000, scrollAnimationDuration: 800 };
//   }

//   // Use template-specific dimensions if provided via templateOverride; else fallback to defaults.
//   const override = ads[0]?.customStyles?.templateOverride || {};
//   const finalCardWidth = override.cardWidth || (templateId === 'sale' ? 330 : 300);
//   const finalCardHeight = override.cardHeight || (templateId === 'newCourse' ? 250 : 260);

//   // If continuous scroll is enabled, set up a marquee effect.
//   const scrollX = useSharedValue(0);
//   useEffect(() => {
//     if (continuousScroll) {
//       scrollX.value = withRepeat(
//         withTiming(-finalCardWidth, { duration: 7000, easing: Easing.linear }),
//         -1,
//         false
//       );
//     }
//   }, [continuousScroll, finalCardWidth, scrollX]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? scrollX.value : 0 }],
//   }));

//   // Optional custom pagination indicator for non-continuous modes
//   const renderPagination = (index) => (
//     <View style={styles.paginationContainer}>
//       {ads.map((_, i) => (
//         <View
//           key={i}
//           style={[
//             styles.paginationDot,
//             { backgroundColor: i === index ? currentTheme.primaryColor || '#00aced' : '#ccc' },
//           ]}
//         />
//       ))}
//     </View>
//   );

//   const renderItem = ({ item, index }) => (
//     <Animated.View
//       style={[
//         styles.animatedItem,
//         { width: finalCardWidth, height: finalCardHeight },
//         continuousScroll && animatedStyle,
//       ]}
//     >
//       <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//       {!continuousScroll && renderPagination(index)}
//     </Animated.View>
//   );

//   return (
//     <View style={[styles.container, { height: finalCardHeight }]}>
//       {continuousScroll ? (
//         <Animated.View style={[styles.marqueeContainer, animatedStyle, { height: finalCardHeight }]}>
//           {ads.concat(ads).map((item, index) => (
//             <View key={index} style={[styles.marqueeItem, { width: finalCardWidth, height: finalCardHeight }]}>
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       ) : (
//         <Carousel
//           data={ads}
//           renderItem={renderItem}
//           width={finalCardWidth}
//           height={finalCardHeight}
//           loop
//           autoPlay={carouselConfigCustom.autoPlay}
//           autoPlayInterval={carouselConfigCustom.autoPlayInterval}
//           scrollAnimationDuration={carouselConfigCustom.scrollAnimationDuration}
//           mode={carouselConfigCustom.mode}
//           modeConfig={carouselConfigCustom.modeConfig || {}}
//           style={styles.carousel}
//           snapEnabled
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { justifyContent: 'center', alignItems: 'center', marginVertical: 15 },
//   carousel: { marginVertical: 20 },
//   animatedItem: { justifyContent: 'center', alignItems: 'center' },
//   marqueeContainer: { flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
//   marqueeItem: { marginHorizontal: 10 },
//   paginationContainer: {
//     position: 'absolute',
//     bottom: 8,
//     flexDirection: 'row',
//     alignSelf: 'center',
//   },
//   paginationDot: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     marginHorizontal: 4,
//   },
// });

// export default AdsList;




// // src/components/AdsList.js
// import React, { useEffect } from 'react';
// import { StyleSheet, View } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
// import AdCard from './AdCard';
// import { templateStyles } from './templateStyles';

// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   // Assume all ads in this section share the same template.
//   const templateId = ads[0]?.templateId || 'newCourse';
//   const baseStyle = templateStyles[templateId] || templateStyles.newCourse;
//   const { cardWidth, cardHeight, carousel: carouselConfig } = baseStyle;
//   const continuousScroll = carouselConfig.continuousScroll;
//   const mode = carouselConfig.mode;
//   const modeConfig = carouselConfig.modeConfig || {};
//   const scrollX = useSharedValue(0);

//   useEffect(() => {
//     if (continuousScroll) {
//       scrollX.value = withRepeat(withTiming(-cardWidth, { duration: 7000, easing: Easing.linear }), -1, false);
//     }
//   }, [continuousScroll, cardWidth]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? scrollX.value : 0 }],
//   }));

//   const renderItem = ({ item, index }) => (
//     <Animated.View style={[styles.animatedItem, { width: cardWidth, height: cardHeight }, continuousScroll ? animatedStyle : {}]}>
//       <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//     </Animated.View>
//   );

//   return (
//     <View style={[styles.container, { height: cardHeight }]}>
//       {continuousScroll ? (
//         <Animated.View style={[styles.marqueeContainer, animatedStyle, { height: cardHeight }]}>
//           {ads.concat(ads).map((item, index) => (
//             <View key={index} style={[styles.marqueeItem, { width: cardWidth, height: cardHeight }]}>
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       ) : (
//         <Carousel
//           data={ads}
//           renderItem={renderItem}
//           width={cardWidth}
//           height={cardHeight}
//           loop
//           autoPlay
//           autoPlayInterval={3000}
//           scrollAnimationDuration={800}
//           mode={mode}
//           modeConfig={modeConfig}
//           style={styles.carousel}
//           snapEnabled
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
//   carousel: { marginVertical: 20 },
//   animatedItem: { justifyContent: 'center', alignItems: 'center' },
//   marqueeContainer: { flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
//   marqueeItem: { marginHorizontal: 10 },
// });

// export default AdsList;










// // src/components/AdsList.js
// import React, { useEffect } from 'react';
// import { StyleSheet, View } from 'react-native';
// import Carousel from 'react-native-reanimated-carousel';
// import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
// import AdCard from './AdCard';
// import { templateStyles } from './templateStyles';

// const AdsList = ({ ads, onAdPress, currentTheme }) => {
//   // Assume all ads in the section share the same template.
//   const templateId = ads[0]?.templateId || 'newCourse';
//   const baseStyle = templateStyles[templateId] || templateStyles.newCourse;
//   const cardWidth = baseStyle.cardWidth;
//   const cardHeight = baseStyle.cardHeight;
//   const continuousScroll = false; // Using carousel layout for a professional look.
//   const scrollX = useSharedValue(0);

//   useEffect(() => {
//     if (continuousScroll) {
//       scrollX.value = withRepeat(withTiming(-cardWidth, { duration: 7000, easing: Easing.linear }), -1, false);
//     }
//   }, [continuousScroll, cardWidth]);

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ translateX: continuousScroll ? scrollX.value : 0 }],
//   }));

//   const renderItem = ({ item, index }) => (
//     <Animated.View style={[styles.animatedItem, { width: cardWidth, height: cardHeight }, continuousScroll ? animatedStyle : {}]}>
//       <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//     </Animated.View>
//   );

//   return (
//     <View style={[styles.container, { height: cardHeight }]}>
//       {continuousScroll ? (
//         <Animated.View style={[styles.marqueeContainer, animatedStyle, { height: cardHeight }]}>
//           {ads.concat(ads).map((item, index) => (
//             <View key={index} style={[styles.marqueeItem, { width: cardWidth, height: cardHeight }]}>
//               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
//             </View>
//           ))}
//         </Animated.View>
//       ) : (
//         <Carousel
//           data={ads}
//           renderItem={renderItem}
//           width={cardWidth}
//           height={cardHeight}
//           loop
//           autoPlay
//           autoPlayInterval={3000}
//           scrollAnimationDuration={800}
//           style={styles.carousel}
//           snapEnabled
//         />
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
//   carousel: { marginVertical: 20 },
//   animatedItem: { justifyContent: 'center', alignItems: 'center' },
//   marqueeContainer: { flexDirection: 'row', overflow: 'hidden', alignItems: 'center' },
//   marqueeItem: { marginHorizontal: 10 },
// });

// export default AdsList;










// // import React, { useEffect } from 'react';
// // import { StyleSheet, Dimensions, View } from 'react-native';
// // import Carousel from 'react-native-reanimated-carousel';
// // import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
// // import AdCard from './AdCard';

// // const { width: viewportWidth } = Dimensions.get('window');

// // // Configurations for categories
// // const categoryCarouselConfig = {
// //   'New Course': {
// //     mode: 'depth',
// //     modeConfig: { depth: 200 },
// //   },
// //   Product: {
// //     mode: 'default', // Prevents coverflow issues
// //     modeConfig: {},
// //     continuousScroll: true,
// //   },
// //   Sale: {
// //     mode: 'horizontal-stack',
// //     modeConfig: { activeStackScale: 0.85, activeStackOffset: 30 },
// //   },
// //   Promotion: {
// //     mode: 'default', // Works best for marquee-style scrolling
// //     modeConfig: {},
// //     continuousScroll: true,
// //   },
// //   Event: {
// //     mode: 'tinder',
// //     modeConfig: { duration: 400 },
// //   },
// // };

// // const AdsList = ({ ads, onAdPress, currentTheme, category }) => {
// //   const carouselConfig = categoryCarouselConfig[category] || categoryCarouselConfig['New Course'];

// //   // Shared animation value for smooth scrolling
// //   const scrollX = useSharedValue(0);

// //   useEffect(() => {
// //     if (carouselConfig.continuousScroll) {
// //       scrollX.value = withRepeat(
// //         withTiming(-viewportWidth, { duration: 7000, easing: Easing.linear }),
// //         -1,
// //         false
// //       );
// //     }
// //   }, []);

// //   // Animation style for marquee effect
// //   const animatedStyle = useAnimatedStyle(() => ({
// //     transform: [{ translateX: carouselConfig.continuousScroll ? scrollX.value : 0 }],
// //   }));

// //   const renderItem = ({ item, index }) => (
// //     <Animated.View style={[styles.animatedItem, carouselConfig.continuousScroll ? animatedStyle : {}]}>
// //       <AdCard key={index} adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
// //     </Animated.View>
// //   );

// //   return (
// //     <View style={styles.container}>
// //       {carouselConfig.continuousScroll ? (
// //         // Continuous Scroll View for Promotion & Product
// //         <Animated.View style={[styles.marqueeContainer, animatedStyle]}>
// //           {ads.concat(ads).map((item, index) => (
// //             <View key={index} style={styles.marqueeItem}>
// //               <AdCard adData={item} onPress={() => onAdPress(item)} currentTheme={currentTheme} />
// //             </View>
// //           ))}
// //         </Animated.View>
// //       ) : (
// //         // Regular Carousel for other categories
// //         <Carousel
// //           data={ads}
// //           renderItem={renderItem}
// //           width={viewportWidth * 0.85}
// //           height={260}
// //           loop
// //           mode={carouselConfig.mode}
// //           modeConfig={carouselConfig.modeConfig}
// //           autoPlay
// //           autoPlayInterval={3000}
// //           scrollAnimationDuration={800}
// //           style={styles.carousel}
// //           snapEnabled
// //         />
// //       )}
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   carousel: {
// //     marginVertical: 20,
// //   },
// //   animatedItem: {
// //     width: viewportWidth * 0.85,
// //     height: 260,
// //     justifyContent: 'center',
// //     alignItems: 'center',
// //   },
// //   marqueeContainer: {
// //     flexDirection: 'row',
// //     width: viewportWidth * 2, // Double width for smooth loop
// //     overflow: 'hidden',
// //     alignItems: 'center',
// //   },
// //   marqueeItem: {
// //     width: viewportWidth * 0.85,
// //     height: 260,
// //     marginHorizontal: 10,
// //   },
// // });

// // export default AdsList;
