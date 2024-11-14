import { createContext, useCallback, useContext } from "react";

export type ToastTypes = "success" | "warning" | "error";

export type AddToastData = {
  title: string;
  description?: string;
};

export type ToastData = AddToastData & { id: number; type: ToastTypes };

type Context = {
  add: (data: AddToastData, type: ToastTypes) => number;
  remove: (id: number) => void;
};

export const ToastContext = createContext<Context | null>(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("`useToast` must be used within `ToastProvider`");

  const success = useCallback(
    (data: AddToastData) => {
      return toast.add(data, "success");
    },
    [toast]
  );

  const error = useCallback(
    (data: AddToastData) => {
      return toast.add(data, "error");
    },
    [toast]
  );

  const warning = useCallback(
    (data: AddToastData) => {
      return toast.add(data, "warning");
    },
    [toast]
  );

  return { success, error, warning };
}
