// src/store/slices/policySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPolicy } from '../../services/api';

export const fetchPolicyThunk = createAsyncThunk(
  'policy/fetch',
  async (type, { rejectWithValue }) => {
    try {
      const response = await fetchPolicy(type);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      console.log('responsepolicy', response);
      
      return response; // e.g. { policy: "..." }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  policyContent: null
};

const policySlice = createSlice({
  name: 'policy',
  initialState,
  reducers: {
    clearPolicyError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPolicyThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyThunk.fulfilled, (state, action) => {
        state.loading = false;
        // e.g. { policy: "some text" }
        state.policyContent = action.payload.policy || '';
      })
      .addCase(fetchPolicyThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPolicyError } = policySlice.actions;
export default policySlice.reducer;
