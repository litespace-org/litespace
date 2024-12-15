import { interviews } from "@/interviews";
import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { IInterview } from "@litespace/types";
import { expect } from "chai";

describe("Interviews", () => {
  beforeEach(async () => {
    return await fixtures.flush();
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
});
