import { Checkbox } from "@/components/Checkbox";
import { MultiSelectOption } from "@/components/MultiSelect/types";
import { Tooltip } from "@/components/Tooltip/Tooltip";
import { Typography } from "@/components/Typography";
import ChevronDown from "@litespace/assets/ChevronDown";
import CloseCircle from "@litespace/assets/CloseCircle";
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
import React, { useCallback, useMemo, useState } from "react";

export const MultiSelect = <T,>({
  options,
  values = [],
  placeholder,
  error,
  hasSearchIcon = false,
  label,
  setValues,
}: {
  options: MultiSelectOption<T>[];
  values?: T[];
  placeholder?: string;
  error?: boolean;
  hasSearchIcon?: boolean;
  label?: string;
  setValues?: (values: T[]) => void;
}) => {
  const [offset, setOffset] = useState(5);
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
      <div className="flex flex-col">
        <Typography
          tag="p"
          className="text-caption font-semibold text-natural-950 mb-1"
        >
          {label}
        </Typography>
        <div
          tabIndex={0}
          data-error={!!error}
          data-open={open}
          className={cn(
            "w-full rounded-lg p-2 transition-colors duration-200",
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
            <div className="h-full flex-1 flex justify-start items-center gap-2 flex-wrap">
              {isEmpty(selectedOptions) ? (
                <Typography
                  tag="span"
                  className="flex-1 text-natural-400 text-start"
                >
                  {placeholder}
                </Typography>
              ) : (
                selectedOptions.map(({ label, value }, idx) => {
                  return (
                    <Tooltip
                      side="top"
                      content={<Typography tag="span">{label}</Typography>}
                      key={[label, idx].join("")}
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="selected border border-brand-500 flex justify-center items-center px-2 py-1 rounded-full gap-2 bg-brand-50 h-full"
                      >
                        <Typography
                          tag="span"
                          className="text-brand-500 max-w-[100px] truncate text-tiny"
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
                          <CloseCircle className="w-4 h-4 [&>*]:stroke-brand-500 [&>*]:stroke-[1.5px]" />
                        </button>
                      </div>
                    </Tooltip>
                  );
                })
              )}
            </div>
            <ChevronDown
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
            "border border-brand-400 rounded-lg",
            "max-h-64 overflow-y-auto bg-natural-50",
            "scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent",
            "translate-y-[calc(var(--radix-dropdown-menu-trigger-height) + 5px)]"
          )}
          sideOffset={offset}
        >
          {options.map((option, idx) => {
            return (
              <Item
                className={cn(
                  "px-2 py-2 flex shrink-0 items-center gap-3 focus:outline-none rounded-md _h-14 cursor-pointer",
                  { "hover:bg-natural-100": !values.includes(option.value) }
                )}
                key={[option.label, idx].join("")}
                onSelect={(event: Event) => {
                  event.preventDefault();
                  setOffset(5);
                  toggleItem(option.value);
                }}
              >
                <Checkbox
                  label={option.label}
                  checked={values.includes(option.value)}
                />
              </Item>
            );
          })}
        </Content>
      </Portal>
    </Root>
  );
};
