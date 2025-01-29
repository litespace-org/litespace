import config from "@litespace/ui/tailwind.config";
import { omit } from "lodash";

export default omit(config, "prefix");
