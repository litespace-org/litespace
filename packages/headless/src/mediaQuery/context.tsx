import { nameof } from "@litespace/utils";
import { createContext, useContext } from "react";

type Context = {
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  xxl: boolean;
};

export const Context = createContext<Context | null>(null);

export function useMediaQuery(): Context {
  const ctx = useContext(Context);
  if (!ctx)
    throw new Error(
      `${nameof(useMediaQuery)} cannot be used out of its provider`
    );
  return ctx;
}
