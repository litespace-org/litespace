import { availabilitySlots } from "@/availabilitySlots";
import fixtures from "@fixtures/db";
import { IAvailabilitySlot, IUser } from "@litespace/types";
import { dayjs, nameof, safe } from "@litespace/utils";
import { expect } from "chai";
import { first } from "lodash";

describe("AvailabilitySlots", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(availabilitySlots.create), () => {
    it("should create a list of new AvailabilitySlot rows in the database", async () => {
      const user = await fixtures.user({});
      const res = await availabilitySlots.create([
        {
          userId: user.id,
          start: dayjs.utc().toISOString(),
          end: dayjs.utc().add(1, "hour").toISOString(),
        },
        {
          userId: user.id,
          start: dayjs.utc().add(2, "hour").toISOString(),
          end: dayjs.utc().add(4, "hour").toISOString(),
        },
      ]);
      expect(res).to.have.length(2);
    });
    it("should throw an error if the payloads list is empty", async () => {
      const res = await safe(async () => availabilitySlots.create([]));
      expect(res).to.be.instanceOf(Error);
    });
  });

  describe(nameof(availabilitySlots.find), () => {
    it("should retieve AvailabilitySlot rows of a list of users", async () => {
      const user1 = await fixtures.user({});
      const user2 = await fixtures.user({});

      const slots = await availabilitySlots.create([
        {
          userId: user1.id,
          start: dayjs.utc().toISOString(),
          end: dayjs.utc().add(1, "hour").toISOString(),
        },
        {
          userId: user1.id,
          start: dayjs.utc().add(2, "hour").toISOString(),
          end: dayjs.utc().add(4, "hour").toISOString(),
        },
        {
          userId: user2.id,
          start: dayjs.utc().add(6, "hour").toISOString(),
          end: dayjs.utc().add(7, "hour").toISOString(),
        },
      ]);

      const res = await availabilitySlots.find({
        userIds: [user1.id, user2.id],
      });
      expect(res.total).to.eq(3);
      expect(res.list).to.deep.eq(slots.reverse());
    });

    it("should filter by user role", async () => {
      const user1 = await fixtures.user({ role: IUser.Role.Tutor });
      const user2 = await fixtures.user({ role: IUser.Role.TutorManager });

      const slots = await availabilitySlots.create([
        {
          userId: user1.id,
          start: dayjs.utc().toISOString(),
          end: dayjs.utc().add(1, "hour").toISOString(),
        },
        {
          userId: user1.id,
          start: dayjs.utc().add(2, "hour").toISOString(),
          end: dayjs.utc().add(4, "hour").toISOString(),
        },
        {
          userId: user2.id,
          start: dayjs.utc().add(6, "hour").toISOString(),
          end: dayjs.utc().add(7, "hour").toISOString(),
        },
      ]);

      const res = await availabilitySlots.find({
        userIds: [user1.id, user2.id],
        roles: [IUser.Role.TutorManager],
      });

      expect(res.total).to.eq(1);
      expect(res.list).to.deep.eq(slots.filter((s) => s.userId === user2.id));
    });

    it("should filter by slot purpose", async () => {
      const user1 = await fixtures.user({ role: IUser.Role.Tutor });
      const user2 = await fixtures.user({ role: IUser.Role.TutorManager });

      const now = dayjs.utc();

      const slots = await availabilitySlots.create([
        {
          userId: user1.id,
          purpose: IAvailabilitySlot.Purpose.Lesson,
          start: now.toISOString(),
          end: now.add(1, "hour").toISOString(),
        },
        {
          userId: user1.id,
          purpose: IAvailabilitySlot.Purpose.Lesson,
          start: now.add(2, "hour").toISOString(),
          end: now.add(4, "hour").toISOString(),
        },
        {
          userId: user2.id,
          purpose: IAvailabilitySlot.Purpose.Interview,
          start: now.add(6, "hour").toISOString(),
          end: now.add(7, "hour").toISOString(),
        },
        {
          userId: user2.id,
          purpose: IAvailabilitySlot.Purpose.Lesson,
          start: now.add(8, "hour").toISOString(),
          end: now.add(9, "hour").toISOString(),
        },
      ]);

      const after = now.add(6, "hour").toISOString();
      const before = now.add(9, "hour").toISOString();

      const res = await availabilitySlots.find({
        purposes: [
          IAvailabilitySlot.Purpose.General,
          IAvailabilitySlot.Purpose.Interview,
        ],
        start: {
          gte: after,
          lt: before,
        },
        end: {
          gt: after,
          lte: before,
        },
      });

      expect(res.total).to.eq(1);
      expect(res.list).to.deep.eq(
        slots.filter(
          (s) =>
            s.userId === user2.id &&
            s.purpose === IAvailabilitySlot.Purpose.Interview
        )
      );
    });

    it("should retieve AvailabilitySlot rows between two dates", async () => {
      const user = await fixtures.user({});

      const slots = await availabilitySlots.create([
        {
          userId: user.id,
          start: dayjs.utc().toISOString(),
          end: dayjs.utc().add(1, "hour").toISOString(),
        },
        {
          userId: user.id,
          start: dayjs.utc().add(2, "hour").toISOString(),
          end: dayjs.utc().add(4, "hour").toISOString(),
        },
        {
          userId: user.id,
          start: dayjs.utc().add(6, "hour").toISOString(),
          end: dayjs.utc().add(7, "hour").toISOString(),
        },
      ]);

      const res = await availabilitySlots.find({
        start: {
          gte: slots[0].start,
          lte: slots[1].end,
        },
      });

      expect(res.total).to.eq(2);
      expect(res.list).to.deep.eq(slots.slice(0, 2).reverse());
    });

    it("should retieve AvailabilitySlot rows that partially contained within two dates", async () => {
      const user = await fixtures.user({});

      const slots = await availabilitySlots.create([
        {
          userId: user.id,
          start: dayjs.utc().toISOString(),
          end: dayjs.utc().add(1, "hour").toISOString(),
        },
        {
          userId: user.id,
          start: dayjs.utc().add(2, "hour").toISOString(),
          end: dayjs.utc().add(4, "hour").toISOString(),
        },
        {
          userId: user.id,
          start: dayjs.utc().add(6, "hour").toISOString(),
          end: dayjs.utc().add(7, "hour").toISOString(),
        },
      ]);

      const res = await availabilitySlots.find({
        start: {
          gte: dayjs.utc().add(0.5, "hour").toISOString(),
          lt: dayjs.utc().add(6.5, "hour").toISOString(),
        },
        end: {
          gt: dayjs.utc().add(0.5, "hour").toISOString(),
          lte: dayjs.utc().add(6.5, "hour").toISOString(),
        },
      });

      expect(res.total).to.eq(3);
      expect(res.list).to.deep.eq(slots.reverse());
    });
  });

  describe(nameof(availabilitySlots.update), () => {
    it("should update an available AvailabilitySlot row in the database", async () => {
      const user = await fixtures.user({});

      const slots = await availabilitySlots.create([
        {
          userId: user.id,
          start: dayjs.utc().toISOString(),
          end: dayjs.utc().add(1, "hour").toISOString(),
        },
      ]);

      await availabilitySlots.update(slots[0].id, {
        start: dayjs.utc().add(2, "hour").toISOString(),
        end: dayjs.utc().add(3, "hour").toISOString(),
      });

      const updated = await availabilitySlots.findById(slots[0].id);

      const res = await availabilitySlots.find({ userIds: [user.id] });
      expect(first(res.list)).to.deep.eq(updated);
    });
  });

  describe(nameof(availabilitySlots.delete), () => {
    it("should delete a list of available AvailabilitySlot rows from the database", async () => {
      const user = await fixtures.user({});

      const created = await availabilitySlots.create([
        {
          userId: user.id,
          start: dayjs.utc().toISOString(),
          end: dayjs.utc().add(1, "hour").toISOString(),
        },
        {
          userId: user.id,
          start: dayjs.utc().add(2, "hour").toISOString(),
          end: dayjs.utc().add(4, "hour").toISOString(),
        },
      ]);

      await availabilitySlots.delete(created.map((slot) => slot.id));

      const res = await availabilitySlots.find({ userIds: [user.id] });
      expect(res.total).to.eql(0);
    });

    it("should NOT delete a list of available AvailabilitySlot rows from the database if it has associated lessons/interviews", async () => {
      const user = await fixtures.user({});

      const [slot] = await availabilitySlots.create([
        {
          userId: user.id,
          start: dayjs.utc().toISOString(),
          end: dayjs.utc().add(1, "hour").toISOString(),
        },
      ]);

      await fixtures.lesson({ slot: slot.id });

      const res = await safe(async () => availabilitySlots.delete([slot.id]));
      expect(res).to.be.instanceof(Error);
    });
  });
});
