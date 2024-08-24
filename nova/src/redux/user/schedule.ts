import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { atlas } from "@/lib/atlas";
import { IRule } from "@litespace/types";
import { fetcher, initial, LoadableState } from "@/redux/fetcher";

type State = LoadableState<IRule.Self[]>;

const initialState: State = initial();

export const findUserRules = createAsyncThunk(
  "user/schedule/rules",
  async (id: number): Promise<IRule.Self[]> => {
    return await atlas.rule.findUserRules(id);
  }
);

const slice = createSlice({
  name: "user/schedule",
  initialState,
  reducers: {
    resetUserRules: () => initialState,
  },
  extraReducers(builder) {
    fetcher(builder, findUserRules);
  },
});

export const userRulesSelector = {
  full: (state: RootState) => state.user.schedule,
  value: (state: RootState) => state.user.schedule.value,
};

export default slice.reducer;
