import config from "@litespace/ui/tailwind.config";
import { omit } from "lodash";

/** @type {import('tailwindcss').Config} */
export default omit(config, "prefix");
