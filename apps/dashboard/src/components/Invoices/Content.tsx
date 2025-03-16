import Error from "@/components/Common/Error";
import PageTitle from "@/components/Common/PageTitle";
import List from "@/components/Invoices/List";
import { isEqual } from "lodash";
import { Loading } from "@litespace/ui/Loading";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import { MixerHorizontalIcon } from "@radix-ui/react-icons";
import { withdrawMethodsIntlMap } from "@/components/utils/invoice";
import { ActionsMenu, MenuAction } from "@litespace/ui/ActionsMenu";
import { BANKS, IInvoice, IWithdrawMethod } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import {
  useFindInvoices,
  UseFindInvoicesPayload,
} from "@litespace/headless/invoices";
import {
  invoiceBankIntlMap,
  invoiceStatusIntlMap,
} from "@/components/utils/invoice";

const DEFAULT_METHODS_FILTER = [
  IWithdrawMethod.Type.Bank,
  IWithdrawMethod.Type.Instapay,
  IWithdrawMethod.Type.Wallet,
];

const DEFAULT_STATUSES_FILTER = [
  IInvoice.Status.PendingCancellation,
  IInvoice.Status.PendingApproval,
  IInvoice.Status.Canceled,
  IInvoice.Status.Approved,
  IInvoice.Status.Rejected,
];

const Content: React.FC<{ user?: number }> = ({ user }) => {
  const intl = useFormatMessage();
  const [methods, setMethods] = useState(DEFAULT_METHODS_FILTER);
  const [banks, setBanks] = useState<IInvoice.Bank[] | undefined>(undefined);
  const [receipt, setReceipt] = useState<boolean | undefined>(undefined);
  const [statuses, setStatuses] = useState<IInvoice.Status[]>(
    DEFAULT_STATUSES_FILTER
  );

  const filter = useMemo(
    (): UseFindInvoicesPayload => ({
      users: user ? [user] : undefined,
      userOnly: !!user,
      methods,
      statuses,
      receipt,
    }),
    [user, methods, statuses, receipt]
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
          receipt === undefined,

        onClick: () => {
          setMethods(DEFAULT_METHODS_FILTER);
          setBanks(undefined);
          setStatuses(DEFAULT_STATUSES_FILTER);
          setReceipt(undefined);
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
          ...BANKS.map((bank) => makeBankOption(bank)),
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
          makeStatusOption(IInvoice.Status.PendingApproval),
          makeStatusOption(IInvoice.Status.PendingCancellation),
          makeStatusOption(IInvoice.Status.Canceled),
          makeStatusOption(IInvoice.Status.Rejected),
          makeStatusOption(IInvoice.Status.Approved),
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
    ],
    [
      intl,
      methods,
      banks,
      statuses,
      receipt,
      makeMethodOption,
      makeBankOption,
      makeStatusOption,
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
        {/* @TODO: update the loading view once designed in the Figma prototype. */}
        {query.isLoading ? <Loading /> : null}
        {query.data && !query.isLoading ? (
          <List data={query.data} query={query} {...pagination} />
        ) : null}
      </div>
    </div>
  );
};

export default Content;
