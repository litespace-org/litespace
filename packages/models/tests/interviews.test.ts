import { interviews } from "@/interviews";
import fixtures from "@fixtures/db";
import { nameof } from "@litespace/utils/utils";
import { expect } from "chai";
import dayjs from "@/lib/dayjs";

describe("Interviews", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(interviews.create), () => {
    it("should successfully create new record in interviews table", async () => {
      const now = dayjs();

      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const slot = await fixtures.slot({
        start: now.add(1, "day").toISOString(),
      });

      const result = await interviews.create({
        intervieweeId: tutor.id,
        interviewerId: tutorManager.id,
        start: now.add(1, "day").toISOString(),
        slot: slot.id,
        session: `interview:${slot.id}`,
      });

      expect(result.intervieweeId).to.eq(tutor.id);
      expect(result.interviewerId).to.eq(tutorManager.id);
      expect(result.slotId).to.eq(slot.id);
      expect(result.sessionId).to.eq(`interview:${slot.id}`);
      expect(result.start).to.eq(now.add(1, "day").toISOString());
      expect(result.createdAt).to.not.be.undefined;
      expect(result.createdAt).to.eq(result.updatedAt);
    });
  });

  describe(nameof(interviews.update), () => {
    it("should successfully update the records", async () => {
      const now = dayjs();

      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const slot = await fixtures.slot({
        start: now.add(1, "day").toISOString(),
      });

      const result = await interviews.create({
        intervieweeId: tutor.id,
        interviewerId: tutorManager.id,
        start: now.add(1, "day").toISOString(),
        slot: slot.id,
        session: `interview:${slot.id}`,
      });

      const updated = await interviews.update({
        id: result.id,
        interviewerFeedback: "good!",
      });

      expect(updated.intervieweeId).to.eq(tutor.id);
      expect(updated.interviewerId).to.eq(tutorManager.id);
      expect(updated.slotId).to.eq(slot.id);
      expect(updated.sessionId).to.eq(`interview:${slot.id}`);
      expect(updated.start).to.eq(now.add(1, "day").toISOString());
      expect(updated.createdAt).to.not.be.undefined;
      expect(updated.createdAt).to.eq(result.updatedAt);
      expect(updated.interviewerFeedback).to.eq("good!");
    });
  });
});
