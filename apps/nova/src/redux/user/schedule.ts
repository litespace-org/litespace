import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { atlas } from "@litespace/luna";
import { IRule } from "@litespace/types";
import { fetcher, initial, LoadableState } from "@/redux/fetcher";
import { createThunk } from "@/redux/thunk";

type State = LoadableState<IRule.Self[]>;

const initialState: State = initial();

export const findUserRules = createThunk(
  "user/schedule/rules",
  async (id: number): Promise<IRule.Self[]> => {
    return await atlas.rule.findUserRules(id);
  },
  (state) => state.user.schedule
);

const slice = createSlice({
  name: "user/schedule",
  initialState,
  reducers: {
    resetUserRules: () => initialState,
    setUserRules: (state, { payload }: PayloadAction<IRule.Self[]>) => {
      state.value = payload;
    },
  },
  extraReducers(builder) {
    fetcher(builder, findUserRules);
  },
});

export const userRulesSelector = {
  full: (state: RootState) => state.user.schedule,
  value: (state: RootState) => state.user.schedule.value,
};

export const { resetUserRules, setUserRules } = slice.actions;

export default slice.reducer;
