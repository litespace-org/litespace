import { useSocket } from "@litespace/headless/socket";
import { Typography } from "@litespace/ui/Typography";
import { Server, Wss } from "@litespace/types";
import React, { useEffect, useCallback, useState, useMemo } from "react";
import { useFormatMessage } from "@litespace/ui/hooks/intl";
import Content from "@/components/ServerStats/Content";
import { last } from "lodash";
import { Duration } from "@litespace/utils/duration";

const ServerStats: React.FC = () => {
  const socket = useSocket();
  const intl = useFormatMessage();
  const [stats, setStats] = useState<Server.Stats[]>([]);

  const top = useMemo(() => last(stats), [stats]);

  const uptime = useMemo(() => {
    if (!top) return "-";
    return Math.floor(top.elapsed / 1000 / 60).toString();
  }, [top]);

  const onStats = useCallback((stats: Server.Stats) => {
    setStats((prev) => [...prev, stats]);
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on(Wss.ServerEvent.ServerStats, onStats);

    return () => {
      socket.off(Wss.ServerEvent.ServerStats, onStats);
    };
  }, [onStats, socket]);

  return (
    <div className="w-full flex flex-col max-w-screen-2xl mx-auto p-6">
      <Typography tag="h3" className="text-h3">
        {intl("dashboard.server.stats.title")}
      </Typography>

      {top ? (
        <div>
          <Typography tag="span" className="text-body">
            {intl("dashboard.server.stats.uptime", {
              duration: Duration.from(uptime.toString()).format("ar"),
            })}
          </Typography>
        </div>
      ) : null}

      <Content stats={stats} />
    </div>
  );
};

export default ServerStats;
