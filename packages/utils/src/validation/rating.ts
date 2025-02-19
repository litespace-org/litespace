import {
  MAX_RATING_TEXT_LENGTH,
  MAX_RATING_VALUE,
  MIN_RATING_TEXT_LENGTH,
  MIN_RATING_VALUE,
} from "@/constants";
import { FieldError } from "@litespace/types";

export function isValidRatingValue(
  ratingValue: number
): FieldError.TooLowRatingValue | FieldError.TooHighRatingValue | true {
  if (ratingValue < MIN_RATING_VALUE) return FieldError.TooLowRatingValue;
  if (ratingValue > MAX_RATING_VALUE) return FieldError.TooHighRatingValue;
  return true;
}

export function isValidRatingText(
  ratingText: string
): FieldError.TooLongRatingText | FieldError.TooShortRatingText | true {
  if (ratingText.length > MAX_RATING_TEXT_LENGTH)
    return FieldError.TooLongRatingText;
  if (ratingText.length < MIN_RATING_TEXT_LENGTH)
    return FieldError.TooShortRatingText;
  return true;
}
