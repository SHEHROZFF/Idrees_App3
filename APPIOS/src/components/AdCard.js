// AdCard.js

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import LottieView from 'lottie-react-native';
import { useResponsiveTemplateStyles } from './templateStyles';

// Replace these with your actual Lottie JSON files:
import promoLottie5 from '../../assets/promo/promoLottie5.json';
import promoLottie2 from '../../assets/promo/promoLottie2.json';
import promoLottie3 from '../../assets/promo/promoLottie3.json';
import promoLottie4 from '../../assets/promo/promoLottie4.json';

import newCourseLottie1 from '../../assets/newcourse/newCourse1.json';
import newCourseLottie2 from '../../assets/newcourse/newCourse2.json';
import newCourseLottie3 from '../../assets/newcourse/newCourse3.json';
import newCourseLottie5 from '../../assets/newcourse/newCourse5.json';

import saleLottie5 from '../../assets/sale/sale5.json';
import saleLottie2 from '../../assets/sale/sale2.json';
import saleLottie3 from '../../assets/sale/sale3.json';
import saleLottie4 from '../../assets/sale/sale4.json';

import eventLottie5 from '../../assets/event/event5.json';
import eventLottie2 from '../../assets/event/event2.json';
import eventLottie3 from '../../assets/event/event3.json';
import eventLottie4 from '../../assets/event/event4.json';

/** ------------------------------------------------------------------
 *  LOTTIE FILES & RANDOM MAPPINGS
 * ----------------------------------------------------------------- */
const lottieMappings = {
  promo: [promoLottie2, promoLottie3, promoLottie4, promoLottie5],
  newCourse: [newCourseLottie1, newCourseLottie2, newCourseLottie3, newCourseLottie5],
  sale: [saleLottie2, saleLottie3, saleLottie4, saleLottie5],
  event: [eventLottie2, eventLottie3, eventLottie4, eventLottie5],
};

const animationMapping = {
  promo: 'fadeInDown',
  newCourse: 'fadeInUp',
  sale: 'zoomIn',
  event: 'slideInLeft',
  default: 'fadeIn',
};

/**
 * Each template gets multiple possible Lottie placements. We'll pick one at random.
 */
