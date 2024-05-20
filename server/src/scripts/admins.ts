import { User, users } from "@/database";

async function main(): Promise<void> {
  await users.create({
    email: "admin@litespace.com",
    password: "LiteSpace1###",
    name: "Root Admin",
    avatar: null,
    type: User.Type.SuperAdmin,
  });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
