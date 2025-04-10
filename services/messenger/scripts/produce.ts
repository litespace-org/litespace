import { isValidPhone } from "@litespace/utils/validation";
import prompts from "prompts";
import { Producer } from "@litespace/kafka";

async function main() {
  const producer = new Producer();
  await producer.connect();

  while (true) {
    const { method, phone, message, count } = await prompts([
      {
        type: "select",
        name: "method",
        message: "Method",
        choices: [
          { title: "WhatsApp", value: "whatsapp" },
          { title: "Telegram", value: "telegram" },
        ],
      },
      {
        type: "text",
        name: "phone",
        message: "Phone",
        validate: isValidPhone,
      },
      {
        type: "text",
        name: "message",
        message: "Message",
      },
      {
        type: "number",
        name: "count",
        message: "Count",
        initial: 1,
      },
    ]);

    for (let i = 0; i < count; i++) {
      await producer.send({
        topic: method,
        value: { to: phone, message: message + ` #${i + 1}` },
      });
    }

    const { retry } = await prompts({
      type: "toggle",
      name: "retry",
      message: "Message set; try on more time?",
      initial: true,
      active: "yes",
      inactive: "no",
    });

    if (!retry) process.exit(0);
  }
}

main();
