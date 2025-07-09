import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import handlers from "@/handlers/interview";
import { IAvailabilitySlot, IInterview, IUser } from "@litespace/types";
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
import {
  genSessionId,
  INTERVIEW_DURATION,
  INTERVIEW_MIN_RETRY_PERIOD_IN_DAYS,
} from "@litespace/utils";

const findInterviews = mockApi<
  object,
  object,
  IInterview.FindApiQuery,
  IInterview.FindApiResponse
>(handlers.find);

const selectInterviewer = mockApi<object, object, object, IUser.Self>(
  handlers.selectInterviewer
);

const createInterview = mockApi<IInterview.CreateApiPayload, void, void, void>(
  handlers.create
);

const updateInterview = mockApi<
  IInterview.UpdateApiPayload,
  void,
  void,
  IInterview.UpdateApiResponse
>(handlers.update);

describe("/api/v1/interview/", () => {
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
        await db.tutorUser(),
        await db.tutorUser(),
        await db.tutorUser(),
      ]);

      const interviewList = await Promise.all(
        tutorsList.map((tutor) =>
          db.interview({
            interviewerId: tutorManager.id,
            intervieweeId: tutor.id,
          })
        )
      );

      const manipulatedList = interviewList.map((interview) => {
        const tutor = tutorsList.find((t) => t.id === interview.intervieweeId);
        return {
          ...interview,
          interviewer: {
            id: tutorManager.id,
            name: tutorManager.name,
            image: tutorManager.image,
            role: tutorManager.role,
          },
          interviewee: {
            id: tutor?.id,
            name: tutor?.name,
            image: tutor?.image,
            role: tutor?.role,
          },
        };
      });

      const res = await findInterviews({
        user: admin,
        query: {
          users: [tutorManager.id],
        },
      });

      expect(res.status).to.eq(200);
      expect(res.body?.list).to.deep.members(manipulatedList);
    });
  });

  describe("POST /api/v1/interview/", () => {
    it("should respond with forbidden in case the requester is not a tutor", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });

      const tutorManager = await db.tutorManager();
      const slot = await db.slot({
        userId: tutorManager.id,
        purpose: IAvailabilitySlot.Purpose.Interview,
      });

      const res = await createInterview({
        user: admin,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the slotId does not exist", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: 4321,
          start: dayjs().toISOString(),
        },
      });

      expect(res).to.deep.eq(notfound.slot());
    });

    it("should respond with bad in case the slot is not for interviews", async () => {
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const interviewer = await db.tutor();
      const slot = await db.slot({
        userId: interviewer.id,
        purpose: IAvailabilitySlot.Purpose.Lesson,
      });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: slot.id,
          start: dayjs().toISOString(),
        },
      });

      expect(res).to.deep.eq(bad());
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

      const tutorManager = await db.tutorManager({}, { activated: true });
      const currentTime = dayjs();
      const slot = await db.slot({
        userId: tutorManager.id,
        purpose: IAvailabilitySlot.Purpose.Interview,
        start: currentTime.add(1, "hour").toISOString(),
        end: currentTime.add(2, "hours").toISOString(),
      });

      const res = await createInterview({
        user: tutor,
        body: {
          slotId: slot.id,
          start: slot.start,
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.status).to.eq(200);
    });

    it("should respond with conflict in case the interviewee has been interviewed for less INTERVIEW_MIN_RETRY_PERIOD_IN_DAYS", async () => {
      const tutorManager = await db.tutorManager({}, { activated: true });
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const slot = await db.slot({
        userId: tutorManager.id,
        purpose: IAvailabilitySlot.Purpose.Interview,
      });

      await interviews.create({
        start: dayjs(slot.start)
          .subtract(INTERVIEW_MIN_RETRY_PERIOD_IN_DAYS, "days")
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
      const tutorManager = await db.tutorManager({}, { activated: true });
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const slot = await db.slot({
        userId: tutorManager.id,
        purpose: IAvailabilitySlot.Purpose.Interview,
      });

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
      const tutorManager = await db.tutorManager({}, { activated: true });
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const slot = await db.slot({
        userId: tutorManager.id,
        purpose: IAvailabilitySlot.Purpose.Interview,
      });
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
      const tutorManager = await db.tutorManager({}, { activated: true });
      const busyTestTime = dayjs();
      const slot = await db.slot({
        userId: tutorManager.id,
        purpose: IAvailabilitySlot.Purpose.Interview,
        start: busyTestTime.add(1, "hour").toISOString(),
        end: busyTestTime.add(1, "hour").add(30, "minutes").toISOString(), // Exactly 30 minutes
      });

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

  // @galal @TODO: write unit tests for the updateInterview function.
  describe.skip("PUT /api/v1/interview/:interviewId", () => {
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

    it("should allow tutors to update only the feedback and the status to be only `CanceledByInterviewee`", async () => {
      const tutorManager = await db.tutorManager();
      const tutor = await db.user({ role: IUser.Role.Tutor });
      const interview = await db.interview({
        interviewerId: tutorManager.id,
        intervieweeId: tutor.id,
      });

      const res1 = await updateInterview({
        user: tutor,
        body: {
          id: interview.id,
          intervieweeFeedback: "empty",
          status: IInterview.Status.CanceledByInterviewee,
        },
      });

      const res2 = await updateInterview({
        user: tutor,
        body: {
          id: interview.id,
          intervieweeFeedback: "empty",
          status: IInterview.Status.Passed,
        },
      });

      expect(res1).to.not.be.instanceof(Error);
      expect(res1.status).to.eq(200);

      expect(res2).to.deep.eq(forbidden());
    });
  });

  describe("GET /api/v1/user/interviewer/select", () => {
    it("should respond with forbidden if the requester is not a regular tutor", async () => {
      const admin = await db.user({ role: IUser.Role.SuperAdmin });
      const student = await db.student();
      const tutorManager = await db.user({ role: IUser.Role.TutorManager });

      const responses = await Promise.all([
        selectInterviewer({ user: admin }),
        selectInterviewer({ user: student }),
        selectInterviewer({ user: tutorManager }),
      ]);

      for (const res of responses) {
        expect(res).to.deep.eq(forbidden());
      }
    });

    it("should successfully get the TutorManager with the nearest slot (date) to do the interview", async () => {
      const interviewTime = dayjs();

      const tutorManager1 = await db.tutorManager({}, { activated: true });
      const tutorManager2 = await db.tutorManager({}, { activated: true });
      const tutorManager3 = await db.tutorManager({}, { activated: true });

      const slot1 = await db.slot({
        userId: tutorManager1.id,
        start: interviewTime.subtract(2, "hours").toISOString(),
        end: interviewTime.subtract(1, "hour").toISOString(),
        purpose: IAvailabilitySlot.Purpose.Interview,
      });

      await db.slot({
        userId: tutorManager1.id,
        start: interviewTime.subtract(30, "minutes").toISOString(),
        end: interviewTime.toISOString(),
        purpose: IAvailabilitySlot.Purpose.Interview,
      });

      const slot2 = await db.slot({
        userId: tutorManager2.id,
        start: interviewTime.subtract(30, "minutes").toISOString(),
        end: interviewTime.add(60, "minutes").toISOString(),
        purpose: IAvailabilitySlot.Purpose.Interview,
      });

      await db.slot({
        userId: tutorManager3.id,
        start: interviewTime.add(2, "hours").toISOString(),
        end: interviewTime.add(4, "hours").toISOString(),
        purpose: IAvailabilitySlot.Purpose.Interview,
      });

      await Promise.all([
        db.interview({
          interviewerId: tutorManager1.id,
          slot: slot1.id,
        }),
        db.interview({
          interviewerId: tutorManager2.id,
          slot: slot2.id,
          // NOTE: depends on the convention that INTERVIEW_DURATION = 30 minute
          start: interviewTime.add(INTERVIEW_DURATION, "minute").toISOString(),
        }),
      ]);

      const tutor = await db.user({ role: IUser.Role.Tutor });
      const res = await selectInterviewer({ user: tutor });
      expect(res).to.not.be.instanceof(Error);
      expect(res.body?.id).to.deep.eq(tutorManager2.id);
    });
  });
});
