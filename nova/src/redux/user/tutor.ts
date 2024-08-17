import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { atlas } from "@/lib/atlas";
import { ITutor } from "@litespace/types";
import { fetcher, initial, LoadableState } from "@/redux/fetcher";

type State = LoadableState<ITutor.Self>;

const initialState: State = initial();

export const findTutorMeta = createAsyncThunk(
  "user/tutor/meta",
  async (tutorId: number): Promise<ITutor.Self> => {
    return await atlas.user.findTutorMeta(tutorId);
  }
);

export const slice = createSlice({
  name: "user/me/profile",
  initialState,
  reducers: {
    resetTutorMeta: () => initialState,
  },
  extraReducers(builder) {
    fetcher(builder, findTutorMeta);
  },
});

export const tutorMetaSelector = (state: RootState) => state.user.tutor.value;

export const { resetTutorMeta } = slice.actions;

export default slice.reducer;
