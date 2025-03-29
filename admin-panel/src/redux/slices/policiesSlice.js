// admin/src/redux/slices/policiesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

export const fetchPolicy = createAsyncThunk(
  'policies/fetchPolicy',
  async (type, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/api/policies/${type}`);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch policy.');
    }
  }
);

export const updatePolicy = createAsyncThunk(
  'policies/updatePolicy',
  async ({ type, content }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/api/policies/${type}`, { content });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update policy.');
    }
  }
);

const policiesSlice = createSlice({
  name: 'policies',
  initialState: {
    policy: null,
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policy = action.payload;
      })
      .addCase(fetchPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policy = action.payload;
      })
      .addCase(updatePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default policiesSlice.reducer;
