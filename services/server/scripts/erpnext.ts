import { users } from "@litespace/models";
import { erpnext } from "@/lib/erpnext";
import { IUser } from "@litespace/types";
import { getEmailUserName } from "@litespace/utils/user";
import { Command } from "commander";

const addLeads = new Command().name("add-leads").action(async () => {
  const curUsers = await users.find({
    role: IUser.Role.Student,
    full: true,
  });

  await Promise.all(
    curUsers.list.map(async (user) => {
      return erpnext.document
        .createLead({
          name: `LEAD-${user.id}`,
          firstName: user.name || getEmailUserName(user.email) || "Unknown",
          email: user.email,
          phone: user.phone || undefined,
        })
        .catch(() =>
          console.warn("ErpNext Lead not created:", `LEAD-${user.id}`)
        );
    })
  );
});

const updateLeads = new Command().name("update-leads").action(async () => {
  const curUsers = await users.find({
    role: IUser.Role.Student,
    full: true,
  });

  await Promise.all(
    curUsers.list.map(async (user) => {
      return erpnext.document
        .updateLead({
          name: `LEAD-${user.id}`,
          firstName: user.name || getEmailUserName(user.email) || "Unknown",
          email: user.email,
          phone: user.phone || undefined,
        })
        .catch(() =>
          console.warn("ErpNext Lead not updated:", `LEAD-${user.id}`)
        );
    })
  );
});

const addOneLead = new Command()
  .name("add-one-lead")
  .option("-d, --id <number>", "Student Id")
  .action(async ({ id }: { id: number }) => {
    const user = await users.findById(id);
    if (!user) return;
    await erpnext.document
      .createLead({
        name: `LEAD-${user.id}`,
        firstName: user.name || getEmailUserName(user.email) || "Unknown",
        email: user.email,
        phone: user.phone || undefined,
      })
      .catch(() =>
        console.warn("ErpNext Lead not created:", `LEAD-${user.id}`)
      );
  });

const updateOneLead = new Command()
  .name("update-one-lead")
  .option("-d, --id <number>", "Student Id")
  .action(async ({ id }: { id: number }) => {
    const user = await users.findById(id);
    if (!user) return;
    await erpnext.document
      .updateLead({
        name: `LEAD-${user.id}`,
        firstName: user.name || getEmailUserName(user.email) || "Unknown",
        email: user.email,
        phone: user.phone || undefined,
      })
      .catch(() =>
        console.warn("ErpNext Lead not created:", `LEAD-${user.id}`)
      );
  });

new Command()
  .name("ERPNext")
  .description("Insert data manually in ErpNext platform")
  .version("1.0.0", "-v")
  .addCommand(addLeads)
  .addCommand(addOneLead)
  .addCommand(updateLeads)
  .addCommand(updateOneLead)
  .parse();
