import { RoutesManager } from "@litespace/utils/routes";
import { env } from "@/lib/env";

export const router = new RoutesManager(env.client);
