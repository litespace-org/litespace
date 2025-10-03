import db from "@fixtures/db";
import dayjs from "@/lib/dayjs";
import { expect } from "chai";
import { bad, conflictingSchedule, forbidden, notfound } from "@/lib/error";
import { availabilitySlots, lessons } from "@litespace/models";
import { first } from "lodash";
import handlers from "@/handlers/availabilitySlot";
import { mockApi } from "@fixtures/mockApi";
import { IAvailabilitySlot } from "@litespace/types";

const findSlot = mockApi<
  object,
  object,
  IAvailabilitySlot.FindAvailabilitySlotsApiQuery,
  IAvailabilitySlot.FindAvailabilitySlotsApiResponse
>(handlers.find);

const setSlot = mockApi<
  IAvailabilitySlot.SetAvailabilitySlotsApiPayload,
  object,
  object,
  IAvailabilitySlot.SetAvailabilitySlotsApiResponse
>(handlers.set);

async function genMockData(tutorId: number, datetime: dayjs.Dayjs) {
  const slot1 = await db.slot({
    userId: tutorId,
    start: datetime.toISOString(),
    end: datetime.add(1, "day").toISOString(),
  });
  const slot2 = await db.slot({
    userId: tutorId,
    start: datetime.add(1, "day").toISOString(),
    end: datetime.add(2, "day").toISOString(),
  });

  const lesson1 = await db.lesson({
    tutor: tutorId,
    start: datetime.add(6, "hours").toISOString(),
    duration: 45,
    slot: slot1.id,
  });
  const lesson2 = await db.lesson({
    tutor: tutorId,
    start: datetime.add(26, "hour").toISOString(),
    duration: 90,
    slot: slot2.id,
  });

  const interview1 = await db.interview({
    interviewerId: tutorId,
    start: datetime.add(1, "hour").toISOString(),
    slot: slot1.id,
  });

  return {
    slots: [slot1, slot2],
    lessons: [lesson1, lesson2],
    interviews: [interview1],
  };
}

