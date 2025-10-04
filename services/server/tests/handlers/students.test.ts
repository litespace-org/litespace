import db from "@fixtures/db";
import handlers from "@/handlers/student";
import { mockApi } from "@fixtures/mockApi";
import { expect } from "chai";
import { IStudent, IUser } from "@litespace/types";
import { exists } from "@/lib/error/api";
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
      const email = "student@example.com";

      const res = await createStudent({
        body: { email, password: "Password@123" },
      });

      expect(res.body?.user.email).to.eq(email);
      expect(res.body?.user.role).to.eq(IUser.Role.Student);
      expect(res.body?.token).to.be.a("string");
    });

    it("should validate payload and error on missing fields", async () => {
      const res = await createStudent({});
      expect(res).to.be.instanceof(ZodError);
    });
  });
});
