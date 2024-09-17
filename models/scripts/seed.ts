import {
  knex,
  users,
  tutors,
  ratings,
  rules,
  calls,
  plans,
  coupons,
  invites,
  reports,
  reportReplies,
  messages,
  rooms,
  lessons,
  interviews,
  withdrawMethods,
  invoices,
} from "@/index";
import {
  ICall,
  IInvoice,
  ILesson,
  IUser,
  IWithdrawMethod,
} from "@litespace/types";
import dayjs from "@/lib/dayjs";
import { Time } from "@litespace/sol";
import { IDate, IRule } from "@litespace/types";
import { first, map, random, range, sample } from "lodash";
import crypto from "node:crypto";
import { Knex } from "knex";
import "colors";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

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
        name: { en: "LiteSpace Interviewer", ar: "محمد جلال ابو إسماعيل" },
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

  await knex.transaction(async (tx) => {
    const { call } = await calls.create(
      {
        hostId: interviewer.id,
        memberIds: [tutor.id],
        duration: 30,
        ruleId: rule.id,
        start: dayjs.utc().toISOString(),
      },
      tx
    );

    await calls.update(
      [call.id],
      { recordingStatus: ICall.RecordingStatus.Recording },
      tx
    );
  });

  function randomStart(): string {
    return dayjs
      .utc()
      .subtract(50, "hours")
      .add(sample(range(1, 100))!, "hours")
      .set("hours", sample(range(0, 24))!)
      .set("minutes", sample([0, 15, 30, 45])!)
      .startOf("minutes")
      .toISOString();
  }

  function randomCallRecordingStatus(): ICall.RecordingStatus {
    return sample([
      ICall.RecordingStatus.Empty,
      ICall.RecordingStatus.Idle,
      ICall.RecordingStatus.Processed,
      ICall.RecordingStatus.Processing,
      ICall.RecordingStatus.ProcessingFailed,
      ICall.RecordingStatus.Queued,
      ICall.RecordingStatus.Recorded,
      ICall.RecordingStatus.Recording,
    ])!;
  }

  const methods = [
    IWithdrawMethod.Type.Wallet,
    IWithdrawMethod.Type.Bank,
    IWithdrawMethod.Type.Instapay,
  ];

  function randomWithdrawMethod() {
    const method = sample(methods)!;
    return {
      amount: random(1000_00, 100_000_00),
      bank: method === IWithdrawMethod.Type.Bank ? "cib" : null,
      method,
      receiver:
        method === IWithdrawMethod.Type.Bank
          ? random(1_000_000_000, 5_000_000_000).toString()
          : method === IWithdrawMethod.Type.Wallet
            ? [
                sample(["015", "010", "011"])!,
                random(1_000_000_0, 9_999_999_9),
              ].join("")
            : Math.random().toString(36).slice(2),
    };
  }

  for (const tutor of addedTutors) {
    await knex.transaction(async (tx: Knex.Transaction) => {
      const activeLesson = tutor.id === 10;
      const { call } = await calls.create(
        {
          duration: sample([ILesson.Duration.Short, ILesson.Duration.Long])!,
          hostId: tutor.id,
          memberIds: [student.id],
          ruleId: 1, // todo: pick valid rule id
          start: activeLesson
            ? dayjs.utc().add(1, "minute").toISOString()
            : randomStart(),
        },
        tx
      );

      if (sample([0, 1]))
        await calls.update(
          [call.id],
          { recordingStatus: randomCallRecordingStatus() },
          tx
        );

      const { lesson } = await lessons.create(
        {
          callId: call.id,
          hostId: tutor.id,
          members: [student.id],
        },
        tx
      );

      if (sample([0, 1]) && !activeLesson) {
        await calls.cancel(call.id, sample([tutor.id, student.id])!, tx);
        await lessons.cancel(lesson.id, sample([tutor.id, student.id])!, tx);
      }
    });
  }

  for (const tutor of addedTutors) {
    await knex.transaction(async (tx: Knex.Transaction) => {
      const { call } = await calls.create(
        {
          duration: 30,
          hostId: interviewer.id,
          memberIds: [tutor.id],
          ruleId: rule.id,
          start: randomStart(),
        },
        tx
      );

      const interview = await interviews.create(
        {
          call: call.id,
          interviewee: tutor.id,
          interviewer: interviewer.id,
        },
        tx
      );

      if (sample([0, 1]))
        await calls.update(
          [call.id],
          {
            recordingStatus: randomCallRecordingStatus(),
          },
          tx
        );
    });
  }

  for (const method of methods) {
    await withdrawMethods.create({
      type: method,
      min: 1000_00,
      max: 50000_00,
      enabled: true,
    });
  }

  for (const tutor of addedTutors) {
    await Promise.all(
      range(1, 51).map(async () => {
        const method = sample(methods)!;
        const invoice = await invoices.create({
          userId: tutor.id,
          amount: random(1000_00, 100_000_00),
          bank: method === IWithdrawMethod.Type.Bank ? "cib" : null,
          method,
          receiver:
            method === IWithdrawMethod.Type.Bank
              ? random(1_000_000_000, 5_000_000_000).toString()
              : method === IWithdrawMethod.Type.Wallet
                ? [
                    sample(["015", "010", "011"])!,
                    random(1_000_000_0, 9_999_999_9),
                  ].join("")
                : Math.random().toString(36).slice(2),
        });

        console.log(`Tutor ${tutor.id}, invoice ${invoice.id}`.gray);

        const seed = sample([0, 1, 2, 3, 4, 5]);
        if (seed === 0) {
          const { method, amount, bank, receiver } = randomWithdrawMethod();
          await invoices.update(invoice.id, {
            updateRequest: { method, amount, bank, receiver },
            status: IInvoice.Status.UpdatedByReceiver,
          });
        }

        if (seed === 1) {
          await invoices.update(invoice.id, {
            status: IInvoice.Status.Fulfilled,
            addressedBy: admin.id,
          });
        }

        if (seed === 2) {
          await invoices.update(invoice.id, {
            status: IInvoice.Status.CanceledByReceiver,
          });
        }

        if (seed === 3) {
          await invoices.update(invoice.id, {
            status: IInvoice.Status.CanceledByAdmin,
            addressedBy: admin.id,
          });
        }

        if (seed === 4) {
          await invoices.update(invoice.id, {
            status: IInvoice.Status.CancellationApprovedByAdmin,
            addressedBy: admin.id,
          });
        }

        if (seed === 5) {
          await invoices.update(invoice.id, {
            status: IInvoice.Status.Rejected,
            addressedBy: admin.id,
          });
        }
      })
    );
  }
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
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
