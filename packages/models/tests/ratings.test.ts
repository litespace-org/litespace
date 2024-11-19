import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { ratings } from "@/index";
import { expect } from "chai";

describe("Ratings", () => {
  beforeAll(async () => {
    await fixtures.flush();
  });
  beforeEach(async () => {
    await fixtures.flush();
  });

  afterEach(async () => {
    await fixtures.flush();
  });

  describe(nameof(ratings.create), () => {
    it("should create a rating", async () => {
      const rating = await fixtures.make.rating(5);
      expect(rating).to.exist;
      expect(rating.value).to.be.eq(5);
    });
  });

  describe(nameof(ratings.update), () => {
    it("should update a rating", async () => {
      const created = await fixtures.make.rating(5);
      expect(created).to.exist;

      const updated = await ratings.update(created.id, {
        value: 4,
      });
      expect(updated.value).to.be.eq(4);
    });
  });

  describe(nameof(ratings.delete), () => {
    it("should delete a rating", async () => {
      const created = await fixtures.make.rating(5);
      expect(created).to.exist;

      await ratings.delete(created.id);

      const rating = await ratings.findSelfById(created.id);
      expect(rating).to.not.exist;
    });
  });

  describe(nameof(ratings.findSelfById), () => {
    it("should find a rating by its id", async () => {
      const created = await fixtures.make.rating(5);
      expect(created).to.exist;

      const rating = await ratings.findSelfById(created.id);
      expect(rating).to.exist;
    });
  });

  describe(nameof(ratings.findAvgRating), () => {
    it("should find avg rating of a user", async () => {
      const created = await fixtures.make.multipleRatings([1, 2, 3, 4, 5]);
      expect(created).to.exist;

      const avg = await ratings.findAvgRating(created[0].rateeId);
      expect(avg).to.be.eq(3);
    });
  });

  describe(nameof(ratings.findAvgUsersRating), () => {
    it("should find avg rating of multiple users", async () => {
      const created = await fixtures.make.multipleRatings([1, 2, 3, 4, 5]);
      expect(created).to.exist;
      const created2 = await fixtures.make.multipleRatings([1, 2, 3, 4, 5]);
      expect(created).to.exist;
      const created3 = await fixtures.make.multipleRatings([1, 2, 3, 4, 5]);
      expect(created).to.exist;

      const avg = await ratings.findAvgUsersRating([
        created[0].rateeId,
        created2[0].rateeId,
        created3[0].rateeId,
      ]);
      expect(avg[0].rating === 3);
      expect(avg[1].rating === 3);
      expect(avg[2].rating === 3);
    });
  });
});
