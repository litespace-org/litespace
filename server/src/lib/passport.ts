import passport from "passport";
import { Strategy as Google, VerifyCallback } from "passport-google-oauth20";
import { Strategy as Facebook } from "passport-facebook";
import { Strategy as Local } from "passport-local";
import { Strategy as Custom } from "passport-custom";
import { facebookConfig, googleConfig } from "@/constants";
import { users } from "@litespace/models";
import { verify } from "@/lib/oauth";
import { verifyCallback as discord } from "@/integrations/discord";
import { jwtAuthorization, localAuthorization } from "@/middleware/auth";
import { resetPassword, verifyEmail } from "@/handlers/auth";

export enum AuthStrategy {
  Discord = "discord",
  JWT = "jwt",
  Local = "local",
  EmailVerificationToken = "email-verification-token",
  ResetPasswordToken = "reset-password-token",
}

passport.serializeUser(async (user, done) => done(null, user.id));

passport.deserializeUser<number>(async (id, done) => {
  try {
    const info = await users.findById(id);
    done(null, info);
  } catch (error) {
    done(error);
  }
});

passport.use(
  new Google(
    {
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: "/api/v1/auth/google/callback",
    },
    verify
  )
);

passport.use(
  new Facebook(
    {
      clientID: facebookConfig.appId,
      clientSecret: facebookConfig.appSecret,
      callbackURL: "/api/v1/auth/facebook/callback",
      profileFields: ["id", "email"],
    },
    verify
  )
);

passport.use(AuthStrategy.Discord, new Custom(discord));
passport.use(AuthStrategy.JWT, new Custom(jwtAuthorization));
passport.use(AuthStrategy.Local, new Custom(localAuthorization));
passport.use(AuthStrategy.EmailVerificationToken, new Custom(verifyEmail));
passport.use(AuthStrategy.ResetPasswordToken, new Custom(resetPassword));

export default passport;
