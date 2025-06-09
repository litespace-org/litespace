import { isLocalAudioTrack, isLocalVideoTrack } from "@/lib/livekit";
import { safePromise } from "@litespace/utils/error";
import { BackgroundBlur } from "@livekit/track-processors";
import {
  LocalAudioTrack,
  LocalVideoTrack,
  Track,
  createLocalTracks,
} from "livekit-client";
import { isEmpty } from "lodash";
import { useCallback, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";

type State = "idle" | "recording" | "preview";

export function useRecord() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [starting, setStarting] = useState(false);
  const [state, setState] = useState<State>("idle");
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [audioTrack, setAudioTrack] = useState<LocalAudioTrack | null>(null);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);

  const record = useCallback(async () => {
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
      !isLocalVideoTrack(videoTrack) ||
      !isLocalAudioTrack(audioTrack)
    )
      return;

    if (videoRef.current) videoTrack.attach(videoRef.current);
    await safePromise(videoTrack.setProcessor(BackgroundBlur(50)));
    const processedVideoTrack = videoTrack.getProcessor()?.processedTrack;
    if (!processedVideoTrack) return;

    const stream = new MediaStream([
      processedVideoTrack,
      ...(audioTrack.mediaStream?.getTracks() || []),
    ]);

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
  }, []);

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

  return { record, state, starting, videoRef, previewRef, preview, upload };
}
