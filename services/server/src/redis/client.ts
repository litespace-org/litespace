import { redisUrl } from "@/constants";
import { createClient } from "redis";

export const client = createClient({ url: redisUrl });
