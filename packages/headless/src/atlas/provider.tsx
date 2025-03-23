import React, { useMemo } from "react";
import { AtlasContext } from "@/atlas/context";
import { useServer } from "@/server";
import { Api } from "@litespace/atlas";

export const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { server, token } = useServer();

  const atlas = useMemo(() => new Api(server, token), [server, token]);

  return (
    <AtlasContext.Provider value={atlas}>{children}</AtlasContext.Provider>
  );
};
