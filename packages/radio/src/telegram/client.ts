import { Api, TelegramClient as Telegram } from "telegram";
import { StoreSession } from "telegram/sessions";
import prompts from "prompts";
import { EntityLike } from "telegram/define";
import { SendMessageParams } from "telegram/client/messages";
import { generateRandomBytes, readBigIntFromBuffer } from "telegram/Helpers";

type Config = {
  api: {
    id: number;
    hash: string;
  };
};

export class TelegramClient {
  public readonly client: Telegram;
  constructor(public readonly config: Config) {
    const session = new StoreSession("__telegram__", "_");
    this.client = new Telegram(session, config.api.id, config.api.hash, {});
  }

  async start() {
    await this.client.start({
      async phoneNumber(): Promise<string> {
        const { phone } = await prompts(
          {
            type: "text",
            name: "phone",
            message: "Phone",
          },
          {
            onCancel() {
              process.exit(0);
            },
          }
        );

        return phone;
      },
      async phoneCode(): Promise<string> {
        const { code } = await prompts(
          {
            type: "text",
            name: "code",
            message: "Code",
          },
          {
            onCancel() {
              process.exit(0);
            },
          }
        );

        return code;
      },
      onError: (error) => {
        console.error(error);
        console.log("Error!!");
      },
    });

    this.client.session.save();
  }

  async isContact(phone: string): Promise<boolean> {
    const peer = await this.client.invoke(
      new Api.contacts.ResolvePhone({
        phone,
      })
    );

    const [user] = peer.users;
    return !!user && user instanceof Api.User && !!user.contact;
  }

  async importContact(phone: string) {
    await this.client.invoke(
      new Api.contacts.ImportContacts({
        contacts: [
          new Api.InputPhoneContact({
            clientId: readBigIntFromBuffer(generateRandomBytes(8)),
            firstName: "User: ",
            lastName: phone,
            phone,
          }),
        ],
      })
    );
  }

  async sendMessage(entity: EntityLike, params: SendMessageParams) {
    return await this.client.sendMessage(entity, params);
  }

  public asPhoneNumber(phone: string): string {
    return `+2${phone}`;
  }
}
