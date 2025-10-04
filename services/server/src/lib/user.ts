import crypto from "node:crypto";
import s3 from "@/lib/s3";
import { isValidPhone } from "@litespace/utils";
import { users } from "@litespace/models";
import { IUser } from "@litespace/types";
import { InvalidPhoneNumber, MissingPhoneNumber } from "@/lib/error/local";

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

  const imageUrl = imageId ? await s3.get(imageId) : null;
  const videoUrl = videoId ? await s3.get(videoId) : null;
  const thumbnailUrl = thumbnailId ? await s3.get(thumbnailId) : null;

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

export function selectPhone(
  userPhone: string | null,
  backupPhone?: string
): { valid: boolean; phone?: string; update: boolean } {
  const phone = userPhone || backupPhone;
  const validPhone = isValidPhone(phone) === true;
  const mismatch = userPhone && backupPhone && userPhone !== backupPhone;
  const valid = !!phone && !mismatch && !!validPhone;

  return {
    valid,
    phone,
    update: valid && !userPhone,
  };
}

export async function withPhone(
  user: IUser.Self,
  backupPhone?: string
): Promise<string | InvalidPhoneNumber | MissingPhoneNumber> {
  const { valid, phone, update } = selectPhone(user.phone, backupPhone);
  if (!valid) throw new InvalidPhoneNumber("Provided phone number is invalid");
  if (!phone) return new MissingPhoneNumber("Phone number is required.");
  // update user phone if needed.
  if (update) await users.update(user.id, { phone });
  return phone;
}
