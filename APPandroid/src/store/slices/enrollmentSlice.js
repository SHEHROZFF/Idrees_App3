// src/store/slices/enrollmentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  enrollInCourseAPI,
  unenrollFromCourseAPI,
  getMyEnrollmentsAPI,
  updateEnrollmentAPI,
  updateLessonProgressAPI
} from '../../services/api';

export const enrollInCourseThunk = createAsyncThunk(
  'enrollments/enroll',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await enrollInCourseAPI(courseId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data; // e.g. { enrollment: {...} }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const unenrollFromCourseThunk = createAsyncThunk(
  'enrollments/unenroll',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await unenrollFromCourseAPI(courseId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data; // e.g. { message: 'Unenrolled' }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyEnrollmentsThunk = createAsyncThunk(
  'enrollments/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getMyEnrollmentsAPI();
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data; // e.g. { enrollments: [...] }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEnrollmentThunk = createAsyncThunk(
  'enrollments/update',
  async ({ courseId, updates }, { rejectWithValue }) => {
    try {
      const response = await updateEnrollmentAPI(courseId, updates);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data; // updated enrollment
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLessonProgressThunk = createAsyncThunk(
  'enrollments/updateLessonProgress',
  async ({ courseId, progressData }, { rejectWithValue }) => {
    try {
      const response = await updateLessonProgressAPI(courseId, progressData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response; // e.g. updated enrollment
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  myEnrollments: [],
  updatedEnrollment: null
};

const enrollmentSlice = createSlice({
  name: 'enrollments',
  initialState,
  reducers: {
    clearEnrollmentError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(enrollInCourseThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(enrollInCourseThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Could push the new enrollment object to myEnrollments if returned
      })
      .addCase(enrollInCourseThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(unenrollFromCourseThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unenrollFromCourseThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Could remove the enrollment from myEnrollments
      })
      .addCase(unenrollFromCourseThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchMyEnrollmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollmentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.myEnrollments = action.payload.enrollments || [];
      })
      .addCase(fetchMyEnrollmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateEnrollmentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEnrollmentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.updatedEnrollment = action.payload.enrollment || null;
      })
      .addCase(updateEnrollmentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateLessonProgressThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLessonProgressThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Could also update myEnrollments or updatedEnrollment
      })
      .addCase(updateLessonProgressThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearEnrollmentError } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
