import { WhatsApp } from "@litespace/radio";
import { msg } from "@/lib/bot";
import { Consumer } from "@litespace/kafka";
import ms from "ms";
import { safePromise } from "@litespace/utils/error";

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
  const whatsapp = new WhatsApp();
  await whatsapp.withStore("file");

  // Acquire whatsapp credentials
  whatsapp.connect();
  await whatsapp.wait(ms("5m"));

  const consumer = new Consumer<"whatsapp">("whatsapp");
  await consumer.connect();
  await consumer.subscribe({ topics: ["whatsapp"], fromBeginning: true });
  await consumer.run({
    async eachMessage({ topic, value }) {
      if (!value) return;
      console.log(`[${topic}]: processing mesage`);
      const id = whatsapp.asWhatsAppId(value.to);
      const result = await safePromise(
        whatsapp.sendMessage(id, { text: value.message })
      );
      if (result instanceof Error)
        await msg(`'Failed to send the whatsapp message: ${result.message}`);
      consumer.wait(["whatsapp"], ms("5s"));
    },
  });
}

main();
