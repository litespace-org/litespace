import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import ErrorOutlined from "@/icons/ErrorOutlined";
import { Dir } from "@/components/Direction";
import OpenedEye from "@/icons/OpenedEye";
import ClosedEye from "@/icons/ClosedEye";
import { InputType, InputAction } from "@/components/Input/types";
import { Button, ButtonSize, ButtonType } from "@/components/Button";

// const arabic =
//   /[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufc3f]|[\ufe70-\ufefc]/;
// const ignore = /[0-9!-_()[]\*&\^%\$#@\s`~]/;
// const arabicv2 = /^[ء-ي\s\d:]+$/;
// const arabicv3 =
//   /^[\u0600-\u06ff\u0750-\u077f\ufb50-\ufbc1\ufbd3-\ufd3f\ufd50-\ufd8f\ufd92-\ufdc7\ufe70-\ufefc\uFDF0-\uFDFD\s\d:-]+/;
const ARABIC_LETTERS = `[\\u0600-\\u06ff\\u0750-\\u077f\\ufb50-\\ufbc1\\ufbd3-\\ufd3f\\ufd50-\\ufd8f\\ufd92-\\ufdc7\\ufe70-\\ufefc\\uFDF0-\\uFDFD]`;
const SEPECIAL_LETTERS = `[\\d !-_\\(\\)\\[\\]\\*&\\^%\\$#@\`~]`;
// ref: https://regex101.com/r/lbpjvo/2
const arabicv4 = new RegExp(
  `(^${SEPECIAL_LETTERS}+$)|(^${SEPECIAL_LETTERS}*${ARABIC_LETTERS}+)`
);

const passwordPlaceholder = "••••••••";

// auto resize text input, used for chat box
// https://www.youtube.com/watch?v=sOnPz_GMa38

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: InputType;
  actions?: Array<InputAction>;
  error?: string | null;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { type, error, value, disabled, placeholder, name, actions = [], ...props },
    ref
  ) => {
    const [show, setShow] = useState<boolean>(false);
    const [kind, setKind] = useState<InputType>(type || InputType.Text);

    const dir: Dir | undefined = useMemo(() => {
      if (!value) return undefined;
      if (type === InputType.Password) return Dir.LTR;
      if (arabicv4.test(value.toString())) return Dir.RTL;
      return Dir.LTR;
    }, [type, value]);

    useEffect(() => {
      setKind(type || InputType.Text);
    }, [type]);

    const onEyeClick = useCallback((shouldShow: boolean) => {
      setShow(shouldShow);
      setKind(shouldShow ? InputType.Text : InputType.Password);
    }, []);

    return (
      <div className="tw-flex tw-flex-col tw-w-full">
        <div className="tw-w-full tw-relative">
          <input
            dir={dir}
            type={kind}
            value={value}
            disabled={disabled}
            className={cn(
              "tw-font-cairo tw-block tw-box-border tw-w-full tw-rounded-md tw-shadow-sm tw-transition-all",
              "tw-text-foreground focus-visible:tw-shadow-md tw-outline-none",
              "focus:tw-ring-current focus:tw-ring-2 focus-visible:tw-border-foreground-muted",
              "focus-visible:tw-ring-background-control tw-placeholder-foreground-muted group",
              "tw-border tw-border-control tw-text-sm tw-px-4 tw-py-2",
              "disabled:tw-opacity-50 disabled:tw-cursor-not-allowed",
              "tw-text-right", // align all text to the right
              {
                "tw-bg-foreground/[.026]": !error,
                "tw-bg-destructive-200 tw-border tw-border-destructive-400 focus:tw-ring-destructive-400 placeholder:tw-text-destructive-400":
                  !!error,
              }
            )}
            placeholder={
              type === InputType.Password
                ? placeholder || passwordPlaceholder
                : placeholder
            }
            ref={ref}
            {...props}
          />

          <Actions
            show={show}
            error={!!error}
            onEyeClick={onEyeClick}
            password={type === InputType.Password}
            disabled={disabled}
            actions={actions}
          />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          {error ? <InputError message={error} key={name} /> : null}
        </AnimatePresence>
      </div>
    );
  }
);

const framer = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
};

export const InputError: React.FC<{ message: string }> = ({ message }) => {
  return (
    <motion.p
      className="tw-font-cairo tw-text-sm tw-text-red-900 tw-mt-2"
      {...framer}
    >
      {message}
    </motion.p>
  );
};

const ErrorIcon: React.FC<{ error: boolean }> = ({ error }) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {error ? (
        <motion.div
          className={cn(
            "tw-flex tw-items-center tw-justify-center tw-pl-2 tw-pr-2 tw-text-red-900"
          )}
          {...framer}
        >
          <ErrorOutlined />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const EyeIcon: React.FC<{
  disabled?: boolean;
  show?: boolean;
  toggle: (show: boolean) => void;
}> = ({ toggle, disabled, show = false }) => {
  return (
    <div>
      <Button
        htmlType="button"
        type={ButtonType.Secondary}
        size={ButtonSize.Tiny}
        onClick={() => toggle(!show)}
        disabled={disabled}
      >
        <span className="tw-text-foreground-muted">
          {show ? (
            <OpenedEye className="tw-w-[14px] tw-h-[14px]" />
          ) : (
            <ClosedEye className="tw-w-[14px] tw-h-[14px]" />
          )}
        </span>
      </Button>
    </div>
  );
};

const Actions: React.FC<{
  error: boolean;
  password: boolean;
  show: boolean;
  onEyeClick: (show: boolean) => void;
  disabled?: boolean;
  actions: InputAction[];
}> = ({ error, password, show, disabled, actions, onEyeClick }) => {
  return (
    <div className="tw-absolute tw-inset-y-0 tw-left-0 tw-pr-3 tw-pl-1 tw-flex tw-space-x-1 tw-items-center">
      <ErrorIcon error={error} />
      {password && (
        <EyeIcon disabled={disabled} show={show} toggle={onEyeClick} />
      )}

      {actions.map(({ id, Icon, onClick }) => (
        <Button
          key={id}
          htmlType="button"
          type={ButtonType.Secondary}
          size={ButtonSize.Tiny}
          disabled={disabled}
          onClick={onClick}
        >
          {<Icon className="tw-w-[14px] tw-h-[14px]" />}
        </Button>
      ))}
    </div>
  );
};
