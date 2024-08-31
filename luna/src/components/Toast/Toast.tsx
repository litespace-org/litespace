import React from "react";
import cn from "classnames";
import { AlertCircle, Check, Info, AlertTriangle, X } from "react-feather";
import { createPortal } from "react-dom";
import { IconProps, ToastContainer } from "react-toastify";
import { Button, ButtonSize, ButtonType } from "../Button";

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
            "border border-border-strong hover-border-border-stronger !bg-background-overlay",
            "[&>button]:mt-2.5 [&>button]:pl-[6px] !text-foreground"
          )}
          bodyClassName="!items-start gap-2 font-cairo !pl-3 [&_.Toastify\_\_toast-icon]:mt-[2px]"
          closeButton={({ closeToast }) => (
            <div className="mt-1.5">
              <Button
                onClick={closeToast}
                size={ButtonSize.Tiny}
                type={ButtonType.Text}
                className="w-[25px] h-[25px] flex items-center justify-center !p-1"
              >
                <X className="w-[20px] h-[20px]" />
              </Button>
            </div>
          )}
          position="top-left"
          icon={Icon}
          hideProgressBar
          limit={5}
          autoClose={3000}
          theme="dark"
          rtl
        />,
        document.body
      )}
    </>
  );
};
