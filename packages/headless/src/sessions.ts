import { ISession, Void, Wss } from "@litespace/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { safe, safePromise } from "@litespace/utils/error";
import { useSocket } from "@/socket";
import { MediaConnection, PeerError } from "peerjs";
import zod from "zod";
import hark from "hark";
import { concat, isEmpty, uniq } from "lodash";
import { useServer } from "@/server";
import { peers as peerServers } from "@litespace/atlas";
import { Peer } from "peerjs";
import { useApi } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";
import { useLogger } from "@/logger";
import {
  ServerMessageType,
  ServerMessageValue,
  useEchoSocket,
  ClientMessageType,
} from "@/echo";
import { useExtendedQuery } from "@/query";

declare module "peerjs" {
  export interface CallOption {
    constraints?: {
      offerToReceiveAudio: boolean;
      offerToReceiveVideo: boolean;
    };
  }
}

export function isNotAllowed(error: Error): boolean {
  return (
    // Firefox
    error.name === "NotAllowedError" ||
    // Chrome
    error.name === "PermissionDeniedError"
  );
}

export function isDeviceNotFound(error: Error) {
  return (
    // Firefox
    error.name === "NotFoundError" ||
    // Chrome
    error.name === "DevicesNotFoundError"
  );
}

export function isNotReadableError(error: Error) {
  return (
    // Firefox
    error.name === "NotReadableError" ||
    // Chrome
    error.name === "TrackStartError"
  );
}

export function isOverConstrainedError(error: Error) {
  return (
    // Firefox
    error.name === "OverconstrainedError" ||
    // Chrome
    error.name === "ConstraintNotSatisfiedError"
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
  capture: (config: {
    /**
     * Flag to enable or disable video in the user media stream.
     */
    video?: boolean;
    /**
     * @default false
     */
    silent?: boolean;
    /**
     * @default desktop
     */
    layout?: Layout;
  }) => Promise<MediaStream | Error>;
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
  /**
   * `true` if the current user stream has video tracks.
   */
  hasVideoTracks: boolean;
  /**
   * `true` if the current user stream has audio tracks.
   */
  hasAudioTracks: boolean;
};

export type Layout = "mobile" | "simulated-mobile" | "tablet" | "desktop";

export const layoutAspectRatio = {
  mobile: {
    aspectRatio: 9 / 16,
    width: 720,
    height: 1280,
  },
  "simulated-mobile": {
    aspectRatio: 9 / 16,
    width: 720,
    height: 1280,
  },
  tablet: {
    aspectRatio: 4 / 3,
    width: 640,
    height: 480,
  },
  desktop: {
    aspectRatio: 16 / 9,
    width: 1280,
    height: 720,
  },
} as const;

function getVideoContrains(layout: Layout) {
  /**
   * After testing (chrome on android and ios), it is better to just ask for the
   * `default` video without any extra constrains as it will cause unexpected
   * output.
   */
  if (layout === "mobile") return true;

  const { aspectRatio, width, height } = layoutAspectRatio[layout];

  return {
    /**
     * Fallback constrains in case that non of the `advanced` got
     * applied.
     */
    width: { ideal: width },
    height: { ideal: height },
    aspectRatio: { ideal: aspectRatio },
    //! Make sure that you understand how the `advanced` constrain works.
    //! Important Articel: https://www.webrtc-developers.com/getusermedia-constraints-explained/
    advanced: [
      /**
       * Best case scenario: all width, height, aspect ratio can be
       * applied.
       */
      {
        width: { exact: width },
        height: { exact: height },
        aspectRatio: { exact: aspectRatio },
      },
      /**
       * In case the previous constrains failed, we will use only the aspect ratio.
       */
      {
        aspectRatio: { exact: aspectRatio },
      },
    ],
  };
}

export function useUserMedia(onStop?: Void): UseUserMediaReturn {
  const logger = useLogger();
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
      layout = "desktop",
    }: {
      video?: boolean;
      layout?: Layout;
    }): Promise<Error | MediaStream> => {
      return await safe(async () => {
        // Ref: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        // Ref: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
        // Ref: https://www.webrtc-developers.com/getusermedia-constraints-explained/
        // Ref: https://webrtchacks.com/getusermedia-resolutions-3/
        // Ref: https://www.webrtc-developers.com/getusermedia-constraints-explained/#applying-new-constraints
        // Ref: https://blog.addpipe.com/getusermedia-video-constraints/
        // Ref: https://blog.addpipe.com/common-getusermedia-errors/
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            noiseSuppression: true,
            echoCancellation: true, // Optional: Enable echo cancellation
          },
          video: video ? getVideoContrains(layout) : undefined,
        });

        for (const track of stream.getTracks()) {
          logger.log(`Captured track: ${track.kind}`, {
            capabilities: track.getCapabilities(),
            constraint: track.getConstraints(),
            settings: track.getSettings(),
            layout,
          });
        }

        return stream;
      });
    },
    [logger]
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
    async ({ video, layout }: { video?: boolean; layout?: Layout }) => {
      setLoading(true);
      const capturedStream = await getUserMedia({ video, layout });
      const error = capturedStream instanceof Error;
      if (error) logger.error(capturedStream);

      /**
       * Stopping the previous stream incase we got a new stream.
       */
      if (!error) stop();
      if (error && isNotAllowed(capturedStream)) setUserDenied(true);
      setError(error ? capturedStream : null);
      if (!error) setStream(capturedStream);
      setLoading(false);
      return capturedStream;

      // noice cancellation
      // const ctx = new AudioContext();
      // const gainNode = ctx.createGain();
      // const audioDest = ctx.createMediaStreamDestination();
      // const source = ctx.createMediaStreamSource(capturedStream);
      // // gainNode is set to 0.5
      // gainNode.connect(audioDest);
      // gainNode.gain.value = 0.5; // users can control the gain
      // source.connect(gainNode);

      // const output = new MediaStream([
      //   ...capturedStream.getVideoTracks(),
      //   ...audioDest.stream.getVideoTracks(),
      // ]);

      // setStream(output);
      // return output;
    },
    [getUserMedia, logger, stop]
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

  const hasVideoTracks = useMemo(() => {
    return !isEmpty(stream?.getVideoTracks());
  }, [stream]);

  const hasAudioTracks = useMemo(() => {
    return !isEmpty(stream?.getAudioTracks());
  }, [stream]);

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
    hasVideoTracks,
    hasAudioTracks,
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

