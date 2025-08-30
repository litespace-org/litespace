import { users } from "@litespace/models";
import { erpnext } from "@/lib/erpnext";
import { IUser } from "@litespace/types";
import { getEmailUserName } from "@litespace/utils/user";

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
          firstName: user.name || getEmailUserName(user.email) || "Unkown",
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
