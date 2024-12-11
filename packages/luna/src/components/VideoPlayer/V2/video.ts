import { clone, merge } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

export enum Status {
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
  fullscreen: boolean;
  readyState: number;
  buffered: number;
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
  fullscreen: false,
  buffered: 0,
};

enum ActionType {
  TogglePlay,
  ToggleMuted,
  SetCurrentTime,
  SetVolume,
  Snapshot,
  SetPlaybackRate,
  SetFullScreen,
  SetBuffered,
}

type Action =
  | { type: ActionType.TogglePlay }
  | { type: ActionType.ToggleMuted; muted: boolean }
  | { type: ActionType.SetCurrentTime; time: number }
  | { type: ActionType.SetVolume; volume: number }
  | { type: ActionType.SetPlaybackRate; rate: number }
  | { type: ActionType.Snapshot; snapshot: State }
  | { type: ActionType.SetFullScreen; fullscreen: boolean }
  | { type: ActionType.SetBuffered; buffered: number };

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

  if (action.type === ActionType.SetFullScreen)
    return mutate({ fullscreen: action.fullscreen });
  if (action.type === ActionType.SetBuffered)
    return mutate({ buffered: action.buffered });

  if (action.type === ActionType.Snapshot) return action.snapshot;
  return clone(state);
}

export const CONTAINER_ID = "litespace-video-player";

export function useVideo() {
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [isProgressbarDragged, setIsProgressbarDragged] =
    useState<boolean>(false);
  const [state, dispatch] = useReducer(reducer, initial);

  const progressRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const playing = useMemo(() => {
    return state.currentTime > 0 && !state.paused && state.readyState > 2;
  }, [state.currentTime, state.paused, state.readyState]);

  const asSnapshot = useCallback(
    (video: HTMLVideoElement) => {
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
        fullscreen: document.fullscreenElement?.id === CONTAINER_ID,
        buffered: state.buffered,
      };
      return snapshot;
    },
    [state]
  );

  const onProgress = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.duration > 0 && video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(
        videoRef.current.buffered.length - 1
      );
      const percentageBuffered = (bufferedEnd / video.duration) * 100;
      dispatch({ type: ActionType.SetBuffered, buffered: percentageBuffered });
    }
  }, []);

  const onTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const snapshot = asSnapshot(event.currentTarget);
      dispatch({ type: ActionType.Snapshot, snapshot });
    },
    [asSnapshot]
  );

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (state.paused) videoRef.current.play();
    else videoRef.current.pause();
    dispatch({ type: ActionType.TogglePlay });
  }, [state.paused]);

  const toggleSound = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    dispatch({ type: ActionType.ToggleMuted, muted: videoRef.current.muted });
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = Math.abs(volume);
    videoRef.current.muted = volume <= 0.01;
    dispatch({ type: ActionType.SetVolume, volume: videoRef.current.volume });
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    videoRef.current.preservesPitch = true;
    dispatch({ type: ActionType.SetPlaybackRate, rate });
  }, []);

  const setCurrentTime = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
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

  const toggleSize = useCallback(async () => {
    if (!containerRef.current) return;
    const fullscreen =
      document.fullscreenElement?.id === containerRef.current.id;

    if (fullscreen) await document.exitFullscreen();
    else await containerRef.current.requestFullscreen();

    dispatch({ type: ActionType.SetFullScreen, fullscreen: !state.fullscreen });
  }, [state.fullscreen]);

  const onError = useCallback(() => {
    setStatus(Status.Error);
  }, []);

  const onFullScreen = useCallback(() => {
    const fullscreen = document.fullscreenElement?.id === CONTAINER_ID;
    dispatch({ type: ActionType.SetFullScreen, fullscreen });
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", onFullScreen);
    return () => {
      document.removeEventListener("fullscreenchange", onFullScreen);
    };
  }, [onFullScreen]);

  const handleSeeking = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!progressRef.current) return;
      const { left, width } = progressRef.current.getBoundingClientRect();
      const x = e.clientX;
      const seekTo = ((x - left) / width) * state.duration;
      setCurrentTime(seekTo);
    },
    [setCurrentTime, state.duration]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsProgressbarDragged(true);
      handleSeeking(e);
    },
    [handleSeeking]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isProgressbarDragged) handleSeeking(e);
    },
    [handleSeeking, isProgressbarDragged]
  );

  const handleMouseUp = useCallback(() => {
    if (isProgressbarDragged) {
      setIsProgressbarDragged(false);
    }
  }, [isProgressbarDragged]);

  return {
    videoRef,
    containerRef,
    progressRef,
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
    onProgress,
    status,
    seekingHandlers: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
    },
    ...state,
  };
}
