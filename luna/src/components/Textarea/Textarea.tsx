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
    <div className="ui-flex ui-flex-col ui-w-full">
      <div className="ui-w-full ui-relative">
        <textarea
          dir={dir}
          id={register?.name}
          value={value}
          autoComplete={autoComplete}
          {...register}
          className={cn(
            "ui-w-full ui-bg-inputbg ui-py-[20px] ui-px-[18px] ui-rounded-2xl  ui-h-[72px] ui-font-cairo",
            "placeholder:ui-text-arxl placeholder:ui-font-medium ui-leading-8 placeholder:ui-text-right",
            "ui-text-arxl ui-font-bold ui-leading-normal ui-border focus:ui-outline-none focus:ui-border-blue-normal",
            "ui-min-h-[150px] ui-max-h-[300px]",
            {
              "ui-bg-red-light ui-border-red-border focus:ui-border-red-border":
                !!error,
              "ui-border-transparent": !error,
              "ui-text-right focus:ui-text-left": dir === Dir.LTR,
              "focus:ui-text-right": dir === Dir.LTR,
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
          className="ui-absolute ui-top-[40px] ui-left-lg ui-transform -ui-translate-y-1/2"
          {...framer}
        >
          <ErrorOutlined />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
