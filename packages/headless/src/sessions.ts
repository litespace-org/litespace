import { ISession, Void, Wss } from "@litespace/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { safe } from "@litespace/sol/error";
import { useSocket } from "@/socket";
import { usePeer } from "@/peer";
import { MediaConnection } from "peerjs";
import { orUndefined } from "@litespace/sol/utils";
import zod from "zod";
import hark from "hark";
import { uniq } from "lodash";

declare module "peerjs" {
  export interface CallOption {
    constraints?: {
      offerToReceiveAudio: boolean;
      offerToReceiveVideo: boolean;
    };
  }
}

export function isPermissionDenied(error: Error): boolean {
  return (
    error.name === "NotAllowedError" &&
    error.message === "Permission denied" &&
    "code" in error &&
    error.code === 0
  );
}

type UseUserMediaReturn = {
  /**
   * `true` if the request to access user media is still in progress.
   */
  loading: boolean;
  /**
   * User media stream. It will be null incase of loading or error.
   *
   * @default null
   */
  stream: MediaStream | null;
  /**
   * Error while requesting the permission to use user media devices.
   *
   * @default null
   */
  error: Error | null;
  /**
   * Request user media stream with the provided constrains.
   */
  start: (
    /**
     * Flag to enable or disable video in the user media stream.
     */
    video?: boolean
  ) => Promise<void>;
  /**
   * Stop all tracks in the media stream.
   */
  stop: Void;
  /**
   * Toggle user mic.
   */
  toggleMic: Void;
  /**
   * Toggle user camera.
   */
  toggleCamera: Void;
  /**
   * `true` if the user microphone enabled. It can be controlled using `toggleMic`
   */
  audio: boolean;
  /**
   * `true` if the user camera is enabled. It can be controlled using `toggleCamera`
   */
  video: boolean;
  /**
   * `true` if the `MediaStream` as an audio source (aka, user has a microphone).
   */
  mic: boolean;
  /**
   * `true` if the `MediaStream` as a video source (aka, user has a camera).
   */
  camera: boolean;
  /**
   * `true` if the user rejected the permission to use his media devices.
   */
  denied: boolean;
};

export function useUserMedia(): UseUserMediaReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mic, setMic] = useState<boolean>(false);
  const [camera, setCamera] = useState<boolean>(false);
  const [audio, setAudio] = useState<boolean>(false);
  const [video, setVideo] = useState<boolean>(false);
  const [denied, setUserDenied] = useState<boolean>(false);

  const getUserMedia = useCallback(
    async (video?: boolean): Promise<Error | MediaStream> => {
      return await safe(
        async () =>
          await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: video
              ? {
                  /**
                   * We must sure that the aspect ratio for the video stream is
                   * 16:9 for two reasons.
                   * 1. The ratio 16:9 is the standard when working with videos.
                   * 2. The UI is built around this aspect ratio.
                   */
                  width: 1280,
                  height: 720,
                }
              : undefined,
          })
      );
    },
    []
  );

  const start = useCallback(
    async (video?: boolean) => {
      setLoading(true);
      const stream = await getUserMedia(video);
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
    },
    [getUserMedia]
  );

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
export type RemoteStream = {
  screen: boolean;
  owner: number;
  stream: MediaStream;
  peer: string;
};

