import { atlas } from "@/lib/atlas";
import { useCallback, useMemo, useState } from "react";

const chunks: Blob[] = [];

export function useCallRecorder() {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const onDataAvailable = useCallback(async (event: BlobEvent) => {
    if (event.data.size === 0) return;
    console.log("data...", event.data.size, event.data.type);
    chunks.push(event.data);

    // if (chunks.length === 3) {
    //   const blob = new Blob(chunks, { type: "video/webm" });
    //   const url = URL.createObjectURL(blob);
    //   const a = document.createElement("a");
    //   document.body.appendChild(a);
    //   //@ts-ignore
    //   a.style = "display: none";
    //   a.href = url;
    //   a.download = "test.webm";
    //   a.click();
    //   window.URL.revokeObjectURL(url);
    //   return;
    // }
    await atlas.recorder.upload({
      blob: event.data,
      call: 1,
      user: 1,
    });
  }, []);

  const start = useCallback(
    (stream: MediaStream) => {
      const recorder = new MediaRecorder(stream, {
        mimeType: `video/mp4; codecs="avc1.424028, mp4a.40.2"`,
      });
      recorder.ondataavailable = onDataAvailable;
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
