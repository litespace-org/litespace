import { Cache } from "@litespace/models";
export const cache = new Cache(process.env.REDIS_URL || "");
