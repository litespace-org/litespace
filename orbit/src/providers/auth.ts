import { atlas } from "@/lib/atlas";
import type { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  login: async ({
    email,
    password,
  }: {
    email: string;
    password: string;
    remember?: boolean;
  }) => {
    await atlas.auth.password({ email, password });

    return {
      success: true,
      redirectTo: "/",
    };
  },
  logout: async () => {
    await atlas.auth.logout();

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  check: async () => {
    try {
      await atlas.user.findMe();
      return { authenticated: true };
    } catch (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
      };
    }
  },
  getPermissions: async () => null,
  getIdentity: async () => {
    return await atlas.user.findMe();
  },
  onError: async (error) => {
    console.error(error);
    return { error };
  },
};
