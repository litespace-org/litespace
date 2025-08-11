import { environment, paymobConfig } from "@/constants";
import { Cashier, TokenType } from "@litespace/atlas";
import { clientRouter } from "@/lib/client";
import { Web } from "@litespace/utils/routes";

export const cashier = new Cashier({
  server: environment,
  paymobSecretKey: {
    type: TokenType.Bearer,
    value: paymobConfig.secretKey,
  },
  redirectionUrl: clientRouter.web({ route: Web.Root }),
});
