import {
  MAX_CONTACT_REQUEST_TITLE_LENGTH,
  MAX_CONTACT_REQUEST_MESSAGE_LENGTH,
  MIN_CONTACT_REQUEST_TITLE_LENGTH,
  MIN_CONTACT_REQUEST_MESSAGE_LENGTH,
} from "@/constants";
import { FieldError } from "@litespace/types";

export function isValidContactRequestTitle(
  title: unknown
):
  | FieldError.ShortContactRequestTitle
  | FieldError.LongContactRequestTitle
  | FieldError.InvalidType
  | true {
  if (typeof title !== "string") return FieldError.InvalidType;
  if (title.length < MIN_CONTACT_REQUEST_TITLE_LENGTH)
    return FieldError.ShortContactRequestTitle;
  if (title.length > MAX_CONTACT_REQUEST_TITLE_LENGTH)
    return FieldError.LongContactRequestTitle;
  return true;
}

export function isValidContactRequestMessage(
  message: unknown
):
  | FieldError.ShortContactRequestMessage
  | FieldError.LongContactRequestMessage
  | FieldError.InvalidType
  | true {
  if (typeof message !== "string") return FieldError.InvalidType;
  if (message.length < MIN_CONTACT_REQUEST_MESSAGE_LENGTH)
    return FieldError.ShortContactRequestMessage;
  if (message.length > MAX_CONTACT_REQUEST_MESSAGE_LENGTH)
    return FieldError.LongContactRequestMessage;
  return true;
}
