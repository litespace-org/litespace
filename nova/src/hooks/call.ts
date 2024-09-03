import { useCallback, useMemo, useState } from "react";
import { recorder as socket } from "@/lib/wss";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";

export function useCallRecorder() {
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const [call, setCall] = useState<number | null>();
  const profile = useAppSelector(profileSelector);

  const onDataAvailable = useCallback(
    async (event: BlobEvent) => {
      if (event.data.size === 0 || !profile || !call) return;
      console.log(`Processing chunk (${event.data.size})`);
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
