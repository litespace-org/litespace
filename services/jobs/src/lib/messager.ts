import { Messenger, TokenType } from "@litespace/atlas";
import { config } from "@/lib/config";
import { IMessenger, IUser } from "@litespace/types";

export const messenger = new Messenger({
  server: config.env,
  whatsAppToken: {
    type: TokenType.Bearer,
    value: config.whatsAppAPI.accessToken,
  },
});

export function sendMsg(msg: Required<IMessenger.Message>) {
  if (msg.method === IUser.NotificationMethod.Whatsapp) {
    messenger.whatsapp
      .sendSimpleMessage({
        to: msg.to.startsWith("2") ? msg.to : `2${msg.to}`,
        template: msg.template,
      })
      .catch((e) => console.error(e));
  }
  console.warn("message not sent; no notification method found.");
}
