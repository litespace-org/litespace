import { Context } from "@/mediaQuery/context";
import React from "react";
import { useMediaQuery as useMedia } from "react-responsive";

function useMediaQuery() {
  const sm = useMedia({ query: "(min-width: 640px)" });
  const md = useMedia({ query: "(min-width: 768px)" });
  const lg = useMedia({ query: "(min-width: 1024px)" });
  const xl = useMedia({ query: "(min-width: 1280px)" });
  const xxl = useMedia({ query: "(min-width: 1536px)" });
  return { sm, md, lg, xl, xxl };
}

export const MediaQueryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const mq = useMediaQuery();
  return <Context.Provider value={mq}>{children}</Context.Provider>;
};
