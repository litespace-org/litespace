import {
  INTRO_VIDEO_MAX_FILE_SIZE,
  INTRO_VIDEO_MAX_MINUTES,
  INTRO_VIDEO_MIN_MINUTES,
} from "@/constants";
import handlers from "@/handlers/introVideo";
import {
  bad,
  exists,
  forbidden,
  inActiveTutorManager,
  largeFileSize,
  longVideoDur,
  notfound,
  shortVideoDur,
  unexpected,
} from "@/lib/error";
import db from "@fixtures/db";
import { getMockFile } from "@fixtures/file";
import { mockApi } from "@fixtures/mockApi";
import { introVideos, tutors } from "@litespace/models";
import { IIntroVideo, IUser } from "@litespace/types";
import { nameof } from "@litespace/utils";
import bytes from "bytes";
import { expect } from "chai";
import { first } from "lodash";

const findIntroVideo = mockApi<
  IIntroVideo.FindApiPayload,
  void,
  void,
  IIntroVideo.FindApiResponse
>(handlers.find);

const createIntroVideo = mockApi<IIntroVideo.CreateApiPayload>(handlers.create);

const updateIntroVideo = mockApi<IIntroVideo.UpdateApiPayload>(handlers.update);

describe(nameof(createIntroVideo), () => {
  beforeEach(async () => {
    return await db.flush();
  });

  it("should respond with forbidden in case the requester is not a regular tutor", async () => {
    const res = await createIntroVideo({
      user: await db.tutorManagerUser(),
      body: { duration: 3 },
    });

    expect(res).to.deep.eq(forbidden());
  });

  it("should respond with bad in case the duration is less than or more than the limits", async () => {
    const tutor = await db.tutorUser();

    const res1 = await createIntroVideo({
      user: tutor,
      body: { duration: INTRO_VIDEO_MIN_MINUTES - 1 },
    });

    expect(res1).to.deep.eq(shortVideoDur());

    const res2 = await createIntroVideo({
      user: tutor,
      body: { duration: INTRO_VIDEO_MAX_MINUTES + 1 },
    });

    expect(res2).to.deep.eq(longVideoDur());
  });

  it("should respond with conflict in case there is an already approved intro-video", async () => {
    const tutor = await db.tutorUser();
    const introVideo = await db.introVideo({ tutorId: tutor.id });
    await introVideos.update({
      id: introVideo.id,
      state: IIntroVideo.State.Approved,
    });

    const res = await createIntroVideo({
      user: tutor,
      body: { duration: 2 },
    });

    expect(res).to.deep.eq(exists.introVideo());
  });

  it("should respond with conflict in case there is a pending intro-video", async () => {
    const tutor = await db.tutorUser();
    const introVideo = await db.introVideo({ tutorId: tutor.id });
    await introVideos.update({
      id: introVideo.id,
      state: IIntroVideo.State.Pending,
    });

    const res = await createIntroVideo({
      user: tutor,
      body: { duration: 2 },
    });

    expect(res).to.deep.eq(exists.introVideo());
  });

  it("should respond with forbidden in case the last rejected intro-video was before three months ago", async () => {
    const tutor = await db.tutorUser();
    const introVideo = await db.introVideo({ tutorId: tutor.id });
    await introVideos.update({
      id: introVideo.id,
      state: IIntroVideo.State.Rejected,
    });

    const res = await createIntroVideo({
      user: tutor,
      body: { duration: 2 },
    });

    expect(res).to.deep.eq(forbidden());
  });

  it("should respond with bad in case there is no file provided", async () => {
    const tutor = await db.tutorUser();

    const res = await createIntroVideo({
      user: tutor,
      body: { duration: 2 },
    });

    expect(res).to.deep.eq(bad());
  });

  it("should respond with largeFileSize in case it's size is more than the max file size", async () => {
    const tutor = await db.tutorUser();
    await db.tutorManager();

    const res = await createIntroVideo({
      user: tutor,
      body: { duration: 2 },
      files: {
        [IIntroVideo.AssetFileName.Video]: [
          getMockFile({
            size: bytes(`${INTRO_VIDEO_MAX_FILE_SIZE + 1}mb`) || undefined,
          }),
        ],
      },
    });

    expect(res).to.deep.eq(largeFileSize());
  });

  it("should respond with unexpected in case there is no reviewer available", async () => {
    const tutor = await db.tutorUser();

    const res = await createIntroVideo({
      user: tutor,
      body: { duration: 2 },
      files: { [IIntroVideo.AssetFileName.Video]: [getMockFile()] },
    });

    expect(res).to.deep.eq(unexpected());
  });

  it("should successfully insert new intro-video in the database", async () => {
    const tutor = await db.tutorUser();
    const reviewer = await db.tutorManager({}, { activated: true });

    const res = await createIntroVideo({
      user: tutor,
      body: { duration: 2 },
      files: { [IIntroVideo.AssetFileName.Video]: [getMockFile()] },
    });
    expect(res).to.not.be.instanceof(Error);

    const created = await introVideos.find({ tutorIds: [tutor.id] });
    expect(created.total).to.eq(1);
    expect(first(created.list)?.reviewerId).to.eq(reviewer.id);
    expect(first(created.list)?.state).to.eq(IIntroVideo.State.Pending);
  });

  it("should successfully insert new intro-video in the database and assign 'suitable' free reviewer", async () => {
    const tutor = await db.tutorUser();

    const reviewer1 = await db.tutorManager({}, { activated: true });
    const reviewer2 = await db.tutorManager({}, { activated: true });
    const reviewer3 = await db.tutorManager({}, { activated: true });

    await Promise.all([
      db.introVideo({ reviewerId: reviewer1.id }),
      db.introVideo({ reviewerId: reviewer1.id }),

      db.introVideo({ reviewerId: reviewer2.id }),
      db.introVideo({ reviewerId: reviewer2.id }),
      db.introVideo({ reviewerId: reviewer2.id }),

      db.introVideo({ reviewerId: reviewer3.id }),
    ]);

    const res = await createIntroVideo({
      user: tutor,
      body: { duration: 2 },
      files: { [IIntroVideo.AssetFileName.Video]: [getMockFile()] },
    });
    expect(res).to.not.be.instanceof(Error);

    const created = await introVideos.find({ tutorIds: [tutor.id] });
    expect(created.total).to.eq(1);
    expect(first(created.list)?.reviewerId).to.eq(reviewer3.id);
    expect(first(created.list)?.state).to.eq(IIntroVideo.State.Pending);
  });
});

