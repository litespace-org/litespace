import React from "react";
import cn from "classnames";
import { AlertCircle } from "react-feather";
import { Button, ButtonSize, ButtonType } from "@/components/Button";

export const Alert: React.FC<{
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}> = ({ title, description, action }) => {
  return (
    <div
      className={cn(
        "border border-destructive-400 bg-destructive-200 p-4 text-base rounded-lg",
        "w-full flex flex-row gap-2"
      )}
    >
      <div>
        <AlertCircle className="text-destructive-600" />
      </div>
      <div className="flex flex-col items-start justify-center">
        {title ? (
          <h4 className={cn(action || description ? "mb-2" : "")}>{title}</h4>
        ) : null}

        {description ? (
          <p
            className={cn(
              "text-foreground-light font-normal",
              action && "mb-2"
            )}
          >
            {description}
          </p>
        ) : null}

        {action ? (
          <div className="min-w-[100px]">
            <Button
              htmlType="button"
              onClick={action.onClick}
              size={ButtonSize.Small}
              type={ButtonType.Error}
              disabled={action.disabled}
              loading={action.loading}
            >
              {action.label}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};
