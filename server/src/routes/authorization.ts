import { Router } from "express";
import passport from "@/lib/passport";
import { logout } from "@/handlers/oauth";
import utils from "@/handlers/utils";

const router = Router();
const options = { failureRedirect: "/login" } as const;

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
router.get("/google/callback", passport.authenticate("google", options));

// facebook
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);
router.get("/facebook/callback", passport.authenticate("facebook", options));

// discord
router.get("/discord", passport.authenticate("discord"));
router.get("/discord/callback", passport.authenticate("discord", options));

// others
router.post("/password", passport.authenticate("local", {}), utils.end);
router.post("/token", passport.authenticate("jwt"), utils.end);
router.post("/logout", logout);

export default router;
