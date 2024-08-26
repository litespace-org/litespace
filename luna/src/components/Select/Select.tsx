import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { SelectList } from "@/components/Select/types";

export const Select = <T extends string | number>({
  value,
  placeholder,
  options = [],
  onChange,
}: {
  placeholder?: string;
  options?: SelectList<T>;
  value?: T;
  onChange?: (value: T) => void;
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
    <div ref={wrapperRef} className="text-foreground relative">
      <div
        tabIndex={0}
        className={cn(
          "w-full outline-none text-foreground focus:ring-background-control focus:ring-2 focus-visible:border-foreground-muted focus-visible:ring-background-control",
          "border border-control text-sm px-4 py-2 bg-foreground/[0.026] rounded-md h-[38px]",
          "flex justify-between items-center cursor-pointer"
        )}
        onMouseDown={toggle}
        onFocus={show}
      >
        {label ? (
          <p className="text-foreground">{label}</p>
        ) : (
          <p className="text-foreground-muted select-none">{placeholder}</p>
        )}

        <div
          data-open={open}
          className={cn(
            "data-[open=true]:rotate-180 transition-transform duration-300"
          )}
        >
          <ChevronDownIcon />
        </div>
      </div>

      <ul
        data-open={open}
        className={cn(
          "bg-background-overlay border border-overlay rounded-md z-[1]",
          "flex flex-col gap-2 shadow-2xl w-full",
          "absolute whitespace-nowrap top-[calc(100%+5px)] left-1/2 -translate-x-1/2 overflow-hidden px-1 py-2",
          "opacity-0 data-[open=true]:opacity-100 transition-all duration-300 data-[open=true]:top-[calc(100%+10px)] invisible data-[open=true]:visible"
        )}
      >
        {options.map((option) => (
          <li
            tabIndex={0}
            key={option.value}
            className={cn(
              "hover:bg-background-overlay-hover cursor-pointer text-sm px-3 py-2",
              "transition-colors duration-300 rounded-md focus:outline-none focus:ring focus:ring-selection",
              "flex flex-row items-center justify-between"
            )}
            onClick={() => onOptionClick(option.value)}
          >
            <p>{option.label}</p>
            {value === option.value ? (
              <CheckIcon className="text-foreground" />
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};