export function useSession({
  session,
  userId,
  mateUserId,
  isGhost,
}: {
  session?: ISession.Id;
  userId?: number;
  mateUserId?: number;
  isGhost?: boolean;
}) {
  const socket = useSocket();
  const peer = usePeer();
  const [mateMediaStream, setMateMediaStream] = useState<PossibleStream>(null);
  const [mateScreenStream, setMateScreenStream] =
    useState<PossibleStream>(null);

  const [mediaConnections, setMediaConnections] = useState<MediaConnection[]>(
    []
  );
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);

  console.log({
    remoteStreams,
    setMateMediaStream,
    setMateScreenStream,
    mediaConnections,
  });

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

  const screen = useShareScreen(
    useMemo(
      () => ({
        userId,
        peerIds: mediaConnections.map((connection) => connection.peer),
      }),
      [mediaConnections, userId]
    )
  );

  const userSpeaking = useSpeaking(mediaConnection, userMediaStream);
  const mateSpeaking = useSpeaking(mediaConnection, mateMediaStream);
  const { mateAudio, mateVideo, notifyCameraToggle, notifyMicToggle } =
    useCallEvents(orUndefined(mateMediaStream), session, mateUserId);

  const acknowledgePeer = useCallback(
    (peerId: string) => {
      if (!session || !socket) return;
      socket.emit(Wss.ClientEvent.PeerOpened, { peerId, sessionId: session });
    },
    [session, socket]
  );

  const addStream = useCallback(
    (call: MediaConnection, stream: MediaStream) => {
      const userId = call.metadata?.userId as number | undefined;
      const screen = !!call.metadata?.screen;
      if (!userId) return;

      if (isGhost)
        return setRemoteStreams((prev) => [
          ...prev.filter((s) => s.stream.id !== stream.id),
          {
            owner: userId,
            screen: !!screen,
            peer: call.peer,
            stream,
          },
        ]);

      if (screen) setMateScreenStream(stream);
      else setMateMediaStream(stream);
    },
    [isGhost]
  );

  const removeStream = useCallback((peer: string) => {
    setRemoteStreams((prev) =>
      [...prev].filter((stream) => stream.peer !== peer)
    );
  }, []);

  const addMediaConnection = useCallback((mediaConnection: MediaConnection) => {
    setMediaConnections((prev) => [
      ...prev.filter((connection) => connection.peer !== mediaConnection.peer),
      mediaConnection,
    ]);
  }, []);

  const removeMediaConnection = useCallback(
    (mediaConnection: MediaConnection) => {
      setMediaConnections((prev) =>
        [...prev].filter(
          (connection) => connection.peer !== mediaConnection.peer
        )
      );
    },
    []
  );

  const onMediaConnectionClose = useCallback(
    (mediaConnection: MediaConnection) => {
      removeMediaConnection(mediaConnection);
      removeStream(mediaConnection.peer);

      const screen = mediaConnection.metadata?.screen;
      if (screen) return setMateScreenStream(null);
      setMateMediaStream(null);
    },
    [removeMediaConnection, removeStream]
  );

  // executed on the receiver side
  const onCall = useCallback(
    (call: MediaConnection) => {
      setMediaConnection(call);
      addMediaConnection(call);

      const emptyStream = new MediaStream([]);
      const stream = isGhost ? emptyStream : userMediaStream;

      call.answer(orUndefined(stream));

      // call.on("stream", (stream: MediaStream) => {
      //   if (call.metadata?.screen) return setMateScreenStream(stream);
      //   return setMateMediaStream(stream);
      // });

      call.on("stream", (stream: MediaStream) => addStream(call, stream));
      call.on("close", () => onMediaConnectionClose(call));

      // call.on("close", () => {
      //   if (call.metadata?.screen) return setMateScreenStream(null);
      //   return setMateMediaStream(null);
      // });
    },
    [
      addMediaConnection,
      addStream,
      isGhost,
      onMediaConnectionClose,
      userMediaStream,
    ]
  );

  const onJoinSession = useCallback(
    ({ peerId }: { peerId: string }) => {
      setTimeout(() => {
        // shared my stream with the connected peer
        const emptyStream = new MediaStream();
        const stream = isGhost ? emptyStream : userMediaStream || null;
        if (!stream) return;

        const constraints = isGhost
          ? {
              offerToReceiveAudio: true,
              offerToReceiveVideo: true,
            }
          : null;

        console.log(`I will call ${peerId}`);

        const call = peer.call(peerId, stream, {
          constraints: orUndefined(constraints),
          metadata: { userId },
        });
        setMediaConnection(call);
        addMediaConnection(call);
        // call.on("stream", setMateMediaStream);
        call.on("stream", (stream: MediaStream) => addStream(call, stream));
        call.on("close", () => onMediaConnectionClose(call));
      }, 3000);
    },
    [
      onMediaConnectionClose,
      addMediaConnection,
      addStream,
      userMediaStream,
      isGhost,
      userId,
      peer,
    ]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.UserJoinedSession, onJoinSession);
    return () => {
      socket.off(Wss.ServerEvent.UserJoinedSession, onJoinSession);
    };
  }, [onJoinSession, socket]);

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
      ghostStreams: remoteStreams,
    }),
    [
      audio,
      camera,
      denied,
      error,
      loading,
      mateAudio,
      mateMediaStream,
      mateScreenStream,
      mateSpeaking,
      mateVideo,
      mediaConnection,
      mic,
      onToggleCamera,
      onToggleMic,
      peer,
      remoteStreams,
      screen,
      start,
      stop,
      userMediaStream,
      userSpeaking,
      video,
    ]
  );
}

