import { createContext, useContext, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import cn from "classnames";

type ToastType = "success" | "failed";

type ToastContextProps = {
  children?: React.ReactNode;
};

type ToastContextTypes = {
  open: boolean;
  type: ToastType;
  title: string;
  setType: (type: ToastType) => void;
  setOpen: (open: boolean) => void;
  setTitle: (title: string) => void;
};

export const ToastContext = createContext<ToastContextTypes | null>(null);

export const ToastProvider = ({ children }: ToastContextProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ToastType>("success");
  return (
    <ToastContext.Provider
      value={{ open, type, title, setOpen, setTitle, setType }}
    >
      <Toast.Provider swipeDirection="right">
        <Toast.Root
          className={cn(
            "tw-flex tw-justify-between tw-items-start tw-gap-3",
            "tw-px-3 tw-pb-3 tw-pt-2 md:tw-rounded-lg",
            "tw-border tw-border-border-strong hover:tw-border-border-stronger !tw-bg-background-overlay",
            "tw-animate-[slide-to-right]"
          )}
          open={open}
          onOpenChange={setOpen}
        >
          <div className="tw-w-5 tw-flex tw-justify-center">
            {type === "success" && (
              <span className="tw-font-bold tw-text-xl tw-text-green-500">
                &#10003;
              </span>
            )}
            {type === "failed" && (
              <span className="tw-font-bold tw-text-xl tw-text-red-500">
                &#88;
              </span>
            )}
          </div>
          <div>
            <Toast.Title className="tw-flex-1 tw-self-start tw-text-start">
              {title}
            </Toast.Title>
            <Toast.Description asChild></Toast.Description>
          </div>
          <Toast.Action className="" asChild altText="Goto schedule to undo">
            <button className="Button small green">
              <span className="tw-w-[20px] tw-h-[20px]">&#88;</span>
            </button>
          </Toast.Action>
        </Toast.Root>
        <Toast.Viewport
          className={cn(
            "tw-fixed tw-top-6 tw-left-16 tw-w-[390px] tw-z-[444444444]",
            "tw-animate-[slide-to-right]"
          )}
        />
      </Toast.Provider>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
