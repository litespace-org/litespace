/**
 * Bank receiver is assumed to follow this pattern: [bank-name]:[bank-acount-number],
 * for instance, CIB:123123123123213.
 */
export function formatBankString(bankReceiver: string) {
  const [bankName, bankAccountNumber] = bankReceiver.split(":");
  const numOfGroups = Math.ceil(bankAccountNumber.length / 4);

  const crafted: string[] = [`${bankName}:`];
  for (let i = 0; i < numOfGroups; i++) {
    const k = i * numOfGroups;
    crafted.push(bankAccountNumber.slice(k, k + 4));
  }

  return crafted.join("  ");
}
