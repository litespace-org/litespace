import { Router } from "express";
import auth from "@/handlers/auth";
import rateLimit from "express-rate-limit";
import ms from "ms";
import { ApiRoutes } from "@litespace/utils/routes";

const router = Router();

const authRoutes = ApiRoutes.auth.routes;

router.post(authRoutes.loginWithPassword, auth.loginWithPassword);
router.post(authRoutes.loginWithGoogle, auth.loginWithGoogle);
router.post(
  authRoutes.refreshToken,
  rateLimit({ windowMs: ms("1m"), limit: 5 }),
  auth.refreshAuthToken
);

export default router;
