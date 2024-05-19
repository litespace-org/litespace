import { ZoomAppType, zoomConfig } from "@/constants";
import axios, { Axios } from "axios";
import zod from "zod";

function asBase64<T extends UserApp | ServerApp>(app: T): string {
  return Buffer.from([app.clientId, app.clientSecret].join(":")).toString(
    "base64"
  );
}

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

type UserAppTokens = { access: string; refersh: string };

type UserAppTokensApiResponse = { access_token: string; refresh_token: string };

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
      .parse(process.env[zoomAccountId]);

    const clientId = zod
      .string({ message: `Missing zoom client id (${zoomClientId})` })
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
export async function generateServerBasedAccessToken(
  app: ServerApp
): Promise<string> {
  const params = new URLSearchParams();
  params.append("grant_type", "account_credentials");
  params.append("account_id", app.accountId);

  const { data } = await axios.post<{ access_token: string }>(
    zoomConfig.tokenApi,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${asBase64(app)}`,
      },
    }
  );

  return data.access_token;
}

// ref: https://developers.zoom.us/docs/integrations/oauth/#getting-an-access-token
export async function generateUserBasedAccessToken(
  code: string,
  app: UserApp
): Promise<UserAppTokens> {
  console.log({ code, app });
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "https://example.com");

  const { data } = await axios.post<UserAppTokensApiResponse>(
    zoomConfig.tokenApi,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${asBase64(app)}`,
      },
    }
  );

  return {
    access: data.access_token,
    refersh: data.refresh_token,
  };
}

// ref: https://developers.zoom.us/docs/integrations/oauth/#refreshing-an-access-token
export async function refershAccessToken(
  app: UserApp,
  refershToken: string
): Promise<UserAppTokens> {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refershToken);

  const { data } = await axios.post<UserAppTokensApiResponse>(
    zoomConfig.tokenApi,
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${asBase64(app)}`,
      },
    }
  );

  return {
    access: data.access_token,
    refersh: data.refresh_token,
  };
}

async function generateAccessToken() {
  const refersh = "_";
  if (zoomConfig.appType === ZoomAppType.UserBased) {
    const tokens = refershAccessToken(getZoomUserApp(), refersh);
  }
}

export async function withAuthorization<T>(
  handler: (client: Axios) => Promise<T>
): Promise<T> {
  if (zoomConfig.appType === ZoomAppType.UserBased) {
    const refersh = process.env.ZOOM_REFERSH_TOKEN!; // get refersh token from db by tutor id
    const tokens = await refershAccessToken(getZoomUserApp(), refersh);
    const client = axios.create({
      baseURL: zoomConfig.zoomApi,
      headers: constractAuthorizationHeader(tokens.access),
    });
    const response = await handler(client);
    // update refersh token in db with tokens.refresh
    return response;
  }

  throw new Error("no supported");
}
