import {
  ActionReducerMapBuilder,
  AsyncThunk,
  Draft,
  PayloadAction,
  ThunkDispatch,
  UnknownAction,
} from "@reduxjs/toolkit";
import { clone } from "lodash";

type AsyncThunkConfig = {
  state?: unknown;
  dispatch?: ThunkDispatch<unknown, unknown, UnknownAction>;
  extra?: unknown;
  rejectValue?: unknown;
  serializedErrorType?: unknown;
  pendingMeta?: unknown;
  fulfilledMeta?: unknown;
  rejectedMeta?: unknown;
};

export type LoadableState<T> = {
  loading: boolean;
  error: string | null;
  value: T | null;
};

export function initial<T>(value: T | null = null): LoadableState<T> {
  return clone({
    loading: false,
    error: null,
    value,
  });
}

export function fetcher<T, P>(
  builder: ActionReducerMapBuilder<LoadableState<T>>,
  thunk: AsyncThunk<T, P, AsyncThunkConfig>
) {
  builder
    .addCase(thunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(thunk.fulfilled, (state, { payload }: PayloadAction<T>) => {
      state.loading = false;
      state.error = null;
      state.value = payload as Draft<T>;
    })
    .addCase(thunk.rejected, (state, { error }) => {
      state.loading = false;
      state.error = error.message || null;
      state.value = null;
    });
}
