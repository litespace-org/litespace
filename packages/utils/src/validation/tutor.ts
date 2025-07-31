import {
  BIO_REGEX,
  MAX_TUTOR_ABOUT_TEXT_LENGTH,
  MAX_TUTOR_BIO_LENGTH,
  MAX_TUTOR_NOTICE_DURATION,
  MIN_TUTOR_BIO_LEGNTH,
  MIN_TUTOR_ABOUT_TEXT_LENGTH,
  MIN_TUTOR_NOTICE_DURATION,
  MIN_USER_NAME_LENGTH,
  MAX_USER_NAME_LENGTH,
  HAS_ENGLISH_CHAR_REGEX,
  HAS_ARABIC_CHAR_REGEX,
} from "@/constants";
import { FieldError, Optional } from "@litespace/types";

export function isValidTutorName(
  name: unknown
):
  | FieldError.InvalidTutorName
  | FieldError.ShortUserName
  | FieldError.LongUserName
  | true {
  if (typeof name !== "string" || HAS_ENGLISH_CHAR_REGEX.test(name))
    return FieldError.InvalidTutorName;
  if (name.length < MIN_USER_NAME_LENGTH) return FieldError.ShortUserName;
  if (name.length > MAX_USER_NAME_LENGTH) return FieldError.LongUserName;
  return true;
}

export function isValidTutorBio(
  bio: unknown
):
  | FieldError.EmptyBio
  | FieldError.ShortBio
  | FieldError.LongBio
  | FieldError.InvalidBio
  | true {
  if (typeof bio !== "string" || HAS_ENGLISH_CHAR_REGEX.test(bio))
    return FieldError.InvalidBio;
  if (!bio.length) return FieldError.EmptyBio;
  if (bio.length < MIN_TUTOR_BIO_LEGNTH) return FieldError.ShortBio;
  if (!BIO_REGEX.test(bio)) return FieldError.InvalidBio;
  if (bio.length > MAX_TUTOR_BIO_LENGTH) return FieldError.LongBio;
  return true;
}

export function isValidTutorAbout(
  about: unknown
):
  | FieldError.InvalidTutorAbout
  | FieldError.ShortTutorAbout
  | FieldError.LongTutorAbout
  | true {
  if (typeof about !== "string" || !HAS_ARABIC_CHAR_REGEX.test(about))
    return FieldError.InvalidTutorAbout;
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
