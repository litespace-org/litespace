import { introVideos } from "@/introVideos";
import fixtures from "@fixtures/db";
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
      const tutor = await fixtures.tutor();
      const tutorManager = await fixtures.tutorManager();
      const result = await fixtures.introVideo({
        tutorId: tutor.id,
      });

      await introVideos.update(result.id, {
        reviewerId: tutorManager.id,
        state: "approved",
      });

      const video = await introVideos.findById(result.id);

      expect(video?.reviewerId).to.eq(tutorManager.id);
      expect(video?.state).to.eq("approved");
    });
  });

  describe(nameof(introVideos.find), () => {
    it("should find intro video successfully", async () => {
      const tutor = await fixtures.tutor();
      const result = await fixtures.introVideo({
        tutorId: tutor.id,
      });

      const { list } = await introVideos.find({
        videoIds: [result.id],
      });

      expect(list[0]?.id).to.eq(result.id);
      expect(list[0]?.src).to.eq(result.src);
      expect(list[0]?.tutorId).to.eq(result.tutorId);
    });

    it("should find list of intro video successfully", async () => {
      for (const _ of range(1, 10)) {
        const tutor = await fixtures.tutor();
        await fixtures.introVideo({
          tutorId: tutor.id,
        });
      }

      const { list } = await introVideos.find({});

      expect(list.length).to.eq(9);
    });

    it("should find list of intro video successfully based on list of tutorIds", async () => {
      const tutor1 = await fixtures.tutor();
      await fixtures.introVideo({
        tutorId: tutor1.id,
      });

      const tutor2 = await fixtures.tutor();
      await fixtures.introVideo({
        tutorId: tutor2.id,
      });

      const tutor3 = await fixtures.tutor();
      await fixtures.introVideo({
        tutorId: tutor3.id,
      });

      const { list } = await introVideos.find({
        tutorIds: [tutor1.id, tutor2.id],
      });

      expect(list.length).to.eq(2);
    });

    it("should find list of intro video successfully based on list of reviewerIds", async () => {
      const tutor1 = await fixtures.tutor();
      await fixtures.introVideo({
        tutorId: tutor1.id,
      });

      const tutor2 = await fixtures.tutor();
      const video2 = await fixtures.introVideo({
        tutorId: tutor2.id,
      });

      const tutor3 = await fixtures.tutor();
      const video3 = await fixtures.introVideo({
        tutorId: tutor3.id,
      });
      const tutorManager = await fixtures.tutorManager();
      await introVideos.update(video2.id, {
        reviewerId: tutorManager.id,
        state: "approved",
      });

      await introVideos.update(video3.id, {
        reviewerId: tutorManager.id,
        state: "rejected",
      });

      const { list } = await introVideos.find({
        reviewerIds: [tutorManager.id],
      });

      expect(list.length).to.eq(2);
      expect(list.filter((v) => v.state === "rejected").length).to.eq(1);
    });

    it("should find list of intro video successfully based on list of ids", async () => {
      const tutor1 = await fixtures.tutor();
      await fixtures.introVideo({
        tutorId: tutor1.id,
      });

      const tutor2 = await fixtures.tutor();
      const video2 = await fixtures.introVideo({
        tutorId: tutor2.id,
      });

      const tutor3 = await fixtures.tutor();
      const video3 = await fixtures.introVideo({
        tutorId: tutor3.id,
      });

      const { list } = await introVideos.find({
        videoIds: [video2.id, video3.id],
      });

      expect(list.length).to.eq(2);
      expect(list.map((v) => v.src)).to.include(video3.src);
    });

    it("should find list of intro video successfully based on state", async () => {
      const tutor1 = await fixtures.tutor();
      const video1 = await fixtures.introVideo({
        tutorId: tutor1.id,
      });

      const updated = await introVideos.update(video1.id, {
        state: "approved",
      });

      const tutor2 = await fixtures.tutor();
      await fixtures.introVideo({
        tutorId: tutor2.id,
      });

      const tutor3 = await fixtures.tutor();
      await fixtures.introVideo({
        tutorId: tutor3.id,
      });

      const { list } = await introVideos.find({
        state: "approved",
      });

      expect(list.length).to.eq(1);
      expect(list).to.deep.eq([updated]);
    });

    it("should find list of intro video successfully based on specific date range", async () => {
      const tutor1 = await fixtures.tutor();
      const video1 = await fixtures.introVideo({
        tutorId: tutor1.id,
      });

      const tutor2 = await fixtures.tutor();
      const video2 = await fixtures.introVideo({
        tutorId: tutor2.id,
      });

      const tutor3 = await fixtures.tutor();
      const video3 = await fixtures.introVideo({
        tutorId: tutor3.id,
      });

      const { list: afterList } = await introVideos.find({
        after: video2.createdAt,
      });

      expect(afterList.length).to.eq(2);
      expect(afterList).to.deep.eq([video3, video2]);

      const { list: beforeList } = await introVideos.find({
        before: video2.createdAt,
      });

      expect(beforeList.length).to.eq(2);
      expect(beforeList).to.deep.eq([video2, video1]);
    });
  });
});
