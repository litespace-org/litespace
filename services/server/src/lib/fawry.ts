import { fawry } from "@/fawry/api";
import { encodeMerchantRefNumber } from "@/fawry/lib/ids";
import { Customer } from "@/fawry/types/requests";
import { transactions } from "@litespace/models";
import { ITransaction, IUser } from "@litespace/types";
import { FawryError } from "@/lib/error/local";
import { price } from "@litespace/utils";

export function asFawryCustomer({
  id,
  name,
  email,
  phone,
}: Pick<IUser.Self, "id" | "name" | "email"> & { phone: string }): Customer {
  return {
    id,
    email,
    phone,
    name: name || "LiteSpace Student",
  };
}

export async function performPayWithCardTx({
  user,
  phone,
  transaction,
  amount,
  cardToken,
  cvv,
}: {
  user: IUser.Self;
  phone: string;
  transaction: ITransaction.Self;
  amount: number;
  cardToken: string;
  cvv: string;
}): Promise<{ redirectUrl: string; type: string } | FawryError> {
  const result = await fawry.payWithCard({
    customer: asFawryCustomer({ ...user, phone }),
    merchantRefNum: encodeMerchantRefNumber({
      transactionId: transaction.id,
      createdAt: transaction.createdAt,
    }),
    amount: price.unscale(amount),
    cardToken,
    cvv,
  });

  if (result.statusCode !== 200) {
    await transactions.update({
      id: transaction.id,
      status: ITransaction.Status.Failed,
    });
    return new FawryError(result.statusDescription);
  }

  await transactions.update({
    id: transaction.id,
    status: ITransaction.Status.Processed,
  });

  return result.nextAction;
}

export async function performPayWithFawryRefNumTx({
  user,
  phone,
  transaction,
  amount,
}: {
  user: IUser.Self;
  phone: string;
  transaction: ITransaction.Self;
  amount: number;
}): Promise<{ referenceNumber: string } | FawryError> {
  const { statusCode, referenceNumber, statusDescription } =
    await fawry.payWithRefNum({
      customer: asFawryCustomer({ ...user, phone }),
      merchantRefNum: encodeMerchantRefNumber({
        transactionId: transaction.id,
        createdAt: transaction.createdAt,
      }),
      amount: price.unscale(amount),
    });

  if (statusCode !== 200 || !referenceNumber) {
    await transactions.update({
      id: transaction.id,
      status: ITransaction.Status.Failed,
    });
    return new FawryError(statusDescription);
  }

  await transactions.update({
    id: transaction.id,
    status: ITransaction.Status.Processed,
    providerRefNum: referenceNumber,
  });

  return { referenceNumber };
}

export async function performPayWithEWalletTx({
  user,
  phone,
  transaction,
  amount,
}: {
  user: IUser.Self;
  phone: string;
  transaction: ITransaction.Self;
  amount: number;
}): Promise<{ referenceNumber: string; walletQr: string | null } | FawryError> {
  const result = await fawry.payWithEWallet({
    customer: asFawryCustomer({ ...user, phone }),
    merchantRefNum: encodeMerchantRefNumber({
      transactionId: transaction.id,
      createdAt: transaction.createdAt,
    }),
    amount: price.unscale(amount),
  });

  if (result.statusCode !== 200) {
    await transactions.update({
      id: transaction.id,
      status: ITransaction.Status.Failed,
    });
    return new FawryError(result.statusDescription);
  }

  await transactions.update({
    id: transaction.id,
    status: ITransaction.Status.Processed,
  });

  return {
    referenceNumber: result.referenceNumber,
    walletQr: result.walletQr || null,
  };
}
