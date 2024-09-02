import { useCallback, useMemo, useState } from "react";
import { recorder as socket } from "@/lib/wss";

export function useCallRecorder() {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const onDataAvailable = useCallback(async (event: BlobEvent) => {
    if (event.data.size === 0) return;
    socket.emit("chunk", {
      chunk: event.data,
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
