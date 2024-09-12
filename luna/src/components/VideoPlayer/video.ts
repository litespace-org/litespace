import { clone, merge } from "lodash";
import React, {
  useCallback,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

enum Status {
  Loading = "loading",
  Loaded = "loaded",
  Error = "error",
}

type State = {
  currentTime: number;
  paused: boolean;
  ended: boolean;
  muted: boolean;
  volume: number;
  duration: number;
  playbackRate: number;
  readyState: number;
};

const initial: State = {
  currentTime: 0,
  paused: true,
  ended: false,
  muted: false,
  volume: 0,
  duration: 0,
  playbackRate: 1,
  readyState: 0,
};

enum ActionType {
  TogglePlay,
  ToggleMuted,
  SetCurrentTime,
  SetVolume,
  Snapshot,
  SetPlaybackRate,
}

type Action =
  | { type: ActionType.TogglePlay }
  | { type: ActionType.ToggleMuted; muted: boolean }
  | { type: ActionType.SetCurrentTime; time: number }
  | { type: ActionType.SetVolume; volume: number }
  | { type: ActionType.SetPlaybackRate; rate: number }
  | { type: ActionType.Snapshot; snapshot: State };

function reducer(state: State, action: Action): State {
  const mutate = (incoming: Partial<State>): State =>
    merge(clone(state), incoming);

  if (action.type === ActionType.TogglePlay)
    return mutate({ paused: !state.paused });

  if (action.type === ActionType.ToggleMuted)
    return mutate({ muted: action.muted });

  if (action.type === ActionType.SetCurrentTime)
    return mutate({ currentTime: action.time, readyState: 0 });

  if (action.type === ActionType.SetVolume)
    return mutate({ volume: action.volume, muted: action.volume <= 0.01 });

  if (action.type === ActionType.SetPlaybackRate)
    return mutate({ playbackRate: action.rate });

  if (action.type === ActionType.Snapshot) return action.snapshot;
  return clone(state);
}

export function useVideo() {
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [state, dispatch] = useReducer(reducer, initial);
  const ref = useRef<HTMLVideoElement>(null);

  const playing = useMemo(() => {
    return state.currentTime > 0 && !state.paused && state.readyState > 2;
  }, [state.currentTime, state.paused, state.readyState]);

  const asSnapshot = useCallback((video: HTMLVideoElement) => {
    const duration = video.duration;
    const snapshot: State = {
      currentTime: video.currentTime,
      ended: video.ended,
      paused: video.paused,
      muted: video.muted,
      volume: video.volume,
      duration: Number.isNaN(duration) ? 0 : duration,
      playbackRate: video.playbackRate,
      readyState: video.readyState,
    };
    return snapshot;
  }, []);

  const onTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const snapshot = asSnapshot(event.currentTarget);
      dispatch({ type: ActionType.Snapshot, snapshot });
    },
    [asSnapshot]
  );

  const togglePlay = useCallback(() => {
    if (!ref.current) return;
    if (state.paused) ref.current.play();
    else ref.current.pause();
    dispatch({ type: ActionType.TogglePlay });
  }, [state.paused]);

  const toggleSound = useCallback(() => {
    if (!ref.current) return;
    ref.current.muted = !ref.current.muted;
    dispatch({ type: ActionType.ToggleMuted, muted: ref.current.muted });
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!ref.current) return;
    ref.current.volume = Math.abs(volume);
    ref.current.muted = volume <= 0.01;
    dispatch({ type: ActionType.SetVolume, volume: ref.current.volume });
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!ref.current) return;
    ref.current.playbackRate = rate;
    ref.current.preservesPitch = true;
    dispatch({ type: ActionType.SetPlaybackRate, rate });
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    if (!ref.current) return;
    ref.current.currentTime = time;
    dispatch({ type: ActionType.SetCurrentTime, time });
  }, []);

  const onCanPlay = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      setStatus(Status.Loaded);
      const snapshot = asSnapshot(event.currentTarget);
      dispatch({ type: ActionType.Snapshot, snapshot });
    },
    [asSnapshot]
  );

  const toggleSize = useCallback(() => {
    if (!ref.current) return;
    ref.current.requestFullscreen();
  }, []);

  const onError = useCallback(() => {
    setStatus(Status.Error);
  }, []);

  return {
    ref,
    playing,
    togglePlay,
    onTimeUpdate,
    toggleSound,
    setVolume,
    onCanPlay,
    onError,
    setPlaybackRate,
    setCurrentTime,
    toggleSize,
    status,
    ...state,
  };
}
