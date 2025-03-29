// src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  loginUser,
  registerUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  verifyAuthToken,
  changeUserPassword,
} from '../../services/api';

// ---------------- Thunks ---------------- //

// Login
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await loginUser(email, password);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data; // includes { token, user, etc. } depending on your backend
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Register
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await registerUser(userData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Forgot Password
export const forgotPwd = createAsyncThunk(
  'auth/forgotPwd',
  async (email, { rejectWithValue }) => {
    try {
      const response = await forgotPassword(email);
      if (!response.success) {
        // Some backends return success/failure differently
        return rejectWithValue(response.message);
      }
      return response; // Might be { message: 'Email sent' }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Verify OTP
export const verifyOtpThunk = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await verifyOtp(email, otp);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reset Password
export const resetPwd = createAsyncThunk(
  'auth/resetPwd',
  async ({ email, newPassword }, { rejectWithValue }) => {
    try {
      const response = await resetPassword(email, newPassword);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Profile
export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUserProfile();
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      // console.log('responsethunk', response.data);
      
      return response.data; // e.g. user object
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update Profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await updateUserProfile(updatedData);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Logout
export const logout = createAsyncThunk('auth/logout', async () => {
  const response = await logoutUser();
  // console.log('responsethunk',response);
  
  // if (!response) {
  //   throw new Error('Logout failed');
  // }
  return true; // Just to let Redux know it's done
});

// Verify Token
export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const isValid = await verifyAuthToken();
      if (!isValid) {
        return rejectWithValue('Invalid or expired token');
      }
      return isValid; // true
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Change Password
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const response = await changeUserPassword(oldPassword, newPassword);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response.data; // maybe { message: 'Password updated' }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ---------------- Slice ---------------- //

const initialState = {
  loading: false,
  error: null,
  user: null,          // user data from server
  tokenVerified: false, // whether we verified a token is valid
  logout: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearAuthState(state) {
      // reset entire state if needed
      state.loading = false;
      state.error = null;
      state.user = null;
      state.tokenVerified = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        // The API might return user in action.payload.user
        // or it might be inside action.payload, depends on your backend shape
        state.user = action.payload.user || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })

      // REGISTER
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload.user || null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Register failed';
      })

      // FORGOT PASSWORD
      .addCase(forgotPwd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPwd.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPwd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to send reset link';
      })

      // VERIFY OTP
      .addCase(verifyOtpThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpThunk.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyOtpThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'OTP verification failed';
      })

      // RESET PASSWORD
      .addCase(resetPwd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPwd.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPwd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Reset password failed';
      })

      // FETCH PROFILE
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload.data; // or action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user profile';
      })

      // UPDATE PROFILE
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.user = action.payload.user || state.user; 
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Update profile failed';
      })

      // LOGOUT
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.tokenVerified = false;
        state.error = null;
        state.loading = false;
        state.logout = true;
      })

      // VERIFY TOKEN
      .addCase(verifyToken.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.tokenVerified = false;
      })
      .addCase(verifyToken.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.tokenVerified = true;
      })
      .addCase(verifyToken.rejected, (state, action) => {
        state.loading = false;
        state.tokenVerified = false;
        state.error = action.payload || 'Token not valid';
      })

      // CHANGE PASSWORD
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Change password failed';
      });
  }
});

export const { clearAuthError, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
