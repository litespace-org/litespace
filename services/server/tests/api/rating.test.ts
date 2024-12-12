import { notfound } from "@/lib/error";
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
});
