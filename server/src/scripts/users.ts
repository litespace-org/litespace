import { User, tutors, users } from "@/database";

async function main(): Promise<void> {
  await users.create({
    email: "admin@litespace.com",
    password: "LiteSpace1###",
    name: "Root Admin",
    avatar: null,
    type: User.Type.SuperAdmin,
  });

  const id = await users.create({
    email: "teacher@litespace.com",
    password: "LiteSpace1###",
    name: "My Teacher",
    avatar: null,
    type: User.Type.Tutor,
  });

  const now = new Date().toISOString();

  await tutors.create({
    id,
    bio: null,
    about: null,
    video: null,
    createdAt: now,
    updatedAt: now,
  });

  await users.create({
    email: "student@litespace.com",
    password: "LiteSpace1###",
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
