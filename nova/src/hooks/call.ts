import { useCallback, useEffect, useMemo, useState } from "react";
import { sockets } from "@/lib/wss";
import { isPermissionDenied, safe } from "@/lib/error";
import { MediaConnection } from "peerjs";
import peer from "@/lib/peer";
import dayjs from "@/lib/dayjs";

export function useCallRecorder(screen: boolean = false) {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const onDataAvailable = useCallback(
    (call: number, timestamp: number) => (event: BlobEvent) => {
      if (event.data.size === 0) return;
      console.debug(`Processing chunk (${event.data.size})`);
      sockets.recorder.emit("chunk", {
        chunk: event.data,
        timestamp,
        screen,
        call,
      });
    },
    [screen]
  );

  const start = useCallback(
    (stream: MediaStream, call: number) => {
      const recorder = new MediaRecorder(stream, {
        mimeType: `video/mp4; codecs="avc1.424028, mp4a.40.2"`,
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
  const [muteded, setMuteded] = useState<boolean>(false);
  const [cameraOff, setCameraOff] = useState<boolean>(false);

  const start = useCallback(async () => {
    setLoading(true);
    const stream = await safe(
      async () =>
        await navigator.mediaDevices.getUserMedia({
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
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      if (videoTracks.length !== 0) setCamera(true);
      if (audioTracks.length !== 0) setMic(true);

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
  }, []);

  const stop = useCallback(() => {
    if (!stream) return;
    stream.getTracks().forEach((track) => track.stop());
    setStream(null);
  }, [stream]);

  const toggleSound = useCallback(() => {
    if (!stream) return;
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMuteded(!track.enabled);
    });
  }, [stream]);

  const toggleCamera = useCallback(() => {
    if (!stream) return;
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setCameraOff(!track.enabled);
    });
  }, [stream]);

  return {
    loading,
    stream,
    error,
    start,
    stop,
    toggleSound,
    muteded,
    mic,
    toggleCamera,
    cameraOff,
    camera,
  };
}
