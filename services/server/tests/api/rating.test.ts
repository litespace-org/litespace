import { exists, forbidden, notfound } from "@/lib/error";
import { Api } from "@fixtures/api";
import db, { flush } from "@fixtures/db";
import { ratings } from "@litespace/models";
import { safe } from "@litespace/sol";
import { expect } from "chai";
import { first } from "lodash";

describe("/api/v1/rating/", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("GET /api/v1/rating", () => {
    it("should retrieve ratings of a specific user (with raterId)", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();
      const newTutor = await db.tutor();

      await ratings.create({
        raterId: student.user.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor."
      });

      const res = await studentApi.atlas.rating.findRaterRatings(student.user.id);

      expect(res.list).to.have.length(1);
      expect(res.list[0].feedback).to.eq("Very good instructor.");
    });

    it("should retrieve ratings on a specific tutor (with rateeId)", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();
      const newTutor = await db.tutor();

      await ratings.create({
        raterId: student.user.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor."
      });

      const res = await studentApi.atlas.rating.findRateeRatings(newTutor.id);

      expect(res.list).to.have.length(1);
      expect(res.list[0].feedback).to.eq("Very good instructor.");
    });

    it("should retrieve a specific rating with its id", async () => {
      const studentApi = await Api.forStudent();
      const student = await studentApi.findCurrentUser();
      const newTutor = await db.tutor();

      const rating = await ratings.create({
        raterId: student.user.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor."
      });

      const res = await studentApi.atlas.rating.findById(rating.id);
      expect(res.feedback).to.eq("Very good instructor.");
    });

    it("should successfully retrieve tutor ratings", async () => {
      const students = await db.students(2);
      const newTutor = await db.tutor();

      await ratings.create({
        raterId: students[0].id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor."
      });

      await ratings.create({
        raterId: students[1].id,
        rateeId: newTutor.id,
        value: 5,
        feedback: "Excellent exposition for complex concept."
      });

      const studentApi = await Api.forStudent();
      const res = await studentApi.atlas.rating.findTutorRatings(newTutor.id);

      expect(res.total).to.eq(2);
      expect(res.list.map(item => item.userId)).to.contains(students[0].id);
      expect(res.list.map(item => item.userId)).to.contains(students[1].id);
    });

    it("should retrieve tutor ratings with the requester user rating at the top", async () => {
      const students = await db.students(2);
      const newTutor = await db.tutor();

      await ratings.create({
        raterId: students[0].id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor."
      });

      await ratings.create({
        raterId: students[1].id,
        rateeId: newTutor.id,
        value: 5,
        feedback: "Excellent exposition for complex concept."
      });

      const studentApi = await Api.forStudent();

      const requester = await studentApi.findCurrentUser();
      await ratings.create({
        raterId: requester.user.id,
        rateeId: newTutor.id,
        value: 1,
        feedback: "I don't think it's for beginers as the instructor claims. I cannot grasp most of the content."
      });

      const res = await studentApi.atlas.rating.findTutorRatings(newTutor.id);

      expect(res.total).to.eq(3);
      expect(first(res.list)?.value).to.eq(1);
    });

    it("should retrieve tutor ratings in a specific order (described in the requirements)", async () => {
      const students = await db.students(3);
      const newTutor = await db.tutor();

      await ratings.create({
        raterId: students[0].id,
        rateeId: newTutor.id,
        value: 2,
        feedback: "Not as expected.",
      });

      await ratings.create({
        raterId: students[1].id,
        rateeId: newTutor.id,
        value: 2,
        feedback: "Not as expected but ok."
      });

      await ratings.create({
        raterId: students[2].id,
        rateeId: newTutor.id,
        value: 5,
        feedback: "Excellent exposition for complex concept."
      });

      const studentApi = await Api.forStudent();
      const res = await studentApi.atlas.rating.findTutorRatings(newTutor.id);

      expect(res.total).to.eq(3);
      expect(res.list[0].feedback).to.eq("Excellent exposition for complex concept.");
      expect(res.list[1].feedback).to.eq("Not as expected but ok.");
      expect(res.list[2].feedback).to.eq("Not as expected.");
    });

    it("should respond with 404 status code if the tutor does not exist", async () => {
      const studentApi = await Api.forStudent();
      const newStudent = await studentApi.findCurrentUser();
      const newTutor = await db.tutor();

      await ratings.create({
        raterId: newStudent.user.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "",
      });

      const res = await safe(async () => 
        studentApi.atlas.rating.findTutorRatings(123)
      );
      expect(res).to.deep.eq(notfound.tutor());
    });
  });

  describe("POST /api/v1/rating", () => {
    it("should successfully create new rating", async () => {
      const studentApi = await Api.forStudent();
      const newTutor = await db.tutor();

      await studentApi.atlas.rating.create({
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor."
      });

      const ratings = await studentApi.atlas.rating.findRateeRatings(newTutor.id);

      expect(ratings.list).to.have.length(1);
      expect(ratings.list[0].feedback).to.eq("Very good instructor.");
    });

    it("should NOT create rating twice for the same rater and ratee ids", async () => {
      const studentApi = await Api.forStudent();
      const newTutor = await db.tutor();

      await studentApi.atlas.rating.create({
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor."
      });

      const res = await safe(async () => studentApi.atlas.rating.create({
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor."
      }));

      expect(res).to.deep.eq(exists.rate());
    });
  });

  describe("PUT /api/v1/rating", () => {
    it("should successfully update the rating value and feedback", async () => {
      const studentApi = await Api.forStudent();
      const newStudent = await studentApi.findCurrentUser();
      const newTutor = await db.tutor();

      const newRating = await ratings.create({
        raterId: newStudent.user.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "",
      });

      await studentApi.atlas.rating.update(newRating.id, {
        feedback: "my new feedback."
      });
      const updated = await studentApi.atlas.rating.findById(newRating.id);

      expect(updated.feedback).to.eq("my new feedback.");
    });

    it("should NOT update if the user is not the rater", async () => {
      const studentApi = await Api.forStudent();
      const newStudent = await db.student();
      const newTutor = await db.tutor();

      const newRating = await ratings.create({
        raterId: newStudent.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "",
      });

      const res = await safe(async () => studentApi.atlas.rating.update(newRating.id, {
        feedback: "my new feedback."
      }));

      expect(res).to.deep.eq(forbidden());
    });
  });

  describe("DELETE /api/v1/rating", () => {
    it("should successfully delete a specific rating from the database", async () => {
      const studentApi = await Api.forStudent();
      const newStudent = await studentApi.findCurrentUser();
      const newTutor = await db.tutor();

      const newRating = await ratings.create({
        raterId: newStudent.user.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "",
      });

      await studentApi.atlas.rating.delete(newRating.id);
      const res = await safe(async () => studentApi.atlas.rating.findById(newRating.id));

      expect(res).to.deep.eq(notfound.rating());
    });

    it("should NOT delete a rating from the database by a user rather than the rater", async () => {
      const studentApi = await Api.forStudent();
      const newStudent = await db.student();
      const newTutor = await db.tutor();

      const newRating = await ratings.create({
        raterId: newStudent.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "",
      });

      const res = await safe(async () => await studentApi.atlas.rating.delete(newRating.id));

      expect(res).to.deep.eq(forbidden());
    });
  });
});
