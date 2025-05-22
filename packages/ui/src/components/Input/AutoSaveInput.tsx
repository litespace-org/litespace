import React, { useEffect, useMemo, useRef } from "react";
import { Input, InputProps } from "@/components/Input/Input";
import Spinner2 from "@litespace/assets/Spinner2";
import ExclaimationMarkCircle from "@litespace/assets/ExclaimationMarkCircle";
import { debounce } from "lodash";
import Check4 from "@litespace/assets/Check4";

export const AutoSaveInput: React.FC<
  InputProps & {
    isSuccess?: boolean;
    isError?: boolean;
    isPending?: boolean;
    saveDuration?: number;
    onSave?: (value: string) => void;
  }
> = ({
  saveDuration = 500,
  onChange,
  onSave,
  isError,
  isPending,
  isSuccess,
  ...props
}) => {
  const onSaveRef = useRef<((value: string) => void) | undefined>(onSave);
  const debouncedSave = useRef(
    debounce((value: string) => {
      if (onSaveRef.current) onSaveRef.current(value);
    }, saveDuration)
  ).current;

  // cancel saving if component unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const icon = useMemo(() => {
    if (isSuccess) return <Check4 className="w-4 h-4" />;
    if (isError) return <ExclaimationMarkCircle className="w-4 h-4" />;
    if (isPending) return <Spinner2 className="w-4 h-4 animate-spin" />;
  }, [isError, isPending, isSuccess]);

  // Wrap original onChange to trigger debounced handler after it
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (debouncedSave) debouncedSave(e.target.value);
  };

  return (
    <Input
      endAction={{
        id: 1,
        icon,
        className: "cursor-not-allowed",
      }}
      onChange={handleChange}
      {...props}
    />
  );
};
