// src/redux/slices/enrollmentsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

/**
 * FETCH all enrollments (Admin can see all)
 */
export const fetchEnrollments = createAsyncThunk(
  'enrollments/fetchEnrollments',
  async (_, thunkAPI) => {
    try {
      // Adjust endpoint as needed, e.g. "/api/enrollments/admin"
      const response = await axiosInstance.get('/api/enrollments/admin');
      // Assume response = { success: true, data: [ { _id, user, course, etc. } ] }
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch enrollments.'
      );
    }
  }
);

/**
 * ADD a new enrollment
 */
export const addEnrollment = createAsyncThunk(
  'enrollments/addEnrollment',
  async (enrollmentData, thunkAPI) => {
    try {
      // Adjust to match your endpoint
      const response = await axiosInstance.post('/api/enrollments/admin', enrollmentData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to add enrollment.'
      );
    }
  }
);

/**
 * UPDATE an existing enrollment
 */
export const updateEnrollment = createAsyncThunk(
  'enrollments/updateEnrollment',
  async ({ id, enrollmentData }, thunkAPI) => {
    try {
      // Typically /api/enrollments/admin/:id
      const response = await axiosInstance.put(`/api/enrollments/admin/${id}`, enrollmentData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update enrollment.'
      );
    }
  }
);

/**
 * DELETE an enrollment
 */
export const deleteEnrollment = createAsyncThunk(
  'enrollments/deleteEnrollment',
  async (id, thunkAPI) => {
    try {
      // Typically /api/enrollments/admin/:id
      const response = await axiosInstance.delete(`/api/enrollments/admin/${id}`);
      // Assume response.data = { success: true, data: { _id: id }, message: "Deleted..." }
      return response.data.data._id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to delete enrollment.'
      );
    }
  }
);

const enrollmentsSlice = createSlice({
  name: 'enrollments',
  initialState: {
    enrollments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchEnrollments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEnrollments.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload.data; // If your backend returns "data: [..]"
      })
      .addCase(fetchEnrollments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ADD
      .addCase(addEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments.push(action.payload.data); // Insert new enrollment
      })
      .addCase(addEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // UPDATE
      .addCase(updateEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.data;
        const index = state.enrollments.findIndex((en) => en._id === updated._id);
        if (index !== -1) {
          state.enrollments[index] = updated;
        }
      })
      .addCase(updateEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // DELETE
      .addCase(deleteEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = state.enrollments.filter((en) => en._id !== action.payload);
      })
      .addCase(deleteEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default enrollmentsSlice.reducer;