function usePeerJs(userId?: number) {
  const { server } = useServer();
  const [ready, setReady] = useState<boolean>(false);

  const peer = useMemo(() => {
    if (!userId) return null;
    const peerServer = peerServers[server];
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
      config: {
        iceServers: [
          {
            urls: "stun:turn.litespace.org",
          },
          {
            urls: "turn:turn.litespace.org",
            username: "litespace",
            credential: "litespace",
          },
        ],
      },
    });
  }, [server, userId]);

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
      console.log(error.type, error.name);
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

export function useSessionEvents({
  memberId,
  sessionId,
}: {
  memberId?: number;
  sessionId?: ISession.Id;
}) {
  const [memberVideo, setMemberVideo] = useState<boolean>(false);
  const [memberAudio, setMemberAudio] = useState<boolean>(false);
  const { socket } = useSocket();

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
      if (user === memberId) setMemberVideo(camera);
    },
    [memberId]
  );

  const onMicToggle = useCallback(
    ({ mic, user }: { mic: boolean; user: number }) => {
      if (user === memberId) setMemberAudio(mic);
    },
    [memberId]
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
    otherMemberAudio: memberAudio,
    otherMemberVideo: memberVideo,
  };
}

export function useShareScreen(onStop?: Void) {
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
    const denied = error ? isNotAllowed(stream) : false;

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
  /**
   * It should be true incase the current user should call the other user.
   */
  isCaller: boolean;
  userIds: {
    current?: number;
    other?: number;
  };
  onUserMediaStreamError?: (error: Error) => void;
};

const callMetadata = zod.object({
  screen: zod.optional(zod.boolean()),
  owner: zod.number(),
});

