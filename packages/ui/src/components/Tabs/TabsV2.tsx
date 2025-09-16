import { Typography } from "@/components/Typography";
import { useMediaQuery } from "@litespace/headless/mediaQuery";
import { Void } from "@litespace/types";
import cn from "classnames";
import React, { SVGProps } from "react";

export const TabsV2 = <T extends string>({
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
    Icon?: React.MemoExoticComponent<
      (props: SVGProps<SVGSVGElement>) => JSX.Element
    >;
    important?: boolean;
    disabled?: boolean;
  }>;
  setTab: (id: T) => void;
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between w-full border border-natural-200 rounded-xl bg-natural-100">
      {tabs.map(({ id, label, Icon, important, disabled }) => (
        <Tab
          key={id}
          select={() => setTab(id)}
          active={tab === id}
          Icon={Icon}
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
  Icon?: React.MemoExoticComponent<
    (props: SVGProps<SVGSVGElement>) => JSX.Element
  >;
  label: string;
  important?: boolean;
  disabled?: boolean;
}> = ({ select, active, Icon, label, important, disabled }) => {
  return (
    <button
      type="button"
      className={cn(
        "relative px-1 sm:px-3 lg:px-4 py-[10px] group rounded-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0 focus-visible:ring-brand-500",
        "flex items-center justify-center",
        { "bg-natural-50 rounded-xl": active },
        // First item should have more space before
        // Last item should have more space after only for being more acceptable
        {
          "first-of-type:ms-4 last-of-type:me-4 sm:first-of-type:ms-0 sm:last-of-type:me-0":
            !active,
        }
      )}
      onClick={select}
      disabled={disabled}
    >
      <div className="relative flex gap-1 items-center">
        {Icon ? (
          <Icon
            className={cn(
              "w-4 h-4 [&>*]:fill-transparent",
              active ? "[&>*]:stroke-brand-500" : "[&>*]:stroke-natural-700"
            )}
          />
        ) : null}
        <Label active={active} label={label} />

        {important ? <Important /> : null}
      </div>
    </button>
  );
};

const Label: React.FC<{ active: boolean; label: string }> = ({
  active,
  label,
}) => {
  const { md } = useMediaQuery();

  if (!active && !md) return null;

  return (
    <Typography
      tag="h6"
      className={cn(
        "relative font-normal md:font-medium text-tiny whitespace-nowrap w-fit",
        active
          ? "text-brand-500"
          : "text-natural-500 group-hover:text-brand-500 group-active:text-brand-700"
      )}
    >
      {label}
    </Typography>
  );
};

const Important: React.FC = () => {
  return (
    <div className="absolute -top-1 right-0 bg-destructive-600 w-1 h-1 rounded-full" />
  );
};

export default TabsV2;
