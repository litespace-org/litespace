import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import handlers from "@/handlers/demoSession";
import { IDemoSession, IIntroVideo, IUser } from "@litespace/types";
import { dayjs, DEMO_SESSION_DURATION, nameof } from "@litespace/utils";
import { expect } from "chai";
import {
  bad,
  busyTutorManager,
  forbidden,
  inActiveTutorManager,
  notfound,
  unauthenticated,
} from "@/lib/error";
import { demoSessions, tutors } from "@litespace/models";
import { first } from "lodash";

const findDemoSession = mockApi<
  void,
  void,
  IDemoSession.FindApiPayload,
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

  describe.skip(nameof(findDemoSession), () => {
    test("Tutors can find their own demo sessions", async () => {
      const tutor = await db.tutorUser();
      const slot = await db.slot();

      await Promise.all([
        db.demoSession({
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
        }),
        db.demoSession({
          slotId: slot.id,
          start: slot.start,
        }),
      ]);

      const response = await findDemoSession({
        user: tutor,
        query: {
          tutorIds: [tutor.id],
        },
      });

      expect(response).to.not.be.instanceof(Error);
      expect(response.body?.list.length).to.equal(1);
      expect(response.body?.list[0].tutorId).to.equal(tutor.id);
    });

    test("Tutor-managers can find demo sessions for their tutors", async () => {
      const tutorManager = await db.tutorManagerUser();
      const slot = await db.slot({ userId: tutorManager.id });
      const tutor = await db.tutorUser();

      await Promise.all([
        db.demoSession({
          tutorId: tutor.id,
          slotId: slot.id,
          start: slot.start,
        }),
        db.demoSession({}),
      ]);

      const response = await findDemoSession({
        user: tutorManager,
        query: {
          tutorIds: [tutor.id],
        },
      });

      expect(response).to.not.be.instanceof(Error);
      expect(response.body?.list.length).to.equal(1);
      expect(response.body?.list[0].tutorId).to.equal(tutor.id);
    });

    test("Admins can find all demo sessions", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const tutor1 = await db.tutorUser();
      const tutor2 = await db.tutorUser();

      await db.demoSession({ tutorId: tutor1.id });
      await db.demoSession({ tutorId: tutor2.id });

      const response = await findDemoSession({
        user: admin,
        query: {},
      });

      expect(response).to.not.be.instanceof(Error);
      expect(response.body?.list.length).to.equal(2);
      expect(response.body?.list[0].tutorId).to.equal(tutor1.id);
      expect(response.body?.list[1].tutorId).to.equal(tutor2.id);
    });

    test("Admins can find demo sessions with filtering", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const tutor1 = await db.tutorUser();
      const tutor2 = await db.tutorUser();
      const tutor3 = await db.tutorUser();

      await db.demoSession({ tutorId: tutor1.id });
      await db.demoSession({ tutorId: tutor2.id });
      await db.demoSession({ tutorId: tutor3.id });

      const response = await findDemoSession({
        user: admin,
        query: {
          tutorIds: [tutor1.id, tutor2.id],
        },
      });

      expect(response.status).to.equal(200);
      expect(response.body).not.to.be.null;
      expect(response.body?.list.length).to.equal(2);
      expect(response.body?.list[0].tutorId).to.equal(tutor1.id);
      expect(response.body?.list[1].tutorId).to.equal(tutor2.id);
    });

    test("Tutors can find demo sessions with pagination", async () => {
      const tutor = await db.tutorUser();

      const demoSession = await db.demoSession({ tutorId: tutor.id });
      await db.demoSession({ tutorId: tutor.id });

      const response = await findDemoSession({
        user: tutor,
        query: {
          tutorIds: [tutor.id],
          size: 1,
        },
      });

      expect(response).to.not.be.instanceof(Error);
      expect(response.body?.list.length).to.equal(1);
      expect(response.body?.list[0].sessionId).to.equal(demoSession.sessionId);
    });

    test("Tutor cannot access other tutor's demo sessions", async () => {
      const tutor1 = await db.tutorUser();
      const tutor2 = await db.tutorUser();

      await db.demoSession({ tutorId: tutor1.id });
      await db.demoSession({ tutorId: tutor2.id });

      const response = await findDemoSession({
        user: tutor1,
        query: {
          tutorIds: [tutor1.id, tutor2.id],
        },
      });

      expect(response).to.deep.eq(forbidden());
    });

    test("Unauthorized user cannot find demo sessions", async () => {
      const tutor = await db.tutorUser();
      await db.demoSession({ tutorId: tutor.id });

      const response = await findDemoSession({
        user: undefined,
        query: {
          tutorIds: [tutor.id],
          size: 1,
          page: 1,
        },
      });

      expect(response).to.deep.equal(unauthenticated());
    });

    test("Tutor-manager cannot access other tutor's demo sessions", async () => {
      const tutorManager = await db.tutorManagerUser();
      const tutor1 = await db.tutorUser();
      const tutor2 = await db.tutorUser();
      await db.demoSession({ tutorId: tutor1.id });
      await db.demoSession({ tutorId: tutor2.id });

      const response = await findDemoSession({
        user: tutorManager,
        query: {
          tutorIds: [tutor1.id, tutor2.id],
        },
      });

      expect(response).to.deep.equal(forbidden());
    });
  });

  describe(nameof(createDemoSession), () => {
    // @moehab TODO: unskip this once the demo-session model find function is implemented
    test.skip("Regular tutors can create demo session with valid data", async () => {
      const tutor = await db.tutorUser({}, { activated: true });
      const tutorManager = await db.tutorManager({}, { activated: true });
      const slot = await db.slot({ userId: tutorManager.id });

      await db.introVideo({
        tutorId: tutor.id,
        state: IIntroVideo.State.Approved,
      });

      const response = await createDemoSession({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(response).to.not.be.instanceof(Error);

      const found = await demoSessions.find({ tutorIds: [tutor.id] });
      expect(first(found.list)?.status).to.eq(IDemoSession.Status.Pending);
    });

    test("Tutor cannot create demo session without approved intro video", async () => {
      const tutor = await db.tutorUser();
      const tutorManager = await db.tutorManager({}, { activated: true });
      const slot = await db.slot({ userId: tutorManager.id });

      await db.introVideo({
        tutorId: tutor.id,
        state: IIntroVideo.State.Rejected,
      });

      const response = await createDemoSession({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(response).to.deep.eq(forbidden());
    });

    test("Tutor-manager/Slot does not exist", async () => {
      const tutor = await db.tutorUser();

      await db.introVideo({
        tutorId: tutor.id,
        state: IIntroVideo.State.Rejected,
      });

      const response = await createDemoSession({
        user: tutor,
        body: {
          slotId: 1234,
          start: dayjs().toISOString(),
        },
      });

      expect(response).to.deep.eq(notfound.slot());
    });

    test("Tutor-manager is inactive", async () => {
      const tutor = await db.tutorUser();
      const tutorManager = await db.tutorManager({}, { activated: false });
      const slot = await db.slot({ userId: tutorManager.id });

      // ensure the tutorManager is inactive
      await tutors.update(slot.userId, { activated: false });

      await db.introVideo({
        tutorId: tutor.id,
        state: IIntroVideo.State.Rejected,
      });

      const response = await createDemoSession({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(response).to.deep.eq(inActiveTutorManager());
    });

    test("Start date is in the past", async () => {
      const tutor = await db.tutorUser();
      const tutorManager = await db.tutorManager({}, { activated: true });
      const slot = await db.slot({
        userId: tutorManager.id,
        start: dayjs().subtract(1, "hour").toISOString(),
        end: dayjs().add(1, "day").toISOString(),
      });

      await db.introVideo({
        tutorId: tutor.id,
        state: IIntroVideo.State.Approved,
      });

      // Create demo session with start date in the past
      const response = await createDemoSession({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(response).to.deep.eq(bad());
    });

    test("Start time is outside the slot", async () => {
      const tutor = await db.tutorUser();
      const tutorManager = await db.tutorManager({}, { activated: true });
      const slot = await db.slot({ userId: tutorManager.id });

      await db.introVideo({
        tutorId: tutor.id,
        state: IIntroVideo.State.Approved,
      });

      // Create demo session with start date in the past
      const response = await createDemoSession({
        user: tutor,
        body: {
          slotId: slot.id,
          start: dayjs(slot.end).add(1, "hour").toISOString(),
        },
      });

      expect(response).to.deep.eq(bad());
    });

    // @moehab TODO: unskip this once the find model function is implemented
    test.skip("Slot has no available time", async () => {
      const tutor = await db.tutorUser();
      const tutorManager = await db.tutorManager({}, { activated: true });
      const slot = await db.slot({
        userId: tutorManager.id,
        start: dayjs().add(10, "minutes").toISOString(),
        end: dayjs()
          .add(10 + DEMO_SESSION_DURATION, "minute")
          .toISOString(),
      });

      await db.introVideo({
        tutorId: tutor.id,
        state: IIntroVideo.State.Approved,
      });

      // Successfully create demo-session to fill the slot
      const res1 = await createDemoSession({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(res1).to.not.be.instanceof(Error);

      // Create demo session with start date in the past
      const tutor2 = await db.tutorUser();

      await db.introVideo({
        tutorId: tutor2.id,
        state: IIntroVideo.State.Approved,
      });

      const res2 = await createDemoSession({
        user: tutor2,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(res2).to.deep.eq(busyTutorManager());
    });

    // Test for unauthorized access
    describe("Unauthorized access", () => {
      test("Unauthorized user cannot create demo session", async () => {
        const tutor = await db.tutorUser();
        const tutorManager = await db.tutorManager({}, { activated: true });
        const slot = await db.slot({ userId: tutorManager.id });

        await db.introVideo({
          tutorId: tutor.id,
          state: IIntroVideo.State.Approved,
        });

        const response = await createDemoSession({
          user: undefined,
          body: {
            slotId: slot.id,
            start: slot.start,
          },
        });

        expect(response).to.deep.eq(unauthenticated());
      });

      test("Unauthorized users cannot create demo sessions", async () => {
        const tutor = await db.tutorUser();
        const tutorManager = await db.tutorManager({}, { activated: true });
        const slot = await db.slot({ userId: tutorManager.id });

        await db.introVideo({
          tutorId: tutor.id,
          state: IIntroVideo.State.Approved,
        });

        const responses = await Promise.all([
          await createDemoSession({
            user: await db.student(),
            body: {
              slotId: slot.id,
              start: slot.start,
            },
          }),
          await createDemoSession({
            user: await db.tutorManagerUser(),
            body: {
              slotId: slot.id,
              start: slot.start,
            },
          }),
        ]);

        for (const response of responses)
          expect(response).to.deep.eq(forbidden());
      });
    });
  });

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
