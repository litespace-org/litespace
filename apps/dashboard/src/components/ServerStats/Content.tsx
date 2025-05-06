import { Loading } from "@litespace/ui/Loading";
import { Server } from "@litespace/types";
import { isEmpty } from "lodash";
import React, { useMemo } from "react";
import Chart from "@/components/ServerStats/Chart";
import { formatNumber, formatPercentage } from "@litespace/ui/utils";

const Content: React.FC<{ stats: Server.Stats[] }> = ({ stats }) => {
  const memoryData = useMemo(
    () =>
      stats.map((stat) => ({
        timestamp: stat.timestamp,
        memory: stat.memory,
      })),
    [stats]
  );

  const cpuData = useMemo(
    () =>
      stats.map((stat) => ({
        timestamp: stat.timestamp,
        cpu: stat.cpu,
      })),
    [stats]
  );

  const loadData = useMemo(
    () =>
      stats.map((stat) => ({
        timestamp: stat.timestamp,
        "1": stat.load[0],
        "5": stat.load[1],
        "15": stat.load[2],
      })),
    [stats]
  );

  if (isEmpty(stats)) return <Loading />;

  return (
    <div>
      <Chart
        data={memoryData}
        lines={["memory"]}
        label="Memory"
        formatter={(tick: number) => `${formatNumber(tick)} MB`}
        dataKey="memory"
      />

      <Chart
        data={cpuData}
        lines={["cpu"]}
        dataKey="cpu"
        label="CPU Usage (%)"
        formatter={formatPercentage}
      />

      <Chart
        data={loadData}
        lines={["1", "5", "15"]}
        label="System Load"
        formatter={formatPercentage}
      />
    </div>
  );
};

export default Content;
