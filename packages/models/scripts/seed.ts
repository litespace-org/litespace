import {
  knex,
  users,
  tutors,
  ratings,
  rules,
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
  hashPassword,
  topics,
  availabilitySlots,
} from "@litespace/models";
import { IInterview, ILesson, IUser, IWithdrawMethod } from "@litespace/types";
import dayjs from "dayjs";
import { Time } from "@litespace/sol/time";
import { calculateLessonPrice } from "@litespace/sol/lesson";
import { logger } from "@litespace/sol/log";
import { price } from "@litespace/sol/value";
import { IDate, IRule } from "@litespace/types";
import { first, range, sample } from "lodash";
import { Knex } from "knex";
import utc from "dayjs/plugin/utc";
import { faker } from "@faker-js/faker/locale/ar";
import { faker as fakerEn } from "@faker-js/faker/locale/en";
import "colors";
import { randomUUID } from "crypto";

dayjs.extend(utc);

const birthYear = () =>
  faker.date.birthdate({ max: 70, min: 1, mode: "age" }).getFullYear();

const phoneNumber = () =>
  [
    sample(["011", "012", "010", "015"]),
    faker.number
      .int({
        min: 10_000_000,
        max: 99_999_999,
      })
      .toString()
      .padEnd(8, "0"),
  ].join("");

const city = () =>
  sample(
    Object.values(IUser.City).filter((city) => !Number.isNaN(Number(city)))
  ) as IUser.City;

