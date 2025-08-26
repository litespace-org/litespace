import { env } from "@/lib/env";
import { capture } from "@/lib/sentry";
import { sockets } from "@litespace/atlas";
import { useLogger } from "@litespace/headless/logger";
import { isOverConstrainedError } from "@litespace/headless/sessions";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { useToast } from "@litespace/ui/Toast";
import { safePromise } from "@litespace/utils";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import {
  BackgroundBlur,
  supportsBackgroundProcessors,
} from "@livekit/track-processors";
import {
  createLocalTracks,
  isLocalTrack,
  LocalAudioTrack,
  LocalVideoTrack,
  MediaDeviceFailure,
  RoomEvent,
  ParticipantEvent,
  Room,
  RemoteTrackPublication,
  Track,
  ConnectionQuality,
} from "livekit-client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller } from "@/components/Session/Controllers";
import { isLocalAudioTrack, isLocalVideoTrack } from "@/lib/livekit";
import { useSocket } from "@litespace/headless/socket";
import { ISession, Wss } from "@litespace/types";

const serverUrl = sockets.livekit[env.server];

export function useRoom(sessionId: ISession.Id, token?: string) {
  const { socket } = useSocket();
  const [connected, setConnected] = useState<boolean>(false);
  const [published, setPublished] = useState<boolean>(false);
  const room = useMemo(() => {
    return new Room({
      // Optimize video quality for each participant's screen
      adaptiveStream: true,
      // Enable automatic audio/video quality optimization
      dynacast: true,
      disconnectOnPageLeave: true,
    });
  }, []);

  const onConnected = useCallback(() => {
    socket?.emit(Wss.ClientEvent.JoinSession, { sessionId });
  }, [socket, sessionId]);

  const onDisconnected = useCallback(() => {
    socket?.emit(Wss.ClientEvent.LeaveSession, { sessionId });
  }, [socket, sessionId]);

  const onLocalTrackPublished = useCallback(() => {
    console.log("Track Published.");
    setPublished(true);
  }, []);

  const onLocalTrackUnpublished = useCallback(() => {
    console.log("Track Unpublished!");
    setPublished(false);
  }, []);

  const onConnectionQualityChanged = useCallback(
    (quality: ConnectionQuality) => {
      console.log("connection quality:", quality);
      if (quality === ConnectionQuality.Lost) {
        room.disconnect().then(() => setConnected(false));
      }
    },
    [room]
  );

  const onRemoteTrackPublished = useCallback(
    (pub: RemoteTrackPublication) => {
      if (published && pub.kind === Track.Kind.Audio) {
        const audio = new Audio("/join-session.mp3");
        audio.play();
      }
    },
    [published]
  );

  const onParticipantDisconnected = useCallback(() => {
    if (published) {
      const audio = new Audio("/leave-session.mp3");
      audio.play();
    }
  }, [published]);

  useEffect(() => {
    room.on(RoomEvent.Connected, onConnected);
    room.on(RoomEvent.Disconnected, onDisconnected);
    room.on(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
    room.on(RoomEvent.LocalTrackUnpublished, onLocalTrackUnpublished);
    room.on(RoomEvent.ConnectionQualityChanged, onConnectionQualityChanged);

    room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.on(ParticipantEvent.TrackPublished, onRemoteTrackPublished);

    return () => {
      room.off(RoomEvent.Connected, onConnected);
      room.off(RoomEvent.Disconnected, onDisconnected);
      room.off(RoomEvent.LocalTrackPublished, onLocalTrackPublished);
      room.off(RoomEvent.LocalTrackUnpublished, onLocalTrackUnpublished);
      room.off(RoomEvent.ConnectionQualityChanged, onConnectionQualityChanged);

      room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
      room.off(ParticipantEvent.TrackPublished, onRemoteTrackPublished);
    };
  }, [
    onConnected,
    onDisconnected,
    onLocalTrackPublished,
    onLocalTrackUnpublished,
    onRemoteTrackPublished,
    onParticipantDisconnected,
    onConnectionQualityChanged,
    room,
  ]);

  useEffect(() => {
    if (!token) return console.error("no server to connect");
    if (connected) return;
    room.connect(serverUrl, token).then(() => setConnected(true));
  }, [connected, room, token]);

  return {
    room,
    published,
    connected,
  };
}

export function useBlurController(): Controller {
  const { localParticipant, isCameraEnabled, cameraTrack } =
    useLocalParticipant();
  const [loading, setLoading] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [error, setError] = useState<boolean>();

  const toggle = useCallback(async () => {
    if (loading || !supportsBackgroundProcessors()) return;
    setLoading(true);
    setError(false);

    if (!isCameraEnabled)
      await safePromise(localParticipant.setCameraEnabled(true));

    const track = cameraTrack?.track;
    if (!isLocalTrack(track)) return;

    const processor = track.getProcessor();

    if (processor) {
      const result = await safePromise(track.stopProcessor());
      const error = result instanceof Error;
      setEnabled(error);
      setError(error);
    }

    if (!processor) {
      const result = await safePromise(track.setProcessor(BackgroundBlur(20)));
      const error = result instanceof Error;
      setEnabled(!error);
      setError(error);
    }

    setLoading(false);
  }, [cameraTrack?.track, isCameraEnabled, loading, localParticipant]);

  return {
    toggle,
    enabled: enabled,
    loading,
    error,
  };
}

export function useVideoController(): Controller {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const onDeviceError = useDeviceError();
  const { localParticipant, isCameraEnabled } = useLocalParticipant();

  const toggle = useCallback(async () => {
    setLoading(true);
    const result = await safePromise(
      localParticipant.setCameraEnabled(!isCameraEnabled)
    );
    const error = result instanceof Error;
    if (error) onDeviceError(result);
    setError(error);
    setLoading(false);
  }, [isCameraEnabled, localParticipant, onDeviceError]);

  return { toggle, enabled: isCameraEnabled, loading, error };
}

export function useAudioController(): Controller {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const onDeviceError = useDeviceError();
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const toggle = useCallback(async () => {
    setLoading(true);
    const result = await safePromise(
      localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
    );
    const error = result instanceof Error;
    if (error) onDeviceError(result);
    setError(error);
    setLoading(false);
  }, [isMicrophoneEnabled, localParticipant, onDeviceError]);

  return { toggle, enabled: isMicrophoneEnabled, loading, error };
}

export function useDeviceError() {
  const logger = useLogger();
  const toast = useToast();
  const intl = useFormatMessage();

  const onError = useCallback(
    (error: Error) => {
      // Ref: https://blog.addpipe.com/common-getusermedia-errors/
      logger.error("unable to capture user media stream", error);
      const id = "user-media-error";
      const failure = MediaDeviceFailure.getFailure(error);
      capture(error);

      if (isOverConstrainedError(error))
        return toast.error({
          id,
          title: intl("session.over-constrained-error.title"),
          description: intl("session.over-constrained-error.desc"),
        });

      if (failure === MediaDeviceFailure.NotFound)
        return toast.error({
          id,
          title: intl("session.device-not-found-error.mic-and-cam.title"),
          description: intl("session.device-not-found-error.mic-and-cam.desc"),
        });

      if (failure === MediaDeviceFailure.DeviceInUse)
        return toast.error({
          id,
          title: intl("session.not-readable-error.title"),
          description: intl("session.not-readable-error.desc"),
        });

      if (failure === MediaDeviceFailure.PermissionDenied)
        return toast.error({
          id,
          title: intl("session.not-allowed.title"),
          description: intl("session.not-allowed.desc"),
        });

      toast.error({
        id,
        title: intl("session.unexpected-error.title"),
        description: intl("session.unexpected-error.desc"),
      });
    },
    [intl, logger, toast]
  );

  return onError;
}

export function usePreview() {
  const { connected: socketConnected } = useSocket();
  const room = useRoomContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const onDeviceError = useDeviceError();
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(false);
  const [togglingBackgroundBlur, setTogglingBackgroundBlur] =
    useState<boolean>(false);
  const [backgroundBlurEnabled, setBackgroundBlurEnabled] =
    useState<boolean>(false);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const audioDevices = await safePromise(Room.getLocalDevices("audioinput"));
    const videoDevices = await safePromise(Room.getLocalDevices("videoinput"));

    const audio =
      MediaDeviceFailure.getFailure(audioDevices) !==
      MediaDeviceFailure.NotFound;
    const video =
      MediaDeviceFailure.getFailure(videoDevices) !==
      MediaDeviceFailure.NotFound;

    const tracks = await safePromise(
      createLocalTracks({
        audio,
        video,
      })
    );

    const error = tracks instanceof Error;

    setLoading(false);
    setError(error ? tracks : null);
    setSuccess(!error);
    if (error) {
      onDeviceError(tracks);
      return tracks;
    }

    for (const track of tracks) {
      if (isLocalVideoTrack(track)) {
        setVideoTrack(track);
        setVideoEnabled(true);
        if (videoRef.current) track.attach(videoRef.current);
      }

      if (isLocalAudioTrack(track)) {
        setAudioEnabled(true);
        setAudioTrack(track);
      }
    }
  }, [onDeviceError]);

  const toggleBackgroundBlur = useCallback(async () => {
    if (!videoTrack || togglingBackgroundBlur) return;

    setTogglingBackgroundBlur(true);
    const processor = videoTrack.getProcessor();
    if (processor) {
      await safePromise(videoTrack.stopProcessor());
      setBackgroundBlurEnabled(false);
    }

    if (!processor) {
      await videoTrack.unmute();
      await safePromise(videoTrack.setProcessor(BackgroundBlur(20)));
      setBackgroundBlurEnabled(true);
    }

    setTogglingBackgroundBlur(false);
  }, [togglingBackgroundBlur, videoTrack]);

  const onVideoTrackMute = useCallback(() => {
    setVideoEnabled(false);
  }, []);

  const onAudioTrackMute = useCallback(() => {
    setAudioEnabled(false);
  }, []);

  const onVideoTrackUnmute = useCallback(() => {
    setVideoEnabled(true);
  }, []);

  const onAudioTrackUnmute = useCallback(() => {
    setAudioEnabled(true);
  }, []);

  useEffect(() => {
    videoTrack?.addListener("muted", onVideoTrackMute);
    videoTrack?.addListener("unmuted", onVideoTrackUnmute);

    return () => {
      videoTrack?.removeListener("muted", onVideoTrackMute);
      videoTrack?.removeListener("unmuted", onVideoTrackUnmute);
    };
  }, [onVideoTrackMute, onVideoTrackUnmute, videoTrack]);

  useEffect(() => {
    audioTrack?.addListener("muted", onAudioTrackMute);
    audioTrack?.addListener("unmuted", onAudioTrackUnmute);

    return () => {
      audioTrack?.removeListener("muted", onAudioTrackMute);
      audioTrack?.removeListener("unmuted", onAudioTrackUnmute);
    };
  }, [audioTrack, onAudioTrackMute, onAudioTrackUnmute]);

  const join = useCallback(() => {
    if (!socketConnected) return console.error("the socket is disconnection!");
    if (videoTrack) room.localParticipant.publishTrack(videoTrack);
    if (audioTrack) room.localParticipant.publishTrack(audioTrack);
  }, [audioTrack, room.localParticipant, videoTrack, socketConnected]);

  return {
    toggleBackgroundBlur,
    start,
    join,
    videoRef,
    audioTrack,
    videoTrack,
    loading,
    error,
    success,
    audioEnabled,
    videoEnabled,
    togglingBackgroundBlur,
    backgroundBlurEnabled,
  };
}
