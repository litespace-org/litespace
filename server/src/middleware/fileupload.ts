import { isProduction } from "@/constants";
import upload from "express-fileupload";

export default function fileupload() {
  return upload({
    debug: !isProduction,
    createParentPath: true,
  });
}
