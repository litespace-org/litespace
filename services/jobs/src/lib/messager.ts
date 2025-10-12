import { Messenger, TokenType } from "@litespace/atlas";
import { config } from "@/lib/config";
import { IMessenger, IUser } from "@litespace/types";

export const messenger = new Messenger({
  server: config.env,
  whatsAppToken: {
    type: TokenType.Bearer,
    value: config.whatsAppAPI.accessToken,
  },
  profileId: config.whatsAppAPI.profileId,
});

export function sendMsg(msg: Required<IMessenger.Message>, force?: boolean) {
  if (!config.whatsAppAPI.accessToken) return;
  if (force || msg.method === IUser.NotificationMethod.Whatsapp) {
    messenger.whatsapp
      .sendSimpleMessage({
        to: msg.to.startsWith("2") ? msg.to : `2${msg.to}`,
        template: msg.template,
      })
      .catch((e) => console.error(e));
  } else {
    console.warn("message not sent; no notification method found.");
  }
}
