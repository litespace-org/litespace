import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { atlas } from "@/lib/atlas";
import { IUser } from "@litespace/types";
import { fetcher, initial, LoadableState } from "@/redux/fetcher";

type State = LoadableState<IUser.Self>;

const initialState: State = initial();

export const findProfile = createAsyncThunk(
  "user/profile/me",
  async (): Promise<IUser.Self> => {
    return await atlas.user.findMe();
  }
);

export const slice = createSlice({
  name: "user/me/profile",
  initialState,
  reducers: {
    resetUserProfile: () => initialState,
    setUserProfile: (state, { payload }: PayloadAction<IUser.Self>) => {
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
