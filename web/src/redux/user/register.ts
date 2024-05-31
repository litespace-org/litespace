import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { user } from "@/api";

type State = {
  loading: boolean;
  error: string | null;
};

const initialState: State = {
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  "user/register",
  async (payload: { name: string; email: string; password: string }) => {
    await user.register(payload);
  }
);

export const registerSlice = createSlice({
  name: "user/register",
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers(builder) {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Unexpected error, occured";
      });
  },
});

export default registerSlice.reducer;
