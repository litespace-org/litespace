import React, { useCallback, useMemo, useRef } from "react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import cn from "classnames";
import { Bold, Italic, Underline, List } from "react-feather";
import { Helper } from "@/components/Input/Input";
import Editable, { ContentEditableEvent } from "react-contenteditable";
import { RawHtml } from "@/components/RawHtml";
import { AnimatePresence } from "framer-motion";
import { HeadingIcon } from "@radix-ui/react-icons";
import { ButtonVariant } from "../Button/types";
import { Typography } from "../Typography";

export const TextEditor: React.FC<{
  value: string;
  setValue: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}> = ({ error, disabled, className, value, setValue }) => {
  const text = useRef("");
  const execCommand = useCallback((command: string, arg?: string) => {
    document.execCommand(command, false, arg);
  }, []);

  const actions = useMemo(() => {
    return [
      { Icon: Bold, onClick: () => execCommand("bold") },
      { Icon: Italic, onClick: () => execCommand("italic") },
      { Icon: Underline, onClick: () => execCommand("underline") },
      { Icon: List, onClick: () => execCommand("insertUnorderedList") },
      {
        Icon: HeadingIcon,
        onClick: () => {
          const selection = window.getSelection()?.toString() || "";
          execCommand("insertHTML", `<div><h3>${selection}</h3></div>`);
        },
      },
    ];
  }, [execCommand]);

  const onChange = useCallback(
    (event: ContentEditableEvent) => {
      const value = event.target.value;
      text.current = value;
      setValue(value);
    },
    [setValue]
  );

  const onPast = useCallback(
    async (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const text = await navigator.clipboard.readText();
      return execCommand("insertText", text);
    },
    [execCommand]
  );

  return (
    <div>
      <div className="tw-flex tw-gap-3 tw-mb-2">
        {actions.map(({ Icon, onClick }, idx) => (
          <div key={idx}>
            <Button
              htmlType="button"
              type={ButtonType.Main}
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Tiny}
              disabled={disabled}
              onClick={onClick}
              className="!tw-w-[30px] !tw-h-[30px]"
            >
              {<Icon className="tw-w-[20px] tw-h-[20px] tw-text-foreground" />}
            </Button>
          </div>
        ))}
      </div>
      <RawHtml>
        <Editable
          html={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "tw-w-full tw-min-h-40 tw-max-h-80 tw-overflow-y-auto",
            "tw-scrollbar-thin tw-scrollbar-thumb-border-stronger tw-scrollbar-track-surface-300",
            "tw-font-cairo tw-block tw-box-border tw-w-full tw-rounded-md tw-shadow-sm tw-transition-all",
            "tw-text-foreground focus-visible:tw-shadow-md tw-outline-none",
            "focus:tw-ring-current focus:tw-ring-2 focus-visible:tw-border-foreground-muted",
            "focus-visible:tw-ring-background-control tw-placeholder-foreground-muted",
            "tw-border tw-border-control tw-text-sm tw-px-4 tw-py-4",
            "aria-disabled:tw-opacity-50 aria-disabled:tw-cursor-not-allowed",
            {
              "tw-bg-foreground/[.026]": !error,
              "tw-bg-destructive-200 tw-border tw-border-destructive-400 focus:tw-ring-destructive-400 placeholder:tw-text-destructive-400":
                !!error,
            },
            className
          )}
          dir="auto"
          onPaste={onPast}
        />
      </RawHtml>

      <AnimatePresence mode="wait" initial={false}>
        {error ? (
          <Helper>
            <Typography element="tiny-text" className="tw-text-destructive-500">
              {error}
            </Typography>
          </Helper>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
