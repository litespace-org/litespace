import { redisUrl } from "@/constants";
import { Cache } from "@litespace/models";

export const cache = new Cache(redisUrl);
