import React, { useCallback, useMemo, useState } from "react";
import {
  ToastContext,
  ToastData,
  AddToastData,
  ToastTypes,
} from "@/components/Toast/context";
import { Toast } from "@/components/Toast";
import { Provider, Viewport } from "@radix-ui/react-toast";
import cn from "classnames";

export const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const add = useCallback((data: AddToastData, type: ToastTypes) => {
    const id = Math.floor(Math.random() * 1000);
    const toastData = { ...data, id, type };
    setToasts((prev) => [...prev, toastData]);
    return id;
  }, []);

  const remove = useCallback((id: number) => {
    setToasts((prev) => [...prev].filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={useMemo(() => ({ add, remove }), [add, remove])}
    >
      <Provider swipeDirection="left">
        {children}

        {toasts.map((toast) => (
          <Toast
            type={toast.type}
            key={toast.id}
            toastKey={toast.id}
            title={toast.title}
            description={toast.description}
            onOpenChange={(open: boolean) => {
              if (!open) remove(toast.id);
            }}
            open
          />
        ))}

        <Viewport
          className={cn(
            "tw-fixed tw-top-0 tw-left-0 tw-w-96",
            "tw-list-none tw-flex tw-flex-col tw-gap-2.5 tw-p-[var(--viewport-padding)] tw-outline-none [--viewport-padding:_25px]"
          )}
        />
      </Provider>
    </ToastContext.Provider>
  );
};
