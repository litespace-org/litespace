import zod from "zod";

export const GOOGLE_CLIENT_ID = zod
  .string()
  .trim()
  .endsWith(".apps.googleusercontent.com")
  .parse(import.meta.env.VITE_GOOGLE_CLIENT_ID);
