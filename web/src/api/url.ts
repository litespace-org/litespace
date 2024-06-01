import zod from "zod";

const api = zod
  .string({ message: "Missing backend url" })
  .url({ message: "Invalid backend url" })
  .parse(import.meta.env.VITE_BACKEND_API);

function asFullUrl(pathname: string): string {
  return new URL(pathname, api).href;
}

export const endpoints = {
  student: asFullUrl("/api/v1/student"),
  authorization: {
    google: asFullUrl("/api/v1/auth/google"),
    facebook: asFullUrl("/api/v1/auth/facebook"),
    discord: asFullUrl("/api/v1/auth/discord"),
    password: asFullUrl("/api/v1/auth/password"),
    logout: asFullUrl("/api/v1/auth/logout"),
  },
} as const;
