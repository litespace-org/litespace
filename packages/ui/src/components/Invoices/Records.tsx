import { ActionsMenu, MenuAction } from "@/components/ActionsMenu";
import React from "react";

const List: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return (
    <ul className="tw-flex tw-flex-col tw-gap-1 tw-shrink-0">{children}</ul>
  );
};

export const Labels: React.FC<{ ids: Array<string> }> = ({ ids }) => {
  return (
    <List>
      {ids.map((id) => (
        <li key={id} className="tw-text-foreground-light">
          <p>{id}:</p>
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
        <li key={id} className="tw-text-foreground">
          <p>{value}</p>
        </li>
      ))}
    </List>
  );
};

export const Actions: React.FC<{ actions: MenuAction[] }> = ({ actions }) => {
  return (
    <div className="tw-mr-auto">
      <ActionsMenu actions={actions} />
    </div>
  );
};

export const Columns: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return <div className="tw-flex tw-flex-row tw-gap-2">{children}</div>;
};
