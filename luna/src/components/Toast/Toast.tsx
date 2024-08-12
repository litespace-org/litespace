import React from "react";
import cn from "classnames";
import { AlertCircle, Check, Info, AlertTriangle } from "react-feather";
import { createPortal } from "react-dom";
import { IconProps, ToastContainer } from "react-toastify";

export type ToastProps = {
  title: string;
  description?: string;
};

export const Toast: React.FC<ToastProps> = ({ title, description }) => {
  return (
    <p>
      {title} {description ? `: ${description}` : null}
    </p>
  );
};

const Icon: React.FC<IconProps> = ({ type }) => {
  if (type === "success") return <Check className="text-brand" />;
  if (type === "error") return <AlertCircle className="text-destructive" />;
  if (type === "info") return <Info />;
  if (type === "warning") return <AlertTriangle className="text-amber-900" />;
  return <Check />;
};

export const Toaster: React.FC = () => {
  return (
    <>
      {createPortal(
        <ToastContainer
          className="w-[350px] ml-2"
          toastClassName={cn(
            "flex px-3 pb-3 pt-2 md:rounded-lg ",
            "border border-border-strong hover-border-border-stronger !bg-overlay",
            "[&>button]:mt-2.5 [&>button]:pl-[6px] !text-foreground"
          )}
          bodyClassName="!items-start gap-2 font-cairo !pl-3 [&_.Toastify\_\_toast-icon]:mt-0.5"
          position="top-left"
          icon={Icon}
          hideProgressBar
          limit={5}
          autoClose={false}
          rtl
          theme="dark"
        />,
        document.body
      )}
    </>
  );
};
