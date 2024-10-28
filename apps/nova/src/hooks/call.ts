import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  RefObject,
} from "react";
import { isPermissionDenied, safe } from "@/lib/error";
import { MediaConnection } from "peerjs";
import peer from "@/lib/peer";
import dayjs from "@/lib/dayjs";
import { ICall, Wss } from "@litespace/types";
import hark from "hark";
import { toaster, useFormatMessage, useSockets } from "@litespace/luna";
import { first, isEmpty } from "lodash";

export function useCallRecorder(screen: boolean = false) {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const sockets = useSockets();

  const onDataAvailable = useCallback(
    (call: number, timestamp: number) => async (event: BlobEvent) => {
      if (event.data.size === 0) return;
      console.debug(`Processing chunk (${event.data.size})`);
      sockets?.recorder.emit("chunk", {
        chunk: event.data,
        timestamp,
        screen,
        call,
      });
    },
    [screen, sockets?.recorder]
  );

  const start = useCallback(
    (stream: MediaStream, call: number) => {
      const recorder = new MediaRecorder(stream, {
        // mimeType: `video/mp4; codecs="avc1.424028, mp4a.40.2"`,
        // mimeType: `video/mp4; codecs="avc1.4d002a"`,
        // mimeType: `video/webm;codecs=h264,opus`,
        mimeType: `video/webm`,
      });
      recorder.ondataavailable = onDataAvailable(call, dayjs.utc().valueOf());

      recorder.start(2_000);
      setRecorder(recorder);
    },
    [onDataAvailable]
  );

  return useMemo(
    () => ({
      start,
      media: recorder,
    }),
    [recorder, start]
  );
}

export function useShareScreen(callId: number | null, peerId: string | null) {
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);
  const { start: startRecording } = useCallRecorder(true);

  const terminateConnection = useCallback(() => {
    if (!mediaConnection) return;
    mediaConnection.close();
    setMediaConnection(null);
  }, [mediaConnection]);

  const start = useCallback(async () => {
    setLoading(true);
    const stream = await safe(
      async () =>
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
    );
    setLoading(false);
    const error = stream instanceof Error;
    const denied = error ? isPermissionDenied(stream) : false;

    // user canceled the process.
    if (denied) {
      setError(null);
      return setStream(null);
    }

    if (!error) {
      stream.getVideoTracks().map((track) => {
        track.addEventListener("ended", () => {
          setStream(null);
        });
      });

      if (callId) startRecording(stream, callId);
    }

    if (!error) setError(error ? stream : null);
    setStream(error ? null : stream);
  }, [callId, startRecording]);

  const stop = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    terminateConnection();
  }, [stream, terminateConnection]);

  // share the stream with my peer
  useEffect(() => {
    if (!peerId || !stream) return;
    const call = peer.call(peerId, stream, {
      metadata: { screen: true },
    });
    setMediaConnection(call);
  }, [peerId, stream]);

  useEffect(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.addEventListener("ended", terminateConnection);
    });
  }, [stream, terminateConnection]);

  return {
    loading,
    stream,
    error,
    start,
    stop,
  };
}

export function useUserMedia() {
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mic, setMic] = useState<boolean>(false);
  const [camera, setCamera] = useState<boolean>(false);
  const [audio, setAudio] = useState<boolean>(false);
  const [video, setVideo] = useState<boolean>(false);
  const [denied, setUserDenied] = useState<boolean>(false);

  const getUserMedia = useCallback(
    async ({ video, audio }: { video: boolean; audio: boolean }) => {
      return await safe(
        async () => await navigator.mediaDevices.getUserMedia({ video, audio })
      );
    },
    []
  );

  const getUserStream = useCallback(async () => {
    // request both audio and video stream
    const combinedStream = await getUserMedia({ video: true, audio: true });
    if (combinedStream instanceof MediaStream) return combinedStream;
    // try to get audio stream only to check if the user has mic and no camera.
    const audioStreamOnly = await getUserMedia({ video: false, audio: true });
    if (audioStreamOnly instanceof MediaStream) return audioStreamOnly;
    // try to get video stream only incase the user only has camera and no mic.
    const videoStreamOnly = await getUserMedia({ video: true, audio: false });
    if (videoStreamOnly instanceof MediaStream) return videoStreamOnly;
    return videoStreamOnly;
  }, [getUserMedia]);

  const start = useCallback(async () => {
    setLoading(true);
    const stream = await getUserStream();
    setLoading(false);
    const error = stream instanceof Error;
    const denied = error ? isPermissionDenied(stream) : false;

    // user canceled the process.
    if (denied) {
      setError(null);
      setUserDenied(true);
      return setStream(null);
    }

    if (!error) {
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      if (videoTracks.length !== 0) {
        setCamera(true);
        setVideo(true);
      }

      if (audioTracks.length !== 0) {
        setMic(true);
        setAudio(true);
      }

      videoTracks.forEach((track) => {
        track.addEventListener("ended", () => {
          setStream(null);
          setCamera(false);
        });
      });

      audioTracks.forEach((track) => {
        track.addEventListener("ended", () => {
          setStream(null);
          setMic(false);
        });
      });
    }

    if (!error) setError(error ? stream : null);
    setStream(error ? null : stream);
  }, [getUserStream]);

  const stop = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  const toggleSound = useCallback(() => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setAudio(track.enabled);
    });
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setVideo(track.enabled);
    });
  }, [stream]);

  return {
    loading,
    stream,
    error,
    start,
    stop,
    toggleSound,
    audio,
    mic,
    toggleCamera,
    video,
    camera,
    denied,
  };
}