export function useSessionV3({
  userIds,
  sessionId,
  isCaller,
}: SessionV3Payload) {
  const { peer, ready } = usePeerJs(userIds.current);
  const [otherMemberStream, setOtherMemberStream] =
    useState<MediaStream | null>(null);
  const [otherMemberScreenStream, setOtherMemberScreenStream] =
    useState<MediaStream | null>(null);
  const [startedMainCall, setStartedMainCall] = useState<boolean>(false);
  const [mainCall, setMainCall] = useState<MediaConnection | null>(null);
  const [screenCall, setScreenCall] = useState<MediaConnection | null>(null);
  const {
    notifyCameraToggle,
    notifyMicToggle,
    otherMemberAudio,
    otherMemberVideo,
  } = useSessionEvents({ memberId: userIds.other, sessionId });
  const otherMemberSpeaking = useSpeakingV3(otherMemberStream);

  const sessionManager = useSessionManager(
    useMemo(
      () => ({
        sessionId,
        currentUserId: userIds.current,
        onLeave: () => {
          mainCall?.close();
          screenCall?.close();
          setMainCall(null);
          setScreenCall(null);
        },
        onJoin(userId) {
          console.log(userId);
        },
        onInitialMembers(userIds) {
          console.log(userIds);
        },
        onReconnect(members) {
          console.log(members);
        },
      }),
      [mainCall, screenCall, sessionId, userIds]
    )
  );

  const isOtherMemberJoined = useMemo(
    () => !!userIds.other && sessionManager.members.includes(userIds.other),
    [sessionManager.members, userIds.other]
  );

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
  const screen = useShareScreen(onScreenStreamStop);

  /**
   * Handler the main call stream event.
   */
  const onMainCallStream = useCallback((stream: MediaStream) => {
    console.debug("Got a main call stream.");
    setOtherMemberStream(stream);
  }, []);

  /**
   * Handler for the main call close event.
   */
  const onMainCallClose = useCallback(() => {
    console.debug("Close main call.");
    setOtherMemberStream(null);
    setMainCall(null);
  }, []);

  const onMainCallError = useCallback(
    (error: PeerError<"negotiation-failed" | "connection-closed">) => {
      console.debug("Main call error", error.type);
    },
    []
  );

  /**
   * Handler for the screen call stream event.
   */
  const onScreenCallStream = useCallback((stream: MediaStream) => {
    console.log("Got a screen call stream");
    setOtherMemberScreenStream(stream);
  }, []);

  /**
   * Handler for the screen call close event.
   *
   * @note this handler is executed on both sender and receiver sides.
   */
  const onScreenCallClose = useCallback(() => {
    console.log("Close a screen call stream");
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
    //! DISABLE FOR NOW
    // if (!screenCall) return;
    // const owner =
    //   callMetadata.parse(screenCall.metadata).owner === userIds.current;
    // if (owner) screen.stop();
  }, []);

  const onScreenCallError = useCallback(
    (error: PeerError<"negotiation-failed" | "connection-closed">) => {
      console.debug("Screen call error", error.type);
    },
    []
  );

  const onCall = useCallback(
    (call: MediaConnection) => {
      if (!userMedia.stream)
        return console.warn(
          "Answering calls without a media stream is not supported yet."
        );

      const metadata = callMetadata.parse(call.metadata);

      console.debug({
        title: "Received a call",
        src: "onCall",
        metadata,
      });

      /**
       * In case the other user is sharing his screen with the current user,
       * there is no need to respond with the current user stream.
       */
      call.answer(!metadata.screen ? userMedia.stream : undefined);

      if (metadata.screen) {
        call.on("stream", onScreenCallStream);
        call.on("close", onScreenCallClose);
        call.on("error", onScreenCallError);
        return setScreenCall(call);
      }

      setMainCall(call);
      setStartedMainCall(true);
      notifyCameraToggle(userMedia.video);
      notifyMicToggle(userMedia.audio);
      call.on("stream", onMainCallStream);
      call.on("close", onMainCallClose);
      call.on("error", onMainCallError);
    },
    [
      notifyCameraToggle,
      notifyMicToggle,
      onMainCallClose,
      onMainCallError,
      onMainCallStream,
      onScreenCallClose,
      onScreenCallError,
      onScreenCallStream,
      userMedia.audio,
      userMedia.stream,
      userMedia.video,
    ]
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

      if (screen) {
        call.on("stream", onScreenCallStream);
        call.on("close", onScreenCallClose);
        call.on("error", onScreenCallError);
        return setScreenCall(call);
      }

      call.on("stream", onMainCallStream);
      call.on("close", onMainCallClose);
      call.on("error", onMainCallError);
      setStartedMainCall(true);
      return setMainCall(call);
    },
    [
      onMainCallClose,
      onMainCallError,
      onMainCallStream,
      onScreenCallClose,
      onScreenCallError,
      onScreenCallStream,
      peer,
      userIds,
    ]
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
    sessionManager.leave();
    if (mainCall) mainCall.close();
    if (screenCall) screenCall.close();
    if (screen.stream) screen.stop();
    if (userMedia.stream) userMedia.stop();
  }, [mainCall, screen, screenCall, sessionManager, userMedia]);

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
    const shouldCall =
      screen.stream && userIds.other && isOtherMemberJoined && !screenCall;

    console.debug({
      title: "Share screen stream",
      src: "useSectionV3.useEffect",
      shouldCall,
      stream: screen.stream,
      otherUserId: userIds.other,
      isOtherMemberJoined,
      message: shouldCall
        ? "Will share the the screen stream with the other member."
        : "Will not share the screen stream with the other member.",
    });

    if (screen.stream && userIds.other && isOtherMemberJoined && !screenCall)
      return call({
        userId: userIds.other,
        stream: screen.stream,
        screen: true,
      });
  }, [call, isOtherMemberJoined, screen.stream, screenCall, userIds.other]);

  useEffect(() => {
    const shouldCall =
      isCaller &&
      !!userIds.other &&
      !!userMedia.stream &&
      !!isOtherMemberJoined &&
      !startedMainCall;

    console.debug({
      title: "Call the other member",
      src: "useSessionV3.useEffect",
      shouldCall,
      isCaller,
      other: userIds.other,
      stream: userMedia.stream,
      isOtherMemberJoined,
      startedMainCall,
    });

    if (
      !isCaller ||
      !userIds.other ||
      !userMedia.stream ||
      !isOtherMemberJoined ||
      !!startedMainCall
    )
      return;

    call({
      userId: userIds.other,
      stream: userMedia.stream,
    });
  }, [
    call,
    isCaller,
    isOtherMemberJoined,
    startedMainCall,
    userIds.other,
    userMedia.stream,
  ]);

  useEffect(() => {
    notifyCameraToggle(userMedia.video);
  }, [notifyCameraToggle, userMedia.video]);

  useEffect(() => {
    notifyMicToggle(userMedia.audio);
  }, [notifyMicToggle, userMedia.audio]);

  return useMemo(
    () => ({
      sessionManager,
      isOtherMemberJoined,
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
          error: userMedia.error,
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
      toggleCamera: userMedia.toggleCamera,
      toggleMic: userMedia.toggleMic,
      capture: userMedia.capture,
    }),
    [
      call,
      closeScreenCall,
      isOtherMemberJoined,
      leave,
      otherMemberAudio,
      otherMemberScreenStream,
      otherMemberSpeaking,
      otherMemberStream,
      otherMemberVideo,
      ready,
      screen,
      sessionManager,
      userMedia.audio,
      userMedia.capture,
      userMedia.error,
      userMedia.loading,
      userMedia.speaking,
      userMedia.stream,
      userMedia.toggleCamera,
      userMedia.toggleMic,
      userMedia.video,
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
export function useSessionManager({
  sessionId,
  selfId,
  onJoin,
  onLeave,
  onInitialMembers,
  onReconnect,
}: {
  sessionId?: ISession.Id;
  selfId?: number;
  onLeave?(userId: number): void;
  onJoin?(userId: number): void;
  onInitialMembers?(userIds: number[]): void;
  onReconnect?(members: number[]): void;
}) {
  const logger = useLogger();
  const { socket } = useSocket();
  const api = useApi();
  const onLeaveRef = useRef(onLeave);
  const onJoinRef = useRef(onJoin);
  const onInitialMembersRef = useRef(onInitialMembers);
  const onReconnectRef = useRef(onReconnect);

  useEffect(() => {
    onLeaveRef.current = onLeave;
    onJoinRef.current = onJoin;
    onInitialMembersRef.current = onInitialMembers;
    onReconnectRef.current = onReconnect;
  });

  const [members, setMembers] = useState<number[]>([]);
  const [listening, setListening] = useState<boolean>(false);
  const [joining, setJoining] = useState<boolean>(false);

  const findSessionMembers = useCallback(async () => {
    if (!sessionId) return [];
    return await api.session.findMembers(sessionId);
  }, [api.session, sessionId]);

  const sessionMembersQuery = useQuery({
    queryFn: findSessionMembers,
    queryKey: [QueryKey.FindSessionMembers, sessionId],
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
    // refetchInterval: 2_000,
  });

  const joined = useMemo(
    () => !!selfId && members.includes(selfId),
    [members, selfId]
  );

  const hasJoined = useCallback(
    (memberId?: number) => !!memberId && !!members.includes(memberId),
    [members]
  );

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
      if (selfId === userId) setJoining(false);
      setMembers((prev) => uniq([...prev, userId]));
      onJoinRef.current?.(userId);
    },
    [selfId]
  );

  const onLeaveSession = useCallback(
    ({ userId }: { userId: number }) => {
      if (selfId === userId) setJoining(false);
      setMembers((prev) => [...prev].filter((member) => member !== userId));
      onLeaveRef.current?.(userId);
    },
    [selfId]
  );

  const onConnect = useCallback(async () => {
    if (!listening) return;
    logger.log("Possible connection after temporary disconnection");
    listen();
    join();
    const data = await sessionMembersQuery.refetch();
    if (data.data) onReconnectRef.current?.(data.data);
  }, [join, listen, listening, logger, sessionMembersQuery]);

  const onDisconnect = useCallback(() => {
    logger.log("Socket disconnect...");
  }, [logger]);

  useEffect(() => {
    socket?.on("connect", onConnect);
    return () => {
      socket?.off("connect", onConnect);
    };
  }, [onConnect, socket]);

  useEffect(() => {
    socket?.on("disconnect", onDisconnect);
    return () => {
      socket?.off("disconnect", onDisconnect);
    };
  }, [onDisconnect, socket]);

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
      setMembers(sessionMembersQuery.data);
  }, [sessionMembersQuery.data, sessionMembersQuery.isLoading]);

  return {
    join,
    leave,
    members,
    listening,
    joining,
    joined,
    loadingMembers:
      sessionMembersQuery.isLoading || sessionMembersQuery.isFetching,
    hasJoined,
  };
}

// ================================== Session V4 ==============================================

const iceServers: RTCIceServer[] = [
  {
    urls: "stun:stun.litespace.org",
  },
  {
    urls: "turn:turn.litespace.org",
    username: "litespace",
    credential: "litespace",
  },
];

