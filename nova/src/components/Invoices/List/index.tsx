import {
  Button,
  ButtonSize,
  messages,
  Spinner,
  Timeline,
  TimelineItem,
} from "@litespace/luna";
import { IInvoice } from "@litespace/types";
import React, { useMemo } from "react";
import { Hash } from "react-feather";
import { useIntl } from "react-intl";
import Invoice from "@/components/Invoices/List/Invoice";
import { isEmpty } from "lodash";

const List: React.FC<{
  refresh?: () => void;
  list: IInvoice.Self[] | null;
  loading: boolean;
  fetching: boolean;
  withMore: boolean;
  more: () => void;
}> = ({ refresh, list, loading, fetching, withMore, more }) => {
  const intl = useIntl();
  const timeline = useMemo((): TimelineItem[] => {
    if (!list) return [];
    return list.map((invoice) => ({
      id: invoice.id,
      icon: <Hash />,
      children: <Invoice refresh={refresh} invoice={invoice} />,
    }));
  }, [list, refresh]);

  return (
    <div>
      <div className="flex flex-row items-center gap-2">
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

      {list && !isEmpty(list) ? (
        <div className="my-6">
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
