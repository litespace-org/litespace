import { env } from "@/lib/env";
import { Api } from "@litespace/atlas";

export const api = new Api(env.server, null);
