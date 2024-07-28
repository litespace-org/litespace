import { IUser } from "@litespace/types";
import path from "node:path";
import UrlPattern from "url-pattern";

const authorized = "authorized";
const unauthorized = "unauthorized";
const superAdmin = IUser.Type.SuperAdmin;
const regAdmin = IUser.Type.RegularAdmin;
const interviewer = IUser.Type.Interviewer;
const tutor = IUser.Type.Tutor;
const student = IUser.Type.Student;
const provider = IUser.Type.MediaProvider;

export type Role = `${IUser.Type}` | "unauthorized" | "authorized";
export type Method = "POST" | "GET" | "PUT" | "DELETE";

function roleMatch(requestRole: Role, policyRoles: Role[]) {
  const authorized =
    policyRoles.includes("authorized") && requestRole !== "unauthorized";
  const unauthorized = policyRoles.includes("unauthorized");
  const exact = policyRoles.includes(requestRole);
  return authorized || unauthorized || exact;
}

export function routeMatch(
  url: string,
  pattern: string,
  ignore?: { key: string; value: string }
): boolean {
  const urlPattern = new UrlPattern(pattern);
  const match = urlPattern.match(url) as Record<string, string> | null;
  if (match === null) return false;
  if (!ignore) return true;
  return match[ignore.key] !== ignore.value;
}

function methodMatch(
  requestMethod: Method,
  policyMethods: Array<Method | "*">
): boolean {
  return policyMethods.includes(requestMethod) || policyMethods.includes("*");
}

type Policy = {
  roles: Role[];
  route: string;
  methods: Array<Method | "*">;
  ignore?: { key: string; value: string };
};

const policies: Array<Policy> = [
  {
    roles: [superAdmin],
    route: "/*",
    methods: ["*"],
  },
  {
    roles: [authorized],
    route: "/assets/*",
    methods: ["GET"],
  },
  {
    roles: [unauthorized],
    route: "(/)api/v1/user(/)",
    methods: ["POST"],
  },
  {
    roles: [regAdmin, interviewer],
    route: "(/)api/v1/user/list(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/user/me(/)",
    methods: ["GET"],
  },
  // tutors routes
  {
    roles: [unauthorized],
    route: "(/)api/v1/tutor(/)",
    methods: ["POST"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/tutor/list(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/tutor/:id(/)",
    methods: ["GET"],
  },
  {
    roles: [regAdmin, tutor],
    route: "(/)api/v1/tutor/:id(/)",
    methods: ["DELETE"],
  },
  {
    roles: [regAdmin, interviewer, provider],
    route: "(/)api/v1/tutor/media/*",
    methods: ["GET"],
  },
  // coupons routes
  {
    roles: [regAdmin],
    route: "(/)api/v1/coupon(/)",
    methods: ["POST"],
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/coupon/list(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/coupon/code/:code(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/coupon/:id(/)",
    methods: ["GET"],
    ignore: { key: "id", value: "list" },
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/coupon/:id(/)",
    methods: ["PUT", "DELETE"],
  },
  // invites routes
  {
    roles: [regAdmin],
    route: "(/)api/v1/invite(/*)",
    methods: ["*"],
  },
  // plans routes
  {
    roles: [regAdmin],
    route: "(/)api/v1/plan(/)",
    methods: ["POST"],
  },
  {
    roles: [unauthorized],
    route: "(/)api/v1/plan/list(/)",
    methods: ["GET"],
  },
  {
    roles: [unauthorized],
    route: "(/)api/v1/plan/:id(/)",
    methods: ["GET"],
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/plan/:id(/)",
    methods: ["PUT", "DELETE"],
  },
  // ratings routes
  {
    roles: [tutor, student],
    route: "(/)api/v1/rate(/)",
    methods: ["POST"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/rate/:id(/)",
    methods: ["GET"],
  },
  {
    roles: [tutor, student],
    route: "(/)api/v1/rate/:id(/)",
    methods: ["PUT"],
  },
  {
    roles: [regAdmin, tutor, student],
    route: "(/)api/v1/rate/:id(/)",
    methods: ["DELETE"],
  },
  // reports routes
  {
    roles: [authorized],
    route: "(/)api/v1/report(/)",
    methods: ["POST"],
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/report/list(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/report/:id(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/report/:id(/)",
    methods: ["PUT"],
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/report/:id(/)",
    methods: ["DELETE"],
  },
  // report replies routes
  {
    roles: [authorized],
    route: "(/)api/v1/report/reply(/)",
    methods: ["POST"],
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/report/reply/list(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/report/reply/:id(/)",
    methods: ["GET"],
    ignore: { key: "id", value: "list" },
  },
  {
    roles: [authorized],
    route: "(/)api/v1/report/reply/report/:id(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/report/reply/:id(/)",
    methods: ["PUT"],
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/report/reply/:id(/)",
    methods: ["DELETE"],
  },
  // slots routes
  {
    roles: [interviewer, tutor],
    route: "(/)api/v1/slot(/)",
    methods: ["POST"],
  },
  {
    roles: [interviewer, tutor],
    route: "(/)api/v1/slot/:id(/)",
    methods: ["PUT"],
  },
  {
    roles: [interviewer, tutor],
    route: "(/)api/v1/slot/:id(/)",
    methods: ["GET"],
    ignore: { key: "id", value: "me" },
  },
  {
    roles: [interviewer, tutor],
    route: "(/)api/v1/slot/me(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/slot/list/discrete(/)",
    methods: ["GET"],
  },
  {
    roles: [interviewer, tutor],
    route: "(/)api/v1/slot/:id(/)",
    methods: ["PUT"],
  },
  {
    roles: [regAdmin, interviewer, tutor],
    route: "(/)api/v1/slot/:id(/)",
    methods: ["DELETE"],
  },
  {
    roles: [student],
    route: "(/)api/v1/subscription(/)",
    methods: ["POST"],
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/subscription/list(/)",
    methods: ["GET"],
  },
  {
    roles: [regAdmin, student],
    route: "(/)api/v1/subscription/:id(/)",
    methods: ["GET", "PUT", "DELETE"],
  },
];

export function enforce(request: {
  role: Role;
  route: string;
  method: Method;
}): boolean {
  for (const policy of policies) {
    if (
      roleMatch(request.role, policy.roles) &&
      routeMatch(request.route, policy.route, policy.ignore) &&
      methodMatch(request.method, policy.methods)
    )
      return true;
  }

  return false;
}
