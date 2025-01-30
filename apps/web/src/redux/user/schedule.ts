import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { fetcher, initial, LoadableState } from "@/redux/fetcher";
import { createThunk } from "@/redux/thunk";
import { IAvailabilitySlot } from "@litespace/types";

type State = LoadableState<IAvailabilitySlot.Self[]>;

const initialState: State = initial();

export const findUserSlots = createThunk(
  "user/schedule/slots",
  async (): Promise<IAvailabilitySlot.Self[]> => {
    return [];
  },
  (state) => state.user.schedule
);

const slice = createSlice({
  name: "user/schedule",
  initialState,
  reducers: {
    resetUserSlots: () => initialState,
    setUserSlots: (
      state,
      { payload }: PayloadAction<IAvailabilitySlot.Self[]>
    ) => {
      state.value = payload;
    },
  },
  extraReducers(builder) {
    fetcher(builder, findUserSlots);
  },
});

export const userSlotsSelector = {
  full: (state: RootState) => state.user.schedule,
  value: (state: RootState) => state.user.schedule.value,
};

export const { resetUserSlots, setUserSlots } = slice.actions;

export default slice.reducer;
