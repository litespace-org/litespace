import { DocBoolean } from "@/erpnext/common";
import { Lead } from "@/erpnext/lead";

export * from "@/erpnext/lead";

export type DocType =
  | "Sales Invoice"
  | "Payment Entry"
  | "Customer"
  | "Item"
  | "Lead";

export type DocMethod = "submit" | "cancel";

export type ChargeType = "On Net Total";

export type Account =
  | "CIB - LS"
  | "NBE - LS"
  | "ALEX - LS"
  | "Payonneer - LS"
  | "Investores - LS"
  | "Cash - LS"
  | "Sales - LS"
  | "Debtors - LS"
  | "Creditors - LS"
  | "VAT - LS";

export type AccountType = "Bank" | "Cash";

export type EtaTaxType = "T1";

export type EtaTaxSubType = "V009";

/**
 * B for business in Egypt, P for natural person, F for foreigner.
 */
export type EtaReceiverType = "B" | "P" | "F";

export type CustomerTerritory = "Egypt";

export type CustomerGender = "Male" | "Female";

export type PaymentType = "Receive" | "Pay" | "Internal Transfer";

export type Currency = "EGP";

export type PartyType = "Customer" | "Employee" | "Shareholder" | "Supplier";

export type Company = "LiteSpace";

export type StockUom = "Unit";

export type ItemCode = "WM120" | "WM150" | "WM180";

/**
 * Draft (value: 0)
 * Submitted (value: 1)
 * Cancelled (value: 2)
 */
export type DocStatus = 0 | 1 | 2;

export type CustomerType = "Company" | "Individual" | "Partnership";

export type Customer = {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: DocStatus;
  idx: number;
  naming_series: string;
  customer_name: string;
  customer_type: CustomerType;
  territory: CustomerTerritory;
  is_internal_customer: DocBoolean;
  etaReceiverType: EtaReceiverType;
  language: "en";
  doctype: "Customer";
};

export type DocMeta = {
  doctype: "DocType";
  name: DocType;
  creation: string;
  modified: string;
  modified_by: string;
  owner: string;
  docstatus: DocStatus;
  idx: number;
  fields: Array<{
    doctype: "DocField";
    name: string;
    creation: string;
    modified: string;
    modified_by: string;
    owner: string;
    docstatus: DocStatus;
    fieldname: string;
    fieldtype:
      | "Section Break"
      | "HTML"
      | "Table"
      | "Text Editor"
      | "Currency"
      | "Float"
      | "Column Break"
      | "Link"
      | "Check"
      | "Select"
      | "Data"
      | "Text"
      | "Tab Break"
      | "Small Text"
      | "Button"
      | "Date"
      | "Int";
    label: string;
  }>;
};

export type Item = {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  item_code: string;
  item_name: string;
  item_group: "Services";
  stock_uom: "Unit";
  disabled: DocBoolean;
};

export type SalesInvoice = {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: DocStatus;
  customer: string;
  customer_name: string;
  company: Company;
  posting_date: string;
  posting_time: string;
  due_date: string;
  items: Array<{
    name: string;
    item_code: string;
    item_name: string;
    item_description: string;
    item_group: string;
    qty: number;
    stock_utm: StockUom;
    uom: StockUom;
    price_list_rate: number;
    base_price_list_rate: number;
    discount_percentage: number;
    rate: number;
    amount: number;
    income_account: number;
  }>;
  taxes: Array<{
    charge_type: ChargeType;
    account_head: Account;
    eta_tax_type: EtaTaxType;
    eta_tax_sub_type: EtaTaxSubType;
    description: string;
    rate: number;
    total: number;
    tax_amount: number;
    tax_amount_after_discount_amount: number;
    base_tax_amount: number;
    base_tax_amount_after_discount_amount: number;
  }>;
};

export type DocTypeMap = {
  "Sales Invoice": SalesInvoice;
  "Payment Entry": unknown;
  Customer: Customer;
  Item: Item;
  Lead: Lead;
};

export type CreateSalesInvoiceApiPayload = {
  customer: string;
  postingDate: string;
  company: Company;
  docStatus: DocStatus;
  items: Array<{
    code: ItemCode;
    quantity: number;
    rate: number;
    docStatus: DocStatus;
  }>;
  taxes: Array<{
    chargeType: ChargeType;
    accountHead: Account;
    etaTaxType: EtaTaxType;
    etaTaxSubType: EtaTaxSubType;
    description: string;
    docStatus: DocStatus;
    rate: number;
  }>;
};

export type CreateSalesInvoiceApiResponse = SalesInvoice;

export type CreatePaymentEntryApiPayload = {
  customer: string;
  postingDate: string;
  paymentType: PaymentType;
  paidAmount: number;
  receivedAmount: number;
  targetExhangeRate: number;
  company: Company;
  paidTo: Account;
  paidFrom: Account;
  referenceNumber: string;
  referenceDate: string;
  partyType: PartyType;
  party: string;
  partyName: string;
  references: Array<{
    referenceDocType: DocType;
    referenceName: string;
    totalAmount: number;
    outstandingAmount: number;
    allocatedAmount: number;
    exchangeRate: number;
    account: Account;
  }>;
};

export type FindDocsApiResponse = object[];

export type FindDocsApiRequest = {
  doc: DocType;
  limit?: number;
  limitStart?: number;
  fields?: string[];
};

export type CreateCustomerApiPayload = {
  id: number;
  name: string;
  territory: CustomerTerritory;
  customerType: CustomerType;
  etaReceiverType: EtaReceiverType;
  customerDetails?: string;
  gender?: CustomerGender;
};

export type CreateCustomerApiResponse = Customer;

export type CreateItemApiPayload = {
  itemCode: string;
  itemName?: string;
};

export type CreateItemApiResponse = Item;

export type GetDocumentApiResponse<T extends DocType> = DocTypeMap[T];
