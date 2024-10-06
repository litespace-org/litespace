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
  if (type === "success") return <Check className="tw-text-brand" />;
  if (type === "error") return <AlertCircle className="tw-text-destructive" />;
  if (type === "info") return <Info />;
  if (type === "warning")
    return <AlertTriangle className="tw-text-amber-900" />;
  return <Check />;
};

export const Toaster: React.FC = () => {
  return (
    <>
      {createPortal(
        <ToastContainer
          className="tw-w-[350px] tw-ml-2"
          toastClassName={cn(
            "tw-flex tw-px-3 tw-pb-3 tw-pt-2 md:tw-rounded-lg ",
            "tw-border tw-border-border-strong hover:tw-border-border-stronger !tw-bg-background-overlay",
            "[&>button]:tw-mt-2.5 [&>button]:tw-pl-[6px] !tw-text-foreground"
          )}
          bodyClassName="!tw-items-start tw-gap-2 tw-font-cairo !tw-pl-3 [&_.Toastify\_\_toast-icon]:tw-mt-[2px]"
          closeButton={({ closeToast }) => (
            <div className="tw-mt-1.5">
              <Button
                onClick={closeToast}
                size={ButtonSize.Tiny}
                type={ButtonType.Text}
                className="tw-w-[25px] tw-h-[25px] tw-flex tw-items-center tw-justify-center !tw-p-1"
              >
                <X className="tw-w-[20px] tw-h-[20px]" />
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
