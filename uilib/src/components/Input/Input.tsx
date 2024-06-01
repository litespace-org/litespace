import React from "react";
import { FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <div className="ui-flex ui-flex-col ui-w-full ui-gap-2">
      <div className="ui-flex ui-justify-between">
        <label htmlFor={id} className="ui-font-semibold">
          {label}
        </label>
        <AnimatePresence mode="wait" initial={false}>
          {error ? (
            <InputError
              message={
                typeof error.message === "string" && error.message
                  ? error.message
                  : "Invalid"
              }
              key={label}
            />
          ) : null}
        </AnimatePresence>
      </div>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        className="ui-w-full ui-p-2 ui-font-medium ui-border ui-rounded-md ui-border-slate-300 ui-placeholder:opacity-60"
        placeholder={placeholder}
        {...register(id, validation)}
      />
    </div>
  );
};

const InputError: React.FC<{ message: string }> = ({ message }) => {
  return (
    <motion.p
      className="ui-flex ui-items-center ui-gap-1 ui-px-2 ui-font-semibold ui-text-red-500 ui-bg-red-100 ui-rounded-md"
      {...framerError}
    >
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
