import { interviews } from "@/interviews";
import fixtures from "@fixtures/db";
import { nameof } from "@litespace/utils/utils";
import { expect } from "chai";
import dayjs from "dayjs";
import { IInterview } from "@litespace/types";

describe("Interviews", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(interviews.create), () => {
    it("should create new interview", async () => {
      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const slot = await fixtures.slot();

      const result = await interviews.create({
        intervieweeId: tutor.id,
        interviewerId: tutorManager.id,
        start: slot.start,
        slot: slot.id,
        session: `interview:${slot.id}`,
      });

      expect(result.intervieweeId).to.eq(tutor.id);
      expect(result.interviewerId).to.eq(tutorManager.id);
    });
  });

  describe(nameof(interviews.update), () => {
    it("should update interview", async () => {
      const interview = await fixtures.interview({});

      const updated = await interviews.update({
        id: interview.id,
        interviewerFeedback: "good!",
      });

      expect(updated.interviewerFeedback).to.eq("good!");
    });
  });

  describe(nameof(interviews.cancel), () => {
    it("should cancel interview", async () => {
      const interview = await fixtures.interview({});

      await interviews.cancel({
        ids: [interview.id],
        status: IInterview.Status.CanceledByInterviewee,
      });

      const updated = await interviews.findOne({ ids: [interview.id] });
      expect(updated?.status).to.eq(IInterview.Status.CanceledByInterviewee);
    });
  });

  describe(nameof(interviews.find), () => {
    it("should filter by status", async () => {
      const [i1, i2, i3] = await Promise.all([
        fixtures.interview({}),
        fixtures.interview({}),
        fixtures.interview({}),
      ]);

      await interviews.update({ id: i2.id, status: IInterview.Status.Passed });
      await interviews.update({
        id: i3.id,
        status: IInterview.Status.Rejected,
      });

      const pendingResults = await interviews.find({
        statuses: [IInterview.Status.Pending],
      });
      expect(pendingResults.list).to.have.length(1);

      const multipleResults = await interviews.find({
        statuses: [IInterview.Status.Passed, IInterview.Status.Rejected],
      });
      expect(multipleResults.list).to.have.length(2);
    });

    it("should filter by start date", async () => {
      const now = dayjs();
      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();

      const [i1, i2] = await Promise.all([
        interviews.create({
          intervieweeId: tutor.id,
          interviewerId: tutorManager.id,
          start: now.toISOString(),
          slot: (await fixtures.slot()).id,
          session: "interview:1",
        }),
        interviews.create({
          intervieweeId: tutor.id,
          interviewerId: tutorManager.id,
          start: now.add(1, "day").toISOString(),
          slot: (await fixtures.slot()).id,
          session: "interview:2",
        }),
      ]);

      const afterResults = await interviews.find({
        start: { gte: now.add(1, "day").toISOString() },
      });
      expect(afterResults.list).to.have.length(1);
      expect(afterResults.list[0].id).to.eq(i2.id);

      const beforeResults = await interviews.find({
        start: { lt: now.add(1, "day").toISOString() },
      });
      expect(beforeResults.list).to.have.length(1);
      expect(beforeResults.list[0].id).to.eq(i1.id);
    });
  });
});
