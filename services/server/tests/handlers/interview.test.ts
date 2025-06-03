import { fixtures as db, mockApi } from "@litespace/tests";
import handlers from "@/handlers/interview";
import { IInterview, IUser } from "@litespace/types";
import { expect } from "chai";
import {
  bad,
  busyTutorManager,
  conflictingInterview,
  forbidden,
  interviewAlreadySigned,
  notfound,
} from "@/lib/error";
import dayjs from "dayjs";
import { interviews } from "@litespace/models";
import { genSessionId } from "@litespace/utils";

const findInterviewById = mockApi<object, { interviewId: number }, object>(
  handlers.findInterviewById
);

const findInterviews = mockApi<
  object,
  object,
  IInterview.FindInterviewsApiQuery
>(handlers.findInterviews);

const createInterview = mockApi<IInterview.CreateApiPayload>(
  handlers.createInterview
);

const updateInterview = mockApi<
  IInterview.UpdateApiPayload,
  { interviewId: number }
>(handlers.updateInterview);

describe.skip("/api/v1/interview/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("GET /api/v1/interview/:interviewId", () => {
    it("should respond with forbidden if the requester is not allowed", async () => {
      const student = await db.user({ role: IUser.Role.Student });
      const foreignTutor = await db.user({ role: IUser.Role.Tutor });
      const foreignTutorManager = await db.user({
        role: IUser.Role.TutorManager,
      });

      const tutorManager = await db.tutorManager();
      const tutor = await db.tutor();

      const interview = await db.interview({
        interviewer: tutorManager.id,
        interviewee: tutor.id,
      });

      const res1 = await findInterviewById({
        params: { interviewId: interview.ids.self },
        user: student,
      });

      const res2 = await findInterviewById({
        params: { interviewId: interview.ids.self },
        user: foreignTutor,
      });

      const res3 = await findInterviewById({
        params: { interviewId: interview.ids.self },
        user: foreignTutorManager,
      });

      expect(res1).to.deep.eq(forbidden());
      expect(res2).to.deep.eq(forbidden());
      expect(res3).to.deep.eq(forbidden());
    });

    it("should respond with a specific interview info by its id", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });
      const tutorManager = await db.tutorManager();
      const tutor = await db.tutor();

      const interview = await db.interview({
        interviewer: tutorManager.id,
        interviewee: tutor.id,
      });

      const res = await findInterviewById({
        params: { interviewId: interview.ids.self },
        user: admin,
      });

      expect(res.status).to.eq(200);
      expect(res.body).to.deep.eq(interview);
    });
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
            interviewer: tutorManager.id,
            interviewee: tutor.id,
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
            interviewer: tutorManager.id,
            interviewee: tutor.id,
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
      const body = res.body as IInterview.FindInterviewsApiResponse;
      for (const interview of interviewList) {
        expect(body.list).to.deep.contain(interview);
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
          interviewerId: tutorManager.id,
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
          interviewerId: 12345,
          slotId: 1,
          start: dayjs().toISOString(),
        },
      });

      expect(res).to.deep.eq(notfound.user());
    });

    it("should respond with bad in case the interviewerId is a tutor id", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const interviewer = await db.tutor();

      const res = await createInterview({
        user: tutor,
        body: {
          interviewerId: interviewer.id,
          slotId: 1,
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
          interviewerId: tutorManager.id,
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
        interviewer: tutorManager.id,
        interviewee: tutor.id,
      });

      const res = await createInterview({
        user: tutor,
        body: {
          interviewerId: tutorManager.id,
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
        interviewer: tutorManager.id,
        interviewee: tutor.id,
      });

      await interviews.update(interview.ids.self, {
        status: IInterview.Status.Passed,
      });

      const res = await createInterview({
        user: tutor,
        body: {
          interviewerId: tutorManager.id,
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
          interviewerId: tutorManager.id,
          slotId: slot.id,
          start: slot.start,
        },
      });

      const res = await createInterview({
        user: tutor,
        body: {
          interviewerId: tutorManager.id,
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
          interviewerId: tutorManager.id,
          slotId: slot.id,
          start: slot.start,
        },
      });

      const res = await createInterview({
        user: tutor2,
        body: {
          interviewerId: tutorManager.id,
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
        interviewer: tutorManager.id,
        interviewee: tutor.id,
      });

      const res1 = await updateInterview({
        params: { interviewId: interview.ids.self },
        body: { status: IInterview.Status.Pending },
        user: requesters.student,
      });
      const res2 = await updateInterview({
        params: { interviewId: interview.ids.self },
        body: { status: IInterview.Status.Pending },
        user: requesters.tutor,
      });
      const res3 = await updateInterview({
        params: { interviewId: interview.ids.self },
        body: { status: IInterview.Status.Pending },
        user: requesters.tutorManager,
      });

      expect(res1).to.deep.eq(forbidden());
      expect(res2).to.deep.eq(forbidden());
      expect(res3).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the interview doesn't exist", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const res = await updateInterview({
        params: { interviewId: 12345 },
        body: { status: IInterview.Status.Pending },
        user: admin,
      });

      expect(res).to.deep.eq(notfound.interview());
    });

    it("should allow tutors to update only the feedback", async () => {
      const tutorManager = await db.tutorManager();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const interview = await db.interview({
        interviewer: tutorManager.id,
        interviewee: tutor.id,
      });

      const res1 = await updateInterview({
        params: { interviewId: interview.ids.self },
        body: { feedback: { interviewee: "empty" } },
        user: tutor,
      });

      const res2 = await updateInterview({
        params: { interviewId: interview.ids.self },
        body: {
          feedback: { interviewee: "empty" },
          status: IInterview.Status.Passed,
        },
        user: tutor,
      });

      expect(res1.status).to.eq(200);
      expect(res2).to.deep.eq(forbidden());
    });

    it("should successfully update the interview data", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const tutorManager = await db.tutorManager();
      const tutor = await db.tutor();
      const interview = await db.interview({
        interviewer: tutorManager.id,
        interviewee: tutor.id,
      });

      const res = await updateInterview({
        params: { interviewId: interview.ids.self },
        body: { sign: true },
        user: admin,
      });

      expect(res.status).to.eq(200);
      const body = res.body as IInterview.Self;
      expect(body.ids.self).to.eq(interview.ids.self);
    });

    it("should respond with 'interview already signed' error response", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const tutorManager = await db.tutorManager();
      const tutor = await db.tutor();
      const interview = await db.interview({
        interviewer: tutorManager.id,
        interviewee: tutor.id,
      });

      await updateInterview({
        params: { interviewId: interview.ids.self },
        body: { sign: true },
        user: admin,
      });

      const res = await updateInterview({
        params: { interviewId: interview.ids.self },
        body: { sign: true },
        user: admin,
      });

      expect(res).to.deep.eq(interviewAlreadySigned());
    });
  });
});
