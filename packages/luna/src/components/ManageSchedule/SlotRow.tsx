import { useFormatMessage } from "@/hooks";
import { Void } from "@litespace/types";
import React, { useCallback, useMemo, useState } from "react";
import dayjs from "@/lib/dayjs";
import Close from "@litespace/assets/Close";
import AddCircle from "@litespace/assets/AddCircle";
import { Typography } from "@/components/Typography";
import { Dayjs } from "dayjs";
import { Select, SelectList } from "@/components/Select";

function asOptions(start: Dayjs, end: Dayjs): SelectList<string> {
  const options: SelectList<string> = [];
  let currentSelection = start;

  while (currentSelection.isBefore(end)) {
    options.push({
      label: currentSelection.format("hh:mm a"),
      value: currentSelection.toISOString(),
    });
    currentSelection = currentSelection.add(30, "minutes");
  }

  options.push({
    label: currentSelection.format("hh:mm a"),
    value: currentSelection.toISOString(),
  });

  return options;
}

const SlotRow: React.FC<{
  day?: string;
  start?: string;
  end?: string;
  remove?: Void;
  add?: (startOfOptions?: string, endOfOptions?: string) => void;
  onFromChange?: (value: string) => void;
  onToChange?: (value: string) => void;
}> = ({ day, start, end, remove, add, onFromChange, onToChange }) => {
  const intl = useFormatMessage();

  const [startOfOptions, setStartOfOptions] = useState<string | undefined>(
    start
  );
  const [endOfOptions, setEndOfOptions] = useState<string | undefined>(end);

  const fromOptions = useMemo(() => {
    const startOfSelection = dayjs(day);
    const endOfSelection = endOfOptions
      ? dayjs(endOfOptions)
      : startOfSelection.add(1, "day");

    return asOptions(startOfSelection, endOfSelection);
  }, [day, endOfOptions]);

  const toOptions = useMemo(() => {
    const startOfSelection = startOfOptions
      ? dayjs(startOfOptions)
      : dayjs(day);
    const endOfSelection = dayjs(day).endOf("day");

    return asOptions(startOfSelection.add(30, "minutes"), endOfSelection);
  }, [day, startOfOptions]);

  const handleFromChange = useCallback(
    (value: string) => {
      setStartOfOptions(value);
      if (!onFromChange) return;
      onFromChange(value);
    },
    [onFromChange]
  );

  const handleToChange = useCallback(
    (value: string) => {
      setEndOfOptions(value);
      if (!onToChange) return;
      onToChange(value);
    },
    [onToChange]
  );

  return (
    <div className="tw-flex tw-items-center tw-gap-6 tw-w-[400px]">
      <div className="tw-flex tw-items-center tw-justify-center tw-gap-4">
        <div className="tw-w-[136px]">
          <Select
            value={startOfOptions}
            options={fromOptions}
            showDropdownIcon={false}
            placeholder={intl("placeholders.from")}
            onChange={handleFromChange}
          />
        </div>
        <Typography
          element="body"
          weight="bold"
          className="tw-text-natural-500"
        >
          -
        </Typography>
        <div className="tw-w-[136px]">
          <Select
            value={endOfOptions}
            options={toOptions}
            showDropdownIcon={false}
            placeholder={intl("placeholders.to")}
            onChange={handleToChange}
          />
        </div>
      </div>

      <div className="tw-flex tw-gap-4">
        {remove ? (
          <button type="button" onClick={remove}>
            <Close />
          </button>
        ) : null}

        {add ? (
          <button
            type="button"
            onClick={() => add(startOfOptions, endOfOptions)}
          >
            <AddCircle className="tw-w-6 tw-h-6" />
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default SlotRow;
