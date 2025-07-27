import { LocalId } from "@litespace/ui/locales";

export type Method = "whatsapp";

export const PHONE_METHOD_TO_INTL_MSG_ID: Record<Method, LocalId> = {
  whatsapp: "verify-phone-dialog.whatsapp",
};
