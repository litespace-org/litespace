import React from "react";
import { FieldValues, RegisterOptions, useFormContext } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

export const Input: React.FC<{
  label: string;
  type: string;
  id: string;
  placeholder: string;
  validation?: RegisterOptions<FieldValues>;
}> = ({ label, type, id, placeholder, validation }) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[id];

  return (
    <div className="flex flex-col w-full gap-2">
      <div className="flex justify-between">
        <label htmlFor={id} className="font-semibold capitalize">
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
        className="w-full p-5 font-medium border rounded-md border-slate-300 placeholder:opacity-60"
        placeholder={placeholder}
        {...register(id, validation)}
      />
    </div>
  );
};

const InputError: React.FC<{ message: string }> = ({ message }) => {
  return (
    <motion.p
      className="flex items-center gap-1 px-2 font-semibold text-red-500 bg-red-100 rounded-md"
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
