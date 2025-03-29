import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance';

// Fetch all ads
export const fetchAds = createAsyncThunk(
  'ads/fetchAds',
  async (_, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/api/ads');
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to fetch ads.'
      );
    }
  }
);

// Add a new ad
export const addAd = createAsyncThunk(
  'ads/addAd',
  async (adData, thunkAPI) => {
    try {
      const response = await axiosInstance.post('/api/ads', adData);
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to add ad.'
      );
    }
  }
);

// Update an ad
export const updateAd = createAsyncThunk(
  'ads/updateAd',
  async ({ id, adData }, thunkAPI) => {
    try {
      const response = await axiosInstance.put(`/api/ads/${id}`, adData);
      console.log("Update response:", response);
      
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to update ad.'
      );
    }
  }
);

// Delete an ad
export const deleteAd = createAsyncThunk(
  'ads/deleteAd',
  async (id, thunkAPI) => {
    try {
      await axiosInstance.delete(`/api/ads/${id}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || 'Failed to delete ad.'
      );
    }
  }
);

const adsSlice = createSlice({
  name: 'ads',
  initialState: {
    ads: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Ads
      .addCase(fetchAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = Array.isArray(action.payload)
          ? action.payload
          : action.payload.data;
      })
      .addCase(fetchAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Ad
      .addCase(addAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAd.fulfilled, (state, action) => {
        state.loading = false;
        state.ads.push(action.payload);
      })
      .addCase(addAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Ad
      .addCase(updateAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAd.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.ads.findIndex(ad => ad._id === action.payload._id);
        if (index !== -1) {
          state.ads[index] = action.payload;
        }
      })
      .addCase(updateAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Ad
      .addCase(deleteAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAd.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = state.ads.filter(ad => ad._id !== action.payload);
      })
      .addCase(deleteAd.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default adsSlice.reducer;








// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../../utils/axiosInstance';

// // Fetch all ads
// export const fetchAds = createAsyncThunk(
//   'ads/fetchAds',
//   async (_, thunkAPI) => {
//     try {
//       const response = await axiosInstance.get('/api/ads');
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch ads.'
//       );
//     }
//   }
// );

// // Add a new ad
// export const addAd = createAsyncThunk(
//   'ads/addAd',
//   async (adData, thunkAPI) => {
//     try {
//       const response = await axiosInstance.post('/api/ads', adData);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to add ad.'
//       );
//     }
//   }
// );

// // Update an ad
// export const updateAd = createAsyncThunk(
//   'ads/updateAd',
//   async ({ id, adData }, thunkAPI) => {
//     try {
//       const response = await axiosInstance.put(`/api/ads/${id}`, adData);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to update ad.'
//       );
//     }
//   }
// );

// // Delete an ad
// export const deleteAd = createAsyncThunk(
//   'ads/deleteAd',
//   async (id, thunkAPI) => {
//     try {
//       await axiosInstance.delete(`/api/ads/${id}`);
//       return id;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to delete ad.'
//       );
//     }
//   }
// );

// const adsSlice = createSlice({
//   name: 'ads',
//   initialState: {
//     ads: [],
//     loading: false,
//     error: null,
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Ads
//       .addCase(fetchAds.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAds.fulfilled, (state, action) => {
//         state.loading = false;
//         // If the API returns an object with a "data" property, use that array.
//         state.ads = Array.isArray(action.payload)
//           ? action.payload
//           : action.payload.data;
//       })
//       .addCase(fetchAds.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Add Ad
//       .addCase(addAd.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addAd.fulfilled, (state, action) => {
//         state.loading = false;
//         state.ads.push(action.payload);
//       })
//       .addCase(addAd.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Update Ad
//       .addCase(updateAd.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateAd.fulfilled, (state, action) => {
//         state.loading = false;
//         const index = state.ads.findIndex(ad => ad._id === action.payload._id);
//         if (index !== -1) {
//           state.ads[index] = action.payload;
//         }
//       })
//       .addCase(updateAd.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Delete Ad
//       .addCase(deleteAd.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteAd.fulfilled, (state, action) => {
//         state.loading = false;
//         state.ads = state.ads.filter(ad => ad._id !== action.payload);
//       })
//       .addCase(deleteAd.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default adsSlice.reducer;











// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axiosInstance from '../../utils/axiosInstance';

// // Fetch all ads
// export const fetchAds = createAsyncThunk(
//   'ads/fetchAds',
//   async (_, thunkAPI) => {
//     try {
//       const response = await axiosInstance.get('/api/ads');
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to fetch ads.'
//       );
//     }
//   }
// );

// // Add a new ad
// export const addAd = createAsyncThunk(
//   'ads/addAd',
//   async (adData, thunkAPI) => {
//     try {
//       const response = await axiosInstance.post('/api/ads', adData);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to add ad.'
//       );
//     }
//   }
// );

// // Update an ad
// export const updateAd = createAsyncThunk(
//   'ads/updateAd',
//   async ({ id, adData }, thunkAPI) => {
//     try {
//       const response = await axiosInstance.put(`/api/ads/${id}`, adData);
//       return response.data;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to update ad.'
//       );
//     }
//   }
// );

// // Delete an ad
// export const deleteAd = createAsyncThunk(
//   'ads/deleteAd',
//   async (id, thunkAPI) => {
//     try {
//       await axiosInstance.delete(`/api/ads/${id}`);
//       return id;
//     } catch (error) {
//       return thunkAPI.rejectWithValue(
//         error.response?.data?.message || 'Failed to delete ad.'
//       );
//     }
//   }
// );

// const adsSlice = createSlice({
//   name: 'ads',
//   initialState: {
//     ads: [],
//     loading: false,
//     error: null,
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Ads
//       .addCase(fetchAds.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchAds.fulfilled, (state, action) => {
//         state.loading = false;
//         state.ads = action.payload;
//       })
//       .addCase(fetchAds.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Add Ad
//       .addCase(addAd.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(addAd.fulfilled, (state, action) => {
//         state.loading = false;
//         state.ads.push(action.payload);
//       })
//       .addCase(addAd.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Update Ad
//       .addCase(updateAd.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateAd.fulfilled, (state, action) => {
//         state.loading = false;
//         const index = state.ads.findIndex(ad => ad._id === action.payload._id);
//         if (index !== -1) {
//           state.ads[index] = action.payload;
//         }
//       })
//       .addCase(updateAd.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       // Delete Ad
//       .addCase(deleteAd.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(deleteAd.fulfilled, (state, action) => {
//         state.loading = false;
//         state.ads = state.ads.filter(ad => ad._id !== action.payload);
//       })
//       .addCase(deleteAd.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default adsSlice.reducer;
