import { knex, messages, rooms } from "@/index";
import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol";
import { expect } from "chai";

describe("Messages", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(messages.countUserMessages), () => {
    it("should return zero in case user has no messages", async () => {
      const student = await fixtures.student();
      expect(await messages.countUserMessages({ user: student.id })).to.be.eq(
        0
      );
    });

    it("should count total messages for a given user", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();

      const room = await knex.transaction(async (tx) => {
        const room = await rooms.create([tutor.id, student.id], tx);
        await messages.create(
          {
            roomId: room,
            text: "1",
            userId: student.id,
          },
          tx
        );
        return room;
      });

      expect(await messages.countUserMessages({ user: student.id })).to.be.eq(
        1
      );

      await messages.create({
        roomId: room,
        text: "2",
        userId: student.id,
      });

      expect(await messages.countUserMessages({ user: student.id })).to.be.eq(
        2
      );
    });
  });

  describe(nameof(messages.findLatestRoomMessage), () => {
    it("should return null incase room is empty or not found", async () => {
      expect(await messages.findUnreadCount({ room: 10, user: 1 })).to.be.eq(0);
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();
      const room = await knex.transaction(
        async (tx) => await fixtures.room(tx, [tutor.id, student.id])
      );
      expect(
        await messages.findUnreadCount({ room: room, user: student.id })
      ).to.be.eq(0);
    });
  });
});
