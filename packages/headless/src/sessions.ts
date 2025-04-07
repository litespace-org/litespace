import { ISession, Void, Wss } from "@litespace/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { safe } from "@litespace/utils/error";
import { useSocket } from "@/socket";
import { MediaConnection, PeerError } from "peerjs";
import zod from "zod";
import hark from "hark";
import { concat, first, isEmpty, uniq } from "lodash";
import { useServer } from "@/server";
import { peers as peerServers } from "@litespace/atlas";
import { Peer } from "peerjs";
import { useApi } from "@/api";
import { useQuery } from "@tanstack/react-query";
import { QueryKey } from "@/constants";
import { useEcho } from "@/echo";
import { isAxiosError } from "axios";
import { sleep } from "@litespace/utils";

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
  onUserMediaStreamError,
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

  const userMedia = useUserMedia(onUserMediaStreamStop, onUserMediaStreamError);
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
}: {
  sessionId?: ISession.Id;
  selfId?: number;
  onLeave(userId: number): void;
  onJoin(userId: number): void;
  onInitialMembers(userIds: number[]): void;
}) {
  const socket = useSocket();
  const api = useApi();
  const onLeaveRef = useRef(onLeave);
  const onJoinRef = useRef(onJoin);
  const onInitialMembersRef = useRef(onInitialMembers);

  useEffect(() => {
    onLeaveRef.current = onLeave;
    onJoinRef.current = onJoin;
    onInitialMembersRef.current = onInitialMembers;
  });

  const [members, setMembers] = useState<number[]>([]);
  const [listening, setListening] = useState<boolean>(false);
  const [joining, setJoining] = useState<boolean>(false);

  const joined = useMemo(
    () => !!selfId && members.includes(selfId),
    [members, selfId]
  );

  const hasJoined = useCallback(
    (memberId?: number) => !!memberId && !!members.includes(memberId),
    [members]
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
      if (selfId === userId) setJoining(false);
      setMembers((prev) => uniq([...prev, userId]));
      onJoinRef.current(userId);
    },
    [selfId]
  );

  const onLeaveSession = useCallback(
    ({ userId }: { userId: number }) => {
      if (selfId === userId) setJoining(false);
      setMembers((prev) => [...prev].filter((member) => member !== userId));
      onLeaveRef.current(userId);
    },
    [selfId]
  );

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
      return setMembers((prev) => {
        const members = uniq([...prev, ...sessionMembersQuery.data]);
        onInitialMembersRef.current(members);
        return members;
      });
  }, [sessionMembersQuery.data, sessionMembersQuery.isLoading]);

  return { join, leave, members, listening, joining, joined, hasJoined };
}

// ================================== Session V4 ==============================================

const iceServers: RTCIceServer[] = [
  {
    urls: "stun:stun.litespace.org",
    username: "litespace",
    credential: "litespace",
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

function initPeer(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers });
}

function useProducer({
  selfId,
  onConnectionStateChange,
}: {
  selfId?: number;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
}) {
  const echo = useEcho();
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");
  const [iceGatheringState, setIceGatheringState] =
    useState<RTCIceGatheringState>("new");

  // Refs
  const onConnectionStateChangeRef = useRef(onConnectionStateChange);

  // Ref handlers
  useEffect(() => {
    onConnectionStateChangeRef.current = onConnectionStateChange;
  });

  const produce = useCallback(
    async (stream: MediaStream) => {
      if (!selfId) return Promise.resolve();
      const peer = initPeer();
      const videoTransceiver = peer.addTransceiver("video");
      const audioTransceiver = peer.addTransceiver("audio");
      // Generate offer and set local description
      const offer = await peer.createOffer(offerOptions);
      await peer.setLocalDescription(new RTCSessionDescription(offer));
      // Add stream traks to the peer connection
      const tracks = stream.getTracks();
      tracks.map((track) => {
        if (track.kind === "audio") audioTransceiver.sender.replaceTrack(track);
        else videoTransceiver.sender.replaceTrack(track);
        // peer.addTrack(track, stream)
      });

      peer.addEventListener("icecandidate", (event) => {
        if (event.candidate === null)
          console.log(`Got a null candidate, Connection can be established.`);
      });

      peer.addEventListener("icegatheringstatechange", async () => {
        console.log("ICE gathering state (producer): ", peer.iceGatheringState);

        setIceGatheringState(peer.iceGatheringState);

        if (peer.iceGatheringState !== "complete") return;
        if (peer.connectionState === "connected") return;

        const description = peer.localDescription;
        if (!description)
          throw new Error("Invalid state: missing local session description");

        const desc = await echo.produce({
          sessionDescription: description,
          peerId: selfId,
        });

        peer.setRemoteDescription(new RTCSessionDescription(desc));
      });

      peer.addEventListener("connectionstatechange", () => {
        console.log("Connection state (producer): ", peer.iceConnectionState);
        const state = peer.connectionState;
        onConnectionStateChangeRef.current(state);
        setConnectionState(state);
      });

      setPeer(peer);
    },
    [echo, selfId]
  );

  const close = useCallback(() => {
    peer?.close();
    setConnectionState("new");
    setIceGatheringState("new");
    setPeer(null);
  }, [peer]);

  return { produce, peer, close, connectionState, iceGatheringState };
}

