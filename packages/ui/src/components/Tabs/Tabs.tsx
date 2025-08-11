import React from "react";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { Void } from "@litespace/types";

export const Tabs = <T extends string>({
  tab,
  tabs,
  setTab,
}: {
  /**
   * The Id of the current tab
   */
  tab?: T;
  tabs: Array<{
    id: T;
    label: string;
    important?: boolean;
    disabled?: boolean;
  }>;
  setTab: (id: T) => void;
}) => {
  return (
    <div className="border border-natural-200 rounded-xl flex items-center justify-between w-full">
      {tabs.map(({ id, label, important, disabled }) => (
        <Tab
          key={id}
          select={() => setTab(id)}
          active={tab === id}
          label={label}
          important={important}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

const Tab: React.FC<{
  select: Void;
  active: boolean;
  label: string;
  important?: boolean;
  disabled?: boolean;
}> = ({ select, active, label, important, disabled }) => {
  return (
    <button
      type="button"
      className={cn(
        "relative px-1.5 md:px-4 py-[10px] group rounded-xl w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-brand-500",
        "flex items-center justify-center"
      )}
      onClick={select}
      disabled={disabled}
    >
      <Typography
        tag="h6"
        className={cn(
          "relative font-normal text-tiny md:text-body whitespace-nowrap w-fit",
          active
            ? "text-brand-700"
            : "text-natural-500 group-hover:text-brand-500 group-active:text-brand-700"
        )}
      >
        {label}
        {important ? <Important /> : null}
      </Typography>
    </button>
  );
};

const Important: React.FC = () => {
  return (
    <div className="absolute -top-1 right-0 bg-destructive-600 w-1 h-1 rounded-full" />
  );
};

export default Tabs;
