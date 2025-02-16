import {
  HTML_REGEX,
  MAX_MESSAGE_TEXT_LENGTH,
  MIN_MESSAGE_TEXT_LENGTH,
} from "@/constants";
import { FieldError } from "@litespace/types";
import { getSafeInnerHtmlText } from "@/utils";

export function isValidMessageText(
  message: string
):
  | FieldError.InvalidMessageText
  | FieldError.TooLongMessageText
  | FieldError.TooShortMessageText
  | true {
  const text = getSafeInnerHtmlText(message);

  if (!HTML_REGEX.test(message)) return FieldError.InvalidMessageText;
  if (text.length > MAX_MESSAGE_TEXT_LENGTH)
    return FieldError.TooLongMessageText;
  if (text.length < MIN_MESSAGE_TEXT_LENGTH)
    return FieldError.TooShortMessageText;
  return true;
}
