import { useEffect, useState } from "react";
import { createStreamObject, getVideoMediaStream } from "../utils/stream";
import { faker } from "@faker-js/faker/locale/en";

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
    user: {
      id: faker.number.int({
        min: 1,
        max: 1000,
      }),
      imageUrl: "https://picsum.photos/1900",
      name: "User",
    },
    type: type,
    camera: camera || false,
    cast: false,
  });
  return streamObj;
}
