import { Router } from "express";
import passport from "@/lib/passport";
import { logout } from "@/handlers/oauth";
import redirect from "@/handlers/redirect";

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
router.get(
  "/google/callback",
  passport.authenticate("google", options),
  redirect("/")
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
  passport.authenticate("facebook", options),
  redirect("/")
);

// discord
router.get("/discord", passport.authenticate("discord"));
router.get(
  "/discord/callback",
  passport.authenticate("discord", options),
  redirect("/")
);

// others
router.get("/password", passport.authenticate("local", {}), redirect("/"));
router.get("/logout", logout);

export default router;
