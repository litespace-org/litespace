import { availabilitySlots } from "@/availabilitySlot";
import fixtures from "@fixtures/db";
import { dayjs, nameof, safe } from "@litespace/sol";
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

      const res = await availabilitySlots.find({ users: [user1.id, user2.id] });
      expect(res).to.have.length(3);
      expect(res).to.deep.eq(slots);
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
        after: slots[0].start,
        before: slots[1].end,
      });

      expect(res).to.have.length(2);
      expect(res).to.deep.eq(slots.slice(0, 2));
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

      const updated = await availabilitySlots.update(slots[0].id, {
        start: dayjs.utc().add(2, "hour").toISOString(),
        end: dayjs.utc().add(3, "hour").toISOString(),
      });

      const found = first(await availabilitySlots.find({ users: [user.id] }));
      expect(found).to.deep.eq(updated);
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

      const res = await availabilitySlots.find({ users: [user.id] });
      expect(res).to.have.length(0);
    });
    it("should throw an error if the ids list is empty", async () => {
      const res = await safe(async () => availabilitySlots.delete([]));
      expect(res).to.be.instanceOf(Error);
    });
  });
});
