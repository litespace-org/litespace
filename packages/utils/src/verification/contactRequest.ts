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
  name: string
): FieldError.ShortName | FieldError.LongName | FieldError.InvalidName | true {
  if (name.length < MIN_NAME_LENGTH) return FieldError.ShortName;
  if (name.length > MAX_NAME_LENGTH) return FieldError.LongName;
  if (!ALPHABETIC.test(name)) return FieldError.InvalidName;
  return true;
}

export function isValidContactRequestTitle(
  title: string
):
  | FieldError.ShortContactRequestTitle
  | FieldError.LongContactRequestTitle
  | true {
  if (title.length < MIN_CONTACT_REQUEST_TITLE_LENGTH)
    return FieldError.ShortContactRequestTitle;
  if (title.length > MAX_CONTACT_REQUEST_TITLE_LENGTH)
    return FieldError.LongContactRequestTitle;
  return true;
}

export function isValidContactRequestMessage(
  message: string
):
  | FieldError.ShortContactRequestMessage
  | FieldError.LongContactRequestMessage
  | true {
  if (message.length < MIN_CONTACT_REQUEST_MESSAGE_LENGTH)
    return FieldError.ShortContactRequestMessage;
  if (message.length > MAX_CONTACT_REQUEST_MESSAGE_LENGTH)
    return FieldError.LongContactRequestMessage;
  return true;
}
