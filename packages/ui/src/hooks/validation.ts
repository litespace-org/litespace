import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { LocalId, messages } from "@/locales";
import dayjs from "@/lib/dayjs";
import { Time } from "@litespace/utils/time";
import { Duration } from "@litespace/utils/duration";
import { useFormatMessage } from "@/hooks/intl";
import { FieldError } from "@litespace/types";
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidTutorBio,
  isValidUserName,
} from "@litespace/utils/validation";

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
      if (valid === FieldError.InvalidEmail) return intl("error.email.invlaid");
      return true;
    },
    [required, intl]
  );
}

export function useValidateBio(required: boolean = false) {
  const intl = useFormatMessage();

  const errorMap = useMemo(
    (): Record<
      | FieldError.EmptyBio
      | FieldError.ShortBio
      | FieldError.LongBio
      | FieldError.InvalidBio,
      LocalId
    > => ({
      [FieldError.EmptyBio]: "error.bio.empty",
      [FieldError.ShortBio]: "error.bio.short",
      [FieldError.LongBio]: "error.bio.long",
      [FieldError.InvalidBio]: "error.bio.invalid",
    }),
    []
  );

  return useCallback(
    (value: unknown) => {
      if (!required && !value) return true;
      if (required && !value) return intl("error.required");
      const valid = isValidTutorBio(value);
      if (valid !== true) return intl(errorMap[valid]);
      return true;
    },
    [required, intl, errorMap]
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

const arabicRegExp = /^[\u0600-\u06FF\s]+$/;
const englishRegExp = /^[a-zA-Z\s]+$/;

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

export function useValidation() {
  const intl = useIntl();

  const required = useMemo(
    () => ({
      value: true,
      message: intl.formatMessage({ id: messages["error.required"] }),
    }),
    [intl]
  );

  const validateName = useCallback(
    (english: boolean) => ({
      required,
      validate(value: string) {
        return validateText({
          value,
          regex: english ? englishRegExp : arabicRegExp,
          length: { min: 3, max: 50 },
          errors: {
            match: intl.formatMessage({
              id: messages["error.name.invalid"],
            }),
            min: intl.formatMessage({
              id: messages["error.name.length.short"],
            }),
            max: intl.formatMessage({
              id: messages["error.name.length.long"],
            }),
          },
        });
      },
    }),
    [intl, required]
  );

  const validateDate = useCallback(
    ({ date, min, max }: { date: string; min?: string; max?: string }) => {
      const day = dayjs(date);
      const valid = day.isValid();
      const before =
        !!min && (day.isBefore(min, "day") || day.isSame(min, "day"));
      const after =
        !!max && (day.isAfter(max, "day") || day.isSame(max, "day"));

      if (!valid || before || after)
        return intl.formatMessage({ id: messages["error.schedule.date"] });

      return true;
    },
    [intl]
  );

  const validateTime = useCallback(
    ({ time, min, max }: { time: Time; min?: Time; max?: Time }) => {
      const same =
        (min && time.isSame(min, "m")) || (max && time.isSame(max, "m"));

      const before = min && time.isBefore(min);
      const after = max && time.isAfter(max);

      if (same || before || after)
        return intl.formatMessage({ id: messages["error.schedule.time"] });

      return true;
    },
    [intl]
  );

  const validation = useMemo(
    () =>
      ({
        required,
        validateTime,
        validateDate,
        name: {
          en: validateName(true),
          ar: validateName(false),
        },
        email: {
          required,
          pattern: {
            value: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/gi,
            message: intl.formatMessage({
              id: messages["error.email.invlaid"],
            }),
          },
        },
        password: {
          required,
          pattern: {
            value:
              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
            message: intl.formatMessage({
              id: messages["error.password.invlaid"],
            }),
          },
        },
        message: {
          maxLength: {
            value: 500,
            message: intl.formatMessage({
              id: messages["global.chat.input.error.length.max"],
            }),
          },
        },
        birthYear: {
          validate(value: string) {
            const year = Number(value);
            if (Number.isNaN(year)) return "Invalid birth year";

            const current = new Date().getFullYear();
            const max = current - 10;
            const min = current - 100;

            if (year > max) return "You still too young!!";
            if (year < 1_900) return "Invalid year";
            if (year < min) return "You are too old!!";
            return true;
          },
        },
        bio: {
          required,
          validate(value: string) {
            return validateText({
              value,
              regex: /^[\u0600-\u06FF\s!\-\\\\./,]+$/,
              length: { min: 15, max: 50 },
              errors: {
                match: intl.formatMessage({
                  id: messages["error.tutor.bio.arabic.only"],
                }),
                min: intl.formatMessage({
                  id: messages["error.tutor.about.or.abio.min.length.error"],
                }),
                max: intl.formatMessage({
                  id: messages["error.tutor.about.or.abio.max.length.error"],
                }),
              },
            });
          },
        },
        about: {
          required,
          minLength: {
            value: 50,
            message: intl.formatMessage({
              id: messages["error.tutor.about.or.abio.min.length.error"],
            }),
          },
          maxLength: {
            value: 1000,
            message: intl.formatMessage({
              id: messages["error.tutor.about.or.abio.max.length.error"],
            }),
          },
        },
        slotTitle: {
          required,
          validate(value: string) {
            return validateText({
              value,
              regex: /^[\u0600-\u06FF\d\s!\-\\\\./,]+$/, // arabic letters + numbers + some special symbols
              length: { min: 5, max: 255 },
              errors: {
                match: intl.formatMessage({
                  id: messages["error.schedule.title.arabic.only"],
                }),
                min: intl.formatMessage({
                  id: messages["error.schedule.title.min.length"],
                }),
                max: intl.formatMessage({
                  id: messages["error.schedule.title.max.length"],
                }),
              },
            });
          },
        },
      }) as const,
    [intl, required, validateDate, validateName, validateTime]
  );

  return validation;
}

export function useValidateDuration() {
  const intl = useIntl();
  const required = useRequired();

  return useMemo(
    () => ({
      required,
      validate(duration: Duration) {
        if (duration.minutes() < 30)
          return intl.formatMessage({
            id: messages["error.schedule.duration"],
          });
        return true;
      },
    }),
    [intl, required]
  );
}

export function useValidatePlanAlias() {
  const intl = useFormatMessage();
  const required = useRequired();

  return useMemo(
    () => ({
      required,
      validate: <T>(value: T) => {
        return validateText({
          regex: arabicRegExp,
          value: typeof value === "string" ? value.toString() : "",
          errors: {
            match: intl("error.plan.title.invalid"),
            min: intl("error.plan.title.short"),
            max: intl("error.plan.title.long"),
          },
          length: { min: 3, max: 50 },
        });
      },
    }),
    [intl, required]
  );
}

export function useValidatePlanWeeklyMinutes() {
  const intl = useFormatMessage();
  const required = useRequired();
  return useMemo(
    () => ({
      required,
      validate: <T>(duration: T) => {
        if (duration instanceof Duration && duration.minutes() > 0) return true;
        return intl("error.required");
      },
    }),
    [intl, required]
  );
}

export function useValidatePrice() {
  const intl = useFormatMessage();
  const required = useRequired();
  return useMemo(
    () => ({
      required,
      validate: <T>(value: T) => {
        if (typeof value !== "number" || value <= 0)
          return intl("error.plan.price.absent");
        return true;
      },
    }),
    [intl, required]
  );
}

export function useValidateDiscount() {
  const intl = useFormatMessage();

  return useMemo(
    () => ({
      validate: <T>(value: T) => {
        if (typeof value !== "number" || value < 0 || value > 100) {
          return intl("error.form.invalid");
        }
        return true;
      },
    }),
    [intl]
  );
}
