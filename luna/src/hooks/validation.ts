import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { messages } from "@/locales";

const arabicRegExp = /^[\u0600-\u06FF\s]+$/;
const englishRegExp = /^[a-zA-Z\s]+$/;

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
        const regex = new RegExp(english ? englishRegExp : arabicRegExp);
        const match = regex.test(value);
        if (!match)
          return intl.formatMessage({
            id: english
              ? messages["error.name.english"]
              : messages["error.name.arabic"],
          });

        if (value.length < 3)
          return intl.formatMessage({
            id: messages["error.name.length.short"],
          });

        if (value.length > 50)
          return intl.formatMessage({
            id: messages["error.name.length.long"],
          });

        return true;
      },
    }),
    [intl, required]
  );

  const validation = useMemo(
    () =>
      ({
        required,
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
            const regex = new RegExp(/^[\u0600-\u06FF\s!\-\\\\./,]+$/);
            const match = regex.test(value);
            if (!match)
              return intl.formatMessage({
                id: messages["error.tutor.bio.arabic.only"],
              });

            if (value.length < 15)
              return intl.formatMessage({
                id: messages["error.tutor.about.or.abio.min.length.error"],
              });

            if (value.length > 50)
              return intl.formatMessage({
                id: messages["error.tutor.about.or.abio.max.length.error"],
              });

            return true;
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
      }) as const,
    [intl, required, validateName]
  );

  return validation;
}
