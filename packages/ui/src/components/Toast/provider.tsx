"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  ToastContext,
  ToastData,
  AddToastData,
} from "@/components/Toast/context";
import { Toast } from "@/components/Toast/Toast";
import { ToastId, ToastType } from "@/components/Toast/types";
import { Provider, Viewport } from "@radix-ui/react-toast";
import cn from "classnames";
import { uniqBy } from "lodash";

export const ToastProvider: React.FC<{
  children?: React.ReactNode;
  postion?: "top-left" | "bottom-left";
}> = ({ children, postion = "top-left" }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const add = useCallback((data: AddToastData, type: ToastType) => {
    const id = data.id || Math.floor(Math.random() * 1000);
    const toastData = { ...data, id, type };
    setToasts((prev) => uniqBy([...prev, toastData], (toast) => toast.id));
    return id;
  }, []);

  const remove = useCallback((id: ToastId) => {
    setToasts((prev) => [...prev].filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={useMemo(() => ({ add, remove }), [add, remove])}
    >
      <Provider>
        {children}

        {toasts.map((toast) => (
          <Toast
            type={toast.type}
            key={toast.id}
            toastId={toast.id}
            title={toast.title}
            description={toast.description}
            onOpenChange={(open: boolean) => {
              if (!open) remove(toast.id);
            }}
            open
            actions={toast.actions}
          />
        ))}

        <Viewport
          className={cn(
            "fixed z-toast list-none flex flex-col gap-2.5",
            "p-[var(--viewport-padding)] outline-none [--viewport-padding:_16px] sm:[--viewport-padding:_25px]",
            {
              "top-0 left-0": postion === "top-left",
              "bottom-0 left-0": postion === "bottom-left",
            }
          )}
        />
      </Provider>
    </ToastContext.Provider>
  );
};
