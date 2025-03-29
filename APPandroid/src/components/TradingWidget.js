import React, { useContext, useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../ThemeContext';
import { lightTheme, darkTheme } from '../../themes';

const TradingWidget = () => {
  const { theme } = useContext(ThemeContext);
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;

  const { width, height } = useWindowDimensions();

  // Match MarketPage scaling logic
  const baseWidth = width > 375 ? 460 : 500;
  const scaleFactor = width / baseWidth;
  const scale = (size) => size * scaleFactor;

  const widgetWidth = width * 0.90;
  const widgetHeight = height * 0.4;
  const tradingViewTheme = theme === 'dark' ? 'dark' : 'light';

  const styles = useMemo(() => StyleSheet.create({
    outerContainer: {
      width: '100%',
      alignItems: 'center',
      marginVertical: scale(20),
      alignSelf: 'center',
    },
    gradientContainer: {
      width: widgetWidth,
      height: widgetHeight,
      borderRadius: scale(20),
      padding: scale(2),
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: scale(4) },
      shadowOpacity: 0.2,
      shadowRadius: scale(6),
    },
    widgetContainer: {
      flex: 1,
      borderRadius: scale(18),
      overflow: 'hidden',
      backgroundColor: currentTheme.cardBackground,
    },
    webview: {
      flex: 1,
      backgroundColor: 'transparent',
    },
  }), [width, height, scaleFactor, currentTheme]);

  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>body { margin: 0; background-color: transparent; }</style>
      </head>
      <body>
        <div class="tradingview-widget-container">
          <div id="tradingview_0"></div>
          <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
          <script type="text/javascript">
          new TradingView.widget({
            "width": "100%",
            "height": "100%",
            "symbol": "NASDAQ:AAPL",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "${tradingViewTheme}",
            "style": "1",
            "locale": "en",
            "toolbar_bg": "#f1f3f6",
            "enable_publishing": false,
            "allow_symbol_change": true,
            "hide_top_toolbar": false,
            "hide_legend": true,
            "hide_side_toolbar": true,
            "hide_symbol_selector": true,
            "container_id": "tradingview_0"
          });

          </script>
        </div>
      </body>
    </html>
  `;

  return (
    <View style={styles.outerContainer}>
      <LinearGradient
        colors={currentTheme.marketheader}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.gradientContainer}
      >
        <View style={styles.widgetContainer}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            javaScriptEnabled
            style={styles.webview}
          />
        </View>
      </LinearGradient>
    </View>
  );
};

export default TradingWidget;










// import React from 'react';
// import { View, StyleSheet, Dimensions } from 'react-native';
// import { WebView } from 'react-native-webview';

// export const TradingWidget = () => {
//   // Get device dimensions
//   const { width, height } = Dimensions.get('window');
//   // Let the widget occupy 90% of the screen width and 50% of the screen height
//   const widgetWidth = width * 0.9;
//   const widgetHeight = height * 0.5;

//   const htmlContent = `
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1">
//         <style>
//           body { margin: 0; background-color: transparent; }
//         </style>
//       </head>
//       <body>
//         <!-- TradingView Widget BEGIN -->
//         <div class="tradingview-widget-container">
//           <div id="tradingview_0"></div>
//           <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
//           <script type="text/javascript">
//             new TradingView.widget({
//               "width": "100%",
//               "height": "100%",
//               "symbol": "NASDAQ:AAPL",
//               "interval": "D",
//               "timezone": "Etc/UTC",
//               "theme": "light",
//               "style": "1",
//               "locale": "en",
//               "toolbar_bg": "#f1f3f6",
//               "enable_publishing": false,
//               "allow_symbol_change": true,
//               "container_id": "tradingview_0"
//             });
//           </script>
//         </div>
//         <!-- TradingView Widget END -->
//       </body>
//     </html>
//   `;

//   return (
//     <View style={styles.outerContainer}>
//       <View style={[styles.widgetContainer, { width: widgetWidth, height: widgetHeight }]}>
//         <WebView
//           originWhitelist={['*']}
//           source={{ html: htmlContent }}
//           style={styles.webview}
//           javaScriptEnabled
//           // Optionally, if you need transparency:
//           // containerStyle={{ backgroundColor: 'transparent' }}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   outerContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: '#f7f7f7',
//   },
//   widgetContainer: {
//     borderRadius: 12,
//     overflow: 'hidden',
//     // Adding some subtle shadow for a "fabulous" look
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     backgroundColor: '#fff',
//   },
//   webview: {
//     flex: 1,
//   },
// });

// export default TradingWidget;
