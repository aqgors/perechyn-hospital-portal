// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import appealsReducer from './appealsSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appeals: appealsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
});
