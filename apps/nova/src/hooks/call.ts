import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { isPermissionDenied, safe } from "@/lib/error";
import { MediaConnection } from "peerjs";
import peer from "@/lib/peer";
import dayjs from "@/lib/dayjs";
import { ICall, Wss } from "@litespace/types";
import hark from "hark";
import { toaster, useFormatMessage, useSockets } from "@litespace/luna";
import { isEmpty } from "lodash";

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
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (ref.current) await document.exitFullscreen();
  }, []);

  const toggleFullScreen = useCallback(async () => {
    if (!document.fullscreenElement) return startFullScreen();
    return exitFullscreen();
  }, []);

  const toggleFullScreenByKeyboard = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    if (e.code === "F11") return toggleFullScreen();
    if (e.code === "Escape") return exitFullscreen();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", toggleFullScreenByKeyboard);
    document.addEventListener("fullscreenchange", onFullScreen);
    return () => {
      document.removeEventListener("keydown", toggleFullScreenByKeyboard);
      document.removeEventListener("fullscreenchange", onFullScreen);
    };
  }, []);
  return { isFullScreen, toggleFullScreen, ref };
}
