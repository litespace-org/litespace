import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { atlas } from "@litespace/luna";
import { ITutor } from "@litespace/types";
import { fetcher, initial, LoadableState, createThunk } from "@litespace/luna";

type State = LoadableState<ITutor.Self>;

const initialState: State = initial();

export const tutorMetaSelectors = {
  value: (state: RootState) => state.user.tutor.value,
  full: (state: RootState) => state.user.tutor,
};

export const findTutorMeta = createThunk(
  "user/tutor/meta",
  async (tutorId: number): Promise<ITutor.Self> => {
    return await atlas.user.findTutorMeta(tutorId);
  },
  tutorMetaSelectors.full
);

const slice = createSlice({
  name: "user/tutor",
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
