import { environment, erpnextConfig } from "@/constants";
import { ErpNext } from "@litespace/atlas";

export const erpnext = new ErpNext({
  env: environment,
  key: erpnextConfig.publicKey,
  secret: erpnextConfig.secretKey,
});
