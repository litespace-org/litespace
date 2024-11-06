import { messages, rooms } from "@/index";
import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { expect } from "chai";

describe("Lessons", () => {
  beforeAll(async () => {
    await fixtures.flush();
  });

  afterEach(async () => {
    await fixtures.flush();
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
});
