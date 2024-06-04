import { client } from "@/api/axios";
import { findMe } from "@/api/user";
import type { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async (params: {
    email: string;
    password: string;
    remember?: boolean;
  }) => {
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
  },
  logout: async () => {
    await client.get("/api/v1/auth/logout");

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    const me = await findMe();
    if (me) return { authenticated: true };
    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    const me = await findMe();
    if (me) {
      return {
        id: 1,
        name: "Ahmed Ibrahim",
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
