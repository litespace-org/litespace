import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import handlers from "@/handlers/demoSession";
import { IDemoSession, IUser } from "@litespace/types";
import { nameof } from "@litespace/utils";
import { expect } from "chai";
import { forbidden, unauthenticated } from "@/lib/error";
import { demoSessions } from "@litespace/models";
import { first } from "lodash";

const findDemoSession = mockApi<
  IDemoSession.FindApiPayload,
  object,
  object,
  IDemoSession.FindApiResponse
>(handlers.find);

const createDemoSession = mockApi<
  IDemoSession.CreateApiPayload,
  object,
  object,
  IDemoSession.CreateApiResponse
>(handlers.create);

const updateDemoSession = mockApi<
  IDemoSession.UpdateApiPayload,
  object,
  object,
  IDemoSession.UpdateApiResponse
>(handlers.update);

describe("/api/v1/demo-session/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  // @moehab @TODO: write test suite for this function.
  // @mk @TODO: unskip this suite and ensure it passes.
  describe(nameof(findDemoSession), () => {
    it("", () => {
      expect(true);
    });
  });

  // @moehab @TODO: write test suite for this function.
  // @galal @TODO: unskip this suite and ensure it passes.
  describe(nameof(createDemoSession), () => {
    it("", () => {
      expect(true);
    });
  });

  // @galal @TODO: unskip this suite and ensure it passes.
  describe.skip(nameof(updateDemoSession), () => {
    // Test for tutor
    describe("Tutor can update their own demo session", () => {
      test("Tutor can cancel their own demo session", async () => {
        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutorUser.id });

        const response = await updateDemoSession({
          user: tutorUser,
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.CanceledByTutor,
          },
        });

        expect(response).to.not.be.instanceof(Error);

        const updated = await demoSessions.find({ ids: [demoSession.id] });
        expect(first(updated.list)?.status).to.eq(
          IDemoSession.Status.CanceledByTutor
        );
      });

      test("Tutor cannot update another tutor's demo session", async () => {
        const tutor1 = await db.tutorUser();
        const tutor2 = await db.tutorUser();
        await db.demoSession({ tutorId: tutor1.id });
        const tutor2DemoSession = await db.demoSession({ tutorId: tutor2.id });

        const response = await updateDemoSession({
          user: tutor1,
          body: {
            id: tutor2DemoSession.id,
            status: IDemoSession.Status.CanceledByTutor,
          },
        });

        expect(response).to.deep.eq(forbidden());
      });

      test("Tutor cannot update a demo session to a status rather than CanceledByTutor", async () => {
        const tutor = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutor.id });

        const responses = await Promise.all([
          await updateDemoSession({
            user: tutor,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.CanceledByAdmin,
            },
          }),
          await updateDemoSession({
            user: tutor,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.CanceledByTutorManager,
            },
          }),
          await updateDemoSession({
            user: tutor,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.Passed,
            },
          }),
          await updateDemoSession({
            user: tutor,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.Rejected,
            },
          }),
        ]);

        for (const response of responses)
          expect(response).to.deep.eq(forbidden());
      });
    });

    // Test for tutor manager
    describe("Tutor Manager can update demo sessions", () => {
      test("Tutor Manager can cancel a demo session", async () => {
        const tutorManager = await db.tutorManagerUser();
        const slot = await db.slot({ userId: tutorManager.id });

        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({
          slotId: slot.id,
          tutorId: tutorUser.id,
        });

        const response = await updateDemoSession({
          user: tutorManager,
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.CanceledByTutorManager,
          },
        });

        expect(response).not.be.instanceof(Error);

        const updated = await demoSessions.find({ ids: [demoSession.id] });
        expect(first(updated.list)?.status).to.eq(
          IDemoSession.Status.CanceledByTutorManager
        );
      });

      test("Tutor Manager can pass a demo session", async () => {
        const tutorManager = await db.tutorManagerUser();
        const slot = await db.slot({ userId: tutorManager.id });

        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({
          slotId: slot.id,
          tutorId: tutorUser.id,
        });

        const response = await updateDemoSession({
          user: tutorManager,
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.Passed,
          },
        });

        expect(response).to.not.be.instanceof(Error);

        const updated = await demoSessions.find({ ids: [demoSession.id] });
        expect(first(updated.list)?.status).to.eq(IDemoSession.Status.Passed);
      });

      test("Tutor Manager cannot update another tutor's demo session", async () => {
        const tutorManager = await db.tutorManagerUser();
        const slot = await db.slot();

        const tutor1 = await db.tutorUser();
        await db.demoSession({
          slotId: slot.id,
          tutorId: tutor1.id,
        });

        const tutor2 = await db.tutorUser();
        const tutor2DemoSession = await db.demoSession({ tutorId: tutor2.id });

        const response = await updateDemoSession({
          user: tutorManager,
          body: {
            id: tutor2DemoSession.id,
            status: IDemoSession.Status.Passed,
          },
        });

        expect(response).to.deep.eq(forbidden());
      });

      test("TutorManager cannot update a demo session to a status rather than CanceledByTutorManager, Passed, and Rejected", async () => {
        const tutor = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutor.id });

        const responses = await Promise.all([
          await updateDemoSession({
            user: tutor,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.CanceledByAdmin,
            },
          }),
          await updateDemoSession({
            user: tutor,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.CanceledByTutor,
            },
          }),
        ]);

        for (const response of responses)
          expect(response).to.deep.eq(forbidden());
      });
    });

    // Test for admin
    describe("Admin can update any demo session", () => {
      test("Admin can cancel any demo session", async () => {
        const admin = await db.user({ role: IUser.Role.RegularAdmin });

        const tutor = await db.tutor();
        const demoSession = await db.demoSession({ tutorId: tutor.id });

        const response = await updateDemoSession({
          user: admin,
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.CanceledByAdmin,
          },
        });

        expect(response).to.not.be.instanceof(Error);

        const updated = await demoSessions.find({ ids: [demoSession.id] });
        expect(first(updated.list)?.status).to.eq(
          IDemoSession.Status.CanceledByAdmin
        );
      });

      test("Admin can pass any demo session", async () => {
        const admin = await db.user({ role: IUser.Role.RegularAdmin });

        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutorUser.id });

        const response = await updateDemoSession({
          user: admin,
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.Passed,
          },
        });

        expect(response).to.not.be.instanceof(Error);

        const updated = await demoSessions.find({ ids: [demoSession.id] });
        expect(first(updated.list)?.status).to.eq(IDemoSession.Status.Passed);
      });

      test("Admin can reject any demo session", async () => {
        const admin = await db.user({ role: IUser.Role.RegularAdmin });

        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutorUser.id });

        const response = await updateDemoSession({
          user: admin,
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.Rejected,
          },
        });

        expect(response).to.not.be.instanceof(Error);

        const updated = await demoSessions.find({ ids: [demoSession.id] });
        expect(first(updated.list)?.status).to.eq(IDemoSession.Status.Rejected);
      });

      test("Admin can reject an already passed demo session", async () => {
        const admin = await db.user({ role: IUser.Role.RegularAdmin });

        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutorUser.id });

        await demoSessions.update({
          id: demoSession.id,
          status: IDemoSession.Status.Passed,
        });

        const response = await updateDemoSession({
          user: admin,
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.Rejected,
          },
        });

        expect(response).to.not.be.instanceof(Error);

        const updated = await demoSessions.find({ ids: [demoSession.id] });
        expect(first(updated.list)?.status).to.eq(IDemoSession.Status.Rejected);
      });

      test("TutorManager cannot update a demo session to a these statuses CanceledByTutorManager and CanceledByTutor", async () => {
        const tutor = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutor.id });

        const responses = await Promise.all([
          await updateDemoSession({
            user: tutor,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.CanceledByTutor,
            },
          }),
          await updateDemoSession({
            user: tutor,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.CanceledByTutorManager,
            },
          }),
        ]);

        for (const response of responses)
          expect(response).to.deep.eq(forbidden());
      });
    });

    // Test for unauthorized access
    describe("Unauthorized access", () => {
      test("Unauthorized user cannot update demo session", async () => {
        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutorUser.id });

        const response = await updateDemoSession({
          user: undefined,
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.Rejected,
          },
        });

        expect(response).to.deep.eq(unauthenticated());
      });

      test("Student user cannot update demo session", async () => {
        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutorUser.id });

        const response = await updateDemoSession({
          user: await db.student(),
          body: {
            id: demoSession.id,
            status: IDemoSession.Status.Rejected,
          },
        });

        expect(response).to.deep.eq(forbidden());
      });
    });
  });
});