function useConsumer(selfId?: number) {
  const echo = useEcho();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");
  const [iceGatheringState, setIceGatheringState] =
    useState<RTCIceGatheringState>("new");

  const consume = useCallback(
    async (memberId: number) => {
      if (!selfId) return;

      const peer = initPeer();
      peer.addTransceiver("video");

      const offer = await peer.createOffer(offerOptions);
      await peer.setLocalDescription(new RTCSessionDescription(offer));

      peer.addEventListener("icecandidate", (event) => {
        if (event.candidate === null)
          console.log(
            `Got a null candidate, We are ready to stablish a peer connection`
          );
      });

      peer.addEventListener("connectionstatechange", () => {
        const state = peer.connectionState;
        console.log("Connection state: (consumer)", state);
        if (state === "closed" || state === "failed") {
          setStream(null);
          setPeer(null);
        }
      });

      peer.addEventListener("connectionstatechange", () => {
        const state = peer.connectionState;
        console.log("Connection state (producer): ", state);
        setConnectionState(state);
      });

      peer.addEventListener("icegatheringstatechange", async () => {
        console.log("ICE gathering state: (consumer)", peer.iceGatheringState);
        setIceGatheringState(peer.iceGatheringState);

        if (peer.iceGatheringState !== "complete") return;
        if (peer.connectionState === "connected") return;

        while (true) {
          try {
            const description = peer.localDescription;
            if (!description)
              throw new Error(
                "Invalid state: missing local session description"
              );

            const desc = await echo.consume({
              sessionDescription: description,
              peerId: selfId,
              producerPeerId: memberId,
            });

            peer.setRemoteDescription(new RTCSessionDescription(desc));
            break;
          } catch (error) {
            if (!isAxiosError(error) || error.status !== 404) throw error;
            console.log(
              `Producer ${memberId} is not found, will retry in 1 second.`
            );
            await sleep(1_000); // wait for one second before retrying again
          }
        }
      });

      setPeer(peer);
    },
    [echo, selfId]
  );

  // ==================== Handle incoming streams ====================

  const onTrack = useCallback((event: RTCTrackEvent) => {
    const stream = first(event.streams);
    if (!stream) return;
    const tracks = stream.getTracks();
    const count = tracks.length;
    const kind = tracks.map((track) => track.kind).join("+");
    console.log(
      `Received a remote stream with ${count} track(s)\nKind: ${kind}`
    );
    setStream((prev) => {
      if (!prev) return stream;
      return new MediaStream([...prev.getTracks(), ...stream.getTracks()]);
    });
  }, []);

  useEffect(() => {
    peer?.addEventListener("track", onTrack);
    return () => {
      peer?.removeEventListener("track", onTrack);
    };
  }, [onTrack, peer]);

  // ==================== Cleanup ====================

  const close = useCallback(() => {
    peer?.close();
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    setPeer(null);
  }, [peer, stream]);

  return { stream, consume, close, iceGatheringState, connectionState };
}

