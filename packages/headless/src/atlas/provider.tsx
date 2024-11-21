import React, { useMemo } from "react";
import { AtlasContext } from "@/atlas/context";
import { useBackend } from "@/backend";
import { Atlas } from "@litespace/atlas";

export const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { backend, token } = useBackend();

  const atlas = useMemo(() => new Atlas(backend, token), [backend, token]);

  return (
    <AtlasContext.Provider value={atlas}>{children}</AtlasContext.Provider>
  );
};
