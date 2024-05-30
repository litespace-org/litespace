import passport from "passport";
import { Strategy as Google } from "passport-google-oauth20";
import { Strategy as Facebook } from "passport-facebook";
import { facebookConfig, googleConfig } from "@/constants";

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser<number>((id, done) => done(null, { id }));

passport.use(
  new Google(
    {
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: "/api/v1/auth/google/callback",
    },
    (accessToken, refershToken, profile, callback) => {
      console.log({ accessToken, refershToken, profile, callback });
      callback(null, { id: 1 });
    }
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
    (accessToken, refershToken, profile, callback) => {
      console.log({ accessToken, refershToken, profile, callback });
      callback(null, { id: 1 });
    }
  )
);

export default passport;
