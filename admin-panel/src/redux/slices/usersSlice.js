// src/redux/slices/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Fetch all users
export const fetchUsers = createAsyncThunk('users/fetchUsers', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get('api/users');
    return response.data; // { success: true, count: X, data: [/* users array */] }
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to fetch users.'
    );
  }
});

// Add a new user
export const addUser = createAsyncThunk('users/addUser', async (userData, thunkAPI) => {
  try {
    const response = await axiosInstance.post('api/users', userData);
    return response.data; // { success: true, data: {/* new user */} }
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to add user.'
    );
  }
});

// Update a user
export const updateUser = createAsyncThunk('users/updateUser', async ({ id, userData }, thunkAPI) => {
  try {
    const response = await axiosInstance.put(`api/users/${id}`, userData);
    return response.data; // { success: true, data: {/* updated user */} }
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to update user.'
    );
  }
});

// Delete a user
export const deleteUser = createAsyncThunk('users/deleteUser', async (id, thunkAPI) => {
  try {
    const response = await axiosInstance.delete(`api/users/${id}`);
    return response.data; // { success: true, data: {/* deleted user or ID */} }
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || 'Failed to delete user.'
    );
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [], // Initialize as empty array
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data; // Extract users array
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add User
      .addCase(addUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload.data); // Push new user
      })
      .addCase(addUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const updatedUser = action.payload.data;
        const index = state.users.findIndex((user) => user._id === updatedUser._id);
        if (index !== -1) {
          state.users[index] = updatedUser; // Update user in the array
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Assuming backend returns the deleted user's ID in action.payload.data._id
        const deletedUserId = action.payload.data._id;
        
        state.users = state.users.filter((user) => user._id !== deletedUserId);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;
