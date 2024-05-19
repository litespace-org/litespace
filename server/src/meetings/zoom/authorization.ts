import { ZoomAppType, zoomConfig } from "@/constants";
import { tutors } from "@/database";
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

type UserAppTokens = { access: string; refresh: string };

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
    refresh: data.refresh_token,
  };
}

// ref: https://developers.zoom.us/docs/integrations/oauth/#refreshing-an-access-token
export async function refreshAccessToken(
  app: UserApp,
  refreshToken: string
): Promise<UserAppTokens> {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("refresh_token", refreshToken);

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
    refresh: data.refresh_token,
  };
}

function createAuthorizedClient(token: string) {
  return axios.create({
    baseURL: zoomConfig.zoomApi,
    headers: constractAuthorizationHeader(token),
  });
}

export async function withAuthorization<T>(
  tutorId: number,
  handler: (client: Axios) => Promise<T>
): Promise<T> {
  if (zoomConfig.appType === ZoomAppType.UserBased) {
    const refresh = await tutors.findTutorZoomRefreshToken(tutorId);
    if (!refresh) throw new Error("Tutor didn't activated the zoom app");
    const tokens = await refreshAccessToken(getZoomUserApp(), refresh);
    const client = createAuthorizedClient(tokens.access);
    const response = await handler(client);
    await tutors.setTutorZoomRefreshToken(
      tutorId,
      tokens.refresh,
      new Date().toUTCString() // now
    );
    return response;
  }

  const apps = getZoomServerApps();
  for (const app of apps) {
    const token = await generateServerBasedAccessToken(app);
    const client = createAuthorizedClient(token);
    const response = await handler(client);
    return response;
  }

  throw new Error("Exhausted all zoom apps");
}
