import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { IUser } from "@litespace/types";
import {
  fetcher,
  initial,
  LoadableState,
  createThunk,
  atlas,
} from "@litespace/luna";

type State = LoadableState<IUser.Self>;

const initialState: State = initial();

export const profileSelectors = {
  value: (state: RootState) => state.user.me.value,
  full: (state: RootState) => state.user.me,
};

export const findProfile = createThunk(
  "user/profile/me/thunk",
  () => atlas.user.findMe(),
  profileSelectors.full
);

export const slice = createSlice({
  name: "user/me/profile",
  initialState,
  reducers: {
    resetUserProfile: () => initialState,
    setUserProfile: (state, { payload }: PayloadAction<IUser.Self | null>) => {
      state.loading = false;
      state.error = null;
      state.value = payload;
    },
  },
  extraReducers(builder) {
    fetcher(builder, findProfile);
  },
});

export const profileSelector = (state: RootState) => state.user.me.value;

export const { resetUserProfile, setUserProfile } = slice.actions;

export default slice.reducer;
