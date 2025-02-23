import React, { useMemo } from "react";
import { AtlasContext } from "@/atlas/context";
import { useServer } from "@/server";
import { Atlas } from "@litespace/atlas";

export const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { server, token } = useServer();

  const atlas = useMemo(() => new Atlas(server, token), [server, token]);

  return (
    <AtlasContext.Provider value={atlas}>{children}</AtlasContext.Provider>
  );
};
