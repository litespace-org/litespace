import { useMemo } from "react";
import {
  Item,
  Portal,
  Root,
  Trigger,
  Content,
} from "@radix-ui/react-dropdown-menu";
import SearchIcon from "@litespace/assets/Search";
import ArrowDown from "@litespace/assets/ArrowDown";
import { MultiSelectOption } from "@/components/MultiSelect/types";
import Checkbox from "@/components/Checkbox/CheckboxV2";
import { Typography } from "@/components/Typography";
import cn from "classnames";
import { isEmpty } from "lodash";

export const MultiSelect = <T,>({
  options,
  values,
  placeholder,
  error,
  setValues,
}: {
  options: MultiSelectOption<T>[];
  values: T[];
  placeholder?: string;
  error?: boolean;
  setValues?: (values: T[]) => void;
}) => {
  const lables = useMemo(
    () =>
      options
        .filter((option) => values.includes(option.value))
        .map((option) => option.label),
    [options, values]
  );

  return (
    <Root>
      <Trigger
        asChild
        tabIndex={0}
        data-error={!!error}
        className={cn(
          "tw-h-14 tw-rounded-lg tw-p-[0.875rem] tw-transition-colors tw-duration-200",
          "tw-border tw-border-natural-300 hover:tw-border-brand-200 focus:tw-border-brand-500",
          "data-[error=true]:tw-border-destructive-500 data-[error=true]:tw-shadow-ls-small data-[error=true]:tw-shadow-[rgba(204,0,0,0.25)]",
          "focus:tw-outline-none focus:tw-shadow-ls-small focus:tw-shadow-[rgba(43,181,114,0.25)]",
          "tw-bg-natural-50 hover:tw-bg-brand-50",
          "[--radix-dropdown-menu-content-available-width:1rem]",
          "data-[state=open]:tw-shadow-ls-small data-[state=open]:tw-shadow-[rgba(43,181,114,0.25)] data-[state=open]:tw-border-brand-500"
        )}
      >
        <div className="tw-flex tw-flex-row tw-justify-between tw-gap-2">
          <SearchIcon />
          {isEmpty(lables) ? (
            <Typography className="tw-flex-1 tw-text-natural-400">
              {placeholder}
            </Typography>
          ) : (
            <Typography className="tw-truncate tw-w-4/5 tw-flex-1">
              {lables.join(" - ")}
            </Typography>
          )}
          <ArrowDown />
        </div>
      </Trigger>

      <Portal>
        <Content
          align="start"
          side="bottom"
          className="tw-w-[var(--radix-dropdown-menu-trigger-width)] tw-border tw-border-brand-400 tw-rounded-lg"
          sideOffset={12}
        >
          {options.map((option) => {
            return (
              <Item
                className="tw-w- tw-flex tw-items-center tw-gap-3 hover:tw-bg-natural-100 focus:tw-outline-none tw-rounded-md tw-h-14"
                key={option.label}
                onSelect={(event: Event) => {
                  event.preventDefault();
                  if (!setValues) return;
                  const copy = structuredClone(values);
                  // remove
                  if (copy.includes(option.value))
                    return setValues(
                      copy.filter((value) => value !== option.value)
                    );

                  // add
                  setValues(copy.concat(option.value));
                }}
              >
                <Checkbox checked={values.includes(option.value)} />
                {option.label}
              </Item>
            );
          })}
        </Content>
      </Portal>
    </Root>
  );
};
