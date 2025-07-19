import { Base } from "@/lib/base";
import { IErpNext } from "@litespace/types";

export class Document extends Base {
  async createDocument<P extends object, R>(
    doc: IErpNext.DocType,
    payload: P
  ): Promise<R> {
    return this.post<P, { data: R }>({
      route: `/api/v2/document/${doc}`,
      payload,
    }).then((res) => res.data);
  }

  async createCustomer(
    payload: IErpNext.CreateCustomerApiPayload
  ): Promise<IErpNext.CreateCustomerApiResponse> {
    return await this.createDocument("Customer", {
      name: `CUST-${payload.id}`,
      customer_name: payload.name,
      customer_type: payload.customerType,
      territory: payload.territory,
      eta_receiver_type: payload.etaReceiverType,
      customer_details: payload.customerDetails,
      gender: payload.gender,
    });
  }

  async createItem(
    payload: IErpNext.CreateItemApiPayload
  ): Promise<IErpNext.CreateItemApiResponse> {
    return await this.createDocument("Item", {
      name: payload.itemCode,
      item_code: payload.itemCode,
      item_name: payload.itemName,
      /**
       * ref: https://docs.frappe.io/erpnext/user/manual/en/item-group
       */
      item_group: "Services",
      /**
       * We are EdTech company. We don't maintain any stock. We provide
       * "services" instead.
       */
      is_stock_item: 0,
      /**
       * Our subscriptions is selled as one "unit".
       * @note "uom" means "Unit of Measure"
       */
      stock_uom: "Unit",
    });
  }

  async createSalesInvoice(
    payload: IErpNext.CreateSalesInvoiceApiPayload
  ): Promise<IErpNext.CreateSalesInvoiceApiResponse> {
    return await this.createDocument("Sales Invoice", {
      customer: payload.customer,
      posting_date: payload.postingDate,
      company: payload.company,
      docstatus: payload.docStatus,
      items: payload.items.map((item) => ({
        item_code: item.code,
        qty: item.quantity,
        rate: item.rate,
        docstatus: item.docStatus,
      })),
      taxes: payload.taxes.map((tax) => ({
        charge_type: tax.chargeType,
        account_head: tax.accountHead,
        description: tax.description,
        eta_tax_type: tax.etaTaxType,
        eta_tax_sub_type: tax.etaTaxSubType,
        docstatus: tax.docStatus,
        rate: tax.rate,
      })),
    });
  }

  async createPaymentEntry(
    payload: IErpNext.CreatePaymentEntryApiPayload
  ): Promise<void> {
    return await this.createDocument("Payment Entry", {
      customer: payload.customer,
      posting_date: payload.postingDate,
      payment_type: payload.paymentType,
      paid_amount: payload.paidAmount,
      received_amount: payload.receivedAmount,
      target_exchange_rate: payload.targetExhangeRate,
      company: payload.company,
      party_type: payload.partyType,
      party: payload.party,
      party_name: payload.partyName,
      paid_to: payload.paidTo,
      paid_from: payload.paidFrom,
      reference_no: payload.referenceNumber,
      reference_date: payload.referenceDate,
      status: "Submitted",
      references: payload.references.map((ref) => ({
        reference_doctype: ref.referenceDocType,
        reference_name: ref.referenceName,
        total_amount: ref.totalAmount,
        outstanding_amount: ref.outstandingAmount,
        allocated_amount: ref.allocatedAmount,
        doctype: "Payment Entry Reference",
      })),
    });
  }

  async getCount(doc: IErpNext.DocType): Promise<number> {
    return this.get<void, { data: number }>({
      route: `/api/v2/doctype/${doc}/count`,
    }).then((res) => res.data);
  }

  async getDocument<T extends IErpNext.DocType>(
    doc: T,
    name: string
  ): Promise<IErpNext.GetDocumentApiResponse<T>> {
    return this.get<void, { data: IErpNext.GetDocumentApiResponse<T> }>({
      route: `/api/v2/document/${doc}/${name}`,
    }).then((res) => res.data);
  }

  async getMeta(doc: IErpNext.DocType): Promise<IErpNext.DocMeta> {
    return this.get<void, { data: IErpNext.DocMeta }>({
      route: `/api/v2/doctype/${doc}/meta`,
    }).then((res) => res.data);
  }

  async find(
    req: IErpNext.FindDocsApiRequest
  ): Promise<IErpNext.FindDocsApiResponse> {
    return this.get<void, { data: IErpNext.FindDocsApiResponse }>({
      route: `/api/v2/document/${req.doc}`,
      params: {
        fields: req.fields ? JSON.stringify(req.fields) : undefined,
        limit_start: req.limitStart,
        limit: req.limit,
      },
    }).then((res) => res.data);
  }

  async execute(
    doc: IErpNext.DocType,
    name: string,
    method: IErpNext.DocMethod
  ) {
    return this.post({
      route: `/api/v2/document/${doc}/${name}/method/${method}`,
    });
  }
}
