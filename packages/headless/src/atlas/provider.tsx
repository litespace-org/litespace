import React, { useMemo } from "react";
import { AtlasContext } from "@/atlas/context";
import { useBackend } from "@/backend";
import { Atlas } from "@litespace/atlas";

export const AtlasProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { backend, getToken } = useBackend();

  const atlas = useMemo(
    () => new Atlas(backend, getToken),
    [backend, getToken]
  );

  return (
    <AtlasContext.Provider value={atlas}>{children}</AtlasContext.Provider>
  );
};
