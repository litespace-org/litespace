import { IRoom, Wss } from "@litespace/types";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtlas } from "@/atlas/index";
import { safe } from "@litespace/sol/error";
import { useSocket } from "@/socket";
import { usePeer } from "@/peer";
import { MediaConnection } from "peerjs";

export function useFindCallRoomById(
  callId: number | null
): UseQueryResult<IRoom.FindCallRoomApiResponse | null, Error> {
  const atlas = useAtlas();

  const findCallRoom = useCallback(async () => {
    if (!callId) return null;
    return await atlas.chat.findCallRoom(callId);
  }, [atlas.chat, callId]);

  return useQuery({
    queryFn: findCallRoom,
    queryKey: ["find-call-room"],
  });
}

export function isPermissionDenied(error: Error): boolean {
  return (
    error.name === "NotAllowedError" &&
    error.message === "Permission denied" &&
    "code" in error &&
    error.code === 0
  );
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
    async ({
      video,
      audio,
    }: {
      video: boolean;
      audio: boolean;
    }): Promise<Error | MediaStream> => {
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

  const toggleMic = useCallback(() => {
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
    toggleMic,
    toggleCamera,
    audio,
    mic,
    video,
    camera,
    denied,
  };
}

type PossibleStream = MediaStream | null;

export function useCall(call: number | null, mateUserId: number | null) {
  const socket = useSocket();
  const peer = usePeer();
  const [mateMediaStream, setMateMediaStream] = useState<PossibleStream>(null);
  const [mateScreenStream, setMateScreenStream] =
    useState<PossibleStream>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);

  const {
    start,
    toggleCamera,
    toggleMic,
    stop,
    stream: userMediaStream,
    audio,
    camera,
    denied,
    error,
    loading,
    mic,
    video,
  } = useUserMedia();
  const screen = useShareScreen(mediaConnection?.peer);
  const userSpeaking = useSpeaking(mediaConnection, userMediaStream);
  const mateSpeaking = useSpeaking(mediaConnection, mateMediaStream);
  const { mateAudio, mateVideo, notifyCameraToggle, notifyMicToggle } =
    useCallEvents(mateMediaStream, call, mateUserId);

  const acknowledgePeer = useCallback(
    (peerId: string) => {
      if (!call || !socket) return;
      socket.emit(Wss.ClientEvent.PeerOpened, { peerId, callId: call });
    },
    [call, socket]
  );

  // executed on the receiver side
  const onCall = useCallback(
    (call: MediaConnection) => {
      setMediaConnection(call);

      call.answer(userMediaStream || undefined);

      call.on("stream", (stream: MediaStream) => {
        if (call.metadata?.screen) return setMateScreenStream(stream);
        return setMateMediaStream(stream);
      });

      call.on("close", () => {
        if (call.metadata?.screen) return setMateScreenStream(null);
        return setMateMediaStream(null);
      });
    },
    [userMediaStream]
  );

  const onJoinCall = useCallback(
    ({ peerId }: { peerId: string }) => {
      setTimeout(() => {
        if (!userMediaStream) return;
        // shared my stream with the connected peer
        const call = peer.call(peerId, userMediaStream);
        setMediaConnection(call);
        call.on("stream", setMateMediaStream);
        call.on("close", () => setMateMediaStream(null));
      }, 3000);
    },
    [peer, userMediaStream]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.UserJoinedCall, onJoinCall);
    return () => {
      socket.off(Wss.ServerEvent.UserJoinedCall, onJoinCall);
    };
  }, [onJoinCall, socket]);

  useEffect(() => {
    if (peer.id) acknowledgePeer(peer.id);
    else peer.on("open", acknowledgePeer);
    return () => {
      peer.off("open", acknowledgePeer);
    };
  }, [acknowledgePeer, peer]);

  useEffect(() => {
    // listen for calls
    peer.on("call", onCall);
    return () => {
      peer.off("call", onCall);
    };
  }, [onCall, peer]);

  const onToggleCamera = useCallback(() => {
    toggleCamera();
    notifyCameraToggle(!video);
  }, [notifyCameraToggle, toggleCamera, video]);

  const onToggleMic = useCallback(() => {
    toggleMic();
    notifyMicToggle(!audio);
  }, [notifyMicToggle, toggleMic, audio]);

  return useMemo(
    () => ({
      mate: {
        streams: {
          self: mateMediaStream,
          screen: mateScreenStream,
        },
        speaking: mateSpeaking,
        audio: mateAudio,
        video: mateVideo,
      },
      user: {
        streams: {
          self: userMediaStream,
          screen: screen.stream,
        },
        audio,
        camera,
        denied,
        error,
        loading,
        mic,
        video,
        screen,
        speaking: userSpeaking,
      },
      mediaConnection,
      start,
      stop,
      onToggleCamera,
      onToggleMic,
      peer,
    }),
    [
      audio,
      camera,
      denied,
      error,
      loading,
      mateMediaStream,
      mateScreenStream,
      mic,
      screen,
      start,
      stop,
      toggleCamera,
      toggleMic,
      userMediaStream,
      video,
    ]
  );
}

