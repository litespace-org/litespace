import { Router } from "express";
import passport from "@/lib/passport";
import redirect from "@/handlers/redirect";
import { oauthHandler } from "@/handlers/oauth";

const router = Router();

// google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  oauthHandler
);

// facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  oauthHandler
);

export default router;
