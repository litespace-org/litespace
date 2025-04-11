import { TelegramClient } from "@litespace/radio";
import { config } from "@/lib/config";
import { msg } from "@/lib/bot";
import { Consumer } from "@litespace/kafka";
import ms from "ms";
import { safePromise } from "@litespace/utils";
import { Api } from "telegram";
// import { generateRandomBytes, readBigIntFromBuffer } from "telegram/Helpers";

// Global error handling. This is needed to prevent the server process from
// exit.
process.on("uncaughtException", async (error) => {
  console.log("Uncaught exception");
  console.error(error);
  try {
    await msg(`uncaught exception: ${error.message}`);
  } catch (error) {
    console.log(`Failed to notify the exception: `, error);
  }
});

async function main() {
  const telegram = new TelegramClient({
    api: {
      id: config.telegram.client.id,
      hash: config.telegram.client.hash,
    },
  });
  await telegram.start();

  // const result = await telegram.client.invoke(
  //   new Api.contacts.AddContact({
  //     firstName: "Ahmed",
  //     lastName: "Ibrahim",
  //     phone: "+201552832217",
  //   })
  // );

  // console.log(result);

  // const result = await telegram.client.invoke(
  //   new Api.contacts.ImportContacts({
  //     contacts: [
  //       new Api.InputPhoneContact({
  //         clientId: readBigIntFromBuffer(generateRandomBytes(8)),
  //         // phone: "+201552832217",
  //         // firstName: "Ahmed",
  //         // lastName: "Ibrahim",
  //         phone: "+966544546735",
  //         firstName: "Heba",
  //         lastName: "Ibrahim",
  //       }),
  //     ],
  //   })
  // );

  const result = await telegram.client.invoke(
    new Api.contacts.ResolvePhone({
      // phone: "+201018303125",
      phone: "+966544546735",
      // phone: "+201143759540",
      // phone: "+201030070409",
      // phone: "+201062818862",
    })
  );

  const [user] = result.users;
  const id = user.id;

  const consumer = new Consumer<"telegram">("telegram");
  await consumer.connect();
  await consumer.subscribe({ topics: ["telegram"], fromBeginning: true });
  await consumer.run({
    async eachMessage({ topic, value }) {
      console.log(`[${topic}]: processing mesage`);
      if (!value) return;
      // const id = telegram.asPhoneNumber(value.to);
      const result = await safePromise(
        telegram.sendMessage(id, { message: value.message })
      );
      if (result instanceof Error)
        await msg(`'Failed to send telegram message: ${result.message}`);
      consumer.wait(["telegram"], ms("5s"));
    },
  });
}

main();
