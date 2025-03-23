import { interviews } from "@/interviews";
import fixtures from "@fixtures/db";
import { nameof } from "@litespace/utils/utils";
import { IInterview } from "@litespace/types";
import { expect } from "chai";
import dayjs from "dayjs";

describe("Interviews", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(interviews.create), () => {
    it("should successfully create new record in interviews table", async () => {
      const now = dayjs();

      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const slot = await fixtures.slot({
        start: now.add(1, "day").toISOString(),
      });

      const result = await interviews.create({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
        start: now.add(1, "day").toISOString(),
        slot: slot.id,
        session: `interview:${slot.id}`,
      });

      expect(result.ids.interviewee).to.eq(tutor.id);
      expect(result.ids.interviewer).to.eq(tutorManager.id);
      expect(result.ids.slot).to.eq(slot.id);
      expect(result.ids.session).to.eq(`interview:${slot.id}`);
      expect(result.start).to.eq(now.add(1, "day").toISOString());
      expect(result.createdAt).to.not.be.undefined;
      expect(result.createdAt).to.eq(result.updatedAt);
    });
  });

  describe(nameof(interviews.update), () => {
    it("should successfully update the records", async () => {
      const now = dayjs();

      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const slot = await fixtures.slot({
        start: now.add(1, "day").toISOString(),
      });

      const result = await interviews.create({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
        start: now.add(1, "day").toISOString(),
        slot: slot.id,
        session: `interview:${slot.id}`,
      });

      const updated = await interviews.update(result.ids.self, {
        note: "just a simple note",
      });

      expect(updated.ids.interviewee).to.eq(tutor.id);
      expect(updated.ids.interviewer).to.eq(tutorManager.id);
      expect(updated.ids.slot).to.eq(slot.id);
      expect(updated.ids.session).to.eq(`interview:${slot.id}`);
      expect(updated.start).to.eq(now.add(1, "day").toISOString());
      expect(updated.createdAt).to.not.be.undefined;
      expect(updated.createdAt).to.eq(result.updatedAt);
      expect(updated.note).to.eq("just a simple note");
    });
  });

  describe(nameof(interviews.cancel), () => {
    it("should successfully cancel interviews by updated the associated columns", async () => {
      const now = dayjs();

      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const slot = await fixtures.slot({
        start: now.add(1, "day").toISOString(),
      });

      const result = await interviews.create({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
        start: now.add(1, "day").toISOString(),
        slot: slot.id,
        session: `interview:${slot.id}`,
      });
      await interviews.cancel({ canceledBy: tutor.id, ids: [result.ids.self] });
      const interview = await interviews.findById(result.ids.self);
      expect(interview?.canceledBy).to.eq(tutor.id);
      expect(interview?.canceledAt).to.not.be.undefined;
    });
  });

  describe(nameof(interviews.find), () => {
    it("should return empty result in case database is empty", async () => {
      const result = await interviews.find({});
      expect(result.list).to.be.empty;
      expect(result.total).to.be.eq(0);
    });

    it("should return empty result in case user has not interviews", async () => {
      const tutor = await fixtures.tutor();
      const result = await interviews.find({ users: [tutor.id] });
      expect(result.list).to.be.empty;
      expect(result.total).to.be.eq(0);
    });

    it("should find users interviews", async () => {
      const tutor = await fixtures.tutor();
      const interviewer = await fixtures.tutorManager();
      const interview = await fixtures.interview({
        interviewer: interviewer.id,
        interviewee: tutor.id,
      });
      const tutorInterviews = await interviews.find({ users: [tutor.id] });
      expect(tutorInterviews.list).to.be.deep.eq([interview]);
      expect(tutorInterviews.list).to.be.of.length(1);
      expect(tutorInterviews.total).to.be.eq(1);

      const interviewerInterviews = await interviews.find({
        users: [tutor.id],
      });
      expect(interviewerInterviews.list).to.be.deep.eq([interview]);
      expect(interviewerInterviews.list).to.be.of.length(1);
      expect(interviewerInterviews.total).to.be.eq(1);
    });

    it("should find users interviews with different filters", async () => {
      const tutors = await fixtures.make.tutors(5);
      const interviewer = await fixtures.tutorManager();
      await fixtures.make.interviews({
        data: [
          {
            interviewer: interviewer.id,
            interviewees: tutors.map((tutor) => tutor.id),
            statuses: [
              IInterview.Status.Pending,
              IInterview.Status.Pending,
              IInterview.Status.Passed,
              IInterview.Status.Rejected,
              IInterview.Status.Canceled,
            ],
            levels: [1, 2, 1, 2, 3],
          },
        ],
      });

      const tests = [
        {
          users: [interviewer.id],
          statuses: [IInterview.Status.Pending],
          count: 2,
        },
        {
          users: [tutors[0].id],
          statuses: [IInterview.Status.Pending],
          count: 1,
        },
        {
          users: [interviewer.id],
          statuses: [],
          count: 5,
        },
        {
          users: [interviewer.id],
          statuses: [IInterview.Status.Passed],
          count: 1,
        },
        {
          users: [interviewer.id],
          statuses: [IInterview.Status.Rejected],
          count: 1,
        },
        {
          users: [interviewer.id],
          statuses: [IInterview.Status.Pending],
          levels: [1],
          count: 1,
        },
        {
          users: [interviewer.id],
          statuses: [IInterview.Status.Canceled],
          levels: [5],
          count: 0,
        },
      ];

      for (const test of tests) {
        const result = await interviews.find({
          users: test.users,
          statuses: test.statuses,
          levels: test.levels,
        });
        expect(result.list).to.be.of.length(test.count);
        expect(result.total).to.be.eq(test.count);
      }
    });
  });

  describe(nameof(interviews.findById), () => {
    it("should retrieve interview by id", async () => {
      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();

      await fixtures.interview({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
      });
      const interview2 = await fixtures.interview({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
      });

      const res = await interviews.findById(interview2.ids.self);
      expect(res).to.deep.eq(interview2);
    });
  });

  describe(nameof(interviews.findBySlotId), () => {
    it("should retrieve list of interviews by slot id", async () => {
      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const slot = await fixtures.slot({ userId: tutorManager.id });

      const interview1 = await fixtures.interview({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
        slot: slot.id,
      });
      const interview2 = await fixtures.interview({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
        slot: slot.id,
      });

      await fixtures.interview({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
      });

      const res = await interviews.findBySlotId(slot.id);
      expect(res).to.deep.contain(interview1);
      expect(res).to.deep.contain(interview2);
    });
  });

  describe(nameof(interviews.findBySessionId), () => {
    it("should retrieve interviews by session id", async () => {
      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const slot = await fixtures.slot({ userId: tutorManager.id });

      await fixtures.interview({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
        slot: slot.id,
      });

      const interview2 = await fixtures.interview({
        interviewee: tutor.id,
        interviewer: tutorManager.id,
        slot: slot.id,
      });

      const res = await interviews.findBySessionId(interview2.ids.session);
      expect(res).to.deep.contain(interview2);
    });
  });

  describe(nameof(interviews.findByInterviewee), () => {
    it("should retrieve list of interviews by interviewee id", async () => {
      const tutor1 = await fixtures.tutor();
      const tutor2 = await fixtures.tutor();

      const tutorManager1 = await fixtures.tutorManager();
      const tutorManager2 = await fixtures.tutorManager();

      const slot1 = await fixtures.slot({ userId: tutorManager1.id });
      const slot2 = await fixtures.slot({ userId: tutorManager2.id });

      const interview1 = await fixtures.interview({
        interviewee: tutor1.id,
        interviewer: tutorManager1.id,
        slot: slot1.id,
      });
      const interview2 = await fixtures.interview({
        interviewee: tutor2.id,
        interviewer: tutorManager1.id,
        slot: slot1.id,
      });

      const interview3 = await fixtures.interview({
        interviewee: tutor1.id,
        interviewer: tutorManager2.id,
        slot: slot2.id,
      });

      let res = await interviews.findByInterviewee(tutor1.id);
      expect(res).to.deep.contain(interview1);
      expect(res).to.deep.contain(interview3);

      res = await interviews.findByInterviewee(tutor2.id);
      expect(res).to.deep.contain(interview2);
    });
  });

  describe(nameof(interviews.findByInterviewer), () => {
    it("should retrieve list of interviews by interviewer id", async () => {
      const tutor1 = await fixtures.tutor();
      const tutor2 = await fixtures.tutor();
      const tutor3 = await fixtures.tutor();

      const tutorManager1 = await fixtures.tutorManager();
      const tutorManager2 = await fixtures.tutorManager();

      const slot1 = await fixtures.slot({ userId: tutorManager1.id });
      const slot2 = await fixtures.slot({ userId: tutorManager2.id });

      const interview1 = await fixtures.interview({
        interviewee: tutor1.id,
        interviewer: tutorManager1.id,
        slot: slot1.id,
      });
      const interview2 = await fixtures.interview({
        interviewee: tutor2.id,
        interviewer: tutorManager2.id,
        slot: slot2.id,
      });

      const interview3 = await fixtures.interview({
        interviewee: tutor3.id,
        interviewer: tutorManager1.id,
        slot: slot1.id,
      });

      let res = await interviews.findByInterviewer(tutorManager1.id);
      expect(res).to.deep.contain(interview1);
      expect(res).to.deep.contain(interview3);

      res = await interviews.findByInterviewer(tutorManager2.id);
      expect(res).to.deep.contain(interview2);
    });
  });
});
