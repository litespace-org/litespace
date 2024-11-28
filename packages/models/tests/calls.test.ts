import { calls, Calls } from "@/calls";
import fixtures, { flush } from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { expect } from "chai";
import dayjs from "@/lib/dayjs";

describe(nameof(Calls), () => {
  beforeEach(async () => {
    await flush();
  });

  describe(nameof(calls.create), () => {
    it("should insert new call row", async () => {
      const call = await calls.create();
      expect(call.id).to.be.eq(1);
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
        call: call.id,
        user: tutor.id,
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
        call: call.id,
        user: tutor.id,
      });

      expect(await calls.findCallMembers([call.id])).to.be.of.length(1);

      await calls.removeMember({
        call: call.id,
        user: tutor.id,
      });

      expect(await calls.findCallMembers([call.id])).to.be.of.length(0);
    });
  });
});
