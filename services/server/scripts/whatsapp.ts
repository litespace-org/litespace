import { Command } from "commander";
import { IUser } from "@litespace/types";
import { sendMsg } from "../src/lib/messenger";

const generateTokenCommand = new Command()
  .name("generate-token")
  .option("-a, --id <string>", "WhatsApp API AppId")
  .option("-s, --secret <string>", "WhatsApp API SecretKey")
  .option("-t, --token <string>", "WhatsApp API Temporary Access Token")
  .action(
    async ({
      id,
      secret,
      token,
    }: {
      id: string;
      secret: string;
      token: string;
    }) => {
      fetch(
        `https://graph.facebook.com/v23.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${id}&client_secret=${secret}&fb_exchange_token=${token}`
      )
        .then((res) => res.json())
        .then(console.log)
        .catch(console.error);
    }
  );

const sendMessageCommand = new Command()
  .name("send-message")
  .option(
    "-r, --receiver <string>",
    "The phone number that should recieve the message"
  )
  .option(
    "-t, --template <string>",
    "The template to be sent: hello_world or ad_message"
  )
  .action(
    async ({
      receiver,
      template,
    }: {
      receiver: string;
      template?: "hello_world" | "ad_message";
    }) => {
      sendMsg({
        to: receiver,
        template: {
          name: template || "hello_world",
          parameters: {},
        },
        method: IUser.NotificationMethod.Whatsapp,
      });
    }
  );

new Command()
  .name("WhatsApp API")
  .description(
    "Generate long-lived whatsapp api access token from the temp one"
  )
  .version("1.0.0", "-v")
  .addCommand(generateTokenCommand)
  .addCommand(sendMessageCommand)
  .parse();
