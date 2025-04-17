import { Command } from "commander";
import prompts from "prompts";
import { knex, users } from "@litespace/models";
import { IUser } from "@litespace/types";

const create = new Command("create").action(async () => {
  const { name, email, phone, password, notificationMethod, role } =
    await prompts(
      [
        {
          type: "select",
          name: "role",
          message: "Role",
          choices: [
            {
              title: "Super Admin",
              value: IUser.Role.SuperAdmin,
            },
            {
              title: "Regular Admin",
              value: IUser.Role.RegularAdmin,
            },
            {
              title: "Tutor Manager",
              value: IUser.Role.TutorManager,
            },
            {
              title: "Tutor",
              value: IUser.Role.Tutor,
            },
            {
              title: "Student",
              value: IUser.Role.Student,
            },
          ],
        },
        {
          type: "text",
          name: "name",
          message: "Name",
        },
        {
          type: "text",
          name: "email",
          message: "Email",
        },
        {
          type: "password",
          name: "password",
          message: "Password",
        },
        {
          type: "text",
          name: "phone",
          message: "Phone",
        },
        {
          type: "select",
          name: "notificationMethod",
          initial: "whatsapp",
          message: "Notification",
          choices: [
            {
              title: "WhatsApp",
              value: "whatsapp",
            },
            {
              title: "Telegram",
              value: "telegram",
            },
            {
              title: "None",
              value: null,
            },
          ],
        },
      ],
      {
        onCancel: () => process.exit(0),
      }
    );

  await knex.transaction(async (tx) => {
    const user = await users.create(
      {
        role,
        name,
        email,
        password,
        notificationMethod,
        verifiedEmail: true,
        verifiedPhone: true,
      },
      tx
    );

    await users.update(user.id, { phone }, tx);
    console.log(JSON.stringify(user, null, 2));
  });

  process.exit(0);
});

export const user = new Command("user").addCommand(create);
