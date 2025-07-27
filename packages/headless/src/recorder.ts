import { safe } from "@litespace/utils/error";
import { useCallback, useState } from "react";

export function useDisplayRecorder() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const start = useCallback(async () => {
    setLoading(true);
    let stream;
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getDisplayMedia
    ) {
      stream = new Error(
        "getDisplayMedia is not supported in this environment"
      );
    } else {
      stream = await safe(
        async () =>
          await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          })
      );
    }
    setLoading(false);
    if (stream instanceof Error) {
      setError(stream);
      return;
    }
    if (!stream) return;
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    recorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size) return chunks.push(event.data);
    };
    recorder.start(5_000);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      // todo: upload to remote server
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.setAttribute("style", "display: none;");
      a.href = url;
      a.download = "video.webm";
      a.click();
      URL.revokeObjectURL(url);
    };
  }, []);

  return {
    start,
    loading,
    error,
  };
}
