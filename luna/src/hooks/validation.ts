import { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";
import { messages } from "@/locales";

export function useValidation() {
  const intl = useIntl();

  const required = useMemo(
    () => ({
      value: true,
      message: intl.formatMessage({ id: messages["errors.required"] }),
    }),
    [intl]
  );

  const validateName = useCallback(
    (english: boolean) => ({
      required,
      validate(value: string) {
        const regex = new RegExp(
          english ? /^[a-zA-Z\s]+$/ : /^[\u0600-\u06FF\s]+$/
        );
        const match = regex.test(value);
        if (!match)
          return intl.formatMessage({
            id: english
              ? messages["errors.name.english"]
              : messages["errors.name.arabic"],
          });

        if (value.length < 3)
          return intl.formatMessage({
            id: messages["errors.name.length.short"],
          });

        if (value.length > 50)
          return intl.formatMessage({
            id: messages["errors.name.length.long"],
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
              id: messages["errors.email.invlaid"],
            }),
          },
        },
        password: {
          required,
          pattern: {
            value:
              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
            message: intl.formatMessage({
              id: messages["errors.password.invlaid"],
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
      }) as const,
    [intl, required, validateName]
  );

  return validation;
}
