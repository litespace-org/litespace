import { calls, Calls } from "@/calls";
import fixtures, { flush } from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { expect } from "chai";
import dayjs from "@/lib/dayjs";

describe(nameof(Calls), () => {
  beforeEach(async () => {
    return await flush();
  });

  describe(nameof(calls.create), () => {
    it("should insert new call row", async () => {
      const call = await calls.create();
      expect(dayjs.utc(call.createdAt).isValid()).to.be.true;
      expect(dayjs.utc(call.updatedAt).isValid()).to.be.true;
      expect(call.processingTime).to.be.eq(null);
      expect(call.recordingStatus).to.be.eq("idle");
    });
  });

  describe(nameof(calls.addMember), () => {
    it("should add member to the call", async () => {
      const call = await calls.create();
      const tutor = await fixtures.tutor();

      expect(await calls.findCallMembers([call.id])).to.be.of.length(0);

      const member = await calls.addMember({
        callId: call.id,
        userId: tutor.id,
      });
      expect(await calls.findCallMembers([call.id])).to.be.of.length(1);
      expect(member.callId).to.be.eq(call.id);
      expect(member.userId).to.be.eq(tutor.id);
    });
  });

  describe(nameof(calls.removeMember), () => {
    it("should remove member from the call", async () => {
      const call = await calls.create();
      const tutor = await fixtures.tutor();

      expect(await calls.findCallMembers([call.id])).to.be.of.length(0);

      await calls.addMember({
        callId: call.id,
        userId: tutor.id,
      });

      expect(await calls.findCallMembers([call.id])).to.be.of.length(1);

      await calls.removeMember({
        callId: call.id,
        userId: tutor.id,
      });

      expect(await calls.findCallMembers([call.id])).to.be.of.length(0);
    });
  });

  describe(nameof(calls.find), () => {
    it("should retrieve list of calls for specific user", async () => {
      const tutor = await fixtures.tutor();
      const lesson = await fixtures.lesson({
        tutor: tutor.id,
      });

      const interview = await fixtures.interview({
        interviewee: tutor.id,
      });

      const result = await calls.find({
        users: [tutor.id],
        full: true,
      });
      expect(result.list.length).to.be.eq(2);
      expect(result.list.map((call) => call.id)).to.be.deep.eq([
        lesson.lesson.callId,
        interview.ids.call,
      ]);
    });

    it("should filter calls between two dates", async () => {
      const tutor = await fixtures.tutor();

      const firstLesson = await fixtures.lesson({
        tutor: tutor.id,
        start: dayjs.utc().subtract(1, "hour").toISOString(),
        duration: 30,
      });

      const secondLesson = await fixtures.lesson({
        tutor: tutor.id,
        start: dayjs.utc().add(30, "minutes").toISOString(),
        duration: 30,
      });

      const tests = [
        {
          after: dayjs.utc().toISOString(),
          count: 1,
        },
        {
          after: dayjs.utc().subtract(45, "minutes").toISOString(),
          count: 2,
        },
        {
          after: dayjs.utc().add(1, "hour").toISOString(),
          count: 0,
        },
        {
          after: dayjs.utc().add(45, "minute").toISOString(),
          count: 1,
        },
        {
          before: dayjs.utc().toISOString(),
          count: 1,
        },
        {
          before: dayjs.utc().add(1, "day").toISOString(),
          count: 2,
        },
      ];

      for (const test of tests) {
        const result = await calls.find({
          users: [tutor.id],
          full: true,
          after: test.after,
          before: test.before,
        });
        expect(result.list.length).to.be.eq(test.count);
      }
    });
  });
});
