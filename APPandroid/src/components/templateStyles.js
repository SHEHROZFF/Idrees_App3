// File: src/components/templateStyles.js
import { useWindowDimensions } from 'react-native';

/**
 * Return dimension-based styles for each ad-card template.
 * This is just an example approach. You can tweak the baseline or
 * factor logic in whichever way suits your app design best.
 */
export const useResponsiveTemplateStyles = () => {
  const { width } = useWindowDimensions();
  // Choose any baseline you like:
  const guidelineBaseWidth = width > 375 ? 460 : 500;
  const scale = width / guidelineBaseWidth;

  return {
    promo: {
      cardHeight: 265 * scale,
      cardWidth: 350 * scale,
      gradientColors: ['#FF416C', '#FF4B2B'],
      badgeColor: '#FF4B2B',
      defaultImage: `https://via.placeholder.com/${Math.round(360 * scale)}x${Math.round(
        320 * scale
      )}.png?text=Promotion`,
      borderColor: '#FF416C',
      carousel: { mode: 'default', continuousScroll: true },
      inner: {
        badgeColor: '#FF4B2B',
        textColor: '#ffffff',
        fontSizeTitle: 23 * scale,
        fontWeightTitle: '900',
        fontSizeSubtitle: 18 * scale,
        fontSizeDetail: 15 * scale,
        textAlign: 'center',
        padding: 20 * scale,
      },
    },
    newCourse: {
      cardHeight: 250 * scale,
      cardWidth: 280 * scale,
      gradientColors: ['#00c6ff', '#0072ff'],
      badgeColor: '#0072ff',
      defaultImage: `https://via.placeholder.com/${Math.round(340 * scale)}x${Math.round(
        280 * scale
      )}.png?text=New+Course`,
      borderColor: '#00c6ff',
      carousel: {
        mode: 'stack',
        continuousScroll: false,
        modeConfig: { rotation: 10, scale: 0.85, offset: 20 * scale },
      },
      inner: {
        badgeColor: '#0072ff',
        textColor: '#ffffff',
        fontSizeTitle: 15 * scale,
        fontWeightTitle: '900',
        fontSizeSubtitle: 13 * scale,
        fontSizeDetail: 12 * scale,
        textAlign: 'left',
        padding: 18 * scale,
      },
    },
    sale: {
      cardHeight: 220 * scale,
      cardWidth: 400 * scale,
      gradientColors: ['#F7971E', '#FFD200'],
      badgeColor: '#F7971E',
      defaultImage: `https://via.placeholder.com/${Math.round(350 * scale)}x${Math.round(
        300 * scale
      )}.png?text=Sale`,
      borderColor: '#FFD200',
      carousel: {
        mode: 'horizontal-stack',
        continuousScroll: false,
        modeConfig: { activeStackScale: 0.85, activeStackOffset: 30 * scale },
      },
      inner: {
        badgeColor: '#F7971E',
        textColor: '#ffffff',
        fontSizeTitle: 23 * scale,
        fontWeightTitle: '900',
        fontSizeSubtitle: 18 * scale,
        fontSizeDetail: 14 * scale,
        textAlign: 'center',
        padding: 10 * scale,
      },
    },
    event: {
      cardHeight: 250 * scale,
      cardWidth: 330 * scale,
      gradientColors: ['#8E2DE2', '#4A00E0'],
      badgeColor: '#8E2DE2',
      defaultImage: `https://via.placeholder.com/${Math.round(380 * scale)}x${Math.round(
        340 * scale
      )}.png?text=Event`,
      borderColor: '#4A00E0',
      carousel: { mode: 'tinder', continuousScroll: false, modeConfig: { duration: 400 } },
      inner: {
        badgeColor: '#8E2DE2',
        textColor: '#ffffff',
        fontSizeTitle: 22 * scale,
        fontWeightTitle: '900',
        fontSizeSubtitle: 18 * scale,
        fontSizeDetail: 15 * scale,
        textAlign: 'center',
        padding: 20 * scale,
      },
    },
  };
};









// // templateStyles.js

// import { useWindowDimensions } from 'react-native';

// /**
//  * Return scaled dimension-based styles for each type of ad card template.
//  */
// export const useResponsiveTemplateStyles = () => {
//   const { width } = useWindowDimensions();
//   // Your design baseline
//   const guidelineBaseWidth = width > 375 ? 460 : 500;
//   const scale = width / guidelineBaseWidth;

