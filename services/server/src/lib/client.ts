import { Environment, environment } from "@/constants";
import { RoutesManager } from "@litespace/utils/routes";

export const clientRouter = new RoutesManager(
  environment === Environment.Development ? "local" : environment
);
