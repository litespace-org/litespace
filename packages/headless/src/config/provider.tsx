import { AppConfig, AppConfigContext } from "@/config/context";
import React, { useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 10;

// todo: manage cache
const key = "config::page-size";
const cachedPageSize = localStorage.getItem(key);
const cachedPageSizeValue =
  cachedPageSize && !Number.isNaN(Number(cachedPageSize))
    ? Number(cachedPageSize)
    : null;

export const AppConfigProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [pageSize, setPageSize] = useState<number>(
    cachedPageSizeValue || DEFAULT_PAGE_SIZE
  );

  const config = useMemo(
    (): AppConfig => ({
      pageSize: {
        value: pageSize,
        set: (value: number) => {
          setPageSize(value);
          localStorage.setItem(key, value.toString());
        },
      },
    }),
    [pageSize]
  );

  return (
    <AppConfigContext.Provider value={config}>
      {children}
    </AppConfigContext.Provider>
  );
};
