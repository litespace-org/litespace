import { client } from "@/api/axios";
import { findMe } from "@/api/user";
import type { AuthProvider } from "@refinedev/core";

export const TOKEN_KEY = "refine-auth";

export enum OAuthProvider {
  Google = "google",
  Facebook = "facebook",
  Discord = "discord",
}

const providerUrl = {
  [OAuthProvider.Google]: "http://localhost:8080/api/v1/auth/google",
  [OAuthProvider.Facebook]: "http://localhost:8080/api/v1/auth/facebook",
  [OAuthProvider.Discord]: "http://localhost:8080/api/v1/auth/discord",
} as const;

export const authProvider: AuthProvider = {
  login: async (
    params:
      | { providerName: OAuthProvider }
      | { email: string; password: string; remember?: boolean }
  ) => {
    console.log({ params });

    const oauth = "providerName" in params;

    if (oauth)
      return {
        success: false,
        redirectTo: providerUrl[params.providerName],
      };

    if (!oauth) {
      await client.get("/api/v1/auth/password", {
        params: {
          email: params.email,
          password: params.password,
        },
      });

      return {
        success: true,
        redirectTo: "/",
      };
    }

    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    // todo: add isAuth endpoint
    const me = await findMe();
    console.log({ me });
    if (me) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        id: 1,
        name: "John Doe",
        avatar: "https://i.pravatar.cc/300",
      };
    }
    return null;
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
