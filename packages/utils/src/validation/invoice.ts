import { HTML_REGEX, INSTAPAY_REGEX, PHONE_NUMBER_REGEX } from "@/constants";
import { FieldError, type Bank, BANKS, IInvoice } from "@litespace/types";
import { getSafeInnerHtmlText } from "@/utils";

export function isValidInvoiceReceiver(
  receiver: string,
  type: IInvoice.WithdrawMethod
) {
  if (type === IInvoice.WithdrawMethod.Wallet) {
    if (!PHONE_NUMBER_REGEX.test(receiver)) return FieldError.InvalidPhone;
    return true;
  }
  if (type === IInvoice.WithdrawMethod.Instapay) {
    if (!INSTAPAY_REGEX.test(receiver)) return FieldError.InvalidInstapayIPA;
    return true;
  }
  if (type === IInvoice.WithdrawMethod.Bank) {
    const [bankName, bankNumber] = receiver.split(":", 2);
    if (!bankName) return FieldError.EmptyBankName;
    if (!BANKS.includes(bankName as Bank)) {
      return FieldError.InvalidBankName;
    }
    if (isNaN(Number(bankNumber))) {
      return FieldError.InvalidBankAccountNumber;
    }
    return true;
  }
  return FieldError.InvalidWithdrawMethod;
}

export function isValidInvoiceAmount(
  invoiceAmount: number,
  minAmount: number,
  maxAmount: number
):
  | FieldError.InvoiceMinAmountSubceeded
  | FieldError.InvoiceMaxAmountExceeded
  | true {
  if (invoiceAmount < minAmount) return FieldError.InvoiceMinAmountSubceeded;
  if (invoiceAmount > maxAmount) return FieldError.InvoiceMaxAmountExceeded;
  return true;
}

export function isValidInvoiceNote(
  invoiceNote?: string | null
):
  | FieldError.EmptyInvoiceNote
  | FieldError.InvalidInvoiceNote
  | FieldError.TooLongInvoiceNote
  | true {
  if (!invoiceNote) return true;
  const noteText = getSafeInnerHtmlText(invoiceNote);
  if (noteText.length <= 0) return FieldError.EmptyInvoiceNote;
  if (!HTML_REGEX.test(invoiceNote)) return FieldError.InvalidInvoiceNote;
  if (noteText.length > 1000) return FieldError.TooLongInvoiceNote;
  return true;
}

export function isValidInvoiceMethod(
  method: IInvoice.WithdrawMethod
): FieldError.InvalidInvoiceMethod | true {
  if (
    ![
      IInvoice.WithdrawMethod.Bank,
      IInvoice.WithdrawMethod.Instapay,
      IInvoice.WithdrawMethod.Wallet,
    ].includes(method)
  )
    return FieldError.InvalidInvoiceMethod;
  return true;
}

export function isValidInstapayIPA(
  ipa: string
): FieldError.InvalidInstapayIPA | true {
  if (!INSTAPAY_REGEX.test(ipa)) return FieldError.InvalidInstapayIPA;
  return true;
}

export function isValidBankname(
  bankName: string
): FieldError.EmptyBankName | FieldError.InvalidBankName | true {
  if (!bankName) return FieldError.EmptyBankName;
  if (!BANKS.includes(bankName as Bank)) return FieldError.InvalidBankName;
  return true;
}

export function isValidBankNumber(
  bankNumber: string
): FieldError.InvalidBankAccountNumber | true {
  if (isNaN(Number(bankNumber))) return FieldError.InvalidBankAccountNumber;
  else return true;
}
