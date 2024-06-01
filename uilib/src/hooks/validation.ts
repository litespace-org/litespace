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
          minLength: {
            value: 3,
            message: intl.formatMessage({
              id: messages.errors.name.length.short,
            }),
          },
          maxLength: {
            value: 50,
            message: intl.formatMessage({
              id: messages.errors.name.length.long,
            }),
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
