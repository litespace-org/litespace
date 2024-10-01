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
    { type, error, value, disabled, placeholder, name, actions = [], ...attrs },
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
      <div className="flex flex-col w-full">
        <div className="w-full relative">
          <input
            dir={dir}
            type={kind}
            {...attrs}
            className={cn(
              "font-cairo block box-border w-full rounded-md shadow-sm transition-all",
              "text-foreground focus-visible:shadow-md outline-none",
              "focus:ring-current focus:ring-2 focus-visible:border-foreground-muted",
              "focus-visible:ring-background-control placeholder-foreground-muted group",
              "border border-control text-sm px-4 py-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "text-right", // align all text to the right
              {
                "bg-foreground/[.026]": !error,
                "bg-destructive-200 border border-destructive-400 focus:ring-destructive-400 placeholder:text-destructive-400":
                  !!error,
              }
            )}
            placeholder={
              type === InputType.Password
                ? placeholder || passwordPlaceholder
                : placeholder
            }
            ref={ref}
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
    <motion.p className="font-cairo text-sm text-red-900 mt-2" {...framer}>
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
            "flex items-center justify-center pl-2 pr-2 text-red-900"
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
        <span className="text-foreground-muted">
          {show ? (
            <OpenedEye className="w-[14px] h-[14px]" />
          ) : (
            <ClosedEye className="w-[14px] h-[14px]" />
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
    <div className="absolute inset-y-0 left-0 pr-3 pl-1 flex space-x-1 items-center">
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
          {<Icon className="w-[14px] h-[14px]" />}
        </Button>
      ))}
    </div>
  );
};
