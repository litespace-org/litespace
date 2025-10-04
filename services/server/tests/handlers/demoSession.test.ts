import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import handlers from "@/handlers/demoSession";
import { IDemoSession, IIntroVideo, IUser } from "@litespace/types";
import { dayjs, DEMO_SESSION_DURATION } from "@litespace/utils";
import { expect } from "chai";
import {
  bad,
  busyTutorManager,
  forbidden,
  inActiveTutorManager,
  notfound,
  unauthenticated,
} from "@/lib/error/api";
import { demoSessions, tutors } from "@litespace/models";
import { first } from "lodash";

const findDemoSession = mockApi<
  void,
  void,
  IDemoSession.FindApiQuery,
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

  describe("DemoSession Find Handler", () => {
    describe("Tutors", () => {
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

      test("Tutors can find demo sessions with pagination", async () => {
        const tutor = await db.tutorUser();

        await db.demoSession({ tutorId: tutor.id });
        const demoSession = await db.demoSession({ tutorId: tutor.id });

        const response = await findDemoSession({
          user: tutor,
          query: {
            tutorIds: [tutor.id],
            size: 1,
          },
        });

        expect(response).to.not.be.instanceof(Error);
        expect(response.body?.list.length).to.equal(1);
        expect(response.body?.list[0].sessionId).to.equal(
          demoSession.sessionId
        );
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

      test("Tutor cannot access all tutors demo sessions", async () => {
        const tutor1 = await db.tutorUser();
        const tutor2 = await db.tutorUser();

        await db.demoSession({ tutorId: tutor1.id });
        await db.demoSession({ tutorId: tutor2.id });

        const response = await findDemoSession({
          user: tutor1,
          query: {},
        });

        expect(response).to.deep.eq(forbidden());
      });
    });

    describe("Tutor Managers", () => {
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
            tutorManagerIds: [tutorManager.id],
            tutorIds: [tutor.id],
          },
        });

        expect(response).to.not.be.instanceof(Error);
        expect(response.body?.list.length).to.equal(1);
        expect(response.body?.list[0].tutorId).to.equal(tutor.id);
      });

      test("Tutor-manager cannot access other tutor-manager's demo sessions", async () => {
        const tutorManager1 = await db.tutorManagerUser();
        const tutorManager2 = await db.tutorManagerUser();

        const response = await findDemoSession({
          user: tutorManager1,
          query: {
            tutorManagerIds: [tutorManager1.id, tutorManager2.id],
          },
        });

        expect(response).to.deep.equal(forbidden());
      });

      test("Tutor-manager cannot access all tutor-managers demo sessions", async () => {
        const tutor1 = await db.tutorUser();
        const tutor2 = await db.tutorUser();

        await db.demoSession({ tutorId: tutor1.id });
        await db.demoSession({ tutorId: tutor2.id });

        const response = await findDemoSession({
          user: tutor1,
          query: {},
        });

        expect(response).to.deep.eq(forbidden());
      });
    });

    describe("Admins", () => {
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
        expect(response.body?.list[1].tutorId).to.equal(tutor1.id);
        expect(response.body?.list[0].tutorId).to.equal(tutor2.id);
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
        expect(response.body?.list[1].tutorId).to.equal(tutor1.id);
        expect(response.body?.list[0].tutorId).to.equal(tutor2.id);
      });
    });

    describe("Unauthorized Access", () => {
      test("Unauthenticated user cannot find demo sessions", async () => {
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

      test("Unauthorized users cannot find demo sessions", async () => {
        const responses = await Promise.all([
          await findDemoSession({
            user: await db.student(),
            query: {},
          }),
          await findDemoSession({
            user: await db.user({ role: IUser.Role.Studio }),
            query: {},
          }),
        ]);

        for (const response of responses)
          expect(response).to.deep.eq(forbidden());
      });
    });
  });

  describe("DemoSession Create Handler", () => {
    test("Regular tutors can create demo session with valid data", async () => {
      const tutor = await db.tutorUser({}, { activated: true });
      const tutorManager = await db.tutorManager({}, { activated: true });
      const slot = await db.slot({
        userId: tutorManager.id,
        start: dayjs().add(1, "hour").toISOString(),
        end: dayjs().add(4, "hours").toISOString(),
      });

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

      const found = await demoSessions.find({ tutorManagerIds: [slot.userId] });
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

    test("Slot has no available time", async () => {
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
      test("Unauthenticated users cannot create demo session", async () => {
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
          await createDemoSession({
            user: await db.user({ role: IUser.Role.Studio }),
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

  describe("DemoSession Update Handler", () => {
    describe("Tutors", () => {
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

    describe("Tutor Managers", () => {
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
        const tutorManager = await db.tutorManagerUser();
        const demoSession = await db.demoSession({ tutorId: tutorManager.id });

        const responses = await Promise.all([
          await updateDemoSession({
            user: tutorManager,
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.CanceledByAdmin,
            },
          }),
          await updateDemoSession({
            user: tutorManager,
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

    describe("Admins", () => {
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
          ids: [demoSession.id],
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
    });

    // Test for unauthorized access
    describe("Unauthorized access", () => {
      test("Unauthenticated user cannot update demo session", async () => {
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

      test("Unauthorized users cannot update demo session", async () => {
        const tutorUser = await db.tutorUser();
        const demoSession = await db.demoSession({ tutorId: tutorUser.id });

        const responses = await Promise.all([
          updateDemoSession({
            user: await db.student(),
            body: {
              id: demoSession.id,
              status: IDemoSession.Status.Rejected,
            },
          }),
          updateDemoSession({
            user: await db.user({ role: IUser.Role.Studio }),
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

    // Tests for other error types
    describe("Not Found", () => {
      test("DemoSession does not exist", async () => {
        const tutorManager = await db.tutorManagerUser();

        const response = await updateDemoSession({
          user: tutorManager,
          body: {
            id: 9999,
            status: IDemoSession.Status.CanceledByTutorManager,
          },
        });

        expect(response).to.deep.eq(notfound.demoSession());
      });
    });
  });
});
