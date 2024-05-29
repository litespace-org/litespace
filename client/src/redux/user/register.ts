import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

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
  async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    console.log({ name, email, password });
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
        console.log({ action });
        state.loading = false;
        state.error = action.error.message || "Unexpected error, occured";
      });
  },
});

export default registerSlice.reducer;
