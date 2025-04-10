import { TelegramClient } from "@litespace/radio";
import { config } from "@/lib/config";
import { msg } from "@/lib/bot";
import { Consumer } from "@litespace/kafka";
import ms from "ms";
import { safePromise } from "@litespace/utils";

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

  const consumer = new Consumer<"telegram">("telegram");
  await consumer.connect();
  await consumer.subscribe({ topics: ["telegram"], fromBeginning: true });
  await consumer.run({
    async eachMessage({ topic, value }) {
      console.log(`[${topic}]: processing mesage`);
      if (!value) return;
      const id = telegram.asPhoneNumber(value.to);
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
