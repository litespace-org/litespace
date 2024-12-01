import { flush } from "@fixtures/shared";
import { IUser } from "@litespace/types";
import { Api } from "@fixtures/api";
import db from "@fixtures/db";
import { expect } from "chai";
import { safe } from "@litespace/sol/error";

describe("/api/v1/user/", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("POST /api/v1/user", () => {
    it("should create a student", async () => {
      const email = "student@example.com";
      const password = "StudentExample101%^&";
      const api = new Api();
      const result = await api.createUser({
        role: IUser.Role.Student,
        email,
        password,
        callbackUrl: "https://litespace.org/verify-email",
      });
      expect(result.user.email).to.be.eq(email);
      expect(result.user.password).to.be.eq(true);
      expect(result.user.password).to.be.eq(true);
      expect(result.user.role).to.be.eq(IUser.Role.Student);
    });
  });

  describe("/api/v1/user/:id", () => {
    describe("GET /api/v1/user/:id", () => {
      it("should be able to find a user by id", async () => {
        const adminApi = await Api.forSuperAdmin();
        const dbUser = await db.user();
        const user = await adminApi.atlas.user.findById(dbUser.id);
        expect(user.id).to.be.eq(dbUser.id);
        expect(user.email).to.be.eq(dbUser.email);
        expect(user.role).to.be.eq(dbUser.role);
      });

      it("should response with 404 incase user is not found", async () => {
        const adminApi = await Api.forSuperAdmin();
        const result = await safe(async () =>
          adminApi.atlas.user.findById(100)
        );
        expect(result).to.be.deep.eq(new Error("User not found"));
      });
    });

    describe("PUT /api/v1/user/:id", () => {
      it("should update a user", async () => {
        const userApi = await Api.forStudent();
        const u0 = await userApi.atlas.user.findCurrentUser();
        await userApi.atlas.user.update(u0.user.id, {
          name: "updated-1",
        });
        const u1 = await userApi.atlas.user.findCurrentUser();
        await userApi.atlas.user.update(u0.user.id, {
          name: "updated-2",
        });
        const u2 = await userApi.atlas.user.findCurrentUser();
        expect(u1.user.name).to.be.eq("updated-1");
        expect(u2.user.name).to.be.eq("updated-2");
      });
    });
  });
});
