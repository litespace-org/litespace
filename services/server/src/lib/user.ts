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
    | { video: string | null }
    | {
        image: string | null;
        video: string | null;
      },
>(user: T) {
  const cloned = structuredClone(user);

  if ("image" in cloned && cloned.image)
    cloned.image = await s3.get(cloned.image);

  if ("video" in cloned && cloned.video)
    cloned.video = await s3.get(cloned.video);

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
