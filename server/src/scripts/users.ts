import { User, examiners, tutors, users } from "@/models";
import { hashPassword } from "@/lib/user";

async function main(): Promise<void> {
  const password = hashPassword("LiteSpace1###");
  const superAdmin = User.Type.SuperAdmin;
  const student = User.Type.Student;

  await users.create({
    email: "admin@litespace.com",
    name: "LiteSpace Admin",
    type: superAdmin,
    password,
  });

  await users.create({
    email: "student@litespace.com",
    name: "LiteSpace Student",
    password,
    type: User.Type.Student,
  });

  await tutors.create({
    email: "tutor@litespace.com",
    name: "LiteSpace Tutor",
    password,
  });

  await examiners.create({
    email: "examiner@litespace.com",
    name: "LiteSpace Examiner",
    password,
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
