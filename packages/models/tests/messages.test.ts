import { messages, rooms } from "@/index";
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
      const room = await rooms.create([tutor.id, student.id]);

      await messages.create({
        roomId: room,
        text: "1",
        userId: student.id,
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
      const room = await fixtures.room([tutor.id, student.id]);
      expect(
        await messages.findUnreadCount({ room: room, user: student.id })
      ).to.be.eq(0);
    });
  });

  describe(nameof(messages.markAsDeleted), () => {
    it("should mark message as deleted", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();
      const room = await rooms.create([tutor.id, student.id]);

      const message = await messages.create({
        roomId: room,
        text: "1",
        userId: student.id,
      });

      expect(message.deleted).to.be.eq(false);
      await messages.markAsDeleted(message.id);
      const updatedMessage = await messages.findById(message.id);
      expect(updatedMessage?.deleted).to.be.eq(true);
    });
  });

  describe(nameof(messages.markAsRead), () => {
    it("should mark message as read", async () => {
      const tutor = await fixtures.tutor();
      const student = await fixtures.student();
      const room = await rooms.create([tutor.id, student.id]);

      const message = await messages.create({
        roomId: room,
        text: "1",
        userId: student.id,
      });

      expect(message.read).to.be.eq(false);
      await messages.markAsRead(message.id);
      const updatedMessage = await messages.findById(message.id);
      expect(updatedMessage?.read).to.be.eq(true);
    });
  });
});
