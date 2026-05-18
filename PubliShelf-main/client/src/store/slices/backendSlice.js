import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axiosInstance.util';

// Async thunk for checking backend health
export const checkBackendHealth = createAsyncThunk(
  'backend/checkHealth',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('ready');
      if (response.data?.success) {
        return response.data;
      }
      return rejectWithValue('Backend not ready');
    } catch (error) {
      return rejectWithValue(error.message || 'Backend not ready');
    }
  }
);

const initialState = {
  isReady: !(import.meta.env.PROD),
  isChecking: true,
  error: null,
  attempts: 0,
  maxAttempts: 30,
  celebrationShown: false,
};

const backendSlice = createSlice({
  name: 'backend',
  initialState,
  reducers: {
    incrementAttempt: (state) => {
      state.attempts += 1;
    },
    resetBackendState: (state) => {
      state.isReady = false;
      state.isChecking = true;
      state.error = null;
      state.attempts = 0;
      state.celebrationShown = false;
    },
    setCelebrationShown: (state) => {
      state.celebrationShown = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkBackendHealth.pending, (state) => {
        state.isChecking = true;
        state.error = null;
      })
      .addCase(checkBackendHealth.fulfilled, (state, action) => {
        state.isReady = true;
        state.isChecking = false;
        state.error = null;
      })
      .addCase(checkBackendHealth.rejected, (state, action) => {
        state.isChecking = false;
        state.error = action.payload;
        
        // If max attempts reached, mark as "ready" to allow app to proceed
        if (state.attempts >= state.maxAttempts) {
          state.isReady = true;
        }
      });
  },
});

export const { incrementAttempt, resetBackendState, setCelebrationShown } = backendSlice.actions;
export default backendSlice.reducer;
