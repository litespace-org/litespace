import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import ErrorOutlined from "@/icons/ErrorOutlined";
import { Dir } from "@/components/Direction";
import OpenedEye from "@/icons/OpenedEye";
import ClosedEye from "@/icons/ClosedEye";
import { InputType } from "@/components/Input/types";
import { UseFormRegisterReturn } from "react-hook-form";

const arabic =
  /[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufc3f]|[\ufe70-\ufefc]/;

const passwordPlaceholder = "••••••••";

export const Input: React.FC<{
  placeholder?: string;
  autoComplete?: string;
  type?: InputType;
  error?: string | null;
  value?: string;
  register?: UseFormRegisterReturn;
}> = ({ type, placeholder, autoComplete, error, value, register }) => {
  const [show, setShow] = useState<boolean>(false);
  const [kind, setKind] = useState<InputType>(type || InputType.Text);

  const dir: Dir | undefined = useMemo(() => {
    if (!value) return undefined;
    if (type === InputType.Password) return Dir.LTR;
    if (arabic.test(value[0])) return Dir.RTL;
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
    <div className="ui-flex ui-flex-col ui-w-full">
      <div className="ui-w-full ui-relative">
        <input
          dir={dir}
          id={register?.name}
          type={kind}
          value={value}
          autoComplete={autoComplete}
          {...register}
          className={cn(
            "ui-font-cairo ui-block ui-box-border ui-w-full ui-rounded-md ui-shadow-sm ui-transition-all",
            "ui-text-foreground focus-visible:ui-shadow-md ui-outline-none",
            "focus:ui-ring-current focus:ui-ring-2 focus-visible:ui-border-foreground-muted",
            "focus-visible:ui-ring-background-control ui-placeholder-foreground-muted ui-group",
            "ui-bg-foreground/[.026] ui-border ui-border-control ui-text-sm ui-px-4 ui-py-2",
            {
              "ui-bg-destructive-200 ui-border ui-border-destructive-400 focus:ui-ring-destructive-400 placeholder:ui-text-destructive-400":
                !!error,
            }
          )}
          placeholder={
            type === InputType.Password
              ? placeholder || passwordPlaceholder
              : placeholder
          }
        />
        <ErrorIcon error={!!error} />
        {type === InputType.Password && (
          <EyeIcon show={show} error={!!error} toggle={onEyeClick} />
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {error ? <InputError message={error} key={register?.name} /> : null}
      </AnimatePresence>
    </div>
  );
};

function framerError(y: string | number) {
  return {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.2 },
  };
}

const InputError: React.FC<{ message: string }> = ({ message }) => {
  const framer = useMemo(() => framerError(0), []);
  return (
    <motion.p
      className="ui-font-cairo ui-text-sm ui-text-red-900 ui-mt-2"
      {...framer}
    >
      {message}
    </motion.p>
  );
};

const ErrorIcon: React.FC<{ error: boolean }> = ({ error }) => {
  const framer = useMemo(() => framerError("-50%"), []);
  return (
    <AnimatePresence mode="wait" initial={false}>
      {error ? (
        <motion.div
          className="ui-absolute ui-top-1/2 ui-left-2 ui-transform -ui-translate-y-1/2 ui-text-red-900"
          {...framer}
        >
          <ErrorOutlined />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const EyeIcon: React.FC<{
  show?: boolean;
  error?: boolean;
  toggle: (show: boolean) => void;
}> = ({ toggle, show = false, error = false }) => {
  const framer = useMemo(() => framerError("-50%"), []);
  return (
    <div
      className={cn(
        "ui-absolute ui-top-1/2 ui-transform -ui-translate-y-1/2 ui-cursor-pointer",
        {
          "ui-left-12": error,
          "ui-left-lg": !error,
        }
      )}
      {...framer}
      onClick={() => toggle(!show)}
    >
      {show ? <OpenedEye /> : <ClosedEye />}
    </div>
  );
};
