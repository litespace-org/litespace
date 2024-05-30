import passport, { Profile } from "passport";
import { Strategy as Google, VerifyCallback } from "passport-google-oauth20";
import { Strategy as Facebook } from "passport-facebook";
import { facebookConfig, googleConfig } from "@/constants";
import { users } from "@/models";
import { first } from "lodash";

passport.serializeUser(async (user, done) => done(null, user.id));
passport.deserializeUser<number>(async (id, done) => {
  try {
    const info = await users.findById(id);
    done(null, info);
  } catch (error) {
    done(error);
  }
});

// todo: find or create
async function verify(
  _accessToken: string,
  _refershToken: string,
  profile: Profile,
  callback: VerifyCallback
) {
  try {
    const email = first(profile.emails);
    if (!email)
      throw new Error("User email is not provided; should never happen");

    const user = await users.findByEmail(email.value);
    if (user) return callback(null, user);

    const info = await users.createWithEmailOnly(email.value);
    return callback(null, info);
  } catch (error) {
    callback(error);
  }
}

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

export default passport;
