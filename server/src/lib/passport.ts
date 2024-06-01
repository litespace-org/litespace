import passport, { Profile } from "passport";
import { Strategy as Google, VerifyCallback } from "passport-google-oauth20";
import { Strategy as Facebook } from "passport-facebook";
import { Strategy as Local } from "passport-local";
import { Strategy as Custom } from "passport-custom";
import {
  discordConfig,
  facebookConfig,
  googleConfig,
  zoomConfig,
} from "@/constants";
import { users } from "@/models";
import { first } from "lodash";
import { hashPassword } from "./user";
import axios from "axios";
import url from "node:url";
import { verify } from "@/lib/oauth";
import { verifyCallback as discord } from "@/integrations/discord";

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

passport.use("discord", new Custom(discord));

passport.use(
  new Local(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const user = await users.findByCredentials(
          email,
          hashPassword(password)
        );
        if (!user) return done(new Error("Invalid email or password"));
        return done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

export default passport;