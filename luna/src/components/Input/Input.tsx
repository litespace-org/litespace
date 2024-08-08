import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import cn from "classnames";
import ErrorOutlined from "@/icons/ErrorOutlined";
import { Dir } from "@/components/Direction";
import OpenedEye from "@/icons/OpenedEye";
import ClosedEye from "@/icons/ClosedEye";
import { InputType } from "@/components/Input/types";

const arabic =
  /[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufc3f]|[\ufe70-\ufefc]/;

export const Input: React.FC<{
  id?: string;
  placeholder?: string;
  autoComplete?: string;
  type?: InputType;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onBlur?: React.ChangeEventHandler<HTMLInputElement>;
  name?: string;
  error?: string | null;
  value?: string;
}> = ({
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
          id={id}
          type={kind}
          name={name}
          value={value}
          autoComplete={autoComplete}
          onChange={onChange}
          onBlur={onBlur}
          className={cn(
            "ui-w-full ui-bg-inputbg ui-py-[10px] ui-px-lg ui-rounded-2xl  ui-h-[72px] ui-font-cairo",
            "placeholder:ui-text-arxl placeholder:ui-font-medium ui-leading-normal placeholder:ui-text-right",
            "ui-text-arxl ui-font-bold ui-leading-normal ui-border focus:ui-outline-none focus:ui-border-blue-normal",
            {
              "ui-bg-red-light ui-border-red-border focus:ui-border-red-border":
                !!error,
              "ui-border-transparent": !error,
              "ui-text-right focus:ui-text-left": dir === Dir.LTR,
              "focus:ui-text-right":
                dir === Dir.LTR && type === InputType.Password,
            }
          )}
          placeholder={placeholder}
        />
        <ErrorIcon error={!!error} />
        {type === InputType.Password && (
          <EyeIcon show={show} error={!!error} toggle={onEyeClick} />
        )}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {error ? <InputError message={error} key={id} /> : null}
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
