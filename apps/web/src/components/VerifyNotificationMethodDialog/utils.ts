import { IUser } from "@litespace/types";
import { LocalId } from "@litespace/ui/locales";

export const NOTFICATION_METHOD_TO_INTL_MSG_ID: Record<
  IUser.NotificationMethodLiteral,
  LocalId
> = {
  whatsapp: "notification-method.whatsapp",
};
