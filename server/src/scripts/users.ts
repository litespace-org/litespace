import { User, tutors, users } from "@/models";
import { hashPassword } from "@/lib/user";

async function main(): Promise<void> {
  const password = hashPassword("LiteSpace1###");

  await users.create({
    email: "admin@litespace.com",
    password,
    name: "Root Admin",
    avatar: null,
    type: User.Type.SuperAdmin,
  });

  const id = await users.create({
    email: "teacher@litespace.com",
    password,
    name: "My Teacher",
    avatar: null,
    type: User.Type.Tutor,
  });

  await tutors.create({
    id,
    bio: null,
    about: null,
    video: null,
  });

  await users.create({
    email: "student@litespace.com",
    password,
    name: "A Student",
    avatar: null,
    type: User.Type.Student,
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
