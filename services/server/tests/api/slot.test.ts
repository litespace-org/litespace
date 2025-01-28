import { Api } from "@fixtures/api";
import db from "@fixtures/db";
import dayjs from "@/lib/dayjs";
import { expect } from "chai";
import { safe } from "@litespace/sol";
import { bad, conflict, forbidden, notfound } from "@/lib/error";
import { availabilitySlots, lessons } from "@litespace/models";
import { first } from "lodash";

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
    interviewer: tutorId,
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
    await db.flush();
  });

  describe("GET api/v1/availability-slot/:userId", () => {
    it("should retrieve the available slots with the already booked subslots of a specific user", async () => {
      const studentApi = await Api.forStudent();
      const tutor = await db.tutor();

      const now = dayjs.utc();
      const mock = await genMockData(tutor.id, now);

      const { slots, subslots } = await studentApi.atlas.availabilitySlot.find({
        userId: tutor.id,
        after: now.toISOString(),
        before: now.add(2, "days").toISOString(),
      });

      expect(slots.total).to.eq(2);
      expect(slots.list).to.deep.eq(mock.slots);
      expect(subslots).to.have.length(
        mock.lessons.length + mock.interviews.length
      );
    });

    it("should respond with bad request if the `after` date is before the `before` date", async () => {
      const studentApi = await Api.forStudent();
      const tutor = await db.tutor();
      const now = dayjs.utc();
      const res = await safe(async () =>
        studentApi.atlas.availabilitySlot.find({
          userId: tutor.id,
          after: now.add(2, "days").toISOString(),
          before: now.toISOString(),
        })
      );

      expect(res).to.deep.eq(bad());
    });
  });

  describe("POST api/v1/availability-slot/set", () => {
    it("should respond with forbidden if the requester is not a tutor", async () => {
      const studentApi = await Api.forStudent();
      const now = dayjs.utc();
      const res = await safe(async () =>
        studentApi.atlas.availabilitySlot.set({
          actions: [
            {
              type: "create",
              start: now.toISOString(),
              end: now.add(6, "hours").toISOString(),
            },
          ],
        })
      );
      expect(res).to.deep.eq(forbidden());
    });

    it("should successfully create a new slot", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();

      const now = dayjs.utc();
      await tutorApi.atlas.availabilitySlot.set({
        actions: [
          {
            type: "create",
            start: now.add(1, "hour").toISOString(),
            end: now.add(6, "hours").toISOString(),
          },
        ],
      });

      const slots = await availabilitySlots.find({ users: [tutor.user.id] });
      expect(slots.total).to.eq(1);

      const c1 = {
        userId: tutor.user.id,
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
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const now = dayjs.utc();
      await genMockData(tutor.user.id, now);

      const res = await safe(async () =>
        tutorApi.atlas.availabilitySlot.set({
          actions: [
            {
              type: "create",
              start: now.add(1, "hour").toISOString(),
              end: now.add(6, "hours").toISOString(),
            },
          ],
        })
      );

      expect(res).to.deep.eq(conflict());
    });

    it("should respond with bad request if the slot is not in the future", async () => {
      const tutorApi = await Api.forTutor();
      const now = dayjs.utc();

      const res = await safe(async () =>
        tutorApi.atlas.availabilitySlot.set({
          actions: [
            {
              type: "create",
              start: now.subtract(1, "hour").toISOString(),
              end: now.add(6, "hours").toISOString(),
            },
          ],
        })
      );

      expect(res).to.deep.eq(bad());
    });

    it("should respond with bad request if the slot is not well structured", async () => {
      const tutorApi = await Api.forTutor();
      const now = dayjs.utc();

      const res = await safe(async () =>
        tutorApi.atlas.availabilitySlot.set({
          actions: [
            {
              type: "create",
              start: now.add(4, "hours").toISOString(),
              end: now.add(2, "hours").toISOString(),
            },
          ],
        })
      );

      expect(res).to.deep.eq(bad());
    });

    it("should successfully update an existing slot", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.user.id, now);

      const newSlotData = {
        id: mock.slots[0].id,
        start: now.add(2, "days").toISOString(),
        end: now.add(3, "days").toISOString(),
      };

      await tutorApi.atlas.availabilitySlot.set({
        actions: [
          {
            type: "update",
            ...newSlotData,
          },
        ],
      });

      const slots = await availabilitySlots.find({ slots: [mock.slots[0].id] });
      expect(newSlotData.start).to.eq(first(slots.list)?.start);
      expect(newSlotData.end).to.eq(first(slots.list)?.end);
    });

    it("should cancel (out of scope) subslots upon successfull slot update", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.user.id, now);

      const newSlotData = {
        id: mock.slots[0].id,
        start: now.add(2, "days").toISOString(),
        end: now.add(3, "days").toISOString(),
      };

      await tutorApi.atlas.availabilitySlot.set({
        actions: [
          {
            type: "update",
            ...newSlotData,
          },
        ],
      });

      const lesson = await lessons.findById(mock.lessons[0].lesson.id);
      expect(lesson?.canceledBy).to.eq(tutor.user.id);
    });

    it("should successfully delete an existing slot", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.user.id, now);

      await tutorApi.atlas.availabilitySlot.set({
        actions: [
          {
            type: "delete",
            id: mock.slots[0].id,
          },
        ],
      });

      const slots = await availabilitySlots.find({ slots: [mock.slots[0].id] });
      expect(first(slots.list)?.deleted).to.be.true;
    });

    it("should respond with notfound if any of the passed slots is not found", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await tutorApi.findCurrentUser();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.user.id, now);

      const res = await safe(async () =>
        tutorApi.atlas.availabilitySlot.set({
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
        })
      );

      expect(res).to.deep.eq(notfound.slot());
    });

    it("should respond with forbidden if the requester is not the owner of any passed update/delete actions slot", async () => {
      const tutorApi = await Api.forTutor();
      const tutor = await db.tutor();
      const now = dayjs.utc();
      const mock = await genMockData(tutor.id, now);

      const res = await safe(async () =>
        tutorApi.atlas.availabilitySlot.set({
          actions: [
            {
              type: "delete",
              id: mock.slots[0].id,
            },
          ],
        })
      );

      expect(res).to.deep.eq(forbidden());
    });
  });
});
