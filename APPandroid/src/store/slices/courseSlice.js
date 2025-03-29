// src/store/slices/courseSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchCourses,
  fetchFeaturedReels,
  fetchAds,
  searchCoursesAPI,
  fetchCourseById,
} from '../../services/api';

export const fetchCoursesThunk = createAsyncThunk(
  'courses/fetchAll',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await fetchCourses(page, limit);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Add a "loadMore" flag in the payload so we can differentiate between
 * an initial fetch and pagination loading. We'll store page, hasMore,
 * etc. in Redux state, so the component doesn't have to hold them.
 */
export const fetchFeaturedReelsThunk = createAsyncThunk(
  'courses/fetchFeaturedReels',
  async ({ page = 1, limit = 5, loadMore = false } = {}, { rejectWithValue }) => {
    try {
      const response = await fetchFeaturedReels(page, limit);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      // We'll return the reels data plus the original args so we know
      // the page/limit/loadMore on the fulfillment side.
      return {
        data: response.data,
        page,
        limit,
        loadMore,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdsThunk = createAsyncThunk(
  'courses/fetchAds',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAds();
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const searchCoursesThunk = createAsyncThunk(
  'courses/search',
  async (query, { rejectWithValue }) => {
    try {
      const response = await searchCoursesAPI(query);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCourseByIdThunk = createAsyncThunk(
  'courses/fetchById',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await fetchCourseById(courseId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  courses: [],
  // Ads
  ads: [],
  // Searching
  searchedCourses: [],
  // Single course
  selectedCourse: null,

  // Featured Reels
  featuredReels: [],
  featuredReelsError: null,
  featuredReelsLoading: false,
  // Additional pagination logic
  featuredReelsPage: 1,
  featuredReelsHasMore: true,
};

const courseSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearCoursesError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ------------------- fetchCoursesThunk ------------------- //
      .addCase(fetchCoursesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesThunk.fulfilled, (state, action) => {
        state.loading = false;
        // If your API returns { data: [...] }
        state.courses = action.payload.data || [];
      })
      .addCase(fetchCoursesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ------------------- fetchFeaturedReelsThunk ------------------- //
      .addCase(fetchFeaturedReelsThunk.pending, (state) => {
        // Distinguish between "initial fetch" and "load more" if desired.
        // For simplicity, we'll just store a single loading flag here:
        state.featuredReelsLoading = true;
        state.featuredReelsError = null;
      })
      .addCase(fetchFeaturedReelsThunk.fulfilled, (state, action) => {
        state.featuredReelsLoading = false;
        const { data, page, limit, loadMore } = action.payload;

        if (loadMore) {
          // Append new reels
          state.featuredReels = [...state.featuredReels, ...data];
        } else {
          // Initial fetch / refresh
          state.featuredReels = data;
        }

        // If we fetched fewer than 'limit' reels, no more remain.
        state.featuredReelsHasMore = data.length >= limit;

        // Update current page for potential next load
        state.featuredReelsPage = loadMore ? page + 1 : 2;
      })
      .addCase(fetchFeaturedReelsThunk.rejected, (state, action) => {
        state.featuredReelsLoading = false;
        state.featuredReelsError = action.payload;
        state.featuredReelsHasMore = false;
      })

      // ------------------- fetchAdsThunk ------------------- //
      .addCase(fetchAdsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload.data || [];
      })
      .addCase(fetchAdsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ------------------- searchCoursesThunk ------------------- //
      .addCase(searchCoursesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchCoursesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.searchedCourses = action.payload.courses || [];
      })
      .addCase(searchCoursesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ------------------- fetchCourseByIdThunk ------------------- //
      .addCase(fetchCourseByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCourse = action.payload.data || null;
      })
      .addCase(fetchCourseByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCoursesError } = courseSlice.actions;
export default courseSlice.reducer;
