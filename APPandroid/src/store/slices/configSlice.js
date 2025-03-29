// src/store/slices/configSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
import { configStripeKey } from '../../services/api';

export const fetchStripeConfig = createAsyncThunk(
  'config/fetchStripeConfig',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await configStripeKey();
      // console.log("stripe config", data);
      
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const configSlice = createSlice({
  name: 'config',
  initialState: {
    stripePublishableKey: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStripeConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStripeConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.stripePublishableKey = action.payload.publishableKey;
      })
      .addCase(fetchStripeConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default configSlice.reducer;