function useNotifyState(sessionId?: ISession.Id) {
  const socket = useSocket();

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
  const socket = useSocket();
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

type SessionV4Payload = {
  selfId?: number;
  sessionId?: ISession.Id;
  memberId?: number;
};

export function useSessionV4({
  selfId,
  sessionId,
  memberId,
}: SessionV4Payload) {
  const userMedia = useUserMedia();
  const consumer = useConsumer(selfId);
  const { notifyCamera, notifyMic } = useNotifyState(sessionId);
  const member = useMemberState({ memberId, stream: consumer.stream });
  const manager = useSessionManager({
    selfId,
    sessionId,
    onJoin(userId) {
      if (!selfId || selfId === userId) return;
      console.log(`Consume "${userId}" stream`);
      consumer.consume(userId);
    },
    onLeave(userId) {
      console.log(`${userId} left the session close=${userId === memberId}`);
      if (userId === memberId) return consumer.close();
    },
    onInitialMembers(userIds) {
      for (const userId of userIds) {
        if (!selfId || selfId === userId) continue;
        console.log(`Consume "${userId}" stream (intitial)`);
        consumer.consume(userId);
      }
    },
  });

  const producer = useProducer({
    selfId,
    onConnectionStateChange(state) {
      // Join the session when the webrtc connection is established
      if (state === "connected") manager.join();
    },
  });

  useEffect(() => {
    notifyCamera(userMedia.video);
  }, [notifyCamera, userMedia.video]);

  useEffect(() => {
    notifyMic(userMedia.audio);
  }, [notifyMic, userMedia.audio]);

  const leave = useCallback(() => {
    producer.close();
    consumer.close();
  }, [consumer, producer]);

  const join = useCallback(() => {
    const stream = userMedia.stream;
    if (!stream) return;
    producer.produce(stream);
  }, [producer, userMedia.stream]);

  return {
    producer,
    userMedia,
    consumer,
    manager,
    leave,
    join,
    member,
  };
}

// ================================== Session V5 ==============================================

function usePeer({
  sessionId,
  onConnectionStateChange,
}: {
  sessionId?: ISession.Id;
  onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
}) {
  const socket = useSocket();
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState>("new");
  const [iceGatheringState, setIceGatheringState] =
    useState<RTCIceGatheringState>("new");

  const onConnectionStateChangeRef = useRef(onConnectionStateChange);

  useEffect(() => {
    onConnectionStateChangeRef.current = onConnectionStateChange;
  });

  const init = useCallback(
    async (stream: MediaStream, shareOffer: boolean) => {
      if (!sessionId || !socket) return;
      const peer = initPeer();
      const tracks = stream.getTracks();
      tracks.forEach((track) => peer.addTrack(track, stream));
      setPeer(peer);
      if (!shareOffer) return;

      const offer = await peer.createOffer(offerOptions);
      await peer.setLocalDescription(new RTCSessionDescription(offer));
      console.log(`Created an offer (${offer.type})`);

      const localDescription = peer.localDescription;
      if (!localDescription)
        return console.log(
          "Invalid state: local dession description is missing."
        );

      socket?.emit(Wss.ClientEvent.SessionOffer, {
        sessionId,
        offer: localDescription,
      });
    },
    [sessionId, socket]
  );

  const createPeer = useCallback(() => {
    console.log("Create peer connection...");
    setPeer(initPeer());
  }, []);

  const createOffer = useCallback(async () => {
    if (!sessionId || !socket || !peer) return;

    const offer = await peer.createOffer(offerOptions);
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    console.log(`Created an offer (${offer.type})`);

    const localDescription = peer.localDescription;
    if (!localDescription)
      return console.log(
        "Invalid state: local dession description is missing."
      );

    socket.emit(Wss.ClientEvent.SessionOffer, {
      sessionId,
      offer: localDescription,
    });
  }, [peer, sessionId, socket]);

  // ==================== Errors ====================

  const onIceCandidateError = useCallback(
    (event: RTCPeerConnectionIceErrorEvent) => {
      console.log(
        `Ice Candidate Error: ${event.errorText} (${event.errorCode})`
      );
    },
    []
  );

  useEffect(() => {
    peer?.addEventListener("icecandidateerror", onIceCandidateError);

    return () => {
      peer?.removeEventListener("icecandidateerror", onIceCandidateError);
    };
  }, [onIceCandidateError, peer]);

  // ==================== State ====================

  const onConnectionStateChangeInternal = useCallback(() => {
    const state = peer?.connectionState;
    if (!state) return;
    console.log("Peer connection state:", state);
    setConnectionState(state);
    if (state === "closed" || state === "disconnected" || state === "failed")
      setStream(null);
  }, [peer?.connectionState]);

  const onIceConnectionStateChange = useCallback(() => {
    const state = peer?.iceConnectionState;
    if (state === "failed" || state === "disconnected") peer?.restartIce();
  }, [peer]);

  const onIceGatheringStateChange = useCallback(() => {
    const state = peer?.iceGatheringState;
    if (!state) return;
    console.log("ICE gathering state:", state);
    setIceGatheringState(state);
  }, [peer?.iceGatheringState]);

  useEffect(() => {
    peer?.addEventListener(
      "connectionstatechange",
      onConnectionStateChangeInternal
    );

    peer?.addEventListener(
      "icegatheringstatechange",
      onIceGatheringStateChange
    );
    peer?.addEventListener(
      "iceconnectionstatechange",
      onIceConnectionStateChange
    );

    return () => {
      peer?.removeEventListener(
        "connectionstatechange",
        onConnectionStateChangeInternal
      );

      peer?.removeEventListener(
        "icegatheringstatechange",
        onIceGatheringStateChange
      );
      peer?.removeEventListener(
        "iceconnectionstatechange",
        onIceConnectionStateChange
      );
    };
  }, [
    onConnectionStateChange,
    onConnectionStateChangeInternal,
    onIceConnectionStateChange,
    onIceGatheringStateChange,
    peer,
  ]);

  // ==================== Signaling ====================

  const onLocalIceCandidate = useCallback(
    (event: RTCPeerConnectionIceEvent) => {
      const candidate = event.candidate;
      if (candidate === null)
        console.log(`Got a null candidate, Connection can be established.`);

      if (!candidate || !socket || !sessionId) return;

      console.log(
        `Share ice candidate: ${candidate.type}/${candidate.protocol}`
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
      console.log(`Received an offer (${offer.type})`);
      if (!sessionId || !socket || !peer) return;
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit(Wss.ClientEvent.SessionAnswer, {
        sessionId,
        answer,
      });
      setPeer(peer);
    },
    [peer, sessionId, socket]
  );

  const onSessionAnswer = useCallback(
    async ({ answer }: Wss.EventPayload<Wss.ServerEvent.SessionAnswer>) => {
      console.log(`Received an answer (${answer.type})`);
      await peer?.setRemoteDescription(answer);
    },
    [peer]
  );

  const onRemoteIceCandidate = useCallback(
    ({ candidate }: Wss.EventPayload<Wss.ServerEvent.IceCandidate>) => {
      console.log(`Received an ice candidate`);
      peer?.addIceCandidate(candidate);
    },
    [peer]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on(Wss.ServerEvent.SessionOffer, onSessionOffer);
    socket.on(Wss.ServerEvent.SessionAnswer, onSessionAnswer);
    socket.on(Wss.ServerEvent.IceCandidate, onRemoteIceCandidate);
    return () => {
      socket.off(Wss.ServerEvent.SessionOffer, onSessionOffer);
      socket.off(Wss.ServerEvent.SessionAnswer, onSessionAnswer);
      socket.off(Wss.ServerEvent.IceCandidate, onRemoteIceCandidate);
    };
  }, [onRemoteIceCandidate, onSessionAnswer, onSessionOffer, socket]);

  useEffect(() => {
    peer?.addEventListener("icecandidate", onLocalIceCandidate);

    return () => {
      peer?.removeEventListener("icecandidate", onLocalIceCandidate);
    };
  }, [onLocalIceCandidate, peer]);

  // ==================== Handle streams ====================

  const attachStream = useCallback(
    (stream: MediaStream) => {
      const tracks = stream.getTracks();
      tracks.forEach((track) => peer?.addTrack(track, stream));
    },
    [peer]
  );

  const onTrack = useCallback((event: RTCTrackEvent) => {
    const stream = first(event.streams);
    if (!stream) return;
    const tracks = stream.getTracks();
    const count = tracks.length;
    const kind = tracks.map((track) => track.kind).join("+");
    console.log(
      `Received a remote stream with ${count} track(s)\nKind: ${kind}`
    );
    setStream(stream);
  }, []);

  useEffect(() => {
    peer?.addEventListener("track", onTrack);
    return () => {
      peer?.removeEventListener("track", onTrack);
    };
  }, [onTrack, peer]);

  // ==================== Cleanup ====================

  const close = useCallback(() => {
    // peer?.close();
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
    // create a new peer incase the other member tried to reconnected with the current user
    // setPeer(initPeer());
  }, [stream]);

  return {
    stream,
    connectionState,
    iceGatheringState,
    createOffer,
    attachStream,
    close,
    createPeer,
    init,
  };
}

type SessionV5Payload = {
  selfId?: number;
  sessionId?: ISession.Id;
  memberId?: number;
};

export function useSessionV5({
  selfId,
  memberId,
  sessionId,
}: SessionV5Payload) {
  const userMedia = useUserMedia();
  const peer = usePeer({ sessionId });
  const { notifyCamera, notifyMic } = useNotifyState(sessionId);
  const member = useMemberState({ memberId, stream: peer.stream });
  const manager = useSessionManager({
    selfId,
    sessionId,
    onJoin(userId) {
      if (!selfId || selfId === userId) return;
      console.log(`${userId} joined the session`);
    },
    onLeave(userId) {
      console.log(`${userId} left the session: close=${userId === memberId}`);
      if (userId !== memberId) return;
      peer.close();
      if (userMedia.stream) {
        console.log("Reinitialize peer connection");
        peer.init(userMedia.stream, false);
      }
    },
    onInitialMembers(userIds) {
      console.log(`Members:`, userIds);
    },
  });

  useEffect(() => {
    notifyCamera(userMedia.video);
  }, [notifyCamera, userMedia.video]);

  useEffect(() => {
    notifyMic(userMedia.audio);
  }, [notifyMic, userMedia.audio]);

  const join = useCallback(() => {
    const stream = userMedia.stream;
    if (!stream || !memberId) return;
    manager.join();
    const shareOffer = manager.members.includes(memberId);
    peer.init(stream, shareOffer);
  }, [manager, memberId, peer, userMedia.stream]);

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