export function useShareScreen({
  userId,
  peerIds,
}: {
  userId?: number;
  peerIds: string[];
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mediaConnections, setMediaConnections] = useState<MediaConnection[]>(
    []
  );
  const peer = usePeer();

  const terminateConnection = useCallback(() => {
    for (const connection of mediaConnections) {
      connection.close();
    }

    setMediaConnections([]);
  }, [mediaConnections]);

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
    if (peerIds.length === 0 || !stream) return;

    const calls = peerIds.map((peerId) => {
      return peer.call(peerId, stream, {
        metadata: { screen: true, userId },
      });
    });

    setMediaConnections(calls);
  }, [peer, peerIds, stream, userId]);

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
  }, [mediaConnection, stream, threshold]);

  return speaking;
}

function useStreamState(stream?: MediaStream) {
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
  mateStream?: MediaStream,
  session?: ISession.Id,
  mateUserId?: number
) {
  const [mateVideo, setMateVideo] = useState<boolean>(false);
  const [mateAudio, setMateAudio] = useState<boolean>(false);
  const streamState = useStreamState(mateStream);
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

const ghostCallMetadata = zod.object({
  userId: zod.number().positive().int(),
  screen: zod.boolean(),
  //? include username, image ?!
});

const userCallMetadata = zod.object({
  screen: zod.boolean(),
});

type GhostStream = {
  userId: number;
  screen: boolean;
  peerId: string;
  stream: MediaStream;
  call: MediaConnection;
};

export function useSessionV2({
  isGhost,
  tutorPeerId,
  ghostPeerId,
  userId,
  onCloseSession,
}: {
  isGhost: boolean;
  tutorPeerId: string | null;
  ghostPeerId: string | null;
  userId: number | null;
  onCloseSession: Void;
}) {
  const peer = usePeer();
  const userMedia = useUserMedia();
  const [ghostCalls, setGhostCalls] = useState<MediaConnection[]>([]);
  const [ghostStreams, setGhostStreams] = useState<GhostStream[]>([]);
  const [mateStream, setMateStream] = useState<PossibleStream>(null);
  const [mateScreenStream, setMateScreenStream] =
    useState<PossibleStream>(null);
  const [outcomingCalls, setOutcomingCalls] = useState<MediaConnection[]>([]);
  const [mateCall, setMateCall] = useState<MediaConnection | null>(null);
  const [mateScreenCall, setMateScreenCall] = useState<MediaConnection | null>(
    null
  );

  const onIncomingGhostCall = useCallback((call: MediaConnection) => {
    const metadata = ghostCallMetadata.safeParse(call.metadata).data;
    if (!metadata) return; // don't answer the call on invalid metadata
    call.answer(); // answer with no stream as ghost does not have any.
    setGhostCalls((prev) => [...prev, call]);
  }, []);

  /**
   * Listen for call events: `stream` and `close`
   */
  const onGhostCall = useCallback(
    (call: MediaConnection) => {
      const metadata = ghostCallMetadata.safeParse(call.metadata).data;
      if (!metadata) return;

      call.on("stream", (stream: MediaStream) => {
        const copy = [...ghostStreams];
        const existing = copy.find(
          (stream) =>
            stream.userId === metadata.userId &&
            stream.screen === metadata.screen
        );
        if (existing) existing.call.close();

        setGhostStreams(
          copy
            .filter((stream) => {
              const sameStream =
                stream.userId === metadata.userId &&
                stream.screen === metadata.screen;
              return !sameStream;
            })
            .concat({
              userId: metadata.userId,
              screen: metadata.screen,
              peerId: call.peer,
              stream,
              call,
            })
        );
      });

      call.on("close", () => {
        const copy = [...ghostStreams];
        const filtered = copy.filter((stream) => {
          const sameStream =
            stream.userId === metadata.userId &&
            stream.screen === metadata.screen;
          return !sameStream;
        });
        setGhostStreams(filtered);
      });
    },
    [ghostStreams]
  );

  const terminateCall = useCallback(() => {
    ghostStreams.map((stream) => stream.call.close());
    outcomingCalls.map((call) => call.close());
    if (mateCall) mateCall.close();
    if (mateScreenCall) mateScreenCall.close();
  }, [ghostStreams, mateCall, mateScreenCall, outcomingCalls]);

  const onCall = useCallback(
    (call: MediaConnection) => {
      console.log(`Incomming call from ${call.peer}`);
      if (isGhost) return onIncomingGhostCall(call);

      const metadata = userCallMetadata.safeParse(call.metadata).data;
      if (!metadata) return; // don't answer the call on invlaid metadata.

      call.answer(orUndefined(userMedia.stream));

      if (metadata.screen) setMateScreenCall(call);
      else setMateCall(call);

      call.on("stream", (stream: MediaStream) => {
        if (metadata.screen) setMateScreenStream(stream);
        return setMateStream(stream);
      });

      call.on("close", () => {
        if (metadata.screen) return setMateScreenStream(null);
        return setMateStream(null);
      });
    },
    [isGhost, onIncomingGhostCall, userMedia.stream]
  );

  const call = useCallback(
    ({
      peerId,
      stream,
      screen,
    }: {
      peerId: string;
      stream: MediaStream;
      screen: boolean;
    }) => {
      setTimeout(() => {
        console.log(`Calling ${peerId}`);
        if (!userId) return;

        const call = peer.call(peerId, stream, {
          metadata: { screen, userId },
        });

        //! choose a correct name!
        setOutcomingCalls((prev) => [...prev, call]);

        call.on("stream", (stream: MediaStream) => {
          if (!screen) setMateStream(stream);
        });

        /**
         * In case of tutor-ghost connection the "close" event will be called on
         * the tutor side.
         *
         * In case of a student-tutor connection the "close" event will be
         * called on the student side.
         */
        call.on("close", () => {
          onCloseSession();
          if (!screen) setMateStream(null);
        });
      }, 3_000);
    },
    [onCloseSession, peer, userId]
  );

  useEffect(() => {
    // case: student is calling a tutor with his stream
    if (tutorPeerId && userMedia.stream)
      return call({
        peerId: tutorPeerId,
        stream: userMedia.stream,
        screen: false,
      });
  }, [call, tutorPeerId, userMedia.stream]);

  useEffect(() => {
    // case: student or a tutor is calling the ghost with his stream for recording
    if (ghostPeerId && userMedia.stream)
      return call({
        peerId: ghostPeerId,
        stream: userMedia.stream,
        screen: false,
      });
  }, [call, ghostPeerId, userMedia.stream]);

  useEffect(() => {
    peer.on("call", onCall);
    return () => {
      peer.off("call", onCall);
    };
  }, [onCall, peer]);

  useEffect(() => {
    ghostCalls.forEach(onGhostCall);

    return () => {
      ghostCalls.forEach((call) => {
        call.off("stream");
        call.off("close");
      });
    };
  }, [ghostCalls, onGhostCall]);

  useEffect(() => {
    if (isGhost || userMedia.stream || userMedia.loading || userMedia.error)
      return;
    userMedia.start();
  }, [isGhost, userMedia]);

  useEffect(() => {
    window.addEventListener("beforeunload", terminateCall);
    return () => {
      window.removeEventListener("beforeunload", terminateCall);
    };
  }, [terminateCall]);

  return {
    ghostStreams,
    userMedia,
    mateStream,
    mateScreenStream,
  };
}

export function useFullScreen<T extends Element>() {
  const ref = useRef<T>(null);
  const [fullScreen, setFullScreen] = useState<boolean>(false);

  const start = useCallback(async () => {
    if (!ref.current) return;
    await ref.current.requestFullscreen();
    setFullScreen(true);
  }, []);

  const exit = useCallback(async () => {
    await document.exitFullscreen();
    setFullScreen(false);
  }, []);

  const onFullScreenChange = useCallback(() => {
    setFullScreen(document.fullscreenElement === ref.current);
  }, []);

  useEffect(() => {
    document.addEventListener("fullscreenchange", onFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullScreenChange);
    };
  }, [onFullScreenChange]);

  useEffect(() => {
    if (ref.current && document.fullscreenElement)
      setFullScreen(document.fullscreenElement === ref.current);
  }, []);

  return {
    ref,
    enabled: fullScreen,
    start,
    exit,
  };
}

