import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { IUser } from "@litespace/types";
import { initial, LoadableState } from "@litespace/luna";

type State = LoadableState<{ user: IUser.Self; token: string | null }>;

const initialState: State = initial();

export const profileSelectors = {
  user: (state: RootState) => state.user.me.value?.user || null,
  token: (state: RootState) => state.user.me.value?.token || null,
  value: (state: RootState) => state.user.me.value,
  full: (state: RootState) => state.user.me,
};

export const slice = createSlice({
  name: "user/me/profile",
  initialState,
  reducers: {
    resetUserProfile: () => initialState,
    setUserProfile: (
      state,
      { payload }: PayloadAction<{ user: IUser.Self; token?: string }>
    ) => {
      state.loading = false;
      state.error = null;
      state.value = {
        user: payload.user,
        token: payload.token || null,
      };
    },
  },
});

export const profileSelector = (state: RootState) => state.user.me.value;

export const { resetUserProfile, setUserProfile } = slice.actions;

export default slice.reducer;
