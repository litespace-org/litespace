import { ISession, Void, Wss } from "@litespace/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { safe } from "@litespace/utils/error";
import { MediaConnection, PeerError } from "peerjs";
import zod from "zod";
import hark from "hark";
import { concat, isEmpty, uniq } from "lodash";
import { useServer } from "@/server";
import { peers } from "@litespace/atlas";
import { Peer } from "peerjs";
import { useApi } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";
import { Context } from "@/socket/context";

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
    video?: boolean,
    /**
     * @default false
     */
    silent?: boolean
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

export function useUserMedia(
  onStop?: Void,
  onError?: (error: Error) => void
): UseUserMediaReturn {
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
            audio: {
              noiseSuppression: true,
              echoCancellation: true, // Optional: Enable echo cancellation
            },
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
    async (video?: boolean, silent: boolean = false) => {
      setLoading(true);
      const capturedStream = await getUserMedia(video);
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
        setLoading(false);
        return capturedStream;
      }

      if (error && onError && !silent) onError(capturedStream);
      setError(error ? capturedStream : null);
      setStream(error ? null : capturedStream);
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
    [getUserMedia, onError, stop]
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

function usePeer(userId?: number) {
  const { server } = useServer();
  const [ready, setReady] = useState<boolean>(false);

  const peer = useMemo(() => {
    if (!userId) return null;
    console.debug("peer updated!");
    const peerServer = peers[server];
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
  }, [onClose, onError, onOpen, peer]);

  // on unmount
  useEffect(
    () => () => {
      if (!peer) return;
      peer.off("open");
      peer.off("close");
      peer.off("error");
    },
    [peer]
  );

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
  socket: Context,
  otherMemberId?: number,
  sessionId?: ISession.Id
) {
  const [otherMemberVideo, setOtherMemberVideo] = useState<boolean>(false);
  const [otherMemberAudio, setOtherMemberAudio] = useState<boolean>(false);

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

  const flush = useCallback(() => {
    setOtherMemberAudio(false);
    setOtherMemberVideo(false);
  }, [setOtherMemberVideo, setOtherMemberAudio]);

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.CameraToggled, onCameraToggle);
    socket.on(Wss.ServerEvent.MicToggled, onMicToggle);
  }, [onCameraToggle, onMicToggle, socket]);

  // on unmount
  useEffect(
    () => () => {
      if (!socket) return;
      socket.off(Wss.ServerEvent.CameraToggled);
      socket.off(Wss.ServerEvent.MicToggled);
    },
    [socket]
  );

  return {
    notifyCameraToggle,
    notifyMicToggle,
    otherMemberAudio,
    otherMemberVideo,
    flush,
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
  socket: Context | null;
  sessionId?: ISession.Id;
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
  socket,
  userIds,
  sessionId,
  onUserMediaStreamError,
}: SessionV3Payload) {
  if (!socket) {
    console.warn("useSessionV3: failed; socket is null!");
  }
  const { peer, ready } = usePeer(userIds.current);

  const [otherMemberStream, setOtherMemberStream] =
    useState<MediaStream | null>(null);
  const [otherMemberScreenStream, setOtherMemberScreenStream] =
    useState<MediaStream | null>(null);
  const [isMainCallOn, setIsMainCallOn] = useState<boolean>(false);
  const [mainCall, setMainCall] = useState<MediaConnection | null>(null);
  const [screenCall, setScreenCall] = useState<MediaConnection | null>(null);

  const {
    notifyCameraToggle,
    notifyMicToggle,
    otherMemberAudio,
    otherMemberVideo,
    flush,
  } = useSessionEvents(socket!, userIds.other, sessionId);

  const otherMemberSpeaking = useSpeakingV3(otherMemberStream);

  const flushStates = useCallback(() => {
    setOtherMemberStream(null);
    setOtherMemberScreenStream(null);
    setIsMainCallOn(false);
    setMainCall(null);
    setScreenCall(null);
    flush();
  }, [flush]);

  const sessionManager = useSessionMembers(
    useMemo(
      () => ({
        socket: socket!,
        sessionId,
        currentUserId: userIds.current,
        onLeave: () => {
          mainCall?.close();
          screenCall?.close();
          flushStates();
        },
      }),
      [socket, mainCall, screenCall, sessionId, userIds, flushStates]
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

  const userMedia = useUserMedia(onUserMediaStreamStop, onUserMediaStreamError);
  const screen = useShareScreen(onScreenStreamStop);

  /**
   * Handler the main call stream event.
   */
  const onMainCallStream = useCallback((stream: MediaStream) => {
    console.debug("Got a main call stream.");
    setOtherMemberStream(stream);
    setIsMainCallOn(true);
  }, []);

  /**
   * Handler for the main call close event.
   */
  const onMainCallClose = useCallback(() => {
    console.debug("Close main call.");
    setOtherMemberStream(null);
    setMainCall(null);
    setIsMainCallOn(false);
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
      setIsMainCallOn(true);
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
    if (peer) {
      console.debug("peer disconnecting...");
      peer.disconnect();
      peer.destroy();
      console.debug("peer destroyed.");
    }
  }, [mainCall, screen, screenCall, sessionManager, userMedia, peer]);

  // listen for calls
  useEffect(() => {
    if (!peer) return;
    peer.on("call", onCall);
  }, [onCall, peer]);

  // on unmount
  useEffect(
    () => () => {
      if (!peer) return;
      peer.off("call", (call: MediaConnection) => call.close());
    },
    [peer]
  );

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
    if (screen.stream) {
      const shouldCall =
        isMainCallOn &&
        sessionManager.joined &&
        isOtherMemberJoined &&
        !screenCall &&
        !!screen.stream;

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

      if (!shouldCall) return;
      call({
        userId: userIds.other!,
        stream: screen.stream,
        screen: true,
      });
    } else {
      const shouldCall =
        !isMainCallOn &&
        sessionManager.joined &&
        isOtherMemberJoined &&
        !!userMedia.stream;

      console.debug({
        title: "Call the other member",
        src: "useSessionV3.useEffect",
        shouldCall: shouldCall,
        other: userIds.other,
        stream: userMedia.stream,
        isOtherMemberJoined,
        isMainCallOn,
      });

      if (!shouldCall) return;
      call({
        userId: userIds.other!,
        stream: userMedia.stream!,
      });
    }
  }, [
    call,
    sessionManager.joined,
    isOtherMemberJoined,
    isMainCallOn,
    userMedia.stream,
    screen.stream,
    screenCall,
    userIds.other,
  ]);

  useEffect(() => {
    if (isOtherMemberJoined) {
      notifyCameraToggle(userMedia.video);
    }
  }, [notifyCameraToggle, userMedia.video, isOtherMemberJoined]);

  useEffect(() => {
    if (isOtherMemberJoined) {
      notifyMicToggle(userMedia.audio);
    }
  }, [notifyMicToggle, userMedia.audio, isOtherMemberJoined]);

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
export function useSessionMembers({
  socket,
  sessionId,
  currentUserId,
  onLeave,
}: {
  socket: Context;
  sessionId?: ISession.Id;
  currentUserId?: number;
  onLeave: Void;
}) {
  const api = useApi();

  const [members, setMembers] = useState<number[]>([]);
  const [listening, setListening] = useState<boolean>(false);
  const [joining, setJoining] = useState<boolean>(false);

  const joined = useMemo(
    () => !!currentUserId && members.includes(currentUserId),
    [currentUserId, members]
  );

  const findSessionMembers = useCallback(async () => {
    if (!sessionId) return [];
    return await api.session.findMembers(sessionId);
  }, [api.session, sessionId]);

  const sessionMembersQuery = useQuery({
    queryFn: findSessionMembers,
    queryKey: [QueryKey.FindSessionMembers, sessionId],
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
    refetchInterval: false,
  });

  useEffect(() => {
    if (sessionMembersQuery.data)
      setMembers((prev) => uniq([...prev, ...sessionMembersQuery.data]));
  }, [sessionMembersQuery.data]);

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
    onLeave();
  }, [sessionId, socket, onLeave]);

  const onJoinSession = useCallback(
    ({ userId }: { userId: number }) => {
      console.debug(`${userId} joined the session`);
      if (currentUserId === userId) setJoining(false);
      setMembers((prev) => uniq([...prev, userId]));
    },
    [currentUserId]
  );

  const onLeaveSession = useCallback(
    ({ userId }: { userId: number }) => {
      console.debug(`${userId} left the session`);
      if (currentUserId === userId) setJoining(false);
      setMembers((prev) => [...prev].filter((member) => member !== userId));
    },
    [currentUserId]
  );

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.MemberJoinedSession, onJoinSession);
    socket.on(Wss.ServerEvent.MemberLeftSession, onLeaveSession);
  }, [onJoinSession, onLeaveSession, socket]);

  // on unmount
  useEffect(
    () => () => {
      if (!socket) return;
      socket.off(Wss.ServerEvent.MemberJoinedSession);
      socket.off(Wss.ServerEvent.MemberLeftSession);
    },
    [socket]
  );

  useEffect(() => {
    if (!listening) listen();
  }, [listen, listening]);

  return { join, leave, members, listening, joining, joined };
}