const offerOptions: RTCOfferOptions = {
  // ref: https://medium.com/@fippo/ice-restarts-5d759caceda6
  iceRestart: true,
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

function useNotifyState(sessionId?: ISession.Id) {
  const { socket } = useSocket();

  const notifyCamera = useCallback(
    (camera: boolean) => {
      if (!sessionId || !socket) return;
      socket.emit(Wss.ClientEvent.ToggleCamera, { session: sessionId, camera });
    },
    [sessionId, socket]
  );

  const notifyMic = useCallback(
    (mic: boolean) => {
      if (!sessionId || !socket) return;
      socket.emit(Wss.ClientEvent.ToggleMic, { session: sessionId, mic });
    },
    [sessionId, socket]
  );

  return { notifyMic, notifyCamera };
}

function useMemberState({
  memberId,
  stream,
}: {
  memberId?: number;
  stream: MediaStream | null;
}) {
  const { socket } = useSocket();
  const [video, setVideo] = useState<boolean>(false);
  const [audio, setAudio] = useState<boolean>(false);
  const speaking = useSpeakingV3(stream);

  const onCameraToggled = useCallback(
    ({ camera, user }: { camera: boolean; user: number }) => {
      if (user === memberId) setVideo(camera);
    },
    [memberId]
  );

  const onMicToggled = useCallback(
    ({ mic, user }: { mic: boolean; user: number }) => {
      if (user === memberId) setAudio(mic);
    },
    [memberId]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.CameraToggled, onCameraToggled);
    socket.on(Wss.ServerEvent.MicToggled, onMicToggled);

    return () => {
      socket.off(Wss.ServerEvent.CameraToggled, onCameraToggled);
      socket.off(Wss.ServerEvent.MicToggled, onMicToggled);
    };
  }, [onCameraToggled, onMicToggled, socket]);

  return { audio, video, speaking };
}

// ================================== Session V5 ==============================================

function createPeer() {
  return new RTCPeerConnection({ iceServers });
}

function shouldShareOffer({
  selfId,
  memberId,
}: {
  selfId: number;
  memberId: number;
}) {
  return selfId > memberId;
}

const defaultPeer = createPeer();

const AUDIO_TRANSCEIVERS_MID = "0";
const VIDEO_TRANSCEIVERS_MID = "1";