describe("/api/v1/availability-slot/", () => {
  beforeEach(async () => {
    return await db.flush();
  });

  describe("GET api/v1/availability-slot/:userId", () => {
    it("should retrieve the available slots with the already booked subslots of a specific user", async () => {
      const student = await db.student();
      const tutor = await db.tutorUser();

      const now = dayjs.utc();
      const mock = await genMockData(tutor.id, now);

      const res = await findSlot({
        user: student,
        query: {
          userIds: [tutor.id],
          after: now.toISOString(),
          before: now.add(2, "days").toISOString(),
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.slots.total).to.eq(2);
      expect(res.body!.slots.list).to.deep.eq(mock.slots.reverse());
      expect(res.body!.subslots).to.have.length(
        mock.lessons.length + mock.interviews.length
      );
    });

    it.only("should retrieve available slots filtered by the purpose", async () => {
      const student = await db.student();
      const tutorManager = await db.tutorManagerUser();

      const slot1 = await db.slot({
        userId: tutorManager.id,
        purpose: IAvailabilitySlot.Purpose.Interview,
      });

      await db.slot({
        userId: tutorManager.id,
        purpose: IAvailabilitySlot.Purpose.Lesson,
      });

      const res = await findSlot({
        user: student,
        query: { purposes: [IAvailabilitySlot.Purpose.Interview] },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.slots.total).to.eq(1);
      expect(res.body!.slots.list).to.deep.eq([slot1]);
    });

    it("should respond with bad request if the `after` date is before the `before` date", async () => {
      const student = await db.student();
      const tutor = await db.tutor();

      const now = dayjs.utc();
      const res = await findSlot({
        user: student,
        query: {
          userIds: [tutor.id],
          after: now.add(2, "days").toISOString(),
          before: now.toISOString(),
        },
      });

      expect(res).to.deep.eq(bad());
    });
  });

  describe("POST api/v1/availability-slot/set", () => {
    it("should respond with forbidden if the requester is not a tutor", async () => {
      const student = await db.student();
      const now = dayjs.utc();
      const res = await setSlot({
        user: student,
        body: {
          actions: [
            {
              type: "create",
              start: now.toISOString(),
              end: now.add(6, "hours").toISOString(),
              purpose: IAvailabilitySlot.Purpose.Lesson,
            },
          ],
        },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should successfully create a new slot", async () => {
      const tutor = await db.tutorUser();

      const now = dayjs.utc();
      await setSlot({
        user: tutor,
        body: {
          actions: [
            {
              type: "create",
              start: now.add(1, "hour").toISOString(),
              end: now.add(6, "hours").toISOString(),
              purpose: IAvailabilitySlot.Purpose.Lesson,
            },
          ],
        },
      });

      const slots = await availabilitySlots.find({ userIds: [tutor.id] });
      expect(slots.total).to.eq(1);

      const c1 = {
        userId: tutor.id,
        start: now.add(1, "hour").toISOString(),
        end: now.add(6, "hours").toISOString(),
      };
      const c2 = {
        userId: slots.list[0].userId,
        start: slots.list[0].start,
        end: slots.list[0].end,
      };
      expect(c1).to.deep.eq(c2);
    });

    it("should respond with conflict when creating a new slot that intersects with already existing one", async () => {
      const tutor = await db.tutorUser();
      const now = dayjs.utc();
      await genMockData(tutor.id, now);

      const res = await setSlot({
        user: tutor,
        body: {
          actions: [
            {
              type: "create",
              start: now.add(1, "hour").toISOString(),
              end: now.add(6, "hours").toISOString(),
              purpose: IAvailabilitySlot.Purpose.Lesson,
            },
          ],
        },
      });
      expect(res).to.deep.eq(conflictingSchedule());
    });

    it("should respond with bad request if the slot is not in the future", async () => {
      const tutor = await db.tutorUser();
      const now = dayjs.utc();

      const res = await setSlot({
        user: tutor,
        body: {
          actions: [
            {
              type: "create",
              start: now.subtract(2, "hour").toISOString(),
              end: now.subtract(1, "hours").toISOString(),
              purpose: IAvailabilitySlot.Purpose.Lesson,
            },
          ],
        },
      });

      expect(res).to.deep.eq(bad());
    });

    it("should respond with bad request if the slot is not well structured", async () => {
      const tutor = await db.tutorUser();
      const now = dayjs.utc();
      const res = await setSlot({
        user: tutor,
        body: {
          actions: [
            {
              type: "create",
              start: now.add(4, "hours").toISOString(),
              end: now.add(2, "hours").toISOString(),
              purpose: IAvailabilitySlot.Purpose.Lesson,
            },
          ],
        },
      });
      expect(res).to.deep.eq(bad());
    });

    it("should successfully update an existing slot", async () => {
      const tutor = await db.tutorUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.id, now);

      const newSlotData = {
        id: mock.slots[0].id,
        start: now.add(2, "days").toISOString(),
        end: now.add(3, "days").toISOString(),
      };

      await setSlot({
        user: tutor,
        body: {
          actions: [
            {
              type: "update",
              ...newSlotData,
            },
          ],
        },
      });

      const slots = await availabilitySlots.find({ ids: [mock.slots[0].id] });
      expect(newSlotData.start).to.eq(first(slots.list)?.start);
      expect(newSlotData.end).to.eq(first(slots.list)?.end);
    });

    it("should cancel (out of scope) subslots upon successfull slot update", async () => {
      const tutor = await db.tutorUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.id, now);

      const newSlotData = {
        id: mock.slots[0].id,
        start: now.add(2, "days").toISOString(),
        end: now.add(3, "days").toISOString(),
      };

      await setSlot({
        user: tutor,
        body: {
          actions: [
            {
              type: "update",
              ...newSlotData,
            },
          ],
        },
      });

      const lesson = await lessons.findById(mock.lessons[0].lesson.id);
      expect(lesson?.canceledBy).to.eq(tutor.id);
    });

    it("should successfully delete an existing slot", async () => {
      const tutor = await db.tutorUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.id, now);

      await setSlot({
        user: tutor,
        body: {
          actions: [
            {
              type: "delete",
              id: mock.slots[0].id,
            },
          ],
        },
      });

      const slots = await availabilitySlots.find({ ids: [mock.slots[0].id] });
      expect(first(slots.list)?.deleted).to.be.true;
    });

    it("should respond with notfound if any of the passed slots is not found", async () => {
      const tutor = await db.tutorUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.id, now);

      const res = await setSlot({
        user: tutor,
        body: {
          actions: [
            {
              type: "delete",
              id: mock.slots[0].id,
            },
            {
              type: "update",
              id: mock.slots[1].id,
              start: now.add(2, "days").toISOString(),
              end: now.add(3, "days").toISOString(),
            },
            {
              type: "delete",
              id: 123,
            },
          ],
        },
      });

      expect(res).to.deep.eq(notfound.slot());
    });

    it("should respond with forbidden if the requester is not the owner of any passed update/delete actions slot", async () => {
      const tutor = await db.tutorUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.id, now);

      const res = await setSlot({
        user: await db.tutorUser(),
        body: {
          actions: [
            {
              type: "delete",
              id: mock.slots[0].id,
            },
          ],
        },
      });

      expect(res).to.deep.eq(forbidden());
    });
  });
});
