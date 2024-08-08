import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { MultiError } from "@/lib/error";
import { RootState } from "@/redux/store";
import { atlas } from "@/lib/atlas";
import { IUser } from "@litespace/types";

type State = {
  loading: boolean;
  profile: IUser.Self | null;
};

const initialState: State = {
  loading: false,
  profile: null,
};

export const findMe = createAsyncThunk(
  "user/profile/me",
  async (): Promise<State["profile"]> => {
    const profile = await atlas.user.findMe();
    if (profile instanceof MultiError) return null;
    return profile;
  }
);

export const findMeSlice = createSlice({
  name: "user/me/profile",
  initialState,
  reducers: {
    resetUserProfile: () => initialState,
    setUserProfile: (state, { payload }: PayloadAction<IUser.Self>) => {
      state.loading = false;
      state.profile = payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(findMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(findMe.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.profile = payload;
      })
      .addCase(findMe.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const profileSelector = (state: RootState) => state.user.me.profile;

export const { resetUserProfile, setUserProfile } = findMeSlice.actions;

export default findMeSlice.reducer;
