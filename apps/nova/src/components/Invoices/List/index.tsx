import { Button, ButtonSize } from "@litespace/luna/Button";
import { Timeline, TimelineItem } from "@litespace/luna/Timeline";
import { Spinner } from "@litespace/luna/Spinner";
import { messages } from "@litespace/luna/locales";
import { IInvoice } from "@litespace/types";
import React, { useMemo } from "react";
import { Hash } from "react-feather";
import { useIntl } from "react-intl";
import Invoice from "@/components/Invoices/List/Invoice";
import { isEmpty } from "lodash";
import Error from "./Error";

const List: React.FC<{
  refreshAll: () => void;
  refresh: () => void;
  list: IInvoice.Self[] | null;
  loading: boolean;
  fetching: boolean;
  withMore: boolean;
  more: () => void;
  error: Error | null;
}> = ({
  refresh,
  refreshAll,
  list,
  loading,
  fetching,
  withMore,
  more,
  error,
}) => {
  const intl = useIntl();
  const timeline = useMemo((): TimelineItem[] => {
    if (!list) return [];
    return list.map((invoice) => ({
      id: invoice.id,
      icon: <Hash />,
      children: <Invoice refresh={refreshAll} invoice={invoice} />,
    }));
  }, [list, refreshAll]);

  return (
    <div>
      <div className="flex flex-row items-center gap-2 mb-6">
        <h3 className="text-3xl">
          {intl.formatMessage({
            id: messages["invoices.title"],
          })}
        </h3>
        {fetching && !loading ? <Spinner /> : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[20vh]">
          <Spinner />
        </div>
      ) : null}

      {error ? (
        <Error
          refetch={refresh}
          loading={fetching || loading}
          disabled={fetching || loading}
        />
      ) : null}

      {list && !isEmpty(list) ? (
        <div>
          <Timeline timeline={timeline} />
          <Button
            loading={loading || fetching}
            disabled={loading || fetching || !withMore}
            size={ButtonSize.Small}
            onClick={more}
          >
            {intl.formatMessage({
              id: messages["global.labels.more"],
            })}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default List;
