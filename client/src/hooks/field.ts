import { useCallback, useState } from "react";

export function useField<T>({
  initial,
  verify,
}: {
  initial: T;
  verify: (value: T) => [valid: boolean, error: string];
}) {
  const [value, set] = useState<T>(initial);
  const [error, setError] = useState<string | null>(null);
  const [valid, setValid] = useState<boolean | null>();

  const update = useCallback(
    (next: T) => {
      set(next);
      const [valid, error] = verify(next);
      setValid(valid);
      setError(valid ? null : error);
    },
    [verify]
  );

  return {
    value,
    update,
    error,
    valid,
  };
}
