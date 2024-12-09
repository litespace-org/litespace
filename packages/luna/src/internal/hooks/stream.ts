import { useEffect, useState } from "react";
import { createStreamObject, getVideoMediaStream } from "../utils/stream";

export function useCreateStream(
  type: "focused" | "unfocused",
  camera?: boolean
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    async function getStream() {
      const stream = await getVideoMediaStream();
      setStream(stream);
    }

    getStream();
  }, []);

  if (!stream) return null;
  const streamObj = createStreamObject(stream, {
    user: { id: 1, imageUrl: "https://picsum.photos/1900", name: "User" },
    type: type,
    camera: camera || false,
    cast: false,
  });
  return streamObj;
}
