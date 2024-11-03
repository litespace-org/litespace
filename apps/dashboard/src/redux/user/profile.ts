import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { IUser } from "@litespace/types";
import { saveToken } from "@litespace/luna/cache";
import { initial, LoadableState } from "@litespace/luna/redux";

type State = LoadableState<{ user: IUser.Self; token: string | null }>;

const initialState: State = initial();

export const profileSelectors = {
  user: (state: RootState) => state.user.profile.value?.user || null,
  token: (state: RootState) => state.user.profile.value?.token || null,
  full: (state: RootState) => state.user.profile,
  value: (state: RootState) => state.user.profile.value,
} as const;

export const slice = createSlice({
  name: "user/profile",
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
      if (payload.token) saveToken(payload.token);
    },
  },
});

export const { resetUserProfile, setUserProfile } = slice.actions;

export default slice.reducer;