function usePeer({
  sessionId,
  onConnectionStateChange,
  selfStream,
  memberId,
  selfId,
}: {
  sessionId?: ISession.Id;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  selfStream: MediaStream | null;
  memberId?: number;
  selfId?: number;
}) {
  const logger = useLogger();
  const { socket } = useSocket();
  const [activePeer, setActivePeer] = useState<RTCPeerConnection>(defaultPeer);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");
  const [iceGatheringState, setIceGatheringState] =
    useState<RTCIceGatheringState>("new");
  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState>("new");
  const [reconnecting, setReconnecting] = useState<boolean>(false);

  const onConnectionStateChangeRef = useRef(onConnectionStateChange);

  useEffect(() => {
    onConnectionStateChangeRef.current = onConnectionStateChange;
  });

  const restartPeer = useCallback(() => {
    activePeer.close();
    setActivePeer(createPeer());
  }, [activePeer]);

  const announceIncomingOffer = useCallback(() => {
    if (!socket || !sessionId) return;
    console.log("Announcing an incoming offer.");
    socket.emit(Wss.ClientEvent.AnnounceIncomingOffer, { sessionId });
  }, [sessionId, socket]);

  const createOffer = useCallback(async () => {
    activePeer.close();
    const peer = createPeer();

    if (!sessionId || !socket) return;
    // Must be done before creating the offer
    // Audio transceiver must be added before the video transceiver.
    peer.addTransceiver("audio");
    peer.addTransceiver("video");
    const offer = await peer.createOffer(offerOptions);
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    logger.log(`Created an offer (${offer.type})`);

    const localDescription = peer.localDescription;
    if (!localDescription)
      return logger.log("Invalid state: local dession description is missing.");

    logger.log(`Share session offer (${offer.type})`);
    socket.emit(Wss.ClientEvent.SessionOffer, {
      sessionId,
      offer: localDescription,
    });

    setActivePeer(peer);
  }, [activePeer, logger, sessionId, socket]);

  // ==================== Errors ====================

  // Ref: https://www.webrtc-developers.com/oups-i-got-an-ice-error-701/
  const onIceCandidateError = useCallback(
    (event: RTCPeerConnectionIceErrorEvent) => {
      logger.log(
        `Ice Candidate Error: ${event.errorText} (${event.errorCode})`,
        event
      );
    },
    [logger]
  );

  useEffect(() => {
    activePeer.addEventListener("icecandidateerror", onIceCandidateError);

    return () => {
      activePeer.removeEventListener("icecandidateerror", onIceCandidateError);
    };
  }, [activePeer, onIceCandidateError]);

  const recoverConnection = useCallback(async () => {
    if (!socket || !sessionId || !memberId || !selfId || reconnecting) return;
    setReconnecting(true);

    const pong = new Promise<boolean>((resolve) => {
      socket.on(Wss.ServerEvent.PongSessionMember, ({ userId }) =>
        resolve(userId === selfId)
      );

      setTimeout(() => resolve(false), 5_000);
    });

    const delivered = await new Promise<boolean>((resolve) => {
      socket.emit(
        Wss.ClientEvent.PingSessionMember,
        {
          sessionId,
          userId: memberId,
        },
        (ack) => {
          if (!ack) return;
          resolve(true);
        }
      );

      setTimeout(() => resolve(false), 5_000);
    });

    if (!delivered) {
      setReconnecting(false);
      return logger.log(
        `Ping event timeout, never received an acknowledgment from the server. Current user might be disconnected from the server. Once the connection is re-established, the negotiation will start again.`
      );
    }

    const isOtherMemberPresent = await pong;

    if (isOtherMemberPresent) {
      const shareOffer = shouldShareOffer({ selfId, memberId });
      logger.log(
        `Other member is still in the room (verified). Share offer: ${shareOffer}`
      );
      if (shareOffer) announceIncomingOffer();
      else logger.log("The other member should send an offer announcement");
    } else
      logger.log(
        "No response from the other member. Properly having a network issue. When back online, he will be the one who start the session (create the offer)."
      );

    setReconnecting(false);
  }, [
    announceIncomingOffer,
    logger,
    memberId,
    reconnecting,
    selfId,
    sessionId,
    socket,
  ]);

  // ==================== State ====================

  const onConnectionStateChangeInternal = useCallback(async () => {
    const state = activePeer.connectionState;
    if (!state) return;
    logger.log("Peer connection state:", state);
    setConnectionState(state);
    // Analyise connection state failure
    if (!sessionId || !memberId || !selfId || !socket) return;
    if (state === "failed" && !reconnecting) recoverConnection();
  }, [
    activePeer,
    logger,
    memberId,
    reconnecting,
    recoverConnection,
    selfId,
    sessionId,
    socket,
  ]);

  const onIceConnectionStateChange = useCallback(async () => {
    const state = activePeer.iceConnectionState;
    if (!state) return;
    setIceConnectionState(state);
    logger.log("Ice connection state:", state);
    if (state === "failed" || state === "disconnected") {
      // Ref: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Session_lifetime#ice_restart
      logger.log("Restart ice");
      activePeer.setConfiguration({ iceServers });
      activePeer.restartIce();
    }
    if (state === "disconnected" && !reconnecting) recoverConnection();
  }, [activePeer, logger, reconnecting, recoverConnection]);

  const onIceGatheringStateChange = useCallback(() => {
    const state = activePeer.iceGatheringState;
    if (!state) return;
    logger.log("ICE gathering state:", state);
    setIceGatheringState(state);
  }, [activePeer.iceGatheringState, logger]);

  const onSignalingStateChange = useCallback(() => {
    const state = activePeer.signalingState;
    logger.log("Signaling state:", state || "N/A");
  }, [activePeer.signalingState, logger]);

  useEffect(() => {
    activePeer.addEventListener(
      "connectionstatechange",
      onConnectionStateChangeInternal
    );

    activePeer.addEventListener(
      "icegatheringstatechange",
      onIceGatheringStateChange
    );
    activePeer.addEventListener(
      "iceconnectionstatechange",
      onIceConnectionStateChange
    );

    activePeer.addEventListener("signalingstatechange", onSignalingStateChange);

    return () => {
      activePeer.removeEventListener(
        "connectionstatechange",
        onConnectionStateChangeInternal
      );

      activePeer.removeEventListener(
        "icegatheringstatechange",
        onIceGatheringStateChange
      );
      activePeer.removeEventListener(
        "iceconnectionstatechange",
        onIceConnectionStateChange
      );

      activePeer.removeEventListener(
        "signalingstatechange",
        onSignalingStateChange
      );
    };
  }, [
    activePeer,
    onConnectionStateChange,
    onConnectionStateChangeInternal,
    onIceConnectionStateChange,
    onIceGatheringStateChange,
    onSignalingStateChange,
  ]);

  // ==================== Handle streams ====================

  const replaceStream = useCallback(
    (stream: MediaStream) => {
      if (!activePeer) return;
      const [audioTrack] = stream.getAudioTracks();
      const [videoTrack] = stream.getVideoTracks();
      const transceivers = activePeer.getTransceivers();

      for (const transceiver of transceivers) {
        if (transceiver.mid === AUDIO_TRANSCEIVERS_MID && audioTrack)
          transceiver.sender.replaceTrack(audioTrack);

        if (transceiver.mid === VIDEO_TRANSCEIVERS_MID && videoTrack)
          transceiver.sender.replaceTrack(videoTrack);
      }
    },
    [activePeer]
  );

  const onTrack = useCallback(
    ({ track, transceiver }: RTCTrackEvent) => {
      // todo: use refs
      if (!selfStream)
        return logger.error(
          "Current user stream is not yet defined; should never happen."
        );

      logger.log(`Received track: ${track.kind}`, {
        capabilities: track.getCapabilities(),
        constraint: track.getConstraints(),
        settings: track.getSettings(),
      });

      const transceiverKind = track.kind;
      const [audioTrack] = selfStream.getAudioTracks();
      const [videoTrack] = selfStream.getVideoTracks();

      if (audioTrack && transceiverKind === "audio")
        transceiver.sender.replaceTrack(audioTrack);

      if (videoTrack && transceiverKind === "video")
        transceiver.sender.replaceTrack(videoTrack);

      setStream((prevStream) => {
        const prevAudioTracks = prevStream?.getAudioTracks() || [];
        const prevVideoTracks = prevStream?.getVideoTracks() || [];
        if (transceiverKind === "audio")
          return new MediaStream([...prevVideoTracks, track]);
        return new MediaStream([...prevAudioTracks, track]);
      });
    },
    [logger, selfStream]
  );

  useEffect(() => {
    activePeer.addEventListener("track", onTrack);
    return () => {
      activePeer.removeEventListener("track", onTrack);
    };
  }, [onTrack, activePeer]);

  // ==================== Signaling ====================

  const onLocalIceCandidate = useCallback(
    (event: RTCPeerConnectionIceEvent) => {
      const candidate = event.candidate;
      if (candidate === null) console.log(`Got a null candidate, Done.`);

      if (!candidate || !socket || !sessionId) return;

      console.log(
        `Share ice candidate: ${candidate.type}/${candidate.protocol}\n${candidate.candidate}`
      );
      socket.emit(Wss.ClientEvent.IceCandidate, {
        candidate: event.candidate.toJSON(),
        sessionId,
      });
    },
    [sessionId, socket]
  );

  const onSessionOffer = useCallback(
    async ({ offer }: Wss.EventPayload<Wss.ServerEvent.SessionOffer>) => {
      logger.log(`Received an offer (${offer.type})`);
      if (!sessionId || !socket) return;
      await activePeer.setRemoteDescription(offer);

      // must be done before creating the answer
      const transceivers = activePeer.getTransceivers();

      for (const transceiver of transceivers)
        transceiver.direction = "sendrecv";

      const answer = await activePeer.createAnswer();
      await activePeer.setLocalDescription(answer);

      if (!activePeer.canTrickleIceCandidates)
        logger.error("Remote peer doesn't trickle ice");

      logger.log(`Share session answer (${answer.type})`);
      socket.emit(Wss.ClientEvent.SessionAnswer, { sessionId, answer });
      setActivePeer(activePeer);
    },
    [activePeer, logger, sessionId, socket]
  );

  const onSessionAnswer = useCallback(
    async ({ answer }: Wss.EventPayload<Wss.ServerEvent.SessionAnswer>) => {
      logger.log(`Received an answer (${answer.type})`);
      await activePeer.setRemoteDescription(answer);
      if (!activePeer.canTrickleIceCandidates)
        logger.error("Remote peer doesn't trickle ice");
    },
    [logger, activePeer]
  );

  const onRemoteIceCandidate = useCallback(
    ({ candidate }: Wss.EventPayload<Wss.ServerEvent.IceCandidate>) => {
      logger.log(`Received an ice candidate`);
      // cache ice candicates and consume it when the remote description is set.
      if (!activePeer.remoteDescription) return;
      activePeer.addIceCandidate(candidate);
    },
    [activePeer, logger]
  );

  const onPingSessionMember = useCallback(
    ({ userId }: Wss.EventPayload<Wss.ServerEvent.PingSessionMember>) => {
      if (userId !== selfId || !sessionId || !memberId) return;
      logger.log("Got a ping, respond with pong");
      if (shouldShareOffer({ selfId, memberId }) && !reconnecting)
        announceIncomingOffer();
      socket?.emit(Wss.ClientEvent.PongSessionMember, {
        sessionId,
        userId: memberId,
      });
    },
    [
      announceIncomingOffer,
      logger,
      memberId,
      reconnecting,
      selfId,
      sessionId,
      socket,
    ]
  );

  const onAnnounceIncomingOffer = useCallback(() => {
    if (!socket || !sessionId) return;
    console.log(
      "Received an offer announcement; Resting my peer connection to be ready to accept the offer."
    );
    // Rest current peer to be ready to accept the incoming offer.
    activePeer.close();
    setActivePeer(createPeer());
    // Notify my peer that I am ready to accept his offer.
    socket.emit(Wss.ClientEvent.PeerReadyToReceiveOffer, { sessionId });
  }, [activePeer, sessionId, socket]);

  const onPeerReadyToReceiveOffer = useCallback(() => {
    if (!socket || !sessionId) return;
    console.log("Peer is ready to accept my offer; creating an offer...");
    createOffer();
  }, [createOffer, sessionId, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on(Wss.ServerEvent.SessionOffer, onSessionOffer);
    socket.on(Wss.ServerEvent.SessionAnswer, onSessionAnswer);
    socket.on(Wss.ServerEvent.IceCandidate, onRemoteIceCandidate);
    socket.on(Wss.ServerEvent.PingSessionMember, onPingSessionMember);
    socket.on(Wss.ServerEvent.AnnounceIncomingOffer, onAnnounceIncomingOffer);
    socket.on(
      Wss.ServerEvent.PeerReadyToReceiveOffer,
      onPeerReadyToReceiveOffer
    );
    return () => {
      socket.off(Wss.ServerEvent.SessionOffer, onSessionOffer);
      socket.off(Wss.ServerEvent.SessionAnswer, onSessionAnswer);
      socket.off(Wss.ServerEvent.IceCandidate, onRemoteIceCandidate);
      socket.off(Wss.ServerEvent.PingSessionMember, onPingSessionMember);
      socket.off(
        Wss.ServerEvent.PeerReadyToReceiveOffer,
        onPeerReadyToReceiveOffer
      );
      socket.off(
        Wss.ServerEvent.AnnounceIncomingOffer,
        onAnnounceIncomingOffer
      );
    };
  }, [
    onAnnounceIncomingOffer,
    onPeerReadyToReceiveOffer,
    onPingSessionMember,
    onRemoteIceCandidate,
    onSessionAnswer,
    onSessionOffer,
    socket,
  ]);

  useEffect(() => {
    activePeer.addEventListener("icecandidate", onLocalIceCandidate);

    return () => {
      activePeer.removeEventListener("icecandidate", onLocalIceCandidate);
    };
  }, [onLocalIceCandidate, activePeer]);

  // ==================== Cleanup ====================

  const close = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    activePeer.close();
  }, [activePeer, stream]);

  return {
    stream,
    connectionState,
    iceGatheringState,
    iceConnectionState,
    createOffer,
    replaceStream,
    close,
    createPeer,
    restartPeer,
    announceIncomingOffer,
  };
}

