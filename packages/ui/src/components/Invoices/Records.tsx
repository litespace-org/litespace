import { ActionsMenu, MenuAction } from "@/components/ActionsMenu";
import { useFormatMessage } from "@/hooks/intl";
import { LocalId } from "@/locales";
import React from "react";

const List: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <ul className="flex flex-col gap-1 shrink-0">{children}</ul>;
};

export const Labels: React.FC<{ ids: Array<LocalId> }> = ({ ids }) => {
  const intl = useFormatMessage();
  return (
    <List>
      {ids.map((id) => (
        <li key={id} className="text-foreground-light">
          <p>{intl(id)}:</p>
        </li>
      ))}
    </List>
  );
};

export type Value = { id: number; value: React.ReactNode };

export const Values: React.FC<{
  values: Value[];
}> = ({ values }) => {
  return (
    <List>
      {values.map(({ id, value }) => (
        <li key={id} className="text-foreground">
          <p>{value}</p>
        </li>
      ))}
    </List>
  );
};

export const Actions: React.FC<{ actions: MenuAction[] }> = ({ actions }) => {
  return (
    <div className="mr-auto">
      <ActionsMenu actions={actions} />
    </div>
  );
};

export const Columns: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <div className="flex flex-row gap-2">{children}</div>;
};
