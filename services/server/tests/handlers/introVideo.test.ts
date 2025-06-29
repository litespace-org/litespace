import {
  INTRO_VIDEO_MAX_FILE_SIZE,
  INTRO_VIDEO_MAX_MINUTES,
  INTRO_VIDEO_MIN_MINUTES,
} from "@/constants";
import handlers from "@/handlers/introVideo";
import { bad, exists, forbidden, largeFileSize, unexpected } from "@/lib/error";
import db from "@fixtures/db";
import { getMockFile } from "@fixtures/file";
import { mockApi } from "@fixtures/mockApi";
import { introVideos } from "@litespace/models";
import { IIntroVideo } from "@litespace/types";
import { nameof } from "@litespace/utils";
import bytes from "bytes";
import { expect } from "chai";
import { first } from "lodash";

const createIntroVideo = mockApi<IIntroVideo.CreateApiPayload>(handlers.create);

describe(nameof(createIntroVideo), () => {
  beforeEach(async () => {
    return await db.flush();
  });

  it("should respond with forbidden in case the requester is not a regular tutor", async () => {
    const res = await createIntroVideo({
      user: await db.tutorManager(),
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

    expect(res1).to.deep.eq(bad());

    const res2 = await createIntroVideo({
      user: tutor,
      body: { duration: INTRO_VIDEO_MAX_MINUTES + 1 },
    });

    expect(res2).to.deep.eq(bad());
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
