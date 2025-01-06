import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useFormatMessage } from "@/hooks";
import Send from "@litespace/assets/Send";
import { Input } from "@/components/Input";
import { Void } from "@litespace/types";

type InitialMessage = { id: number; text: string };
export const SendInput: React.FC<{
  initialMessage?: InitialMessage;
  onSubmit: (value: string) => void;
  typeMessage?: Void;
}> = ({ initialMessage, onSubmit, typeMessage }) => {
  const [value, setValue] = useState<string>(initialMessage?.text || "");
  const intl = useFormatMessage();
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      typeMessage ? typeMessage() : null;
    },
    [typeMessage]
  );

  const handleSubmit = useCallback(() => {
    if (value === "") return;
    setValue("");
    onSubmit(value);
  }, [onSubmit, value]);

  const handleSubmitByEnter = useCallback(
    (e: KeyboardEvent) => e.key === "Enter" && handleSubmit(),
    [handleSubmit]
  );

  useEffect(() => {
    document.addEventListener("keypress", handleSubmitByEnter);
    return () => document.removeEventListener("keypress", handleSubmitByEnter);
  }, [handleSubmitByEnter]);

  return (
    <Input
      endActions={[
        {
          id: 1,
          Icon: Send,
          onClick: handleSubmit,
        },
      ]}
      onChange={handleChange}
      autoFocus
      value={value}
      placeholder={intl("chat.input.placeholder")}
    />
  );
};
export default SendInput;
