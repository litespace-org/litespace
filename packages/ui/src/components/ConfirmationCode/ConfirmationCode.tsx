import { PatternInput } from "@/components/PatternInput";
import { SINGLE_NUMBER_REGEX } from "@/constants/regex";
import {
  CONFIRMATION_CODE_DIGIT_COUNT,
  isValidConfirmationCode,
} from "@litespace/utils";
import { range } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHotkeys } from "react-hotkeys-hook";

export const ConfirmationCode: React.FC<{
  disabled: boolean;
  autoFocus?: boolean;
  setCode: (code: number) => void;
}> = ({ disabled, setCode }) => {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [digits, setDigits] = useState<string[]>([]);
  // State has the index of the focused input
  const [focused, setFocused] = useState(-1);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focus = useCallback((index: number) => {
    const input = inputRefs.current[index];
    if (!input) return;
    input.focus();
    setFocused(index);
  }, []);

  const setDigit = useCallback((digit: string, index: number) => {
    if (index >= CONFIRMATION_CODE_DIGIT_COUNT || index < 0) return;
    setDigits((prev) => {
      const cloned = structuredClone(prev);
      cloned[index] = digit;
      return cloned;
    });
  }, []);

  const isValidCode = useCallback((digits: string[]) => {
    const value = Number(digits.join(""));
    return isValidConfirmationCode(value);
  }, []);

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const value = e.target.value;
      if (!SINGLE_NUMBER_REGEX.test(value)) return;
      setDigit(value, index);
      focus(index + 1);
    },
    [focus, setDigit]
  );

  useHotkeys(
    "backspace",
    () => {
      setDigit("", focused);
      focus(focused - 1);
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
    },
    [focused, setDigit, focus]
  );

  const onPaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    const copiedCode = text.split("");
    const valid = isValidCode(copiedCode);
    if (!valid) return;

    copiedCode.forEach((digit, index) => {
      const input = inputRefs.current[index];
      if (!input) return;
      input.value = digit.toString();
    });

    const value = text.slice(0, CONFIRMATION_CODE_DIGIT_COUNT).split("");
    const length = value.length;
    focus(length - 1);
    setDigits(value);
  }, [focus, isValidCode]);

  const code = useMemo(() => {
    if (!isValidCode(digits)) return null;
    return Number(digits.join(""));
  }, [digits, isValidCode]);

  useEffect(() => {
    if (code && !submitted && !disabled) {
      setCode(code);
      setSubmitted(true);
    }
  }, [code, disabled, setCode, submitted]);

  useEffect(() => {
    if (!code) setSubmitted(false);
  }, [code]);

  return (
    <div dir="ltr" className="flex gap-4 max-w-full justify-center">
      {range(CONFIRMATION_CODE_DIGIT_COUNT).map((_, index) => (
        <PatternInput
          key={index}
          autoFocus={index === 0}
          ref={(input) => (inputRefs.current[index] = input)}
          onFocus={() => {
            const input = inputRefs.current[index];
            if (input) input.select();
            setFocused(index);
          }}
          value={digits[index] || ""}
          format="#"
          idleDir="ltr"
          size={1}
          mask=" "
          onChange={(e) => onChange(e, index)}
          onPaste={onPaste}
          disabled={disabled}
          className="w-[18px] text-center"
        />
      ))}
    </div>
  );
};

export default ConfirmationCode;
