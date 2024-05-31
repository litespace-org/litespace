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

passport.use(
  "discord",
  new Custom(async (req, done) => {
    const code = req.query.code;

    const redirectUrl: string = url.format({
      protocol: req.protocol,
      host: req.get("host"),
      pathname: "/api/v1/auth/discord/callback",
    });

    if (typeof code === "string") {
      // oauth ref: https://discord.com/developers/docs/topics/oauth2#oauth2
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        redirect_uri: redirectUrl,
        code,
      });

      const base64 = Buffer.from(
        [discordConfig.clientId, discordConfig.clientSecret].join(":")
      ).toString("base64");

      try {
        const { data } = await axios.post<{
          access_token: string;
          refresh_token: string;
        }>(discordConfig.tokenApi, params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${base64}`,
          },
        });

        // get user ref: https://discord.com/developers/docs/resources/user#get-current-user
        const { data: userData } = await axios.get<{
          id: string;
          email: string;
          global_name: string;
        }>("https://discord.com/api/v10/users/@me", {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        return await verify(
          data.access_token,
          data.refresh_token,
          {
            id: userData.id,
            provider: "discord",
            emails: [{ value: userData.email }],
            displayName: userData.global_name,
          },
          done
        );
      } catch (error) {
        console.log(error);
        done(error);
      }

      return;
    }

    const res = req.res;
    if (!res) return done(new Error("Invalid request/response"));

    const oauthUrl: string = url.format({
      protocol: "https",
      host: "discord.com",
      pathname: "oauth2/authorize",
      query: {
        client_id: discordConfig.clientId,
        response_type: "code",
        redirect_uri: redirectUrl,
        scope: ["email", "identify"],
      },
    });

    res.redirect(oauthUrl);
  })
);

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
