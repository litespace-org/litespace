import { IUser } from "@litespace/types";
import UrlPattern from "url-pattern";
import { isProduction } from "@/constants";
import "colors";

const owner = "owner";
const authorized = "authorized";
const unauthorized = "unauthorized";
const superAdmin = IUser.Role.SuperAdmin;
const regAdmin = IUser.Role.RegularAdmin;
const tutorManager = IUser.Role.TutorManager;
const tutor = IUser.Role.Tutor;
const student = IUser.Role.Student;
const provider = IUser.Role.Studio;

export type Role = `${IUser.Role}` | "owner" | "unauthorized" | "authorized";
export type Method = "POST" | "GET" | "PUT" | "DELETE";

function roleMatch(requestRole: Role, policyRoles: Role[], isOwner?: boolean) {
  const own = policyRoles.includes(owner) && !!isOwner;
  const authorized =
    policyRoles.includes("authorized") && requestRole !== "unauthorized";
  const unauthorized = policyRoles.includes("unauthorized");
  const exact = policyRoles.includes(requestRole);
  return authorized || unauthorized || exact || own;
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
  // use
  {
    roles: [unauthorized],
    route: "(/)api/v1/user(/)",
    methods: ["POST"],
  },
  {
    roles: [tutor],
    route: "(/)api/v1/user/interviewer/select(/)",
    methods: ["GET"],
  },
  {
    roles: [regAdmin, tutorManager],
    route: "(/)api/v1/user/list(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/user/:id(/)",
    methods: ["PUT"],
    ignore: { key: "id", value: "me" },
  },
  {
    roles: [authorized],
    route: "(/)api/v1/user/me(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/user/tutor/meta/:tutorId(/)",
    methods: ["GET"],
  },
  // tutors
  {
    roles: [unauthorized],
    route: "(/)api/v1/tutor(/)",
    methods: ["POST"],
  },
  {
    roles: [unauthorized],
    route: "(/)api/v1/tutor/:id(/)",
    methods: ["GET"],
    ignore: { key: "id", value: "list" },
  },
  {
    roles: [authorized],
    route: "(/)api/v1/tutor/list(/)",
    methods: ["GET"],
  },
  {
    roles: [regAdmin, tutor],
    route: "(/)api/v1/tutor/:id(/)",
    methods: ["DELETE"],
  },
  {
    roles: [regAdmin, tutorManager, provider],
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
    route: "(/)api/v1/rating(/)",
    methods: ["POST"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/rating/:id(/)",
    methods: ["GET"],
    ignore: { key: "id", value: "list" },
  },
  {
    roles: [regAdmin],
    route: "(/)api/v1/rating/list(/)",
    methods: ["GET"],
  },
  {
    roles: [regAdmin, owner],
    route: "(/)api/v1/rating/list/rater/:id(/)",
    methods: ["GET"],
  },
  {
    roles: [unauthorized],
    route: "(/)api/v1/rating/list/ratee/:id(/)",
    methods: ["GET"],
  },
  {
    roles: [owner],
    route: "(/)api/v1/rating/:id(/)",
    methods: ["PUT"],
  },
  {
    roles: [regAdmin, owner],
    route: "(/)api/v1/rating/:id(/)",
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
  // slots
  {
    roles: [tutorManager, tutor],
    route: "(/)api/v1/slot(/)",
    methods: ["POST"],
  },
  {
    roles: [tutorManager, tutor],
    route: "(/)api/v1/slot/:id(/)",
    methods: ["PUT"],
  },
  {
    roles: [tutorManager, tutor],
    route: "(/)api/v1/slot/:id(/)",
    methods: ["GET"],
    ignore: { key: "id", value: "me" },
  },
  {
    roles: [tutorManager, tutor],
    route: "(/)api/v1/slot/me(/)",
    methods: ["GET"],
  },
  {
    roles: [authorized],
    route: "(/)api/v1/slot/list/discrete/:userId(/)",
    methods: ["GET"],
  },
  {
    roles: [tutorManager, tutor],
    route: "(/)api/v1/slot/:id(/)",
    methods: ["PUT"],
  },
  {
    roles: [regAdmin, tutorManager, tutor],
    route: "(/)api/v1/slot/:id(/)",
    methods: ["DELETE"],
  },
  // sessions
  {
    roles: [student, tutor],
    route: "(/)api/v1/session(/)",
    methods: ["POST"],
  },
  {
    roles: [regAdmin, owner],
    route: "(/)api/v1/session/tutor/interviews/:id(/)",
    methods: ["GET"],
  },
  // interviews
  {
    roles: [tutor],
    route: "(/)api/v1/interview(/)",
    methods: ["POST"],
  },
  {
    roles: [tutorManager, tutor],
    route: "(/)api/v1/interview/list/:userId(/)",
    methods: ["GET"],
  },
  {
    roles: [owner],
    route: "(/)api/v1/interview/:interviewId(/)",
    methods: ["GET"],
  },
  {
    roles: [owner],
    route: "(/)api/v1/interview/:id(/)",
    methods: ["PUT"],
  },
  // subscriptions
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
  isOwner?: boolean;
}): boolean {
  for (const policy of policies) {
    if (
      roleMatch(request.role, policy.roles, request.isOwner) &&
      routeMatch(request.route, policy.route, policy.ignore) &&
      methodMatch(request.method, policy.methods)
    ) {
      if (!isProduction)
        console.log(
          [
            "Access Control: ",
            ` ↳ Matched policy: ${policy.roles.join(
              ", "
            )} - ${policy.methods.join(", ")} - ${policy.route}`,
            ` ↳ Request: ${request.role} - ${request.method} ${
              request.route
            } - owner(${!!request.isOwner})`,
          ].join("\n").cyan
        );
      return true;
    }
  }

  return false;
}
