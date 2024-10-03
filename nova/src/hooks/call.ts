import { useCallback, useEffect, useMemo, useState } from "react";
import server, { sockets } from "@/lib/wss";
import { isPermissionDenied, safe } from "@/lib/error";
import { MediaConnection } from "peerjs";
import peer from "@/lib/peer";
import dayjs from "@/lib/dayjs";
import { Events, ICall } from "@litespace/types";
import hark from "hark";

export function useCallRecorder(screen: boolean = false) {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const onDataAvailable = useCallback(
    (call: number, timestamp: number) => async (event: BlobEvent) => {
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
        // mimeType: `video/mp4; codecs="avc1.424028, mp4a.40.2"`,
        // mimeType: `video/mp4; codecs="avc1.4d002a"`,
        // mimeType: `video/webm;codecs=h264,opus`,
        mimeType: `video/webm`,
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
  const [audio, setAudio] = useState<boolean>(false);
  const [video, setVideo] = useState<boolean>(false);

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
  };
}

export function useCallRecordingStatus(status: ICall.RecordingStatus) {
  return useMemo(
    () => ({
      empty: status === ICall.RecordingStatus.Empty,
      recording: status === ICall.RecordingStatus.Recording,
      recorded: status === ICall.RecordingStatus.Recorded,
      processing: status === ICall.RecordingStatus.Processing,
      processed: status === ICall.RecordingStatus.Processed,
      queued: status === ICall.RecordingStatus.Queued,
      processingFailed: status === ICall.RecordingStatus.ProcessingFailed,
      idle: status === ICall.RecordingStatus.Idle,
    }),
    [status]
  );
}

export function useSpeech(stream: MediaStream | null) {
  const [speaking, setSpeaking] = useState<boolean>(false);

  const onSpeaking = useCallback(() => setSpeaking(true), []);
  const onStopSpeaking = useCallback(() => setSpeaking(false), []);

  useEffect(() => {
    if (!stream) return;
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
  call: number | null,
  mate?: number
) {
  const [mateVideo, setMateVideo] = useState<boolean>(false);
  const [mateAudio, setMateAudio] = useState<boolean>(false);
  const streamState = useStreamState(stream);

  const notifyCameraToggle = useCallback(
    (camera: boolean) => {
      if (!call) return;
      sockets.server.emit(Events.Client.ToggleCamera, { call, camera });
    },
    [call]
  );

  const notifyMicToggle = useCallback(
    (mic: boolean) => {
      if (!call) return;
      sockets.server.emit(Events.Client.ToggleMic, { call, mic });
    },
    [call]
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
    sockets.server.on(Events.Server.CameraToggled, onCameraToggle);
    sockets.server.on(Events.Server.MicToggled, onMicToggle);

    return () => {
      sockets.server.off(Events.Server.CameraToggled, onCameraToggle);
      sockets.server.off(Events.Server.MicToggled, onMicToggle);
    };
  }, [onCameraToggle, onMicToggle]);

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
