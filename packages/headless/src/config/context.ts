import { nameof } from "@litespace/utils/utils";
import { createContext, useContext } from "react";

export type AppConfig = {
  pageSize: { value: number; set(value: number): void };
};

export const AppConfigContext = createContext<AppConfig | null>(null);

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context)
    throw new Error(`${nameof(useAppConfig)} must be used within its provider`);
  return context;
}

export function usePageSize() {
  const config = useAppConfig();
  return config.pageSize;
}
