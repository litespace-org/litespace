import { DocBoolean } from "@/erpnext/common";

export type LeadName = `LEAD-${number}`;

export type LeadStatus =
  | "Lead"
  | "Open"
  | "Replied"
  | "Opportunity"
  | "Quotation"
  | "Lost Quotation"
  | "Interested"
  | "Converted"
  | "Do Not Contact";

export type Lead = {
  name: string;
  owner: string;
  creation: string;
  modified: string;
  modified_by: string;
  docstatus: DocBoolean;
  idx: number;
  naming_series: string;
  first_name: string;
  lead_name: string;
  lead_owner: string;
  status: LeadStatus;
  email_id: string;
  mobile_no: string;
  phone: string;
  country: "Egypt";
  company: "LiteSpace";
  language: "en";
  title: string;
  disabled: DocBoolean;
  unsubscribed: DocBoolean;
  blog_subscriber: DocBoolean;
  doctype: "Lead";
};

export type CreateLeadApiPayload = {
  /**
   * this is the document name; not necessary the user name utterly
   */
  name: LeadName;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
};

export type UpdateLeadApiPayload = {
  /**
   * specify the lead to be updated by its name
   */
  name: LeadName;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};
