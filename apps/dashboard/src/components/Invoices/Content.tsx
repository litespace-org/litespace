import Error from "@/components/common/Error";
import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Invoices/List";
import { isEqual } from "lodash";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { ActionsMenu, MenuAction } from "@litespace/luna/ActionsMenu";
import { IFilter, IInvoice, IWithdrawMethod } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import {
  useFindInvoices,
  UseFindInvoicesPayload,
} from "@litespace/headless/invoices";
import {
  invoiceBankIntlMap,
  invoiceOrderIntlMap,
  invoiceStatusIntlMap,
  withdrawMethodsIntlMap,
} from "@/components/utils/invoice";
import { MultiSelect } from "@litespace/luna/MultiSelect";
import { Select } from "@litespace/luna/Select";

const DEFAULT_METHODS_FILTER = [
  IWithdrawMethod.Type.Bank,
  IWithdrawMethod.Type.Instapay,
  IWithdrawMethod.Type.Wallet,
];

const DEFAULT_STATUSES_FILTER = [
  IInvoice.Status.Pending,
  IInvoice.Status.CanceledByReceiver,
  IInvoice.Status.CancellationApprovedByAdmin,
  IInvoice.Status.Fulfilled,
  IInvoice.Status.Rejected,
  IInvoice.Status.UpdatedByReceiver,
];

const Content: React.FC<{ user?: number }> = ({ user }) => {
  const intl = useFormatMessage();
  const [methods, setMethods] = useState(DEFAULT_METHODS_FILTER);
  const [banks, setBanks] = useState<IInvoice.Bank[] | undefined>(undefined);
  const [receipt, setReceipt] = useState<boolean | undefined>(undefined);
  const [statuses, setStatuses] = useState<IInvoice.Status[]>(
    DEFAULT_STATUSES_FILTER
  );
  const [orderBy, setOrderBy] =
    useState<IInvoice.FindInvoicesQuery["orderBy"]>(undefined);
  const [orderDirection, setOrderDirection] = useState<IFilter.OrderDirection>(
    IFilter.OrderDirection.Descending
  );

  const filter = useMemo(
    (): UseFindInvoicesPayload => ({
      users: user ? [user] : undefined,
      userOnly: !!user,
      methods,
      banks,
      statuses,
      receipt,
      orderBy,
      orderDirection,
    }),
    [user, methods, banks, statuses, receipt, orderBy, orderDirection]
  );

  const { query, ...pagination } = useFindInvoices(filter);

  const methodOptions = [
    {
      label: intl(withdrawMethodsIntlMap[IWithdrawMethod.Type.Bank]),
      value: IWithdrawMethod.Type.Bank,
    },
    {
      label: intl(withdrawMethodsIntlMap[IWithdrawMethod.Type.Instapay]),
      value: IWithdrawMethod.Type.Instapay,
    },
    {
      label: intl(withdrawMethodsIntlMap[IWithdrawMethod.Type.Wallet]),
      value: IWithdrawMethod.Type.Wallet,
    },
  ];

  const [methodValues, setMethodValues] = useState(
    Object.keys(IWithdrawMethod.Type)
  );

  const bankOptions = [
    {
      label: intl("global.labels.all"),
      value: undefined,
    },
    {
      label: intl(invoiceBankIntlMap[IInvoice.Bank.Alex]),
      value: IInvoice.Bank.Alex,
    },
    {
      label: intl(invoiceBankIntlMap[IInvoice.Bank.Cib]),
      value: IInvoice.Bank.Cib,
    },
  ];

  const [bankValues, setBankValues] = useState(Object.keys(IInvoice.Bank));

  const statusOptions = [
    {
      label: intl(invoiceStatusIntlMap[IInvoice.Status.Pending]),
      value: IInvoice.Status.Pending,
    },
    {
      label: intl(invoiceStatusIntlMap[IInvoice.Status.UpdatedByReceiver]),
      value: IInvoice.Status.UpdatedByReceiver,
    },
    {
      label: intl(invoiceStatusIntlMap[IInvoice.Status.CanceledByReceiver]),
      value: IInvoice.Status.CanceledByReceiver,
    },
    {
      label: intl(
        invoiceStatusIntlMap[IInvoice.Status.CancellationApprovedByAdmin]
      ),
      value: IInvoice.Status.CancellationApprovedByAdmin,
    },
    {
      label: intl(invoiceStatusIntlMap[IInvoice.Status.Fulfilled]),
      value: IInvoice.Status.Fulfilled,
    },
    {
      label: intl(invoiceStatusIntlMap[IInvoice.Status.Rejected]),
      value: IInvoice.Status.Rejected,
    },
  ];

  const [statusValues, setStatusValues] = useState(
    Object.keys(IInvoice.Status)
  );

  const receiptOptions = [
    {
      label: intl("global.labels.all"),
      value: undefined,
    },
    {
      label: intl("labels.uploaded"),
      value: true,
    },
    {
      label: intl("labels.not.uplaoded"),
      value: false,
    },
  ];

  const orderByOptions = [
    {
      label: intl("global.labels.all"),
      value: undefined,
    },
    {
      label: intl("dashboard.invoices.amount"),
      value: "amount",
    },
    {
      label: intl("dashboard.invoices.created.at"),
      value: "created_at",
    },
    {
      label: intl("dashboard.invoices.updated.at"),
      value: "updated_at",
    },
    {
      label: intl("dashboard.invoices.bank"),
      value: "bank",
    },
  ];

  const orderDirectionOptions = [
    {
      label: intl("dashboard.filter.order-direction.desc"),
      value: IFilter.OrderDirection.Descending,
    },
    {
      label: intl("dashboard.filter.order-direction.asc"),
      value: IFilter.OrderDirection.Ascending,
    },
  ];

  if (query.error) {
    return (
      <Error
        error={query.error}
        title={intl("dashboard.error.alert.title")}
        refetch={query.refetch}
      />
    );
  }

  return (
    <div className="w-full">
      <header className="flex flex-col items-start justify-between mb-3">
        <PageTitle
          title={intl("invoices.title")}
          fetching={query.isFetching && !query.isLoading}
          count={query.data?.total}
        />
        <div className="flex justify-between w-full">
          <MultiSelect
            options={methodOptions}
            values={methods}
            setValues={setMethods}
            placeholder={intl("dashboard.invoices.method")}
          />
          <MultiSelect
            options={bankOptions}
            values={banks}
            setValues={setBanks}
            placeholder={intl("dashboard.invoices.bank")}
          />
          <MultiSelect
            options={statusOptions}
            values={statusValues}
            setValues={setStatusValues}
            placeholder={intl("dashboard.invoices.status")}
          />
          <MultiSelect
            options={statusOptions}
            values={statusValues}
            setValues={setStatusValues}
            placeholder={intl("dashboard.user.filter.order-by")}
          />
          <Select
            options={receiptOptions}
            value={receipt}
            placeholder={intl("labels.invoice.receipt")}
          />
          <Select
            options={orderByOptions}
            value={orderBy}
            placeholder={intl("dashboard.user.filter.order-by")}
          />
          <Select
            options={orderDirectionOptions}
            value={orderDirection}
            placeholder={orderDirection}
          />
        </div>
      </header>
      <div className="w-full">
        {query.isLoading ? (
          <Loading className="h-screen" show={query.isLoading} />
        ) : query.data ? (
          <List data={query.data} query={query} {...pagination} />
        ) : null}
      </div>
    </div>
  );
};

export default Content;
