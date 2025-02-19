import { useCallback } from "react";
import {
  isValidContactRequestMessage,
  isValidContactRequestTitle,
  isValidEmail,
  isValidUserName,
} from "@litespace/utils";
import { useFormatMessage } from "@/hooks/intl";
import { FieldError } from "@litespace/types";

export function useValidateName() {
  const intl = useFormatMessage();
  return useCallback(
    (value?: string) => {
      const valid = isValidUserName(value);
      if (valid === FieldError.InvalidUserName)
        return intl("error/name/invalid");
      if (valid === FieldError.ShortUserName) return intl("error/short/text");
      if (valid === FieldError.LongUserName) return intl("error/long/text");
      return true;
    },
    [intl]
  );
}

export function useValidateEmail(required: boolean = false) {
  const intl = useFormatMessage();

  return useCallback(
    (value: unknown) => {
      const valid = isValidEmail(value);
      if (!required && !value) return true;
      if (required && !value) return intl("error/required");
      if (valid === FieldError.InvalidEmail) return intl("error/email/invalid");
      return true;
    },
    [required, intl]
  );
}

export function useValidateContactRequestTitle() {
  const intl = useFormatMessage();

  return useCallback(
    (value: unknown) => {
      const valid = isValidContactRequestTitle(value);
      if (valid === FieldError.ShortContactRequestTitle)
        return intl("error/short/text");
      if (valid === FieldError.LongContactRequestTitle)
        return intl("error/long/text");
      return true;
    },
    [intl]
  );
}

export function useValidateContactRequestMessage() {
  const intl = useFormatMessage();

  return useCallback(
    (value: unknown) => {
      const valid = isValidContactRequestMessage(value);
      if (valid === FieldError.ShortContactRequestMessage)
        return intl("error/short/text");
      if (valid === FieldError.LongContactRequestMessage)
        return intl("error/long/text");
      return true;
    },
    [intl]
  );
}
