import config from "@litespace/luna/tailwind.config";
import { omit } from "lodash";

/** @type {import('tailwindcss').Config} */
export default omit(config, "prefix");
