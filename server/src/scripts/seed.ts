import { examiners, tutors, users, zoomAccounts } from "@/models";
import { IUser, IZoomAccount } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import { createZoomMeeting } from "@/integrations/zoom";
import zod from "zod";
import dayjs from "@/lib/dayjs";

function loadZoomAccount(index: number): IZoomAccount.CreatePayload {
  const email = `ZOOM_ACCOUNT_EMAIL_${index}`;
  const accountId = `ZOOM_ACCOUNT_ID_${index}`;
  const clientId = `ZOOM_CLIENT_ID_${index}`;
  const clientSecret = `ZOOM_CLIENT_SECRET_${index}`;

  return {
    email: zod.string().email().parse(process.env[email]),
    accountId: zod.string().parse(process.env[accountId]),
    clientId: zod.string().parse(process.env[clientId]),
    clientSecret: zod.string().parse(process.env[clientSecret]),
  };
}

const zoomApps = [loadZoomAccount(1), loadZoomAccount(2)];

async function main(): Promise<void> {
  const password = hashPassword("LiteSpace1###");
  const superAdmin = IUser.Type.SuperAdmin;

  const admin = await users.create({
    email: "admin@litespace.com",
    name: "LiteSpace Admin",
    type: superAdmin,
    password,
  });

  const student = await users.create({
    type: IUser.Type.Student,
    email: "student@litespace.com",
    name: "LiteSpace Student",
    password,
  });

  const tutor = await tutors.create({
    email: "tutor@litespace.com",
    name: "LiteSpace Tutor",
    password,
  });

  const examiner = await examiners.create({
    email: "examiner@litespace.com",
    name: "LiteSpace Examiner",
    password,
  });

  for (const app of zoomApps) {
    await zoomAccounts.create(app);
  }

  const now = dayjs().tz("Africa/Cairo").add(30, "minutes");
  const meeting = await createZoomMeeting({
    participants: [],
    start: now.format("YYYY-MM-DDTHH:mm:ss"),
    duration: 30,
  });

  console.log({ meeting });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