export function useCallRecordingStatus(status: ICall.RecordingStatus) {
  return useMemo(
    () => ({
      empty: status === ICall.RecordingStatus.Empty,
      recording: status === ICall.RecordingStatus.Recording,
      recorded: status === ICall.RecordingStatus.Recorded,
      processing: status === ICall.RecordingStatus.Processing,
      processed: status === ICall.RecordingStatus.Processed,
      queued: status === ICall.RecordingStatus.Queued,
      processingFailed: status === ICall.RecordingStatus.ProcessingFailed,
      idle: status === ICall.RecordingStatus.Idle,
    }),
    [status]
  );
}

export function useSpeech(stream: MediaStream | null) {
  const [speaking, setSpeaking] = useState<boolean>(false);

  const onSpeaking = useCallback(() => setSpeaking(true), []);
  const onStopSpeaking = useCallback(() => setSpeaking(false), []);

  useEffect(() => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (isEmpty(audioTracks)) return setSpeaking(false);
    const speech = hark(stream);
    speech.on("speaking", onSpeaking);
    speech.on("stopped_speaking", onStopSpeaking);
  }, [onSpeaking, onStopSpeaking, stream]);

  return { speaking };
}

function useStreamState(stream: MediaStream | null) {
  const [video, setVideo] = useState<boolean>(false);
  const [audio, setAduio] = useState<boolean>(false);

  useEffect(() => {
    if (!stream) return;
    setVideo(stream.getVideoTracks().some((track) => track.enabled));
    setAduio(stream.getAudioTracks().some((track) => track.enabled));
  }, [stream]);

  return { video, audio };
}

export function useCallEvents(
  stream: MediaStream | null,
  call: number | null,
  mate?: number
) {
  const [mateVideo, setMateVideo] = useState<boolean>(false);
  const [mateAudio, setMateAudio] = useState<boolean>(false);
  const streamState = useStreamState(stream);
  const sockets = useSockets();

  const notifyCameraToggle = useCallback(
    (camera: boolean) => {
      if (!call || !sockets) return;
      sockets.api.emit(Wss.ClientEvent.ToggleCamera, { call, camera });
    },
    [call, sockets]
  );

  const notifyMicToggle = useCallback(
    (mic: boolean) => {
      if (!call || !sockets) return;
      sockets.api.emit(Wss.ClientEvent.ToggleMic, { call, mic });
    },
    [call, sockets]
  );

  const onCameraToggle = useCallback(
    ({ camera, user }: { camera: boolean; user: number }) => {
      if (user === mate) setMateVideo(camera);
    },
    [mate]
  );

  const onMicToggle = useCallback(
    ({ mic, user }: { mic: boolean; user: number }) => {
      if (user === mate) setMateAudio(mic);
    },
    [mate]
  );

  useEffect(() => {
    if (!sockets) return;
    sockets.api.on(Wss.ServerEvent.CameraToggled, onCameraToggle);
    sockets.api.on(Wss.ServerEvent.MicToggled, onMicToggle);

    return () => {
      sockets.api.off(Wss.ServerEvent.CameraToggled, onCameraToggle);
      sockets.api.off(Wss.ServerEvent.MicToggled, onMicToggle);
    };
  }, [onCameraToggle, onMicToggle, sockets]);

  useEffect(() => {
    setMateVideo(streamState.video);
    setMateAudio(streamState.audio);
  }, [streamState.audio, streamState.video]);

  return {
    notifyCameraToggle,
    notifyMicToggle,
    mateAudio,
    mateVideo,
  };
}

