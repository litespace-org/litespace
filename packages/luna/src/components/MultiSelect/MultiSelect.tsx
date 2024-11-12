import React, { useCallback, useEffect, useState } from "react";
import cn from "classnames";
import { ChevronDown, ChevronUp, Search, X } from "react-feather";
import { Checkbox } from "../Checkbox";

type MultiSelectOption = {
  label: string;
  value: string | number;
};

export const Option: React.FC<{
  option: MultiSelectOption;
  checked: boolean;
  check: (value: string | number) => void;
  unCheck: (value: string | number) => void;
}> = ({ option, checked, check, unCheck }) => {
  const handleCheck = () => {
    if (checked) {
      unCheck(option.value);
    } else {
      check(option.value);
    }
  };

  return (
    <Checkbox
      containerClassName="hover:tw-bg-natural-100 tw-rounded-sm tw-duration-300"
      onCheckedChange={handleCheck}
      label={option.label}
      checked={checked}
    />
  );
};

export const MultiSelect: React.FC<{
  label: string;
  placeholder?: string;
  disabled?: boolean;
  options: MultiSelectOption[];
  initialValues?: (string | number)[];
  onChange?: (newValues: (string | number)[]) => void;
}> = ({ label, placeholder, disabled, options, initialValues, onChange }) => {
  const [active, setActive] = useState<boolean>(false);
  const [values, setValues] = useState<(string | number)[]>(
    initialValues || []
  );
  const openMenu = useCallback(() => setActive(true), []);
  const closeMenu = useCallback(() => setActive(false), []);

  const toggleMenu = useCallback(() => {
    if (active) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [closeMenu, openMenu, active]);

  const chooseItem = useCallback(
    (item: string | number) => {
      if (disabled) return;
      console.log("choosing: ", item);
      setValues((prev) => [...prev, item]);
    },
    [disabled]
  );

  const unChooseItem = useCallback(
    (item: string | number) => {
      if (disabled) return;
      setValues((prev) => prev.filter((opt) => opt !== item));
    },
    [disabled]
  );

  useEffect(() => {
    if (!onChange) return;
    onChange(values);
  }, [values, onChange]);

  return (
    <div className="tw-relative tw-min-w-40 tw-max-w-80">
      <label className="tw-text-neutral-950 tw-text-[20px]">{label}</label>
      <div
        role="listbox"
        onClick={toggleMenu}
        tabIndex={1}
        className={cn(
          "tw-flex tw-gap-2 tw-mt-2 tw-justify-center tw-items-center tw-duration-300",
          "tw-border tw-border-natural-300 tw-bg-natural-50 tw-p-[14px] tw-rounded-lg",
          "hover:tw-border-natural-200 active:tw-border-brand-500 active:tw-shadow-sm active:tw-shadow-brand-500/25",
          values.length > 0 && "tw-border-natural-300",
          disabled && "tw-opacity-50 tw-pointer-events-none"
        )}
      >
        <Search className="tw-text-natural-800" />
        <div
          className={cn(
            "tw-grow tw-text-natural-400 tw-cursor-default tw-select-none tw-text-base",
            values.length > 0 && "tw-text-natural-950"
          )}
        >
          {values.length > 0 ? (
            <div className="tw-flex tw-items-center tw-gap-1 tw-flex-wrap">
              {values.slice(0, 2).map((value) => (
                <div className="tw-bg-brand-700 tw-rounded-xl tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-natural-50 tw-whitespace-nowrap">
                  {options.find((opt) => opt.value === value)?.label}
                  <button onClick={() => unChooseItem(value)}>
                    <X className="tw-w-4 tw-h-4 hover:tw-text-natural-300 tw-duration-200" />
                  </button>
                </div>
              ))}
              {values.length > 2 ? (
                <p className="tw-bg-brand-700 tw-rounded-xl tw-flex tw-items-center tw-gap-1 tw-px-2 tw-py-1 tw-text-natural-50">
                  +{values.length - 2}
                </p>
              ) : null}
            </div>
          ) : (
            <p>{placeholder || ""}</p>
          )}
        </div>
        {active ? (
          <ChevronUp className="tw-text-natural-800 hover:tw-bg-natural-100 tw-rounded-full tw-cursor-pointer" />
        ) : (
          <ChevronDown className="tw-text-natural-800 hover:tw-bg-natural-100 tw-rounded-full tw-cursor-pointer" />
        )}
      </div>
      {active ? (
        <div
          className={cn(
            "tw-absolute tw-z-10 -tw-bottom-2 tw-translate-y-full",
            "tw-border tw-border-brand-400 tw-w-full",
            "tw-p-4 tw-rounded-lg"
          )}
        >
          {options.map((option) => (
            <Option
              checked={!!values.find((value) => value === option.value)}
              option={option}
              check={chooseItem}
              unCheck={unChooseItem}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};
