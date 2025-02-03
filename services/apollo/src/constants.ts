import zod from "zod";

export const serverConfig = {
  port: zod.coerce
    .number({ message: "Missing or invalid server port" })
    .parse(process.env.SERVER_PORT),
  host: zod.coerce
    .string({ message: "Missing or invalid server host" })
    .ip({ message: "Invalid server host address" })
    .parse(process.env.SERVER_HOST),
} as const;
