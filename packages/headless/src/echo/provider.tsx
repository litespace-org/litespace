import React, { useMemo } from "react";
import { EchoContext } from "@/echo/context";
import { useServer } from "@/server";
import { Echo } from "@litespace/atlas";

export const EchoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { server, token } = useServer();

  const echo = useMemo(() => new Echo(server, token), [server, token]);

  return <EchoContext.Provider value={echo}>{children}</EchoContext.Provider>;
};
