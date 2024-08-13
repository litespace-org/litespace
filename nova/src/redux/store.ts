import { combineReducers, configureStore } from "@reduxjs/toolkit";
import user from "@/redux/user";
import chat from "@/redux/chat";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

const reducer = combineReducers({ user, chat });

export const store = configureStore({
  reducer,
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T) =>
  useSelector(selector);
