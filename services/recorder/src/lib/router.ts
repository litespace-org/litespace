import { RoutesManager } from "@litespace/utils/routes";
import { config } from "@/lib/config";

export const router = new RoutesManager(config.env);
