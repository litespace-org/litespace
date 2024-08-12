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
  disabled?: boolean;
}> = ({
  type,
  placeholder,
  autoComplete,
  error,
  value,
  register,
  disabled,
}) => {
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
    <div className="flex flex-col w-full">
      <div className="w-full relative">
        <input
          dir={dir}
          id={register?.name}
          type={kind}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          {...register}
          className={cn(
            "font-cairo block box-border w-full rounded-md shadow-sm transition-all",
            "text-foreground focus-visible:shadow-md outline-none",
            "focus:ring-current focus:ring-2 focus-visible:border-foreground-muted",
            "focus-visible:ring-background-control placeholder-foreground-muted group",
            " border border-control text-sm px-4 py-2",
            {
              "bg-foreground/[.026]": !error,
              "bg-destructive-200 border border-destructive-400 focus:ring-destructive-400 placeholder:text-destructive-400":
                !!error,
              "opacity-50 cursor-not-allowed": disabled,
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
    <motion.p className="font-cairo text-sm text-red-900 mt-2" {...framer}>
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
          className="absolute top-1/2 left-2 transform -translate-y-1/2 text-red-900"
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
        "absolute top-1/2 transform -translate-y-1/2 cursor-pointer",
        {
          "left-12": error,
          "left-lg": !error,
        }
      )}
      {...framer}
      onClick={() => toggle(!show)}
    >
      {show ? <OpenedEye /> : <ClosedEye />}
    </div>
  );
};
