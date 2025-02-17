import { useCallback, useEffect, useState, useRef } from "react";
import { isPermissionDenied, safe } from "@/lib/error";
import { MediaConnection } from "peerjs";
import peer from "@/lib/peer";
import { ISession, Wss } from "@litespace/types";
import hark from "hark";
import { useToast } from "@litespace/ui/Toast";
import { useWebFormatMessage } from "@/hooks/intl";
import { isEmpty } from "lodash";
import { useSocket } from "@litespace/headless/socket";

export function useShareScreen(peerId: string | null) {
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);

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
    }

    if (!error) setError(error ? stream : null);
    setStream(error ? null : stream);
  }, []);

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
  session: ISession.Id | null,
  mate?: number
) {
  const [mateVideo, setMateVideo] = useState<boolean>(false);
  const [mateAudio, setMateAudio] = useState<boolean>(false);
  const streamState = useStreamState(stream);
  const socket = useSocket();

  const notifyCameraToggle = useCallback(
    (camera: boolean) => {
      if (!session || !socket) return;
      socket.emit(Wss.ClientEvent.ToggleCamera, { session, camera });
    },
    [session, socket]
  );

  const notifyMicToggle = useCallback(
    (mic: boolean) => {
      if (!session || !socket) return;
      socket.emit(Wss.ClientEvent.ToggleMic, { session, mic });
    },
    [session, socket]
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
    if (!socket) return;
    socket.on(Wss.ServerEvent.CameraToggled, onCameraToggle);
    socket.on(Wss.ServerEvent.MicToggled, onMicToggle);

    return () => {
      socket.off(Wss.ServerEvent.CameraToggled, onCameraToggle);
      socket.off(Wss.ServerEvent.MicToggled, onMicToggle);
    };
  }, [onCameraToggle, onMicToggle, socket]);

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
  const intl = useWebFormatMessage();
  const ref = useRef<HTMLDivElement>(null);
  const toast = useToast();
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
      toast.error({ title: intl("error.unexpected") });
  }, [intl, toast]);

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
