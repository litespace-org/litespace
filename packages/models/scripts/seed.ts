import {
  knex,
  users,
  tutors,
  ratings,
  plans,
  messages,
  rooms,
  lessons,
  interviews,
  hashPassword,
  topics,
  availabilitySlots,
  invoices,
  introVideos,
  demoSessions,
} from "@litespace/models";
import {
  IAvailabilitySlot,
  IDemoSession,
  IInterview,
  IIntroVideo,
  IInvoice,
  ILesson,
  IUser,
} from "@litespace/types";
import dayjs from "dayjs";
import { calculateLessonPrice } from "@litespace/utils/lesson";
import { logger } from "@litespace/utils/log";
import { percentage, price } from "@litespace/utils/value";
import { first, range, sample, uniqueId } from "lodash";
import { Knex } from "knex";
import utc from "dayjs/plugin/utc";
import { faker } from "@faker-js/faker/locale/ar";
import { faker as fakerEn } from "@faker-js/faker/locale/en";
import "colors";
import { randomUUID } from "crypto";

dayjs.extend(utc);

const birthYear = () =>
  faker.date.birthdate({ max: 70, min: 1, mode: "age" }).getFullYear();

const phone = () =>
  sample(["01032142699", "01150970374", "01018303125", "01143759540"])!;

const notificationMethod = () => sample([IUser.NotificationMethod.Whatsapp])!;

const city = () =>
  sample(
    Object.values(IUser.City).filter((city) => !Number.isNaN(Number(city)))
  ) as IUser.City;