export function useShareScreen(matePeerId?: string) {
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mediaConnection, setMediaConnection] =
    useState<MediaConnection | null>(null);
  const peer = usePeer();

  const terminateConnection = useCallback(() => {
    if (!mediaConnection) return;
    mediaConnection.close();
    setMediaConnection(null);
  }, [mediaConnection]);

  const share = useCallback(async () => {
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
    if (!matePeerId || !stream) return;
    const call = peer.call(matePeerId, stream, {
      metadata: { screen: true },
    });
    setMediaConnection(call);
  }, [matePeerId, peer, stream]);

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
    share,
    stop,
  };
}

export function useSpeaking(
  mediaConnection: MediaConnection | null,
  stream: MediaStream | null,
  threshold: number = 0.1
) {
  const [speaking, setSpeadking] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!mediaConnection || !mediaConnection.peerConnection || !stream)
        return setSpeadking(false);

      const audio = stream.getAudioTracks()[0];
      if (!audio) return setSpeadking(false);

      const stats = await mediaConnection.peerConnection.getStats(audio);
      const values: Iterable<{
        type: "media-source";
        kind: "audio";
        audioLevel: number;
      }> = stats.values();

      for (const result of values) {
        if (result.type === "media-source" && result.kind === "audio") {
          const level = result.audioLevel;
          if (level > threshold) return setSpeadking(true);
          else return setSpeadking(false);
        }
      }

      return setSpeadking(false);
    }, 1_000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return speaking;
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
  mateStream: MediaStream | null,
  call: number | null,
  mateUserId: number | null
) {
  const [mateVideo, setMateVideo] = useState<boolean>(false);
  const [mateAudio, setMateAudio] = useState<boolean>(false);
  const streamState = useStreamState(mateStream);
  const socket = useSocket();

  const notifyCameraToggle = useCallback(
    (camera: boolean) => {
      if (!call || !socket) return;
      socket.emit(Wss.ClientEvent.ToggleCamera, { call, camera });
    },
    [call, socket]
  );

  const notifyMicToggle = useCallback(
    (mic: boolean) => {
      if (!call || !socket) return;
      socket.emit(Wss.ClientEvent.ToggleMic, { call, mic });
    },
    [call, socket]
  );

  const onCameraToggle = useCallback(
    ({ camera, user }: { camera: boolean; user: number }) => {
      if (user === mateUserId) setMateVideo(camera);
    },
    [mateUserId]
  );

  const onMicToggle = useCallback(
    ({ mic, user }: { mic: boolean; user: number }) => {
      if (user === mateUserId) setMateAudio(mic);
    },
    [mateUserId]
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
