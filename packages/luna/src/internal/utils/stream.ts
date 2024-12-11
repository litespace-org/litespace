import { Void } from "@litespace/types";

const DEFAULT_URL =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

export async function getVideoMediaStream(videoUrl: string = DEFAULT_URL) {
  const video = document.createElement("video");
  video.src = videoUrl;
  video.crossOrigin = "anonymous";
  video.autoplay = true;
  video.muted = true;

  await new Promise((resolve, reject) => {
    video.onloadedmetadata = resolve;
    video.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");

  function drawFrame() {
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(drawFrame);
  }
  drawFrame();

  video.play();

  const mediaStream = canvas.captureStream(60);
  return mediaStream;
}

export type Stream = {
  fullScreen: {
    enabled: boolean;
    toggle: Void;
  };
  speech: {
    speaking: boolean;
    mic: boolean;
  };
  camera: boolean;
  cast: boolean;
  stream: MediaStream | null;
  user: {
    id: number;
    imageUrl: string | null;
    name: string | null;
  };
  type: "focused" | "unfocused";
};

export function createStreamObject(
  stream: MediaStream | null,
  options: {
    user: {
      id: number;
      imageUrl: string | null;
      name: string | null;
    };
    type: "focused" | "unfocused";
    camera: boolean;
    cast: boolean;
  }
): Stream | null {
  if (!stream) return null;
  return {
    stream,
    fullScreen: {
      enabled: false,
      toggle: () => alert("full screen"),
    },
    speech: {
      speaking: false,
      mic: true,
    },
    ...options,
  };
}
