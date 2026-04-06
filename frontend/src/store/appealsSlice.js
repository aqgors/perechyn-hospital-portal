// src/store/appealsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appealsApi } from '../api/appeals.api.js';
import toast from 'react-hot-toast';

export const fetchAppeals = createAsyncThunk('appeals/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await appealsApi.getAll(params);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createAppeal = createAsyncThunk('appeals/create', async (appealData, { rejectWithValue }) => {
  try {
    const { data } = await appealsApi.create(appealData);
    toast.success('Звернення успішно подано!');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Помилка створення звернення');
  }
});

export const fetchAppealById = createAsyncThunk('appeals/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await appealsApi.getById(id);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const appealsSlice = createSlice({
  name: 'appeals',
  initialState: {
    list: [],
    meta: { total: 0, page: 1, limit: 10, pages: 1 },
    current: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppeals.pending, (state) => { state.isLoading = true; })
      .addCase(fetchAppeals.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.list = payload.data;
        state.meta = payload.meta;
      })
      .addCase(fetchAppeals.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
      })
      .addCase(createAppeal.fulfilled, (state, { payload }) => {
        state.list.unshift(payload);
      })
      .addCase(fetchAppealById.fulfilled, (state, { payload }) => {
        state.current = payload;
      });
  },
});

export const { clearCurrent } = appealsSlice.actions;
export default appealsSlice.reducer;
