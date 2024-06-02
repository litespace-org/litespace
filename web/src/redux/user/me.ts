import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { user } from "@/api";
import { User } from "@/types";
import { MultiError } from "@/lib/error";

type State = {
  loading: boolean;
  profile: User.Self | null;
};

const initialState: State = {
  loading: false,
  profile: null,
};

export const findMe = createAsyncThunk(
  "user/profile/me",
  async (): Promise<State["profile"]> => {
    const profile = await user.findMe();
    if (profile instanceof MultiError) return null;
    return profile;
  }
);

export const findMeSlice = createSlice({
  name: "user/me/profile",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(findMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(findMe.fulfilled, (state, { payload }) => {
        console.log({ payload });
        state.loading = false;
      })
      .addCase(findMe.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default findMeSlice.reducer;
