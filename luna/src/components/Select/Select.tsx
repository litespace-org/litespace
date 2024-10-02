import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cn from "classnames";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { SelectList, SelectPlacement } from "@/components/Select/types";

export const Select = <T extends string | number>({
  value,
  placeholder,
  options = [],
  placement = "bottom",
  children,
  onChange,
}: {
  placeholder?: string;
  options?: SelectList<T>;
  value?: T;
  onChange?: (value: T) => void;
  placement?: SelectPlacement;
  children?: React.ReactNode;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<boolean>(false);

  const show = useCallback(() => setOpen(true), []);
  const toggle = useCallback(() => setOpen(!open), [open]);
  const hide = useCallback((e: MouseEvent) => {
    if (!wrapperRef.current) return;

    if (
      e.target instanceof HTMLElement &&
      e.target !== wrapperRef.current &&
      !wrapperRef.current.contains(e.target)
    )
      setOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener("click", hide);
    return () => document.removeEventListener("click", hide);
  }, [hide]);

  const onOptionClick = useCallback(
    (value: T) => {
      setOpen(false);
      if (onChange) return onChange(value);
    },
    [onChange]
  );

  const label = useMemo(() => {
    return options.find((option) => option.value === value)?.label;
  }, [options, value]);

  return (
    <div ref={wrapperRef} className="tw-text-foreground tw-relative">
      {children ? (
        <div
          tabIndex={0}
          onMouseDown={toggle}
          onFocus={show}
          className={cn(
            "tw-cursor-pointer tw-w-full tw-outline-none tw-text-foreground tw-",
            "focus:tw-ring-background-control tw-rounded-md focus:tw-ring-1 focus-visible:tw-border-foreground-muted focus-visible:tw-ring-background-control"
          )}
        >
          {children}
        </div>
      ) : (
        <div
          tabIndex={0}
          className={cn(
            "tw-w-full tw-outline-none tw-text-foreground focus:tw-ring-background-control focus:tw-ring-2 focus-visible:tw-border-foreground-muted focus-visible:tw-ring-background-control",
            "tw-border tw-border-control tw-text-sm tw-px-4 tw-py-2 tw-bg-foreground/[0.026] tw-rounded-md tw-h-[38px]",
            "tw-flex tw-justify-between tw-items-center tw-cursor-pointer"
          )}
          onMouseDown={toggle}
          onFocus={show}
        >
          {label ? (
            <p className="tw-text-foreground">{label}</p>
          ) : (
            <p className="tw-text-foreground-muted tw-select-none">
              {placeholder}
            </p>
          )}

          <div
            data-open={open}
            className={cn(
              "data-[open=true]:tw-rotate-180 tw-transition-transform tw-duration-300"
            )}
          >
            <ChevronDownIcon />
          </div>
        </div>
      )}

      <ul
        data-open={open}
        className={cn(
          "tw-bg-background-overlay tw-border tw-border-control tw-rounded-md tw-z-[1]",
          "tw-flex tw-flex-col tw-gap-2 tw-shadow-2xl tw-w-full",
          "tw-absolute tw-whitespace-nowrap tw-overflow-hidden tw-px-1 tw-py-2",
          "tw-opacity-0 data-[open=true]:tw-opacity-100 tw-transition-all tw-duration-300 invisible data-[open=true]:tw-visible",
          "tw-min-w-[100px]",
          {
            "tw-bottom-[calc(100%+5px)] tw-left-1/2 -tw-translate-x-1/2 data-[open=true]:tw-bottom-[calc(100%+10px)]":
              placement === "top",
            "tw-top-[calc(100%+5px)] tw-left-1/2 -tw-translate-x-1/2 data-[open=true]:tw-top-[calc(100%+10px)]":
              placement === "bottom",
          }
        )}
      >
        {options.map((option) => (
          <li
            tabIndex={0}
            key={option.value}
            className={cn(
              "hover:tw-bg-background-overlay-hover tw-cursor-pointer tw-text-sm tw-px-3 tw-py-2",
              "tw-transition-colors tw-duration-300 tw-rounded-md focus:tw-outline-none focus:tw-ring focus:tw-ring-background-selection",
              "tw-flex tw-flex-row tw-items-center tw-justify-between"
            )}
            onClick={() => onOptionClick(option.value)}
          >
            <p>{option.label}</p>
            {value === option.value ? (
              <CheckIcon className="tw-text-foreground" />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};
