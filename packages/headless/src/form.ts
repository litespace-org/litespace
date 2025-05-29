import { entries, isEmpty } from "lodash";
import { useCallback, useEffect, useState } from "react";

type Config<T extends object> = {
  defaults: T;
  onSubmit: (data: T) => void;
  validators?: Validators<T>;
  resetOnSubmit?: boolean;
  validationDeps?: unknown[];
};

export type Validators<T extends object> = {
  [K in keyof T]?: (value: T[K], state: T) => true | string;
};

export type ErrorMap<T extends object> = { [key in keyof T]?: string };

export function useForm<T extends object>(config: Config<T>) {
  const [state, setState] = useState<T>(config.defaults);
  const [errors, setErrors] = useState<ErrorMap<T>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const set = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      const cloned = structuredClone(state);
      const updated = { ...cloned, [key]: value };
      setState(updated);

      const validate = config.validators?.[key];
      if (!validate || !submitted) return;

      const valid = validate(value, updated);
      setErrors((prev) => {
        const cloned = structuredClone(prev);
        return {
          ...cloned,
          [key]: valid !== true ? valid : undefined,
        };
      });
    },
    [config.validators, state, submitted]
  );

  const reset = useCallback(() => {
    setSubmitted(false);
    setState(config.defaults);
    setErrors({});
  }, [config.defaults]);

  const validate = useCallback(() => {
    const errors: ErrorMap<T> = {};

    for (const [key, value] of entries(state)) {
      const safeKey = key as keyof T;
      const safeValue = value as T[keyof T];
      const validate = config.validators?.[safeKey];
      if (!validate) continue;
      const valid = validate(safeValue, state);
      if (valid !== true) errors[safeKey] = valid;
    }

    setErrors(errors);
    const valid = isEmpty(errors);
    return valid;
  }, [config.validators, state]);

  const submit = useCallback(() => {
    setSubmitted(true);
    const valid = validate();
    if (!valid) return;
    config.onSubmit(state);
    if (config.resetOnSubmit) reset();
  }, [config, reset, state, validate]);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      submit();
    },
    [submit]
  );

  const isValid = useCallback(
    (field: keyof T): boolean => {
      const validate = config.validators?.[field];
      if (!validate) return true;
      return validate(state[field], state) == null;
    },
    [config.validators, state]
  );

  useEffect(() => {
    if (config.validationDeps && submitted) validate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config.validationDeps)]);

  return {
    state,
    errors,
    submitted,
    set,
    submit,
    reset,
    onSubmit,
    isValid,
    validate,
  };
}
