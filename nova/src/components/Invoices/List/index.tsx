import { usePaginationQuery } from "@/hooks/common";
import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import {
  Button,
  ButtonSize,
  messages,
  Spinner,
  Timeline,
  TimelineItem,
} from "@litespace/luna";
import { IInvoice, Paginated } from "@litespace/types";
import React, { useCallback, useMemo } from "react";
import { Hash } from "react-feather";
import { useIntl } from "react-intl";
import Invoice from "./Invoice";

const List: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelector);

  const findInvoices = useCallback(
    async ({
      pageParam,
    }: {
      pageParam: number;
    }): Promise<Paginated<IInvoice.Self>> => {
      if (!profile) return { list: [], total: 0 };
      const res = await atlas.invoice.find({
        userId: profile.id,
        page: pageParam,
        size: 10,
      });
      console.log({ res });
      return res;
    },
    [profile]
  );

  const { query, list, more } = usePaginationQuery(findInvoices, ["invoices"]);

  console.log({ list });

  const timeline = useMemo((): TimelineItem[] => {
    if (!list) return [];
    return list.map((invoice) => ({
      id: invoice.id,
      icon: <Hash />,
      children: <Invoice invoice={invoice} />,
    }));
  }, [list]);

  return (
    <div>
      <h3 className="text-3xl">
        {intl.formatMessage({
          id: messages["page.invoices.title"],
        })}
      </h3>

      {query.isLoading ? (
        <div className="flex items-center justify-center h-[20vh]">
          <Spinner />
        </div>
      ) : null}

      {list ? (
        <div className="my-6">
          <Timeline timeline={timeline} />
          <Button
            loading={query.isLoading || query.isFetching}
            disabled={query.isLoading || query.isFetching || !query.hasNextPage}
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
