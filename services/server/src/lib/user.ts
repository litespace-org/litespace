import crypto from "node:crypto";
import s3 from "@/lib/s3";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function isSamePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function withImageUrl<
  T extends
    | { image: string | null }
    | { thumbnail: string | null }
    | { video: string | null }
    | {
        image: string | null;
        video: string | null;
        thumbnail: string | null;
      },
>(data: T) {
  const cloned = structuredClone(data);

  const imageId = "image" in cloned && cloned.image;
  const videoId = "video" in cloned && cloned.video;
  const thumbnailId = "thumbnail" in cloned && cloned.thumbnail;

  const [imageUrl, videoUrl, thumbnailUrl] = await Promise.all([
    imageId ? s3.get(imageId) : null,
    videoId ? s3.get(videoId) : null,
    thumbnailId ? s3.get(thumbnailId) : null,
  ]);

  if (imageId && imageUrl) cloned.image = imageUrl;
  if (videoId && videoUrl) cloned.video = videoUrl;
  if (thumbnailId && thumbnailUrl) cloned.thumbnail = thumbnailUrl;

  return cloned;
}

export async function withImageUrls<
  T extends
    | { image: string | null }
    | { video: string | null }
    | {
        image: string | null;
        video: string | null;
      },
>(users: T[]): Promise<T[]> {
  return await Promise.all(users.map((user) => withImageUrl(user)));
}
