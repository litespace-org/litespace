import { introVideos } from "@/introVideos";
import fixtures from "@fixtures/db";
import { IIntroVideo } from "@litespace/types";
import { nameof } from "@litespace/utils/utils";
import { expect } from "chai";
import { range } from "lodash";

describe("IntroVideos", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(introVideos.create), () => {
    it("should create new intro video successfully", async () => {
      const tutor = await fixtures.tutor();
      const result = await fixtures.introVideo({
        tutorId: tutor.id,
      });
      expect(result?.tutorId).to.eq(tutor.id);

      const video = await introVideos.findById(result.id);

      expect(video?.id).to.eq(result.id);
      expect(video?.src).to.eq(result.src);
    });
  });

  describe(nameof(introVideos.update), () => {
    it("should update intro video details successfully", async () => {
      const tutorManager = await fixtures.tutorManager();
      const created = await fixtures.introVideo();

      await introVideos.update({
        id: created.id,
        reviewerId: tutorManager.id,
        state: IIntroVideo.State.Approved,
      });

      const updated = await introVideos.findById(created.id);

      expect(updated?.reviewerId).to.eq(tutorManager.id);
      expect(updated?.state).to.eq(IIntroVideo.State.Approved);
    });
  });

  describe(nameof(introVideos.find), () => {
    it("should find intro video details successfully", async () => {
      const result = await fixtures.introVideo();

      const { list } = await introVideos.find({
        videoIds: [result.id],
      });

      expect(list[0]?.id).to.eq(result.id);
      expect(list[0]?.src).to.eq(result.src);
      expect(list[0]?.tutorId).to.eq(result.tutorId);
    });

    it("should find list of intro video successfully", async () => {
      for (const _ of range(1, 11)) {
        await fixtures.introVideo();
      }

      const { list } = await introVideos.find({});
      expect(list.length).to.eq(10);
    });

    it("should find list of intro video successfully based on list of tutorIds", async () => {
      const video1 = await fixtures.introVideo();
      const video2 = await fixtures.introVideo();
      await fixtures.introVideo();

      const { list } = await introVideos.find({
        tutorIds: [video1.tutorId, video2.tutorId],
      });

      expect(list.length).to.eq(2);
    });

    it("should find list of intro video successfully based on list of reviewerIds", async () => {
      const tutorManager = await fixtures.tutorManager();
      await fixtures.introVideo();
      const video2 = await fixtures.introVideo({
        reviewerId: tutorManager.id,
      });
      const video3 = await fixtures.introVideo({
        reviewerId: tutorManager.id,
      });

      const { list } = await introVideos.find({
        reviewerIds: [tutorManager.id],
      });

      expect(list.length).to.eq(2);
      expect(list).to.deep.eq([video3, video2]);
    });

    it("should find list of intro video successfully based on list of video ids", async () => {
      await fixtures.introVideo();
      const video2 = await fixtures.introVideo();
      const video3 = await fixtures.introVideo();

      const { list: video } = await introVideos.find({
        videoIds: [video2.id],
      });

      expect(video.length).to.eq(1);
      expect(video).to.deep.eq([video2]);

      const { list } = await introVideos.find({
        videoIds: [video2.id, video3.id],
      });

      expect(list.length).to.eq(2);
      expect(list).to.deep.eq([video3, video2]);
    });

    it("should find list of intro video successfully based on video state", async () => {
      const video1 = await fixtures.introVideo();
      await introVideos.update({
        id: video1.id,
        state: IIntroVideo.State.Approved,
      });

      await fixtures.introVideo();
      await fixtures.introVideo();

      const { list: approvedList } = await introVideos.find({
        state: IIntroVideo.State.Approved,
      });

      expect(approvedList.length).to.eq(1);

      const { list: pendingList } = await introVideos.find({
        state: IIntroVideo.State.Pending,
      });
      expect(pendingList.length).to.eq(2);
    });

    it("should find list of intro video successfully based on specific date range", async () => {
      const video1 = await fixtures.introVideo();
      const video2 = await fixtures.introVideo();
      const video3 = await fixtures.introVideo();
      const video4 = await fixtures.introVideo();
      const video5 = await fixtures.introVideo();
      const video6 = await fixtures.introVideo();

      const { list: afterList } = await introVideos.find({
        createdAt: {
          gte: video4.createdAt,
        },
      });
      expect(afterList.length).to.eq(3);
      expect(afterList).to.deep.eq([video6, video5, video4]);

      const { list: beforeList } = await introVideos.find({
        createdAt: {
          lte: video2.createdAt,
        },
      });
      expect(beforeList.length).to.eq(2);
      expect(beforeList).to.deep.eq([video2, video1]);

      const { list: rangeList } = await introVideos.find({
        createdAt: {
          gte: video2.createdAt,
          lte: video6.createdAt,
        },
      });
      expect(rangeList.length).to.eq(5);
      expect(rangeList).to.deep.eq([video6, video5, video4, video3, video2]);
    });
  });
});
