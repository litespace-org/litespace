import passport, { Profile } from "passport";
import { Strategy as Google, VerifyCallback } from "passport-google-oauth20";
import { Strategy as Facebook } from "passport-facebook";
import { facebookConfig, googleConfig } from "@/constants";
import { users } from "@/models";

passport.serializeUser(async (user, done) => done(null, user.id));
passport.deserializeUser<number>(async (id, done) => {
  try {
    const info = await users.findById(id);
    done(null, info);
  } catch (error) {
    done(error);
  }
});

async function verify(
  accessToken: string,
  refershToken: string,
  profile: Profile,
  callback: VerifyCallback
) {
  try {
    console.log({ accessToken, refershToken, profile });
    const user = await users.findById(1);
    if (!user) throw new Error("User not found");
    callback(null, user);
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
      profileFields: [
        "id",
        "email",
        "first_name",
        "last_name",
        "picture.type(large)",
        "gender",
      ],
    },
    verify
  )
);

export default passport;
