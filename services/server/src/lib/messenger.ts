import { messengerConfig } from "@/constants";
import { Messenger, TokenType } from "@litespace/atlas";

export const messenger = new Messenger(messengerConfig.server, {
  type: TokenType.Basic,
  username: messengerConfig.username,
  password: messengerConfig.password,
});
