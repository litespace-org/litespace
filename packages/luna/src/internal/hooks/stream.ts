import { useEffect, useState } from "react";
import { createStreamInfo, getVideoMediaStream } from "@/internal/utils/stream";
import { faker } from "@faker-js/faker/locale/en";

export function useCreateStream(
  type: "focused" | "unfocused",
  camera?: boolean
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    getVideoMediaStream().then(setStream);
  }, []);

  return createStreamInfo(stream, {
    user: {
      id: faker.number.int({
        min: 1,
        max: 1000,
      }),
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
    },
    type: type,
    camera: camera || false,
    cast: false,
  });
}
