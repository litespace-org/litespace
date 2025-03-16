import clarity from "@microsoft/clarity";
import { env } from "@/lib/env";

clarity.init(env.clarityProjectId);

export default clarity;
