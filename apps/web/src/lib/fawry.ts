import { env } from "@/lib/env";
import { router } from "@/lib/routes";
import { Web } from "@litespace/utils/routes";

/**
 * read: https://developer.fawrystaging.com/docs/card-tokens/create-use-token#tooltip-webclient-token
 */
export function getAddCardIntegrationURL(userId: number, returnUrl?: string) {
  const accNo = env.fawryAccountNumber;
  const url =
    returnUrl ||
    router.web({
      route: Web.Root,
      full: true,
    });
  const base =
    env.client === "production"
      ? "https://www.atfawry.com/atfawry/plugin/card-token"
      : "https://atfawry.fawrystaging.com/atfawry/plugin/card-token";
  const params = `?accNo=${accNo}&customerProfileId=${userId}&returnUrl=${url}`;
  return base.concat(params);
}
