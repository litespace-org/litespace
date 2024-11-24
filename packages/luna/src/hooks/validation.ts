import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { messages } from "@/locales";
import dayjs from "@/lib/dayjs";
import { Time } from "@litespace/sol/time";
import { Duration } from "@litespace/sol/duration";
import { useFormatMessage } from "./intl";
import { FieldError } from "@litespace/types";
import {
  isValidEmail,
  isValidPhoneNumber,
  isValidUserName,
} from "@litespace/sol/verification";

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

export function useValidatePassword(create: boolean = false) {
  const intl = useFormatMessage();
  const required = useRequired();

  return {
    pattern: {
      value: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
      message: intl("error.password.invlaid"),
    },
    required: create ? required : false,
  };
}

export function useValidateUsername(create: boolean = false) {
  const intl = useFormatMessage();
  const required = useRequired();

  return useCallback(
    (value: unknown) => {
      const valid = isValidUserName(value);
      if (create && required) return required.message;
      if (valid === FieldError.InvalidUserName)
        return intl("error.name.invalid");
      if (valid === FieldError.LongUserName)
        return intl("error.name.length.long");
      if (valid === FieldError.ShortUserName)
        return intl("error.name.length.short");
      return true;
    },
    [create, intl, required]
  );
}

export function useValidateEmail(create: boolean = false) {
  const intl = useFormatMessage();
  const required = useRequired();

  return useCallback(
    (value: unknown) => {
      const valid = isValidEmail(value);
      if (create && required) return required.message;
      if (valid === FieldError.InvalidEmail) return intl("error.email.invlaid");
      return true;
    },
    [create, intl, required]
  );
}

export function useValidatePhoneNumber(create: boolean = false) {
  const intl = useFormatMessage();
  const required = useRequired();

  return useCallback(
    (value: unknown) => {
      const valid = isValidPhoneNumber(value);
      if (create && required) return required.message;
      if (valid === FieldError.InvalidPhoneNumber)
        return intl("error.phone.number.invlaid");
    },
    [intl]
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
              id: english ? "remove me" : "remove me too",
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
      } as const),
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
