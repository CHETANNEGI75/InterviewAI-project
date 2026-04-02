import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js"; // 👈 check this file exists

const store = configureStore({
  reducer: {
    user: userReducer
  }
});

export default store;