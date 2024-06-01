import React, { useMemo } from "react";
import { FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";

export const Input: React.FC<{
  id: string;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  type: "text" | "password";
  validation?: RegisterOptions<FieldValues>;
}> = ({ label, type, id, placeholder, autoComplete, validation }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[id];

  const errorMessage = useMemo(() => {
    if (!error) return null;
    const mesage = error.message;
    if (!mesage || typeof mesage !== "string") return null;
    return mesage;
  }, [error]);

  return (
    <div className="ui-flex ui-flex-col ui-w-full ui-gap-2">
      <div className="ui-flex ui-flex-row">
        <label
          htmlFor={id}
          className={cn("ui-font-semibold", {
            "ui-text-red-400": !!error,
            "ui--text-gray-800": !error,
          })}
        >
          {label}
        </label>
        <AnimatePresence mode="wait" initial={false}>
          {errorMessage ? (
            <InputError message={errorMessage} key={label} />
          ) : null}
        </AnimatePresence>
      </div>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        className={cn(
          "ui-w-full ui-p-2 ui-font-medium ui-border ui-rounded-md ui-placeholder:opacity-60 focus:ui-outline-none focus:ui-ring-2 focus:ui-border-none",
          {
            "ui-border-red-400 ui-placeholder-red-400 ui-ring-red-400": !!error,
            "ui-border-slate-300 ui-ring-slate-600": !error,
          }
        )}
        placeholder={placeholder}
        {...register(id, validation)}
      />
    </div>
  );
};

const InputError: React.FC<{ message: string }> = ({ message }) => {
  return (
    <motion.p
      className="ui-flex ui-items-center ui-italic ui-text-sm ui-text-red-400"
      {...framerError}
    >
      <span className={cn("ui-mx-1 ui-inline-block ui-text-red-400")}>
        &mdash;
      </span>
      {message}
    </motion.p>
  );
};

const framerError = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
  transition: { duration: 0.2 },
} as const;
