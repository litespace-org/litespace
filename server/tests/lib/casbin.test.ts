import { expect } from "chai";
import { Enforcer } from "../../src/lib/casbin";
import { Enforcer as CasbinEnforcer } from "casbin";
import { IUser } from "@litespace/types";

type Role = IUser.Type | "authorized" | "unauthorized";

const unauthorized = "unauthorized";
const authorized = "authorized";

const authorizedRoles: Role[] = [
  authorized,
  IUser.Type.SuperAdmin,
  IUser.Type.RegularAdmin,
  IUser.Type.Interviewer,
  IUser.Type.Student,
  IUser.Type.Tutor,
  IUser.Type.MediaProvider,
];

const fullRoles: Role[] = [unauthorized, ...authorizedRoles];

const staff: Role[] = [
  IUser.Type.SuperAdmin,
  IUser.Type.RegularAdmin,
  IUser.Type.Interviewer,
];

const admins: Role[] = [IUser.Type.SuperAdmin, IUser.Type.RegularAdmin];
const customers: Role[] = [IUser.Type.Tutor, IUser.Type.Student];
const tutor = IUser.Type.Tutor;
const interviewer = IUser.Type.Interviewer;
const student = IUser.Type.Student;
const provider = IUser.Type.MediaProvider;

// const roles = [
//   IUser.Type.SuperAdmin,
//   IUser.Type.RegularAdmin,
//   IUser.Type.Interviewer,
//   IUser.Type.Student,
//   IUser.Type.Tutor,
//   IUser.Type.MediaProvider,
// ];

const policies: Array<{
  roles: { allowed: Role[]; denied: Role[] };
  route: string;
  method: "POST" | "GET" | "PUT" | "DELETE";
}> = [
  // "/api/v1/user" routes
  {
    roles: { allowed: fullRoles, denied: [] },
    route: "/api/v1/user",
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
    roles: { allowed: authorizedRoles, denied: [unauthorized] },
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
];

describe("Cabin", () => {
  let enforcer: CasbinEnforcer;

  beforeAll(async () => {
    enforcer = await Enforcer.instance();
  });

  it("Routes Access", async () => {
    for (const { roles, route, method } of policies) {
      for (const role of roles.allowed) {
        expect(await enforcer.enforce(role, route, method)).to.be.true;
      }

      for (const role of roles.denied) {
        expect(await enforcer.enforce(role, route, method)).to.be.false;
      }
    }
  });
});
