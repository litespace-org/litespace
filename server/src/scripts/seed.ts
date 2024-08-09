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
import { knex } from "@/models/query";

async function main(): Promise<void> {
  const password = hashPassword("LiteSpace432%^*");
  const birthYear = 2001;

  const admin = await users.create({
    email: "admin@litespace.org",
    name: { en: "LiteSpace Admin", ar: "أحمد عبدالله" },
    role: IUser.Role.SuperAdmin,
    password,
    birthYear,
  });

  const interviewer = await users.create({
    role: IUser.Role.Interviewer,
    email: "interviewer@litespace.org",
    name: { en: "LiteSpace Interviewer", ar: "محمد جلال ابو اسمعيل" },
    password,
    birthYear,
  });

  const student = await users.create({
    role: IUser.Role.Student,
    email: "student@litespace.org",
    name: { en: "LiteSpace Student", ar: "إبراهيم ياسين" },
    password,
    birthYear,
  });

  const mediaProvider = await users.create({
    role: IUser.Role.MediaProvider,
    email: "media@litespace.org",
    name: { en: "LiteSpace Media Provider", ar: "يلا استب" },
    password,
    birthYear,
  });

  const tutor = await knex.transaction(async (tx) => {
    const tutor = await users.create(
      {
        role: IUser.Role.Tutor,
        email: "tutor@litespace.org",
        name: { en: "LiteSpace Tutor", ar: "إسماعيل عبد الكريم" },
        password,
        birthYear,
      },
      tx
    );

    await tutors.create(tutor.id, tx);
    await users.update(
      tutor.id,
      { photo: "test.jpg", gender: IUser.Gender.Male },
      tx
    );
    await tutors.update(
      tutor.id,
      {
        video: "test.mp4",
        about: [
          "محمد بن الحسن بن الحسن بن الهيثم أبو علي البصري 965-1039، لقب بالبصري نسبة إلى مدينة البصرة. ابن الهيثم هو عالم عربي في الرياضيات والبصريات والهندسة له العديد من المؤلفات والمكتشفات العلمية التي أكدها العلم الحديث.",
          "درس ابن الهيثم ظواهر إنكسار الضوء وانعكاسه بشكل مفصّل، وخالف الآراء القديمة كنظريات بطليموس، فنفى أن الرؤية تتم بواسطة أشعة تنبعث من العين ، كما أرسى أساسيات علم العدسات وشرّح العين تشريحا كاملا .",
          'يعتبر كتاب المناظر Optics المرجع الأهم الذي استند عليه علماء العصر الحديث في تطوير التقانة الضوئية، وهو تاريخياً أول من قام بتجارب الكاميرا وهو الاسم المشتق من الكلمة العربية : " قُمرة " وتعني الغرفة المظلمة بشباك صغير.',
        ].join("\n"),
        bio: "أحب الحياة البسيطة",
        activated: true,
        activatedBy: admin.id,
        mediaProviderId: mediaProvider.id,
        passedInterview: true,
      },
      tx
    );
    return tutor;
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