export function useFullScreen() {
  const intl = useFormatMessage();
  const ref = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  const onFullScreen = useCallback(() => {
    const fullScreen = document.fullscreenElement?.id === ref.current?.id;
    setIsFullScreen(fullScreen);
  }, []);

  const startFullScreen = useCallback(async () => {
    const result = await safe(async () => {
      if (!ref.current) return;
      await ref.current.requestFullscreen();
    });
    if (result instanceof Error)
      toaster.error({ title: intl("error.unexpected") });
  }, [intl]);

  const exitFullscreen = useCallback(async () => {
    if (ref.current) await document.exitFullscreen();
  }, []);

  const toggleFullScreen = useCallback(async () => {
    if (!document.fullscreenElement) return startFullScreen();
    return exitFullscreen();
  }, [exitFullscreen, startFullScreen]);

  const toggleFullScreenByKeyboard = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.code === "F11") return toggleFullScreen();
      if (e.code === "Escape") return exitFullscreen();
    },
    [exitFullscreen, toggleFullScreen]
  );

  useEffect(() => {
    document.addEventListener("keydown", toggleFullScreenByKeyboard);
    document.addEventListener("fullscreenchange", onFullScreen);
    return () => {
      document.removeEventListener("keydown", toggleFullScreenByKeyboard);
      document.removeEventListener("fullscreenchange", onFullScreen);
    };
  }, [onFullScreen, toggleFullScreenByKeyboard]);

  return { isFullScreen, toggleFullScreen, ref };
}

type UserMediaInfo = {
  streams: {
    self: MediaStream | null;
    screen: MediaStream | null;
  };
  name?: string;
  image?: string;
  speaking?: boolean;
  video?: boolean;
  audio?: boolean;
};

export type UseRecorderParams = {
  user: UserMediaInfo;
  mate: UserMediaInfo;
};

export enum View {
  /**
   * One user
   */
  FullScreen,
  /**
   * Two users. Side by side
   */
  SplitScreen,
  /**
   * One user and one screen.
   */
  SoloPersenter,
  /**
   * Two users and one screen
   */
  AccompaniedPersenter,
  /**
   * Two users and two screens
   */
  MultiPersenter,
}

type VideoRef = RefObject<HTMLVideoElement>;

type CurrentView =
  | {
      type: View.FullScreen;
      info: UserMediaInfo;
      ref: VideoRef;
      stream: MediaStream;
    }
  | {
      type: View.SplitScreen;
    }
  | {
      type: View.SoloPersenter;
      info: UserMediaInfo;
      refs: { self: VideoRef; screen: VideoRef };
    }
  | {
      type: View.AccompaniedPersenter;
      persenter: UserMediaInfo;
      other: UserMediaInfo;
    }
  | {
      type: View.MultiPersenter;
    };

// Full HD
// const VIDEO_WIDTH = 1920;
// const VIDEO_HEIGHT = 1080;
// HD
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;

function computePosition({
  original,
  max,
}: {
  original: { width: number; height: number };
  max: { width: number; height: number };
}) {
  if (original.height > original.width) {
    const width = (max.height * original.width) / original.height;
    const padding = max.width - width;
    return {
      padding: { x: padding, y: 0 },
      width,
      height: max.height,
    };
  }

  const width = (original.width * max.height) / original.height;
  const padding = max.width - width;

  return {
    padding: { x: padding, y: 0 },
    width: width,
    height: max.height,
  };
}

