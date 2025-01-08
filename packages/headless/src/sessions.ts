import { ISession, Void, Wss } from "@litespace/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { safe } from "@litespace/sol/error";
import { useSocket } from "@/socket";
import { usePeer } from "@/peer";
import { MediaConnection, PeerError } from "peerjs";
import { orUndefined } from "@litespace/sol/utils";
import zod from "zod";
import hark from "hark";
import { concat, isEmpty, uniq } from "lodash";
import { useBackend } from "@/backend";
import { peers } from "@litespace/atlas";
import { Peer } from "peerjs";
import { useAtlas } from "@/atlas";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";

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
  capture: (
    /**
     * Flag to enable or disable video in the user media stream.
     */
    video?: boolean
  ) => Promise<MediaStream | Error>;
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
  /**
   * `true` if the user is actively speaking.
   */
  speaking: boolean;
};

export function useUserMedia(onStop?: Void): UseUserMediaReturn {
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

  const onTrackEnd = useCallback(() => {
    setStream(null);
    setCamera(false);
    setMic(false);
    setVideo(false);
    setAudio(false);
    if (onStop) onStop();
  }, [onStop]);

  const stop = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    onTrackEnd();
  }, [onTrackEnd, stream]);

  const capture = useCallback(
    async (video?: boolean) => {
      setLoading(true);
      const capturedStream = await getUserMedia(video);
      setLoading(false);
      const error = capturedStream instanceof Error;
      const denied = error ? isPermissionDenied(capturedStream) : false;

      /**
       * Stopping the previous stream incase we got a new stream.
       */
      if (!error) stop();

      // user canceled the process.
      if (denied) {
        setError(null);
        setUserDenied(true);
        setStream(null);
        return capturedStream;
      }

      if (!error) setError(error ? capturedStream : null);
      setStream(error ? null : capturedStream);
      return capturedStream;
    },
    [getUserMedia, stop]
  );

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

  const speaking = useSpeakingV3(stream);

  useEffect(() => {
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    const audioTracks = stream.getAudioTracks();

    if (!isEmpty(videoTracks)) setCamera(true);
    if (!isEmpty(audioTracks)) setMic(true);

    setAudio(!!audioTracks.find((track) => track.enabled));
    setVideo(!!videoTracks.find((track) => track.enabled));

    const tracks = concat(audioTracks, videoTracks);

    tracks.forEach((track) => {
      track.addEventListener("ended", onTrackEnd);
    });

    return () => {
      tracks.forEach((track) => {
        track.removeEventListener("ended", onTrackEnd);
      });
    };
  }, [onStop, onTrackEnd, stream]);

  return {
    speaking,
    loading,
    stream,
    error,
    capture,
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
    capture,
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
  const {
    otherMemberAudio,
    otherMemberVideo,
    notifyCameraToggle,
    notifyMicToggle,
  } = useSessionEvents(mateUserId);

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
        audio: otherMemberAudio,
        video: otherMemberVideo,
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
      capture,
      stop,
      onToggleCamera,
      onToggleMic,
      peer,
      ghostStreams: remoteStreams,
    }),
    [
      audio,
      camera,
      capture,
      denied,
      error,
      loading,
      mateMediaStream,
      mateScreenStream,
      mateSpeaking,
      mediaConnection,
      mic,
      onToggleCamera,
      onToggleMic,
      otherMemberAudio,
      otherMemberVideo,
      peer,
      remoteStreams,
      screen,
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
    userMedia.capture();
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

function asPeerId(userId: number) {
  return userId.toString();
}

function usePeerV3(userId?: number) {
  const { backend } = useBackend();
  const [ready, setReady] = useState<boolean>(false);

  const peer = useMemo(() => {
    if (!userId) return null;
    const peerServer = peers[backend];
    return new Peer(asPeerId(userId), {
      host: peerServer.host,
      path: peerServer.path,
      port: peerServer.port,
      secure: peerServer.secure,
      key: peerServer.key,
      /**
       * todo: add logs only for development and staging
       * Prints log messages depending on the debug level passed in. Defaults to 0.
       *  0 Prints no logs.
       *  1 Prints only errors.
       *  2 Prints errors and warnings.
       *  3 Prints all logs.
       */
      debug: 1,
    });
  }, [backend, userId]);

  const onOpen = useCallback(() => {
    setReady(true);
  }, []);

  const onClose = useCallback(() => {
    setReady(false);
  }, []);

  const onError = useCallback(
    (
      error: PeerError<
        | "disconnected"
        | "browser-incompatible"
        | "invalid-id"
        | "invalid-key"
        | "network"
        | "peer-unavailable"
        | "ssl-unavailable"
        | "server-error"
        | "socket-error"
        | "socket-closed"
        | "unavailable-id"
        | "webrtc"
      >
    ) => {
      // todo: handle errors
      console.log(error);
    },
    []
  );

  useEffect(() => {
    if (!peer) return;
    peer.on("open", onOpen);
    peer.on("close", onClose);
    peer.on("error", onError);
    return () => {
      peer.off("open", onOpen);
      peer.off("close", onClose);
      peer.off("error", onError);
    };
  }, [onClose, onError, onOpen, peer]);

  return useMemo(() => ({ peer, ready }), [peer, ready]);
}

export function useSpeakingV3(stream: MediaStream | null) {
  const [speadking, setSpeadking] = useState<boolean>(false);

  const events = useMemo(() => {
    if (!stream || isEmpty(stream.getAudioTracks())) return null;
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

export function useSessionEvents(
  otherMemberId?: number,
  sessionId?: ISession.Id
) {
  const [otherMemberVideo, setOtherMemberVideo] = useState<boolean>(false);
  const [otherMemberAudio, setOtherMemberAudio] = useState<boolean>(false);
  const socket = useSocket();

  const notifyCameraToggle = useCallback(
    (camera: boolean) => {
      if (!sessionId || !socket) return;
      socket.emit(Wss.ClientEvent.ToggleCamera, { session: sessionId, camera });
    },
    [sessionId, socket]
  );

  const notifyMicToggle = useCallback(
    (mic: boolean) => {
      if (!sessionId || !socket) return;
      socket.emit(Wss.ClientEvent.ToggleMic, { session: sessionId, mic });
    },
    [sessionId, socket]
  );

  const onCameraToggle = useCallback(
    ({ camera, user }: { camera: boolean; user: number }) => {
      if (user === otherMemberId) setOtherMemberVideo(camera);
    },
    [otherMemberId]
  );

  const onMicToggle = useCallback(
    ({ mic, user }: { mic: boolean; user: number }) => {
      if (user === otherMemberId) setOtherMemberAudio(mic);
    },
    [otherMemberId]
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

  return {
    notifyCameraToggle,
    notifyMicToggle,
    otherMemberAudio,
    otherMemberVideo,
  };
}

export function useShareScreenV3(onStop?: Void) {
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const share = useCallback(async () => {
    setLoading(true);
    const stream = await safe(
      async () =>
        await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: {
            width: 1280,
            height: 720,
          },
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

    if (!error) setError(error ? stream : null);
    setStream(error ? null : stream);
    return stream;
  }, []);

  const stop = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    if (onStop) onStop();
  }, [onStop, stream]);

  useEffect(() => {
    if (!stream) return;
    stream.getVideoTracks().map((track) => {
      track.addEventListener("ended", () => {
        setStream(null);
        if (onStop) onStop();
      });
    });
  }, [onStop, stream]);

  return {
    loading,
    stream,
    error,
    share,
    stop,
  };
}

export type SessionV3Payload = {
  sessionId?: ISession.Id;
  isOtherMemberReady: boolean;
  /**
   * It should be true incase the current user should call the other user.
   */
  isCaller: boolean;
  userIds: {
    current?: number;
    other?: number;
  };
};

const callMetadata = zod.object({
  screen: zod.optional(zod.boolean()),
  owner: zod.number(),
});

export function useSessionV3({
  userIds,
  sessionId,
  isOtherMemberReady,
  isCaller,
}: SessionV3Payload) {
  const { peer, ready } = usePeerV3(userIds.current);
  const [otherMemberStream, setOtherMemberStream] =
    useState<MediaStream | null>(null);
  const [otherMemberScreenStream, setOtherMemberScreenStream] =
    useState<MediaStream | null>(null);
  const [mainCall, setMainCall] = useState<MediaConnection | null>(null);
  const [screenCall, setScreenCall] = useState<MediaConnection | null>(null);
  const {
    notifyCameraToggle,
    notifyMicToggle,
    otherMemberAudio,
    otherMemberVideo,
  } = useSessionEvents(userIds.other, sessionId);
  const otherMemberSpeaking = useSpeakingV3(otherMemberStream);

  /**
   * Handler to be called whenever the current user screen stream is closed.
   * 1. User clicked the "Stop Sharing" button from the browser.
   * 2. User cliecked the "share" toggle button from the session page.
   * 2. Refresh the page.
   * 2. Error
   */
  const onScreenStreamStop = useCallback(() => {
    if (!screenCall) return;
    screenCall.close();
  }, [screenCall]);

  const onUserMediaStreamStop = useCallback(() => {
    if (!mainCall) return;
    mainCall.close();
  }, [mainCall]);

  const userMedia = useUserMedia(onUserMediaStreamStop);
  const screen = useShareScreenV3(onScreenStreamStop);

  const notifyUserMediaState = useCallback(() => {
    notifyCameraToggle(userMedia.video);
    notifyMicToggle(userMedia.audio);
  }, [notifyCameraToggle, notifyMicToggle, userMedia.audio, userMedia.video]);

  /**
   * Handler the main call stream event.
   */
  const onMainCallStream = useCallback((stream: MediaStream) => {
    setOtherMemberStream(stream);
  }, []);

  /**
   * Handler for the main call close event.
   */
  const onMainCallClose = useCallback(() => {
    setOtherMemberStream(null);
    setMainCall(null);
  }, []);

  /**
   * Handler for the screen call stream event.
   */
  const onScreenCallStream = useCallback((stream: MediaStream) => {
    setOtherMemberScreenStream(stream);
  }, []);

  /**
   * Handler for the screen call close event.
   *
   * @note this handler is executed on both sender and receiver sides.
   */
  const onScreenCallClose = useCallback(() => {
    setOtherMemberScreenStream(null);
    setScreenCall(null);
    /**
     * This logic is used when the other user wants to share his screen.
     *
     * @note `screenCall` in this function scope refers to the previous screen
     * call.
     *
     * This mean that `screen.stop()` will be called on the previous screen call
     * owner.
     */
    if (!screenCall) return;
    const owner =
      callMetadata.parse(screenCall.metadata).owner === userIds.current;
    if (owner) screen.stop();
  }, [screen, screenCall, userIds]);

  const onCall = useCallback(
    (call: MediaConnection) => {
      if (!userMedia.stream)
        return console.warn(
          "Answering calls without a media stream is not supported yet."
        );

      const metadata = callMetadata.parse(call.metadata);

      /**
       * In case the other user is sharing his screen with the current user,
       * there is no need to respond with the current user stream.
       */
      call.answer(!metadata.screen ? userMedia.stream : undefined);
      if (metadata.screen) return setScreenCall(call);
      setMainCall(call);
      notifyUserMediaState();
    },
    [notifyUserMediaState, userMedia.stream]
  );

  /**
   * Handler used to call a user.
   */
  const call = useCallback(
    ({
      userId,
      stream,
      screen,
    }: {
      /**
       * The target user id.
       */
      userId: number;
      /**
       * The current user media stream.
       */
      stream: MediaStream;
      /**
       * Flag to indicate that the curren stream is a screen.
       */
      screen?: boolean;
    }) => {
      if (!peer) return console.warn("Peer is not defined");
      if (!userIds.current)
        return console.warn(
          "Current user id is not defined; should never happen."
        );

      const call = peer.call(asPeerId(userId), stream, {
        metadata: { screen, owner: userIds.current },
      });

      if (screen) setScreenCall(call);
      else setMainCall(call);
    },
    [peer, userIds]
  );

  const closeScreenCall = useCallback(() => {
    if (screenCall) screenCall.close();
  }, [screenCall]);

  /**
   * Leave session handler.
   *
   * The main goal of this handler
   * 1. Close current calls.
   * 2. Close streams.
   * 3. Reset other states.
   */
  const leave = useCallback(() => {
    if (mainCall) mainCall.close();
    if (screenCall) screenCall.close();
    if (screen.stream) screen.stop();
    if (userMedia.stream) userMedia.stop();
  }, [mainCall, screen, screenCall, userMedia]);

  // listen for calls
  useEffect(() => {
    if (!peer) return;
    peer.on("call", onCall);
    return () => {
      peer.off("call", onCall);
    };
  }, [onCall, peer]);

  /**
   * Why sharing the screen stream in a `useEffect`?
   *
   * This is becuase the user (student or tutor) can share the screen before the
   * other user (receiver) join the session or before it is ready to accept peer
   * connections. That's why this `useEffect` will call the other user whenever
   * he is in the room and is ready to accept peer connections. Also, it will
   * work out of the box in case the other user (receiver) left and rejoined the
   * session again.
   */
  useEffect(() => {
    if (screen.stream && userIds.other && isOtherMemberReady)
      return call({
        userId: userIds.other,
        stream: screen.stream,
        screen: true,
      });
  }, [call, isOtherMemberReady, screen.stream, userIds.other]);

  useEffect(() => {
    if (!isCaller || !userIds.other || !userMedia.stream) return;
    call({
      userId: userIds.other,
      stream: userMedia.stream,
    });
    notifyUserMediaState();
  }, [call, isCaller, notifyUserMediaState, userIds.other, userMedia.stream]);

  /**
   * Handle main call events.
   */
  useEffect(() => {
    if (!mainCall) return;
    mainCall.on("stream", onMainCallStream);
    mainCall.on("close", onMainCallClose);
    return () => {
      mainCall.off("stream", onMainCallStream);
      mainCall.off("close", onMainCallClose);
    };
  }, [mainCall, onMainCallClose, onMainCallStream]);

  /**
   * Handle screen call events.
   *
   * @note with the current version, we only support one screen call. This mean
   * that only one user can share his screen.
   */
  useEffect(() => {
    if (!screenCall) return;
    screenCall.on("stream", onScreenCallStream);
    screenCall.on("close", onScreenCallClose);
    return () => {
      screenCall.off("stream", onScreenCallStream);
      screenCall.off("close", onScreenCallClose);
    };
  }, [onScreenCallClose, onScreenCallStream, screenCall]);

  return useMemo(
    () => ({
      isPeerReady: ready,
      screen,
      members: {
        current: {
          audio: userMedia.audio,
          video: userMedia.video,
          stream: userMedia.stream,
          speaking: userMedia.speaking,
          loadingStream: userMedia.loading,
          screen: screen.stream,
        },
        other: {
          audio: otherMemberAudio,
          video: otherMemberVideo,
          stream: otherMemberStream,
          speaking: otherMemberSpeaking,
          screen: otherMemberScreenStream,
        },
      },
      call,
      leave,
      closeScreenCall,
      toggleCamera: () => {
        userMedia.toggleCamera();
        notifyCameraToggle(!userMedia.video);
      },
      toggleMic: () => {
        userMedia.toggleMic();
        notifyMicToggle(!userMedia.audio);
      },
      notifyUserMediaState,
      capture: userMedia.capture,
    }),
    [
      call,
      closeScreenCall,
      leave,
      notifyCameraToggle,
      notifyMicToggle,
      notifyUserMediaState,
      otherMemberAudio,
      otherMemberScreenStream,
      otherMemberSpeaking,
      otherMemberStream,
      otherMemberVideo,
      ready,
      screen,
      userMedia,
    ]
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
export function useSessionMembers(
  sessionId?: ISession.Id,
  currentUserId?: number
) {
  const socket = useSocket();
  const atlas = useAtlas();

  const [members, setMembers] = useState<number[]>([]);
  const [listening, setListening] = useState<boolean>(false);
  const [joining, setJoining] = useState<boolean>(false);

  const joined = useMemo(
    () => !!currentUserId && members.includes(currentUserId),
    [currentUserId, members]
  );

  const findSessionMembers = useCallback(async () => {
    if (!sessionId) return [];
    return await atlas.session.findMembers(sessionId);
  }, [atlas.session, sessionId]);

  const sessionMembersQuery = useQuery({
    queryFn: findSessionMembers,
    queryKey: [QueryKey.FindSessionMembers, sessionId],
    enabled: !!sessionId,
  });

  const listen = useCallback(() => {
    if (!socket || !sessionId) return;
    socket.emit(Wss.ClientEvent.PreJoinSession, { sessionId }, (ack) => {
      if (ack?.code === Wss.AcknowledgeCode.Ok) return setListening(true);
      return setListening(false);
    });
  }, [sessionId, socket]);

  const join = useCallback(() => {
    if (!socket || !sessionId) return;
    socket.emit(Wss.ClientEvent.JoinSession, { sessionId });
    setJoining(true);
  }, [sessionId, socket]);

  const leave = useCallback(() => {
    if (!socket || !sessionId) return;
    socket.emit(Wss.ClientEvent.LeaveSession, { sessionId });
    setJoining(false);
  }, [sessionId, socket]);

  const onJoinSession = useCallback(
    ({ userId }: { userId: number }) => {
      if (currentUserId === userId) setJoining(false);
      setMembers((prev) => uniq([...prev, userId]));
    },
    [currentUserId]
  );

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

  useEffect(() => {
    if (!listening) return listen();
  }, [listen, listening]);

  useEffect(() => {
    if (sessionMembersQuery.data && !sessionMembersQuery.isLoading)
      return setMembers((prev) => uniq([...prev, ...sessionMembersQuery.data]));
  }, [sessionMembersQuery.data, sessionMembersQuery.isLoading]);

  return { join, leave, members, listening, joining, joined };
}
