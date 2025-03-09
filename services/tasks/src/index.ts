import { Command } from "commander";
import { TelegramBot } from "@litespace/radio/telegram/bot";
import { WhatsApp } from "@litespace/radio/whatsapp";
import { config } from "@/lib/config";
import { Lesson } from "@/tasks/lesson";
import {
  availabilitySlots,
  knex,
  lessons,
  tutors,
  users,
} from "@litespace/models";
import dayjs from "@/lib/dayjs";
import { faker } from "@faker-js/faker";

async function main() {
  const telegram = new TelegramBot(config.telegram.token);
  const whatsapp = await new WhatsApp();
  await whatsapp.withStore("file");
  await whatsapp.connectAsync();

  await knex.transaction(async (tx) => {
    const studnet = await users.create(
      {
        name: "Student",
        email: faker.internet.email(),
        password: "pass",
      },
      tx
    );

    await users.update(
      studnet.id,
      {
        phone: "01552832217",
        verifiedEmail: true,
        verifiedPhone: true,
      },
      tx
    );

    const tutor = await users.create(
      {
        name: "Tutor",
        email: faker.internet.email(),
        password: "pass",
      },
      tx
    );

    await tutors.create(tutor.id, tx);

    await users.update(
      tutor.id,
      {
        phone: "01030070409",
        verifiedEmail: true,
        verifiedPhone: true,
      },
      tx
    );

    const slot = await availabilitySlots.create(
      [
        {
          start: dayjs().toISOString(),
          end: dayjs().toISOString(),
          userId: tutor.id,
        },
      ],
      tx
    );

    await lessons.create({
      start: dayjs.utc().add(10, "minutes").toISOString(),
      duration: 10,
      tutor: tutor.id,
      student: studnet.id,
      price: 10,
      session: "lesson:0x",
      slot: slot[0].id,
      tx,
    });
  });

  await new Command()
    .name("tasks")
    .description("LiteSpace automated tasks & cron jobs manager")
    .version("1.0.0")
    .addCommand(new Lesson(telegram, whatsapp).command())
    .configureOutput({
      writeErr: (str) => {
        console.error(str);
        console.info("Use --help for usage instructions!");
      },
    })
    .parseAsync();
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
