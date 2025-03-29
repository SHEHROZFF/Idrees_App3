// src/contexts/CartContext.js

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the Cart Context
export const CartContext = createContext();

// Create a Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart items from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('@cart_items');
        if (storedCart !== null) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart items from storage', error);
      }
    };
    loadCart();
  }, []);

  // Save cart items to AsyncStorage whenever they change
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('@cart_items', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart items to storage', error);
      }
    };
    saveCart();
  }, [cartItems]);

  // Function to add item to cart
  const addToCart = (item) => {
    const exists = cartItems.some((cartItem) => cartItem._id === item._id);
    if (!exists) {
      setCartItems([...cartItems, item]);
      return true; // Indicates item was added
    }
    return false; // Indicates item was already in cart
  };

  // Function to remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter((cartItem) => cartItem._id !== itemId));
  };

  // Function to clear the cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};






// // src/contexts/CartContext.js

// import React, { createContext, useState } from 'react';

// // Create the Cart Context
// export const CartContext = createContext();

// // Create a Provider Component
// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   // Function to add item to cart
//   const addToCart = (item) => {
//     const existingItem = cartItems.find((cartItem) => cartItem.id === item.id);
//     if (existingItem) {
//       // Increment quantity if item already exists
//       setCartItems(
//         cartItems.map((cartItem) =>
//           cartItem.id === item.id
//             ? { ...cartItem, quantity: cartItem.quantity + 1 }
//             : cartItem
//         )
//       );
//     } else {
//       // Add new item with quantity 1
//       setCartItems([...cartItems, { ...item, quantity: 1 }]);
//     }
//   };

//   // Function to remove item from cart
//   const removeFromCart = (itemId) => {
//     setCartItems(cartItems.filter((cartItem) => cartItem.id !== itemId));
//   };

//   // Function to update item quantity
//   const updateQuantity = (itemId, quantity) => {
//     if (quantity <= 0) {
//       removeFromCart(itemId);
//     } else {
//       setCartItems(
//         cartItems.map((cartItem) =>
//           cartItem.id === itemId
//             ? { ...cartItem, quantity }
//             : cartItem
//         )
//       );
//     }
//   };

//   // Function to clear the cart
//   const clearCart = () => {
//     setCartItems([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         clearCart,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };
