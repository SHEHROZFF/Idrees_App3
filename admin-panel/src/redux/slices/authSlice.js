// src/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Async thunk for admin login
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, thunkAPI) => {
    try {
      const response = await axiosInstance.post('api/auth/login', { email, password });
      const data = response.data;
      // Store token in localStorage
      localStorage.setItem('adminToken', data.token);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  }
);

// Async thunk for admin registration
export const registerAdmin = createAsyncThunk(
  'auth/registerAdmin',
  async ({ name, email, password, role }, thunkAPI) => {
    try {
      const response = await axiosInstance.post('api/auth/register', { name, email, password, role });
      const data = response.data;
      console.log(data);
      return data;Z
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Registration failed. Please try again.'
      );
    }
  }
);

// Async thunk for admin logout
export const logoutAdmin = createAsyncThunk('auth/logoutAdmin', async () => {
  // Remove token from localStorage
  localStorage.removeItem('adminToken');
});

// *** New Async Thunk for Forgot Password ***
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email, thunkAPI) => {
    try {
      const response = await axiosInstance.post('api/auth/forgotpassword', { email, role: 'admin' });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to send reset email. Please try again.'
      );
    }
  }
);

// *** New Async Thunk for Reset Password ***
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ resetToken, password }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`api/auth/resetpassword/${resetToken}`, { password });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to reset password. Please try again.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    admin: null,
    token: localStorage.getItem('adminToken') || null,
    isAuthenticated: !!localStorage.getItem('adminToken'),
    loading: false,
    error: null,
    message: null, // For success messages (e.g., password reset email sent)
  },
  reducers: {
    // Optionally, you can add a reducer to clear messages
    clearAuthMessages: (state) => {
      state.message = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.error = null;
      })
      .addCase(registerAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'Reset email sent successfully.';
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || 'Password reset successfully.';
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAuthMessages } = authSlice.actions;

export default authSlice.reducer;
