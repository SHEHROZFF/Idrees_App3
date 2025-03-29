import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Async thunk to fetch theme settings from the backend
export const fetchTheme = createAsyncThunk('theme/fetchTheme', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/api/theme');
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to fetch theme settings.'
    );
  }
});

// Async thunk to update theme settings (admin only)
export const updateTheme = createAsyncThunk('theme/updateTheme', async (themeData, thunkAPI) => {
  try {
    const response = await axiosInstance.put('/api/theme', themeData);
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to update theme settings.'
    );
  }
});

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Theme
      .addCase(fetchTheme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.theme = action.payload;
      })
      .addCase(fetchTheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Theme
      .addCase(updateTheme.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTheme.fulfilled, (state, action) => {
        state.loading = false;
        state.theme = action.payload;
      })
      .addCase(updateTheme.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default themeSlice.reducer;
