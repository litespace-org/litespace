import React, { useEffect, useState } from "react";
import { Input } from "@/components/Input";
import { Duration } from "@litespace/sol/duration";

export const DurationInput: React.FC<{
  value?: Duration;
  onChange?: (duration: Duration) => void;
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
}> = ({ value, onChange, placeholder, error, disabled }) => {
  const [rawValue, setRawValue] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!focused) setRawValue(value?.format() || "");
  }, [focused, , value]);

  return (
    <Input
      onChange={(event) => {
        const value = event.target.value;
        if (onChange) onChange(Duration.from(value));
        setRawValue(value);
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      value={focused ? rawValue : value?.format() || ""}
      placeholder={placeholder}
      error={error}
      disabled={disabled}
    />
  );
};
