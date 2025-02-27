import React from "react";
import { Button } from "@/components/Button";
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
        "fixed z-[9999] right-0 top-0 h-screen w-full bg-background-dialog hidden data-[open=true]:block"
      )}
    >
      <div className="px-2 pt-2 flex items-center justify-between h-10">
        <h3 className="mr-3 text-subtitle-1">{title}</h3>
        <Button
          onClick={close}
          size={"small"}
          type={"main"}
          variant={"primary"}
          className="!px-1"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      <div className="h-[calc(100vh-2.5rem)]">{children}</div>
    </div>
  );
};

export default Drawer;
