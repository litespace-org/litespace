import React, { useCallback, useState } from "react";
import cn from "classnames";

export const Popover: React.FC<{
  children?: React.ReactNode;
  content?: React.ReactNode;
  className?: string;
}> = ({ children, content, className }) => {
  const [open, setOpen] = useState<boolean>(false);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  return (
    <div className="tw-relative" onMouseEnter={show} onMouseLeave={hide}>
      <div
        data-open={open}
        className={cn(
          "tw-absolute tw-bottom-[calc(100%+20px)] tw-left-1/2 -tw-translate-x-1/2",
          'after:tw-content[""] after:tw-absolute after:-tw-bottom-[4px] after:tw-left-1/2',
          "after:tw-w-0 after:h-0 after:tw-border-4 after:tw-border-surface-400 after:tw-rotate-45 after:-tw-translate-x-1/2",
          "tw-bg-surface-400 tw-rounded tw-p-2 tw-z-50 tw-min-w-[200px] tw-text-center",
          "tw-opacity-0 data-[open=true]:tw-opacity-100 tw-invisible data-[open=true]:tw-visible tw-transition-opacity tw-duration-200 tw-ease-in",
          className
        )}
      >
        {content}
      </div>
      <div>{children}</div>
    </div>
  );
};
