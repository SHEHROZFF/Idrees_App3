import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  addOrUpdateReview,
  getProductReviewsAPI,
  deleteReviewAPI,
  getMyReviewsAPI,
  updateReviewAPI,
} from '../../services/api';

/* ──────────────────────────────────────────────
   Thunks
   ────────────────────────────────────────────── */
export const addOrUpdateReviewThunk = createAsyncThunk(
  'reviews/addOrUpdate',
  async ({ reviewableId, reviewableType, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await addOrUpdateReview(reviewableId, reviewableType, rating, comment);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data; // e.g. the newly created or updated review
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchReviews = createAsyncThunk(
  'reviews/fetchAll',
  async ({ reviewableId, reviewableType }, { rejectWithValue }) => {
    try {
      const response = await getProductReviewsAPI(reviewableId, reviewableType);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteReviewThunk = createAsyncThunk(
  'reviews/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      const response = await deleteReviewAPI(reviewId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      console.log('responsedelete', response);
      
      // Return the deleted review’s ID so we can remove it from state
      return { deletedReviewId: reviewId, success: response.success };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyReviewsThunk = createAsyncThunk(
  'reviews/fetchMyReviews',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyReviewsAPI();
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      console.log('responsemyrev', response);
      return response.data; // e.g. { success: true, data: [my reviews] }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateReviewThunk = createAsyncThunk(
  'reviews/updateReview',
  async ({ reviewId, rating, comment }, { rejectWithValue }) => {
    try {
      const response = await updateReviewAPI(reviewId, rating, comment);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response; // e.g. { success: true, data: updatedReview }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/* ──────────────────────────────────────────────
   Initial State
   ────────────────────────────────────────────── */
const initialState = {
  loading: false,
  error: null,
  allReviews: [],  // ← For general “all reviews” of a product
  myReviews: [],   // ← For “my reviews” only
};

/* ──────────────────────────────────────────────
   Slice
   ────────────────────────────────────────────── */
const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ─── Add/Update Review ─────────────────── */
      .addCase(addOrUpdateReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrUpdateReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;

        // The newly created or updated review
        const newReview = action.payload;

        // Optional: If you want to insert or update in `allReviews`:
        const idxAll = state.allReviews.findIndex((r) => r._id === newReview._id);
        if (idxAll > -1) {
          // update in allReviews
          state.allReviews[idxAll] = newReview;
        } else {
          // push to allReviews if it belongs there
          state.allReviews.push(newReview);
        }

        // Optional: If it’s the user's own review, also insert/update myReviews:
        const idxMy = state.myReviews.findIndex((r) => r._id === newReview._id);
        if (idxMy > -1) {
          state.myReviews[idxMy] = newReview;
        } else {
          state.myReviews.push(newReview);
        }
      })
      .addCase(addOrUpdateReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ─── Fetch All Reviews (for a product) ─── */
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Suppose server returns { success, data: arrayOfReviews }
        state.allReviews = action.payload.data || [];
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ─── Delete Review ─────────────────────── */
      .addCase(deleteReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const { deletedReviewId } = action.payload;

        // remove from allReviews
        state.allReviews = state.allReviews.filter((r) => r._id !== deletedReviewId);
        // remove from myReviews
        state.myReviews = state.myReviews.filter((r) => r._id !== deletedReviewId);
      })
      .addCase(deleteReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ─── Fetch My Reviews ──────────────────── */
      .addCase(fetchMyReviewsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviewsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // Suppose server returns { success, data: userReviews }
        state.myReviews = action.payload.data || [];
      })
      .addCase(fetchMyReviewsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ─── Update Review ─────────────────────── */
      .addCase(updateReviewThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReviewThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const updatedReview = action.payload.data;

        // Update in allReviews if it exists
        const idxAll = state.allReviews.findIndex((r) => r._id === updatedReview._id);
        if (idxAll !== -1) {
          state.allReviews[idxAll] = updatedReview;
        }

        // Update in myReviews if it exists
        const idxMy = state.myReviews.findIndex((r) => r._id === updatedReview._id);
        if (idxMy !== -1) {
          state.myReviews[idxMy] = updatedReview;
        }
      })
      .addCase(updateReviewThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;
