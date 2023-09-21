import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: 'undefined'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action) {
      state.token = action.payload.token;
    },
    logout(state) {
      state.token = 'undefined';
    }
  }
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;