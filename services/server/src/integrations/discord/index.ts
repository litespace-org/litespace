import { discordConfig } from "@/constants";
import { asBase64 } from "@/lib/http";
import { Tokens } from "@/types/OAuth";
import axios from "axios";
import { Request } from "express";
import { Profile } from "passport";
import url from "node:url";
import { verify } from "@/lib/oauth";
import { IUser } from "@litespace/types";

// oauth ref: https://discord.com/developers/docs/topics/oauth2#oauth2
export async function exchangeCode({
  code,
  redirectUrl,
}: {
  code: string;
  redirectUrl: string;
}): Promise<Tokens> {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    redirect_uri: redirectUrl,
    code,
  });

  const authorization = asBase64({
    clientId: discordConfig.clientId,
    clientSecret: discordConfig.clientSecret,
  });

  const { data } = await axios.post<{
    access_token: string;
    refresh_token: string;
  }>(discordConfig.tokenApi, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${authorization}`,
    },
  });

  return {
    access: data.access_token,
    refersh: data.refresh_token,
  };
}

// get current user: https://discord.com/developers/docs/resources/user#get-current-user
export async function findUserProfile(accessToken: string): Promise<Profile> {
  const { data } = await axios.get<{
    id: string;
    email: string;
    global_name: string;
  }>("https://discord.com/api/v10/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    id: data.id,
    provider: "discord",
    emails: [{ value: data.email }],
    displayName: data.global_name,
  };
}

function constrcutUrls(req: Request): { redirect: string; oauth: string } {
  const redirect: string = url.format({
    protocol: req.protocol,
    host: req.get("host"),
    pathname: "/api/v1/auth/discord/callback",
  });

  const oauth: string = url.format({
    protocol: "https",
    host: "discord.com",
    pathname: "oauth2/authorize",
    query: {
      client_id: discordConfig.clientId,
      response_type: "code",
      redirect_uri: redirect,
      scope: ["email", "identify"].join(" "),
    },
  });

  return { redirect, oauth };
}

async function handleCodeExchange({
  code,
  redirectUrl,
  done,
}: {
  code: string;
  redirectUrl: string;
  done: (error: Error | unknown | null, user?: IUser.Self) => void;
}) {
  const tokens = await exchangeCode({ code, redirectUrl });
  const profile = await findUserProfile(tokens.access);
  return await verify(tokens.access, tokens.refersh, profile, done);
}

// todo: handle access denided error
export async function verifyCallback(
  req: Request,
  done: (error: Error | unknown | null, user?: IUser.Self) => void
) {
  const code = req.query.code;
  const urls = constrcutUrls(req);
  const res = req.res;
  if (!res) return done(new Error("Invalid request/response"));

  if (typeof code === "string")
    return await handleCodeExchange({ code, redirectUrl: urls.redirect, done });

  return res.redirect(urls.oauth);
}
