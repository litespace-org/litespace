import { Router } from "express";
import rule from "@/handlers/rule";
import { ApiContext } from "@/types/api";

export default function router(context: ApiContext) {
  const router = Router();

  router.post("/", rule.createRule(context));
  router.put("/:ruleId", rule.updateRule(context));
  router.delete("/:ruleId", rule.deleteRule(context));
  router.get("/list/:userId", rule.findUserRules);
  router.get("/list/unpacked/:userId", rule.findUnpackedUserRules);
  router.get("/slots/:userId", rule.findUserRulesWithSlots);

  return router;
}
