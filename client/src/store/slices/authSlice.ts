import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../api/authApi/types';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'guest';

export interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    bootstrapping: (state) => {
      state.status = 'loading';
    },
    credentialsSet: (
      state,
      action: PayloadAction<{ accessToken: string; user?: AuthUser }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.status = 'authenticated';
    },
    loggedOut: (state) => {
      state.accessToken = null;
      state.user = null;
      state.status = 'guest';
    },
  },
});

export const { bootstrapping, credentialsSet, loggedOut } = authSlice.actions;
export default authSlice.reducer;
