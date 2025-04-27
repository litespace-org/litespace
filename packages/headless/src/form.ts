import { entries, isEmpty } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";

type Config<T extends object> = {
  defaults: T;
  onSubmit: (data: T) => void;
  validators?: Validators<T>;
};

export type Validators<T extends object> = {
  [K in keyof T]?: (value: T[K]) => true | string;
};

export type ErrorMap<T extends object> = { [key in keyof T]?: string };

export function useForm<T extends object>(config: Config<T>) {
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  });

  const [state, setState] = useState<T>(config.defaults);
  const [errors, setErrors] = useState<ErrorMap<T>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const set = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setState((prev) => {
        const cloned = structuredClone(prev);
        return {
          ...cloned,
          [key]: value,
        };
      });

      const validate = configRef.current.validators?.[key];
      if (!validate || !submitted) return;

      const valid = validate(value);
      setErrors((prev) => {
        const cloned = structuredClone(prev);
        return {
          ...cloned,
          [key]: valid !== true ? valid : undefined,
        };
      });
    },
    [submitted]
  );

  const submit = useCallback(() => {
    const errors: ErrorMap<T> = {};

    for (const [key, value] of entries(state)) {
      const safeKey = key as keyof T;
      const safeValue = value as T[keyof T];
      const validate = configRef.current.validators?.[safeKey];
      if (!validate) continue;
      const valid = validate(safeValue);
      if (valid !== true) errors[safeKey] = valid;
    }

    setSubmitted(true);
    setErrors(errors);
    if (!isEmpty(errors)) return;
    configRef.current.onSubmit(state);
  }, [state]);

  const reset = useCallback(() => {
    setSubmitted(false);
    setState(configRef.current.defaults);
    setErrors({});
  }, []);

  const onFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      submit();
    },
    [submit]
  );

  return {
    state,
    errors,
    submitted,
    set,
    submit,
    reset,
    onFormSubmit,
  };
}
