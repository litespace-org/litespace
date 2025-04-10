import { PatternInput } from "@/components/PatternInput";
import { CONFIRMATION_CODE_LENGTH } from "@/constants/number";
import { SINGLE_NUMBER_REGEX } from "@/constants/regex";
import { isEqual, isNaN, range } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export const ConfirmationCode: React.FC<{
  code: number;
  disabled: boolean;
  setCode: (code: number) => void;
}> = ({ code, disabled, setCode }) => {
  const [newCode, setNewCode] = useState<string[]>(
    Array(CONFIRMATION_CODE_LENGTH).fill("")
  );
  // State has the index of the focused input
  const [focused, setFocused] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  inputRefs.current = useMemo(
    () =>
      range(CONFIRMATION_CODE_LENGTH).map(
        (_, index) => inputRefs.current[index] ?? null
      ),
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!SINGLE_NUMBER_REGEX.test(e.target.value)) return;
      setNewCode((prev) =>
        prev.map((val, idx) => (idx === focused ? e.target.value : val))
      );
      setFocused((prev) => (prev < 4 ? prev + 1 : 4));
    },
    [focused]
  );

  // Handle backspace key
  const handleBackspace = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Backspace") return;

      if (newCode[focused])
        setNewCode((prev) =>
          prev.map((val, idx) => (idx === focused ? "" : val))
        );

      if (!newCode[focused]) {
        setFocused((prev) => (prev > 0 ? prev - 1 : 0));
        setNewCode((prev) =>
          prev.map((val, idx) => (idx === focused - 1 ? "" : val))
        );
      }
    },
    [focused, newCode]
  );

  // Handle inputs states
  const handleInputsStatus = useCallback(() => {
    const numericalCode = parseInt(newCode.join(""));
    if (!newCode.every((val) => !!val)) return;
    if (isEqual(code, numericalCode)) return "success";
    else return "error";
  }, [code, newCode]);

  // Handle paste code from clipboard
  const handlePaste = useCallback(async () => {
    const text = await navigator.clipboard.readText();
    const copiedCode = text.split("");
    const isValidCode = copiedCode.every((val) => !isNaN(parseFloat(val)));

    if (!isValidCode) return;

    copiedCode.forEach((num, index) => {
      const input = inputRefs.current[index];
      if (!input) return;
      input.value = num.toString();
    });

    setNewCode(() => text.slice(0, 5).split(""));
  }, []);

  useEffect(() => {
    inputRefs.current[focused]?.focus();
    setCode(parseInt(newCode.join("")));
  }, [focused, newCode, setCode]);

  useEffect(() => {
    window.addEventListener("keydown", handleBackspace);

    return () => window.removeEventListener("keydown", handleBackspace);
  }, [handleBackspace]);

  return (
    <div dir="ltr" className="flex gap-4 max-w-full justify-center">
      {range(CONFIRMATION_CODE_LENGTH).map((_, index) => (
        <PatternInput
          key={index}
          ref={(input) => (inputRefs.current[index] = input)}
          onFocus={() => setFocused(index)}
          value={newCode[index]}
          format="#"
          idleDir="ltr"
          size={1}
          alignText="center"
          mask=" "
          state={handleInputsStatus()}
          onChange={(e) => handleInputChange(e)}
          onPaste={() => handlePaste()}
          disabled={disabled}
          className="w-[18px]"
        />
      ))}
    </div>
  );
};

export default ConfirmationCode;