describe(nameof(updateIntroVideo), () => {
  beforeEach(async () => {
    return await db.flush();
  });

  it("should update state successfully", async () => {
    const tutorManager = await db.tutorManagerUser();
    const introVideo = await db.introVideo({ reviewerId: tutorManager.id });
    expect(introVideo.state).to.eq(IIntroVideo.State.Pending);

    await updateIntroVideo({
      params: {
        id: introVideo.id,
      },
      user: tutorManager,
      body: {
        state: IIntroVideo.State.Approved,
      },
    });

    const updated = await introVideos.findById(introVideo.id);

    expect(updated?.state).to.eq(IIntroVideo.State.Approved);
  });

  it("should update reviewer successfully", async () => {
    const admin = await db.user({ role: IUser.Role.RegularAdmin });
    const tutorManager = await db.tutorManager();
    await tutors.update(tutorManager.id, {
      activated: true,
    });
    const introVideo = await db.introVideo();
    expect(introVideo.reviewerId).to.not.eq(tutorManager.id);

    await updateIntroVideo({
      params: {
        id: introVideo.id,
      },
      user: admin,
      body: {
        reviewerId: tutorManager.id,
      },
    });

    const updated = await introVideos.findById(introVideo.id);
    expect(updated?.state).to.eq(IIntroVideo.State.Pending);
    expect(updated?.reviewerId).to.eq(tutorManager.id);
  });

  it("shouldn't update data because user has no access", async () => {
    const tutor = await db.user({ role: IUser.Role.Tutor });
    const introVideo = await db.introVideo();

    const res = await updateIntroVideo({
      params: {
        id: introVideo.id,
      },
      user: tutor,
      body: {
        state: IIntroVideo.State.Approved,
      },
    });

    expect(res).to.deep.eq(forbidden());
  });

  it("shouldn't update data because no video was found", async () => {
    const admin = await db.user({ role: IUser.Role.SuperAdmin });

    const res = await updateIntroVideo({
      params: {
        id: 4,
      },
      user: admin,
      body: {
        state: IIntroVideo.State.Approved,
      },
    });

    expect(res).to.deep.eq(notfound.introVideo());
  });

  it("shouldn't update reviewer because tutor managers can't do so", async () => {
    const tutorManager1 = await db.tutorManagerUser();
    const tutorManager2 = await db.tutorManagerUser();
    const introVideo = await db.introVideo();

    const res = await updateIntroVideo({
      params: {
        id: introVideo.id,
      },
      user: tutorManager1,
      body: {
        reviewerId: tutorManager2.id,
      },
    });

    expect(res).to.deep.eq(forbidden());
  });

  it("shouldn't update reviewer because the updated reviewer is inactive", async () => {
    const admin = await db.user({ role: IUser.Role.RegularAdmin });
    const tutorManager = await db.tutorManager();
    tutors.update(tutorManager.id, {
      activated: false,
    });
    const introVideo = await db.introVideo();

    const res = await updateIntroVideo({
      params: {
        id: introVideo.id,
      },
      user: admin,
      body: {
        reviewerId: tutorManager.id,
      },
    });

    expect(res).to.deep.eq(inActiveTutorManager());
  });

  it("shouldn't update because user isn't the assigned reviewer", async () => {
    const tutorManager1 = await db.tutorManagerUser();
    const tutorManager2 = await db.tutorManagerUser();
    const introVideo = await db.introVideo({ reviewerId: tutorManager2.id });

    const res = await updateIntroVideo({
      params: {
        id: introVideo.id,
      },
      user: tutorManager1,
      body: {
        state: IIntroVideo.State.Approved,
      },
    });

    expect(res).to.deep.eq(forbidden());
  });
});

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

      const created = [
        await db.introVideo({ tutorId: tutor.id }),
        await db.introVideo({ tutorId: tutor.id }),
        await db.introVideo({ tutorId: tutor.id }),
      ];

      await Promise.all([db.introVideo({}), db.introVideo({})]);

      const res = await findIntroVideo({
        user: admin,
        body: { tutorIds: [tutor.id] },
      });
      expect(res).to.not.be.instanceof(Error);

      expect(res.body?.main.total).to.eq(created.length);
      expect(res.body?.main.list).to.deep.members(created.reverse());
      expect(res.body?.forReviewers).to.be.undefined;
    });

    it("it should respond with a list of introVideos of only the regular-tutor requester", async () => {
      const tutor = await db.tutorUser();

      const created = [
        await db.introVideo({ tutorId: tutor.id }),
        await db.introVideo({ tutorId: tutor.id }),
        await db.introVideo({ tutorId: tutor.id }),
      ];

      await Promise.all([db.introVideo({}), db.introVideo({})]);

      const res = await findIntroVideo({
        user: tutor,
        body: {},
      });
      expect(res).to.not.be.instanceof(Error);

      expect(res.body?.main.total).to.eq(created.length);
      expect(res.body?.main.list).to.deep.members(created.reverse());
      expect(res.body?.forReviewers).to.be.undefined;
    });

    it("it should respond with the main list and the forReviewers list for tutor-managers", async () => {
      const tutorManager = await db.tutorManagerUser();

      const main = [
        await db.introVideo({ tutorId: tutorManager.id }),
        await db.introVideo({ tutorId: tutorManager.id }),
        await db.introVideo({ tutorId: tutorManager.id }),
      ];

      const forReviewers = [
        await db.introVideo({ reviewerId: tutorManager.id }),
        await db.introVideo({ reviewerId: tutorManager.id }),
      ];

      await Promise.all([db.introVideo({}), db.introVideo({})]);

      const res = await findIntroVideo({
        user: tutorManager,
        body: {},
      });
      expect(res).to.not.be.instanceof(Error);

      expect(res.body?.main.total).to.eq(main.length);
      expect(res.body?.main.list).to.deep.members(main.reverse());

      expect(res.body?.forReviewers?.total).to.eq(forReviewers.length);
      expect(res.body?.forReviewers?.list).to.deep.members(
        forReviewers.reverse()
      );
    });
  });
});
