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

export const updateAppeal = createAsyncThunk('appeals/update', async ({ id, data: appealData }, { rejectWithValue }) => {
  try {
    const { data } = await appealsApi.update(id, appealData);
    toast.success('Звернення оновлено!');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Помилка оновлення звернення');
  }
});

export const deleteAppeal = createAsyncThunk('appeals/delete', async (id, { rejectWithValue }) => {
  try {
    await appealsApi.delete(id);
    toast.success('Звернення видалено');
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Помилка видалення звернення');
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

export const createAppeal = createAsyncThunk('appeals/create', async (appealData, { rejectWithValue }) => {
  try {
    const { data } = await appealsApi.create(appealData);
    toast.success('Звернення успішно подано!');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Помилка створення звернення');
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
      .addCase(updateAppeal.fulfilled, (state, { payload }) => {
        const index = state.list.findIndex(a => a.id === payload.id);
        if (index !== -1) state.list[index] = payload;
        if (state.current?.id === payload.id) state.current = payload;
      })
      .addCase(deleteAppeal.fulfilled, (state, { payload: id }) => {
        state.list = state.list.filter(a => a.id !== id);
        if (state.current?.id === id) state.current = null;
      })
      .addCase(fetchAppealById.fulfilled, (state, { payload }) => {
        state.current = payload;
      });
  },
});

export const { clearCurrent } = appealsSlice.actions;
export default appealsSlice.reducer;