function drawRoundedRect({
  ctx,
  x,
  y,
  width,
  height,
  radius,
}: {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();
}

/**
 * Canvas based recorder
 */
export function useRecorder({ user, mate }: UseRecorderParams) {
  const userMediaRef = useRef<HTMLVideoElement>(null);
  const userScreenRef = useRef<HTMLVideoElement>(null);
  const mateMediaRef = useRef<HTMLVideoElement>(null);
  const mateScreenRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const view: CurrentView | null = useMemo(() => {
    if (
      user.streams.self &&
      !user.streams.screen &&
      !mate.streams.self &&
      !mate.streams.screen
    )
      return {
        type: View.FullScreen,
        info: user,
        ref: userMediaRef,
        stream: user.streams.self,
      };

    if (
      user.streams.self &&
      mate.streams.self &&
      !user.streams.screen &&
      !mate.streams.screen
    )
      return { type: View.SplitScreen, left: mateMediaRef };

    if (
      user.streams.self &&
      user.streams.screen &&
      !mate.streams.self &&
      !mate.streams.screen
    )
      return {
        type: View.SoloPersenter,
        info: user,
        refs: { self: userMediaRef, screen: userScreenRef },
      };

    if (
      user.streams.self &&
      user.streams.screen &&
      mate.streams.self &&
      !mate.streams.screen
    )
      return { type: View.AccompaniedPersenter, persenter: user, other: mate };

    if (
      mate.streams.self &&
      mate.streams.screen &&
      user.streams.self &&
      !user.streams.screen
    )
      return { type: View.AccompaniedPersenter, persenter: mate, other: user };

    if (
      mate.streams.self &&
      mate.streams.screen &&
      user.streams.self &&
      user.streams.screen
    )
      return { type: View.MultiPersenter };

    return null;
  }, [mate, user]);

  const asFullScreenView = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { ref, stream }: Extract<CurrentView, { type: View.FullScreen }>
    ) => {
      const videoTrack = first(stream.getVideoTracks());
      if (!videoTrack || !ref.current) return;

      const settings = videoTrack.getSettings();
      const pos = computePosition({
        original: {
          width: settings.width || VIDEO_WIDTH,
          height: settings.height || VIDEO_HEIGHT,
        },
        max: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
      });

      ctx.drawImage(
        ref.current,
        pos.padding.x / 2,
        pos.padding.y / 2,
        pos.width,
        pos.height
      );
    },
    []
  );

  const asSoloPersenterView = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { refs, info }: Extract<CurrentView, { type: View.SoloPersenter }>
    ) => {
      if (
        !refs.self.current ||
        !refs.screen.current ||
        !info.streams.self ||
        !info.streams.screen
      )
        return;

      const userVideoTrack = first(info.streams.self.getVideoTracks());
      const screenVideoTrack = first(info.streams.screen.getVideoTracks());
      if (!userVideoTrack || !screenVideoTrack) return;

      const screenVideoSettings = userVideoTrack.getSettings();
      const screenPosition = computePosition({
        original: {
          width: screenVideoSettings.width || VIDEO_WIDTH,
          height: screenVideoSettings.height || VIDEO_HEIGHT,
        },
        max: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT },
      });

      ctx.drawImage(
        refs.screen.current,
        screenPosition.padding.x / 2,
        screenPosition.padding.y / 2,
        screenPosition.width,
        screenPosition.height
      );

      const userVideoSettings = userVideoTrack.getSettings();
      const userVideoWidth = VIDEO_WIDTH / 4;
      const userVideoHeight = VIDEO_HEIGHT / 4;
      const userPosition = computePosition({
        original: {
          width: userVideoSettings.width || VIDEO_WIDTH,
          height: userVideoSettings.height || VIDEO_HEIGHT,
        },
        max: { width: userVideoWidth, height: userVideoHeight },
      });

      const ux = VIDEO_WIDTH - userPosition.width - 5;
      const uy = VIDEO_HEIGHT - userPosition.height - 5;
      const uw = userPosition.width;
      const uh = userPosition.height;
      const radius = 8;

      drawRoundedRect({ ctx, x: ux, y: uy, width: uw, height: uh, radius });
      ctx.drawImage(refs.self.current, ux, uy, uw, uh);
    },
    []
  );

  const compose = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = "#171717";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      if (view?.type === View.FullScreen) return asFullScreenView(ctx, view);
      if (view?.type === View.SoloPersenter)
        return asSoloPersenterView(ctx, view);
    },
    [asFullScreenView, asSoloPersenterView, view]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    canvasRef.current.width = VIDEO_WIDTH;
    canvasRef.current.height = VIDEO_HEIGHT;

    let animationFrameId: number = 0;
    // entry point
    render();
    function render() {
      if (ctx) compose(ctx);
      animationFrameId = window.requestAnimationFrame(render);
    }

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [compose]);

  return useMemo(
    () => ({
      refs: {
        user: {
          self: userMediaRef,
          screen: userScreenRef,
        },
        mate: {
          self: mateMediaRef,
          screen: mateScreenRef,
        },
        canvas: canvasRef,
      },
    }),
    []
  );
}
