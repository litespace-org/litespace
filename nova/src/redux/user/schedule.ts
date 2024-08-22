// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { RootState } from "@/redux/store";
// import { atlas } from "@/lib/atlas";
// import { IRule, IUser } from "@litespace/types";
// import { fetcher, initial, LoadableState } from "@/redux/fetcher";

// type State = LoadableState<IRule.FindUnpackedUserRulesResponse>;

// const initialState: State = initial();

// export const findUserRules = createAsyncThunk(
//   "user/schedule/rules",
//   async (): Promise<IRule.FindUnpackedUserRulesResponse> => {
//     return await atlas.rule.findUnpackedUserRules();
//   }
// );
