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
        "tw-border tw-p-4 tw-text-base tw-rounded-lg",
        "tw-w-full tw-flex tw-flex-row tw-gap-2",
        {
          "tw-border-destructive-400 tw-bg-destructive-200": error,
          "tw-border-warning-400 tw-bg-warning-200": warning,
          "tw-border-[var(--colors-green8)] tw-bg-[var(--colors-green4)]":
            success,
          "tw-border-[var(--colors-blue8)] tw-bg-[var(--colors-blue4)]": info,
        }
      )}
    >
      <div>
        {error ? (
          <AlertCircle className="tw-text-destructive-600" />
        ) : warning ? (
          <AlertTriangle className="tw-text-warning-600" />
        ) : success ? (
          <CheckCircle className="tw-text-[var(--colors-green9)]" />
        ) : info ? (
          <Info className="tw-text-[var(--colors-blue9)]" />
        ) : null}
      </div>
      <div className="tw-flex tw-flex-col tw-items-start tw-justify-center">
        {title ? (
          <h4
            className={cn(
              action || children ? "tw-mb-2" : "",
              "tw-text-foreground"
            )}
          >
            {title}
          </h4>
        ) : null}

        {children ? (
          <div
            className={cn(
              "tw-text-foreground-light tw-font-normal",
              action && "tw-mb-2"
            )}
          >
            {children}
          </div>
        ) : null}

        {action ? (
          <div className="tw-min-w-[100px]">
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
