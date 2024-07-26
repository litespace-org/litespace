import { atlas } from "@/lib/atlas";
import { removeUser, setUser } from "@/lib/storage";
import type { AuthProvider } from "@refinedev/core";

export const authProvider: AuthProvider = {
  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
    remember?: boolean;
  }) {
    await atlas.auth.password({ email, password });
    setUser(await atlas.user.findMe());
    return { success: true, redirectTo: "/" };
  },
  async logout() {
    removeUser();
    await atlas.auth.logout();
    return { success: true, redirectTo: "/login" };
  },
  async check() {
    try {
      await atlas.user.findMe();
      return { authenticated: true };
    } catch (error) {
      return { authenticated: false, redirectTo: "/login" };
    }
  },
  async forgotPassword({ email }: { email: string }) {
    await atlas.auth.forgotPassword(email);
    return {
      success: true,
      successNotification: {
        message: "Please check you email inbox",
        description: "Reset password email is sent successfully",
      },
    };
  },
  async updatePassword({ password }: { password: string }) {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token)
      return {
        success: false,
        error: {
          name: "Update password error",
          message: "Missing update password token",
        },
      };

    await atlas.auth.resetPassword({ token, password });
    return {
      success: true,
      redirectTo: "/login",
      successNotification: { message: "Password is updated" },
    };
  },
  async getPermissions() {
    return null;
  },
  async getIdentity() {
    const user = await atlas.user.findMe();
    setUser(user);
    return user;
  },
  async onError(error) {
    console.error(error, { src: "authProvider" });
    return { error };
  },
};
