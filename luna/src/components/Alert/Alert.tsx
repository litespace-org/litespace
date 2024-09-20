import React, { useMemo } from "react";
import cn from "classnames";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "react-feather";
import { AlertType } from "@/components/Alert/types";
import { Button, ButtonSize, ButtonType } from "@/components/Button";

export const Alert: React.FC<{
  title?: string;
  children?: React.ReactNode;
  type?: AlertType;
  action?: {
    label: string;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
}> = ({ title, children, action, type = AlertType.Error }) => {
  const { error, warning, success, info } = useMemo(() => {
    return {
      error: type === AlertType.Error,
      warning: type === AlertType.Warning,
      success: type === AlertType.Success,
      info: type === AlertType.Info,
    };
  }, [type]);

  return (
    <div
      className={cn(
        "border  p-4 text-base rounded-lg",
        "w-full flex flex-row gap-2",
        {
          "border-destructive-400 bg-destructive-200": error,
          "border-warning-400 bg-warning-200": warning,
          "border-[var(--colors-green8)] bg-[var(--colors-green4)]": success,
          "border-[var(--colors-blue8)] bg-[var(--colors-blue4)]": info,
        }
      )}
    >
      <div>
        {error ? (
          <AlertCircle className="text-destructive-600" />
        ) : warning ? (
          <AlertTriangle className="text-warning-600" />
        ) : success ? (
          <CheckCircle className="text-[var(--colors-green9)]" />
        ) : info ? (
          <Info className="text-[var(--colors-blue9)]" />
        ) : null}
      </div>
      <div className="flex flex-col items-start justify-center">
        {title ? (
          <h4
            className={cn(action || children ? "mb-2" : "", "text-foreground")}
          >
            {title}
          </h4>
        ) : null}

        {children ? (
          <div
            className={cn(
              "text-foreground-light font-normal",
              action && "mb-2"
            )}
          >
            {children}
          </div>
        ) : null}

        {action ? (
          <div className="min-w-[100px]">
            <Button
              htmlType="button"
              onClick={action.onClick}
              size={ButtonSize.Small}
              type={
                type === AlertType.Error
                  ? ButtonType.Error
                  : ButtonType.Secondary
              }
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