const lottiePlacementOptions = {
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
 *  RANDOM LAYOUT VARIANTS PER TEMPLATE
 * ----------------------------------------------------------------- */
const promoLayoutVariants = [
  {
    containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
    overlayStyle: { alignItems: 'center', justifyContent: 'center' },
    titleStyle: { transform: [{ rotate: '-5deg' }], textAlign: 'center', top: 5 },
    // badgeStyle: { top: 15, right: 10, transform: [{ rotate: '30deg' }] },
  },
  {
    containerStyle: { backgroundColor: 'rgba(255,255,255,0.95)' },
    overlayStyle: { alignItems: 'flex-start', justifyContent: 'flex-end', paddingBottom: 30 },
    titleStyle: { transform: [{ rotate: '0deg' }], textAlign: 'left', left: 15 },
    // badgeStyle: { top: 10, right: -30, transform: [{ rotate: '45deg' }] },
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
    badgeStyle: { right: 0, top: 5, transform: [{ rotate: '20deg' }] },
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

const layoutVariantsMapping = {
  promo: promoLayoutVariants,
  newCourse: newCourseLayoutVariants,
  sale: saleLayoutVariants,
  event: eventLayoutVariants,
  default: defaultLayoutVariants,
};

/** ------------------------------------------------------------------
 *  HELPER: Parse gradient array/string
 * ----------------------------------------------------------------- */
function parseGradientColors(colorsProp) {
  // If it's already an array, return it
  if (Array.isArray(colorsProp)) return colorsProp;

  // If it's a string, split by semicolons or commas
  if (typeof colorsProp === 'string') {
    const parts = colorsProp.split(';').map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts : ['#000', '#fff']; // Fallback
  }
  // Fallback
  return ['#000', '#fff'];
}

/** ------------------------------------------------------------------
 *  COMPONENT: AdCard
 * ----------------------------------------------------------------- */
const AdCard = ({ onPress, currentTheme, adData }) => {
  const { width } = useWindowDimensions();

  // 1) Define scale factor
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  // 2) Fetch template-based styles
  const templateStyles = useResponsiveTemplateStyles();

  // 3) We'll define all dimension-based styles with scale(...) in a useMemo
  const styles = useMemo(
    () =>
      StyleSheet.create({
        cardContainer: {
          borderRadius: scale(24),
          borderWidth: scale(1),
          borderColor: '#ddd',
          marginVertical: scale(12),
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.9)',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: scale(10),
          shadowOffset: { width: 0, height: scale(6) },
          elevation: 8,
        },
        cardTouchable: {
          flex: 1,
        },
        lottieInCard: {
          position: 'absolute',
          zIndex: 1,
          pointerEvents: 'none',
        },
        lottieSize: {
          width: '100%',
          height: '100%',
        },

        // PROMO
        promoImage: { flex: 1 },
        promoImageStyle: { resizeMode: 'cover' },
        promoOverlay: {
          flex: 1,
        },
        promoTitle: {
          fontWeight: 'bold',
          letterSpacing: 1.5,
          textShadowColor: 'rgba(0,0,0,0.5)',
          textShadowOffset: { width: scale(1), height: scale(1) },
          textShadowRadius: scale(2),
          flexShrink: 1,
        },
        promoSubtitle: {
          marginTop: scale(10),
          flexShrink: 1,
        },
        promoCodeContainer: {
          marginTop: scale(14),
          backgroundColor: '#fff',
          paddingHorizontal: scale(14),
          paddingVertical: scale(6),
          borderRadius: scale(10),
          alignSelf: 'flex-start',
        },
        promoCodeText: {
          fontWeight: 'bold',
          color: '#000',
        },
        limitedOfferText: {
          marginTop: scale(10),
          fontStyle: 'italic',
        },

        // NEW COURSE
        newCourseImageUpdated: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        newCourseImageStyleUpdated: {
          resizeMode: 'cover',
        },
        newCourseOverlay: {
          ...StyleSheet.absoluteFillObject,
        },
        newCourseTextContainerUpdated: {
          borderRadius: scale(12),
          padding: scale(12),
        },
        newCourseTitle: {
          fontWeight: 'bold',
          fontSize: scale(18),
          color: '#fff',
          marginBottom: scale(6),
          flexShrink: 1,
          flexWrap: 'wrap',
        },
        newCourseSubtitle: {
          marginTop: scale(4),
          fontSize: scale(14),
          color: '#ddd',
          flexWrap: 'wrap',
        },
        newCourseInstructor: {
          marginTop: scale(8),
          fontSize: scale(14),
          fontStyle: 'italic',
          color: '#bbb',
          flexWrap: 'wrap',
        },
        newCourseInfo: {
          marginTop: scale(6),
          fontSize: scale(14),
          color: '#ccc',
          flexWrap: 'wrap',
        },
        ratingContainer: {
          marginTop: scale(6),
        },
        newCourseRating: {
          fontSize: scale(14),
          fontWeight: 'bold',
          color: '#ffcc00',
          flexWrap: 'wrap',
        },

        // EVENT
        eventImageUpdated: {
          flex: 1,
          justifyContent: 'flex-end',
        },
        eventImageStyleUpdated: {
          resizeMode: 'cover',
        },
        eventOverlayUpdated: {
          ...StyleSheet.absoluteFillObject,
        },
        eventDetailsUpdated: {
          borderRadius: scale(10),
          padding: scale(12),
        },
        eventTitle: {
          fontWeight: '800',
          marginBottom: scale(4),
          flexShrink: 1,
          textAlign: 'center',
        },
        eventSubtitle: {
          marginTop: scale(4),
          textAlign: 'center',
        },
        eventDate: {
          marginTop: scale(6),
          textAlign: 'center',
        },
        eventLocation: {
          marginTop: scale(4),
          textAlign: 'center',
        },

        // SALE
        saleImage: {
          height: '100%',
        },
        saleImageStyle: {
          resizeMode: 'cover',
        },
        saleImageOverlay: {
          flex: 1,
        },
        saleDetails: {
          flex: 1,
          padding: scale(5),
          justifyContent: 'center',
        },
        saleTitle: {
          fontWeight: '700',
          marginBottom: scale(8),
          flexShrink: 1,
          textAlign: 'center',
        },
        saleSubtitle: {
          marginBottom: scale(10),
        },
        salePriceContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: scale(6),
        },
        originalPrice: {
          textDecorationLine: 'line-through',
          marginRight: scale(10),
          color: '#888',
        },
        salePrice: {
          fontWeight: 'bold',
          color: '#000',
          transform: [{ rotate: '-25deg' }],
          marginLeft: scale(5),
        },
        discountText: {
          color: '#e53935',
          fontWeight: '600',
        },
        saleEndsText: {
          color: '#757575',
        },

        // DEFAULT
        defaultImage: { flex: 1 },
        defaultImageStyle: { resizeMode: 'cover' },
        defaultOverlay: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        defaultTitle: {
          fontWeight: '700',
          flexShrink: 1,
          textAlign: 'center',
        },
        defaultSubtitle: {
          marginTop: scale(6),
          flexShrink: 1,
          textAlign: 'center',
        },

        // BADGE (common)
        categoryBadge: {
          position: 'absolute',
          paddingHorizontal: scale(10),
          paddingVertical: scale(6),
          borderRadius: scale(16),
        },
        badgeLabel: {
          color: '#fff',
          fontSize: scale(10),
          fontWeight: 'bold',
        },
      }),
    [scaleFactor, currentTheme]
  );

  // Extract data from adData
  const {
    image,
    title = 'Check out this ad!',
    subtitle = '',
    category = 'General',
    templateId,
    customStyles,
    promoCode,
    limitedOffer,
    instructor,
    courseInfo,
    rating,
    originalPrice,
    salePrice,
    discountPercentage,
    saleEnds,
    eventDate,
    eventLocation,
  } = adData || {};

  // Merge base template styles with any overrides
  const baseStyle = templateStyles[templateId] || templateStyles.newCourse;
  const structureStyle = {
    cardWidth: baseStyle.cardWidth,
    cardHeight: baseStyle.cardHeight,
    borderColor: baseStyle.borderColor,
    defaultImage: baseStyle.defaultImage,
  };
  const innerDefault = baseStyle.inner || {};
  const innerStyles = { ...innerDefault, ...customStyles };

  // Decide the animation for the entire card
  const animationType = animationMapping[templateId] || animationMapping.default;

  // Random picks: Lottie file, Lottie placement, layout variant
  const [randomLottie, setRandomLottie] = useState(null);
  const [randomLottiePlacement, setRandomLottiePlacement] = useState(null);
  const [randomLayoutVariant, setRandomLayoutVariant] = useState(null);

  useEffect(() => {
    // 1. Random Lottie
    const lotties = lottieMappings[templateId] || [];
    if (lotties.length > 0) {
      setRandomLottie(lotties[Math.floor(Math.random() * lotties.length)]);
    } else {
      setRandomLottie(null);
    }

    // 2. Random Lottie placement
    const placements = lottiePlacementOptions[templateId] || lottiePlacementOptions.default;
    setRandomLottiePlacement(placements[Math.floor(Math.random() * placements.length)]);

    // 3. Random layout variant
    const variants = layoutVariantsMapping[templateId] || layoutVariantsMapping.default;
    setRandomLayoutVariant(variants[Math.floor(Math.random() * variants.length)]);
  }, [templateId]);

  if (!randomLayoutVariant) {
    return null; // or a loader/spinner
  }

  // Helper to render Lottie in the card
  const renderInCardLottie = () => {
    if (!randomLottie) return null;
    // We'll also scale the chosen placement
    const pl = { ...randomLottiePlacement };
    // Scale numeric keys
    if (pl.top !== undefined) pl.top = scale(pl.top);
    if (pl.bottom !== undefined) pl.bottom = scale(pl.bottom);
    if (pl.left !== undefined) pl.left = scale(pl.left);
    if (pl.right !== undefined) pl.right = scale(pl.right);
    if (pl.width !== undefined) pl.width = scale(pl.width);
    if (pl.height !== undefined) pl.height = scale(pl.height);

    return (
      <View style={[styles.lottieInCard, pl]} pointerEvents="none">
        <LottieView source={randomLottie} autoPlay loop style={styles.lottieSize} />
      </View>
    );
  };

  // ----------------------------------------------------------------
  // RENDER TEMPLATES
  // ----------------------------------------------------------------

  /** PROMO LAYOUT */
  if (templateId === 'promo') {
    const { containerStyle, overlayStyle, titleStyle, badgeStyle } = randomLayoutVariant;

    return (
      <Animatable.View
        animation={animationType}
        duration={900}
        style={[
          styles.cardContainer,
          containerStyle,
          {
            width: structureStyle.cardWidth,
            height: structureStyle.cardHeight,
            borderColor: structureStyle.borderColor,
          },
        ]}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
          <ImageBackground
            source={{ uri: image || structureStyle.defaultImage }}
            style={styles.promoImage}
            imageStyle={styles.promoImageStyle}
          >
            <LinearGradient
              colors={parseGradientColors(innerStyles.gradientColors)}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.promoOverlay,
                overlayStyle,
                { padding: innerStyles.padding || scale(20) },
              ]}
            >
              {renderInCardLottie()}

              <View style={{ zIndex: 2 }}>
                <Text
                  style={[
                    styles.promoTitle,
                    titleStyle,
                    {
                      fontSize: innerStyles.fontSizeTitle || scale(32),
                      color: innerStyles.textColor || '#fff',
                    },
                  ]}
                  allowFontScaling
                >
                  {title.toUpperCase()}
                </Text>
                {subtitle ? (
                  <Text
                    style={[
                      styles.promoSubtitle,
                      {
                        fontSize: innerStyles.fontSizeSubtitle || scale(20),
                        color: innerStyles.textColor || '#fff',
                      },
                    ]}
                    allowFontScaling
                  >
                    {subtitle}
                  </Text>
                ) : null}
                {promoCode ? (
                  <View style={styles.promoCodeContainer}>
                    <Text
                      style={[
                        styles.promoCodeText,
                        {
                          fontSize: innerStyles.fontSizeDetail || scale(16),
                        },
                      ]}
                      allowFontScaling
                    >
                      {promoCode}
                    </Text>
                  </View>
                ) : null}
                {limitedOffer ? (
                  <Text
                    style={[
                      styles.limitedOfferText,
                      {
                        fontSize: innerStyles.fontSizeDetail || scale(16),
                      },
                    ]}
                    allowFontScaling
                  >
                    Limited Time Offer!
                  </Text>
                ) : null}
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
        {/* <View
          style={[
            styles.categoryBadge,
            badgeStyle,
            { backgroundColor: innerStyles.badgeColor || '#FF4B2B' },
          ]}
        >
          <Text style={styles.badgeLabel} allowFontScaling>
            {category}
          </Text>
        </View> */}
      </Animatable.View>
    );
  }

  /** NEW COURSE LAYOUT */
  if (templateId === 'newCourse') {
    const { containerStyle, overlayStyle, textContainerStyle, badgeStyle } = randomLayoutVariant;

    return (
      <Animatable.View
        animation={animationType}
        duration={900}
        style={[
          styles.cardContainer,
          containerStyle,
          {
            width: structureStyle.cardWidth,
            height: structureStyle.cardHeight,
            borderColor: structureStyle.borderColor,
            elevation: 5,
          },
        ]}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.cardTouchable}>
          <ImageBackground
            source={{ uri: image || structureStyle.defaultImage }}
            style={styles.newCourseImageUpdated}
            imageStyle={styles.newCourseImageStyleUpdated}
          >
            <LinearGradient
              colors={
                parseGradientColors(innerStyles.gradientColors) || [
                  'rgba(0,0,0,0.8)',
                  'transparent',
                  'rgba(0,0,0,0.9)',
                ]
              }
              style={[styles.newCourseOverlay, overlayStyle]}
            >
              {renderInCardLottie()}
              <View
                style={[
                  styles.newCourseTextContainerUpdated,
                  textContainerStyle,
                  { padding: innerStyles.padding || scale(18) },
                ]}
              >
                <Text
                  style={[
                    styles.newCourseTitle,
                    {
                      fontSize: (innerStyles.fontSizeTitle || scale(18)) + 2,
                      color: '#fff',
                      textAlign: 'left',
                      fontWeight: 'bold',
                    },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  allowFontScaling
                >
                  {title}
                </Text>
                {subtitle && (
                  <Text
                    style={[
                      styles.newCourseSubtitle,
                      {
                        fontSize: innerStyles.fontSizeSubtitle || scale(14),
                        color: '#ddd',
                        textAlign: 'left',
                      },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    allowFontScaling
                  >
                    {subtitle}
                  </Text>
                )}
                {instructor && (
                  <Text
                    style={[
                      styles.newCourseInstructor,
                      {
                        fontSize: innerStyles.fontSizeDetail || scale(14),
                        color: '#bbb',
                        textAlign: 'left',
                        marginTop: scale(4),
                      },
                    ]}
                    allowFontScaling
                  >
                    By {instructor}
                  </Text>
                )}
                {courseInfo && (
                  <Text
                    style={[
                      styles.newCourseInfo,
                      {
                        fontSize: innerStyles.fontSizeDetail || scale(14),
                        color: '#ccc',
                        textAlign: 'left',
                        marginTop: scale(6),
                      },
                    ]}
                    allowFontScaling
                  >
                    {courseInfo}
                  </Text>
                )}
                {rating && (
                  <View style={styles.ratingContainer}>
                    <Text
                      style={[
                        styles.newCourseRating,
                        {
                          fontSize: innerStyles.fontSizeDetail || scale(14),
                          color: '#ffcc00',
                        },
                      ]}
                    >
                      ⭐ {rating}/5
                    </Text>
                  </View>
                )}
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
        <View
          style={[
            styles.categoryBadge,
            badgeStyle,
            {
              backgroundColor: innerStyles.badgeColor || '#0072ff',
            },
          ]}
        >
          <Text style={styles.badgeLabel} allowFontScaling>
            {category}
          </Text>
        </View>
      </Animatable.View>
    );
  }

  /** EVENT LAYOUT */
  if (templateId === 'event') {
    const { containerStyle, overlayStyle, detailsStyle, badgeStyle } = randomLayoutVariant;
    return (
      <Animatable.View
        animation={animationType}
        duration={900}
        style={[
          styles.cardContainer,
          containerStyle,
          {
            width: structureStyle.cardWidth,
            height: structureStyle.cardHeight,
            borderColor: structureStyle.borderColor,
          },
        ]}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
          <ImageBackground
            source={{ uri: image || structureStyle.defaultImage }}
            style={styles.eventImageUpdated}
            imageStyle={styles.eventImageStyleUpdated}
          >
            <LinearGradient
              colors={parseGradientColors(innerStyles.gradientColors)}
              style={[styles.eventOverlayUpdated, overlayStyle]}
            >
              {renderInCardLottie()}
              <View
                style={[
                  styles.eventDetailsUpdated,
                  detailsStyle,
                  { padding: innerStyles.padding || scale(20) },
                ]}
              >
                <Text
                  style={[
                    styles.eventTitle,
                    {
                      fontSize: innerStyles.fontSizeTitle || scale(26),
                      color: innerStyles.textColor || '#fff',
                    },
                  ]}
                  allowFontScaling
                >
                  {title}
                </Text>
                {subtitle ? (
                  <Text
                    style={[
                      styles.eventSubtitle,
                      {
                        fontSize: innerStyles.fontSizeSubtitle || scale(18),
                        color: innerStyles.textColor || '#fff',
                      },
                    ]}
                    allowFontScaling
                  >
                    {subtitle}
                  </Text>
                ) : null}
                {eventDate ? (
                  <Text
                    style={[
                      styles.eventDate,
                      {
                        fontSize: innerStyles.fontSizeDetail || scale(14),
                        color: innerStyles.textColor || '#fff',
                      },
                    ]}
                    allowFontScaling
                  >
                    {eventDate}
                  </Text>
                ) : null}
                {eventLocation ? (
                  <Text
                    style={[
                      styles.eventLocation,
                      {
                        fontSize: innerStyles.fontSizeDetail || scale(14),
                        color: innerStyles.textColor || '#fff',
                      },
                    ]}
                    allowFontScaling
                  >
                    {eventLocation}
                  </Text>
                ) : null}
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
        <View
          style={[
            styles.categoryBadge,
            badgeStyle,
            {
              backgroundColor: innerStyles.badgeColor || '#8E2DE2',
            },
          ]}
        >
          <Text style={styles.badgeLabel} allowFontScaling>
            {category}
          </Text>
        </View>
      </Animatable.View>
    );
  }

  /** SALE LAYOUT */
  if (templateId === 'sale') {
    const { containerStyle, imageStyle, overlayStyle, detailsStyle, badgeStyle } =
      randomLayoutVariant;

    return (
      <Animatable.View
        animation={animationType}
        duration={900}
        style={[
          styles.cardContainer,
          containerStyle,
          {
            width: structureStyle.cardWidth,
            height: structureStyle.cardHeight,
            borderColor: structureStyle.borderColor,
          },
        ]}
      >
        <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
          <View style={{ flex: 1, position: 'relative', flexDirection: 'row' }}>
            <ImageBackground
              source={{ uri: image || structureStyle.defaultImage }}
              style={[styles.saleImage, imageStyle]}
              imageStyle={styles.saleImageStyle}
            >
              <LinearGradient
                colors={parseGradientColors(innerStyles.gradientColors)}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                style={[
                  styles.saleImageOverlay,
                  overlayStyle,
                  { padding: innerStyles.padding || scale(10) },
                ]}
              >
                {renderInCardLottie()}
                <View style={{ zIndex: 2 }}>
                  <Text
                    style={[
                      styles.saleTitle,
                      {
                        fontSize: innerStyles.fontSizeTitle || scale(30),
                        color: innerStyles.textColor || '#fff',
                      },
                    ]}
                    allowFontScaling
                  >
                    {title}
                  </Text>
                </View>
              </LinearGradient>
            </ImageBackground>

            <View style={[styles.saleDetails, detailsStyle]}>
              {subtitle ? (
                <Text
                  style={[
                    styles.saleSubtitle,
                    { fontSize: innerStyles.fontSizeSubtitle || scale(20) },
                  ]}
                  allowFontScaling
                >
                  {subtitle}
                </Text>
              ) : null}
              {originalPrice && salePrice && (
                <View style={styles.salePriceContainer}>
                  <Text
                    style={[
                      styles.originalPrice,
                      { fontSize: innerStyles.fontSizeDetail || scale(16) },
                    ]}
                    allowFontScaling
                  >
                    ${originalPrice}
                  </Text>
                  <Text
                    style={[
                      styles.salePrice,
                      { fontSize: innerStyles.fontSizeDetail || scale(16) },
                    ]}
                    allowFontScaling
                  >
                    ${salePrice}
                  </Text>
                </View>
              )}
              {discountPercentage ? (
                <Text
                  style={[
                    styles.discountText,
                    { fontSize: innerStyles.fontSizeDetail || scale(16) },
                  ]}
                  allowFontScaling
                >
                  Save {discountPercentage}%
                </Text>
              ) : null}
              {saleEnds ? (
                <Text
                  style={[
                    styles.saleEndsText,
                    { fontSize: innerStyles.fontSizeDetail || scale(16) },
                  ]}
                  allowFontScaling
                >
                  Ends: {new Date(saleEnds).toLocaleDateString()}
                </Text>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
        <View
          style={[
            styles.categoryBadge,
            badgeStyle,
            {
              backgroundColor: innerStyles.badgeColor || '#F7971E',
            },
          ]}
        >
          <Text style={styles.badgeLabel} allowFontScaling>
            {category}
          </Text>
        </View>
      </Animatable.View>
    );
  }

  /** DEFAULT LAYOUT */
  const { containerStyle, overlayStyle, badgeStyle } = randomLayoutVariant;
  return (
    <Animatable.View
      animation={animationType}
      duration={900}
      style={[
        styles.cardContainer,
        containerStyle,
        {
          width: structureStyle.cardWidth,
          height: structureStyle.cardHeight,
          borderColor: structureStyle.borderColor,
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
        <ImageBackground
          source={{ uri: image || structureStyle.defaultImage }}
          style={styles.defaultImage}
          imageStyle={styles.defaultImageStyle}
        >
          <LinearGradient
            colors={parseGradientColors(innerStyles.gradientColors)}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={[
              styles.defaultOverlay,
              overlayStyle,
              { padding: innerStyles.padding || scale(20) },
            ]}
          >
            {renderInCardLottie()}
            <View style={{ zIndex: 2 }}>
              <Text
                style={[
                  styles.defaultTitle,
                  {
                    fontSize: innerStyles.fontSizeTitle || scale(28),
                    color: innerStyles.textColor || '#fff',
                  },
                ]}
                allowFontScaling
              >
                {title}
              </Text>
              {subtitle ? (
                <Text
                  style={[
                    styles.defaultSubtitle,
                    {
                      fontSize: innerStyles.fontSizeSubtitle || scale(18),
                      color: innerStyles.textColor || '#fff',
                    },
                  ]}
                  allowFontScaling
                >
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
      <View
        style={[
          styles.categoryBadge,
          badgeStyle,
          { backgroundColor: innerStyles.badgeColor || '#777' },
        ]}
      >
        <Text style={styles.badgeLabel} allowFontScaling>
          {category}
        </Text>
      </View>
    </Animatable.View>
  );
};

export default AdCard;












// // AdCard.js

// import React, { useEffect, useState, useMemo } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ImageBackground,
//   useWindowDimensions,
// } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Animatable from 'react-native-animatable';
// import LottieView from 'lottie-react-native';
// import { useResponsiveTemplateStyles } from './templateStyles';

// // Replace these with your actual Lottie JSON files:
// import promoLottie5 from '../../assets/promo/promoLottie5.json';
// import promoLottie2 from '../../assets/promo/promoLottie2.json';
// import promoLottie3 from '../../assets/promo/promoLottie3.json';
// import promoLottie4 from '../../assets/promo/promoLottie4.json';

// import newCourseLottie1 from '../../assets/newcourse/newCourse1.json';
// import newCourseLottie2 from '../../assets/newcourse/newCourse2.json';
// import newCourseLottie3 from '../../assets/newcourse/newCourse3.json';
// import newCourseLottie5 from '../../assets/newcourse/newCourse5.json';

// import saleLottie5 from '../../assets/sale/sale5.json';
// import saleLottie2 from '../../assets/sale/sale2.json';
// import saleLottie3 from '../../assets/sale/sale3.json';
// import saleLottie4 from '../../assets/sale/sale4.json';

// import eventLottie5 from '../../assets/event/event5.json';
// import eventLottie2 from '../../assets/event/event2.json';
// import eventLottie3 from '../../assets/event/event3.json';
// import eventLottie4 from '../../assets/event/event4.json';

// /** ------------------------------------------------------------------
//  *  LOTTIE FILES & RANDOM MAPPINGS
//  * ----------------------------------------------------------------- */
// const lottieMappings = {
//   promo: [promoLottie2, promoLottie3, promoLottie4, promoLottie5],
//   newCourse: [newCourseLottie1, newCourseLottie2, newCourseLottie3, newCourseLottie5],
//   sale: [saleLottie2, saleLottie3, saleLottie4, saleLottie5],
//   event: [eventLottie2, eventLottie3, eventLottie4, eventLottie5],
// };

// const animationMapping = {
//   promo: 'fadeInDown',
//   newCourse: 'fadeInUp',
//   sale: 'zoomIn',
//   event: 'slideInLeft',
//   default: 'fadeIn',
// };

// /**
//  * Each template gets multiple possible Lottie placements. We'll pick one at random.
//  */
// const lottiePlacementOptions = {
//   promo: [
//     { bottom: 20, right: 15, width: 150, height: 150 },
//     { bottom: 20, right: 15, width: 150, height: 150 },
//   ],
//   newCourse: [
//     { bottom: 0, right: 0, width: 80, height: 80 },
//     { bottom: 0, right: 0, width: 90, height: 90 },
//   ],
//   sale: [
//     { top: 10, left: 5, width: 80, height: 80 },
//     { top: 0, right: 0, width: 90, height: 90 },
//   ],
//   event: [
//     { top: 0, right: 10, width: 80, height: 80 },
//     { top: 0, right: 10, width: 80, height: 80 },
//   ],
//   default: [
//     { bottom: 10, right: 10, width: 80, height: 80, opacity: 0.75 },
//     { top: 10, left: 10, width: 80, height: 80, opacity: 0.75 },
//   ],
// };

// /** ------------------------------------------------------------------
//  *  RANDOM LAYOUT VARIANTS PER TEMPLATE
//  * ----------------------------------------------------------------- */
// const promoLayoutVariants = [
//   {
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
//     overlayStyle: { alignItems: 'center', justifyContent: 'center' },
//     titleStyle: { transform: [{ rotate: '-5deg' }], textAlign: 'center', top: 15 },
//     badgeStyle: { top: 15, right: -10, transform: [{ rotate: '30deg' }] },
//   },
//   {
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.95)' },
//     overlayStyle: { alignItems: 'flex-start', justifyContent: 'flex-end', paddingBottom: 30 },
//     titleStyle: { transform: [{ rotate: '0deg' }], textAlign: 'left', left: 15 },
//     badgeStyle: { top: 10, right: -30, transform: [{ rotate: '45deg' }] },
//   },
// ];

// const newCourseLayoutVariants = [
//   {
//     containerStyle: { borderRadius: 14, overflow: 'hidden' },
//     overlayStyle: { padding: 20, borderRadius: 14, justifyContent: 'flex-end' },
//     textContainerStyle: { backgroundColor: 'rgba(0,0,0,0.5)' },
//     badgeStyle: {
//       bottom: 120,
//       right: -20,
//       transform: [{ rotate: '90deg' }],
//       borderRadius: 20,
//       paddingVertical: 4,
//       paddingHorizontal: 12,
//     },
//   },
//   {
//     containerStyle: { borderRadius: 20, overflow: 'hidden' },
//     overlayStyle: { padding: 20, borderRadius: 20, justifyContent: 'center' },
//     textContainerStyle: { backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center' },
//     badgeStyle: {
//       bottom: 100,
//       right: -10,
//       transform: [{ rotate: '90deg' }],
//       borderRadius: 20,
//       paddingVertical: 6,
//       paddingHorizontal: 16,
//     },
//   },
// ];

// const saleLayoutVariants = [
//   {
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)', flexDirection: 'row' },
//     imageStyle: { width: '55%' },
//     overlayStyle: { justifyContent: 'center' },
//     detailsStyle: { backgroundColor: '#fff' },
//     badgeStyle: { right: 0, top: 1, transform: [{ rotate: '20deg' }] },
//   },
//   {
//     containerStyle: { backgroundColor: '#fff', flexDirection: 'row-reverse' },
//     imageStyle: { width: '50%' },
//     overlayStyle: { justifyContent: 'flex-end' },
//     detailsStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
//     badgeStyle: { left: 0, top: 5, transform: [{ rotate: '-20deg' }] },
//   },
// ];

// const eventLayoutVariants = [
//   {
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
//     overlayStyle: { justifyContent: 'flex-end', padding: 16 },
//     detailsStyle: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
//     badgeStyle: { top: 10, alignItems: 'center', transform: [{ rotate: '-30deg' }] },
//   },
//   {
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.95)' },
//     overlayStyle: { justifyContent: 'center', padding: 20 },
//     detailsStyle: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14 },
//     badgeStyle: { top: 15, alignItems: 'center', transform: [{ rotate: '-30deg' }] },
//   },
// ];

// const defaultLayoutVariants = [
//   {
//     containerStyle: {},
//     overlayStyle: { alignItems: 'center', justifyContent: 'center' },
//     badgeStyle: {},
//   },
//   {
//     containerStyle: {},
//     overlayStyle: { alignItems: 'flex-start', justifyContent: 'flex-end' },
//     badgeStyle: { bottom: 10, left: 10 },
//   },
// ];

// const layoutVariantsMapping = {
//   promo: promoLayoutVariants,
//   newCourse: newCourseLayoutVariants,
//   sale: saleLayoutVariants,
//   event: eventLayoutVariants,
//   default: defaultLayoutVariants,
// };

// /** ------------------------------------------------------------------
//  *  HELPER: Parse gradient array/string
//  * ----------------------------------------------------------------- */
// function parseGradientColors(colorsProp) {
//   // If it's already an array, return it
//   if (Array.isArray(colorsProp)) return colorsProp;

//   // If it's a string, split by semicolons or commas
//   if (typeof colorsProp === 'string') {
//     const parts = colorsProp.split(';').map((s) => s.trim()).filter(Boolean);
//     return parts.length ? parts : ['#000', '#fff']; // Fallback
//   }
//   // Fallback
//   return ['#000', '#fff'];
// }

// /** ------------------------------------------------------------------
//  *  COMPONENT: AdCard
//  * ----------------------------------------------------------------- */
// const AdCard = ({ onPress, currentTheme, adData }) => {
//   const { width } = useWindowDimensions();

//   // 1) Define scale factor
//   const baseWidth = width > 375 ? 460 : 500;
//   const scaleFactor = width / baseWidth;
//   const scale = (size) => size * scaleFactor;

//   // 2) We still fetch template styles from your existing `useResponsiveTemplateStyles`.
//   //    (Those are also scaled based on a separate approach or baseline.)
//   const templateStyles = useResponsiveTemplateStyles(); // ignoring `currentTheme` param if not needed

//   // 3) We'll define all dimension-based styles with scale(...) in a useMemo
//   const styles = useMemo(
//     () =>
//       StyleSheet.create({
//         cardContainer: {
//           borderRadius: scale(24),
//           borderWidth: scale(1),
//           borderColor: '#ddd',
//           marginVertical: scale(12),
//           overflow: 'hidden',
//           backgroundColor: 'rgba(255,255,255,0.9)',
//           shadowColor: '#000',
//           shadowOpacity: 0.25,
//           shadowRadius: scale(10),
//           shadowOffset: { width: 0, height: scale(6) },
//           elevation: 8,
//         },
//         cardTouchable: {
//           flex: 1,
//         },
//         lottieInCard: {
//           position: 'absolute',
//           zIndex: 1,
//           pointerEvents: 'none',
//         },
//         lottieSize: {
//           width: '100%',
//           height: '100%',
//         },

//         /* PROMO */
//         promoImage: { flex: 1 },
//         promoImageStyle: { resizeMode: 'cover' },
//         promoOverlay: {
//           flex: 1,
//         },
//         promoTitle: {
//           fontWeight: 'bold',
//           letterSpacing: 1.5,
//           textShadowColor: 'rgba(0,0,0,0.5)',
//           textShadowOffset: { width: scale(1), height: scale(1) },
//           textShadowRadius: scale(2),
//           flexShrink: 1,
//         },
//         promoSubtitle: {
//           marginTop: scale(10),
//           flexShrink: 1,
//         },
//         promoCodeContainer: {
//           marginTop: scale(14),
//           backgroundColor: '#fff',
//           paddingHorizontal: scale(14),
//           paddingVertical: scale(6),
//           borderRadius: scale(10),
//           alignSelf: 'flex-start',
//         },
//         promoCodeText: {
//           fontWeight: 'bold',
//           color: '#000',
//         },
//         limitedOfferText: {
//           marginTop: scale(10),
//           fontStyle: 'italic',
//         },

//         /* NEW COURSE */
//         newCourseImageUpdated: {
//           flex: 1,
//           justifyContent: 'flex-end',
//         },
//         newCourseImageStyleUpdated: {
//           resizeMode: 'cover',
//         },
//         newCourseOverlay: {
//           ...StyleSheet.absoluteFillObject,
//         },
//         newCourseTextContainerUpdated: {
//           borderRadius: scale(12),
//           padding: scale(12),
//         },
//         newCourseTitle: {
//           fontWeight: 'bold',
//           fontSize: scale(18),
//           color: '#fff',
//           marginBottom: scale(6),
//           flexShrink: 1,
//           flexWrap: 'wrap',
//         },
//         newCourseSubtitle: {
//           marginTop: scale(4),
//           fontSize: scale(14),
//           color: '#ddd',
//           flexWrap: 'wrap',
//         },
//         newCourseInstructor: {
//           marginTop: scale(8),
//           fontSize: scale(14),
//           fontStyle: 'italic',
//           color: '#bbb',
//           flexWrap: 'wrap',
//         },
//         newCourseInfo: {
//           marginTop: scale(6),
//           fontSize: scale(14),
//           color: '#ccc',
//           flexWrap: 'wrap',
//         },
//         ratingContainer: {
//           marginTop: scale(6),
//         },
//         newCourseRating: {
//           fontSize: scale(14),
//           fontWeight: 'bold',
//           color: '#ffcc00',
//           flexWrap: 'wrap',
//         },

//         /* EVENT */
//         eventImageUpdated: {
//           flex: 1,
//           justifyContent: 'flex-end',
//         },
//         eventImageStyleUpdated: {
//           resizeMode: 'cover',
//         },
//         eventOverlayUpdated: {
//           ...StyleSheet.absoluteFillObject,
//         },
//         eventDetailsUpdated: {
//           borderRadius: scale(10),
//           padding: scale(12),
//         },
//         eventTitle: {
//           fontWeight: '800',
//           marginBottom: scale(4),
//           flexShrink: 1,
//           textAlign: 'center',
//         },
//         eventSubtitle: {
//           marginTop: scale(4),
//           textAlign: 'center',
//         },
//         eventDate: {
//           marginTop: scale(6),
//           textAlign: 'center',
//         },
//         eventLocation: {
//           marginTop: scale(4),
//           textAlign: 'center',
//         },

//         /* SALE */
//         saleImage: {
//           height: '100%',
//         },
//         saleImageStyle: {
//           resizeMode: 'cover',
//         },
//         saleImageOverlay: {
//           flex: 1,
//         },
//         saleDetails: {
//           flex: 1,
//           padding: scale(10),
//           justifyContent: 'center',
//         },
//         saleTitle: {
//           fontWeight: '700',
//           marginBottom: scale(8),
//           flexShrink: 1,
//           textAlign: 'center',
//         },
//         saleSubtitle: {
//           marginBottom: scale(10),
//         },
//         salePriceContainer: {
//           flexDirection: 'row',
//           alignItems: 'center',
//           marginBottom: scale(6),
//         },
//         originalPrice: {
//           textDecorationLine: 'line-through',
//           marginRight: scale(10),
//           color: '#888',
//         },
//         salePrice: {
//           fontWeight: 'bold',
//           color: '#000',
//           transform: [{ rotate: '-25deg' }],
//           marginLeft: scale(5),
//         },
//         discountText: {
//           color: '#e53935',
//           fontWeight: '600',
//         },
//         saleEndsText: {
//           color: '#757575',
//         },

//         /* DEFAULT */
//         defaultImage: { flex: 1 },
//         defaultImageStyle: { resizeMode: 'cover' },
//         defaultOverlay: {
//           flex: 1,
//           justifyContent: 'center',
//           alignItems: 'center',
//         },
//         defaultTitle: {
//           fontWeight: '700',
//           flexShrink: 1,
//           textAlign: 'center',
//         },
//         defaultSubtitle: {
//           marginTop: scale(6),
//           flexShrink: 1,
//           textAlign: 'center',
//         },

//         /* BADGE (common) */
//         categoryBadge: {
//           position: 'absolute',
//           paddingHorizontal: scale(10),
//           paddingVertical: scale(6),
//           borderRadius: scale(16),
//         },
//         badgeLabel: {
//           color: '#fff',
//           fontSize: scale(10),
//           fontWeight: 'bold',
//         },
//       }),
//     [scaleFactor, currentTheme]
//   );

//   // Extract data
//   const {
//     image,
//     title = 'Check out this ad!',
//     subtitle = '',
//     category = 'General',
//     templateId,
//     customStyles,
//     promoCode,
//     limitedOffer,
//     instructor,
//     courseInfo,
//     rating,
//     originalPrice,
//     salePrice,
//     discountPercentage,
//     saleEnds,
//     eventDate,
//     eventLocation,
//   } = adData || {};

//   // Merge base template styles with any overrides
//   const baseStyle = templateStyles[templateId] || templateStyles.newCourse;
//   const structureStyle = {
//     cardWidth: baseStyle.cardWidth,
//     cardHeight: baseStyle.cardHeight,
//     borderColor: baseStyle.borderColor,
//     defaultImage: baseStyle.defaultImage,
//   };
//   const innerDefault = baseStyle.inner || {};
//   const innerStyles = { ...innerDefault, ...customStyles };

//   // Decide the animation for the entire card
//   const animationType = animationMapping[templateId] || animationMapping.default;

//   // Random picks: Lottie file, Lottie placement, layout variant
//   const [randomLottie, setRandomLottie] = useState(null);
//   const [randomLottiePlacement, setRandomLottiePlacement] = useState(null);
//   const [randomLayoutVariant, setRandomLayoutVariant] = useState(null);

//   useEffect(() => {
//     // 1. Random Lottie
//     const lotties = lottieMappings[templateId] || [];
//     if (lotties.length > 0) {
//       setRandomLottie(lotties[Math.floor(Math.random() * lotties.length)]);
//     } else {
//       setRandomLottie(null);
//     }

//     // 2. Random Lottie placement
//     const placements = lottiePlacementOptions[templateId] || lottiePlacementOptions.default;
//     setRandomLottiePlacement(placements[Math.floor(Math.random() * placements.length)]);

//     // 3. Random layout variant
//     const variants = layoutVariantsMapping[templateId] || layoutVariantsMapping.default;
//     setRandomLayoutVariant(variants[Math.floor(Math.random() * variants.length)]);
//   }, [templateId]);

//   if (!randomLayoutVariant) {
//     return null; // or a loader
//   }

//   // Helper to render Lottie in the card
//   const renderInCardLottie = () => {
//     if (!randomLottie) return null;
//     // We'll also scale the chosen placement
//     const pl = { ...randomLottiePlacement };
//     // Scale those numeric keys (top, bottom, left, right, width, height)
//     if (pl.top !== undefined) pl.top = scale(pl.top);
//     if (pl.bottom !== undefined) pl.bottom = scale(pl.bottom);
//     if (pl.left !== undefined) pl.left = scale(pl.left);
//     if (pl.right !== undefined) pl.right = scale(pl.right);
//     if (pl.width !== undefined) pl.width = scale(pl.width);
//     if (pl.height !== undefined) pl.height = scale(pl.height);

//     return (
//       <View style={[styles.lottieInCard, pl]} pointerEvents="none">
//         <LottieView source={randomLottie} autoPlay loop style={styles.lottieSize} />
//       </View>
//     );
//   };

//   // -------------------
//   // RENDER TEMPLATES
//   // -------------------
//   /** PROMO LAYOUT */
//   if (templateId === 'promo') {
//     const { containerStyle, overlayStyle, titleStyle, badgeStyle } = randomLayoutVariant;

//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           containerStyle,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.promoImage}
//             imageStyle={styles.promoImageStyle}
//           >
//             <LinearGradient
//               colors={parseGradientColors(innerStyles.gradientColors)}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={[
//                 styles.promoOverlay,
//                 overlayStyle,
//                 { padding: innerStyles.padding || scale(20) },
//               ]}
//             >
//               {renderInCardLottie()}

//               <View style={{ zIndex: 2 }}>
//                 <Text
//                   style={[
//                     styles.promoTitle,
//                     titleStyle,
//                     {
//                       fontSize: innerStyles.fontSizeTitle || scale(32),
//                       color: innerStyles.textColor || '#fff',
//                     },
//                   ]}
//                   allowFontScaling
//                 >
//                   {title.toUpperCase()}
//                 </Text>
//                 {subtitle ? (
//                   <Text
//                     style={[
//                       styles.promoSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || scale(20),
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {promoCode ? (
//                   <View style={styles.promoCodeContainer}>
//                     <Text
//                       style={[
//                         styles.promoCodeText,
//                         {
//                           fontSize: innerStyles.fontSizeDetail || scale(16),
//                         },
//                       ]}
//                       allowFontScaling
//                     >
//                       {promoCode}
//                     </Text>
//                   </View>
//                 ) : null}
//                 {limitedOffer ? (
//                   <Text
//                     style={[
//                       styles.limitedOfferText,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || scale(16),
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     Limited Time Offer!
//                   </Text>
//                 ) : null}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>
//         <View
//           style={[
//             styles.categoryBadge,
//             badgeStyle,
//             { backgroundColor: innerStyles.badgeColor || '#FF4B2B' },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** NEW COURSE LAYOUT */
//   if (templateId === 'newCourse') {
//     const { containerStyle, overlayStyle, textContainerStyle, badgeStyle } = randomLayoutVariant;

//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           containerStyle,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//             elevation: 5,
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.newCourseImageUpdated}
//             imageStyle={styles.newCourseImageStyleUpdated}
//           >
//             <LinearGradient
//               colors={
//                 parseGradientColors(innerStyles.gradientColors) || [
//                   'rgba(0,0,0,0.8)',
//                   'transparent',
//                   'rgba(0,0,0,0.9)',
//                 ]
//               }
//               style={[styles.newCourseOverlay, overlayStyle]}
//             >
//               {renderInCardLottie()}
//               <View
//                 style={[
//                   styles.newCourseTextContainerUpdated,
//                   textContainerStyle,
//                   { padding: innerStyles.padding || scale(18) },
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.newCourseTitle,
//                     {
//                       fontSize: (innerStyles.fontSizeTitle || scale(18)) + 2,
//                       color: '#fff',
//                       textAlign: 'left',
//                       fontWeight: 'bold',
//                     },
//                   ]}
//                   numberOfLines={2}
//                   ellipsizeMode="tail"
//                   allowFontScaling
//                 >
//                   {title}
//                 </Text>
//                 {subtitle && (
//                   <Text
//                     style={[
//                       styles.newCourseSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || scale(14),
//                         color: '#ddd',
//                         textAlign: 'left',
//                       },
//                     ]}
//                     numberOfLines={1}
//                     ellipsizeMode="tail"
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 )}
//                 {instructor && (
//                   <Text
//                     style={[
//                       styles.newCourseInstructor,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || scale(14),
//                         color: '#bbb',
//                         textAlign: 'left',
//                         marginTop: scale(4),
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     By {instructor}
//                   </Text>
//                 )}
//                 {courseInfo && (
//                   <Text
//                     style={[
//                       styles.newCourseInfo,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || scale(14),
//                         color: '#ccc',
//                         textAlign: 'left',
//                         marginTop: scale(6),
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {courseInfo}
//                   </Text>
//                 )}
//                 {rating && (
//                   <View style={styles.ratingContainer}>
//                     <Text
//                       style={[
//                         styles.newCourseRating,
//                         {
//                           fontSize: innerStyles.fontSizeDetail || scale(14),
//                           color: '#ffcc00',
//                         },
//                       ]}
//                     >
//                       ⭐ {rating}/5
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>
//         <View
//           style={[
//             styles.categoryBadge,
//             badgeStyle,
//             {
//               backgroundColor: innerStyles.badgeColor || '#0072ff',
//             },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** EVENT LAYOUT */
//   if (templateId === 'event') {
//     const { containerStyle, overlayStyle, detailsStyle, badgeStyle } = randomLayoutVariant;
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           containerStyle,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.eventImageUpdated}
//             imageStyle={styles.eventImageStyleUpdated}
//           >
//             <LinearGradient
//               colors={parseGradientColors(innerStyles.gradientColors)}
//               style={[styles.eventOverlayUpdated, overlayStyle]}
//             >
//               {renderInCardLottie()}
//               <View
//                 style={[
//                   styles.eventDetailsUpdated,
//                   detailsStyle,
//                   { padding: innerStyles.padding || scale(20) },
//                 ]}
//               >
//                 <Text
//                   style={[
//                     styles.eventTitle,
//                     {
//                       fontSize: innerStyles.fontSizeTitle || scale(26),
//                       color: innerStyles.textColor || '#fff',
//                     },
//                   ]}
//                   allowFontScaling
//                 >
//                   {title}
//                 </Text>
//                 {subtitle ? (
//                   <Text
//                     style={[
//                       styles.eventSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || scale(18),
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {eventDate ? (
//                   <Text
//                     style={[
//                       styles.eventDate,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || scale(14),
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {eventDate}
//                   </Text>
//                 ) : null}
//                 {eventLocation ? (
//                   <Text
//                     style={[
//                       styles.eventLocation,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || scale(14),
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {eventLocation}
//                   </Text>
//                 ) : null}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>
//         <View
//           style={[
//             styles.categoryBadge,
//             badgeStyle,
//             {
//               backgroundColor: innerStyles.badgeColor || '#8E2DE2',
//             },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** SALE LAYOUT */
//   if (templateId === 'sale') {
//     const { containerStyle, imageStyle, overlayStyle, detailsStyle, badgeStyle } = randomLayoutVariant;

//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           containerStyle,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <View style={{ flex: 1, position: 'relative', flexDirection: 'row' }}>
//             <ImageBackground
//               source={{ uri: image || structureStyle.defaultImage }}
//               style={[styles.saleImage, imageStyle]}
//               imageStyle={styles.saleImageStyle}
//             >
//               <LinearGradient
//                 colors={parseGradientColors(innerStyles.gradientColors)}
//                 start={{ x: 0, y: 1 }}
//                 end={{ x: 0, y: 0 }}
//                 style={[
//                   styles.saleImageOverlay,
//                   overlayStyle,
//                   { padding: innerStyles.padding || scale(10) },
//                 ]}
//               >
//                 {renderInCardLottie()}
//                 <View style={{ zIndex: 2 }}>
//                   <Text
//                     style={[
//                       styles.saleTitle,
//                       {
//                         fontSize: innerStyles.fontSizeTitle || scale(30),
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {title}
//                   </Text>
//                 </View>
//               </LinearGradient>
//             </ImageBackground>

//             <View style={[styles.saleDetails, detailsStyle]}>
//               {subtitle ? (
//                 <Text
//                   style={[
//                     styles.saleSubtitle,
//                     { fontSize: innerStyles.fontSizeSubtitle || scale(20) },
//                   ]}
//                   allowFontScaling
//                 >
//                   {subtitle}
//                 </Text>
//               ) : null}
//               {originalPrice && salePrice && (
//                 <View style={styles.salePriceContainer}>
//                   <Text
//                     style={[
//                       styles.originalPrice,
//                       { fontSize: innerStyles.fontSizeDetail || scale(16) },
//                     ]}
//                     allowFontScaling
//                   >
//                     ${originalPrice}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.salePrice,
//                       { fontSize: innerStyles.fontSizeDetail || scale(16) },
//                     ]}
//                     allowFontScaling
//                   >
//                     ${salePrice}
//                   </Text>
//                 </View>
//               )}
//               {discountPercentage ? (
//                 <Text
//                   style={[
//                     styles.discountText,
//                     { fontSize: innerStyles.fontSizeDetail || scale(16) },
//                   ]}
//                   allowFontScaling
//                 >
//                   Save {discountPercentage}%
//                 </Text>
//               ) : null}
//               {saleEnds ? (
//                 <Text
//                   style={[
//                     styles.saleEndsText,
//                     { fontSize: innerStyles.fontSizeDetail || scale(16) },
//                   ]}
//                   allowFontScaling
//                 >
//                   Ends: {new Date(saleEnds).toLocaleDateString()}
//                 </Text>
//               ) : null}
//             </View>
//           </View>
//         </TouchableOpacity>
//         <View
//           style={[
//             styles.categoryBadge,
//             badgeStyle,
//             {
//               backgroundColor: innerStyles.badgeColor || '#F7971E',
//             },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** DEFAULT LAYOUT */
//   const { containerStyle, overlayStyle, badgeStyle } = randomLayoutVariant;
//   return (
//     <Animatable.View
//       animation={animationType}
//       duration={900}
//       style={[
//         styles.cardContainer,
//         containerStyle,
//         {
//           width: structureStyle.cardWidth,
//           height: structureStyle.cardHeight,
//           borderColor: structureStyle.borderColor,
//         },
//       ]}
//     >
//       <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//         <ImageBackground
//           source={{ uri: image || structureStyle.defaultImage }}
//           style={styles.defaultImage}
//           imageStyle={styles.defaultImageStyle}
//         >
//           <LinearGradient
//             colors={parseGradientColors(innerStyles.gradientColors)}
//             start={{ x: 0, y: 1 }}
//             end={{ x: 0, y: 0 }}
//             style={[
//               styles.defaultOverlay,
//               overlayStyle,
//               { padding: innerStyles.padding || scale(20) },
//             ]}
//           >
//             {renderInCardLottie()}
//             <View style={{ zIndex: 2 }}>
//               <Text
//                 style={[
//                   styles.defaultTitle,
//                   {
//                     fontSize: innerStyles.fontSizeTitle || scale(28),
//                     color: innerStyles.textColor || '#fff',
//                   },
//                 ]}
//                 allowFontScaling
//               >
//                 {title}
//               </Text>
//               {subtitle ? (
//                 <Text
//                   style={[
//                     styles.defaultSubtitle,
//                     {
//                       fontSize: innerStyles.fontSizeSubtitle || scale(18),
//                       color: innerStyles.textColor || '#fff',
//                     },
//                   ]}
//                   allowFontScaling
//                 >
//                   {subtitle}
//                 </Text>
//               ) : null}
//             </View>
//           </LinearGradient>
//         </ImageBackground>
//       </TouchableOpacity>
//       <View
//         style={[
//           styles.categoryBadge,
//           badgeStyle,
//           { backgroundColor: innerStyles.badgeColor || '#777' },
//         ]}
//       >
//         <Text style={styles.badgeLabel} allowFontScaling>
//           {category}
//         </Text>
//       </View>
//     </Animatable.View>
//   );
// };

// export default AdCard;











// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Animatable from 'react-native-animatable';
// import LottieView from 'lottie-react-native';
// import { useResponsiveTemplateStyles } from './templateStyles';

// // Replace these with your actual Lottie JSON files:
// import promoLottie5 from '../../assets/promo/promoLottie5.json';
// import promoLottie2 from '../../assets/promo/promoLottie2.json';
// import promoLottie3 from '../../assets/promo/promoLottie3.json';
// import promoLottie4 from '../../assets/promo/promoLottie4.json';

// import newCourseLottie1 from '../../assets/newcourse/newCourse1.json';
// import newCourseLottie2 from '../../assets/newcourse/newCourse2.json';
// import newCourseLottie3 from '../../assets/newcourse/newCourse3.json';
// import newCourseLottie5 from '../../assets/newcourse/newCourse5.json';

// import saleLottie5 from '../../assets/sale/sale5.json';
// import saleLottie2 from '../../assets/sale/sale2.json';
// import saleLottie3 from '../../assets/sale/sale3.json';
// import saleLottie4 from '../../assets/sale/sale4.json';

// import eventLottie5 from '../../assets/event/event5.json';
// import eventLottie2 from '../../assets/event/event2.json';
// import eventLottie3 from '../../assets/event/event3.json';
// import eventLottie4 from '../../assets/event/event4.json';
// import { transform } from 'lodash';

// /** ------------------------------------------------------------------
//  *  LOTTIE FILES & RANDOM MAPPINGS
//  * ----------------------------------------------------------------- */
// const lottieMappings = {
//   promo: [ promoLottie2, promoLottie3, promoLottie4, promoLottie5],
//   newCourse: [newCourseLottie1, newCourseLottie2, newCourseLottie3, newCourseLottie5],
//   sale: [ saleLottie2, saleLottie3, saleLottie4, saleLottie5],
//   event: [ eventLottie2, eventLottie3, eventLottie4, eventLottie5],
// };

// const animationMapping = {
//   promo: 'fadeInDown',
//   newCourse: 'fadeInUp',
//   sale: 'zoomIn',
//   event: 'slideInLeft',
//   default: 'fadeIn',
// };

// /**
//  * Each template gets multiple possible Lottie placements. We'll pick one at random.
//  */
// const lottiePlacementOptions = {
//   promo: [
//     { bottom: 20, right: 15, width: 150, height: 150 },
//     { bottom: 20, right: 15, width: 150, height: 150 },
//   ],
//   newCourse: [
//     { bottom: 0, right: 0, width: 80, height: 80},
//     { bottom: 0, right: 0, width: 90, height: 90},
//   ],
//   sale: [
//     { top: 10, left: 5, width: 80, height: 80 },
//     { top: 0, right: 0, width: 90, height: 90 },
//   ],
//   event: [
//     { top: 0, right: 10, width: 80, height: 80 },
//     { top: 0, right: 10, width: 80, height: 80 },
//   ],
//   default: [
//     { bottom: 10, right: 10, width: 80, height: 80, opacity: 0.75 },
//     { top: 10, left: 10, width: 80, height: 80, opacity: 0.75 },
//   ],
// };

// /** ------------------------------------------------------------------
//  *  RANDOM LAYOUT VARIANTS PER TEMPLATE
//  *  - Each template can have multiple layout "styles" that shift text,
//  *    images, badges, or alignment slightly for an engaging variety.
//  * ----------------------------------------------------------------- */
// const promoLayoutVariants = [
//   {
//     // Variation #1
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
//     overlayStyle: { alignItems: 'center', justifyContent: 'center' },
//     titleStyle: { transform: [{ rotate: '-5deg' }], textAlign: 'center', top: 15 },
//     badgeStyle: { top: 15, right: -10, transform: [{ rotate: '30deg' }] },
//   },
//   {
//     // Variation #2
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.95)' },
//     overlayStyle: { alignItems: 'flex-start', justifyContent: 'flex-end', paddingBottom: 30 },
//     titleStyle: { transform: [{ rotate: '0deg' }], textAlign: 'left', left: 15 },
//     badgeStyle: { top: 10, right: -30, transform: [{ rotate: '45deg' }] },
//   },
// ];

// const newCourseLayoutVariants = [
//   {
//     // Variation #1
//     containerStyle: { borderRadius: 14, overflow: 'hidden' },
//     overlayStyle: { padding: 20, borderRadius: 14, justifyContent: 'flex-end' },
//     textContainerStyle: { backgroundColor: 'rgba(0,0,0,0.5)' },
//     badgeStyle: {
//       bottom: 120,
//       right: -20,
//       transform: [{ rotate: '90deg' }],
//       borderRadius: 20,
//       paddingVertical: 4,
//       paddingHorizontal: 12,
//     },
//   },
//   {
//     // Variation #2
//     containerStyle: { borderRadius: 20, overflow: 'hidden' },
//     overlayStyle: { padding: 20, borderRadius: 20, justifyContent: 'center' },
//     textContainerStyle: { backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center' },
//     badgeStyle: {
//       bottom: 100,
//       right: -10,
//       transform: [{ rotate: '90deg' }],
//       borderRadius: 20,
//       paddingVertical: 6,
//       paddingHorizontal: 16,
//     },
//   },
// ];

// const saleLayoutVariants = [
//   {
//     // Variation #1
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)', flexDirection: 'row' },
//     imageStyle: { width: '55%' },
//     overlayStyle: { justifyContent: 'center' },
//     detailsStyle: { backgroundColor: '#fff' },
//     badgeStyle: { right: 0, top: 1, transform: [{ rotate: '20deg' }] },
//   },
//   {
//     // Variation #2
//     containerStyle: { backgroundColor: '#fff', flexDirection: 'row-reverse' },
//     imageStyle: { width: '50%' },
//     overlayStyle: { justifyContent: 'flex-end' },
//     detailsStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
//     badgeStyle: { left: 0, top: 5, transform: [{ rotate: '-20deg' }] },
//   },
// ];

// const eventLayoutVariants = [
//   {
//     // Variation #1
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.9)' },
//     overlayStyle: { justifyContent: 'flex-end', padding: 16 },
//     detailsStyle: { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 10 },
//     badgeStyle: { top: 10, alignItems: 'center', transform: [{ rotate: '-30deg' }] },
//   },
//   {
//     // Variation #2
//     containerStyle: { backgroundColor: 'rgba(255,255,255,0.95)' },
//     overlayStyle: { justifyContent: 'center', padding: 20 },
//     detailsStyle: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 14 },
//     badgeStyle: { top: 15, alignItems: 'center',transform: [{ rotate: '-30deg' }] },
//   },
// ];

// // Fallback if no template match:
// const defaultLayoutVariants = [
//   {
//     containerStyle: {},
//     overlayStyle: { alignItems: 'center', justifyContent: 'center' },
//     badgeStyle: {},
//   },
//   {
//     containerStyle: {},
//     overlayStyle: { alignItems: 'flex-start', justifyContent: 'flex-end' },
//     badgeStyle: { bottom: 10, left: 10 },
//   },
// ];

// const layoutVariantsMapping = {
//   promo: promoLayoutVariants,
//   newCourse: newCourseLayoutVariants,
//   sale: saleLayoutVariants,
//   event: eventLayoutVariants,
//   default: defaultLayoutVariants,
// };

// /** ------------------------------------------------------------------
//  *  COMPONENT
//  * ----------------------------------------------------------------- */
// const AdCard = ({ onPress, currentTheme, adData }) => {
//   const templateStyles = useResponsiveTemplateStyles(currentTheme);

//   // Extract data
//   const {
//     image,
//     title = 'Check out this ad!',
//     subtitle = '',
//     category = 'General',
//     templateId,
//     customStyles,
//     promoCode,
//     limitedOffer,
//     instructor,
//     courseInfo,
//     rating,
//     originalPrice,
//     salePrice,
//     discountPercentage,
//     saleEnds,
//     eventDate,
//     eventLocation,
//   } = adData || {};

//   // Merge base template styles with any overrides
//   const baseStyle = templateStyles[templateId] || templateStyles.newCourse;
//   const structureStyle = {
//     cardWidth: baseStyle.cardWidth,
//     cardHeight: baseStyle.cardHeight,
//     borderColor: baseStyle.borderColor,
//     defaultImage: baseStyle.defaultImage,
//   };
//   const innerDefault = baseStyle.inner || {};
//   const innerStyles = { ...innerDefault, ...customStyles };

//   // Decide the animation for the entire card
//   const animationType = animationMapping[templateId] || animationMapping.default;

//   // Random picks: Lottie file, Lottie placement, layout variant
//   const [randomLottie, setRandomLottie] = useState(null);
//   const [randomLottiePlacement, setRandomLottiePlacement] = useState(null);
//   const [randomLayoutVariant, setRandomLayoutVariant] = useState(null);

//   useEffect(() => {
//     // 1. Random Lottie
//     const lotties = lottieMappings[templateId] || [];
//     if (lotties.length > 0) {
//       setRandomLottie(lotties[Math.floor(Math.random() * lotties.length)]);
//     } else {
//       setRandomLottie(null);
//     }

//     // 2. Random Lottie placement
//     let placements = lottiePlacementOptions[templateId] || lottiePlacementOptions.default;
//     setRandomLottiePlacement(placements[Math.floor(Math.random() * placements.length)]);

//     // 3. Random layout variant
//     let variants = layoutVariantsMapping[templateId] || layoutVariantsMapping.default;
//     setRandomLayoutVariant(variants[Math.floor(Math.random() * variants.length)]);
//   }, [templateId]);

//   if (!randomLayoutVariant) {
//     // If layout variant isn't loaded yet, just return null or a loader for safety
//     return null;
//   }

//   // Helper to render Lottie in the card
//   const renderInCardLottie = () => {
//     if (!randomLottie) return null;
//     return (
//       <View style={[styles.lottieInCard, randomLottiePlacement]} pointerEvents="none">
//         <LottieView source={randomLottie} autoPlay loop style={styles.lottieSize} />
//       </View>
//     );
//   };

//   function parseGradientColors(colorsProp) {
//     // If it's already an array, return it
//     if (Array.isArray(colorsProp)) return colorsProp;
  
//     // If it's a string, split by semicolons or commas
//     if (typeof colorsProp === 'string') {
//       // Example split by semicolon
//       const parts = colorsProp.split(';').map(s => s.trim()).filter(Boolean);
//       return parts.length ? parts : ['#000', '#fff']; // Fallback
//     }
  
//     // If no valid value, return a safe default
//     return ['#000', '#fff'];
//   }
  

//   // ================================
//   // TEMPLATES (with random variant)
//   // ================================

//   /** ----------------------
//    * PROMO LAYOUT
//    * ---------------------- **/
//   if (templateId === 'promo') {
//     const { containerStyle, overlayStyle, titleStyle, badgeStyle } = randomLayoutVariant;
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           containerStyle,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.promoImage}
//             imageStyle={styles.promoImageStyle}
//           >
//             <LinearGradient
//               colors={parseGradientColors(innerStyles.gradientColors)}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={[styles.promoOverlay, overlayStyle, { padding: innerStyles.padding }]}
//             >
//               {renderInCardLottie()}

//               <View style={{ zIndex: 2 }}>
//                 <Text
//                   style={[
//                     styles.promoTitle,
//                     titleStyle,
//                     {
//                       fontSize: innerStyles.fontSizeTitle || 32,
//                       color: innerStyles.textColor || '#fff',
//                     },
//                   ]}
//                   allowFontScaling
//                 >
//                   {title.toUpperCase()}
//                 </Text>
//                 {subtitle ? (
//                   <Text
//                     style={[
//                       styles.promoSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || 20,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {promoCode ? (
//                   <View style={styles.promoCodeContainer}>
//                     <Text
//                       style={[
//                         styles.promoCodeText,
//                         { fontSize: innerStyles.fontSizeDetail || 16 },
//                       ]}
//                       allowFontScaling
//                     >
//                       {promoCode}
//                     </Text>
//                   </View>
//                 ) : null}
//                 {limitedOffer ? (
//                   <Text
//                     style={[
//                       styles.limitedOfferText,
//                       { fontSize: innerStyles.fontSizeDetail || 16 },
//                     ]}
//                     allowFontScaling
//                   >
//                     Limited Time Offer!
//                   </Text>
//                 ) : null}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>
//         <View
//           style={[
//             styles.categoryBadge,
//             badgeStyle,
//             { backgroundColor: innerStyles.badgeColor },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** ----------------------
//    * NEW COURSE LAYOUT
//    * ---------------------- **/
//   if (templateId === 'newCourse') {
//     const { containerStyle, overlayStyle, textContainerStyle, badgeStyle } = randomLayoutVariant;
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           containerStyle,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//             elevation: 5,
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.75} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.newCourseImageUpdated}
//             imageStyle={styles.newCourseImageStyleUpdated}
//           >
//             <LinearGradient
//               colors={parseGradientColors(innerStyles.gradientColors) || ['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']}
//               style={[styles.newCourseOverlay, overlayStyle]}
//             >
//               {renderInCardLottie()}
//               <View style={[styles.newCourseTextContainerUpdated, textContainerStyle]}>
//                 <Text
//                   style={[
//                     styles.newCourseTitle,
//                     {
//                       fontSize: (innerStyles.fontSizeTitle || 18) + 2,
//                       color: '#fff',
//                       textAlign: 'left',
//                       fontWeight: 'bold',
//                     },
//                   ]}
//                   numberOfLines={2}
//                   ellipsizeMode="tail"
//                   allowFontScaling
//                 >
//                   {title}
//                 </Text>
//                 {subtitle && (
//                   <Text
//                     style={[
//                       styles.newCourseSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || 14,
//                         color: '#ddd',
//                         textAlign: 'left',
//                       },
//                     ]}
//                     numberOfLines={1}
//                     ellipsizeMode="tail"
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 )}
//                 {instructor && (
//                   <Text
//                     style={[
//                       styles.newCourseInstructor,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || 14,
//                         color: '#bbb',
//                         textAlign: 'left',
//                         marginTop: 4,
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     By {instructor}
//                   </Text>
//                 )}
//                 {courseInfo && (
//                   <Text
//                     style={[
//                       styles.newCourseInfo,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || 14,
//                         color: '#ccc',
//                         textAlign: 'left',
//                         marginTop: 6,
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {courseInfo}
//                   </Text>
//                 )}
//                 {rating && (
//                   <View style={styles.ratingContainer}>
//                     <Text
//                       style={[
//                         styles.newCourseRating,
//                         {
//                           fontSize: innerStyles.fontSizeDetail || 14,
//                           color: '#ffcc00',
//                         },
//                       ]}
//                     >
//                       ⭐ {rating}/5
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>
//         <View
//           style={[
//             styles.categoryBadge,
//             badgeStyle,
//             { backgroundColor: innerStyles.badgeColor },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** ----------------------
//    * EVENT LAYOUT
//    * ---------------------- **/
//   if (templateId === 'event') {
//     const { containerStyle, overlayStyle, detailsStyle, badgeStyle } = randomLayoutVariant;
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           containerStyle,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.eventImageUpdated}
//             imageStyle={styles.eventImageStyleUpdated}
//           >
//             <LinearGradient
//               colors={parseGradientColors(innerStyles.gradientColors)}
//               style={[styles.eventOverlayUpdated, overlayStyle]}
//             >
//               {renderInCardLottie()}
//               <View style={[styles.eventDetailsUpdated, detailsStyle]}>
//                 <Text
//                   style={[
//                     styles.eventTitle,
//                     {
//                       fontSize: innerStyles.fontSizeTitle || 26,
//                       color: innerStyles.textColor || '#fff',
//                     },
//                   ]}
//                   allowFontScaling
//                 >
//                   {title}
//                 </Text>
//                 {subtitle ? (
//                   <Text
//                     style={[
//                       styles.eventSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || 18,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {eventDate ? (
//                   <Text
//                     style={[
//                       styles.eventDate,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || 14,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {eventDate}
//                   </Text>
//                 ) : null}
//                 {eventLocation ? (
//                   <Text
//                     style={[
//                       styles.eventLocation,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || 14,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {eventLocation}
//                   </Text>
//                 ) : null}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>
//         <View
//           style={[
//             styles.categoryBadge,
//             badgeStyle,
//             { backgroundColor: innerStyles.badgeColor },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** ----------------------
//    * SALE LAYOUT
//    * ---------------------- **/
//   if (templateId === 'sale') {
//     const { containerStyle, imageStyle, overlayStyle, detailsStyle, badgeStyle } =
//       randomLayoutVariant;
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           containerStyle,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <View style={{ flex: 1, position: 'relative', flexDirection: 'row' }}>
//             <ImageBackground
//               source={{ uri: image || structureStyle.defaultImage }}
//               style={[styles.saleImage, imageStyle]}
//               imageStyle={styles.saleImageStyle}
//             >
//               <LinearGradient
//                 colors={parseGradientColors(innerStyles.gradientColors)}
//                 start={{ x: 0, y: 1 }}
//                 end={{ x: 0, y: 0 }}
//                 style={[styles.saleImageOverlay, overlayStyle, { padding: innerStyles.padding }]}
//               >
//                 {renderInCardLottie()}
//                 <View style={{ zIndex: 2 }}>
//                   <Text
//                     style={[
//                       styles.saleTitle,
//                       {
//                         fontSize: innerStyles.fontSizeTitle || 30,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {title}
//                   </Text>
//                 </View>
//               </LinearGradient>
//             </ImageBackground>

