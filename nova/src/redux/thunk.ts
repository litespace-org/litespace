import { createAction, Dispatch, PayloadActionCreator } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { LoadableState } from "@/redux/fetcher";

export type Thunk<R, A = null> = {
  loading: PayloadActionCreator<void, string>;
  fetching: PayloadActionCreator<void, string>;
  rejected: PayloadActionCreator<unknown, string>;
  fulfilled: PayloadActionCreator<R, string>;
  call: (
    arg: A
  ) => (dispatch: Dispatch, getState: () => RootState) => Promise<void>;
};

export function createThunk<A = null, R = void, S = void>(
  prefix: string,
  callback: (arg: A) => Promise<R>,
  selector: (state: RootState) => LoadableState<S>
): Thunk<R, A> {
  const loading = createAction(prefix + "/loading");
  const fetching = createAction(prefix + "/fetching");
  const rejected = createAction<unknown>(prefix + "/rejected");
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
        dispatch(rejected(error));
      }
    };
  }

  return { call: actionCreator, loading, fetching, rejected, fulfilled };
}
