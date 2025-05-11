import { LocalId } from "@litespace/ui/locales";

export type Method = "whatsapp" | "telegram";

export const PHONE_METHOD_TO_INTL_MSG_ID: Record<Method, LocalId> = {
  telegram: "verify-phone-dialog.telegram",
  whatsapp: "verify-phone-dialog.whatsapp",
};
