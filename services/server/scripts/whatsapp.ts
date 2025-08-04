import { Command } from "commander";

const commentCommand = new Command()
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
        .then(console.log);
    }
  );

new Command()
  .name("WhatsApp API")
  .description("Generate long-live whatsapp api access token from the temp one")
  .version("1.0.0", "-v")
  .addCommand(commentCommand)
  .parse();
