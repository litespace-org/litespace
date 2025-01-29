import fixtures from "@fixtures/db";
import { nameof } from "@litespace/utils/utils";
import { ratings } from "@/index";
import { expect } from "chai";
import { faker } from "@faker-js/faker/locale/ar";

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

      const avg = await ratings.findAvgRatings({
        users: [t1.id, t2.id, t3.id],
      });

      expect(avg[0].avg === 3);
      expect(avg[1].avg === 3);
      expect(avg[2].avg === 3);
    });
  });

  describe(nameof(ratings.findRateeRatings), () => {
    it("should return empty list incase user has not ratings", async () => {
      const { list, total } = await ratings.findRateeRatings({ userId: 1 });
      expect(list).to.be.empty;
      expect(total).to.be.eq(0);
    });

    it("should order user ratings", async () => {
      const tutor = await fixtures.tutor();
      const firstStudent = await fixtures.student();
      const secondStudent = await fixtures.student();
      const thirdStudent = await fixtures.student();
      const forthStudent = await fixtures.student();

      // this rating is the same as below (value=3) but it should be after the
      // one below because it created before it.
      await ratings.create({
        feedback: null,
        raterId: firstStudent.id,
        rateeId: tutor.id,
        value: 3,
      });

      await ratings.create({
        feedback: null,
        raterId: secondStudent.id,
        rateeId: tutor.id,
        value: 3,
      });

      // this should be the the top of the list becuase it has the longest
      // feedback and the highest values.
      await ratings.create({
        raterId: thirdStudent.id,
        rateeId: tutor.id,
        feedback: faker.lorem.words(10),
        value: 5,
      });

      // this should be second in the list becuase it has the highest feedback
      // value but a shorter feedback than the one above it.
      await ratings.create({
        raterId: forthStudent.id,
        rateeId: tutor.id,
        feedback: faker.lorem.words(5),
        value: 5,
      });

      const { list, total } = await ratings.findRateeRatings({
        userId: tutor.id,
      });
      expect(total).to.be.eq(4);
      expect(list[0].name).to.be.eq(thirdStudent.name);
      expect(list[0].value).to.be.eq(5);
      expect(list[1].name).to.be.eq(forthStudent.name);
      expect(list[1].value).to.be.eq(5);
      expect(list[2].name).to.be.eq(secondStudent.name);
      expect(list[2].value).to.be.eq(3);
      expect(list[3].name).to.be.eq(firstStudent.name);
      expect(list[3].value).to.be.eq(3);
    });

    it("should be able to filter out ratings", async () => {
      const tutor = await fixtures.tutor();
      const firstStudent = await fixtures.student();
      const secondStudent = await fixtures.student();

      const firstRating = await ratings.create({
        feedback: null,
        raterId: firstStudent.id,
        rateeId: tutor.id,
        value: 3,
      });

      const secondRating = await ratings.create({
        feedback: null,
        raterId: secondStudent.id,
        rateeId: tutor.id,
        value: 2,
      });

      const { list, total } = await ratings.findRateeRatings({
        userId: tutor.id,
        topRaterId: secondStudent.id,
      });

      expect(total).to.be.eq(2);
      expect(list).to.be.of.length(2);
      expect(list[0].id).to.be.eq(secondRating.id);
      expect(list[1].id).to.be.eq(firstRating.id);
    });
  });
});
