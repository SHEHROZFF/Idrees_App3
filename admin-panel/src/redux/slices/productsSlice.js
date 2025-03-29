// src/redux/slices/productsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Fetch all products/exams
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/api/products'); // Ensure the correct endpoint
      return response.data; // { success: true, count: X, data: [/* products array */] }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products/exams.'
      );
    }
  }
);

// Add a new product/exam
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (productData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/api/products', productData);
      return response.data; // { success: true, data: {/* new product */} }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to add product/exam.'
      );
    }
  }
);

// Update a product/exam
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/api/products/${id}`, productData);
      return response.data; // { success: true, data: {/* updated product */} }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update product/exam.'
      );
    }
  }
);

// Delete a product/exam
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, thunkAPI) => {
    try {
      const response = await axiosInstance.delete(`/api/products/${id}`);
      // Assuming backend returns { success: true, message: '...', data: { _id: id } }
      return response.data.data._id; // Extract the ID from response
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to delete product/exam.'
      );
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data; // Correctly extract data
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Product
      .addCase(addProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload.data); // Correctly extract data
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const updatedProduct = action.payload.data; // Correctly extract data
        const index = state.products.findIndex((product) => product._id === updatedProduct._id);
        if (index !== -1) {
          state.products[index] = updatedProduct; // Update the product in the array
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter((product) => product._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productsSlice.reducer;
