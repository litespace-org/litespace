import { environment, messengerConfig } from "@/constants";
import { Messenger, TokenType } from "@litespace/atlas";
import { IMessenger, IUser } from "@litespace/types";
import { AxiosError } from "axios";

export const messenger = new Messenger({
  server: environment,
  whatsAppToken: {
    type: TokenType.Bearer,
    value: messengerConfig.whatsAppAPI.accessToken,
  },
  profileId: messengerConfig.whatsAppAPI.profileId,
});

/**
 * send message according to the user specified method.
 * @param msg - the message struct.
 * @param force - if true, the message will be sent even if the method is undefined.
 */
export function sendMsg(msg: Required<IMessenger.Message>, force?: boolean) {
  if (!messengerConfig.whatsAppAPI.accessToken) return;
  if (force || msg.method === IUser.NotificationMethod.Whatsapp) {
    messenger.whatsapp
      .sendSimpleMessage({
        to: msg.to.startsWith("2") ? msg.to : `2${msg.to}`,
        template: msg.template,
      })
      .catch((e: AxiosError) =>
        console.error("WhatsAppAPI:", e.response?.data)
      );
  } else {
    console.warn("message not sent; no notification method found.");
  }
}

export function sendOtpMsg(
  msg: Required<IMessenger.OtpMessage>,
  force?: boolean
) {
  if (force || msg.method === IUser.NotificationMethod.Whatsapp) {
    messenger.whatsapp
      .sendOtpMessage({
        to: msg.to.startsWith("2") ? msg.to : `2${msg.to}`,
        template: msg.template,
      })
      .catch((e: AxiosError) =>
        console.error("WhatsAppAPI:", e.response?.data)
      );
  } else {
    console.warn("message not sent; no notification method found.");
  }
}
