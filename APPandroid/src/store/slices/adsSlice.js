// File: src/store/slices/adsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAds } from '../../services/api'; // Adjust path to your actual API utility

/** Simple check for staleness. */
function isStale(lastFetched) {
  if (!lastFetched) return true;
  const now = Date.now();
  const THIRTY_SECONDS = 1000 * 30;
  return now - lastFetched > THIRTY_SECONDS;
}

export const fetchAdsThunk = createAsyncThunk(
  'ads/fetchAds',
  async (_, { getState }) => {
    const { ads } = getState();

    // If we've fetched before and it's not stale, reuse cache
    if (ads.hasFetched && !isStale(ads.lastFetched)) {
      return { data: ads.data };
    }

    // Otherwise, actually call the server
    const response = await fetchAds();

    if (!response?.success) {
      throw new Error(response?.message || 'Fetching ads failed');
    }

    // Adjust as needed based on your API response shape
    const result = response.data.data;
    console.log('Fetched Ads =>', result);

    return { data: result };
  }
);

const adsSlice = createSlice({
  name: 'ads',
  initialState: {
    data: [],
    loading: false,
    hasFetched: false,
    lastFetched: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.hasFetched = true;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAdsThunk.rejected, (state) => {
        state.loading = false;
        state.hasFetched = false;
      });
  },
});

export default adsSlice.reducer;














// // adsSlice.js
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import { fetchAds } from '../../services/api';

// /** Simple check for staleness. */
// function isStale(lastFetched) {
//   if (!lastFetched) return true;
//   const now = Date.now();
//   const THIRTY_SECONDS = 1000 * 30;
//   return now - lastFetched > THIRTY_SECONDS;
// }

// export const fetchAdsThunk = createAsyncThunk(
//   'ads/fetchAds',
//   async (_, { getState }) => {
//     const { ads } = getState(); // the 'ads' slice (see combineReducers)
    
//     // If we've fetched before and it's not stale, reuse cache
//     if (ads.hasFetched && !isStale(ads.lastFetched)) {
//       return { data: ads.data }; // reuse cached data
//     }

//     // Otherwise, actually call the server
//     const response = await fetchAds();
    
//     // "response" depends on your API shape. If it's { success: true, data: [...] },
//     // you can do:
//     if (!response?.success) {
//       // handle the error or throw
//       throw new Error(response?.message || 'Fetching ads failed');
//     }

//     // 'result' should be the array or object that holds your ads
//     const result = response.data.data; 
//     console.log('responseads', result);

//     // Return the real data
//     return {
//       data: result // e.g. if result is an array of ads
//     };
//   }
// );

// const adsSlice = createSlice({
//   name: 'ads',
//   initialState: {
//     data: [],       // Here is where we'll keep our ads array
//     loading: false,
//     hasFetched: false,
//     lastFetched: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchAdsThunk.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchAdsThunk.fulfilled, (state, action) => {
//         state.loading = false;
//         // action.payload.data is the array (or object) from the server
//         state.data = action.payload.data; 
//         state.hasFetched = true;
//         state.lastFetched = Date.now();
//       })
//       .addCase(fetchAdsThunk.rejected, (state) => {
//         state.loading = false;
//         state.hasFetched = false;
//       });
//   }
// });

// export default adsSlice.reducer;
