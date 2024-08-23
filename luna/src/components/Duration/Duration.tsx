import React, { useEffect, useState } from "react";
import { Input } from "@/components/Input";
import { Duration, UnitMap, UnitMapShort } from "@litespace/sol";

export const DurationInput: React.FC<{
  value?: Duration;
  onChange?: (duration: Duration) => void;
  labels: { short: UnitMapShort; long: UnitMap };
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
}> = ({ value, onChange, labels, placeholder, error, disabled }) => {
  const [rawValue, setRawValue] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!focused) setRawValue(value?.formatShort(labels.short) || "");
  }, [focused, labels.short, value]);

  return (
    <Input
      onChange={(raw) => {
        if (onChange) onChange(Duration.from(raw));
        setRawValue(raw);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      value={focused ? rawValue : value?.format(labels.long) || ""}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
    />
  );
};
