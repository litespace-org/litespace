import { mockApi, mockApiContext } from "@fixtures/mockApi";
import { expect } from "chai";
import { cache } from "@/lib/cache";
import db from "@fixtures/db";
import handlers from "@/handlers/lesson";
import { notfound, forbidden, busyTutor } from "@/lib/error";
import { dayjs, safe } from "@litespace/utils";
import { ILesson, IUser } from "@litespace/types";
import { lessons } from "@litespace/models";

const updateLesson = mockApi<ILesson.UpdateApiPayload>(
  handlers.update(mockApiContext())
);

describe("/api/v1/lesson/", () => {
  beforeAll(async () => {
    await cache.connect();
  });

  afterAll(async () => {
    await cache.disconnect();
  });

  beforeEach(async () => {
    await db.flush();
    await cache.flush();
  });

  describe("PATCH /api/v1/lesson/", () => {
    it("should respond with forbidden in case the requester is not a student.", async () => {
      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: 123,
            start: dayjs().toISOString(),
            duration: 30,
            slotId: 1,
          },
          user: IUser.Role.Tutor,
        })
      );
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with forbidden in case the requester is not a member of the lesson.", async () => {
      const tutor = await db.tutor();
      const { lesson } = await db.lesson({ tutor: tutor.id });

      const student = await db.student();
      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: lesson.id,
            start: dayjs().toISOString(),
            duration: lesson.duration,
            slotId: lesson.slotId,
          },
          user: student,
        })
      );

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with not found in case the lesson does not exist.", async () => {
      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: 123,
            start: dayjs().toISOString(),
            duration: 30,
            slotId: 1,
          },
          user: IUser.Role.Student,
        })
      );
      expect(res).to.deep.eq(notfound.lesson());
    });

    it("should respond with not found in case the lesson slot does not exist.", async () => {
      const tutor = await db.tutor();
      const student = await db.student();
      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
      });
      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: lesson.id,
            slotId: 123,
            start: dayjs().toISOString(),
            duration: lesson.duration,
          },
          user: student,
        })
      );
      expect(res).to.deep.eq(notfound.slot());
    });

    it("should respond with busy tutor in case the lesson cannot be booked at the specified time.", async () => {
      const tutor = await db.tutor();
      const student1 = await db.student();
      const student2 = await db.student();

      const date = dayjs.utc().startOf("hour");
      await db.lesson({
        tutor: tutor.id,
        student: student1.id,
        start: date.toISOString(),
        duration: ILesson.Duration.Long,
      });

      const { lesson: lesson2 } = await db.lesson({
        tutor: tutor.id,
        student: student2.id,
        start: date.add(1, "hour").toISOString(),
        duration: ILesson.Duration.Long,
      });

      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: lesson2.id,
            // NOTE: conflicts with student1 lesson
            start: date.toISOString(),
            duration: lesson2.duration,
            slotId: lesson2.slotId,
          },
          user: student2,
        })
      );
      expect(res).to.deep.eq(busyTutor());
    });

    it("should successfully update lesson data.", async () => {
      const tutor = await db.tutor();
      const student = await db.student();

      const date = dayjs.utc().startOf("hour");
      const slot = await db.slot({
        userId: tutor.id,
        start: date.toISOString(),
        end: date.add(1, "day").toISOString(),
      });

      const { lesson } = await db.lesson({
        tutor: tutor.id,
        student: student.id,
        slot: slot.id,
        start: date.toISOString(),
        duration: ILesson.Duration.Long,
      });

      const res = await safe(async () =>
        updateLesson({
          body: {
            lessonId: lesson.id,
            start: date.add(1, "hour").toISOString(),
            duration: lesson.duration,
            slotId: lesson.slotId,
          },
          user: student,
        })
      );

      expect(res).to.not.be.instanceof(Error);
      const updated = await lessons.findById(lesson.id);
      expect(updated?.start).to.eq(date.add(1, "hour").toISOString());
    });
  });
});
