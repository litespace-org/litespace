import { useCallback, useMemo } from "react";
import {
  isValidContactRequestMessage,
  isValidContactRequestTitle,
  isValidPhoneNumber,
  isValidUserName,
} from "@litespace/utils";
import { useFormatMessage } from "@/hooks/intl";
import { FieldError } from "@litespace/types";

export function useRequired() {
  const intl = useFormatMessage();
  return useMemo(
    () => ({
      value: true,
      message: intl("error/required"),
    }),
    [intl]
  );
}

export function useValidateName() {
  const intl = useFormatMessage();
  return useCallback(
    (value?: string) => {
      const valid = isValidUserName(value);
      if (valid === FieldError.InvalidUserName)
        return intl("error/name/invalid");
      if (valid === FieldError.ShortUserName) return intl("error/name/short");
      if (valid === FieldError.LongUserName) return intl("error/name/long");
      return true;
    },
    [intl]
  );
}

export function useValidatePhone() {
  const intl = useFormatMessage();

  return useCallback(
    (value: unknown) => {
      const valid = isValidPhoneNumber(value);
      if (valid === FieldError.InvalidPhoneNumber)
        return intl("error/phone/invalid");
      return true;
    },
    [intl]
  );
}

export function useValidateContactRequestTitle() {
  const intl = useFormatMessage();

  return useCallback(
    (value: unknown) => {
      const valid = isValidContactRequestTitle(value);
      if (valid === FieldError.ShortContactRequestTitle)
        return intl("error/title/short");
      if (valid === FieldError.LongContactRequestTitle)
        return intl("error/title/long");
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
        return intl("error/message/short");
      if (valid === FieldError.LongContactRequestMessage)
        return intl("error/message/long");
      return true;
    },
    [intl]
  );
}
