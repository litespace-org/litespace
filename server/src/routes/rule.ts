import { Router } from "express";
import rule from "@/handlers/rule";

const router = Router();

router.post("/", rule.createRule);
router.get("/list/:userId", rule.findUserRules);
router.get("/list/unpacked/:userId", rule.findUnpackedUserRules);

export default router;
