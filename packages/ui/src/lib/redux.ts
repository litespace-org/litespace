import {
  createAction,
  Dispatch,
  PayloadActionCreator,
  ActionReducerMapBuilder,
} from "@reduxjs/toolkit";

export type Thunk<RootState, R, A = null> = {
  loading: PayloadActionCreator<void, string>;
  fetching: PayloadActionCreator<void, string>;
  rejected: PayloadActionCreator<string, string>;
  fulfilled: PayloadActionCreator<R, string>;
  call: (
    arg: A
  ) => (dispatch: Dispatch, getState: () => RootState) => Promise<void>;
};

export function createThunk<RootState, A = null, R = void, S = void>(
  prefix: string,
  callback: (arg: A) => Promise<R>,
  selector: (state: RootState) => LoadableState<S>
): Thunk<RootState, R, A> {
  const loading = createAction(prefix + "/loading");
  const fetching = createAction(prefix + "/fetching");
  const rejected = createAction<string>(prefix + "/rejected");
  const fulfilled = createAction<R>(prefix + "/fulfilled");

  function actionCreator(arg: A) {
    return async (dispatch: Dispatch, getState: () => RootState) => {
      const state = selector(getState());
      if (!state.value) dispatch(loading());
      dispatch(fetching());

      try {
        const result = await callback(arg);
        dispatch(fulfilled(result));
      } catch (error) {
        dispatch(
          rejected(
            error instanceof Error ? error.message : "Unexpected error occured"
          )
        );
      }
    };
  }

  return { call: actionCreator, loading, fetching, rejected, fulfilled };
}

export type LoadableState<T> = {
  loading: boolean;
  fetching: boolean;
  error: string | null;
  value: T | null;
};

export function initial<T>(value: T | null = null): LoadableState<T> {
  return {
    loading: false,
    fetching: false,
    error: null,
    value,
  };
}

export function fetcher<RootState, R, A = null>(
  builder: ActionReducerMapBuilder<LoadableState<R>>,
  thunk: Thunk<RootState, R, A>
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
      state.fetching = false;
      state.error = null;
      state.value = payload;
    })
    .addCase(thunk.rejected, (state, { payload }) => {
      state.loading = false;
      state.loading = false;
      state.fetching = false;
      state.error = payload;
    });
}
