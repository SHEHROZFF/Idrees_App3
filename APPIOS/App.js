// App.js
import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/contexts/CartContext';
import { FavouritesProvider } from './src/contexts/FavouritesContext';
import { StripeProvider } from '@stripe/stripe-react-native';
import { UserProvider as UserContextProvider } from './src/contexts/UserContext';
import { fetchStripeConfig } from './src/store/slices/configSlice';
import store from './src/store';
import { ActivityIndicator, View } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

const AppContent = () => {
  const dispatch = useDispatch();
  const { stripePublishableKey, loading } = useSelector((state) => state.config);

  useEffect(() => {
    dispatch(fetchStripeConfig());
  }, [dispatch]);

  // if (loading || !stripePublishableKey) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
  //       <ActivityIndicator size="large" />
  //     </View>
  //   );
  // }

  return (
    <StripeProvider publishableKey={stripePublishableKey || 'pk_test_51OXlAIAZK57wNYnQJNfcmMNa4p9xI681KyECP5FC3n2GZ9bMcUo0dB7gVOwNeIIYkAuQbnI5pPGuOJNZxyMbySZd00naBObXrO'}>
      <UserContextProvider>
        <FavouritesProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </FavouritesProvider>
      </UserContextProvider>
    </StripeProvider>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;








// import React from 'react';
// import AppNavigator from './src/navigation/AppNavigator'; // Navigation setup
// import { CartProvider } from './src/contexts/CartContext';
// import { FavouritesProvider } from './src/contexts/FavouritesContext';
// import { StripeProvider } from '@stripe/stripe-react-native';
// import { UserProvider as UserContextProvider } from './src/contexts/UserContext';
// import store from './src/store';
// import { Provider } from 'react-redux';

// // Import Environment Variables (Uncomment if using Expo's dotenv setup)
// // import { PUBLISH_STRIPE_KEY } from '@env'; 

// const App = () => {
//   // Fallback if ENV variable is not working
//   const stripeKey = 
//   // PUBLISH_STRIPE_KEY || 
//   'pk_test_51OXlAIAZK57wNYnQJNfcmMNa4p9xI681KyECP5FC3n2GZ9bMcUo0dB7gVOwNeIIYkAuQbnI5pPGuOJNZxyMbySZd00naBObXrO';

//   return (
//     <Provider store={store}>
//       <StripeProvider publishableKey={stripeKey}>
//         <UserContextProvider>
//           <FavouritesProvider>
//             <CartProvider>
//               <AppNavigator />
//             </CartProvider>
//           </FavouritesProvider>
//         </UserContextProvider>
//       </StripeProvider>
//     </Provider>
//   );
// };

// export default App;









// // src/App.js

// import React from 'react';
// import AppNavigator from './src/navigation/AppNavigator'; // Import your navigation setup
// // import 'nativewind/tailwind.css'; // Import the Tailwind styles
// import { CartProvider } from './src/contexts/CartContext';
// import { FavouritesProvider } from './src/contexts/FavouritesContext';
// import { StripeProvider } from '@stripe/stripe-react-native';
// import { UserProvider as UserContextProvider } from './src/contexts/UserContext';
// // import { PUBLISH_STRIPE_KEY } from '@env';


// const App = () => {
// // console.log(PUBLISH_STRIPE_KEY);
//   return (
//     < StripeProvider publishableKey='pk_test_51OXlAIAZK57wNYnQJNfcmMNa4p9xI681KyECP5FC3n2GZ9bMcUo0dB7gVOwNeIIYkAuQbnI5pPGuOJNZxyMbySZd00naBObXrO' >
//      <UserContextProvider>
//       <FavouritesProvider>
//           <CartProvider>
//               <AppNavigator />
//           </CartProvider>
//         </FavouritesProvider>
//       </UserContextProvider>
//     </StripeProvider >
//   );
// };

// export default App;




// // src/App.js

// import React from 'react';
// import AppNavigator from './src/navigation/AppNavigator'; // Import your navigation setup
// // import 'nativewind/tailwind.css'; // Import the Tailwind styles
// import { CartProvider } from './src/contexts/CartContext';
// import { FavouritesProvider } from './src/contexts/FavouritesContext';
// import { UserProvider as UserContextProvider } from './src/contexts/UserContext';


// const App = () => {
//   return (
//     <UserContextProvider>
//       <FavouritesProvider>
//         <CartProvider>
//             <AppNavigator />
//         </CartProvider>
//       </FavouritesProvider>
//     </UserContextProvider>

//   );
// };

// export default App;
