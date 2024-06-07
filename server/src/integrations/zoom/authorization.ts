import { zoomConfig } from "@/constants";
import { zoomAccounts } from "@/models";
import { IZoomAccount } from "@litespace/types";
import axios, { Axios } from "axios";

type ZoomApp = {
  accountId: string;
  clientId: string;
  clientSecret: string;
};

function asBase64(app: ZoomApp): string {
  return Buffer.from([app.clientId, app.clientSecret].join(":")).toString(
    "base64"
  );
}

function constractAuthorizationHeader(token: string): {
  Authorization: `Bearer ${string}`;
} {
  return { Authorization: `Bearer ${token}` };
}

type ServerApp = {
  accountId: string;
  clientId: string;
  clientSecret: string;
};

// ref: https://developers.zoom.us/docs/internal-apps/s2s-oauth/
export async function generateServerBasedAccessToken(
  app: ZoomApp
): Promise<string> {
  const params = new URLSearchParams({
    grant_type: "account_credentials",
    account_id: app.accountId,
  });

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

function createAuthorizedClient(token: string) {
  return axios.create({
    baseURL: zoomConfig.zoomApi,
    headers: constractAuthorizationHeader(token),
  });
}

export async function withAuthorization<T>(
  handler: (client: Axios) => Promise<T>
): Promise<T> {
  const zoomAccount = await zoomAccounts.findAvailableAccount();
  if (!zoomAccount) throw new Error("No zoom account found");
  if (zoomAccount.remainingApiCalls === 0)
    throw new Error("No remaining api calls for the selected account");

  const apps: ZoomApp[] = [];
  for (const app of apps) {
    const token = await generateServerBasedAccessToken(app);
    const client = createAuthorizedClient(token);
    const response = await handler(client);
    return response;
  }

  throw new Error("Exhausted all zoom apps");
}

export async function withCreateAuthorization<T>(
  handler: (client: Axios, zoomAccount: IZoomAccount.Self) => Promise<T>
): Promise<T> {
  const zoomAccount = await zoomAccounts.findAvailableAccount();
  if (!zoomAccount) throw new Error("No zoom account found");
  if (zoomAccount.remainingApiCalls === 0)
    throw new Error("No remaining api calls for the selected account");

  const app: ZoomApp = {
    accountId: zoomAccount.accountId,
    clientId: zoomAccount.clientId,
    clientSecret: zoomAccount.clientSecret,
  };

  const token = await generateServerBasedAccessToken(app);
  const client = createAuthorizedClient(token);

  try {
    return await handler(client, zoomAccount);
  } finally {
    await zoomAccounts.decreaseRemainingApiCalls(zoomAccount.id);
  }
}
