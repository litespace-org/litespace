import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useFormatMessage } from "@/hooks";
import Send from "@litespace/assets/Send";
import { Input } from "@/components/Input";
import { Void } from "@litespace/types";
import { throttle } from "lodash";

type InitialMessage = { id: number; text: string };

export const SendInput: React.FC<{
  initialMessage?: InitialMessage;
  onSubmit: (value: string) => void;
  /**
   * wss event fired when a user is typing
   */
  typeMessage?: Void;
}> = ({ initialMessage, onSubmit, typeMessage }) => {
  const [value, setValue] = useState<string>(initialMessage?.text || "");
  const intl = useFormatMessage();

  const throttledTyping = useMemo(() => {
    return throttle(() => {
      if (typeMessage) typeMessage();
    }, 750);
  }, [typeMessage]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      throttledTyping();
    },
    [throttledTyping]
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
    document.addEventListener("keydown", handleSubmitByEnter);
    return () => document.removeEventListener("keydown", handleSubmitByEnter);
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