//             <View style={[styles.saleDetails, detailsStyle]}>
//               {subtitle ? (
//                 <Text
//                   style={[styles.saleSubtitle, { fontSize: innerStyles.fontSizeSubtitle || 20 }]}
//                   allowFontScaling
//                 >
//                   {subtitle}
//                 </Text>
//               ) : null}
//               {originalPrice && salePrice && (
//                 <View style={styles.salePriceContainer}>
//                   <Text
//                     style={[
//                       styles.originalPrice,
//                       { fontSize: innerStyles.fontSizeDetail || 16 },
//                     ]}
//                     allowFontScaling
//                   >
//                     ${originalPrice}
//                   </Text>
//                   <Text
//                     style={[
//                       styles.salePrice,
//                       { fontSize: innerStyles.fontSizeDetail || 16 },
//                     ]}
//                     allowFontScaling
//                   >
//                     ${salePrice}
//                   </Text>
//                 </View>
//               )}
//               {discountPercentage ? (
//                 <Text
//                   style={[
//                     styles.discountText,
//                     { fontSize: innerStyles.fontSizeDetail || 16 },
//                   ]}
//                   allowFontScaling
//                 >
//                   Save {discountPercentage}%
//                 </Text>
//               ) : null}
//               {/* date end sale */}
//               {saleEnds ? (
//                 <Text
//                   style={[
//                     styles.saleEndsText,
//                     { fontSize: innerStyles.fontSizeDetail || 16 },
//                   ]}
//                   allowFontScaling
//                 >
//                   Ends: {new Date(saleEnds).toLocaleDateString()}
//                 </Text>
//               ) : null}
//             </View>
//           </View>
//         </TouchableOpacity>
//         <View
//           style={[
//             styles.categoryBadge,
//             badgeStyle,
//             { backgroundColor: innerStyles.badgeColor },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** ----------------------
//    * DEFAULT LAYOUT
//    * ---------------------- **/
//   const { containerStyle, overlayStyle, badgeStyle } = randomLayoutVariant;
//   return (
//     <Animatable.View
//       animation={animationType}
//       duration={900}
//       style={[
//         styles.cardContainer,
//         containerStyle,
//         {
//           width: structureStyle.cardWidth,
//           height: structureStyle.cardHeight,
//           borderColor: structureStyle.borderColor,
//         },
//       ]}
//     >
//       <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//         <ImageBackground
//           source={{ uri: image || structureStyle.defaultImage }}
//           style={styles.defaultImage}
//           imageStyle={styles.defaultImageStyle}
//         >
//           <LinearGradient
//             colors={parseGradientColors(innerStyles.gradientColors)}
//             start={{ x: 0, y: 1 }}
//             end={{ x: 0, y: 0 }}
//             style={[styles.defaultOverlay, overlayStyle, { padding: innerStyles.padding }]}
//           >
//             {renderInCardLottie()}
//             <View style={{ zIndex: 2 }}>
//               <Text
//                 style={[
//                   styles.defaultTitle,
//                   { fontSize: innerStyles.fontSizeTitle || 28, color: innerStyles.textColor || '#fff' },
//                 ]}
//                 allowFontScaling
//               >
//                 {title}
//               </Text>
//               {subtitle ? (
//                 <Text
//                   style={[
//                     styles.defaultSubtitle,
//                     { fontSize: innerStyles.fontSizeSubtitle || 18, color: innerStyles.textColor || '#fff' },
//                   ]}
//                   allowFontScaling
//                 >
//                   {subtitle}
//                 </Text>
//               ) : null}
//             </View>
//           </LinearGradient>
//         </ImageBackground>
//       </TouchableOpacity>
//       <View style={[styles.categoryBadge, badgeStyle, { backgroundColor: innerStyles.badgeColor }]}>
//         <Text style={styles.badgeLabel} allowFontScaling>
//           {category}
//         </Text>
//       </View>
//     </Animatable.View>
//   );
// };