async function main(): Promise<void> {
  const stdout = logger("seed");
  const password = hashPassword("Password@8");

  await users.create({
    email: "admin@litespace.org",
    name: faker.person.fullName(),
    role: IUser.Role.SuperAdmin,
    password,
    notificationMethod: notificationMethod(),
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
        verifiedEmail: true,
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
              notificationMethod: notificationMethod(),
              phone: phone(),
              city: city(),
              image: uniqueId(),
              verifiedEmail: true,
              verifiedPhone: true,
            },
            tx
          );

          return student;
        })
    )
  );

  // seeding studios
  const studio1 = await users.create({
    role: IUser.Role.Studio,
    email: "studio-1@litespace.org",
    name: faker.person.fullName(),
    birthYear: birthYear(),
    password,
  });

  const studio2 = await users.create({
    role: IUser.Role.Studio,
    email: "studio-2@litespace.org",
    name: faker.person.fullName(),
    birthYear: birthYear(),
    password,
  });

  // tutorx: tutor who completed his profile information but didn't start the
  // onboarding flow.
  await knex.transaction(async (tx) => {
    const user = await users.create(
      {
        email: "tutorx@litespace.org",
        role: IUser.Role.Tutor,
        password,
      },
      tx
    );

    await users.update(
      user.id,
      {
        city: IUser.City.Cairo,
        phone: phone(),
        name: faker.person.fullName(),
        birthYear: birthYear(),
        verifiedEmail: true,
        verifiedPhone: true,
        gender: IUser.Gender.Male,
      },
      tx
    );

    await tutors.create(user.id, tx);

    await tutors.update(
      user.id,
      {
        about: faker.lorem.paragraph(5),
        activated: false,
        bio: faker.person.bio(),
      },
      tx
    );
  });

  const addedTutorManagers: IUser.Self[] = await knex.transaction(
    async (tx) => {
      return await Promise.all(
        range(1, 6).map(async (idx) => {
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
              notificationMethod: notificationMethod(),
              phone: phone(),
              gender: sample([IUser.Gender.Male, IUser.Gender.Female]),
              city: city(),
              image: uniqueId(),
              verifiedEmail: true,
              verifiedPhone: true,
            },
            tx
          );

          await tutors.update(
            tutor.id,
            {
              about: faker.lorem.paragraphs(),
              bio: faker.lorem.words(9),
              activated: true,
            },
            tx
          );
          return tutor;
        })
      );
    }
  );

  const tutorManager = first(addedTutorManagers);
  if (!tutorManager)
    throw new Error("TutorManager not found; should never happen.");

  const addedTutors: IUser.Self[] = await knex.transaction(async (tx) => {
    return await Promise.all(
      range(1, 25).map(async (idx) => {
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
        // tutors with odd id will be onboarded
        const isOnboarded = idx % 2 !== 0;

        await tutors.update(
          tutor.id,
          {
            about: sample([faker.lorem.paragraphs(), null]),
            bio: sample([faker.lorem.words(9), null]),
            activated: isOnboarded,
            video: isOnboarded ? "/video.mp4" : undefined,
            thumbnail: isOnboarded ? "/thumbnail.png" : undefined,
          },
          tx
        );

        return await users.update(
          tutor.id,
          {
            notificationMethod: notificationMethod(),
            phone: phone(),
            gender: sample([IUser.Gender.Male, IUser.Gender.Female]),
            city: city(),
            birthYear: isOnboarded ? 2001 : undefined,
            image: uniqueId(),
            verifiedEmail: isOnboarded,
            verifiedPhone: isOnboarded,
          },
          tx
        );
      })
    );
  });

  // seed invoices for each tutor
  for (const tutor of addedTutors) {
    await Promise.all(
      range(faker.number.int(10)).map(() =>
        invoices.create({
          userId: tutor.id,
          method: sample([
            IInvoice.WithdrawMethod.Bank,
            IInvoice.WithdrawMethod.Wallet,
            IInvoice.WithdrawMethod.Instapay,
          ]),
          receiver: sample([
            "bank:123321123321123",
            "01010101010",
            "example@instapay.com",
          ]),
          amount: faker.number.int({ min: 100, max: 1000 }),
          note: sample([faker.lorem.sentence(10), undefined]),
        })
      )
    );
  }

  // assigning random tutors to studios
  await Promise.all(
    addedTutors
      .slice(0, addedTutors.length / 2)
      .map(async (tutor) =>
        tutors.update(tutor.id, { studioId: sample([studio1.id, studio2.id]) })
      )
  );

  const tutor = first(addedTutors);
  if (!tutor) throw new Error("Tutor not found; should never happen.");

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

  // seeding slots
  const seededSlots: { [tutorId: number]: IAvailabilitySlot.Self[] } = {};
  addedTutors.forEach(async (tutor, i) => {
    const date = dayjs
      .utc()
      .add(i * 4, "days")
      .startOf("day");
    const slots = await availabilitySlots.create([
      {
        userId: tutor.id,
        start: date.toISOString(),
        end: date.add(2, "hours").toISOString(),
      },
      {
        userId: tutor.id,
        start: date.add(3, "hours").toISOString(),
        end: date.add(7, "hours").toISOString(),
      },
      {
        userId: tutor.id,
        start: date.add(12, "hours").toISOString(),
        end: date.add(20, "hours").toISOString(),
      },
      {
        userId: tutor.id,
        start: date.add(25, "hours").toISOString(),
        end: date.add(29, "hours").toISOString(),
      },
      {
        userId: tutor.id,
        start: date.add(36, "hours").toISOString(),
        end: date.add(40, "hours").toISOString(),
      },
      {
        userId: tutor.id,
        start: date.add(80, "hours").toISOString(),
        end: date.add(90, "hours").toISOString(),
      },
    ]);
    return (seededSlots[tutor.id] = slots);
  });

  // seeding slots for tutor managers
  const seededSlotsForTutorManagers: {
    [tutorId: number]: IAvailabilitySlot.Self[];
  } = {};
  addedTutorManagers.forEach(async (tutor, i) => {
    const date = dayjs
      .utc()
      .add(i * 4, "days")
      .startOf("day");
    const slots = await availabilitySlots.create([
      {
        userId: tutor.id,
        start: date.toISOString(),
        end: date.add(2, "hours").toISOString(),
        purpose: IAvailabilitySlot.Purpose.Lesson,
      },
      {
        userId: tutor.id,
        start: date.add(3, "hours").toISOString(),
        end: date.add(7, "hours").toISOString(),
        purpose: IAvailabilitySlot.Purpose.General,
      },
      {
        userId: tutor.id,
        start: date.add(12, "hours").toISOString(),
        end: date.add(20, "hours").toISOString(),
        purpose: IAvailabilitySlot.Purpose.Interview,
      },
      {
        userId: tutor.id,
        start: date.add(25, "hours").toISOString(),
        end: date.add(29, "hours").toISOString(),
        purpose: IAvailabilitySlot.Purpose.General,
      },
      {
        userId: tutor.id,
        start: date.add(36, "hours").toISOString(),
        end: date.add(40, "hours").toISOString(),
        purpose: IAvailabilitySlot.Purpose.DemoSession,
      },
      {
        userId: tutor.id,
        start: date.add(80, "hours").toISOString(),
        end: date.add(90, "hours").toISOString(),
        purpose: IAvailabilitySlot.Purpose.General,
      },
    ]);
    return (seededSlotsForTutorManagers[tutor.id] = slots);
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

  async function createRandomLesson({
    tutorId,
    slotId,
    start,
  }: {
    tutorId: number;
    slotId: number;
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
        slot: slotId,
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

  // seeding lessons
  for (const tutor of addedTutors) {
    // create chat room tutor-student
    await knex.transaction(async (tx) =>
      rooms.create([tutor.id, student.id], tx)
    );

    for (const slot of seededSlots[tutor.id] || []) {
      await createRandomLesson({
        tutorId: tutor.id,
        slotId: slot.id,
        start: slot.start,
      });
    }

    stdout.log(
      `created lesson for each slot of tutor with id "${tutor.id}" and email "${tutor.email}" `
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
        intervieweeId: tutor.id,
        interviewerId: tutorManager.id,
        start: randomStart(),
        slot: slot.id,
        tx,
      });

      await interviews.update({
        id: interview.id,
        intervieweeFeedback: faker.lorem.paragraphs(),
        interviewerFeedback: faker.lorem.paragraphs(),
        status: IInterview.Status.Passed,
        tx,
      });
    });
  }

  // adding introVideos to each tutor
  for (const tutor of addedTutors) {
    const video = await introVideos.create({
      src: sample([
        "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      ]),
      tutorId: tutor.id,
      reviewerId: tutorManager.id,
    });

    // if there is a reviewer, the video is rejected or approved otherwise it's in pending state
    await introVideos.update({
      id: video.id,
      state: tutor.verifiedEmail
        ? IIntroVideo.State.Approved
        : IIntroVideo.State.Rejected,
    });
  }

  // adding demoSessions to each tutor
  for (const tutor of addedTutors) {
    const demo = await demoSessions.create({
      slotId: slot.id,
      tutorId: tutor.id,
      start: dayjs().subtract(1, "day").toISOString(),
    });

    // if there is a reviewer, the video is rejected or approved otherwise it's in pending state
    await demoSessions.update({
      ids: [demo.id],
      status: tutor.verifiedEmail
        ? IDemoSession.Status.Passed
        : sample([
            IDemoSession.Status.Pending,
            IDemoSession.Status.Rejected,
            IDemoSession.Status.CanceledByTutor,
            IDemoSession.Status.CanceledByTutorManager,
            IDemoSession.Status.CanceledByAdmin,
          ]),
    });
  }

  await Promise.all([
    plans.create({
      weeklyMinutes: 2.5 * 60,
      forInvitesOnly: false,
      baseMonthlyPrice: price.scale(2500),
      monthDiscount: percentage.scale(10),
      quarterDiscount: percentage.scale(20),
      yearDiscount: percentage.scale(30),
      active: true,
    }),
    plans.create({
      weeklyMinutes: 5 * 60,
      forInvitesOnly: false,
      baseMonthlyPrice: price.scale(4000),
      monthDiscount: percentage.scale(15),
      quarterDiscount: percentage.scale(20),
      yearDiscount: percentage.scale(30),
      active: true,
    }),
    plans.create({
      weeklyMinutes: 8 * 60,
      forInvitesOnly: false,
      baseMonthlyPrice: price.scale(6000),
      monthDiscount: percentage.scale(20),
      quarterDiscount: percentage.scale(25),
      yearDiscount: percentage.scale(30),
      active: true,
    }),
  ]);

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
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
