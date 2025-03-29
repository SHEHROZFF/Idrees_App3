// src/store/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPaymentIntent } from '../../services/api';

export const fetchPaymentIntentThunk = createAsyncThunk(
  'payment/fetchIntent',
  async (totalPrice, { rejectWithValue }) => {
    try {
      const clientSecret = await fetchPaymentIntent(totalPrice);
      if (!clientSecret) {
        return rejectWithValue('Failed to create payment intent');
      }
      // console.log(clientSecret);
      
      return clientSecret;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  clientSecret: null
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPaymentIntentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentIntentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload;
      })
      .addCase(fetchPaymentIntentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
