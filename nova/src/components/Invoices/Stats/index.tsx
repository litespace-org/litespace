import { atlas } from "@/lib/atlas";
import { useAppSelector } from "@/redux/store";
import { profileSelector } from "@/redux/user/me";
import {
  Button,
  ButtonSize,
  LocalMap,
  messages,
  Spinner,
} from "@litespace/luna";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import Stat from "./Stat";
import { useIntl } from "react-intl";

const Stats: React.FC = () => {
  const intl = useIntl();
  const profile = useAppSelector(profileSelector);
  const stats = useQuery({
    queryFn: async () => {
      if (!profile) return null;
      return await atlas.invoice.stats(profile.id);
    },
    queryKey: ["tutor-invoice-stats"],
  });

  const data = useMemo((): Array<{
    id: keyof LocalMap;
    value: number;
  }> => {
    if (!stats.data) return [];
    return [
      {
        id: "page.invoices.stats.total.earnings",
        value: stats.data.income.past,
      },
      {
        id: "page.invoices.stats.pending",
        value: stats.data.invoices.pending,
      },
      {
        id: "page.invoices.stats.withdrawn",
        value: stats.data.invoices.fulfilled,
      },
    ];
  }, [stats.data]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl">
          {intl.formatMessage({
            id: messages["page.invoices.stats.title"],
          })}
        </h3>

        <Button size={ButtonSize.Small}>
          {intl.formatMessage({
            id: messages["page.invoices.stats.create.invoice"],
          })}
        </Button>
      </div>

      {stats.isLoading ? (
        <div className="flex items-center justify-center h-[20vh]">
          <Spinner />
        </div>
      ) : null}

      {stats.data ? (
        <div className="grid grid-cols-12 gap-4">
          {data.map(({ id, value }) => (
            <div key={id} className="col-span-12 md:col-span-6 lg:col-span-4">
              <Stat id={id} value={value} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default Stats;
