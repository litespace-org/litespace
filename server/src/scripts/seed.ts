import {
  calls,
  coupons,
  invites,
  plans,
  reports,
  slots,
  reportReplies,
  tutors,
  users,
} from "@/models";
import { ICall, ISlot, IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import dayjs from "@/lib/dayjs";

async function main(): Promise<void> {
  const password = hashPassword("LiteSpace1###");

  const admin = await users.create({
    email: "admin@litespace.org",
    name: "LiteSpace Admin",
    role: IUser.Role.SuperAdmin,
    password,
  });

  const interviewer = await users.create({
    role: IUser.Role.Interviewer,
    email: "interviewer@litespace.org",
    name: "LiteSpace Interviewer",
    password,
  });

  const student = await users.create({
    role: IUser.Role.Student,
    email: "student@litespace.org",
    name: "LiteSpace Student",
    password,
  });

  const mediaProvider = await users.create({
    role: IUser.Role.MediaProvider,
    email: "media@litespace.org",
    name: "LiteSpace Media Provider",
    password,
  });

  const tutor = await tutors.create({
    email: "tutor@litespace.org",
    name: "LiteSpace Tutor",
    password,
  });

  const startDate = dayjs().format("YYYY-MM-DD");
  const startTime = dayjs().utc().format("HH:mm:00");
  const endTime = dayjs().utc().add(4, "hours").format("HH:mm:00");
  const slot = await slots.create({
    userId: interviewer.id,
    date: { start: startDate },
    time: { start: startTime, end: endTime },
    title: "Interviewer slot",
    repeat: ISlot.Repeat.No,
    weekday: -1,
  });
  const start = dayjs().tz("Africa/Cairo").add(30, "minutes");

  const call = await calls.create({
    hostId: interviewer.id,
    attendeeId: tutor.id,
    duration: 30,
    slotId: slot.id,
    start: start.toISOString(),
    type: ICall.Type.Interview,
  });

  const interviewerCalls = await calls.findHostCalls(interviewer.id);

  const plan = await plans.create({
    alias: "Basic",
    weeklyMinutes: 2.5 * 60,
    fullMonthPrice: 1000_00,
    fullQuarterPrice: 2000_00,
    halfYearPrice: 2000_00,
    fullYearPrice: 3000_00,
    fullMonthDiscount: 10_01,
    fullQuarterDiscount: 20_33,
    halfYearDiscount: 30_80,
    fullYearDiscount: 40_09,
    forInvitesOnly: false,
    active: true,
    createdBy: admin.id,
  });

  const coupon = await coupons.create({
    code: "LiteSpace2024",
    planId: plan.id,
    expiresAt: dayjs().add(1, "month").toISOString(),
    fullMonthDiscount: 10_00,
    fullQuarterDiscount: 20_00,
    halfYearDiscount: 30_00,
    fullYearDiscount: 40_00,
    createdBy: admin.id,
  });

  const invite = await invites.create({
    email: "atlas@litespace.com",
    expiresAt: dayjs().add(1, "week").toISOString(),
    createdBy: admin.id,
    planId: plan.id,
  });

  const report = await reports.create({
    createdBy: student.id,
    title: "Report title",
    description: "Report description",
    category: "Report Category",
  });

  const reply = await reportReplies.create({
    createdBy: 3,
    draft: false,
    message: "Thanks 2",
    reportId: 1,
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
