import { users } from "@litespace/models";
import { erpnext } from "../src/lib/erpnext";
import { IUser } from "@litespace/types";

async function main() {
  const curUsers = await users.find({
    role: IUser.Role.Student,
    full: true,
  });

  await Promise.all(
    curUsers.list.map(async (user) => {
      const userNameParts = user.name?.split(" ");
      return erpnext.document
        .createLead({
          name: `LEAD-${user.id}`,
          firstName: userNameParts
            ? userNameParts[0]
            : user.email.split("@")[0],
          lastName: userNameParts
            ? userNameParts[userNameParts?.length - 1]
            : undefined,
          email: user.email,
          phone: user.phone || undefined,
        })
        .catch(() =>
          console.warn("ErpNext Lead not created:", `LEAD-${user.id}`)
        );
    })
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  });
