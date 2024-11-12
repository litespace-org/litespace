import List from "@/components/Invoices/List";
import Error from "@/components/common/Error";
import PageTitle from "@/components/common/PageTitle";
import { Loading } from "@litespace/luna/Loading";
import { arrayEquals } from "@/components/utils/common";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { ActionsMenu, MenuAction } from "@litespace/luna/ActionsMenu";
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
import {
  ExtractObjectKeys,
  IFilter,
  IInvoice,
  IWithdrawMethod,
} from "@litespace/types";

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

const Invoices: React.FC = ({ user }: { user?: number }) => {
  const intl = useFormatMessage();
  const [methods, setMethods] = useState(DEFAULT_METHODS_FILTER);
  const [banks, setBanks] = useState<IInvoice.Bank[] | undefined>(undefined);
  const [receipt, setReceipt] = useState<boolean | undefined>(undefined);
  const [statuses, setStatuses] = useState<IInvoice.Status[]>(
    DEFAULT_STATUSES_FILTER
  );
  const [orderBy, setOrderBy] = useState<
    | ExtractObjectKeys<
        IInvoice.Row,
        "amount" | "created_at" | "updated_at" | "bank"
      >
    | undefined
  >(undefined);
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

  const { query, ...pagination } = useFindInvoices({ ...filter });

  const makeMethodOption = useCallback(
    (method: IWithdrawMethod.Type) => ({
      id: method,
      label: intl(withdrawMethodsIntlMap[method]),
      checked:
        methods.includes(method) &&
        !arrayEquals(methods, DEFAULT_METHODS_FILTER),
      onClick: () => {
        setMethods((prev) => {
          if (arrayEquals(prev, DEFAULT_METHODS_FILTER)) return [method];
          if (
            prev.includes(method) &&
            !arrayEquals(methods, DEFAULT_METHODS_FILTER)
          )
            return prev.filter((el) => el !== method);
          return [...prev, method];
        });
      },
    }),
    [methods, withdrawMethodsIntlMap, arrayEquals, intl]
  );

  const makeBankOption = useCallback(
    (bank: IInvoice.Bank) => ({
      id: bank,
      label: intl(invoiceBankIntlMap[bank]),
      checked: banks?.includes(bank),
      onClick: () => {
        setBanks((prev) => {
          if (prev === undefined) return [bank];
          if (prev.includes(bank)) return prev.filter((el) => el !== bank);
          return [...prev, bank];
        });
      },
    }),
    [banks, invoiceBankIntlMap, intl]
  );

  const makeStatusOption = useCallback(
    (status: IInvoice.Status) => ({
      id: status,
      label: intl(invoiceStatusIntlMap[status]),
      checked:
        statuses.includes(status) &&
        !arrayEquals(statuses, DEFAULT_STATUSES_FILTER),
      onClick: () => {
        setStatuses((prev) => {
          if (arrayEquals(prev, DEFAULT_STATUSES_FILTER)) return [status];
          if (
            prev.includes(status) &&
            !arrayEquals(statuses, DEFAULT_STATUSES_FILTER)
          )
            return prev.filter((el) => el !== status);
          return [...prev, status];
        });
      },
    }),
    [statuses, invoiceStatusIntlMap, intl, arrayEquals]
  );
  const makeOrderByOption = useCallback(
    (
      order: ExtractObjectKeys<
        IInvoice.Row,
        "amount" | "created_at" | "updated_at" | "bank"
      >
    ) => ({
      id: order,
      label: intl(invoiceOrderIntlMap[order]),
      checked: orderBy === order,
      onClick: () => setOrderBy(order),
    }),
    [orderBy, invoiceOrderIntlMap, intl]
  );

  const actions = useMemo(
    (): MenuAction[] => [
      {
        id: 0,
        label: intl("global.labels.cancel"),
        danger: true,
        disabled:
          arrayEquals(methods, DEFAULT_METHODS_FILTER) &&
          (banks === undefined || banks.length === 0) &&
          statuses === DEFAULT_STATUSES_FILTER &&
          receipt === undefined &&
          orderBy === undefined &&
          orderDirection === IFilter.OrderDirection.Descending,

        onClick: () => {
          setMethods(DEFAULT_METHODS_FILTER);
          setBanks(undefined);
          setStatuses(DEFAULT_STATUSES_FILTER);
          setReceipt(undefined);
          setOrderBy(undefined);
          setOrderDirection(IFilter.OrderDirection.Descending);
        },
      },
      {
        id: 1,
        label: intl("invoices.method"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            danger: true,
            disabled: arrayEquals(methods, DEFAULT_METHODS_FILTER),
            onClick: () => {
              setMethods(DEFAULT_METHODS_FILTER);
            },
          },
          {
            id: 1,
            label: intl("global.labels.all"),
            checked: arrayEquals(methods, DEFAULT_METHODS_FILTER),
            onClick: () => {
              setMethods(DEFAULT_METHODS_FILTER);
            },
          },
          makeMethodOption(IWithdrawMethod.Type.Bank),
          makeMethodOption(IWithdrawMethod.Type.Instapay),
          makeMethodOption(IWithdrawMethod.Type.Wallet),
        ],
      },
      {
        id: 2,
        label: intl("invoices.bank"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            danger: true,
            disabled: banks === undefined || banks.length === 0,
            onClick: () => {
              setBanks(undefined);
            },
          },
          makeBankOption(IInvoice.Bank.Alex),
          makeBankOption(IInvoice.Bank.Cib),
        ],
      },
      {
        id: 3,
        label: intl("dashboard.invoices.status"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            danger: true,
            disabled: arrayEquals(statuses, DEFAULT_STATUSES_FILTER),
            onClick: () => {
              setStatuses(DEFAULT_STATUSES_FILTER);
            },
          },
          {
            id: 1,
            label: intl("global.labels.all"),
            checked: arrayEquals(statuses, DEFAULT_STATUSES_FILTER),
            onClick: () => {
              setStatuses(DEFAULT_STATUSES_FILTER);
            },
          },
          makeStatusOption(IInvoice.Status.Pending),
          makeStatusOption(IInvoice.Status.CanceledByReceiver),
          makeStatusOption(IInvoice.Status.CancellationApprovedByAdmin),
          makeStatusOption(IInvoice.Status.UpdatedByReceiver),
          makeStatusOption(IInvoice.Status.Rejected),
          makeStatusOption(IInvoice.Status.Fulfilled),
        ],
      },
      {
        id: 4,
        label: intl("labels.invoice.receipt"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            danger: true,
            disabled: receipt === undefined,
            onClick: () => {
              setReceipt(undefined);
            },
          },
          {
            id: 1,
            label: intl("labels.uploaded"),
            checked: receipt === true,
            onClick: () => setReceipt(true),
          },
          {
            id: 2,
            label: intl("labels.notUplaoded"),
            checked: receipt === false,
            onClick: () => setReceipt(false),
          },
        ],
      },
      {
        id: 5,
        label: intl("dashboard.user.filter.order-by"),
        subActions: [
          {
            id: 0,
            label: intl("global.labels.cancel"),
            disabled: orderBy === undefined,
            danger: true,
            onClick: () => setOrderBy(undefined),
          },
          makeOrderByOption("amount"),
          makeOrderByOption("created_at"),
          makeOrderByOption("updated_at"),
          makeOrderByOption("bank"),
        ],
      },
      {
        id: 6,
        label: intl("dashboard.filter.order-direction"),
        value: orderDirection,
        onRadioValueChange: (value) =>
          setOrderDirection(value as IFilter.OrderDirection),
        radioGroup: [
          {
            id: 1,
            label: intl("dashboard.filter.order-direction.desc"),
            value: IFilter.OrderDirection.Descending,
          },
          {
            id: 2,
            label: intl("dashboard.filter.order-direction.asc"),
            value: IFilter.OrderDirection.Ascending,
          },
        ],
      },
    ],
    [
      methods,
      banks,
      statuses,
      receipt,
      orderBy,
      orderDirection,
      intl,
      makeBankOption,
      makeOrderByOption,
      makeMethodOption,
    ]
  );

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
    <div className="w-full p-8 mx-auto max-w-screen-2xl">
      <header className="flex items-center justify-between mb-3">
        <div className="flex items-center justify-center gap-2">
          <PageTitle
            title={intl("invoices.title")}
            fetching={query.isFetching && !query.isLoading}
            count={query.data?.total}
          />
          <ActionsMenu actions={actions} Icon={MixerHorizontalIcon} />
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

export default Invoices;
