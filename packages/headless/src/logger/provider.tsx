import { Context } from "@/logger/context";
import React, { useRef } from "react";
import { Logger } from "@/logger/types";

export const LoggerProvider: React.FC<{
  logger: Logger;
  children: React.ReactNode;
}> = ({ logger, children }) => {
  const loggerRef = useRef<Logger>(logger);
  return (
    <Context.Provider value={loggerRef.current}>{children}</Context.Provider>
  );
};
