import { env } from "@/lib/env";
import { Atlas } from "@litespace/atlas";

export const atlas = new Atlas(env.server, null);
