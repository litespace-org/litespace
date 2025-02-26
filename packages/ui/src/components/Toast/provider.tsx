"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ToastContext,
  ToastData,
  AddToastData,
} from "@/components/Toast/context";
import { Toast } from "@/components/Toast/Toast";
import { ToastType } from "@/components/Toast/types";
import { Provider, Viewport } from "@radix-ui/react-toast";
import cn from "classnames";

export const ToastProvider: React.FC<{
  children?: React.ReactNode;
  postion?: "top-left" | "bottom-left";
}> = ({ children, postion = "top-left" }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const add = useCallback((data: AddToastData, type: ToastType) => {
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
            "tw-fixed _tw-w-96 tw-z-toast tw-list-none tw-flex tw-flex-col tw-gap-2.5",
            "tw-p-[var(--viewport-padding)] tw-outline-none [--viewport-padding:_25px]",
            {
              "tw-top-0 tw-left-0": postion === "top-left",
              "tw-bottom-0 tw-left-0": postion === "bottom-left",
            }
          )}
        />
      </Provider>
    </ToastContext.Provider>
  );
};
