import { combineReducers, configureStore } from "@reduxjs/toolkit";
import user from "@/redux/user";

const reducer = combineReducers({ user });

export const store = configureStore({
  reducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