//   return {
//     promo: {
//       cardHeight: 245 * scale,
//       cardWidth: 320 * scale,
//       gradientColors: ['#FF416C', '#FF4B2B'],
//       badgeColor: '#FF4B2B',
//       defaultImage: `https://via.placeholder.com/${Math.round(360 * scale)}x${Math.round(
//         320 * scale
//       )}.png?text=Promotion`,
//       borderColor: '#FF416C',
//       carousel: { mode: 'default', continuousScroll: true },
//       inner: {
//         // gradientColors: ['rgba(255,65,108,0.95)', 'rgba(255,75,43,0.85)'],
//         badgeColor: '#FF4B2B',
//         textColor: '#ffffff',
//         fontSizeTitle: 23 * scale,
//         fontWeightTitle: '900',
//         fontSizeSubtitle: 18 * scale,
//         fontSizeDetail: 15 * scale,
//         textAlign: 'center',
//         padding: 20 * scale,
//       },
//     },
//     newCourse: {
//       cardHeight: 250 * scale,
//       cardWidth: 280 * scale,
//       gradientColors: ['#00c6ff', '#0072ff'],
//       badgeColor: '#0072ff',
//       defaultImage: `https://via.placeholder.com/${Math.round(340 * scale)}x${Math.round(
//         280 * scale
//       )}.png?text=New+Course`,
//       borderColor: '#00c6ff',
//       carousel: {
//         mode: 'stack',
//         continuousScroll: false,
//         modeConfig: { rotation: 10, scale: 0.85, offset: 20 * scale },
//       },
//       inner: {
//         // gradientColors: ['rgba(0,198,255,0.95)', 'rgba(0,114,255,0.85)'],
//         badgeColor: '#0072ff',
//         textColor: '#ffffff',
//         fontSizeTitle: 15 * scale,
//         fontWeightTitle: '900',
//         fontSizeSubtitle: 13 * scale,
//         fontSizeDetail: 12 * scale,
//         textAlign: 'left',
//         padding: 18 * scale,
//       },
//     },
//     sale: {
//       cardHeight: 210 * scale,
//       cardWidth: 325 * scale,
//       gradientColors: ['#F7971E', '#FFD200'],
//       badgeColor: '#F7971E',
//       defaultImage: `https://via.placeholder.com/${Math.round(350 * scale)}x${Math.round(
//         300 * scale
//       )}.png?text=Sale`,
//       borderColor: '#FFD200',
//       carousel: {
//         mode: 'horizontal-stack',
//         continuousScroll: false,
//         modeConfig: { activeStackScale: 0.85, activeStackOffset: 30 * scale },
//       },
//       inner: {
//         // gradientColors: ['rgba(247,151,30,0.95)', 'rgba(255,210,0,0.85)'],
//         badgeColor: '#F7971E',
//         textColor: '#ffffff',
//         fontSizeTitle: 23 * scale,
//         fontWeightTitle: '900',
//         fontSizeSubtitle: 18 * scale,
//         fontSizeDetail: 14 * scale,
//         textAlign: 'center',
//         padding: 10 * scale,
//       },
//     },
//     event: {
//       cardHeight: 250 * scale,
//       cardWidth: 330 * scale,
//       gradientColors: ['#8E2DE2', '#4A00E0'],
//       badgeColor: '#8E2DE2',
//       defaultImage: `https://via.placeholder.com/${Math.round(380 * scale)}x${Math.round(
//         340 * scale
//       )}.png?text=Event`,
//       borderColor: '#4A00E0',
//       carousel: { mode: 'tinder', continuousScroll: false, modeConfig: { duration: 400 } },
//       inner: {
//         // gradientColors: ['rgba(142,45,226,0.95)', 'rgba(74,0,224,0.85)'],
//         badgeColor: '#8E2DE2',
//         textColor: '#ffffff',
//         fontSizeTitle: 22 * scale,
//         fontWeightTitle: '900',
//         fontSizeSubtitle: 18 * scale,
//         fontSizeDetail: 15 * scale,
//         textAlign: 'center',
//         padding: 20 * scale,
//       },
//     },
//   };
// };










// // templateStyles.js
// import { useWindowDimensions } from 'react-native';

// export const useResponsiveTemplateStyles = () => {
//   const { width } = useWindowDimensions();
//   const guidelineBaseWidth = width > 375 ? 460 : 500;// Your design baseline width
//   const scale = width / guidelineBaseWidth;