// /** ------------------------------------------------------------------
//  *  STYLES
//  * ----------------------------------------------------------------- */
// const styles = StyleSheet.create({
//   cardContainer: {
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginVertical: 12,
//     overflow: 'hidden',
//     backgroundColor: 'rgba(255,255,255,0.9)',
//     shadowColor: '#000',
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 8,
//   },
//   cardTouchable: {
//     flex: 1,
//   },

//   // Lottie container
//   lottieInCard: {
//     position: 'absolute',
//     zIndex: 1,
//     pointerEvents: 'none',
//   },
//   lottieSize: {
//     width: '100%',
//     height: '100%',
//   },

//   /* PROMO */
//   promoImage: { flex: 1 },
//   promoImageStyle: { resizeMode: 'cover' },
//   promoOverlay: {
//     flex: 1,
//   },
//   promoTitle: {
//     fontWeight: 'bold',
//     letterSpacing: 1.5,
//     textShadowColor: 'rgba(0,0,0,0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//     flexShrink: 1,
//   },
//   promoSubtitle: {
//     marginTop: 10,
//     flexShrink: 1,
//   },
//   promoCodeContainer: {
//     marginTop: 14,
//     backgroundColor: '#fff',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 10,
//     alignSelf: 'flex-start',
//   },
//   promoCodeText: {
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   limitedOfferText: {
//     marginTop: 10,
//     fontStyle: 'italic',
//   },

//   /* NEW COURSE */
//   newCourseImageUpdated: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   newCourseImageStyleUpdated: {
//     resizeMode: 'cover',
//   },
//   newCourseOverlay: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   newCourseTextContainerUpdated: {
//     borderRadius: 12,
//     padding: 12,
//   },
//   newCourseTitle: {
//     fontWeight: 'bold',
//     fontSize: 18,
//     color: '#fff',
//     marginBottom: 6,
//     flexShrink: 1,
//     flexWrap: 'wrap',
//   },
//   newCourseSubtitle: {
//     marginTop: 4,
//     fontSize: 14,
//     color: '#ddd',
//     flexWrap: 'wrap',
//   },
//   newCourseInstructor: {
//     marginTop: 8,
//     fontSize: 14,
//     fontStyle: 'italic',
//     color: '#bbb',
//     flexWrap: 'wrap',
//   },
//   newCourseInfo: {
//     marginTop: 6,
//     fontSize: 14,
//     color: '#ccc',
//     flexWrap: 'wrap',
//   },
//   newCourseRating: {
//     marginTop: 6,
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#ffcc00',
//     flexWrap: 'wrap',
//   },

//   /* EVENT */
//   eventImageUpdated: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   eventImageStyleUpdated: {
//     resizeMode: 'cover',
//   },
//   eventOverlayUpdated: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   eventDetailsUpdated: {
//     borderRadius: 10,
//     padding: 12,
//   },
//   eventTitle: {
//     fontWeight: '800',
//     marginBottom: 4,
//     flexShrink: 1,
//     textAlign: 'center',
//   },
//   eventSubtitle: {
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   eventDate: {
//     marginTop: 6,
//     textAlign: 'center',
//   },
//   eventLocation: {
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   /* SALE */
//   saleImage: {
//     height: '100%',
//   },
//   saleImageStyle: {
//     resizeMode: 'cover',
//   },
//   saleImageOverlay: {
//     flex: 1,
//   },
//   saleDetails: {
//     flex: 1,
//     padding: 10,
//     justifyContent: 'center',
//   },
//   saleTitle: {
//     fontWeight: '700',
//     marginBottom: 8,
//     flexShrink: 1,
//     textAlign: 'center',
//   },
//   saleSubtitle: {
//     marginBottom: 10,
//   },
//   salePriceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   originalPrice: {
//     textDecorationLine: 'line-through',
//     marginRight: 10,
//     color: '#888',
//   },
//   salePrice: {
//     fontWeight: 'bold',
//     color: '#000',
//     transform: [{ rotate: '-25deg' }],
//     marginLeft: 5,
//   },
//   discountText: {
//     color: '#e53935',
//     fontWeight: '600',
//   },
//   saleEndsText: {
//     color: '#757575',
//   },

//   /* DEFAULT */
//   defaultImage: { flex: 1 },
//   defaultImageStyle: { resizeMode: 'cover' },
//   defaultOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   defaultTitle: {
//     fontWeight: '700',
//     flexShrink: 1,
//     textAlign: 'center',
//   },
//   defaultSubtitle: {
//     marginTop: 6,
//     flexShrink: 1,
//     textAlign: 'center',
//   },

//   /* BADGE (common) */
//   categoryBadge: {
//     position: 'absolute',
//     paddingHorizontal: 10,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   badgeLabel: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
// });

// export default AdCard;










// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Animatable from 'react-native-animatable';
// import LottieView from 'lottie-react-native';
// import { useResponsiveTemplateStyles } from './templateStyles';

// // Replace these with your actual Lottie JSON files:
// import promoLottie1 from '../../assets/promo/promoLottie1.json';
// import promoLottie2 from '../../assets/promo/promoLottie2.json';
// import promoLottie3 from '../../assets/promo/promoLottie3.json';
// import promoLottie4 from '../../assets/promo/promoLottie4.json';

// import newCourseLottie1 from '../../assets/newcourse/newCourse1.json';
// import newCourseLottie2 from '../../assets/newcourse/newCourse2.json';
// import newCourseLottie3 from '../../assets/newcourse/newCourse3.json';
// import newCourseLottie4 from '../../assets/newcourse/newCourse4.json';

// import saleLottie1 from '../../assets/sale/sale1.json';
// import saleLottie2 from '../../assets/sale/sale2.json';
// import saleLottie3 from '../../assets/sale/sale3.json';
// import saleLottie4 from '../../assets/sale/sale4.json';

// import eventLottie1 from '../../assets/event/event1.json';
// import eventLottie2 from '../../assets/event/event2.json';
// import eventLottie3 from '../../assets/event/event3.json';
// import eventLottie4 from '../../assets/event/event4.json';

// // Map each template to an array of possible Lottie animations
// const lottieMappings = {
//   promo: [promoLottie1, promoLottie2, promoLottie3, promoLottie4],
//   newCourse: [newCourseLottie1, newCourseLottie2, newCourseLottie3, newCourseLottie4],
//   sale: [saleLottie1, saleLottie2, saleLottie3, saleLottie4],
//   event: [eventLottie1, eventLottie2, eventLottie3, eventLottie4],
// };

// const animationMapping = {
//   promo: 'fadeInDown',
//   newCourse: 'fadeInUp',
//   sale: 'zoomIn',
//   event: 'slideInLeft',
//   default: 'fadeIn',
// };

// const AdCard = ({ onPress, currentTheme, adData }) => {
//   const templateStyles = useResponsiveTemplateStyles(currentTheme);

//   // Extract data
//   const {
//     image,
//     title = 'Check out this ad!',
//     subtitle = '',
//     category = 'General',
//     templateId,
//     customStyles,
//     promoCode,
//     limitedOffer,
//     instructor,
//     courseInfo,
//     rating,
//     originalPrice,
//     salePrice,
//     discountPercentage,
//     saleEnds,
//     eventDate,
//     eventLocation,
//   } = adData || {};

//   // Merge base template styles with any overrides
//   const baseStyle = templateStyles[templateId] || templateStyles.newCourse;
//   const structureStyle = {
//     cardWidth: baseStyle.cardWidth,
//     cardHeight: baseStyle.cardHeight,
//     borderColor: baseStyle.borderColor,
//     defaultImage: baseStyle.defaultImage,
//   };
//   const innerDefault = baseStyle.inner || {};
//   const innerStyles = { ...innerDefault, ...customStyles };

//   const animationType = animationMapping[templateId] || animationMapping.default;

//   // Pick a random Lottie from the array
//   const [randomLottie, setRandomLottie] = useState(null);

//   useEffect(() => {
//     if (lottieMappings[templateId]) {
//       const arr = lottieMappings[templateId];
//       const randomIndex = Math.floor(Math.random() * arr.length);
//       setRandomLottie(arr[randomIndex]);
//     }
//   }, [templateId]);

//   // Decide where to place the Lottie on each card
//   // (Modify these as you like)
//   const lottiePlacementStyles = {
//     promo: styles.lottiePromoPlacement,
//     newCourse: styles.lottieNewCoursePlacement,
//     sale: styles.lottieSalePlacement,
//     event: styles.lottieEventPlacement,
//     default: styles.lottieDefaultPlacement,
//   };
//   const lottiePlacementStyle = lottiePlacementStyles[templateId] || lottiePlacementStyles.default;

//   // Lottie overlay on top of content
//   const renderInCardLottie = () => {
//     if (!randomLottie) return null;
//     return (
//       <View style={[styles.lottieInCard, lottiePlacementStyle]} pointerEvents="none">
//         <LottieView source={randomLottie} autoPlay loop style={styles.lottieSize} />
//       </View>
//     );
//   };

//   /** ----------------------
//    * PROMO LAYOUT
//    * --------------------- **/
//   if (templateId === 'promo') {
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//             backgroundColor: 'rgba(255,255,255,0.9)',
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.promoImage}
//             imageStyle={styles.promoImageStyle}
//           >
//             <LinearGradient
//               colors={parseGradientColors(innerStyles.gradientColors)}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 1 }}
//               style={[styles.promoOverlay, { padding: innerStyles.padding }]}
//             >
//               {/* Lottie above or behind text */}
//               {renderInCardLottie()}

//               <View style={{ zIndex: 2 }}>
//                 <Text
//                   style={[
//                     styles.promoTitle,
//                     {
//                       fontSize: innerStyles.fontSizeTitle || 32,
//                       color: innerStyles.textColor || '#fff',
//                       transform: [{ rotate: '-5deg' }],
//                     },
//                   ]}
//                   allowFontScaling
//                 >
//                   {title.toUpperCase()}
//                 </Text>
//                 {subtitle ? (
//                   <Text
//                     style={[
//                       styles.promoSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || 20,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}

//                 {promoCode ? (
//                   <View style={styles.promoCodeContainer}>
//                     <Text
//                       style={[
//                         styles.promoCodeText,
//                         { fontSize: innerStyles.fontSizeDetail || 16 },
//                       ]}
//                       allowFontScaling
//                     >
//                       {promoCode}
//                     </Text>
//                   </View>
//                 ) : null}
//                 {limitedOffer ? (
//                   <Text
//                     style={[
//                       styles.limitedOfferText,
//                       { fontSize: innerStyles.fontSizeDetail || 16 },
//                     ]}
//                     allowFontScaling
//                   >
//                     Limited Time Offer!
//                   </Text>
//                 ) : null}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>

//         {/* Category badge on corner */}
//         <View
//           style={[
//             styles.categoryBadge,
//             {
//               backgroundColor: innerStyles.badgeColor,
//               top: 15,
//               right: -10,
//               transform: [{ rotate: '30deg' }],
//             },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** ----------------------
//    * NEW COURSE LAYOUT
//    * --------------------- **/
//   if (templateId === 'newCourse') {
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//             borderRadius: 14,
//             overflow: 'hidden',
//             elevation: 5,
//             backgroundColor: 'rgba(255,255,255,0.9)',
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.newCourseImageUpdated}
//             imageStyle={styles.newCourseImageStyleUpdated}
//           >
//             <LinearGradient
//               colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']}
//               style={[styles.newCourseOverlay, { padding: 20, borderRadius: 14 }]}
//             >
//               {/* Lottie in front, partially offset */}
//               {renderInCardLottie()}

