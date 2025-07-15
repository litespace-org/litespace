import { nameof } from "@litespace/utils/utils";
import { demoSessions } from "@/demoSessions";
import { expect } from "chai";
import db from "@fixtures/db";
import { IDemoSession } from "@litespace/types";
import dayjs from "dayjs";
import { first } from "lodash";
import { safe } from "@litespace/utils";

describe("DemoSessions", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe(nameof(demoSessions.create), () => {
    it("should create a demo session successfully", async () => {
      // Create a tutor using db.tutor()
      const tutor = await db.tutor();

      // Create a slot using db.slot()
      const slot = await db.slot();

      // Create the demo session
      const now = dayjs().toISOString();
      const result = await demoSessions.create({
        slotId: slot.id,
        tutorId: tutor.id,
        start: now,
      });

      // Check the result
      expect(result).to.have.property("id");
      expect(result.id).to.be.a("number");
      expect(result).to.have.property("tutorId", tutor.id);
      expect(result).to.have.property("slotId", slot.id);
      expect(result.start).to.equal(now);
      expect(result.status).to.equal(IDemoSession.Status.Pending);
      expect(result.createdAt).to.not.be.undefined;
      expect(result.updatedAt).to.not.be.undefined;
      expect(result.sessionId.startsWith("demo:")).to.be.true;
    });
  });

  describe(nameof(demoSessions.update), () => {
    beforeEach(async () => {
      await db.flush();
    });

    it("should update a demo session successfully", async () => {
      // Create a demo session
      const tutor = await db.tutor();
      const slot = await db.slot();
      const payload: IDemoSession.CreateModelPayload = {
        slotId: slot.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      };
      const demoSession = await demoSessions.create(payload);

      // Prepare update payload
      const updatePayload: IDemoSession.UpdateModelPayload = {
        id: demoSession.id,
        status: IDemoSession.Status.Passed,
      };

      // Call the update function
      await demoSessions.update(updatePayload);

      // Verify the update
      const updatedDemoSession = first(
        (
          await demoSessions.find({
            ids: [updatePayload.id],
          })
        ).list
      );

      expect(updatedDemoSession).to.have.property("id", updatePayload.id);
      expect(updatedDemoSession).to.have.property("tutorId", tutor.id);
      expect(updatedDemoSession).to.have.property("slotId", slot.id);
      expect(updatedDemoSession?.status).to.equal(updatePayload.status);
      expect(updatedDemoSession?.updatedAt).to.not.equal(demoSession.updatedAt);
    });

    it("should throw an error if the demo session does not exist", async () => {
      const res = await safe(() =>
        demoSessions.update({
          id: 999,
          status: IDemoSession.Status.Passed,
        })
      );

      expect(res).to.be.instanceof(Error);
    });
  });

  describe(nameof(demoSessions.find), () => {
    beforeEach(async () => {
      await db.flush();
    });

    it("should return a paginated list of demo sessions when no filters are applied", async () => {
      // Create 3 demo sessions
      const tutor = await db.tutor();
      const slot = await db.slot();
      const demoSession1 = await demoSessions.create({
        slotId: slot.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      const demoSession2 = await demoSessions.create({
        slotId: slot.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      const demoSession3 = await demoSessions.create({
        slotId: slot.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      // Call the find function with no filters and pagination
      const result = await demoSessions.find({});

      // Check that the result contains 3 demo sessions
      expect(result.total).to.equal(3);
      expect(result.list).to.deep.members([
        demoSession1,
        demoSession2,
        demoSession3,
      ]);
    });

    it("should return a paginated list of demo sessions when filters are applied", async () => {
      // Create 3 demo sessions
      const tutor = await db.tutor();
      const slot = await db.slot();
      const demoSession1 = await demoSessions.create({
        slotId: slot.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      const demoSession2 = await demoSessions.create({
        slotId: slot.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      await demoSessions.create({
        slotId: slot.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      // Apply filters to the find function
      const result = await demoSessions.find({
        ids: [demoSession1.id, demoSession2.id],
        select: ["id", "tutorId", "slotId", "status"],
        size: 2,
      });

      // Check that the result contains 2 demo sessions
      expect(result.total).to.equal(2);
      expect(result.list.map((r) => r.id)).to.deep.members([
        demoSession2.id,
        demoSession1.id,
      ]);

      expect(result.list[0]).to.have.property("id");
      expect(result.list[0]).to.have.property("tutorId");
      expect(result.list[0]).to.have.property("slotId");
      expect(result.list[0]).to.have.property("status");

      expect(result.list[0]).to.not.have.property("start");
      expect(result.list[0]).to.not.have.property("createdAt");
    });

    it("should return correctly filtered list of demo sessions by tutorManagerIds", async () => {
      // Create 3 demo sessions
      const tutor = await db.tutor();

      const slot1 = await db.slot();
      const slot2 = await db.slot();

      const demoSession1 = await demoSessions.create({
        slotId: slot1.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      await demoSessions.create({
        slotId: slot2.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      const demoSession3 = await demoSessions.create({
        slotId: slot1.id,
        tutorId: tutor.id,
        start: dayjs().toISOString(),
      });

      // Apply filters to the find function
      const result = await demoSessions.find({
        tutorManagerIds: [slot1.userId],
      });

      // Check that the result contains 2 demo sessions
      expect(result.total).to.equal(2);
      expect(result.list).to.deep.members([demoSession3, demoSession1]);
    });

    it("should return an empty list when no demo sessions match the filters", async () => {
      // Apply filters to the find function that should not match any demo sessions
      const result = await demoSessions.find({
        ids: [999, 1000],
        select: ["id", "tutorId", "slotId", "status"],
      });

      // Check that the result is empty
      expect(result.total).to.equal(0);
      expect(result.list.length).to.equal(0);
    });
  });
});
