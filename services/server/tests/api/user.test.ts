import { flush } from "@fixtures/shared";
import { IUser } from "@litespace/types";
import api from "@fixtures/api";
import { expect } from "chai";

describe("/api/v1/user/", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("POST /api/v1/user", () => {
    it("should create a student", async () => {
      const email = "student@example.com";
      const password = "StudentExample101%^&";
      const result = await api.atlas().user.create({
        role: IUser.Role.Student,
        email,
        password,
        callbackUrl: "https://litespace.org/verify-email",
      });
      expect(result.user.id).to.be.eq(1);
      expect(result.user.email).to.be.eq(email);
      expect(result.user.password).to.be.eq(true);
      expect(result.user.password).to.be.eq(true);
      expect(result.user.role).to.be.eq(IUser.Role.Student);
    });
  });
});
