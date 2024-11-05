import { createContext, useCallback, useContext } from "react";

export type AddToastData = {
  title: string;
  description?: string;
};

export type ToastData = AddToastData & { id: number };

type Context = {
  add: (data: AddToastData) => number;
  remove: (id: number) => void;
};

export const ToastContext = createContext<Context | null>(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("`useToast` must be used within `ToastProvider`");

  const success = useCallback(
    (data: AddToastData) => {
      return toast.add(data);
    },
    [toast]
  );

  const error = useCallback(
    (data: AddToastData) => {
      return toast.add(data);
    },
    [toast]
  );

  const info = useCallback(
    (data: AddToastData) => {
      return toast.add(data);
    },
    [toast]
  );

  const warning = useCallback(
    (data: AddToastData) => {
      return toast.add(data);
    },
    [toast]
  );

  return { success, error, info, warning };
}
