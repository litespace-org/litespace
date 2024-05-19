import { ZoomAppType, zoomConfig } from "@/constants";
import axios from "axios";
import zod from "zod";

const auth = Buffer.from(
  [zoomConfig.clientId, zoomConfig.clientSecret].join(":")
).toString("base64");

function constractAuthorizationHeader(token: string): {
  Authorization: `Bearer ${string}`;
} {
  return { Authorization: `Bearer ${token}` };
}

enum ZoomAppConfig {
  accountId = "ZOOM_ACCOUNT_ID",
  clientId = "ZOOM_CLIENT_ID",
  clientSecret = "ZOOM_CLIENT_SECRET",
}

type ServerApp = {
  accountId: string;
  clientId: string;
  clientSecret: string;
};

type UserApp = Omit<ServerApp, "accountId">;

function withAppIndex(
  prefix: ZoomAppConfig,
  index: number
): `${ZoomAppConfig}_${number}` {
  return `${prefix}_${index}`;
}

export function getZoomServerApps(): ServerApp[] {
  if (zoomConfig.appType === ZoomAppType.UserBased) return [];

  const count = zoomConfig.appsCount;
  const apps: ServerApp[] = [];

  for (let appIndex = 1; appIndex <= count; appIndex++) {
    const zoomAccountId = withAppIndex(ZoomAppConfig.accountId, appIndex);
    const zoomClientId = withAppIndex(ZoomAppConfig.clientId, appIndex);
    const zoomClientSecret = withAppIndex(ZoomAppConfig.clientSecret, appIndex);
    const accountId = zod
      .string({ message: `Missing zoom account id (${zoomAccountId})` })
      .length(22, `Invalid zoom account id length (${zoomAccountId})`)
      .parse(process.env[zoomAccountId]);

    const clientId = zod
      .string({ message: `Missing zoom client id (${zoomClientId})` })
      .length(22, `Invalid zoom client id length (${zoomClientId})`)
      .parse(process.env[zoomClientId]);

    const clientSecret = zod
      .string({ message: `Missing zoom client secret (${zoomClientSecret})` })
      .length(32, `Invalid zoom client secret length (${zoomClientSecret})`)
      .parse(process.env[zoomClientSecret]);

    apps.push({
      accountId,
      clientId,
      clientSecret,
    });
  }

  return apps;
}

export function getZoomUserApp(): UserApp {
  if (zoomConfig.appType !== ZoomAppType.UserBased)
    throw new Error(`Invalid zoom app type ${zoomConfig.appType}`);

  const zoomClientId = ZoomAppConfig.clientId;
  const zoomClientSecret = ZoomAppConfig.clientSecret;

  const clientId = zod
    .string({ message: `Missing zoom client id (${zoomClientId})` })
    .length(22, `Invalid zoom client id length (${zoomClientId})`)
    .parse(process.env[zoomClientId]);

  const clientSecret = zod
    .string({ message: `Missing zoom client secret (${zoomClientSecret})` })
    .length(32, `Invalid zoom client secret length (${zoomClientSecret})`)
    .parse(process.env[zoomClientSecret]);

  return {
    clientId,
    clientSecret,
  };
}

// ref: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
async function generateServerBasedAccessToken(): Promise<string> {
  const params = new URLSearchParams();
  params.append("grant_type", "account_credentials");
  params.append("account_id", zoomConfig.accountId);

  const { data } = await axios.post<{ access_token: string }>(
    zoomConfig.tokenApi,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${auth}`,
      },
    }
  );

  return data.access_token;
}

// ref: https://developers.zoom.us/docs/integrations/oauth/#getting-an-access-token
export async function generateUserBasedAccessToken(code: string): Promise<{
  access: string;
  refersh: string;
}> {
  const { data } = await axios.post<{
    access_token: string;
    refresh_token: string;
  }>(zoomConfig.tokenApi, {
    code,
    grant_type: "authorization_code",
    redirect_uri: "https://example.com",
  });

  return {
    access: data.access_token,
    refersh: data.refresh_token,
  };
}
