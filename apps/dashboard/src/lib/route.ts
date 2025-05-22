import { env } from "@/lib/env";
import { RoutesManager } from "@litespace/utils/routes";

export const router = new RoutesManager(env.client);
