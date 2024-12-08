export async function getMediaStreamFromVideo() {
  const videoUrl =
    "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
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

  // eslint-disable-next-line storybook/context-in-play-function
  video.play();

  const mediaStream = canvas.captureStream(60);
  return mediaStream;
}
