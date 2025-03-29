// adsUtils.js

/**
 * Parse gradient colors from user input, whether array or string.
 * Falls back to ["#000", "#fff"] if not valid.
 */
export function parseGradientColors(colorsProp) {
  if (Array.isArray(colorsProp)) {
    return colorsProp;
  }
  if (typeof colorsProp === 'string') {
    const parts = colorsProp
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts : ['#000', '#fff'];
  }
  return ['#000', '#fff'];
}

/**
 * Randomly select one element from an array.
 */
export function pickRandom(array) {
  if (!array || !array.length) return null;
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

/** ------------------------------------------------------------------
 * LAYOUT VARIANTS FOR TEMPLATES
 * ----------------------------------------------------------------- */
const promoLayoutVariants = [
  {
    containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
    overlayStyle: { alignItems: 'center', justifyContent: 'center' },
    titleStyle: { transform: [{ rotate: '-5deg' }], textAlign: 'center', top: 15 },
    badgeStyle: { top: 15, right: -10, transform: [{ rotate: '30deg' }] },
  },
  {
    containerStyle: { backgroundColor: 'rgba(255,255,255,0.95)' },
    overlayStyle: { alignItems: 'flex-start', justifyContent: 'flex-end', paddingBottom: 30 },
    titleStyle: { transform: [{ rotate: '0deg' }], textAlign: 'left', left: 15 },
    badgeStyle: { top: 10, right: -30, transform: [{ rotate: '45deg' }] },
  },
];

const newCourseLayoutVariants = [
  {
    containerStyle: { borderRadius: 14, overflow: 'hidden' },
    overlayStyle: { padding: 20, borderRadius: 14, justifyContent: 'flex-end' },
    textContainerStyle: { backgroundColor: 'rgba(0,0,0,0.5)' },
    badgeStyle: {
      bottom: 120,
      right: -20,
      transform: [{ rotate: '90deg' }],
      borderRadius: 20,
      paddingVertical: 4,
      paddingHorizontal: 12,
    },
  },
  {
    containerStyle: { borderRadius: 20, overflow: 'hidden' },
    overlayStyle: { padding: 20, borderRadius: 20, justifyContent: 'center' },
    textContainerStyle: { backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center' },
    badgeStyle: {
      bottom: 100,
      right: -10,
      transform: [{ rotate: '90deg' }],
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 16,
    },
  },
];

const saleLayoutVariants = [
  {
    containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)', flexDirection: 'row' },
    imageStyle: { width: '55%' },
    overlayStyle: { justifyContent: 'center' },
    detailsStyle: { backgroundColor: '#fff' },
    badgeStyle: { right: 0, top: 1, transform: [{ rotate: '20deg' }] },
  },
  {
    containerStyle: { backgroundColor: '#fff', flexDirection: 'row-reverse' },
    imageStyle: { width: '50%' },
    overlayStyle: { justifyContent: 'flex-end' },
    detailsStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
    badgeStyle: { left: 0, top: 5, transform: [{ rotate: '-20deg' }] },
  },
];

const eventLayoutVariants = [
  {
    containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
    overlayStyle: { justifyContent: 'flex-end', padding: 16 },
    detailsStyle: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
    badgeStyle: { top: 10, alignItems: 'center', transform: [{ rotate: '-30deg' }] },
  },
  {
    containerStyle: { backgroundColor: 'rgba(255,255,255,0.95)' },
    overlayStyle: { justifyContent: 'center', padding: 20 },
    detailsStyle: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14 },
    badgeStyle: { top: 15, alignItems: 'center', transform: [{ rotate: '-30deg' }] },
  },
];

const defaultLayoutVariants = [
  {
    containerStyle: {},
    overlayStyle: { alignItems: 'center', justifyContent: 'center' },
    badgeStyle: {},
  },
  {
    containerStyle: {},
    overlayStyle: { alignItems: 'flex-start', justifyContent: 'flex-end' },
    badgeStyle: { bottom: 10, left: 10 },
  },
];

export const layoutVariantsMapping = {
  promo: promoLayoutVariants,
  newCourse: newCourseLayoutVariants,
  sale: saleLayoutVariants,
  event: eventLayoutVariants,
  default: defaultLayoutVariants,
};

/** ------------------------------------------------------------------
 * RANDOM LOTTIE CONFIG
 * ----------------------------------------------------------------- */
import promoLottie2 from '../../assets/promo/promoLottie2.json';
import promoLottie3 from '../../assets/promo/promoLottie3.json';
import promoLottie4 from '../../assets/promo/promoLottie4.json';
import promoLottie5 from '../../assets/promo/promoLottie5.json';

import newCourseLottie1 from '../../assets/newcourse/newCourse1.json';
import newCourseLottie2 from '../../assets/newcourse/newCourse2.json';
import newCourseLottie3 from '../../assets/newcourse/newCourse3.json';
import newCourseLottie5 from '../../assets/newcourse/newCourse5.json';

import saleLottie2 from '../../assets/sale/sale2.json';
import saleLottie3 from '../../assets/sale/sale3.json';
import saleLottie4 from '../../assets/sale/sale4.json';
import saleLottie5 from '../../assets/sale/sale5.json';

import eventLottie2 from '../../assets/event/event2.json';
import eventLottie3 from '../../assets/event/event3.json';
import eventLottie4 from '../../assets/event/event4.json';
import eventLottie5 from '../../assets/event/event5.json';

export const lottieMappings = {
  promo: [promoLottie2, promoLottie3, promoLottie4, promoLottie5],
  newCourse: [newCourseLottie1, newCourseLottie2, newCourseLottie3, newCourseLottie5],
  sale: [saleLottie2, saleLottie3, saleLottie4, saleLottie5],
  event: [eventLottie2, eventLottie3, eventLottie4, eventLottie5],
};

/**
 * Randomly define Lottie placements by template
 */
export const lottiePlacementOptions = {
  promo: [
    { bottom: 20, right: 15, width: 150, height: 150 },
    { bottom: 20, right: 15, width: 150, height: 150 },
  ],
  newCourse: [
    { bottom: 0, right: 0, width: 80, height: 80 },
    { bottom: 0, right: 0, width: 90, height: 90 },
  ],
  sale: [
    { top: 10, left: 5, width: 80, height: 80 },
    { top: 0, right: 0, width: 90, height: 90 },
  ],
  event: [
    { top: 0, right: 10, width: 80, height: 80 },
    { top: 0, right: 10, width: 80, height: 80 },
  ],
  default: [
    { bottom: 10, right: 10, width: 80, height: 80, opacity: 0.75 },
    { top: 10, left: 10, width: 80, height: 80, opacity: 0.75 },
  ],
};

/** ------------------------------------------------------------------
 *  CARD ANIMATIONS
 * ----------------------------------------------------------------- */
export const animationMapping = {
  promo: 'fadeInDown',
  newCourse: 'fadeInUp',
  sale: 'zoomIn',
  event: 'slideInLeft',
  default: 'fadeIn',
};