//============================== Session V3 ==============================

export function useSpeakingV3(stream: MediaStream | null) {
  const [speadking, setSpeadking] = useState<boolean>(false);

  const events = useMemo(() => {
    if (!stream) return null;
    return hark(stream);
  }, [stream]);

  useEffect(() => {
    if (!events) return;

    events.on("speaking", () => {
      setSpeadking(true);
    });

    events.on("stopped_speaking", () => {
      setSpeadking(false);
    });

    //! TODO: clear hook on re-render.
  }, [events]);

  return speadking;
}

export function useSessionV3() {
  const userMedia = useUserMedia();
  const speaking = useSpeakingV3(userMedia.stream);

  return useMemo(
    () => ({
      userMedia,
      speaking,
    }),
    [speaking, userMedia]
  );
}

type DeviceInfo = {
  /**
   * `true` if the platform is allowed to use the device.
   *
   * @default false.
   */
  permissioned: boolean;
  /**
   * `true` if the user has this deviced connected. `false` means that the user
   * doesn't has the device.
   *
   * @default false
   */
  connected: boolean;
};

type DevicesInfo = {
  microphone: DeviceInfo;
  speakers: DeviceInfo;
  camera: DeviceInfo;
};

const defaultDeviceInfo: DeviceInfo = {
  permissioned: false,
  connected: false,
};

