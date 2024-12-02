import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { ratings } from "@/index";
import { expect } from "chai";

describe("Ratings", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(ratings.create), () => {
    it("should create a rating", async () => {
      const rating = await fixtures.rating({ value: 5 });
      expect(rating).to.exist;
      expect(rating.value).to.be.eq(5);
    });
  });

  describe(nameof(ratings.update), () => {
    it("should update a rating", async () => {
      const created = await fixtures.rating({ value: 5 });
      expect(created.value).to.be.eq(5);

      const updated = await ratings.update(created.id, {
        value: 4,
      });
      expect(updated.value).to.be.eq(4);
    });
  });

  describe(nameof(ratings.delete), () => {
    it("should delete a rating", async () => {
      const created = await fixtures.rating({ value: 5 });
      expect(created.value).to.be.eq(5);

      await ratings.delete(created.id);

      const rating = await ratings.findSelfById(created.id);
      expect(rating).to.not.exist;
    });
  });

  describe(nameof(ratings.findSelfById), () => {
    it("should find a rating by its id", async () => {
      const created = await fixtures.rating({ value: 5 });
      const rating = await ratings.findSelfById(created.id);
      expect(rating).to.be.deep.eq(created);
    });
  });

  describe(nameof(ratings.findAvgRatings), () => {
    it("should find a rating by its id", async () => {
      const tutor = await fixtures.tutor();
      await fixtures.make.ratings({ ratee: tutor.id, values: [1, 2, 3] });
      const rating = await ratings.findAvgUserRatings(tutor.id);
      expect(rating).to.be.deep.eq(2);
    });
  });

  describe(nameof(ratings.findAvgRatings), () => {
    it("should find avg. rating for users", async () => {
      const t1 = await fixtures.tutor();
      const t2 = await fixtures.tutor();
      const t3 = await fixtures.tutor();

      await fixtures.make.ratings({
        ratee: t1.id,
        values: [1, 2, 3, 4, 5],
      });

      await fixtures.make.ratings({
        ratee: t2.id,
        values: [1, 2, 3, 4],
      });

      await fixtures.make.ratings({
        ratee: t3.id,
        values: [1, 2, 4, 5],
      });

      const avg = await ratings.findAvgRatings([t1.id, t2.id, t3.id]);

      expect(avg[0].avg === 3);
      expect(avg[1].avg === 3);
      expect(avg[2].avg === 3);
    });
  });
});
