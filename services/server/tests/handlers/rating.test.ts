import { exists, forbidden, notfound } from "@/lib/error/api";
import db, { flush } from "@fixtures/db";
import { ratings } from "@litespace/models";
import { expect } from "chai";
import { first } from "lodash";
import handlers from "@/handlers/rating";
import { mockApi } from "@fixtures/mockApi";
import { IRating, IUser } from "@litespace/types";

const findRaterRatings = mockApi<
  object,
  { id: number },
  object,
  IRating.FindRatingsApiResponse
>(handlers.findRaterRatings);

const findRateeRatings = mockApi<
  object,
  { id: number },
  object,
  IRating.FindRatingsApiResponse
>(handlers.findRateeRatings);

const findById = mockApi<
  object,
  { id: number },
  object,
  IRating.FindRatingByIdApiResponse
>(handlers.findRatingById);

const findTutorRatings = mockApi<
  object,
  { id: number },
  IRating.FindTutorRatingsApiQuery,
  IRating.FindTutorRatingsApiResponse
>(handlers.findTutorRatings);

const createRating = mockApi<
  IRating.CreateApiPayload,
  object,
  object,
  IRating.CreateApiResponse
>(handlers.createRating);

const updateRating = mockApi<
  IRating.UpdateApiPayload,
  { id: number },
  object,
  IRating.UpdateApiResponse
>(handlers.updateRating);

const deleteRating = mockApi<object, { id: number }, object, object>(
  handlers.deleteRating
);

