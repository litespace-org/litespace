import { ActionReducerMapBuilder } from "@reduxjs/toolkit";
import { clone } from "lodash";
import { Thunk } from "@/redux/thunk";

export type LoadableState<T> = {
  loading: boolean;
  fetching: boolean;
  error: string | null;
  value: T | null;
};

export function initial<T>(value: T | null = null): LoadableState<T> {
  return clone({
    loading: false,
    fetching: false,
    error: null,
    value,
  });
}

export function fetcher<R, A = null>(
  builder: ActionReducerMapBuilder<LoadableState<R>>,
  thunk: Thunk<R, A>
) {
  builder
    .addCase(thunk.loading, (state) => {
      state.loading = true;
    })
    .addCase(thunk.fetching, (state) => {
      state.fetching = true;
    })
    .addCase(thunk.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.error = null;
      state.value = payload;
    })
    .addCase(thunk.rejected, (state, { payload }) => {
      state.loading = false;
      state.fetching = false;
      state.error = payload;
    });
}