//               <View style={[styles.newCourseTextContainerUpdated, { zIndex: 2 }]}>
//                 <Text
//                   style={[
//                     styles.newCourseTitle,
//                     {
//                       fontSize: (innerStyles.fontSizeTitle || 18) + 2,
//                       color: '#fff',
//                       textAlign: 'left',
//                       fontWeight: 'bold',
//                     },
//                   ]}
//                   numberOfLines={2}
//                   ellipsizeMode="tail"
//                   allowFontScaling
//                 >
//                   {title}
//                 </Text>
//                 {subtitle && (
//                   <Text
//                     style={[
//                       styles.newCourseSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || 14,
//                         color: '#ddd',
//                         textAlign: 'left',
//                       },
//                     ]}
//                     numberOfLines={1}
//                     ellipsizeMode="tail"
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 )}
//                 {instructor && (
//                   <Text
//                     style={[
//                       styles.newCourseInstructor,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || 14,
//                         color: '#bbb',
//                         textAlign: 'left',
//                         marginTop: 4,
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     By {instructor}
//                   </Text>
//                 )}
//                 {courseInfo && (
//                   <Text
//                     style={[
//                       styles.newCourseInfo,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || 14,
//                         color: '#ccc',
//                         textAlign: 'left',
//                         marginTop: 6,
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {courseInfo}
//                   </Text>
//                 )}
//                 {rating && (
//                   <View style={styles.ratingContainer}>
//                     <Text
//                       style={[
//                         styles.newCourseRating,
//                         {
//                           fontSize: innerStyles.fontSizeDetail || 14,
//                           color: '#ffcc00',
//                         },
//                       ]}
//                     >
//                       ⭐ {rating}/5
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>

