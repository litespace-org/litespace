import {
  MAX_CONTACT_REQUEST_TITLE_LENGTH,
  MAX_CONTACT_REQUEST_MESSAGE_LENGTH,
  MIN_CONTACT_REQUEST_TITLE_LENGTH,
  MIN_CONTACT_REQUEST_MESSAGE_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  ALPHABETIC,
} from "@/constants";
import { FieldError } from "@litespace/types";

export function isValidName(
  name: unknown
):
  | FieldError.ShortName
  | FieldError.LongName
  | FieldError.InvalidName
  | FieldError.InvalidType
  | true {
  if (typeof name !== "string") return FieldError.InvalidType;
  if (name.length < MIN_NAME_LENGTH) return FieldError.ShortName;
  if (name.length > MAX_NAME_LENGTH) return FieldError.LongName;
  if (!ALPHABETIC.test(name)) return FieldError.InvalidName;
  return true;
}

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
