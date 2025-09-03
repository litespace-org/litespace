import db from "@fixtures/db";
import handlers from "@/handlers/students";
import { mockApi } from "@fixtures/mockApi";
import { expect } from "chai";
import { IStudent, IUser, IConfirmationCode } from "@litespace/types";
import { confirmationCodes } from "@litespace/models";
import { exists } from "@/lib/error";
import { ZodError } from "zod";

const createStudent = mockApi<
  IStudent.CreateApiPayload,
  void,
  void,
  IStudent.CreateApiResponse
>(handlers.create);

describe("/api/v1/student/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("POST /api/v1/student", () => {
    it("should fail with exists.user when email already exists", async () => {
      const email = "student@email.test";
      await db.user({ role: IUser.Role.Student, email });

      const res = await createStudent({
        body: { email, password: "Password@8" },
      });

      expect(res).to.deep.eq(exists.user());
    });

    it("should create a student and return token + profile", async () => {
      const payload: IStudent.CreateApiPayload = {
        email: "new@student.test",
        password: "Password@8",
        jobTitle: "Engineer",
        englishLevel: IStudent.EnglishLevel.Intermediate,
        learningObjective: "Fluency",
      };

      const res = await createStudent({ body: payload });
      expect(res.status).to.eq(200);
      const body = res.body as IStudent.CreateApiResponse;

      expect(body.user.email).to.eq(payload.email);
      expect(body.user.role).to.eq(IUser.Role.Student);
      expect(body.user.id).to.be.a("number");
      expect(body.token).to.be.a("string");

      const codes = await confirmationCodes.find({
        userId: body.user.id,
        purpose: IConfirmationCode.Purpose.VerifyEmail,
      });
      expect(codes.length).to.be.greaterThan(0);
    });

    it("should validate payload and error on missing fields", async () => {
      const res = await createStudent({});
      expect(res).to.be.instanceof(ZodError);
    });
  });
});
