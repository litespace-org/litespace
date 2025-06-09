import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import handlers from "@/handlers/interview";
import { IInterview, IUser } from "@litespace/types";
import { expect } from "chai";
import {
  bad,
  busyTutorManager,
  conflictingInterview,
  forbidden,
  notfound,
} from "@/lib/error";
import dayjs from "dayjs";
import { interviews } from "@litespace/models";
import { genSessionId } from "@litespace/utils";

const findInterviews = mockApi<
  object,
  object,
  IInterview.FindApiQuery,
  IInterview.FindApiResponse
>(handlers.find);

const createInterview = mockApi<IInterview.CreateApiPayload, void, void, void>(
  handlers.create
);

const updateInterview = mockApi<
  IInterview.UpdateApiPayload,
  void,
  void,
  IInterview.UpdateApiResponse
>(handlers.update);

describe.skip("/api/v1/interview/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("GET /api/v1/interview/list", () => {
    it("should respond with forbidden if the requester is not allowed", async () => {
      const student = await db.user({ role: IUser.Role.Student });
      const foreignTutor = await db.user({ role: IUser.Role.Tutor });
      const foreignTutorManager = await db.user({
        role: IUser.Role.TutorManager,
      });

      const tutorManager = await db.tutorManager();

      const tutorsList = await Promise.all([
        await db.tutor(),
        await db.tutor(),
        await db.tutor(),
      ]);

      await Promise.all(
        tutorsList.map((tutor) =>
          db.interview({
            interviewerId: tutorManager.id,
            intervieweeId: tutor.id,
          })
        )
      );

      const res1 = await findInterviews({
        user: student,
        query: { users: [student.id] },
      });

      const res2 = await findInterviews({
        user: student,
        query: { users: [foreignTutor.id] },
      });

      const res3 = await findInterviews({
        user: student,
        query: { users: [foreignTutorManager.id] },
      });

      expect(res1).to.deep.eq(forbidden());
      expect(res2).to.deep.eq(forbidden());
      expect(res3).to.deep.eq(forbidden());
    });

    it("should respond with a list of interviews of a specific tutor manager", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const tutorManager = await db.tutorManager();

      const tutorsList = await Promise.all([
        await db.tutor(),
        await db.tutor(),
        await db.tutor(),
      ]);

      const interviewList = await Promise.all(
        tutorsList.map((tutor) =>
          db.interview({
            interviewerId: tutorManager.id,
            intervieweeId: tutor.id,
          })
        )
      );

      const res = await findInterviews({
        user: admin,
        query: {
          users: [tutorManager.id],
        },
      });

      expect(res.status).to.eq(200);
      const body = res.body;
      for (const interview of interviewList) {
        expect(body?.list).to.deep.contain(interview);
      }
    });
  });

  describe("POST /api/v1/interview/", () => {
    it("should respond with forbidden in case the requester is not a tutor", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const tutorManager = await db.tutorManager();
      const slot = await db.slot({ userId: tutorManager.id });

      const res = await createInterview({
        user: admin,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the interviewerId does not exist", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: 1,
          start: dayjs().toISOString(),
        },
      });

      expect(res).to.deep.eq(notfound.user());
    });

    it("should respond with bad in case the interviewerId is a tutor id", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const interviewer = await db.tutor();
      const slot = await db.slot({ userId: interviewer.id });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: slot.id,
          start: dayjs().toISOString(),
        },
      });

      expect(res).to.deep.eq(bad());
    });

    it("should successfully create the interview", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });

      const tutorManager = await db.tutorManager();
      const slot = await db.slot({ userId: tutorManager.id });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(res.status).to.eq(200);
    });

    it("should respond with conflict in case the interviewee has been interviewed for less than 6 months", async () => {
      const tutorManager = await db.tutorManager();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const slot = await db.slot({ userId: tutorManager.id });

      await interviews.create({
        start: dayjs(slot.start)
          .subtract(6, "months")
          .add(1, "day")
          .toISOString(),
        session: genSessionId("interview"),
        slot: slot.id,
        interviewerId: tutorManager.id,
        intervieweeId: tutor.id,
      });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });
      expect(res).to.deep.eq(conflictingInterview());
    });

    it("should respond with conflict in case the interviewee has already passed an interview before", async () => {
      const tutorManager = await db.tutorManager();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const slot = await db.slot({ userId: tutorManager.id });

      const interview = await interviews.create({
        start: slot.start,
        session: genSessionId("interview"),
        slot: slot.id,
        interviewerId: tutorManager.id,
        intervieweeId: tutor.id,
      });

      await interviews.update({
        id: interview.id,
        status: IInterview.Status.Passed,
      });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });
      expect(res).to.deep.eq(conflictingInterview());
    });

    it("should respond with conflict in case the interviewee has an pending interview", async () => {
      const tutorManager = await db.tutorManager();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const slot = await db.slot({ userId: tutorManager.id });
      await createInterview({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(res).to.deep.eq(conflictingInterview());
    });

    it("should respond with `busy tutor manager` error in case the interview cannot be booked", async () => {
      const tutorManager = await db.tutorManager();
      const slot = await db.slot({ userId: tutorManager.id });

      const tutor1 = await db.user({ role: IUser.Role.Tutor });
      const tutor2 = await db.user({ role: IUser.Role.Tutor });

      await createInterview({
        user: tutor1,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      const res = await createInterview({
        user: tutor2,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(res).to.deep.eq(busyTutorManager());
    });
  });

  describe("PUT /api/v1/interview/:interviewId", () => {
    it("should respond with forbidden in case the requester is not authorized", async () => {
      const requesters = {
        student: await db.student(),
        tutor: await db.user({ role: IUser.Role.Tutor }),
        tutorManager: await db.tutorManager(),
      };

      const tutorManager = await db.tutorManager();
      const tutor = await db.tutor();
      const interview = await db.interview({
        interviewerId: tutorManager.id,
        intervieweeId: tutor.id,
      });

      const res1 = await updateInterview({
        body: { id: interview.id, status: IInterview.Status.Pending },
        user: requesters.student,
      });
      const res2 = await updateInterview({
        body: { id: interview.id, status: IInterview.Status.Pending },
        user: requesters.tutor,
      });
      const res3 = await updateInterview({
        body: { id: interview.id, status: IInterview.Status.Pending },
        user: requesters.tutorManager,
      });

      expect(res1).to.deep.eq(forbidden());
      expect(res2).to.deep.eq(forbidden());
      expect(res3).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the interview doesn't exist", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const res = await updateInterview({
        body: { id: 12345, status: IInterview.Status.Pending },
        user: admin,
      });

      expect(res).to.deep.eq(notfound.interview());
    });

    it("should allow tutors to update only the feedback", async () => {
      const tutorManager = await db.tutorManager();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const interview = await db.interview({
        interviewerId: tutorManager.id,
        intervieweeId: tutor.id,
      });

      const res1 = await updateInterview({
        body: { id: interview.id, intervieweeFeedback: "empty" },
        user: tutor,
      });

      const res2 = await updateInterview({
        body: {
          id: interview.id,
          intervieweeFeedback: "empty",
          status: IInterview.Status.Passed,
        },
        user: tutor,
      });

      expect(res1.status).to.eq(200);
      expect(res2).to.deep.eq(forbidden());
    });
  });
});
