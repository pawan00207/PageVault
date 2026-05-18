import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  _id: null,
  firstname: null,
  lastname: null,
  email: null,
  address: null,
  profileImage: null,
  orders: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateUser: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => {
      return initialState;
    },
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
