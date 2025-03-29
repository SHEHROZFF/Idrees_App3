// src/store/slices/productSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchProducts,
  getProductDetails,
  getTopProducts,
  getProductById,
} from '../../services/api';

export const fetchAllProducts = createAsyncThunk(
  'products/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchProducts();
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response; // shape: { products: [...] } or { ... }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// export const fetchProductDetails = createAsyncThunk(
//   'products/fetchDetails',
//   async (productId, { rejectWithValue }) => {
//     try {
//       const response = await getProductDetails(productId);
//       if (!response.success) {
//         return rejectWithValue(response.message);
//       }
//       return response.data; // shape: { product: {...} }
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// export const fetchTopProductsThunk = createAsyncThunk(
//   'products/fetchTop',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await getTopProducts();
//       if (!response.success) {
//         return rejectWithValue(response.message);
//       }
//       return response.data; // shape: { products: [...top rated...] }
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

export const fetchProductByIdThunk = createAsyncThunk(
  'products/fetchById',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await getProductById(productId);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      return response; // shape: { product: {...} }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  products: [],
  topProducts: [],
  selectedProduct: null
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProductsError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllProducts
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        // If your backend returns { products: [...] }
        state.products = action.payload.data || [];
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchProductDetails
      // .addCase(fetchProductDetails.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchProductDetails.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.selectedProduct = action.payload.product || null;
      // })
      // .addCase(fetchProductDetails.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })

      // fetchTopProductsThunk
      // .addCase(fetchTopProductsThunk.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(fetchTopProductsThunk.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.topProducts = action.payload.products || [];
      // })
      // .addCase(fetchTopProductsThunk.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // })

      // fetchProductByIdThunk
      .addCase(fetchProductByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload.data || null;
      })
      .addCase(fetchProductByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearProductsError } = productSlice.actions;
export default productSlice.reducer;
