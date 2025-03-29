// src/contexts/FavouritesContext.js

import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the Favourites Context
export const FavouritesContext = createContext();

// Create a Provider Component
export const FavouritesProvider = ({ children }) => {
  const [favouriteItems, setFavouriteItems] = useState([]);

  // Load favourite items from AsyncStorage on mount
  useEffect(() => {
    const loadFavourites = async () => {
      try {
        const storedFavourites = await AsyncStorage.getItem('@favourite_items');
        if (storedFavourites !== null) {
          setFavouriteItems(JSON.parse(storedFavourites));
        }
      } catch (error) {
        console.error('Failed to load favourite items from storage', error);
      }
    };
    loadFavourites();
  }, []);

  // Save favourite items to AsyncStorage whenever they change
  useEffect(() => {
    const saveFavourites = async () => {
      try {
        await AsyncStorage.setItem('@favourite_items', JSON.stringify(favouriteItems));
      } catch (error) {
        console.error('Failed to save favourite items to storage', error);
      }
    };
    saveFavourites();
  }, [favouriteItems]);

  // Function to add item to favourites
  const addToFavourites = (item) => {
    const exists = favouriteItems.some((favItem) => favItem._id === item._id);
    if (!exists) {
      setFavouriteItems([...favouriteItems, item]);
      return true; // Indicates item was added
    }
    return false; // Indicates item was already in favourites
  };

  // Function to remove item from favourites
  const removeFromFavourites = (itemId) => {
    setFavouriteItems(favouriteItems.filter((favItem) => favItem._id !== itemId));
  };

  // Function to clear the favourites
  const clearFavourites = () => {
    setFavouriteItems([]);
  };

  return (
    <FavouritesContext.Provider
      value={{
        favouriteItems,
        addToFavourites,
        removeFromFavourites,
        clearFavourites,
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
};
