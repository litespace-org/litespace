import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import ErrorOutlined from "@/icons/ErrorOutlined";
import { Dir } from "@/components/Direction";
import { UseFormRegisterReturn } from "react-hook-form";

const arabic =
  /[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufc3f]|[\ufe70-\ufefc]/;

export const Textarea: React.FC<{
  placeholder?: string;
  autoComplete?: string;
  error?: string | null;
  value?: string;
  register?: UseFormRegisterReturn;
  className?: string;
}> = ({ placeholder, autoComplete, error, value, register, className }) => {
  const dir: Dir | undefined = useMemo(() => {
    if (!value) return undefined;
    if (arabic.test(value[0])) return Dir.RTL;
    return Dir.LTR;
  }, [value]);

  return (
    <div className="tw-flex tw-flex-col tw-w-full">
      <div className="tw-w-full tw-relative">
        <textarea
          dir={dir}
          id={register?.name}
          value={value}
          autoComplete={autoComplete}
          {...register}
          className={cn(
            "tw-w-full tw-bg-inputbg tw-py-[20px] tw-px-[18px] tw-rounded-2xl  tw-h-[72px] tw-font-cairo",
            "placeholder:tw-text-arxl placeholder:tw-font-medium tw-leading-8 placeholder:tw-text-right",
            "tw-text-arxl tw-font-bold tw-leading-normal tw-border focus:tw-outline-none focus:tw-border-blue-normal",
            "tw-min-h-[150px] tw-max-h-[300px]",
            {
              "tw-bg-red-light tw-border-red-border focus:tw-border-red-border":
                !!error,
              "tw-border-transparent": !error,
              "tw-text-right focus:tw-text-left": dir === Dir.LTR,
              "focus:tw-text-right": dir === Dir.LTR,
            },
            className
          )}
          placeholder={placeholder}
        />
        <ErrorIcon error={!!error} />
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
    <motion.p className="tw-text-arsm tw-text-red-400" {...framer}>
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
          className="tw-absolute tw-top-[40px] tw-left-lg tw-transform -tw-translate-y-1/2"
          {...framer}
        >
          <ErrorOutlined />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
