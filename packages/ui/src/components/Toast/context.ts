import { createContext, useCallback, useContext } from "react";
import { ToastId, ToastType } from "@/components/Toast/types";

export type AddToastData = {
  id?: ToastId;
  title: React.ReactNode;
  description?: React.ReactNode;
};

export type ToastData = AddToastData & { id: ToastId; type: ToastType };

type Context = {
  add: (data: AddToastData, type: ToastType) => ToastId;
  remove: (id: ToastId) => void;
};

export const ToastContext = createContext<Context | null>(null);

export function useToast() {
  const toast = useContext(ToastContext);
  if (!toast) throw new Error("`useToast` must be used within its provider");

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
