import { useMemo } from "react";
import { FieldValues, RegisterOptions } from "react-hook-form";
import { useIntl } from "react-intl";
import { messages } from "@/locales";

type Fields = Record<
  "name" | "email" | "password",
  RegisterOptions<FieldValues>
>;

export function useValidation(): Fields {
  const intl = useIntl();

  const validation: Fields = useMemo(
    () =>
      ({
        name: {
          required: {
            value: true,
            message: intl.formatMessage({ id: messages.errors.required }),
          },
          validate(value: string) {
            const regex = new RegExp(/^[\u0600-\u06FF\s]+$/);
            const match = regex.test(value);
            if (!match)
              return intl.formatMessage({ id: messages.errors.name.arabic });

            if (value.length < 3)
              return intl.formatMessage({
                id: messages.errors.name.length.short,
              });

            if (value.length > 50)
              return intl.formatMessage({
                id: messages.errors.name.length.long,
              });

            return true;
          },
        },
        email: {
          required: {
            value: true,
            message: intl.formatMessage({ id: messages.errors.required }),
          },
          pattern: {
            value: /^[\w-\\.]+@([\w-]+\.)+[\w-]{2,4}$/gi,
            message: intl.formatMessage({ id: messages.errors.email.invalid }),
          },
        },
        password: {
          required: {
            value: true,
            message: intl.formatMessage({ id: messages.errors.required }),
          },
          pattern: {
            value:
              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
            message: intl.formatMessage({
              id: messages.errors.password.invalid,
            }),
          },
        },
      }) as const,
    [intl]
  );

  return validation;
}