//   return {
//     promo: {
//       cardHeight: 245 * scale,
//       cardWidth: 320 * scale,
//       gradientColors: ['#FF416C', '#FF4B2B'], // Bold, neon vibes
//       badgeColor: '#FF4B2B',
//       defaultImage: `https://via.placeholder.com/${Math.round(360 * scale)}x${Math.round(320 * scale)}.png?text=Promotion`,
//       borderColor: '#FF416C',
//       carousel: { mode: 'default', continuousScroll: true },
//       inner: {
//         gradientColors: ['rgba(255,65,108,0.95)', 'rgba(255,75,43,0.85)'],
//         badgeColor: '#FF4B2B',
//         textColor: '#ffffff',
//         // Optionally scale fonts if you want proportional text sizes
//         fontSizeTitle: 23 * scale,
//         fontWeightTitle: '900',
//         fontSizeSubtitle: 18 * scale,
//         fontSizeDetail: 15 * scale,
//         textAlign: 'center',
//         padding: 20 * scale,
//       },
//     },
//     newCourse: {
//       cardHeight: 250 * scale,
//       cardWidth: 280 * scale,
//       gradientColors: ['#00c6ff', '#0072ff'], // Cool and sleek
//       badgeColor: '#0072ff',
//       defaultImage: `https://via.placeholder.com/${Math.round(340 * scale)}x${Math.round(280 * scale)}.png?text=New+Course`,
//       borderColor: '#00c6ff',
//       // Scale the carousel offset as well
//       carousel: { mode: 'stack', continuousScroll: false, modeConfig: { rotation: 10, scale: 0.85, offset: 20 * scale } },
//       inner: {
//         gradientColors: ['rgba(0,198,255,0.95)', 'rgba(0,114,255,0.85)'],
//         badgeColor: '#0072ff',
//         textColor: '#ffffff',
//         fontSizeTitle: 15 * scale,
//         fontWeightTitle: '900',
//         fontSizeSubtitle: 13 * scale,
//         fontSizeDetail: 12 * scale,
//         textAlign: 'left',
//         padding: 18 * scale,
//       },
//     },
//     sale: {
//       cardHeight: 210 * scale,
//       cardWidth: 325 * scale,
//       gradientColors: ['#F7971E', '#FFD200'], // Energetic and vibrant
//       badgeColor: '#F7971E',
//       defaultImage: `https://via.placeholder.com/${Math.round(350 * scale)}x${Math.round(300 * scale)}.png?text=Sale`,
//       borderColor: '#FFD200',
//       carousel: { mode: 'horizontal-stack', continuousScroll: false, modeConfig: { activeStackScale: 0.85, activeStackOffset: 30 * scale } },
//       inner: {
//         gradientColors: ['rgba(247,151,30,0.95)', 'rgba(255,210,0,0.85)'],
//         badgeColor: '#F7971E',
//         textColor: '#ffffff',
//         fontSizeTitle: 23 * scale,
//         fontWeightTitle: '900',
//         fontSizeSubtitle: 18 * scale,
//         fontSizeDetail: 14 * scale,
//         textAlign: 'center',
//         padding: 10 * scale,
//       },
//     },
//     event: {
//       cardHeight: 250 * scale,
//       cardWidth: 330 * scale,
//       gradientColors: ['#8E2DE2', '#4A00E0'], // Cinematic, deep purples
//       badgeColor: '#8E2DE2',
//       defaultImage: `https://via.placeholder.com/${Math.round(380 * scale)}x${Math.round(340 * scale)}.png?text=Event`,
//       borderColor: '#4A00E0',
//       carousel: { mode: 'tinder', continuousScroll: false, modeConfig: { duration: 400 } },
//       inner: {
//         gradientColors: ['rgba(142,45,226,0.95)', 'rgba(74,0,224,0.85)'],
//         badgeColor: '#8E2DE2',
//         textColor: '#ffffff',
//         fontSizeTitle: 22 * scale,
//         fontWeightTitle: '900',
//         fontSizeSubtitle: 18 * scale,
//         fontSizeDetail: 15 * scale,
//         textAlign: 'center',
//         padding: 20 * scale,
//       },
//     },
//   };
// };








