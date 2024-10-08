import { expect } from "chai";
import { routeMatch, enforce, Role } from "../../src/middleware/accessControl";
import { IUser } from "@litespace/types";

const unauthorized = "unauthorized";
const authorized = "authorized";
const owner = "owner";

const authorizedRoles: Role[] = [
  authorized,
  IUser.Role.SuperAdmin,
  IUser.Role.RegularAdmin,
  IUser.Role.Interviewer,
  IUser.Role.Student,
  IUser.Role.Tutor,
  IUser.Role.MediaProvider,
];

const fullRoles: Role[] = [unauthorized, ...authorizedRoles];

const staff: Role[] = [
  IUser.Role.SuperAdmin,
  IUser.Role.RegularAdmin,
  IUser.Role.Interviewer,
];

const admins: Role[] = [IUser.Role.SuperAdmin, IUser.Role.RegularAdmin];
const customers: Role[] = [IUser.Role.Tutor, IUser.Role.Student];
const superAdmin = IUser.Role.SuperAdmin;
const regAdmin = IUser.Role.RegularAdmin;
const tutor = IUser.Role.Tutor;
const interviewer = IUser.Role.Interviewer;
const student = IUser.Role.Student;
const provider = IUser.Role.MediaProvider;

const policies: Array<{
  roles: { allowed: Role[]; denied: Role[] };
  method: "POST" | "GET" | "PUT" | "DELETE";
  route: string;
}> = [
  // "/api/v1/user" routes
  {
    roles: { allowed: [...fullRoles, owner], denied: [] },
    route: "/api/v1/user/",
    method: "POST",
  },
  {
    roles: { allowed: staff, denied: [...customers, authorized, unauthorized] },
    route: "/api/v1/user/list",
    method: "GET",
  },
  {
    roles: { allowed: authorizedRoles, denied: [unauthorized] },
    route: "/api/v1/user/me",
    method: "GET",
  },
  {
    roles: {
      allowed: [tutor, superAdmin],
      denied: [interviewer, student, provider],
    },
    route: "/api/v1/user/interviewer/select",
    method: "GET",
  },
  // "/api/v1/tutors" routes
  {
    roles: { allowed: fullRoles, denied: [] },
    route: "/api/v1/tutor",
    method: "POST",
  },
  {
    roles: { allowed: authorizedRoles, denied: [unauthorized] },
    route: "/api/v1/tutor/list",
    method: "GET",
  },
  {
    roles: { allowed: fullRoles, denied: [] },
    route: "/api/v1/tutor/1",
    method: "GET",
  },
  {
    roles: {
      allowed: [...admins, tutor],
      denied: [interviewer, student, unauthorized, authorized, provider],
    },
    route: "/api/v1/tutor/1",
    method: "DELETE",
  },
  {
    roles: {
      allowed: [...staff, provider],
      denied: [...customers, unauthorized, authorized],
    },
    route: "/api/v1/tutor/media/list",
    method: "GET",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [...customers, provider, unauthorized, authorized],
    },
    route: "/api/v1/coupon",
    method: "POST",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [...customers, interviewer, provider, unauthorized, authorized],
    },
    route: "/api/v1/coupon/list",
    method: "GET",
  },
  {
    roles: {
      allowed: [authorized, ...staff, ...customers, provider],
      denied: [unauthorized],
    },
    route: "/api/v1/coupon/code/litespace24",
    method: "GET",
  },
  {
    roles: {
      allowed: [authorized, ...staff, ...customers, provider],
      denied: [unauthorized],
    },
    route: "/api/v1/coupon/1",
    method: "GET",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/coupon/1",
    method: "PUT",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/coupon/1",
    method: "DELETE",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/invite/",
    method: "POST",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/invite/1",
    method: "GET",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/invite/1",
    method: "DELETE",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/invite/list",
    method: "GET",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/plan",
    method: "POST",
  },
  {
    roles: {
      allowed: [...fullRoles],
      denied: [],
    },
    route: "/api/v1/plan/list",
    method: "GET",
  },
  {
    roles: {
      allowed: [...fullRoles],
      denied: [],
    },
    route: "/api/v1/plan/2",
    method: "GET",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/plan/2",
    method: "PUT",
  },
  {
    roles: {
      allowed: [...admins],
      denied: [unauthorized, authorized, interviewer, provider, student, tutor],
    },
    route: "/api/v1/plan/2",
    method: "DELETE",
  },
  {
    roles: {
      allowed: [superAdmin, owner],
      denied: [regAdmin, ...customers, provider, interviewer],
    },
    route: "/api/v1/rating/1",
    method: "PUT",
  },
  {
    roles: {
      allowed: [...admins, owner],
      denied: [interviewer, ...customers, provider, interviewer],
    },
    route: "/api/v1/rating/list/rater/1",
    method: "GET",
  },
  {
    roles: {
      allowed: [student, tutor],
      denied: [regAdmin, interviewer, provider],
    },
    route: "/api/v1/call/",
    method: "POST",
  },
];

describe("Access Control", () => {
  it("Routes Access", async () => {
    for (const { roles, route, method } of policies) {
      console.log(
        `ACL: ${route}, ${method}\nAllowed: ${roles.allowed}\nDenied: ${roles.denied}`
      );

      for (const role of roles.allowed) {
        expect(enforce({ role, route, method, isOwner: role === "owner" })).to
          .be.true;
      }

      for (const role of roles.denied) {
        expect(enforce({ role, route, method, isOwner: role === "owner" })).to
          .be.false;
      }
    }
  });

  describe("routeMatch", () => {
    it("should match urls", () => {
      expect(routeMatch("/api/v1/user", "/api/v1/user")).to.be.true;
      expect(routeMatch("/api/v1/users", "/api/v1/user")).to.be.false;
      expect(routeMatch("/api/v1/user/interviewer/select", "/api/v1/user/:id"))
        .to.be.false;
    });

    it("should work with leading and trailing forward slash", () => {
      expect(routeMatch("api/v1/user", "(/)api/v1/user(/)")).to.be.true;
      expect(routeMatch("/api/v1/user", "(/)api/v1/user(/)")).to.be.true;
      expect(routeMatch("/api/v1/user/", "(/)api/v1/user(/)")).to.be.true;
    });

    it("should work with {*} url patterns (e.g., /user/*)", () => {
      expect(routeMatch("/api/v1/user", "/api/v1/user(/*)")).to.be.true;
      expect(routeMatch("/api/v1/user/", "/api/v1/user(/*)")).to.be.true;
      expect(routeMatch("/api/v1/user/list", "/api/v1/user(/*)")).to.be.true;
    });

    it("should work with {:} url patterns (e.g., /user/:id)", () => {
      expect(routeMatch("/api/v1/user/1", "/api/v1/user/:id")).to.be.true;
      expect(
        routeMatch("/api/v1/user/list", "/api/v1/user/:id", {
          key: "id",
          value: "list",
        })
      ).to.be.false;
    });
  });
});
