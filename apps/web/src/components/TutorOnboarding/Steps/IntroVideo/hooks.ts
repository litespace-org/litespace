import { safePromise } from "@litespace/utils/error";
import { BackgroundBlur } from "@livekit/track-processors";
import {
  LocalAudioTrack,
  LocalVideoTrack,
  Track,
  createLocalTracks,
  isAudioTrack,
  isVideoTrack,
} from "livekit-client";
import { isEmpty } from "lodash";
import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type State = "idle" | "capturing" | "recording" | "preview";

export function useRecord() {
  const captureRef = useRef<HTMLVideoElement>(null);
  const recordingRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [starting, setStarting] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const capture = useCallback(async () => {
    setStarting(true);
    chunksRef.current = [];

    const tracks = await safePromise(
      createLocalTracks({ audio: true, video: true })
    );

    const error = tracks instanceof Error;
    setStarting(false);
    if (error) return;

    const videoTrack = tracks.find((track) => track.kind === Track.Kind.Video);
    const audioTrack = tracks.find((track) => track.kind === Track.Kind.Audio);

    if (
      !videoTrack ||
      !audioTrack ||
      !isVideoTrack(videoTrack) ||
      !isAudioTrack(audioTrack)
    )
      return;

    if (captureRef.current) videoTrack.attach(captureRef.current);
    if (recordingRef.current) videoTrack.attach(recordingRef.current);
    if (previewRef.current) videoTrack.attach(previewRef.current);
    await safePromise(videoTrack.setProcessor(BackgroundBlur(50)));
    const processedVideoTrack = videoTrack.getProcessor()?.processedTrack;
    if (!processedVideoTrack) return;

    const stream = new MediaStream([
      processedVideoTrack,
      ...(audioTrack.mediaStream?.getTracks() || []),
    ]);

    setStream(stream);
    setAudioTrack(audioTrack);
    setVideoTrack(videoTrack);
    setState("capturing");
  }, []);

  const record = useCallback(async () => {
    chunksRef.current = [];

    if (
      !videoTrack ||
      !audioTrack ||
      !isVideoTrack(videoTrack) ||
      !isAudioTrack(audioTrack) ||
      !stream
    )
      return;

    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm; codecs=vp9",
    });

    mediaRecorder.addEventListener("dataavailable", (event: BlobEvent) => {
      if (event.data.size === 0) return;
      chunksRef.current.push(event.data);
    });

    mediaRecorder.start(1_000);

    setRecorder(mediaRecorder);
    setAudioTrack(audioTrack);
    setVideoTrack(videoTrack);
    setState("recording");
  }, [audioTrack, stream, videoTrack]);

  const preview = useCallback(async () => {
    await videoTrack?.stopProcessor();
    videoTrack?.stop();
    audioTrack?.stop();
    recorder?.stop();
    const blob = new Blob(chunksRef.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    if (previewRef.current?.src) URL.revokeObjectURL(previewRef.current.src);
    if (previewRef.current) previewRef.current.src = url;
    setState("preview");
  }, [audioTrack, recorder, videoTrack]);

  const upload = useCallback(() => {
    alert("not yet implemented");
  }, []);

  useHotkeys(
    "ctrl+d",
    () => {
      if (isEmpty(chunksRef.current)) return;
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API#overview_of_the_recording_process
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.classList.add("hidden");
      a.href = url;
      a.download = "intro-video.webm";
      a.click();
      URL.revokeObjectURL(url);
    },
    {
      preventDefault: true,
    },
    []
  );

  return {
    capture,
    record,
    state,
    starting,
    captureRef,
    recordingRef,
    previewRef,
    preview,
    upload,
  };
}
