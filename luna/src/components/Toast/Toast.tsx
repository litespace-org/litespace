import React from "react";
import cn from "classnames";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { AlertCircle } from "react-feather";

type Props = {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const Toast: React.FC<Props> = ({ title, description, action }) => {
  return (
    <div
      className={cn(
        "bg-overlay border border-border-strong hover:border-border-stronger max-w-[330px] py-2 px-4 rounded-lg",
        "flex flex-row gap-2"
      )}
    >
      <div className="flex-none pt-1">
        <AlertCircle className="text-red-900" />
      </div>

      <p className="flex-1">
        {title} {description ? `: ${description}` : null}
      </p>

      {action && (
        <div className="flex-none">
          <Button
            type={ButtonType.Secondary}
            size={ButtonSize.Tiny}
            onClick={action?.onClick}
            className="w-fit"
          >
            {action?.label}
          </Button>
        </div>
      )}
    </div>
  );
};
