import Error from "@/components/common/Error";
import PageTitle from "@/components/common/PageTitle";
import List from "@/components/Invoices/List";
import { isEqual } from "lodash";
import { Loading } from "@litespace/luna/Loading";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { withdrawMethodsIntlMap } from "@/components/utils/invoice";
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
} from "@/components/utils/invoice";

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

  const makeMethodOption = useCallback(
    (method: IWithdrawMethod.Type) => ({
      id: method,
      label: intl(withdrawMethodsIntlMap[method]),
      checked:
        methods.includes(method) && !isEqual(methods, DEFAULT_METHODS_FILTER),
      onClick: () => {
        setMethods((prev) => {
          const full = isEqual(prev, DEFAULT_METHODS_FILTER);
          if (full) return [method];
          if (prev.includes(method) && !full) {
            const filteredMethods = prev.filter((el) => el !== method);
            return filteredMethods.length === 0
              ? DEFAULT_METHODS_FILTER
              : filteredMethods;
          }
          return [...prev, method];
        });
      },
    }),
    [methods, intl]
  );

  const makeBankOption = useCallback(
    (bank: IInvoice.Bank) => ({
      id: bank,
      label: intl(invoiceBankIntlMap[bank]),
      checked: banks?.includes(bank),
      onClick: () => {
        setBanks((prev) => {
          if (prev === undefined) return [bank];
          if (prev.includes(bank)) {
            const filteredBanks = prev.filter((el) => el !== bank);
            return filteredBanks.length === 0 ? undefined : filteredBanks;
          }
          return [...prev, bank];
        });
      },
    }),
    [banks, intl]
  );

  const makeStatusOption = useCallback(
    (status: IInvoice.Status) => ({
      id: status,
      label: intl(invoiceStatusIntlMap[status]),
      checked:
        statuses.includes(status) &&
        !isEqual(statuses, DEFAULT_STATUSES_FILTER),
      onClick: () => {
        setStatuses((prev) => {
          const full = isEqual(prev, DEFAULT_STATUSES_FILTER);
          if (full) return [status];
          if (prev.includes(status) && !full) {
            const filteredStatuses = prev.filter((el) => el !== status);
            return filteredStatuses.length === 0
              ? DEFAULT_STATUSES_FILTER
              : filteredStatuses;
          }
          return [...prev, status];
        });
      },
    }),
    [statuses, intl]
  );
  const makeOrderByOption = useCallback(
    (order: Exclude<IInvoice.FindInvoicesQuery["orderBy"], undefined>) => ({
      id: order,
      label: intl(invoiceOrderIntlMap[order]),
      checked: orderBy === order,
      onClick: () => setOrderBy(order),
    }),
    [orderBy, intl]
  );

  const actions = useMemo(
    (): MenuAction[] => [
      {
        id: 0,
        label: intl("global.labels.cancel"),
        danger: true,
        disabled:
          isEqual(methods, DEFAULT_METHODS_FILTER) &&
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
            disabled: isEqual(methods, DEFAULT_METHODS_FILTER),
            onClick: () => {
              setMethods(DEFAULT_METHODS_FILTER);
            },
          },
          {
            id: 1,
            label: intl("global.labels.all"),
            checked: isEqual(methods, DEFAULT_METHODS_FILTER),
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
            disabled: isEqual(statuses, DEFAULT_STATUSES_FILTER),
            onClick: () => {
              setStatuses(DEFAULT_STATUSES_FILTER);
            },
          },
          {
            id: 1,
            label: intl("global.labels.all"),
            checked: isEqual(statuses, DEFAULT_STATUSES_FILTER),
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
            label: intl("labels.not.uplaoded"),
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
      intl,
      methods,
      banks,
      statuses,
      receipt,
      orderBy,
      orderDirection,
      makeMethodOption,
      makeBankOption,
      makeStatusOption,
      makeOrderByOption,
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
    <div className="w-full">
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

export default Content;
