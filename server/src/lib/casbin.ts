import { Enforcer as CasbinEnforcer, newEnforcer } from "casbin";
import path from "node:path";

const model = path.join(__dirname, "../../casbin/model.conf");
const policy = path.join(__dirname, "../../casbin/policy.csv");

export class Enforcer {
  private static enforcer: CasbinEnforcer | null = null;

  private constructor() {}

  public static async instance(): Promise<CasbinEnforcer> {
    if (!Enforcer.enforcer)
      Enforcer.enforcer = await newEnforcer(model, policy);

    return Enforcer.enforcer;
  }
}
