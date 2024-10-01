import { isProduction } from "@/constants";
import upload from "express-fileupload";

export const fileupload = upload({
  debug: !isProduction,
  createParentPath: true,
});
