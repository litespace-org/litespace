import {
  BIO_REGEX,
  MAX_TUTOR_ABOUT_TEXT_LENGTH,
  MAX_TUTOR_BIO_TEXT_LENGTH,
  MAX_TUTOR_NOTICE_DURATION,
  MIN_BIO_LEGNTH,
  MIN_TUTOR_NOTICE_DURATION,
} from "@/constants";
import { FieldError } from "@litespace/types";
import { getSafeInnerHtmlText } from "@/utils";

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
  if (bio.length < MIN_BIO_LEGNTH) return FieldError.ShortBio;
  if (!BIO_REGEX.test(bio)) return FieldError.InvalidBio;
  if (bio.length > MAX_TUTOR_BIO_TEXT_LENGTH) return FieldError.LongBio;
  return true;
}

export function isValidTutorAbout(
  about: string
): FieldError.EmptyTutorAbout | FieldError.LongTutorAbout | true {
  const tutorAboutText = getSafeInnerHtmlText(about);
  if (!tutorAboutText.length) return FieldError.EmptyTutorAbout;
  if (tutorAboutText.length > MAX_TUTOR_ABOUT_TEXT_LENGTH)
    return FieldError.LongTutorAbout;
  return true;
}

export function isValidTutorNotice(
  tutorNotice: number
): FieldError.MaxNoticeExceeded | FieldError.InvalidNotice | true {
  if (tutorNotice <= MIN_TUTOR_NOTICE_DURATION) return FieldError.InvalidNotice;
  if (tutorNotice > MAX_TUTOR_NOTICE_DURATION)
    return FieldError.MaxNoticeExceeded;
  return true;
}
