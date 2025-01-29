import { useCallback, useEffect, useState } from "react";
import { createStreamInfo, getVideoMediaStream } from "@/internal/utils/stream";
import { faker } from "@faker-js/faker/locale/en";

export function useCreateStream(
  video?: boolean,
  currentUserId?: number,
  cast?: boolean
) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  useEffect(() => {
    getVideoMediaStream().then(setStream);
  }, []);

  return createStreamInfo(stream, {
    user: {
      id:
        currentUserId ||
        faker.number.int({
          min: 1,
          max: 1000,
        }),
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
    },
    video: video || false,
    cast: cast || false,
  });
}

export function useUserMedia() {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const getUserUserMedia = useCallback(
    async () =>
      await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      }),
    []
  );

  useEffect(() => {
    getUserUserMedia().then(setStream);
  }, [getUserUserMedia]);

  return stream;
}

export function useUserMediaStreamInfo(
  currentUserId?: number,
  video?: boolean,
  cast?: boolean
) {
  const stream = useUserMedia();

  return createStreamInfo(stream, {
    user: {
      id:
        currentUserId ||
        faker.number.int({
          min: 1,
          max: 1000,
        }),
      imageUrl: faker.image.urlPicsumPhotos({ width: 400, height: 400 }),
      name: faker.person.fullName(),
    },
    video: video || false,
    cast: cast || false,
  });
}
