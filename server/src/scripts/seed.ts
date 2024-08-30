import {
  calls,
  coupons,
  invites,
  plans,
  reports,
  reportReplies,
  tutors,
  users,
  ratings,
  rooms,
  messages,
  rules,
} from "@/models";
import { ICall, IUser } from "@litespace/types";
import { hashPassword } from "@/lib/user";
import dayjs from "@/lib/dayjs";
import { knex } from "@/models/query";
import { Time } from "@litespace/sol";
import { IDate, IRule } from "@litespace/types";
import { first, range, sample } from "lodash";

async function main(): Promise<void> {
  const password = hashPassword("LiteSpace432%^&");
  const birthYear = 2001;

  const admin = await users.create({
    email: "admin@litespace.org",
    name: { en: "LiteSpace Admin", ar: "أحمد عبدالله" },
    role: IUser.Role.SuperAdmin,
    password,
    birthYear,
  });

  const interviewer = await knex.transaction(async (tx) => {
    const interviewer = await users.create(
      {
        role: IUser.Role.Interviewer,
        email: "interviewer@litespace.org",
        name: { en: "LiteSpace Interviewer", ar: "محمد جلال ابو اسمعيل" },
        password,
        birthYear,
      },
      tx
    );

    await users.update(interviewer.id, { photo: "interviewer.jpg" }, tx);
    return interviewer;
  });

  const student = await knex.transaction(async (tx) => {
    const student = await users.create(
      {
        role: IUser.Role.Student,
        email: "student@litespace.org",
        name: { en: "LiteSpace Student", ar: "إبراهيم ياسين" },
        password,
        birthYear,
      },
      tx
    );

    await users.update(
      student.id,
      { photo: "student.png", gender: IUser.Gender.Male },
      tx
    );
    return student;
  });

  const mediaProvider = await users.create({
    role: IUser.Role.MediaProvider,
    email: "media@litespace.org",
    name: { en: "LiteSpace Media Provider", ar: "يلا استب" },
    password,
    birthYear,
  });

  const addedTutors = await knex.transaction(async (tx) => {
    return await Promise.all(
      range(1, 101).map(async (idx) => {
        const email = `tutor${idx}@litespace.org`;
        const tutor = await users.create(
          {
            role: IUser.Role.Tutor,
            email,
            name: {
              en: `LiteSpace Tutor #${idx}`,
              ar: `أيمن عبدالعزيز (${idx})`,
            },
            password,
            birthYear,
          },
          tx
        );

        await tutors.create(tutor.id, tx);
        await users.update(
          tutor.id,
          {
            photo: "test.jpg",
            gender: sample([IUser.Gender.Male, IUser.Gender.Female]),
            online: sample([true, false]),
          },
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
      })
    );
  });

  const tutor = first(addedTutors);
  if (!tutor) throw new Error("Tutor not found; should never happen.");

  await ratings.create({
    raterId: student.id,
    rateeId: tutor.id,
    value: 5,
    feedback: "مدرس عظيم جدا",
  });

  const rule = await rules.create({
    userId: interviewer.id,
    frequency: IRule.Frequency.Daily,
    start: dayjs.utc().startOf("day").toISOString(),
    end: dayjs.utc().startOf("day").add(30, "days").toISOString(),
    time: Time.from("2pm").utc().format(),
    duration: 180,
    title: "Main Rule",
    weekdays: [
      IDate.Weekday.Monday,
      IDate.Weekday.Tuesday,
      IDate.Weekday.Wednesday,
      IDate.Weekday.Thursday,
      IDate.Weekday.Friday,
    ],
    monthday: sample(range(1, 31)),
  });

  const times = range(0, 24).map((hour) =>
    [hour.toString().padStart(2, "0"), "00"].join(":")
  );

  await Promise.all(
    addedTutors.map(async (tutor) => {
      await rules.create({
        userId: tutor.id,
        frequency: IRule.Frequency.Daily,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().startOf("day").add(30, "days").toISOString(),
        time: Time.from(sample(times)!).utc().format(),
        duration: 180,
        title: "Main Rule",
        weekdays: [
          sample([
            IDate.Weekday.Monday,
            IDate.Weekday.Tuesday,
            IDate.Weekday.Wednesday,
            IDate.Weekday.Thursday,
            IDate.Weekday.Friday,
            IDate.Weekday.Saturday,
            IDate.Weekday.Sunday,
          ]),
        ],
      });
    })
  );

  await calls.create({
    hostId: interviewer.id,
    attendeeId: tutor.id,
    duration: 30,
    ruleId: rule.id,
    start: dayjs
      .utc()
      .startOf("day")
      .add(Time.from("2pm").totalMinutes(), "minutes")
      .toISOString(),
    type: ICall.Type.Interview,
  });

  await calls.findHostCalls(interviewer.id);

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

  await coupons.create({
    code: "LiteSpace2024",
    planId: plan.id,
    expiresAt: dayjs().add(1, "month").toISOString(),
    fullMonthDiscount: 10_00,
    fullQuarterDiscount: 20_00,
    halfYearDiscount: 30_00,
    fullYearDiscount: 40_00,
    createdBy: admin.id,
  });

  await invites.create({
    email: "atlas@litespace.com",
    expiresAt: dayjs().add(1, "week").toISOString(),
    createdBy: admin.id,
    planId: plan.id,
  });

  await reports.create({
    createdBy: student.id,
    title: "Report title",
    description: "Report description",
    category: "Report Category",
  });

  await reportReplies.create({
    createdBy: 3,
    draft: false,
    message: "Thanks 2",
    reportId: 1,
  });

  const roomId = await rooms.create([tutor.id, interviewer.id]);

  await messages.create({
    userId: tutor.id,
    text: "Hello!",
    roomId,
  });

  await messages.create({
    userId: interviewer.id,
    text: "Nice to meet you!",
    roomId,
  });

  const interviewerRooms = await rooms.findMemberRooms(interviewer.id);
  const tutorRooms = await rooms.findMemberRooms(tutor.id);
  const roomMembers = await rooms.findRoomMembers([roomId]);

  console.log({ interviewerRooms, tutorRooms, roomMembers });
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