type SessionV5Payload = {
  selfId?: number;
  sessionId?: ISession.Id;
  memberId?: number;
  onMemberJoin?(userId: number): void;
  onMemberLeave?(userId: number): void;
};

/**
 * @ref
 *
 * The v5 of the session is based on p2p webrtc, transivers, and socket.io (for
 * signaling).
 *
 * ### Must to read
 * 1. https://hexdocs.pm/ex_webrtc/mastering_transceivers.html
 * 2. https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 * 3. https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
 * 4. https://www.webrtc-developers.com/getusermedia-constraints-explained/
 * 5. https://webrtchacks.com/getusermedia-resolutions-3/
 * 6. https://www.webrtc-developers.com/getusermedia-constraints-explained/#applying-new-constraints
 * 7. https://blog.addpipe.com/getusermedia-video-constraints/
 * 8. https://blog.addpipe.com/common-getusermedia-errors/
 */
export function useSessionV5({
  selfId,
  memberId,
  sessionId,
  onMemberJoin,
  onMemberLeave,
}: SessionV5Payload) {
  const onMemberJoinRef = useRef(onMemberJoin);
  const onMemberLeaveRef = useRef(onMemberLeave);

  useEffect(() => {
    onMemberJoinRef.current = onMemberJoin;
    onMemberLeaveRef.current = onMemberLeave;
  });

  const logger = useLogger();
  const userMedia = useUserMedia();
  const peer = usePeer({
    sessionId,
    selfStream: userMedia.stream,
    memberId,
    selfId,
  });
  const { notifyCamera, notifyMic } = useNotifyState(sessionId);
  const member = useMemberState({ memberId, stream: peer.stream });
  const manager = useSessionManager({
    selfId,
    sessionId,
    onJoin(userId) {
      onMemberJoin?.(userId);
      if (!selfId || selfId === userId) return;
      // Share audio and video status when the other member joins.
      notifyCamera(userMedia.video);
      notifyMic(userMedia.audio);
      logger.log(`${userId} joined the session`);
    },
    onLeave(userId) {
      onMemberLeave?.(userId);
      logger.log(`${userId} left the session: close=${userId === memberId}`);
      logger.log("Closing and reinitialize peer connection");
      if (userId === selfId) return;
      peer.close();
      peer.restartPeer();
    },
    onInitialMembers(userIds) {
      logger.log(`Members:`, userIds);
    },
    onReconnect(members) {
      const otherMember = members.find((member) => member === memberId);
      if (!otherMember || !userMedia.stream) return;
      console.log("Reconnect with the other member");
      peer.announceIncomingOffer();
    },
  });

  useEffect(() => {
    notifyCamera(userMedia.video);
  }, [notifyCamera, userMedia.video]);

  useEffect(() => {
    notifyMic(userMedia.audio);
  }, [notifyMic, userMedia.audio]);

  const join = useCallback(async () => {
    if (!memberId) return;
    manager.join();
    const otherMemberJoined = manager.members.includes(memberId);
    if (otherMemberJoined) await peer.announceIncomingOffer();
  }, [manager, memberId, peer]);

  // ==================== Leave ====================

  const leave = useCallback(() => {
    peer.close();
    userMedia.stop();
    manager.leave();
  }, [peer, userMedia, manager]);

  const leaveRef = useRef<Void>(leave);

  useEffect(() => {
    leaveRef.current = leave;
  });

  useEffect(() => {
    return () => {
      leaveRef.current();
    };
  }, []);

  return {
    peer,
    userMedia,
    member,
    manager,
    join,
    leave,
  };
}