//         {/* Category badge */}
//         <View
//           style={[
//             styles.categoryBadge,
//             {
//               position: 'absolute',
//               bottom: 120,
//               right: -20,
//               transform: [{ rotate: '90deg' }],
//               backgroundColor: innerStyles.badgeColor,
//               borderRadius: 20,
//               paddingVertical: 4,
//               paddingHorizontal: 12,
//               shadowColor: '#000',
//               shadowOpacity: 0.3,
//               shadowRadius: 4,
//               elevation: 4,
//             },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** ----------------------
//    * EVENT LAYOUT
//    * --------------------- **/
//   if (templateId === 'event') {
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//             backgroundColor: 'rgba(255,255,255,0.9)',
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.eventImageUpdated}
//             imageStyle={styles.eventImageStyleUpdated}
//           >
//             <LinearGradient
//               colors={['transparent', 'rgba(0,0,0,0.8)']}
//               style={styles.eventOverlayUpdated}
//             >
//               {/* Lottie on top corner */}
//               {renderInCardLottie()}

//               <View style={[styles.eventDetailsUpdated, { zIndex: 2 }]}>
//                 <Text
//                   style={[
//                     styles.eventTitle,
//                     {
//                       fontSize: innerStyles.fontSizeTitle || 26,
//                       color: innerStyles.textColor || '#fff',
//                     },
//                   ]}
//                   allowFontScaling
//                 >
//                   {title}
//                 </Text>
//                 {subtitle ? (
//                   <Text
//                     style={[
//                       styles.eventSubtitle,
//                       {
//                         fontSize: innerStyles.fontSizeSubtitle || 18,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {eventDate ? (
//                   <Text
//                     style={[
//                       styles.eventDate,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || 14,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {eventDate}
//                   </Text>
//                 ) : null}
//                 {eventLocation ? (
//                   <Text
//                     style={[
//                       styles.eventLocation,
//                       {
//                         fontSize: innerStyles.fontSizeDetail || 14,
//                         color: innerStyles.textColor || '#fff',
//                       },
//                     ]}
//                     allowFontScaling
//                   >
//                     {eventLocation}
//                   </Text>
//                 ) : null}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>

