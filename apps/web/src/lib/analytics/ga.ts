import ga from "react-ga4";
import { env } from "@/lib/env";

ga.initialize(env.gaMeasurementId);

export { ga };
