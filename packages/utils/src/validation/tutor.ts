import {
  BIO_REGEX,
  MAX_TUTOR_ABOUT_TEXT_LENGTH,
  MAX_TUTOR_BIO_LENGTH,
  MAX_TUTOR_NOTICE_DURATION,
  MIN_TUTOR_BIO_LEGNTH,
  MIN_TUTOR_ABOUT_TEXT_LENGTH,
  MIN_TUTOR_NOTICE_DURATION,
} from "@/constants";
import { FieldError, Optional } from "@litespace/types";

export function isValidTutorBio(
  bio: unknown
):
  | FieldError.EmptyBio
  | FieldError.ShortBio
  | FieldError.LongBio
  | FieldError.InvalidBio
  | true {
  if (typeof bio !== "string") return FieldError.InvalidBio;
  if (!bio.length) return FieldError.EmptyBio;
  if (bio.length < MIN_TUTOR_BIO_LEGNTH) return FieldError.ShortBio;
  if (!BIO_REGEX.test(bio)) return FieldError.InvalidBio;
  if (bio.length > MAX_TUTOR_BIO_LENGTH) return FieldError.LongBio;
  return true;
}

export function isValidTutorAbout(
  about: string
): FieldError.ShortTutorAbout | FieldError.LongTutorAbout | true {
  if (about.length < MIN_TUTOR_ABOUT_TEXT_LENGTH)
    return FieldError.ShortTutorAbout;
  if (about.length > MAX_TUTOR_ABOUT_TEXT_LENGTH)
    return FieldError.LongTutorAbout;
  return true;
}

export function validateTutorNotice(
  tutorNotice: number
): Optional<FieldError.MaxNoticeExceeded | FieldError.InvalidNotice> {
  if (tutorNotice <= MIN_TUTOR_NOTICE_DURATION) return FieldError.InvalidNotice;
  if (tutorNotice > MAX_TUTOR_NOTICE_DURATION)
    return FieldError.MaxNoticeExceeded;
}