//         {/* Category badge */}
//         <View
//           style={[
//             styles.categoryBadge,
//             {
//               backgroundColor: innerStyles.badgeColor,
//               top: 10,
//               alignItems: 'center',
//             },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** ----------------------
//    * SALE LAYOUT
//    * --------------------- **/
//   if (templateId === 'sale') {
//     return (
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[
//           styles.cardContainer,
//           {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//             backgroundColor: 'rgba(255,255,255,0.9)',
//           },
//         ]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <View style={{ flex: 1, position: 'relative' }}>
//             <View style={styles.saleContainer}>
//               <ImageBackground
//                 source={{ uri: image || structureStyle.defaultImage }}
//                 style={styles.saleImage}
//                 imageStyle={styles.saleImageStyle}
//               >
//                 <LinearGradient
//                   colors={parseGradientColors(innerStyles.gradientColors)}
//                   start={{ x: 0, y: 1 }}
//                   end={{ x: 0, y: 0 }}
//                   style={[styles.saleImageOverlay, { padding: innerStyles.padding }]}
//                 >
//                   {/* Lottie in corner */}
//                   {renderInCardLottie()}
//                   <View style={{ zIndex: 2 }}>
//                     <Text
//                       style={[
//                         styles.saleTitle,
//                         {
//                           fontSize: innerStyles.fontSizeTitle || 30,
//                           color: innerStyles.textColor || '#fff',
//                         },
//                       ]}
//                       allowFontScaling
//                     >
//                       {title}
//                     </Text>
//                   </View>
//                 </LinearGradient>
//               </ImageBackground>
//               <View style={styles.saleDetails}>
//                 {subtitle ? (
//                   <Text
//                     style={[
//                       styles.saleSubtitle,
//                       { fontSize: innerStyles.fontSizeSubtitle || 20 },
//                     ]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {originalPrice && salePrice && (
//                   <View style={styles.salePriceContainer}>
//                     <Text
//                       style={[
//                         styles.originalPrice,
//                         { fontSize: innerStyles.fontSizeDetail || 16 },
//                       ]}
//                       allowFontScaling
//                     >
//                       ${originalPrice}
//                     </Text>
//                     <Text
//                       style={[
//                         styles.salePrice,
//                         { fontSize: innerStyles.fontSizeDetail || 16 },
//                       ]}
//                       allowFontScaling
//                     >
//                       ${salePrice}
//                     </Text>
//                   </View>
//                 )}
//                 {discountPercentage ? (
//                   <Text
//                     style={[
//                       styles.discountText,
//                       { fontSize: innerStyles.fontSizeDetail || 16 },
//                     ]}
//                     allowFontScaling
//                   >
//                     Save {discountPercentage}%
//                   </Text>
//                 ) : null}
//                 {saleEnds ? (
//                   <Text
//                     style={[
//                       styles.saleEndsText,
//                       { fontSize: innerStyles.fontSizeDetail || 16 },
//                     ]}
//                     allowFontScaling
//                   >
//                     Ends: {saleEnds}
//                   </Text>
//                 ) : null}
//               </View>
//             </View>
//           </View>
//         </TouchableOpacity>

//         {/* Category badge */}
//         <View
//           style={[
//             styles.categoryBadge,
//             { backgroundColor: innerStyles.badgeColor, left: 1, top: 45 },
//           ]}
//         >
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//       </Animatable.View>
//     );
//   }

//   /** ----------------------
//    * DEFAULT LAYOUT
//    * --------------------- **/
//   return (
//     <Animatable.View
//       animation={animationType}
//       duration={900}
//       style={[
//         styles.cardContainer,
//         {
//           width: structureStyle.cardWidth,
//           height: structureStyle.cardHeight,
//           borderColor: structureStyle.borderColor,
//           backgroundColor: 'rgba(255,255,255,0.9)',
//         },
//       ]}
//     >
//       <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//         <ImageBackground
//           source={{ uri: image || structureStyle.defaultImage }}
//           style={styles.defaultImage}
//           imageStyle={styles.defaultImageStyle}
//         >
//           <LinearGradient
//             colors={parseGradientColors(innerStyles.gradientColors)}
//             start={{ x: 0, y: 1 }}
//             end={{ x: 0, y: 0 }}
//             style={[styles.defaultOverlay, { padding: innerStyles.padding }]}
//           >
//             {renderInCardLottie()}

//             <View style={{ zIndex: 2 }}>
//               <Text
//                 style={[
//                   styles.defaultTitle,
//                   { fontSize: innerStyles.fontSizeTitle || 28, color: innerStyles.textColor || '#fff' },
//                 ]}
//                 allowFontScaling
//               >
//                 {title}
//               </Text>
//               {subtitle ? (
//                 <Text
//                   style={[
//                     styles.defaultSubtitle,
//                     { fontSize: innerStyles.fontSizeSubtitle || 18, color: innerStyles.textColor || '#fff' },
//                   ]}
//                   allowFontScaling
//                 >
//                   {subtitle}
//                 </Text>
//               ) : null}
//             </View>
//           </LinearGradient>
//         </ImageBackground>
//       </TouchableOpacity>

//       {/* Category badge */}
//       <View style={[styles.categoryBadge, { backgroundColor: innerStyles.badgeColor }]}>
//         <Text style={styles.badgeLabel} allowFontScaling>
//           {category}
//         </Text>
//       </View>
//     </Animatable.View>
//   );
// };

// /* ------------------------------------------------------------------------
//  * STYLES
//  * --------------------------------------------------------------------- */
// const styles = StyleSheet.create({
//   cardContainer: {
//     borderRadius: 24,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     marginVertical: 12,
//     overflow: 'hidden',

//     // Semi-transparent so we can see image or background color
//     backgroundColor: 'rgba(255,255,255,0.9)',

//     // Shadow / elevation
//     shadowColor: '#000',
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 8,
//   },
//   cardTouchable: {
//     flex: 1,
//   },

//   // Lottie inside the card, placed in front (unique per template).
//   lottieInCard: {
//     position: 'absolute',
//     zIndex: 1,
//     pointerEvents: 'none',
//   },
//   // For each template, we have different placement
//   lottiePromoPlacement: {
//     top: 0,
//     right: 0,
//     width: 80,
//     height: 80,
//     opacity: 0.8,
//   },
//   lottieNewCoursePlacement: {
//     bottom: 10,
//     left: 10,
//     width: 90,
//     height: 90,
//     opacity: 0.8,
//   },
//   lottieSalePlacement: {
//     top: 0,
//     left: 0,
//     width: 100,
//     height: 100,
//     opacity: 0.8,
//   },
//   lottieEventPlacement: {
//     top: 0,
//     right: 20,
//     width: 80,
//     height: 80,
//     opacity: 0.75,
//   },
//   lottieDefaultPlacement: {
//     bottom: 10,
//     right: 10,
//     width: 80,
//     height: 80,
//     opacity: 0.75,
//   },
//   lottieSize: {
//     width: '100%',
//     height: '100%',
//   },

//   /* PROMO */
//   promoImage: { flex: 1 },
//   promoImageStyle: { resizeMode: 'cover' },
//   promoOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   promoTitle: {
//     fontWeight: 'bold',
//     letterSpacing: 1.5,
//     textShadowColor: 'rgba(0,0,0,0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//     flexShrink: 1,
//     textAlign: 'center',
//     top: 15,
//   },
//   promoSubtitle: {
//     marginTop: 10,
//     flexShrink: 1,
//     textAlign: 'center',
//   },
//   promoCodeContainer: {
//     marginTop: 14,
//     backgroundColor: '#fff',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 10,
//   },
//   promoCodeText: {
//     fontWeight: 'bold',
//     color: '#000',
//   },
//   limitedOfferText: {
//     marginTop: 10,
//     fontStyle: 'italic',
//   },

//   /* NEW COURSE */
//   newCourseImageUpdated: {
//     flex: 1,
//     justifyContent: 'flex-end',
//     borderRadius: 14,
//   },
//   newCourseImageStyleUpdated: {
//     resizeMode: 'cover',
//     borderRadius: 14,
//   },
//   newCourseOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'flex-end',
//     borderRadius: 14,
//   },
//   newCourseTextContainerUpdated: {
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     borderRadius: 12,
//     padding: 12,
//   },
//   newCourseTitle: {
//     fontWeight: 'bold',
//     fontSize: 18,
//     color: '#fff',
//     marginBottom: 6,
//     flexShrink: 1,
//     flexWrap: 'wrap',
//   },
//   newCourseSubtitle: {
//     marginTop: 4,
//     fontSize: 14,
//     color: '#ddd',
//     flexWrap: 'wrap',
//   },
//   newCourseInstructor: {
//     marginTop: 8,
//     fontSize: 14,
//     fontStyle: 'italic',
//     color: '#bbb',
//     flexWrap: 'wrap',
//   },
//   newCourseInfo: {
//     marginTop: 6,
//     fontSize: 14,
//     color: '#ccc',
//     flexWrap: 'wrap',
//   },
//   newCourseRating: {
//     marginTop: 6,
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#ffcc00',
//     flexWrap: 'wrap',
//   },

//   /* SALE */
//   saleContainer: {
//     flex: 1,
//     flexDirection: 'row',
//   },
//   saleImage: { width: '55%', height: '100%' },
//   saleImageStyle: { resizeMode: 'cover' },
//   saleImageOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//   },
//   saleDetails: {
//     flex: 1,
//     backgroundColor: '#fff',
//     padding: 10,
//     justifyContent: 'center',
//   },
//   saleTitle: {
//     fontWeight: '700',
//     marginBottom: 8,
//     flexShrink: 1,
//     textAlign: 'center',
//   },
//   saleSubtitle: {
//     marginBottom: 10,
//   },
//   salePriceContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 6,
//   },
//   originalPrice: {
//     textDecorationLine: 'line-through',
//     marginRight: 10,
//     color: '#888',
//   },
//   salePrice: {
//     fontWeight: 'bold',
//     color: '#000',
//     transform: [{ rotate: '-29deg' }],
//     right: 5,
//     bottom: 5,
//   },
//   discountText: {
//     color: '#e53935',
//     fontWeight: '600',
//   },
//   saleEndsText: {
//     color: '#757575',
//   },

//   /* EVENT */
//   eventImageUpdated: {
//     flex: 1,
//     justifyContent: 'flex-end',
//   },
//   eventImageStyleUpdated: {
//     resizeMode: 'cover',
//   },
//   eventOverlayUpdated: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'flex-end',
//     padding: 16,
//   },
//   eventDetailsUpdated: {
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     borderRadius: 10,
//     padding: 12,
//   },
//   eventTitle: {
//     fontWeight: '800',
//     marginBottom: 4,
//     flexShrink: 1,
//     textAlign: 'center',
//   },
//   eventSubtitle: {
//     marginTop: 4,
//     textAlign: 'center',
//   },
//   eventDate: {
//     marginTop: 6,
//     textAlign: 'center',
//   },
//   eventLocation: {
//     marginTop: 4,
//     textAlign: 'center',
//   },

//   /* DEFAULT */
//   defaultImage: { flex: 1 },
//   defaultImageStyle: { resizeMode: 'cover' },
//   defaultOverlay: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   defaultTitle: {
//     fontWeight: '700',
//     flexShrink: 1,
//     textAlign: 'center',
//   },
//   defaultSubtitle: {
//     marginTop: 6,
//     flexShrink: 1,
//     textAlign: 'center',
//   },

//   /* BADGE (common) */
//   categoryBadge: {
//     position: 'absolute',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 16,
//   },
//   badgeLabel: {
//     color: '#fff',
//     fontSize: 13,
//     fontWeight: 'bold',
//   },
// });

// export default AdCard;








// import React from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
// import { LinearGradient } from 'expo-linear-gradient';
// import * as Animatable from 'react-native-animatable';
// import { useResponsiveTemplateStyles } from './templateStyles';

// const animationMapping = {
//   promo: 'fadeInDown',
//   newCourse: 'fadeInUp',
//   sale: 'zoomIn',
//   event: 'slideInLeft',
//   default: 'fadeIn',
// };

// const AdCard = ({ onPress, currentTheme, adData }) => {
//   const templateStyles = useResponsiveTemplateStyles(currentTheme);
//   const {
//     image,
//     title = 'Check out this ad!',
//     subtitle = '',
//     category = 'General',
//     templateId,
//     customStyles,
//     promoCode,
//     limitedOffer,
//     instructor,
//     courseInfo,
//     rating,
//     originalPrice,
//     salePrice,
//     discountPercentage,
//     saleEnds,
//     eventDate,
//     eventLocation,
//     // saleEnabled,
//   } = adData || {};

//   // Merge base template styles with any overrides
//   const baseStyle = templateStyles[templateId] || templateStyles.newCourse;
//   const structureStyle = {
//     cardWidth: baseStyle.cardWidth,
//     cardHeight: baseStyle.cardHeight,
//     borderColor: baseStyle.borderColor,
//     defaultImage: baseStyle.defaultImage,
//   };
//   const innerDefault = baseStyle.inner || {};
//   const innerStyles = { ...innerDefault, ...customStyles };

//   const animationType = animationMapping[templateId] || animationMapping.default;

//   // PROMO LAYOUT
//   if (templateId === 'promo') {
//     return (
//       <>
//         <View style={[styles.categoryBadge, { backgroundColor: innerStyles.badgeColor, top: 15, right: -10, zIndex: 1, transform: [{ rotate: '30deg' }] }]}>
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//         <Animatable.View
//           animation={animationType}
//           duration={900}
//           style={[styles.cardContainer, { width: structureStyle.cardWidth, height: structureStyle.cardHeight, borderColor: structureStyle.borderColor }]}
//         >
//           <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//             <ImageBackground
//               source={{ uri: image || structureStyle.defaultImage }}
//               style={styles.promoImage}
//               imageStyle={styles.promoImageStyle}
//             >
//               <LinearGradient
//                 colors={parseGradientColors(innerStyles.gradientColors)}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 1 }}
//                 style={[styles.promoOverlay, { padding: innerStyles.padding }]}
//               >
//                 <Text
//                   style={[styles.promoTitle, { fontSize: innerStyles.fontSizeTitle || 32, color: innerStyles.textColor || '#fff', transform: [{ rotate: '-5deg' }] }]}
//                   allowFontScaling
//                 >
//                   {title.toUpperCase()}
//                 </Text>
//                 {subtitle ? (
//                   <Text
//                     style={[styles.promoSubtitle, { fontSize: innerStyles.fontSizeSubtitle || 20, color: innerStyles.textColor || '#fff' }]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {promoCode ? (
//                   <View style={styles.promoCodeContainer}>
//                     <Text style={[styles.promoCodeText, { fontSize: innerStyles.fontSizeDetail || 16 }]} allowFontScaling>
//                       {promoCode}
//                     </Text>
//                   </View>
//                 ) : null}
//                 {limitedOffer ? (
//                   <Text style={[styles.limitedOfferText, { fontSize: innerStyles.fontSizeDetail || 16 }]} allowFontScaling>
//                     Limited Time Offer!
//                   </Text>
//                 ) : null}
//               </LinearGradient>
//             </ImageBackground>
//           </TouchableOpacity>
//         </Animatable.View>
//       </>
//     );
//   }

//   // NEW COURSE LAYOUT (Updated)
//   if (templateId === 'newCourse') {
//     return (
//       <>
//         <View style={[styles.categoryBadge, {    position: 'absolute', 
//             bottom: 120, 
//             right: -20, 
//             zIndex: 1,
//             transform: [{ rotate: '90deg' }],
//             backgroundColor: innerStyles.badgeColor, 
//             borderRadius: 20, 
//             paddingVertical: 4, 
//             paddingHorizontal: 12, 
//             shadowColor: '#000',
//             shadowOpacity: 0.3,
//             shadowRadius: 4,
//             elevation: 4,}]}>
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//         <Animatable.View
//           animation={animationType}
//           duration={900}
//           style={[styles.cardContainer, {
//             width: structureStyle.cardWidth,
//             height: structureStyle.cardHeight,
//             borderColor: structureStyle.borderColor,
//             borderRadius: 14,
//             overflow: 'hidden',
//             elevation: 5,
//             backgroundColor:parseGradientColors(innerStyles.gradientColors)[0],
//           }]}
//         >
//           <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//             <ImageBackground
//               source={{ uri: image || structureStyle.defaultImage }}
//               style={styles.newCourseImageUpdated}
//               imageStyle={styles.newCourseImageStyleUpdated}
//             >
//               <LinearGradient
//                 colors={['rgba(0,0,0,0.8)', 'transparent', 'rgba(0,0,0,0.9)']}
//                 style={[styles.newCourseOverlay, { padding: 20, borderRadius: 14 }]}
//               >
//                 <View style={styles.newCourseTextContainerUpdated}>
//                   <Text
//                     style={[styles.newCourseTitle, {
//                       fontSize: innerStyles.fontSizeTitle + 2,
//                       color: '#fff',
//                       textAlign: 'left',
//                       fontWeight: 'bold',
//                     }]}
//                     numberOfLines={2}
//                     ellipsizeMode="tail"
//                     allowFontScaling
//                   >
//                     {title}
//                   </Text>
//                   {subtitle && (
//                     <Text
//                       style={[styles.newCourseSubtitle, {
//                         fontSize: innerStyles.fontSizeSubtitle,
//                         color: '#ddd',
//                         textAlign: 'left',
//                       }]}
//                       numberOfLines={1}
//                       ellipsizeMode="tail"
//                       allowFontScaling
//                     >
//                       {subtitle}
//                     </Text>
//                   )}
//                   {instructor && (
//                     <Text
//                       style={[styles.newCourseInstructor, {
//                         fontSize: innerStyles.fontSizeDetail,
//                         color: '#bbb',
//                         textAlign: 'left',
//                         marginTop: 4,
//                       }]}
//                       allowFontScaling
//                     >
//                       By {instructor}
//                     </Text>
//                   )}
//                   {courseInfo && (
//                     <Text
//                       style={[styles.newCourseInfo, {
//                         fontSize: innerStyles.fontSizeDetail,
//                         color: '#ccc',
//                         textAlign: 'left',
//                         marginTop: 6,
//                       }]}
//                       allowFontScaling
//                     >
//                       {courseInfo}
//                     </Text>
//                   )}
//                   {rating && (
//                     <View style={styles.ratingContainer}>
//                       <Text style={[styles.newCourseRating, { fontSize: innerStyles.fontSizeDetail, color: '#ffcc00' }]}>
//                         ⭐ {rating}/5
//                       </Text>
//                     </View>
//                   )}
//                 </View>
//               </LinearGradient>
//             </ImageBackground>
//           </TouchableOpacity>
//         </Animatable.View>
//       </>
//     );
//   }

//   // EVENT LAYOUT (Updated)
//   if (templateId === 'event') {
//     return (
//       <>
//       <View style={[styles.categoryBadge, { backgroundColor: innerStyles.badgeColor, top: 10, alignItems: 'center', zIndex: 1 }]}>
//         <Text style={styles.badgeLabel} allowFontScaling>
//           {category}
//         </Text>
//       </View>
//       <Animatable.View
//         animation={animationType}
//         duration={900}
//         style={[styles.cardContainer, { width: structureStyle.cardWidth, height: structureStyle.cardHeight, borderColor: structureStyle.borderColor }]}
//       >
//         <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//           <ImageBackground
//             source={{ uri: image || structureStyle.defaultImage }}
//             style={styles.eventImageUpdated}
//             imageStyle={styles.eventImageStyleUpdated}
//           >
//             <LinearGradient
//               colors={['transparent', 'rgba(0,0,0,0.8)']}
//               style={styles.eventOverlayUpdated}
//             >
//               <View style={styles.eventDetailsUpdated}>
//                 <Text
//                   style={[styles.eventTitle, { fontSize: innerStyles.fontSizeTitle || 26, color: innerStyles.textColor || '#fff' }]}
//                   allowFontScaling
//                 >
//                   {title}
//                 </Text>
//                 {subtitle ? (
//                   <Text
//                     style={[styles.eventSubtitle, { fontSize: innerStyles.fontSizeSubtitle || 18, color: innerStyles.textColor || '#fff' }]}
//                     allowFontScaling
//                   >
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {eventDate ? (
//                   <Text
//                     style={[styles.eventDate, { fontSize: innerStyles.fontSizeDetail || 14, color: innerStyles.textColor || '#fff' }]}
//                     allowFontScaling
//                   >
//                     {eventDate}
//                   </Text>
//                 ) : null}
//                 {eventLocation ? (
//                   <Text
//                     style={[styles.eventLocation, { fontSize: innerStyles.fontSizeDetail || 14, color: innerStyles.textColor || '#fff' }]}
//                     allowFontScaling
//                   >
//                     {eventLocation}
//                   </Text>
//                 ) : null}
//               </View>
//             </LinearGradient>
//           </ImageBackground>
//         </TouchableOpacity>
//       </Animatable.View>
//       </>
//     );
//   }

//   // SALE LAYOUT
//   if (templateId === 'sale') {
//     return (
//       <>
//         <View style={[styles.categoryBadge, { backgroundColor: innerStyles.badgeColor, left: 1, top: 45, zIndex: 1 }]}>
//           <Text style={styles.badgeLabel} allowFontScaling>
//             {category}
//           </Text>
//         </View>
//         <Animatable.View
//           animation={animationType}
//           duration={900}
//           style={[styles.cardContainer, { width: structureStyle.cardWidth, height: structureStyle.cardHeight, borderColor: structureStyle.borderColor }]}
//         >
//           <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//             <View style={styles.saleContainer}>
//               <ImageBackground
//                 source={{ uri: image || structureStyle.defaultImage }}
//                 style={styles.saleImage}
//                 imageStyle={styles.saleImageStyle}
//               >
//                 <LinearGradient
//                   colors={parseGradientColors(innerStyles.gradientColors)}
//                   start={{ x: 0, y: 1 }}
//                   end={{ x: 0, y: 0 }}
//                   style={[styles.saleImageOverlay, { padding: innerStyles.padding }]}
//                 >
//                   <Text
//                     style={[styles.saleTitle, { fontSize: innerStyles.fontSizeTitle || 30, color: innerStyles.textColor || '#fff' }]}
//                     allowFontScaling
//                   >
//                     {title}
//                   </Text>
//                 </LinearGradient>
//               </ImageBackground>
//               <View style={styles.saleDetails}>
//                 {subtitle ? (
//                   <Text style={[styles.saleSubtitle, { fontSize: innerStyles.fontSizeSubtitle || 20 }]} allowFontScaling>
//                     {subtitle}
//                   </Text>
//                 ) : null}
//                 {(originalPrice && salePrice) ? (
//                   <View style={styles.salePriceContainer}>
//                     <Text style={[styles.originalPrice, { fontSize: innerStyles.fontSizeDetail || 16 }]} allowFontScaling>
//                       ${originalPrice}
//                     </Text>
//                     <Text style={[styles.salePrice, { fontSize: innerStyles.fontSizeDetail || 16 }]} allowFontScaling>
//                       ${salePrice}
//                     </Text>
//                   </View>
//                 ) : null}
//                 {discountPercentage ? (
//                   <Text style={[styles.discountText, { fontSize: innerStyles.fontSizeDetail || 16 }]} allowFontScaling>
//                     Save {discountPercentage}%
//                   </Text>
//                 ) : null}
//                 {saleEnds ? (
//                   <Text style={[styles.saleEndsText, { fontSize: innerStyles.fontSizeDetail || 16 }]} allowFontScaling>
//                     Ends: {saleEnds}
//                   </Text>
//                 ) : null}
//               </View>
//             </View>
//           </TouchableOpacity>
//         </Animatable.View>
//       </>
//     );
//   }

//   // DEFAULT LAYOUT
//   return (
//     <Animatable.View
//       animation={animationType}
//       duration={900}
//       style={[styles.cardContainer, { width: structureStyle.cardWidth, height: structureStyle.cardHeight, borderColor: structureStyle.borderColor }]}
//     >
//       <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.cardTouchable}>
//         <ImageBackground
//           source={{ uri: image || structureStyle.defaultImage }}
//           style={styles.defaultImage}
//           imageStyle={styles.defaultImageStyle}
//         >
//           <LinearGradient
//             colors={parseGradientColors(innerStyles.gradientColors)}
//             start={{ x: 0, y: 1 }}
//             end={{ x: 0, y: 0 }}
//             style={[styles.defaultOverlay, { padding: innerStyles.padding }]}
//           >
//             <Text
//               style={[styles.defaultTitle, { fontSize: innerStyles.fontSizeTitle || 28, color: innerStyles.textColor || '#fff' }]}
//               allowFontScaling
//             >
//               {title}
//             </Text>
//             {subtitle ? (
//               <Text
//                 style={[styles.defaultSubtitle, { fontSize: innerStyles.fontSizeSubtitle || 18, color: innerStyles.textColor || '#fff' }]}
//                 allowFontScaling
//               >
//                 {subtitle}
//               </Text>
//             ) : null}
//           </LinearGradient>
//           <View style={[styles.categoryBadge, { backgroundColor: innerStyles.badgeColor }]}>
//             <Text style={styles.badgeLabel} allowFontScaling>
//               {category}
//             </Text>
//           </View>
//         </ImageBackground>
//       </TouchableOpacity>
//     </Animatable.View>
//   );
// };

// const styles = StyleSheet.create({
//   cardContainer: {
//     borderRadius: 24,
//     overflow: 'hidden',
//     backgroundColor: '#fff',
//     borderWidth: 1,
//     borderColor: '#ddd',
//     shadowColor: '#000',
//     shadowOpacity: 0.25,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 6 },
//     elevation: 8,
//     marginVertical: 12,
//   },
//   cardTouchable: { flex: 1 },
//   // Promo Styles
//   promoImage: { flex: 1 },
//   promoImageStyle: { resizeMode: 'cover' },
//   promoOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
//   promoTitle: {
//     fontWeight: 'bold',
//     letterSpacing: 1.5,
//     textShadowColor: 'rgba(0,0,0,0.5)',
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 2,
//     flexShrink: 1,
//     flexWrap: 'wrap',
//     textAlign: 'center',
//     top: 15,
//   },
//   promoSubtitle: {
//     marginTop: 10,
//     flexShrink: 1,
//     flexWrap: 'wrap',
//     textAlign: 'center',
//   },
//   promoCodeContainer: { marginTop: 14, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
//   promoCodeText: { fontWeight: 'bold', color: '#000' },
//   limitedOfferText: { marginTop: 10, fontStyle: 'italic' },
//     // Updated New Course Styles (Improved UI)
//     newCourseImageUpdated: { 
//       flex: 1, 
//       justifyContent: 'flex-end',
//       borderRadius: 14,
//     },
//     newCourseImageStyleUpdated: { 
//       resizeMode: 'cover', 
//       borderRadius: 14,
//     },
//     newCourseOverlay: { 
//       ...StyleSheet.absoluteFillObject, 
//       justifyContent: 'flex-end', 
//       padding: 18,
//       borderRadius: 14,
//       backgroundColor: 'rgba(0,0,0,0.1)', // Darker overlay for better contrast
//     },
//     newCourseTextContainerUpdated: { 
//       backgroundColor: 'rgba(0,0,0,0.5)', 
//       borderRadius: 12, 
//       padding: 12,
//     },
//     newCourseTitle: { 
//       fontWeight: 'bold', 
//       fontSize: 18, 
//       color: '#fff', 
//       marginBottom: 6, 
//       flexShrink: 1, 
//       flexWrap: 'wrap' 
//     },
//     newCourseSubtitle: { 
//       marginTop: 4, 
//       fontSize: 14, 
//       color: '#ddd', 
//       flexWrap: 'wrap' 
//     },
//     newCourseInstructor: { 
//       marginTop: 8, 
//       fontSize: 14, 
//       fontStyle: 'italic', 
//       color: '#bbb',
//       flexWrap: 'wrap'
//     },
//     newCourseInfo: { 
//       marginTop: 6, 
//       fontSize: 14, 
//       color: '#ccc', 
//       flexWrap: 'wrap' 
//     },
//     newCourseRating: { 
//       marginTop: 6, 
//       fontSize: 14, 
//       fontWeight: 'bold', 
//       color: '#ffcc00', 
//       flexWrap: 'wrap' 
//     },
//   // Sale Styles
//   saleContainer: { flex: 1, flexDirection: 'row' },
//   saleImage: { width: '55%', height: '100%' },
//   saleImageStyle: { resizeMode: 'cover' },
//   saleImageOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
//   saleDetails: { flex: 1, backgroundColor: '#fff', padding: 10, justifyContent: 'center' },
//   saleTitle: { fontWeight: '700', marginBottom: 8, flexShrink: 1, flexWrap: 'wrap', textAlign: 'center' },
//   saleSubtitle: { marginBottom: 10, flexWrap: 'wrap' },
//   salePriceContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
//   originalPrice: { textDecorationLine: 'line-through', marginRight: 10, color: '#888' },
//   salePrice: { fontWeight: 'bold', color: '#000', transform: [{ rotate: '-29deg' }], flexWrap: 'wrap', right: 5, bottom: 5 },
//   discountText: { color: '#e53935', fontWeight: '600' },
//   saleEndsText: { color: '#757575', flexWrap: 'wrap' },
//   // Event Styles (Original)
//   eventImage: { flex: 1 },
//   eventImageStyle: { resizeMode: 'cover' },
//   eventOverlay: { flex: 1, justifyContent: 'flex-end', paddingVertical: 16 },
//   eventDetails: { backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderTopLeftRadius: 16 },
//   eventTitle: { fontWeight: '800', marginBottom: 4, flexShrink: 1, flexWrap: 'wrap', textAlign: 'center' },
//   eventSubtitle: { marginTop: 4, flexShrink: 1, flexWrap: 'wrap', textAlign: 'center' },
//   eventDate: { marginTop: 6, flexShrink: 1, flexWrap: 'wrap', textAlign: 'center' },
//   eventLocation: { marginTop: 4, flexShrink: 1, flexWrap: 'wrap', textAlign: 'center' },
//   // Updated Event Styles
//   eventImageUpdated: { 
//     flex: 1, 
//     justifyContent: 'flex-end' 
//   },
//   eventImageStyleUpdated: { 
//     resizeMode: 'cover' 
//   },
//   eventOverlayUpdated: { 
//     ...StyleSheet.absoluteFillObject, 
//     justifyContent: 'flex-end', 
//     padding: 16 
//   },
//   eventDetailsUpdated: { 
//     backgroundColor: 'rgba(0,0,0,0.6)', 
//     borderRadius: 10, 
//     padding: 12 
//   },
//   // Default Styles
//   defaultImage: { flex: 1 },
//   defaultImageStyle: { resizeMode: 'cover' },
//   defaultOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
//   defaultTitle: { fontWeight: '700', flexShrink: 1, flexWrap: 'wrap', textAlign: 'center' },
//   defaultSubtitle: { marginTop: 6, flexShrink: 1, flexWrap: 'wrap', textAlign: 'center' },
//   // Badge (common)
//   categoryBadge: { position: 'absolute', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
//   badgeLabel: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
// });

// export default AdCard;






