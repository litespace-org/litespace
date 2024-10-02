import config from "@litespace/luna/tailwind.config";
import { omit } from "lodash";

export default omit(config, "prefix");
