import React, { useMemo } from "react";
import { ApiContext } from "@/api/context";
import { useServer } from "@/server";
import { Api } from "@litespace/atlas";

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { server, token } = useServer();

  const api = useMemo(() => new Api(server, token), [server, token]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
