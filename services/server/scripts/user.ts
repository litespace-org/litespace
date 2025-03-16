import prompts from "prompts";
import { IUser } from "@litespace/types";
import {
  isValidPassword,
  isValidEmail,
  isValidUserName,
} from "@litespace/utils/validation";
import { users, hashPassword } from "@litespace/models";

async function main() {
  const response = await prompts([
    {
      type: "text",
      name: "name",
      message: "Name",
      validate: isValidUserName,
    },
    {
      type: "text",
      name: "email",
      message: "Email",
      validate: isValidEmail,
    },
    {
      type: "password",
      name: "password",
      message: "Password",
      validate: isValidPassword,
    },
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
      ],
    },
  ]);

  const user = await users.create({
    name: response.name,
    email: response.email.toLowerCase(),
    role: response.role,
    password: hashPassword(response.password),
  });

  console.log(JSON.stringify(user, null, 2));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