const defaultDevicesInfo: DevicesInfo = {
  microphone: structuredClone(defaultDeviceInfo),
  speakers: structuredClone(defaultDeviceInfo),
  camera: structuredClone(defaultDeviceInfo),
};

const isPermissioned = (device: MediaDeviceInfo): boolean =>
  !!device.deviceId && !!device.label && !!device.groupId;

const getPermissionStatus = async (device: "microphone" | "camera") =>
  await navigator.permissions.query({ name: device as PermissionName });

export function useDevices() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [devices, setDevices] = useState<DevicesInfo>(defaultDevicesInfo);
  const [permissionStatuses, setPemissionStatuses] = useState<{
    microphone: PermissionStatus | null;
    camera: PermissionStatus | null;
  }>({ microphone: null, camera: null });

  const enumerateDevices = useCallback(async () => {
    setLoading(true);
    setError(false);
    const devices = await safe(
      async () => await navigator.mediaDevices.enumerateDevices()
    );
    setLoading(false);
    if (devices instanceof Error) return setError(true);

    const devicesInfo = structuredClone(defaultDevicesInfo);
    for (const device of devices) {
      if (device.kind === "audioinput" && !devicesInfo.microphone.connected) {
        devicesInfo.microphone.connected = true;
        devicesInfo.microphone.permissioned = isPermissioned(device);
      }

      if (device.kind === "audiooutput" && !devicesInfo.speakers.connected) {
        devicesInfo.speakers.connected = true;
        devicesInfo.speakers.permissioned = isPermissioned(device);
      }

      if (device.kind === "videoinput" && !devicesInfo.camera.connected) {
        devicesInfo.camera.connected = true;
        devicesInfo.camera.permissioned = isPermissioned(device);
      }
    }
    setDevices(devicesInfo);
  }, []);

  const getPermissionStatuses = useCallback(async () => {
    const [microphone, camera] = await Promise.all([
      getPermissionStatus("microphone"),
      getPermissionStatus("camera"),
    ]);
    setPemissionStatuses({ microphone, camera });
  }, []);

  const onPermissionChange = useCallback(() => {
    enumerateDevices();
  }, [enumerateDevices]);

  useEffect(() => {
    enumerateDevices();
  }, [enumerateDevices]);

  useEffect(() => {
    getPermissionStatuses();
  }, [getPermissionStatuses]);

  useEffect(() => {
    if (permissionStatuses.camera)
      permissionStatuses.camera.addEventListener("change", onPermissionChange);

    if (permissionStatuses.microphone)
      permissionStatuses.microphone.addEventListener(
        "change",
        onPermissionChange
      );

    return () => {
      if (permissionStatuses.camera)
        permissionStatuses.camera.removeEventListener(
          "change",
          onPermissionChange
        );

      if (permissionStatuses.microphone)
        permissionStatuses.microphone.removeEventListener(
          "change",
          onPermissionChange
        );
    };
  }, [
    onPermissionChange,
    permissionStatuses.camera,
    permissionStatuses.microphone,
  ]);

  return useMemo(
    () => ({
      info: devices,
      recheck: enumerateDevices,
      loading,
      error,
    }),
    [devices, enumerateDevices, error, loading]
  );
}

/**
 * Reflect and manage session members in real-time.
 */
export function useSessionMembers(sessionId?: ISession.Id) {
  const socket = useSocket();
  const [members, setMembers] = useState<number[]>([]);

  const join = useCallback(() => {
    if (!socket || !sessionId) return;
    socket.emit(Wss.ClientEvent.JoinSession, { sessionId });
  }, [sessionId, socket]);

  const leave = useCallback(() => {
    if (!socket || !sessionId) return;
    socket.emit(Wss.ClientEvent.LeaveSession, { sessionId });
  }, [sessionId, socket]);

  const onJoinSession = useCallback(({ userId }: { userId: number }) => {
    setMembers((prev) => uniq([...prev, userId]));
  }, []);

  const onLeaveSession = useCallback(({ userId }: { userId: number }) => {
    setMembers((prev) => [...prev].filter((member) => member !== userId));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.MemberJoinedSession, onJoinSession);
    socket.on(Wss.ServerEvent.MemberLeftSession, onLeaveSession);
    return () => {
      socket.off(Wss.ServerEvent.MemberJoinedSession, onJoinSession);
      socket.off(Wss.ServerEvent.MemberLeftSession, onLeaveSession);
    };
  }, [onJoinSession, onLeaveSession, socket]);

  return { join, leave, members };
}
