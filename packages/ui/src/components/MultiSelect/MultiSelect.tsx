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
      <div className="flex flex-col gap-0">
        <div
          tabIndex={0}
          data-error={!!error}
          data-open={open}
          className={cn(
            "w-full h-14 rounded-lg p-2 transition-colors duration-200",
            "border border-natural-300 hover:border-brand-200 focus:border-brand-500",
            "data-[error=true]:border-destructive-500 data-[error=true]:shadow-ls-x-small data-[error=true]:shadow-[rgba(204,0,0,0.25)]",
            "focus:outline-none focus:shadow-ls-x-small focus:shadow-[rgba(43,181,114,0.25)]",
            "bg-natural-50 hover:bg-brand-50",
            "data-[open=true]:shadow-ls-x-small data-[open=true]:shadow-[rgba(43,181,114,0.25)] data-[open=true]:border-brand-500"
          )}
          onClick={() => setOpen(true)}
        >
          <div className="flex flex-row justify-between items-center gap-2 h-full">
            {hasSearchIcon ? (
              <SearchIcon className="justify-self-start shrink-0" />
            ) : null}
            <div className="h-full flex-1 flex justify-start items-center gap-2">
              {isEmpty(selectedOptions) ? (
                <Typography
                  tag="span"
                  className="flex-1 text-natural-400 text-start"
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
                        <div className=" flex justify-center items-center px-[10px] py-2 rounded-full gap-2 bg-brand-700 h-full">
                          <Typography
                            tag="span"
                            className="text-natural-50 max-w-[100px] truncate text-base"
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
                            <X className="w-4 h-4 stroke-natural-50" />
                          </button>
                        </div>
                      </Tooltip>
                    );

                  if (idx === 2)
                    return (
                      <div
                        key={label}
                        className="flex items-center px-[10px] rounded-full gap-2 bg-brand-700 h-full"
                      >
                        <Typography
                          tag="span"
                          className="text-natural-50 whitespace-nowrap text-base"
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
                "h-6 w-6 justify-self-end",
                "data-[open=true]:rotate-180 transition-all duration-300"
              )}
            />
          </div>
        </div>
        <Trigger className="w-full" />
      </div>

      <Portal>
        <Content
          align="start"
          side="bottom"
          className={cn(
            "flex flex-col gap-1 w-[var(--radix-dropdown-menu-trigger-width)]",
            "border border-brand-400 rounded-lg p-1",
            "max-h-64 overflow-y-auto bg-natural-50",
            "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent"
          )}
          sideOffset={5}
        >
          {options.map((option) => {
            return (
              <Item
                className={cn(
                  "px-3 flex shrink-0 items-center gap-3 focus:outline-none rounded-md h-14 cursor-pointer",
                  { "hover:bg-natural-100": !values.includes(option.value) },
                  {
                    "bg-brand-700 text-natural-50": values.includes(
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
