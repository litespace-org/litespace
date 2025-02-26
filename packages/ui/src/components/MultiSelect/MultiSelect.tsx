import { MultiSelectOption } from "@/components/MultiSelect/types";
import { Typography } from "@/components/Typography";
import ArrowDown from "@litespace/assets/ArrowDown";
import SearchIcon from "@litespace/assets/Search";
import {
  Content,
  Item,
  Portal,
  Root,
  Trigger,
} from "@radix-ui/react-dropdown-menu";
import cn from "classnames";
import { isEmpty } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { X } from "react-feather";
import React from "react";
import { Tooltip } from "@/components/Tooltip/Tooltip";

export const MultiSelect = <T,>({
  options,
  values = [],
  placeholder,
  error,
  hasSearchIcon = false,
  setValues,
}: {
  options: MultiSelectOption<T>[];
  values?: T[];
  placeholder?: string;
  error?: boolean;
  hasSearchIcon?: boolean;
  setValues?: (values: T[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const selectedOptions = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values]
  );

  const toggleItem = useCallback(
    (optionValue: T) => {
      if (!setValues) return;
      const copy = structuredClone(values);
      // remove
      if (copy.includes(optionValue))
        return setValues(copy.filter((value) => value !== optionValue));

      // add
      setValues(copy.concat(optionValue));
    },
    [setValues, values]
  );

  return (
    <Root open={open} onOpenChange={setOpen}>
      <div className="tw-flex tw-flex-col tw-gap-0">
        <div
          tabIndex={0}
          data-error={!!error}
          data-open={open}
          className={cn(
            "tw-w-full tw-h-14 tw-rounded-lg tw-p-2 tw-transition-colors tw-duration-200",
            "tw-border tw-border-natural-300 hover:tw-border-brand-200 focus:tw-border-brand-500",
            "data-[error=true]:tw-border-destructive-500 data-[error=true]:tw-shadow-ls-x-small data-[error=true]:tw-shadow-[rgba(204,0,0,0.25)]",
            "focus:tw-outline-none focus:tw-shadow-ls-x-small focus:tw-shadow-[rgba(43,181,114,0.25)]",
            "tw-bg-natural-50 hover:tw-bg-brand-50",
            "data-[open=true]:tw-shadow-ls-x-small data-[open=true]:tw-shadow-[rgba(43,181,114,0.25)] data-[open=true]:tw-border-brand-500"
          )}
          onClick={() => setOpen(true)}
        >
          <div className="tw-flex tw-flex-row tw-justify-between tw-items-center tw-gap-2 tw-h-full">
            {hasSearchIcon ? (
              <SearchIcon className="tw-justify-self-start tw-shrink-0" />
            ) : null}
            <div className="tw-h-full tw-flex-1 tw-flex tw-justify-start tw-items-center tw-gap-2">
              {isEmpty(selectedOptions) ? (
                <Typography
                  tag="span"
                  className="tw-flex-1 tw-text-natural-400 tw-text-start"
                >
                  {placeholder}
                </Typography>
              ) : (
                selectedOptions.map(({ label, value }, idx) => {
                  if (idx <= 1)
                    return (
                      <Tooltip
                        side="top"
                        content={<Typography tag="span">{label}</Typography>}
                        key={label}
                      >
                        <div className=" tw-flex tw-justify-center tw-items-center tw-px-[10px] tw-py-2 tw-rounded-full tw-gap-2 tw-bg-brand-700 tw-h-full">
                          <Typography
                            tag="span"
                            className="tw-text-natural-50 tw-max-w-[100px] tw-truncate tw-text-base"
                          >
                            {label}
                          </Typography>
                          <button
                            onClick={() => {
                              if (!setValues) return;
                              const copy = structuredClone(values);
                              setValues(
                                copy.filter(
                                  (optionValue) => optionValue !== value
                                )
                              );
                            }}
                          >
                            <X className="tw-w-4 tw-h-4 tw-stroke-natural-50" />
                          </button>
                        </div>
                      </Tooltip>
                    );

                  if (idx === 2)
                    return (
                      <div
                        key={label}
                        className="tw-flex tw-items-center tw-px-[10px] tw-rounded-full tw-gap-2 tw-bg-brand-700 tw-h-full"
                      >
                        <Typography
                          tag="span"
                          className="tw-text-natural-50 tw-whitespace-nowrap tw-text-base"
                        >
                          {selectedOptions.length - idx} +
                        </Typography>
                      </div>
                    );
                })
              )}
            </div>
            <ArrowDown
              data-open={open}
              className={cn(
                "tw-h-6 tw-w-6 tw-justify-self-end",
                "data-[open=true]:tw-rotate-180 tw-transition-all tw-duration-300"
              )}
            />
          </div>
        </div>
        <Trigger className="tw-w-full" />
      </div>

      <Portal>
        <Content
          align="start"
          side="bottom"
          className={cn(
            "tw-flex tw-flex-col tw-gap-1 tw-w-[var(--radix-dropdown-menu-trigger-width)]",
            "tw-border tw-border-brand-400 tw-rounded-lg tw-p-1",
            "tw-max-h-64 tw-overflow-y-auto tw-bg-natural-50",
            "tw-scrollbar-thin tw-scrollbar-thumb-neutral-200 tw-scrollbar-track-transparent"
          )}
          sideOffset={5}
        >
          {options.map((option) => {
            return (
              <Item
                className={cn(
                  "tw-px-3 tw-flex tw-shrink-0 tw-items-center tw-gap-3 focus:tw-outline-none tw-rounded-md tw-h-14 tw-cursor-pointer",
                  { "hover:tw-bg-natural-100": !values.includes(option.value) },
                  {
                    "tw-bg-brand-700 tw-text-natural-50": values.includes(
                      option.value
                    ),
                  }
                )}
                key={option.label}
                onSelect={(event: Event) => {
                  event.preventDefault();
                  toggleItem(option.value);
                }}
              >
                {option.label}
              </Item>
            );
          })}
        </Content>
      </Portal>
    </Root>
  );
};
