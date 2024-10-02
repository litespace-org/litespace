import React, { useCallback, useMemo } from "react";
import { Select, SelectList } from "@/components/Select";

const Speed: React.FC<{ set: (rate: number) => void; rate: number }> = ({
  set,
  rate,
}) => {
  const options: SelectList<number> = useMemo(() => {
    return [
      { label: "0.25", value: 0.25 },
      { label: "0.5", value: 0.5 },
      { label: "0.75", value: 0.75 },
      { label: "1", value: 1 },
      { label: "1.25", value: 1.25 },
      { label: "1.50", value: 1.5 },
      { label: "1.75", value: 1.75 },
      { label: "2", value: 2 },
    ];
  }, []);

  const onChange = useCallback(
    (rate: number) => {
      set(rate);
    },
    [set]
  );

  return (
    <div>
      <div className="tw-text-foreground">
        <Select
          onChange={onChange}
          options={options}
          placement="top"
          value={rate}
        >
          <span className="tw-text-white tw-inline-block tw-px-2">{rate}x</span>
        </Select>
      </div>
    </div>
  );
};

export default Speed;
