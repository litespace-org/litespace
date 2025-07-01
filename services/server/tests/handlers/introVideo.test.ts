import { expect } from "chai";
import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import handlers from "@/handlers/introVideo";
import { IIntroVideo, IUser } from "@litespace/types";
import { nameof } from "@litespace/utils";
import { forbidden } from "@/lib/error";

const findIntroVideo = mockApi<
  IIntroVideo.FindApiPayload,
  void,
  void,
  IIntroVideo.FindApiResponse
>(handlers.find);

describe("/api/v1/interview/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe(nameof(findIntroVideo), () => {
    it("it should respond with forbidden in case the requester is neither an admin nor a tutor", async () => {
      const student = await db.student();

      const res = await findIntroVideo({
        user: student,
        body: {},
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("it should respond with forbidden in case a regular-tutor has assigned the tutorIds a value in the payload", async () => {
      const tutor = await db.tutorUser();

      const res = await findIntroVideo({
        user: tutor,
        body: {
          tutorIds: [1],
        },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("it should respond with a list of introVideos of a certain tutor for an admin requester", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      const tutor = await db.tutorUser();

      const created = await Promise.all([
        db.introVideo({ tutorId: tutor.id }),
        db.introVideo({ tutorId: tutor.id }),
        db.introVideo({ tutorId: tutor.id }),
      ]);

      await Promise.all([db.introVideo({}), db.introVideo({})]);

      const res = await findIntroVideo({
        user: admin,
        body: {
          tutorIds: [tutor.id],
        },
      });
      expect(res).to.not.be.instanceof(Error);

      expect(res.body?.main.total).to.eq(created.length);
      expect(res.body?.main.list).to.deep.members(created);
      expect(res.body?.forReviewers).to.be.undefined;
    });

    it("it should respond with a list of introVideos of only the regular-tutor requester", async () => {
      const tutor = await db.tutorUser();

      const created = await Promise.all([
        db.introVideo({ tutorId: tutor.id }),
        db.introVideo({ tutorId: tutor.id }),
        db.introVideo({ tutorId: tutor.id }),
      ]);

      await Promise.all([db.introVideo({}), db.introVideo({})]);

      const res = await findIntroVideo({
        user: tutor,
        body: {},
      });
      expect(res).to.not.be.instanceof(Error);

      expect(res.body?.main.total).to.eq(created.length);
      expect(res.body?.main.list).to.deep.members(created);
      expect(res.body?.forReviewers).to.be.undefined;
    });

    it("it should respond with the main list and the forReviewers list for tutor-managers", async () => {
      const tutorManager = await db.tutorManager();

      const main = await Promise.all([
        db.introVideo({ tutorId: tutorManager.id }),
        db.introVideo({ tutorId: tutorManager.id }),
        db.introVideo({ tutorId: tutorManager.id }),
      ]);

      const forReviewers = await Promise.all([
        db.introVideo({ reviewerId: tutorManager.id }),
        db.introVideo({ reviewerId: tutorManager.id }),
      ]);

      await Promise.all([db.introVideo({}), db.introVideo({})]);

      const res = await findIntroVideo({
        user: tutorManager,
        body: {},
      });
      expect(res).to.not.be.instanceof(Error);

      expect(res.body?.main.total).to.eq(main.length);
      expect(res.body?.main.list).to.deep.members(main);

      expect(res.body?.forReviewers?.total).to.eq(forReviewers.length);
      expect(res.body?.forReviewers?.list).to.deep.members(forReviewers);
    });
  });
});
