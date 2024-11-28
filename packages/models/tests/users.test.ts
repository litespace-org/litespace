import fixtures from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";
import { hashPassword, users } from "@/index";
import { expect } from "chai";
import dayjs from "@/lib/dayjs";
import { IUser } from "@litespace/types";
import { faker } from "@faker-js/faker/locale/ar";

describe("Users", () => {
  beforeEach(async () => {
    await fixtures.flush();
  });

  describe(nameof(users.create), () => {
    it("should create new user", async () => {
      const name = faker.person.fullName();
      const email = faker.internet.email();
      const user = await users.create({
        name: name,
        role: IUser.Role.Student,
        email: email,
        password: "password",
        birthYear: 2001,
        gender: IUser.Gender.Male,
      });

      expect(user.id).to.be.eq(1);
      expect(user.name).to.be.eq(name);
      expect(user.role).to.be.eq(IUser.Role.Student);
      expect(user.gender).to.be.eq(IUser.Gender.Male);
      expect(user.birthYear).to.be.eq(2001);
      expect(user.email).to.be.eq(email);
      expect(user.password).to.be.eq(true);
      expect(user.createdAt).to.be.eq(dayjs.utc(user.createdAt).toISOString());
      expect(user.updatedAt).to.be.eq(dayjs.utc(user.updatedAt).toISOString());
    });
  });

  describe(nameof(users.update), () => {
    it("should update a user", async () => {
      const created = await fixtures.user({ role: IUser.Role.Student });

      expect(await users.findById(created.id)).to.exist;

      const updated = await users.update(created.id, {
        email: "mostafa.kamar1@litespace.org",
        password: "new password",
        name: "Mostafa Kamar Edit",
        image: "/hi/2",
        birthYear: 2003,
        gender: IUser.Gender.Female,
        verified: true,
        online: true,
        creditScore: 2382001,
        phoneNumber: "01018303125",
        city: 2,
      });

      expect(updated.id).to.be.eq(created.id);
      expect(updated.email).to.be.eq("mostafa.kamar1@litespace.org");
      expect(updated.password).to.be.eq(true);
      expect(updated.name).to.be.eq("Mostafa Kamar Edit");
      expect(updated.image).to.be.eq("/hi/2");
      expect(updated.birthYear).to.be.eq(2003);
      expect(updated.gender).to.be.eq(IUser.Gender.Female);
      expect(updated.verified).to.be.eq(true);
      expect(updated.online).to.be.eq(true);
      expect(updated.creditScore).to.be.eq(2382001);
      expect(updated.phoneNumber).to.be.eq("01018303125");
      expect(updated.city).to.be.eq(2);

      expect(updated.createdAt).to.be.eq(
        dayjs.utc(created.createdAt).toISOString()
      );
      expect(updated.updatedAt).to.be.eq(
        dayjs.utc(updated.updatedAt).toISOString()
      );
      expect(updated.updatedAt).to.be.not.eq(
        dayjs.utc(created.updatedAt).toISOString()
      );
    });
  });

  describe(nameof(users.delete), () => {
    it("should delete user by id", async () => {
      const user = await fixtures.user({ role: IUser.Role.Student });
      expect(await users.findById(user.id)).to.exist;

      await users.delete(user.id);

      expect(await users.findById(user.id)).to.null;
    });
  });

  describe(nameof(users.find), () => {
    it("should find users by content", async () => {
      const interviewer = await fixtures.user({ role: IUser.Role.Interviewer });
      expect(await users.findById(interviewer.id)).to.exist;

      const interviewer2 = await fixtures.user({
        role: IUser.Role.Interviewer,
      });
      expect(await users.findById(interviewer2.id)).to.exist;

      const interviewer3 = await fixtures.user({
        role: IUser.Role.Interviewer,
      });
      expect(await users.findById(interviewer3.id)).to.exist;

      const result = await users.find({ role: IUser.Role.Interviewer });

      expect(result).to.exist;
      expect(result.list.length).to.be.eq(3);
      expect(result.list[2].id).to.be.eq(interviewer.id);
      expect(result.list[1].id).to.be.eq(interviewer2.id);
      expect(result.list[0].id).to.be.eq(interviewer3.id);
    });
  });

  describe(nameof(users.findOneBy), () => {
    it("should find users by any key", async () => {
      const created = await fixtures.user({ role: IUser.Role.Interviewer });
      expect(await users.findById(created.id)).to.exist;

      const user = await users.findOneBy("role", IUser.Role.Interviewer);
      expect(user).to.exist;
      expect(user?.id).to.be.eq(created.id);
    });
  });

  describe(nameof(users.findById), () => {
    it("should find users by role", async () => {
      const created = await fixtures.user({ role: IUser.Role.Interviewer });
      expect(await users.findById(created.id)).to.exist;

      const user = await users.findById(created.id);
      expect(user).to.exist;
      expect(user?.email).to.be.eq(created.email);
    });
  });

  describe(nameof(users.findUserPasswordHash), () => {
    it("should return hash of the user", async () => {
      const password = "pass";
      const created = await fixtures.user({
        role: IUser.Role.Interviewer,
        password,
      });
      const hash = await users.findUserPasswordHash(created.id);
      expect(hash).to.be.eq(hashPassword(password));
    });
  });

  describe(nameof(users.findByEmail), () => {
    it("should find users by role", async () => {
      const created = await fixtures.user({ role: IUser.Role.Interviewer });
      expect(await users.findById(created.id)).to.exist;

      const user = await users.findByEmail(created.email);
      expect(user).to.exist;
      expect(user?.id).to.be.eq(created.id);
    });
  });
});
