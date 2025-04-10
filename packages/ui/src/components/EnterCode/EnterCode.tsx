import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PatternInput } from "@/components/PatternInput";
import { range } from "lodash";

export const EnterCode: React.FC<{
  code: number;
  autoValidate?: boolean;
  setCode: (value: number) => void;
}> = ({ code, autoValidate = false, setCode }) => {
  const [newCode, setNewCode] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useMemo(() => {
    inputRefs.current = range(5).map(
      (_, index) => inputRefs.current[index] ?? null
    );
  }, []);

  // Reset all inputs and clear state
  const resetCode = useCallback(() => {
    inputRefs.current.forEach((ref) => {
      if (ref) ref.value = "";
    });
    if (inputRefs.current[0]) inputRefs.current[0].focus();
    setNewCode("");
  }, [inputRefs]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const input = e.target;
      const code = [...newCode];
      code[index] = input.value;
      setNewCode(code.join(""));
    },
    [newCode]
  );

  const setInputStatus = useCallback(() => {
    if (!autoValidate) return;
    if (newCode.length === 5 && code !== parseInt(newCode)) return "error";
    if (code === parseInt(newCode)) return "success";
  }, [autoValidate, code, newCode]);

  // Handle backspace key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Backspace") inputRefs.current[newCode.length - 1]?.focus();
    },
    [newCode.length]
  );

  useEffect(() => {
    inputRefs.current[newCode.length]?.focus();
    if (autoValidate && newCode.length === 5) setCode(parseInt(newCode));
  }, [autoValidate, newCode, setCode]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Reset code in each render
  useEffect(() => {
    resetCode();
  }, []); //eslint-disable-line

  return (
    <div style={{ direction: "ltr" }} className="flex gap-4">
      {range(5).map((_, index) => (
        <PatternInput
          key={index}
          ref={(input) => (inputRefs.current[index] = input)}
          value={newCode[index]}
          format="#"
          idleDir="ltr"
          size={1}
          alignText="center"
          mask=" "
          state={setInputStatus()}
          onChange={(e) => handleInputChange(e, index)}
          disabled={index > newCode.length || index < newCode.length - 1}
        />
      ))}
    </div>
  );
};

export default EnterCode;