// export const templateStyles = {
//   promo: {
//     cardHeight: 230,
//     cardWidth: 300,
//     gradientColors: ['#FF416C', '#FF4B2B'], // Bold, neon vibes
//     badgeColor: '#FF4B2B',
//     defaultImage: 'https://via.placeholder.com/360x320.png?text=Promotion',
//     borderColor: '#FF416C',
//     carousel: { mode: 'default', continuousScroll: true },
//     inner: {
//       gradientColors: ['rgba(255,65,108,0.95)', 'rgba(255,75,43,0.85)'],
//       badgeColor: '#FF4B2B',
//       textColor: '#ffffff',
//       fontSizeTitle: 28,
//       fontWeightTitle: '900',
//       fontSizeSubtitle: 20,
//       fontSizeDetail: 18,
//       textAlign: 'center',
//       padding: 20,
//     },
//   },
//   newCourse: {
//     cardHeight: 250,
//     cardWidth: 280,
//     gradientColors: ['#00c6ff', '#0072ff'], // Cool and sleek
//     badgeColor: '#0072ff',
//     defaultImage: 'https://via.placeholder.com/340x280.png?text=New+Course',
//     borderColor: '#00c6ff',
//     // Updated carousel config with a custom blowing stack effect:
//     carousel: { mode: 'stack', continuousScroll: false, modeConfig: { rotation: 10, scale: 0.85, offset: 20 } },
//     inner: {
//       gradientColors: ['rgba(0,198,255,0.95)', 'rgba(0,114,255,0.85)'],
//       badgeColor: '#0072ff',
//       textColor: '#ffffff',
//       fontSizeTitle: 22,
//       fontWeightTitle: '800',
//       fontSizeSubtitle: 18,
//       fontSizeDetail: 16,
//       textAlign: 'left',
//       padding: 18,
//     },
//   },
//   sale: {
//     cardHeight: 200,
//     cardWidth: 300,
//     gradientColors: ['#F7971E', '#FFD200'], // Energetic and vibrant
//     badgeColor: '#F7971E',
//     defaultImage: 'https://via.placeholder.com/350x300.png?text=Sale',
//     borderColor: '#FFD200',
//     carousel: { mode: 'horizontal-stack', continuousScroll: false, modeConfig: { activeStackScale: 0.85, activeStackOffset: 30 } },
//     inner: {
//       gradientColors: ['rgba(247,151,30,0.95)', 'rgba(255,210,0,0.85)'],
//       badgeColor: '#F7971E',
//       textColor: '#ffffff',
//       fontSizeTitle: 26,
//       fontWeightTitle: '900',
//       fontSizeSubtitle: 20,
//       fontSizeDetail: 16,
//       textAlign: 'center',
//       padding: 20,
//     },
//   },
//   event: {
//     cardHeight: 250,
//     cardWidth: 290,
//     gradientColors: ['#8E2DE2', '#4A00E0'], // Cinematic, deep purples
//     badgeColor: '#8E2DE2',
//     defaultImage: 'https://via.placeholder.com/380x340.png?text=Event',
//     borderColor: '#4A00E0',
//     carousel: { mode: 'tinder', continuousScroll: false, modeConfig: { duration: 400 } },
//     inner: {
//       gradientColors: ['rgba(142,45,226,0.95)', 'rgba(74,0,224,0.85)'],
//       badgeColor: '#8E2DE2',
//       textColor: '#ffffff',
//       fontSizeTitle: 26,
//       fontWeightTitle: '800',
//       fontSizeSubtitle: 20,
//       fontSizeDetail: 16,
//       textAlign: 'center',
//       padding: 20,
//     },
//   },
// };









