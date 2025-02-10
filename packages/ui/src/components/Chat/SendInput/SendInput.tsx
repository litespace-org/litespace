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
   * wss event fired when the user is typing
   */
  typingMessage?: Void;
  disabled?: boolean;
}> = ({ initialMessage, onSubmit, typingMessage, disabled }) => {
  const [value, setValue] = useState<string>(initialMessage?.text || "");
  const intl = useFormatMessage();

  const throttledTyping = useMemo(() => {
    return throttle(() => {
      if (typingMessage) typingMessage();
    }, 750);
  }, [typingMessage]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      throttledTyping();
    },
    [throttledTyping]
  );

  const handleSubmit = useCallback(() => {
    if (value === "" || disabled) return;
    setValue("");
    onSubmit(value);
  }, [onSubmit, value, disabled]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => e.key === "Enter" && handleSubmit(),
    [handleSubmit]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  return (
    <Input
      disabled={disabled}
      endAction={{
        id: 1,
        icon: <Send className="tw-w-4 tw-h-4" />,
        onClick: handleSubmit,
      }}
      onChange={handleChange}
      value={value}
      placeholder={intl("chat.input.placeholder")}
      autoFocus
    />
  );
};
export default SendInput;
