import React, { useCallback, useMemo, useRef } from "react";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import cn from "classnames";
import { Bold, Italic, Underline, List } from "react-feather";
import { InputError } from "@/components/Input/Input";

export const TextEditor: React.FC<{
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
}> = ({ onChange, error, disabled }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const onInput = useCallback(() => {
    if (!editorRef || !editorRef.current) return;
    onChange && onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const execCommand = useCallback((command: string) => {
    document.execCommand(command, false);
  }, []);

  const actions = useMemo(() => {
    return [
      { Icon: Bold, onClick: () => execCommand("bold") },
      { Icon: Italic, onClick: () => execCommand("italic") },
      { Icon: Underline, onClick: () => execCommand("underline") },
      { Icon: List, onClick: () => execCommand("insertUnorderedList") },
    ];
  }, [execCommand]);

  return (
    <div className="w-full flex-1">
      <div className="flex gap-3 mb-2">
        {actions.map(({ Icon, onClick }, idx) => (
          <div key={idx}>
            <Button
              htmlType="button"
              type={ButtonType.Text}
              size={ButtonSize.Tiny}
              disabled={disabled}
              onClick={onClick}
              className="!w-[30px] !h-[30px]"
            >
              {<Icon className="w-[20px] h-[20px] text-foreground" />}
            </Button>
          </div>
        ))}
      </div>
      <div
        dir="rtl"
        className={cn(
          "w-full min-h-40 max-h-80 overflow-y-auto",
          "scrollbar-thin scrollbar-thumb-border-stronger scrollbar-track-surface-300",
          "font-cairo block box-border w-full rounded-md shadow-sm transition-all autofill:!bg-red-900",
          "text-foreground focus-visible:shadow-md outline-none",
          "focus:ring-current focus:ring-2 focus-visible:border-foreground-muted",
          "focus-visible:ring-background-control placeholder-foreground-muted group",
          "border border-control text-sm px-4 py-4",
          "aria-disabled:opacity-50 aria-disabled:cursor-not-allowed",
          {
            "bg-foreground/[.026]": !error,
            "bg-destructive-200 border border-destructive-400 focus:ring-destructive-400 placeholder:text-destructive-400":
              !!error,
          },
          "[&_ul]:list-disc [&_ul]:list-inside [&_ul_li]:mb-2 [&_ul]:pr-4",
          "[&_div]:leading-loose"
        )}
        contentEditable={!disabled}
        aria-disabled={disabled}
        ref={editorRef}
        onInput={onInput}
      />

      {error && <InputError message={error} />}
    </div>
  );
};