// export const templateStyles = {
//   promo: {
//     cardHeight: 230,
//     cardWidth: 300,
//     gradientColors: ['#FF416C', '#FF4B2B'], // Bold, neon vibes
//     badgeColor: '#FF4B2B',
//     defaultImage: 'https://via.placeholder.com/360x320.png?text=Promotion',
//     borderColor: '#FF416C',
//     carousel: { mode: 'default', continuousScroll: true },
//     inner: {
//       gradientColors: ['rgba(255,65,108,0.95)', 'rgba(255,75,43,0.85)'],
//       badgeColor: '#FF4B2B',
//       textColor: '#ffffff',
//       fontSizeTitle: 28,
//       fontWeightTitle: '900',
//       fontSizeSubtitle: 20,
//       fontSizeDetail: 18,
//       textAlign: 'center',
//       padding: 20,
//     },
//   },
//   newCourse: {
//     cardHeight: 250,
//     cardWidth: 280,
//     gradientColors: ['#00c6ff', '#0072ff'], // Cool and sleek
//     badgeColor: '#0072ff',
//     defaultImage: 'https://via.placeholder.com/340x280.png?text=New+Course',
//     borderColor: '#00c6ff',
//     // Updated carousel config with a custom blowing stack effect:
//     carousel: { mode: 'stack', continuousScroll: false, modeConfig: { rotation: 10, scale: 0.85, offset: 20 } },
//     inner: {
//       gradientColors: ['rgba(0,198,255,0.95)', 'rgba(0,114,255,0.85)'],
//       badgeColor: '#0072ff',
//       textColor: '#ffffff',
//       fontSizeTitle: 22,
//       fontWeightTitle: '800',
//       fontSizeSubtitle: 18,
//       fontSizeDetail: 16,
//       textAlign: 'left',
//       padding: 18,
//     },
//   },
//   sale: {
//     cardHeight: 200,
//     cardWidth: 300,
//     gradientColors: ['#F7971E', '#FFD200'], // Energetic and vibrant
//     badgeColor: '#F7971E',
//     defaultImage: 'https://via.placeholder.com/350x300.png?text=Sale',
//     borderColor: '#FFD200',
//     carousel: { mode: 'horizontal-stack', continuousScroll: false, modeConfig: { activeStackScale: 0.85, activeStackOffset: 30 } },
//     inner: {
//       gradientColors: ['rgba(247,151,30,0.95)', 'rgba(255,210,0,0.85)'],
//       badgeColor: '#F7971E',
//       textColor: '#ffffff',
//       fontSizeTitle: 26,
//       fontWeightTitle: '900',
//       fontSizeSubtitle: 20,
//       fontSizeDetail: 16,
//       textAlign: 'center',
//       padding: 20,
//     },
//   },
//   event: {
//     cardHeight: 250,
//     cardWidth: 290,
//     gradientColors: ['#8E2DE2', '#4A00E0'], // Cinematic, deep purples
//     badgeColor: '#8E2DE2',
//     defaultImage: 'https://via.placeholder.com/380x340.png?text=Event',
//     borderColor: '#4A00E0',
//     carousel: { mode: 'tinder', continuousScroll: false, modeConfig: { duration: 400 } },
//     inner: {
//       gradientColors: ['rgba(142,45,226,0.95)', 'rgba(74,0,224,0.85)'],
//       badgeColor: '#8E2DE2',
//       textColor: '#ffffff',
//       fontSizeTitle: 26,
//       fontWeightTitle: '800',
//       fontSizeSubtitle: 20,
//       fontSizeDetail: 16,
//       textAlign: 'center',
//       padding: 20,
//     },
//   },
// };




// // src/components/templateStyles.js
// export const templateStyles = {
//   promo: {
//     // Flashy, high-contrast look for promotions
//     cardHeight: 150,
//     cardWidth: 360,
//     gradientColors: [''],
//     badgeColor: '#ff1493',
//     defaultImage: 'https://via.placeholder.com/360x320.png?text=Promotion',
//     borderColor: '#ff69b4',
//     // Carousel: continuous scrolling (marquee style) for dynamic promos
//     carousel: {
//       mode: 'default',
//       continuousScroll: true,
//     },
//   },
//   newCourse: {
//     // Clean and modern look for new courses
//     cardHeight: 280,
//     cardWidth: 340,
//     gradientColors: ['rgba(30, 144, 255, 0.85)', 'rgba(65, 105, 225, 0.65)'],
//     badgeColor: '#1e90ff',
//     defaultImage: 'https://via.placeholder.com/340x280.png?text=New+Course',
//     borderColor: '#1e90ff',
//     // Carousel: depth mode gives a 3D stacking effect
//     carousel: {
//       mode: 'depth',
//       continuousScroll: false,
//       modeConfig: { depth: 200 },
//     },
//   },
//   sale: {
//     // Energetic look for sale events with bright, bold colors
//     cardHeight: 300,
//     cardWidth: 350,
//     gradientColors: ['rgba(255, 140, 0, 0.85)', 'rgba(255, 69, 0, 0.65)'],
//     badgeColor: '#ff8c00',
//     defaultImage: 'https://via.placeholder.com/350x300.png?text=Sale',
//     borderColor: '#ffa500',
//     // Carousel: horizontal-stack to emphasize overlapping cards
//     carousel: {
//       mode: 'horizontal-stack',
//       continuousScroll: false,
//       modeConfig: { activeStackScale: 0.85, activeStackOffset: 30 },
//     },
//   },
//   event: {
//     // Cinematic look for events—with a dark, moody gradient and bold text
//     cardHeight: 340,
//     cardWidth: 380,
//     gradientColors: ['rgba(75, 0, 130, 0.85)', 'rgba(138, 43, 226, 0.65)'],
//     badgeColor: '#8a2be2',
//     defaultImage: 'https://via.placeholder.com/380x340.png?text=Event',
//     borderColor: '#8a2be2',
//     // Carousel: tinder-style for a dynamic, swipeable experience
//     carousel: {
//       mode: 'tinder',
//       continuousScroll: false,
//       modeConfig: { duration: 400 },
//     },
//   },
// };




