// src/redux/slices/reviewsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// ----------------------- Async Thunks ----------------------- //

/**
 * Fetch all reviews
 */
export const fetchAllReviews = createAsyncThunk(
  'reviews/fetchAllReviews',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/api/reviews');
      return response.data; // API returns an array of reviews
    } catch (error) {
      // Return a rejected action containing the error message
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch reviews.'
      );
    }
  }
);

/**
 * Fetch reviews for a specific product
 * @param {string} productId - Product ID
 */
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async (productId, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/reviews/product/${productId}`);
      return response.data; // API returns an array of reviews for the product
    } catch (error) {
      // Return a rejected action containing the error message
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product reviews.'
      );
    }
  }
);

/**
 * Create a new review
 * @param {object} reviewData - { productId, rating, comment }
 */
export const createReview = createAsyncThunk(
  'reviews/createReview',
  async (reviewData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/api/reviews', reviewData);
      return response.data; // API returns a success message or the created review
    } catch (error) {
      // Return a rejected action containing the error message
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to create review.'
      );
    }
  }
);

/**
 * Update a review by ID
 * @param {object} payload - { id: string, reviewData: object }
 */
export const updateReview = createAsyncThunk(
  'reviews/updateReview',
  async ({ id, reviewData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/api/reviews/${id}`, reviewData);
      return response.data; // API returns the updated review
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update review.'
      );
    }
  }
);

/**
 * Delete a review by ID
 * @param {string} id - Review ID
 */
export const deleteReview = createAsyncThunk(
  'reviews/deleteReview',
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/api/reviews/${id}`);
      return id; // Return the deleted review ID
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to delete review.'
      );
    }
  }
);

// ----------------------- Slice Definition ----------------------- //

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [], // List of reviews
    loading: false,
    error: null,
  },
  reducers: {
    // Add synchronous actions here if needed
  },
  extraReducers: (builder) => {
    builder
      // ----------------- Fetch All Reviews ----------------- //
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ----------------- Fetch Product Reviews ----------------- //
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ----------------- Create Review ----------------- //
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming the API returns the created review
        state.reviews.push(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ----------------- Update Review ----------------- //
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload;
        const index = state.reviews.findIndex(
          (review) => review._id === updatedReview._id
        );
        if (index !== -1) {
          state.reviews[index] = updatedReview;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ----------------- Delete Review ----------------- //
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        const deletedReviewId = action.payload;
        state.reviews = state.reviews.filter(
          (review) => review._id !== deletedReviewId
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reviewsSlice.reducer;
