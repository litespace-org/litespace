import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { IUser } from "@litespace/types";
import { saveToken } from "@litespace/luna/cache";
import { initial, LoadableState, createThunk } from "@litespace/luna/redux";
import { Atlas } from "@litespace/atlas";

type Value = { user: IUser.Self; token: string | null };
type State = LoadableState<Value>;

const initialState: State = initial();

export const profileSelectors = {
  user: (state: RootState) => state.user.profile.value?.user || null,
  token: (state: RootState) => state.user.profile.value?.token || null,
  full: (state: RootState) => state.user.profile,
  value: (state: RootState) => state.user.profile.value,
} as const;

export const findCurrentUser = createThunk(
  "user/profile",
  async (atlas: Atlas): Promise<Value> => {
    return await atlas.user.findCurrentUser();
  },
  profileSelectors.full
);

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
