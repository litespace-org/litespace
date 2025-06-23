import dns from "dns/promises";
import { isEmpty, orderBy } from "lodash";
import { SMTPClient } from "smtp-client";

import { safePromise } from "@litespace/utils";

async function getMX(domain: string): Promise<string[]> {
  const mx = await safePromise(dns.resolveMx(domain));
  if (mx instanceof Error) return [];
  return orderBy(mx, ["priority"]).map((mx) => mx.exchange);
}

/**
 * This function should be invoked as a safePromise parameter
 * It returns true if the @param email is deliverable, and throws
 * an error otherwise.
 */
async function isEmailDeliverableUnsafe(
  client: SMTPClient,
  email: string
): Promise<boolean> {
  await client.connect({ timeout: 5000 });
  await client.greet({ hostname: "litespace.org" }); // Can be anything valid
  await client.mail({ from: "notify@litespace.org" }); // Use a dummy address
  await client.rcpt({ to: email });
  await client.quit();
  return true;
}

export async function isEmailValid(email: string): Promise<boolean> {
  const domain = email.split("@")[1];

  const mxRecords = await getMX(domain);
  if (isEmpty(mxRecords)) return false;

  for (const mx of mxRecords) {
    const client = new SMTPClient({
      host: mx,
      port: 25,
    });

    const res = await safePromise(isEmailDeliverableUnsafe(client, email));

    // Ensure to clean up
    await safePromise(client.quit());

    // If any mx record accepted RCPT TO, email is likely valid
    if (res === true) return true;
  }

  return false;
}
