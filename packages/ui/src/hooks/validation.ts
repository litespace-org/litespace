import { useCallback, useMemo } from "react";
import { LocalId } from "@/locales";
import { useFormatMessage } from "@/hooks/intl";
import { FieldError } from "@litespace/types";
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidUserName,
} from "@litespace/utils/validation";
import { Validators } from "@litespace/headless/form";
import { keys } from "lodash";

export function useRequired() {
  const intl = useFormatMessage();
  return useMemo(
    () => ({
      value: true,
      message: intl("error.required"),
    }),
    [intl]
  );
}

export function useValidatePassword(required?: boolean) {
  const intl = useFormatMessage();

  const errorMap: Record<
    | FieldError.ShortPassword
    | FieldError.LongPassword
    | FieldError.InvalidPassword,
    LocalId
  > = useMemo(
    () => ({
      [FieldError.ShortPassword]: "error.password.short",
      [FieldError.LongPassword]: "error.password.long",
      [FieldError.InvalidPassword]: "error.password.invalid",
    }),
    []
  );
  return useCallback(
    (value: unknown) => {
      if (!value && !required) return true;
      if (!value && required) return intl("error.required");
      if (typeof value === "string" && !value && !required) return true;
      const valid = isValidPassword(value);
      if (valid !== true) return intl(errorMap[valid]);
      return true;
    },
    [errorMap, intl, required]
  );
}

export function useValidateUserName(required: boolean = false) {
  const intl = useFormatMessage();

  const errorMap: Record<
    | FieldError.InvalidUserName
    | FieldError.LongUserName
    | FieldError.ShortUserName,
    LocalId
  > = useMemo(
    () => ({
      [FieldError.InvalidUserName]: "error.name.invalid",
      [FieldError.LongUserName]: "error.name.length.long",
      [FieldError.ShortUserName]: "error.name.length.short",
    }),
    []
  );

  return useCallback(
    (value: unknown) => {
      if (!value && !required) return true;
      if (!value && required) return intl("error.required");
      const valid = isValidUserName(value);
      if (valid !== true) return intl(errorMap[valid]);
      return true;
    },
    [required, errorMap, intl]
  );
}

export function useValidateEmail(required: boolean = false) {
  const intl = useFormatMessage();

  return useCallback(
    (value: unknown) => {
      const valid = isValidEmail(value);
      if (!required && !value) return true;
      if (required && !value) return intl("error.required");
      if (valid === FieldError.InvalidEmail) return intl("error.email.invalid");
      return true;
    },
    [required, intl]
  );
}

export function useValidatePhone(required?: boolean) {
  const intl = useFormatMessage();

  return useCallback(
    (value: unknown) => {
      if (!required && !value) return true;
      const valid = isValidPhone(value);
      if (valid === FieldError.InvalidPhone)
        return intl("error.phone-number.invlaid");
      return true;
    },
    [intl, required]
  );
}

export function validateText({
  regex,
  value,
  length,
  errors,
}: {
  regex: RegExp;
  value: string;
  length: { min: number; max: number };
  errors: { match: string; min: string; max: string };
}): string | boolean {
  const match = regex.test(value);
  if (!match) return errors.match;
  if (value.length < length.min) return errors.min;
  if (value.length > length.max) return errors.max;
  return true;
}

type ValidatePayload<T extends object, K extends keyof T> = {
  required?: boolean;
  validate?: (value: T[K], state: T) => LocalId | null;
};

export function useMakeValidators<T extends object>(validators: {
  [K in keyof T]?: ValidatePayload<T, K>;
}): Validators<T> {
  const intl = useFormatMessage();

  return useMemo(() => {
    const output: Validators<T> = {};

    for (const key of keys(validators)) {
      const safeKey = key as keyof T;
      const safeValue = validators[safeKey];
      if (!safeValue?.required && !safeValue?.validate) continue;

      output[safeKey] = (value, state) => {
        if (
          safeValue.required &&
          (value === undefined || value === null || value === "")
        )
          return intl("error.required");
        if (safeValue.required === false && !value) return true;
        const messageId = safeValue.validate?.(value, state);
        if (messageId) return intl(messageId);
        return true;
      };
    }

    return output;
  }, [intl, validators]);
}