// ================================== Session V6 ==============================================

function initPeer() {
  const peer = new RTCPeerConnection({ iceServers });
  peer.addTransceiver("audio");
  peer.addTransceiver("video");
  return peer;
}

const peer = initPeer();

function usePeerV6() {
  const logger = useLogger();
  const { socket } = useEchoSocket();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [populatedTransceivers, setPopulatedTransceivers] =
    useState<boolean>(false);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");
  const [iceGatheringState, setIceGatheringState] =
    useState<RTCIceGatheringState>("new");
  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState>("new");

  // ==================== renegotiation ====================
  const onNegotiationNeeded = useCallback(async () => {
    logger.log("negotiation needed");
    const offer = await peer.createOffer({ iceRestart: true });
    await peer.setLocalDescription(offer);
    if (!peer.localDescription)
      return logger.error(
        "missing peer connection local description, should never happen"
      );
    socket?.emit(ClientMessageType.Offer, peer.localDescription);
  }, [logger, socket]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", onNegotiationNeeded);

    return () => {
      peer.removeEventListener("negotiationneeded", onNegotiationNeeded);
    };
  }, [onNegotiationNeeded]);

  // ==================== offers/answers/candidates/connect ====================

  const onOpen = useCallback(() => {
    // start the negotiation once the socket is open
    onNegotiationNeeded();
  }, [onNegotiationNeeded]);

  const onAnswer = useCallback(
    (sd: ServerMessageValue<ServerMessageType.Answer>) => {
      peer.setRemoteDescription(sd);
    },
    []
  );

  const onOffer = useCallback(
    async (sd: ServerMessageValue<ServerMessageType.Offer>) => {
      peer.setRemoteDescription(sd);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      if (!peer.localDescription)
        return logger.error(
          "missing peer connection local description, should never happen"
        );
      socket?.emit(ClientMessageType.Answer, peer.localDescription);
    },
    [logger, socket]
  );

  const onCanidate = useCallback(
    (candidate: ServerMessageValue<ServerMessageType.Candidate>) => {
      peer.addIceCandidate(candidate);
    },
    []
  );

  const onMemberLeft = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  useEffect(() => {
    socket?.on(ServerMessageType.Answer, onAnswer);
    socket?.on(ServerMessageType.Offer, onOffer);
    socket?.on(ServerMessageType.Candidate, onCanidate);
    socket?.on(ServerMessageType.MemberLeft, onMemberLeft);
    socket?.on("open", onOpen);
    return () => {
      socket?.off(ServerMessageType.Answer, onAnswer);
      socket?.off(ServerMessageType.Offer, onOffer);
      socket?.off(ServerMessageType.Candidate, onCanidate);
      socket?.off(ServerMessageType.MemberLeft, onMemberLeft);
      socket?.off("open", onOpen);
    };
  }, [onAnswer, onCanidate, onMemberLeft, onOffer, onOpen, socket]);

  // ==================== streams/tracks ====================

  const addStream = useCallback((stream: MediaStream) => {
    const [audioTrack] = stream.getAudioTracks();
    const [videoTrack] = stream.getVideoTracks();
    const transceivers = peer.getTransceivers();

    for (const transceiver of transceivers) {
      if (transceiver.mid === AUDIO_TRANSCEIVERS_MID && audioTrack)
        transceiver.sender.replaceTrack(audioTrack);

      if (transceiver.mid === VIDEO_TRANSCEIVERS_MID && videoTrack)
        transceiver.sender.replaceTrack(videoTrack);
    }

    setPopulatedTransceivers(true);
  }, []);

  const onTrack = useCallback(
    ({ track }: RTCTrackEvent) => {
      logger.log(`Received ${track.kind} track`);

      setStream((prevStream) => {
        const prevAudioTracks = prevStream?.getAudioTracks() || [];
        const prevVideoTracks = prevStream?.getVideoTracks() || [];
        if (track.kind === "audio")
          return new MediaStream([...prevVideoTracks, track]);
        return new MediaStream([...prevAudioTracks, track]);
      });
    },
    [logger]
  );

  useEffect(() => {
    peer.addEventListener("track", onTrack);
    return () => {
      peer.removeEventListener("track", onTrack);
    };
  }, [onTrack]);

  // ==================== Errors ====================

  // ref: https://www.webrtc-developers.com/oups-i-got-an-ice-error-701/
  const onIceCandidateError = useCallback(
    (event: RTCPeerConnectionIceErrorEvent) => {
      logger.log(
        `Ice Candidate Error: ${event.errorText} (${event.errorCode})`,
        event
      );
    },
    [logger]
  );

  useEffect(() => {
    peer.addEventListener("icecandidateerror", onIceCandidateError);

    return () => {
      peer.removeEventListener("icecandidateerror", onIceCandidateError);
    };
  }, [onIceCandidateError]);

  // ==================== peer state (connection, ice, signaling, ...etc) ====================

  const onConnectionStateChange = useCallback(async () => {
    const state = peer.connectionState;
    if (!state) return;
    logger.log("peer connection state:", state);
    setConnectionState(state);
  }, [logger]);

  const onIceConnectionStateChange = useCallback(async () => {
    const state = peer.iceConnectionState;
    if (!state) return;
    setIceConnectionState(state);
    logger.log("ice connection state:", state);
    if (state === "failed" || state === "disconnected") {
      // Ref: https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Session_lifetime#ice_restart
      logger.log("restart ice");
      peer.restartIce();
    }
  }, [logger]);

  const onIceGatheringStateChange = useCallback(() => {
    const state = peer.iceGatheringState;
    if (!state) return;
    logger.log("ice gathering state:", state);
    setIceGatheringState(state);
  }, [logger]);

  const onSignalingStateChange = useCallback(() => {
    const state = peer.signalingState;
    logger.log("signaling state:", state || "N/A");
  }, [logger]);

  useEffect(() => {
    peer.addEventListener("connectionstatechange", onConnectionStateChange);
    peer.addEventListener("icegatheringstatechange", onIceGatheringStateChange);
    peer.addEventListener(
      "iceconnectionstatechange",
      onIceConnectionStateChange
    );
    peer.addEventListener("signalingstatechange", onSignalingStateChange);

    return () => {
      peer.removeEventListener(
        "connectionstatechange",
        onConnectionStateChange
      );

      peer.removeEventListener(
        "icegatheringstatechange",
        onIceGatheringStateChange
      );
      peer.removeEventListener(
        "iceconnectionstatechange",
        onIceConnectionStateChange
      );

      peer.removeEventListener("signalingstatechange", onSignalingStateChange);
    };
  }, [
    onConnectionStateChange,
    onIceConnectionStateChange,
    onIceGatheringStateChange,
    onSignalingStateChange,
  ]);

  // ==================== cleanup ====================

  const close = useCallback(() => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    peer.close();
  }, [stream]);

  return {
    stream,
    populatedTransceivers,
    iceConnectionState,
    iceGatheringState,
    connectionState,
    addStream,
    close,
  };
}

