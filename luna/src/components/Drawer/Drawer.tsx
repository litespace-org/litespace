import React from "react";
import { Button, ButtonSize, ButtonType } from "../Button";
import { X } from "react-feather";
import cn from "classnames";
import { Void } from "@litespace/types";

const Drawer: React.FC<{
  children?: React.ReactNode;
  title?: React.ReactNode;
  open?: boolean;
  close?: Void;
}> = ({ children, title, open, close }) => {
  return (
    <div
      data-open={open}
      className={cn(
        "tw-fixed tw-z-[9999] tw-right-0 tw-top-0 tw-h-screen tw-w-full tw-bg-background-dialog tw-hidden data-[open=true]:block"
      )}
    >
      <div className="tw-flex tw-items-center tw-justify-between tw-h-10 px-2 pt-2">
        <h3 className="tw-mr-3 tw-text-2xl">{title}</h3>
        <Button
          onClick={close}
          size={ButtonSize.Tiny}
          type={ButtonType.Text}
          className="!tw-px-1"
        >
          <X className="tw-w-5 tw-h-5" />
        </Button>
      </div>
      <div className="tw-h-[calc(100vh-2.5rem)]">{children}</div>
    </div>
  );
};

export default Drawer;