import { safe } from "@litespace/utils/error";
import { useCallback, useState } from "react";

export function useDisplayRecorder() {
  const [loading, setLoading] = useState<boolean>(false);
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
    if (error) return setError(stream);

    const chunks: Blob[] = [];

    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });

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