function useMemberStateV6(stream: MediaStream | null) {
  const { socket } = useEchoSocket();
  const [video, setVideo] = useState<boolean>(false);
  const [audio, setAudio] = useState<boolean>(false);
  const speaking = useSpeakingV3(stream);

  const onToggleVideo = useCallback(
    ({ video }: ServerMessageValue<ServerMessageType.ToggleVideo>) => {
      console.log("toggle video..");
      setVideo(video);
    },
    []
  );

  const onToggleAudio = useCallback(
    ({ audio }: ServerMessageValue<ServerMessageType.ToggleAudio>) => {
      console.log("toggle audio..");
      setAudio(audio);
    },
    []
  );

  useEffect(() => {
    socket?.on(ServerMessageType.ToggleVideo, onToggleVideo);
    socket?.on(ServerMessageType.ToggleAudio, onToggleAudio);
    return () => {
      socket?.off(ServerMessageType.ToggleVideo, onToggleVideo);
      socket?.off(ServerMessageType.ToggleAudio, onToggleAudio);
    };
  }, [onToggleAudio, onToggleVideo, socket]);

  return { audio, video, speaking };
}

function useNotifyStateV6() {
  const { socket, connected } = useEchoSocket();

  const toggleVideo = useCallback(
    (video: boolean) => {
      if (!connected) return;
      socket?.emit(ClientMessageType.ToggleVideo, video);
    },
    [connected, socket]
  );

  const toggleAudio = useCallback(
    (audio: boolean) => {
      if (!connected) return;
      socket?.emit(ClientMessageType.ToggleAudio, audio);
    },
    [connected, socket]
  );

  return {
    toggleAudio,
    toggleVideo,
  };
}

export function useSessionV6() {
  const {
    socket,
    connecting: socketConnecting,
    connected: socketConnected,
  } = useEchoSocket();
  const userMedia = useUserMedia();
  const peer = usePeerV6();
  const member = useMemberStateV6(peer.stream);
  const notifyState = useNotifyStateV6();

  const toggleVideo = useCallback(() => {
    const video = userMedia.video;
    userMedia.toggleCamera();
    notifyState.toggleVideo(!video);
  }, [notifyState, userMedia]);

  const toggleAudio = useCallback(() => {
    const audio = userMedia.audio;
    userMedia.toggleMic();
    notifyState.toggleAudio(!audio);
  }, [notifyState, userMedia]);

  const join = useCallback(() => {
    const stream = userMedia.stream;
    if (!stream) return;
    peer.addStream(stream);
    notifyState.toggleAudio(userMedia.audio);
    notifyState.toggleVideo(userMedia.video);
  }, [notifyState, peer, userMedia.audio, userMedia.stream, userMedia.video]);

  const leave = useCallback(() => {
    peer.close();
    userMedia.stop();
    socket?.close(1000, "user left the session");
  }, [peer, socket, userMedia]);

  return {
    userMedia,
    peer,
    socketConnecting,
    socketConnected,
    member,
    leave,
    join,
    toggleAudio,
    toggleVideo,
  };
}

export function useGetSessionToken(sessionId?: ISession.Id) {
  const api = useApi();

  const getSessionToken = useCallback(() => {
    if (!sessionId) return null;
    return api.session.getToken({ sessionId });
  }, [api.session, sessionId]);

  return useExtendedQuery({
    queryFn: getSessionToken,
    queryKey: [QueryKey.GetSessionToken, sessionId],
    enabled: !!sessionId,
  });
}

export function useUserMediaV2(): UseUserMediaReturn {
  const logger = useLogger();
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [mic, setMic] = useState<boolean>(false);
  const [camera, setCamera] = useState<boolean>(false);
  const [audio, setAudio] = useState<boolean>(false);
  const [video, setVideo] = useState<boolean>(false);
  const [denied, setUserDenied] = useState<boolean>(false);

  const getUserMedia = useCallback(async (): Promise<Error | MediaStream> => {
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints
    // Ref: https://www.webrtc-developers.com/getusermedia-constraints-explained/
    // Ref: https://webrtchacks.com/getusermedia-resolutions-3/
    // Ref: https://www.webrtc-developers.com/getusermedia-constraints-explained/#applying-new-constraints
    // Ref: https://blog.addpipe.com/getusermedia-video-constraints/
    // Ref: https://blog.addpipe.com/common-getusermedia-errors/
    return await safePromise(
      navigator.mediaDevices.getUserMedia({
        audio: {
          noiseSuppression: true,
          echoCancellation: true, // Optional: Enable echo cancellation
        },
        video: {
          width: 1280,
          height: 720,
        },
      })
    );
  }, []);

  const stop = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
    setCamera(false);
    setMic(false);
    setVideo(false);
    setAudio(false);
  }, [stream]);

  const capture = useCallback(async () => {
    setLoading(true);
    const capturedStream = await getUserMedia();
    const error = capturedStream instanceof Error;
    if (error) logger.error(capturedStream);

    // stopping the previous stream incase we got a new stream.
    if (!error) stop();
    if (error && isNotAllowed(capturedStream)) setUserDenied(true);
    setError(error ? capturedStream : null);
    if (!error) setStream(capturedStream);
    setLoading(false);
    return capturedStream;
  }, [getUserMedia, logger, stop]);

  const toggleMic = useCallback(() => {
    if (!stream) return;
    const [track] = stream.getAudioTracks();
    if (!track) return;
    track.enabled = !track.enabled;
    setAudio(track.enabled);
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (!stream) return;
    const [track] = stream.getVideoTracks();
    if (!track) return;
    track.enabled = !track.enabled;
    setVideo(track.enabled);
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
  }, [stream]);

  const hasVideoTracks = useMemo(() => {
    return !isEmpty(stream?.getVideoTracks());
  }, [stream]);

  const hasAudioTracks = useMemo(() => {
    return !isEmpty(stream?.getAudioTracks());
  }, [stream]);

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
    hasVideoTracks,
    hasAudioTracks,
  };
}
