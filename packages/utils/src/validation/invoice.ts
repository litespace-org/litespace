import { HTML_REGEX, INSTAPAY_REGEX, PHONE_NUMBER_REGEX } from "@/constants";
import { banks, FieldError, WithdrawMethod, type Bank } from "@litespace/types";
import { getSafeInnerHtmlText } from "@/utils";

export function isValidInvoiceReceiver(
  receiver: string,
  type: WithdrawMethod,
  bankName?: Bank
) {
  if (type === WithdrawMethod.Wallet) {
    if (!PHONE_NUMBER_REGEX.test(receiver)) return FieldError.InvalidPhone;
    return true;
  }
  if (type === WithdrawMethod.Instapay) {
    if (!INSTAPAY_REGEX.test(receiver)) return FieldError.InvalidInstapayIPA;
    return true;
  }
  if (type === WithdrawMethod.Bank) {
    if (!bankName) return FieldError.EmptyBankName;
    if (!Object.values(banks).includes(bankName)) {
      return FieldError.InvalidBankName;
    }
  }
}

export function isValidInvoiceAmount(
  invoiceAmount: number,
  minAmount: number,
  maxAmount: number
):
  | FieldError.ZeroInvoiceAmount
  | FieldError.InvoiceMinAmountSubceeded
  | FieldError.InvoiceMaxAmountExceeded
  | true {
  if (invoiceAmount <= 0) return FieldError.ZeroInvoiceAmount;
  if (invoiceAmount < minAmount) return FieldError.InvoiceMinAmountSubceeded;
  if (invoiceAmount > maxAmount) return FieldError.InvoiceMaxAmountExceeded;
  return true;
}

export function isValidInvoiceNote(
  invoiceNote: string
):
  | FieldError.EmptyInvoiceNote
  | FieldError.InvalidInvoiceNote
  | FieldError.TooLongInvoiceNote
  | true {
  const noteText = getSafeInnerHtmlText(invoiceNote);
  if (noteText.length <= 0) return FieldError.EmptyInvoiceNote;
  if (!HTML_REGEX.test(invoiceNote)) return FieldError.InvalidInvoiceNote;
  if (noteText.length > 1000) return FieldError.TooLongInvoiceNote;
  return true;
}
