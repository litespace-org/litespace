import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { useFormatMessage } from "@/hooks";
import Send from "@litespace/assets/Send";
import { Input } from "@/components/Input";

type InitialMessage = { id: number; text: string };
export const SendInput: React.FC<{
  initialMessage?: InitialMessage;
  onSubmit: (value: string) => void;
}> = ({ initialMessage, onSubmit }) => {
  const [value, setValue] = useState<string>(initialMessage?.text || "");
  const intl = useFormatMessage();
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);

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
      className="tw-grow focus:tw-outline-none tw-p-[14px] tw-text-natural-950 tw-font-cairo tw-bg-natural-50"
      value={value}
      placeholder={intl("chat.input.placeholder")}
    />
  );
};
export default SendInput;
