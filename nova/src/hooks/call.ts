import { useCallback, useMemo, useState } from "react";
import { recorder as socket } from "@/lib/wss";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import { isPermissionDenied, safe } from "@/lib/error";
import { first } from "lodash";

export function useCallRecorder() {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [call, setCall] = useState<number | null>();
  const profile = useAppSelector(profileSelector);

  const onDataAvailable = useCallback(
    async (event: BlobEvent) => {
      if (event.data.size === 0 || !profile || !call) return;
      console.debug(`Processing chunk (${event.data.size})`);
      socket.emit("chunk", {
        chunk: event.data,
        user: profile.id,
        call,
      });
    },
    [call, profile]
  );

  const start = useCallback(
    (stream: MediaStream, call: number) => {
      const recorder = new MediaRecorder(stream, {
        mimeType: `video/mp4; codecs="avc1.424028, mp4a.40.2"`,
      });
      recorder.ondataavailable = onDataAvailable;
      recorder.start(2_000);
      setRecorder(recorder);
      setCall(call);
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

export function useShareScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);

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
      const video = first(stream.getVideoTracks());
      if (video)
        video.addEventListener("ended", () => {
          setStream(null);
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
