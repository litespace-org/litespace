import { combineReducers, configureStore } from "@reduxjs/toolkit";

const reducer = combineReducers({});

export const store = configureStore({
  reducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