describe("/api/v1/rating/", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("GET /api/v1/rating", () => {
    it("should retrieve ratings of a specific user (with raterId)", async () => {
      const student = await db.student();
      const tutor = await db.tutor();

      await ratings.create({
        raterId: student.id,
        rateeId: tutor.id,
        value: 4,
        feedback: "Very good instructor.",
      });

      const res = await findRaterRatings({
        user: student,
        params: { id: student.id },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.list).to.have.length(1);
      expect(res.body!.list[0].feedback).to.eq("Very good instructor.");
    });

    it("should retrieve ratings on a specific tutor (with rateeId)", async () => {
      const student = await db.student();
      const tutor = await db.tutorUser();

      await ratings.create({
        raterId: student.id,
        rateeId: tutor.id,
        value: 4,
        feedback: "Very good instructor.",
      });

      const res = await findRateeRatings({
        user: tutor,
        params: { id: tutor.id },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.list).to.have.length(1);
      expect(res.body!.list[0].feedback).to.eq("Very good instructor.");
    });

    it("should retrieve a specific rating with its id", async () => {
      const student = await db.student();
      const newTutor = await db.tutor();

      const rating = await ratings.create({
        raterId: student.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "Very good instructor.",
      });

      const res = await findById({
        user: student,
        params: { id: rating.id },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.feedback).to.eq("Very good instructor.");
    });

    it("should successfully retrieve tutor ratings", async () => {
      const students = await db.students(2);
      const tutor = await db.tutor();

      await ratings.create({
        raterId: students[0].id,
        rateeId: tutor.id,
        value: 4,
        feedback: "Very good instructor.",
      });

      await ratings.create({
        raterId: students[1].id,
        rateeId: tutor.id,
        value: 5,
        feedback: "Excellent exposition for complex concept.",
      });

      const res = await findTutorRatings({
        user: await db.student(),
        params: { id: tutor.id },
        query: {},
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.total).to.eq(2);
      expect(res.body!.list.map((item) => item.userId)).to.contains(
        students[0].id
      );
      expect(res.body!.list.map((item) => item.userId)).to.contains(
        students[1].id
      );
    });

    it("should retrieve tutor ratings with the requester user rating at the top", async () => {
      const students = await db.students(2);
      const tutor = await db.tutor();

      await ratings.create({
        raterId: students[0].id,
        rateeId: tutor.id,
        value: 4,
        feedback: "Very good instructor.",
      });

      await ratings.create({
        raterId: students[1].id,
        rateeId: tutor.id,
        value: 5,
        feedback: "Excellent exposition for complex concept.",
      });

      const student = await db.student();

      await ratings.create({
        raterId: student.id,
        rateeId: tutor.id,
        value: 1,
        feedback:
          "I don't think it's for beginers as the instructor claims. I cannot grasp most of the content.",
      });

      const res = await findTutorRatings({
        user: student,
        params: { id: tutor.id },
        query: {},
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.total).to.eq(3);
      expect(first(res.body!.list)?.value).to.eq(1);
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
        feedback: "Not as expected but ok.",
      });

      await ratings.create({
        raterId: students[2].id,
        rateeId: newTutor.id,
        value: 5,
        feedback: "Excellent exposition for complex concept.",
      });

      const student = await db.student();
      const res = await findTutorRatings({
        user: student,
        params: { id: newTutor.id },
        query: {},
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body!.total).to.eq(3);
      expect(res.body!.list[0].feedback).to.eq(
        "Excellent exposition for complex concept."
      );
      expect(res.body!.list[1].feedback).to.eq("Not as expected but ok.");
      expect(res.body!.list[2].feedback).to.eq("Not as expected.");
    });

    it("should respond with 404 status code if the tutor does not exist", async () => {
      const student = await db.student();
      const newTutor = await db.tutor();

      await ratings.create({
        raterId: student.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "",
      });

      const res = await findTutorRatings({
        user: student,
        params: { id: 4321 },
        query: {},
      });

      expect(res).to.deep.eq(notfound.tutor());
    });
  });

  describe("POST /api/v1/rating", () => {
    it("should successfully create new rating", async () => {
      const student = await db.student();
      const tutor = await db.tutor();
      await db.lesson({
        student: student.id,
        tutor: tutor.id,
        timing: "past",
      });

      await createRating({
        user: student,
        body: {
          rateeId: tutor.id,
          value: 4,
          feedback: "Very good instructor.",
        },
      });

      const { list, total } = await ratings.findByRateeId(tutor.id);
      expect(total).to.eq(1);
      expect(list[0].feedback).to.eq("Very good instructor.");
    });

    it("should NOT create rating twice for the same rater and ratee ids", async () => {
      const student = await db.student();
      const tutor = await db.tutor();
      await db.lesson({
        student: student.id,
        tutor: tutor.id,
        timing: "past",
      });

      await createRating({
        user: student,
        body: {
          rateeId: tutor.id,
          value: 4,
          feedback: "Very good instructor.",
        },
      });

      const res = await createRating({
        user: student,
        body: {
          rateeId: tutor.id,
          value: 4,
          feedback: "Very good instructor.",
        },
      });

      expect(res).to.deep.eq(exists.rate());
    });

    it("should NOT create rating unless the student has atleast one lesson with the tutor", async () => {
      const student = await db.student();
      const tutor = await db.tutor();
      await db.lesson({
        student: student.id,
        tutor: tutor.id,
        timing: "future",
      });

      const res = await createRating({
        user: student,
        body: {
          rateeId: tutor.id,
          value: 4,
          feedback: "Very good instructor.",
        },
      });

      expect(res).to.deep.eq(forbidden());
    });

    it("should NOT create rating unless the tutor has a video by the studio", async () => {
      const tutor = await db.tutorUser();
      const studio = await db.user({ role: IUser.Role.Studio });

      const res = await createRating({
        user: tutor,
        body: {
          rateeId: studio.id,
          value: 4,
          feedback: "Very good instructor.",
        },
      });

      expect(res).to.deep.eq(forbidden());
    });
  });

  describe("PUT /api/v1/rating/:id", () => {
    it("should successfully update the rating value and feedback", async () => {
      const student = await db.student();
      const newTutor = await db.tutor();

      const newRating = await ratings.create({
        raterId: student.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "",
      });

      const res = await updateRating({
        user: student,
        params: { id: newRating.id },
        body: { feedback: "my new feedback." },
      });
      expect(res).to.not.be.instanceof(Error);

      const updated = await ratings.findById(newRating.id);
      expect(updated).to.not.be.null;
      expect(updated!.feedback).to.eq("my new feedback.");
    });

    it("should NOT update if the user is not the rater", async () => {
      const student = await db.student();
      const newTutor = await db.tutor();

      const newRating = await ratings.create({
        raterId: student.id,
        rateeId: newTutor.id,
        value: 4,
        feedback: "",
      });

      const res = await updateRating({
        user: await db.student(),
        params: { id: newRating.id },
        body: { feedback: "my new feedback." },
      });
      expect(res).to.deep.eq(forbidden());
    });
  });

  describe("DELETE /api/v1/rating", () => {
    it("should successfully delete a specific rating from the database", async () => {
      const student = await db.student();
      const tutor = await db.tutorUser();

      const newRating = await ratings.create({
        raterId: student.id,
        rateeId: tutor.id,
        value: 4,
        feedback: "",
      });

      await deleteRating({
        user: student,
        params: { id: newRating.id },
      });

      const res = await deleteRating({
        user: tutor,
        params: { id: newRating.id },
      });

      expect(res).to.deep.eq(notfound.rating());
    });

    it("should NOT delete a rating from the database by a user rather than the rater", async () => {
      const student = await db.student();
      const tutor = await db.tutorUser();

      const newRating = await ratings.create({
        raterId: student.id,
        rateeId: tutor.id,
        value: 4,
        feedback: "",
      });

      const res = await deleteRating({
        user: tutor,
        params: { id: newRating.id },
      });

      expect(res).to.deep.eq(forbidden());
    });
  });
});