async function main(): Promise<void> {
  const stdout = logger("seed");
  const password = hashPassword("Password@8");

  const admin = await users.create({
    email: "admin@litespace.org",
    name: faker.person.fullName(),
    role: IUser.Role.SuperAdmin,
    password,
    birthYear: birthYear(),
  });

  const student = await knex.transaction(async (tx) => {
    const student = await users.create(
      {
        role: IUser.Role.Student,
        email: "student@litespace.org",
        name: faker.person.fullName(),
        birthYear: birthYear(),
        password,
      },
      tx
    );

    await users.update(student.id, { gender: IUser.Gender.Male }, tx);
    return student;
  });

  const students = await Promise.all(
    range(20).map(
      async (idx) =>
        await knex.transaction(async (tx) => {
          const isMale = Math.random() >= 0.5;
          const student = await users.create(
            {
              role: IUser.Role.Student,
              email: `student-${idx + 1}@litespace.org`,
              name: faker.person.fullName({ sex: isMale ? "male" : "female" }),
              birthYear: birthYear(),
              gender: isMale ? IUser.Gender.Male : IUser.Gender.Female,
              password,
            },
            tx
          );

          await users.update(
            student.id,
            {
              phoneNumber: phoneNumber(),
              city: city(),
              image: `/image-${idx + 1}.png`,
              verified: true,
            },
            tx
          );

          return student;
        })
    )
  );

  await users.create({
    role: IUser.Role.Studio,
    email: "media@litespace.org",
    name: faker.person.fullName(),
    birthYear: birthYear(),
    password,
  });

  const addedTutors: IUser.Self[] = await knex.transaction(async (tx) => {
    return await Promise.all(
      range(1, 16).map(async (idx) => {
        const email = `tutor-${idx}@litespace.org`;
        const tutor = await users.create(
          {
            name: faker.person.fullName(),
            role: IUser.Role.Tutor,
            birthYear: birthYear(),
            password,
            email,
          },
          tx
        );

        console.log(`tutor: ${tutor.id} - ${tutor.email}`);

        await tutors.create(tutor.id, tx);

        await users.update(
          tutor.id,
          {
            phoneNumber: phoneNumber(),
            gender: sample([IUser.Gender.Male, IUser.Gender.Female]),
            city: city(),
            image: "/image.png",
            verified: true,
          },
          tx
        );

        await tutors.update(
          tutor.id,
          {
            about: faker.lorem.paragraphs(),
            bio: faker.lorem.words(9),
            activated: true,
            activatedBy: admin.id,
            video: "/video.mp4",
          },
          tx
        );
        return tutor;
      })
    );
  });

  const addedTutorManagers: IUser.Self[] = await knex.transaction(
    async (tx) => {
      return await Promise.all(
        range(1, 3).map(async (idx) => {
          const email = `tutor-manager-${idx}@litespace.org`;
          const tutor = await users.create(
            {
              name: faker.person.fullName(),
              role: IUser.Role.TutorManager,
              birthYear: birthYear(),
              password,
              email,
            },
            tx
          );

          console.log(`tutor-manager: ${tutor.id} - ${tutor.email}`);

          await tutors.create(tutor.id, tx);

          await users.update(
            tutor.id,
            {
              phoneNumber: phoneNumber(),
              gender: sample([IUser.Gender.Male, IUser.Gender.Female]),
              city: city(),
              image: "/image.png",
              verified: true,
            },
            tx
          );

          await tutors.update(
            tutor.id,
            {
              about: faker.lorem.paragraphs(),
              bio: faker.lorem.words(9),
              activated: true,
              activatedBy: admin.id,
              video: "/video.mp4",
            },
            tx
          );
          return tutor;
        })
      );
    }
  );

  const tutor = first(addedTutors);
  if (!tutor) throw new Error("Tutor not found; should never happen.");

  const tutorManager = first(addedTutorManagers);
  if (!tutorManager)
    throw new Error("TutorManager not found; should never happen.");

  // seeding ratings data
  await knex.transaction(async () => {
    return await Promise.all(
      students.map(async (student) => {
        stdout.info(`Student ${student.id} is rating all available tutors.`);

        const allTutors = [...addedTutors, ...addedTutorManagers];
        for (const tutor of allTutors) {
          const randomValue = sample(range(1, 6));
          if (randomValue === undefined)
            throw Error(
              "Unexpected error: getting random rating value failed!"
            );

          const wordCount = sample(range(6, 20)) || 0;
          const randomFeedback = faker.lorem.words(wordCount);

          await ratings.create({
            raterId: student.id,
            rateeId: tutor.id,
            value: randomValue,
            feedback: wordCount < 8 ? null : randomFeedback,
          });
        }
      })
    );
  });

  // seeding topics data
  stdout.info(`Inserting at most 50 random topics in the database.`);
  await Promise.all(
    range(100).map(async () => {
      try {
        const ar = faker.lorem.words(2);
        const en = fakerEn.lorem.words(2);
        await topics.create({ name: { ar, en } });
      } catch (_) {
        // ignore errors (duplicate topics)
      }
    })
  );

  const rule = await rules.create({
    userId: tutorManager.id,
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

  // seeding slots
  await availabilitySlots.create(
    addedTutors.map((tutor) => ({
      userId: tutor.id,
      start: dayjs.utc().startOf("day").toISOString(),
      end: dayjs.utc().startOf("day").add(30, "days").toISOString(),
    }))
  );

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

  const methods = [
    IWithdrawMethod.Type.Wallet,
    IWithdrawMethod.Type.Bank,
    IWithdrawMethod.Type.Instapay,
  ];

  async function createRandomLesson({
    tutorId,
    start,
  }: {
    tutorId: number;
    start: string;
  }) {
    return await knex.transaction(async (tx: Knex.Transaction) => {
      const duration = sample([ILesson.Duration.Short, ILesson.Duration.Long]);

      const { lesson } = await lessons.create({
        session: `lesson:${randomUUID()}`,
        tutor: tutorId,
        student: student.id,
        price: calculateLessonPrice(price.scale(100), duration),
        start,
        duration,
        rule: 1,
        slot: 1,
        tx,
      });

      if (sample([0, 1]))
        await lessons.cancel({
          ids: [lesson.id],
          canceledBy: sample([tutorId, student.id]),
          tx,
        });

      return lesson;
    });
  }

  let start = dayjs().utc().startOf("day");
  for (const tutor of addedTutors) {
    // create chat room tutor-student
    await knex.transaction(async (tx) =>
      rooms.create([tutor.id, student.id], tx)
    );

    for (const _ of range(1, 100)) {
      await createRandomLesson({
        tutorId: tutor.id,
        start: start.toISOString(),
      });

      start = start.add(sample([15, 30, 45, 60]), "minutes");
    }

    stdout.log(
      `created 100 lesson for tutor with id "${tutor.id}" and email "${tutor.email}" `
    );
  }

  const slot = (
    await availabilitySlots.create([
      {
        userId: tutorManager.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().startOf("day").add(1, "days").toISOString(),
      },
    ])
  )[0];

  for (const tutor of addedTutors) {
    await knex.transaction(async (tx: Knex.Transaction) => {
      const interview = await interviews.create({
        session: `interview:${randomUUID()}`,
        interviewee: tutor.id,
        interviewer: tutorManager.id,
        start: randomStart(),
        rule: rule.id,
        slot: slot.id,
        tx,
      });

      await interviews.update(
        interview.ids.self,
        {
          feedback: {
            interviewee: faker.lorem.paragraphs(),
            interviewer: faker.lorem.paragraphs(),
          },
          status: IInterview.Status.Passed,
          level: 5,
          note: faker.lorem.paragraphs(),
          signer: admin.id,
        },
        tx
      );
    });
  }

  for (const method of methods) {
    await withdrawMethods.create({
      type: method,
      min: 10_00,
      max: 50000_00,
      enabled: true,
    });
  }

  // for (const tutor of addedTutors) {
  //   for (const _ of range(1, 51)) {
  //     const method = sample(methods)!;
  //     const invoice = await invoices.create({
  //       userId: tutor.id,
  //       amount: random(1000_00, 100_000_00),
  //       bank: method === IWithdrawMethod.Type.Bank ? "cib" : null,
  //       method,
  //       receiver:
  //         method === IWithdrawMethod.Type.Bank
  //           ? random(1_000_000_000, 5_000_000_000).toString()
  //           : method === IWithdrawMethod.Type.Wallet
  //             ? [
  //                 sample(["015", "010", "011"])!,
  //                 random(1_000_000_0, 9_999_999_9),
  //               ].join("")
  //             : Math.random().toString(36).slice(2),
  //     });

  //     const seed = sample([0, 1, 2, 3, 4, 5, 6]);
  //     if (seed === 0) {
  //       const { method, amount, bank, receiver } = randomWithdrawMethod();
  //       await invoices.update(invoice.id, {
  //         updateRequest: { method, amount, bank, receiver },
  //         status: IInvoice.Status.UpdatedByReceiver,
  //       });
  //     }

  //     if (seed === 1) {
  //       await invoices.update(invoice.id, {
  //         status: IInvoice.Status.Fulfilled,
  //         addressedBy: admin.id,
  //         note: aripsum.generateParagraph(20, 50),
  //       });
  //     }

  //     if (seed === 2) {
  //       await invoices.update(invoice.id, {
  //         status: IInvoice.Status.CanceledByReceiver,
  //       });
  //     }

  //     if (seed === 3) {
  //       await invoices.update(invoice.id, {
  //         status: IInvoice.Status.CanceledByAdmin,
  //         addressedBy: admin.id,
  //         note: aripsum.generateParagraph(20, 50),
  //       });
  //     }

  //     if (seed === 4) {
  //       await invoices.update(invoice.id, {
  //         status: IInvoice.Status.CancellationApprovedByAdmin,
  //         addressedBy: admin.id,
  //         note: aripsum.generateParagraph(20, 50),
  //       });
  //     }

  //     if (seed === 5) {
  //       await invoices.update(invoice.id, {
  //         status: IInvoice.Status.Rejected,
  //         addressedBy: admin.id,
  //         note: aripsum.generateParagraph(20, 50),
  //       });
  //     }
  //   }
  // }

  // stdout.log("Created 50 invoice for each of the 100 tutors.");

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

  await knex.transaction(async (tx) => {
    const roomId = await rooms.create([tutor.id, tutorManager.id], tx);

    await messages.create(
      {
        userId: tutor.id,
        text: "Hello!",
        roomId,
      },
      tx
    );

    await messages.create(
      {
        userId: tutorManager.id,
        text: "Nice to meet you!",
        roomId,
      },
      tx
    );
  });

  const lessonsTotal = await lessons.sumPrice({});
  const lessonsNotCanceled = await lessons.sumPrice({ canceled: false });
  const pastLessonsOnly = await lessons.sumPrice({ future: false });
  stdout.info("Total sum for all lessons in egp", lessonsTotal / 100);
  stdout.info(
    "Total sum for all not canceled lessons in egp",
    lessonsNotCanceled / 100
  );
  stdout.info("Total sum for all past lessons in egp ", pastLessonsOnly / 100);

  const invoicesSum = await invoices.sumAmounts({});
  const fulfilledInvoices = await invoices.sumAmounts({ pending: false });
  const pendingInvoices = invoicesSum - fulfilledInvoices;
  stdout.info("Total sum for all invoices in egp", invoicesSum / 100);
  stdout.info(
    "Total sum for fulfilled invoices in egp",
    fulfilledInvoices / 100
  );
  stdout.info("Total sum for pending invoices in egp", pendingInvoices / 100);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
