import { authorizer } from "@/authorization";
import { IUser } from "@litespace/types";
import { expect } from "chai";

describe("Authorization", () => {
  describe("Authorizer", () => {
    it("should allow any one to access", () => {
      expect(authorizer().check()).to.be.true;
      expect(authorizer().check({ id: 1 })).to.be.true;
    });

    it("should allow only specified roles", () => {
      const checker = authorizer().superAdmin().regAdmin();
      expect(checker.check()).to.be.false;
      expect(checker.check({ role: IUser.Role.SuperAdmin })).to.be.true;
      expect(checker.check({ role: IUser.Role.RegularAdmin })).to.be.true;
      expect(checker.check({ role: IUser.Role.Student })).to.be.false;
    });

    it("should allow only the owner", () => {
      const checker = authorizer().owner(2);
      expect(checker.check()).to.be.false;
      expect(checker.check({ id: 1 })).to.be.false;
      expect(checker.check({ id: 2 })).to.be.true;
      expect(checker.check({ role: IUser.Role.SuperAdmin })).to.be.false;
    });

    it("should allow only members", () => {
      const checker = authorizer().member(1, 2);
      expect(checker.check()).to.be.false;
      expect(checker.check({ id: 1 })).to.be.true;
      expect(checker.check({ id: 2 })).to.be.true;
      expect(checker.check({})).to.be.false;
    });

    it("should allow owners and specified roles", () => {
      const checker = authorizer().superAdmin().member(1, 2);
      expect(checker.check()).to.be.false;
      expect(checker.check({ role: IUser.Role.SuperAdmin })).to.be.true;
      expect(checker.check({ role: IUser.Role.Student })).to.be.false;
      expect(checker.check({ id: 1 })).to.be.true;
      expect(checker.check({ id: 2 })).to.be.true;
      expect(checker.check({ id: 2, role: IUser.Role.Studio })).to.be
        .true;
      expect(checker.check({})).to.be.false;
    });

    it("allow authed users", () => {
      const checker = authorizer().authenticated();
      expect(checker.check()).to.be.false;
      expect(checker.check({ role: IUser.Role.SuperAdmin })).to.be.true;
      expect(checker.check({ id: 2 })).to.be.true;
      expect(checker.check({ id: 2, role: IUser.Role.Studio })).to.be
        .true;
    });
  });
});
