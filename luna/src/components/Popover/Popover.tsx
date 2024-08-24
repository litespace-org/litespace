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
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <div
        data-open={open}
        className={cn(
          "absolute bottom-[calc(100%+20px)] left-1/2 -translate-x-1/2",
          'after:content[""] after:absolute after:-bottom-[4px] after:left-1/2',
          "after:w-0 after:h-0 after:border-4 after:border-surface-400 after:rotate-45 after:-translate-x-1/2",
          "bg-surface-400 rounded p-2 z-50 whitespace-nowrap",
          "opacity-0 data-[open=true]:opacity-100 transition-opacity duration-200 ease-in",
          className
        )}
      >
        {content}
      </div>
      <div>{children}</div>
    </div>
  );
};
