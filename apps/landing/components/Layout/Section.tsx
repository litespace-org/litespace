import { useFormatMessage } from "@/hooks/intl";
import { LocalId } from "@/locales/request";
import { Typography } from "@litespace/ui/Typography";
import React from "react";

export const Title: React.FC<{ id: LocalId }> = ({ id }) => {
  const intl = useFormatMessage();
  return (
    <Typography
      tag="h2"
      className="text-natural-950 text-subtitle-1 sm:text-h4 font-bold"
    >
      {intl(id)}
    </Typography>
  );
};

export const Text: React.FC<{ id: LocalId } | { children: React.ReactNode }> = (
  props
) => {
  const intl = useFormatMessage();
  return (
    <Typography
      tag="p"
      className="text-natural-950 text-body sm:text-subtitle-1 font-medium"
      dir="auto"
    >
      {"id" in props ? intl(props.id) : props.children}
    </Typography>
  );
};

export const Section: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="flex flex-col gap-4 sm:gap-6">{children}</div>;
};
