import { Router } from "express";
import passport, { AuthStrategy } from "@/lib/passport";
import { logout } from "@/handlers/oauth";
import utils from "@/handlers/utils";
import auth from "@/handlers/auth";
import user from "@/handlers/user";
import asyncHandler from "express-async-handler";

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
router.get("/discord", passport.authenticate(AuthStrategy.Discord));
router.get(
  "/discord/callback",
  passport.authenticate(AuthStrategy.Discord, options)
);

// password
router.post(
  "/password",
  asyncHandler(passport.authenticate(AuthStrategy.Local)),
  user.returnUser
);
router.post("/password/forgot", auth.forgotPassword, user.returnUser);
router.put(
  "/password/reset",
  asyncHandler(passport.authenticate(AuthStrategy.ResetPasswordToken)),
  user.returnUser
);

// email
router.post(
  "/verify-email",
  asyncHandler(passport.authenticate(AuthStrategy.EmailVerificationToken)),
  utils.end
);

// others
router.post("/token", passport.authenticate("jwt"), utils.end);
router.post("/logout", logout);

export default router;
