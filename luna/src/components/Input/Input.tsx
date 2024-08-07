import React, { useMemo } from "react";
import { ChangeHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import ErrorOutlined from "@/icons/ErrorOutlined";

export const Input: React.FC<{
  id: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  type: "text" | "password";
  onChange?: ChangeHandler;
  onBlur?: ChangeHandler;
  name?: string;
  error?: string | null;
  value?: string;
}> = ({
  label,
  type,
  id,
  placeholder,
  autoComplete,
  onChange,
  onBlur,
  name,
  error,
  value,
}) => {
  return (
    <div className="ui-flex ui-flex-col ui-w-full">
      <label
        htmlFor={id}
        className={cn(
          "ui-text-dark-100 ui-font-cairo ui-font-bold ui-text-arxl ui-leading-normal ui-mb-xl"
        )}
      >
        {label}
      </label>
      <div className="ui-w-full ui-relative">
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          onBlur={onBlur}
          className={cn(
            "ui-w-full ui-bg-inputbg ui-py-[10px] ui-px-lg ui-rounded-2xl  ui-h-[72px] ui-font-cairo placeholder:ui-text-arxl placeholder:ui-font-medium ui-leading-normal",
            "ui-text-arxl ui-font-bold ui-leading-normal ui-border focus:ui-outline-none focus:ui-border-blue-normal",
            {
              "ui-bg-red-light ui-border-red-border focus:ui-border-red-border":
                !!error,
              "ui-border-transparent": !error,
            }
          )}
          placeholder={placeholder}
        />
        <ErrorIcon error={!!error} />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {error ? <InputError message={error} key={label} /> : null}
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
    <motion.p className="ui-text-arsm ui-text-red-400" {...framer}>
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
          className="ui-absolute ui-top-1/2 ui-left-lg ui-transform -ui-translate-y-1/2"
          {...framer}
        >
          <ErrorOutlined />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
