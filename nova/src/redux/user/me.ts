import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { atlas } from "@/lib/atlas";
import { IUser } from "@litespace/types";
import { fetcher, initial, LoadableState } from "@/redux/fetcher";
import { cache } from "@/lib/cache";
import { CacheKey } from "@/constants/cache";

type State = LoadableState<IUser.Self>;

const initialState: State = initial(cache.load(CacheKey.Profile));

export const findProfile = createAsyncThunk(
  "user/profile/me",
  async (): Promise<IUser.Self> => {
    const user = await atlas.user.findMe();
    cache.save(CacheKey.Profile, user);
    return user;
  }
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
