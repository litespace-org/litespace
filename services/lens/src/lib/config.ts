import zod from "zod";

export const booleanString = zod
  .custom<"true" | "false">((value) => value === "true" || value === "false")
  .transform((value) => value === "true");

const schema = zod.object({
  jwtSecret: zod.string(),
  headless: booleanString,
});

export const config = schema.parse({
  jwtSecret: process.env.JWT_SECRET,
  headless: process.env.HEADLESS,
});
