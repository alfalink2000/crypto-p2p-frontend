import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/client.js';

const TOKEN_KEY = 'crypto_p2p_token';

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    return await api.post('/auth/login', { email, password });
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      return await api.post('/auth/register', payload);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const token = localStorage.getItem(TOKEN_KEY);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: token ? JSON.parse(localStorage.getItem('crypto_p2p_user') || 'null') : null,
    status: 'idle',
    error: null,
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('crypto_p2p_user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem('crypto_p2p_user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem('crypto_p2p_user', JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'idle';
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
