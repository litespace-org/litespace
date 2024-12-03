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
import { useMemo } from "react";
import { X } from "react-feather";

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
  const labels = useMemo(
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
          "tw-h-14 tw-rounded-lg tw-p-2 tw-transition-colors tw-duration-200",
          "tw-border tw-border-natural-300 hover:tw-border-brand-200 focus:tw-border-brand-500",
          "data-[error=true]:tw-border-destructive-500 data-[error=true]:tw-shadow-ls-small data-[error=true]:tw-shadow-[rgba(204,0,0,0.25)]",
          "focus:tw-outline-none focus:tw-shadow-ls-small focus:tw-shadow-[rgba(43,181,114,0.25)]",
          "tw-bg-natural-50 hover:tw-bg-brand-50",
          "[--radix-dropdown-menu-content-available-width:1rem]",
          "data-[state=open]:tw-shadow-ls-small data-[state=open]:tw-shadow-[rgba(43,181,114,0.25)] data-[state=open]:tw-border-brand-500"
        )}
      >
        <div className="tw-flex tw-flex-row tw-justify-between tw-items-center tw-gap-2">
          <SearchIcon className="tw-justify-self-start" />
          <div className="tw-h-full tw-flex-1 tw-flex tw-justify-start tw-items-center tw-gap-2">
            {isEmpty(labels) ? (
              <Typography className="tw-flex-1 tw-text-natural-400">
                {placeholder}
              </Typography>
            ) : (
              labels?.map((label, index, labelsArr) => {
                if (index <= 1)
                  return (
                    <div
                      key={label}
                      className="tw-flex tw-items-center tw-px-[10px] tw-rounded-full tw-gap-2 tw-bg-brand-700 tw-h-full"
                    >
                      <Typography element="body" className="tw-text-natural-50">
                        {label}
                      </Typography>
                      <button
                        onClick={() => {
                          if (!setValues) return;
                          const copy = structuredClone(values);
                          const selectedOptions = options.filter((opt) =>
                            copy.includes(opt.value)
                          );
                          setValues(selectedOptions.map((opt) => opt.value));
                        }}
                      >
                        <X size={12} color="white" />
                      </button>
                    </div>
                  );
                if (index === 2)
                  return (
                    <div
                      key={label}
                      className="tw-flex tw-items-center tw-px-[10px] tw-rounded-full tw-gap-2 tw-bg-brand-700 tw-h-full"
                    >
                      <Typography element="body" className="tw-text-natural-50">
                        {labelsArr.length - index} +
                      </Typography>
                    </div>
                  );
              })
            )}
          </div>
          <ArrowDown className="tw-justify-self-end" />
        </div>
      </Trigger>

      <Portal>
        <Content
          align="start"
          side="bottom"
          className="tw-flex tw-flex-col tw-gap-1 tw-w-[var(--radix-dropdown-menu-trigger-width)] tw-border tw-border-brand-400 tw-rounded-lg"
          sideOffset={12}
        >
          {options.map((option) => {
            return (
              <Item
                className={cn(
                  "tw-px-3 tw-flex tw-items-center tw-gap-3 focus:tw-outline-none tw-rounded-md tw-h-14",
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
                {option.label}
              </Item>
            );
          })}
        </Content>
      </Portal>
    </Root>
  );
};
