import { IUser } from "@litespace/types";
import { Enforcer as CasbinEnforcer, newEnforcer } from "casbin";
import { sha256 } from "@/lib/crypto";
import path from "node:path";

const model = path.join(__dirname, "../../casbin/model.conf");
const policy = path.join(__dirname, "../../casbin/policy.csv");

type RequestRole = `${IUser.Type}` | "unauthorized";
type PolicyRole = RequestRole | "authorized";

function roleMatch(reqRole: RequestRole, policyRole: PolicyRole) {
  const authorized = policyRole === "authorized" && reqRole !== "unauthorized";
  const unauthorized = policyRole === "unauthorized";
  const exact = policyRole === reqRole;
  return authorized || unauthorized || exact;
}

function hasParams(reqRoute: string) {
  // return req
}

export class Enforcer {
  private static enforcer: CasbinEnforcer | null = null;

  private constructor() {}

  public static async instance(): Promise<CasbinEnforcer> {
    if (!Enforcer.enforcer) {
      Enforcer.enforcer = await newEnforcer(model, policy);
      Enforcer.enforcer.addFunction("roleMatch", roleMatch);
    }

    return Enforcer.enforcer;
  }
}
