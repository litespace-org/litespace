import React from "react";
import { useTheme } from "@/hooks/theme";
import Sun from "@/icons/Sun";
import cn from "classnames";
import Moon from "@/icons/Moon";
import Stars from "@/icons/Stars";
import Clouds from "@/icons/Clouds";

export const ThemeSwitch = () => {
  const { toggle, theme } = useTheme();

  return (
    <button
      onClick={toggle}
      className={cn(
        "tw-rounded-full tw-w-[103px] tw-h-[40px] tw-relative",
        "tw-overflow-hidden"
      )}
    >
      <div className="tw-bg-theme-switch-border-light tw-rounded-full tw-p-[1.3px] tw-w-full tw-h-full tw-flex tw-items-center">
        <div
          className={cn(
            "tw-absolute tw-w-full tw-h-full",
            "tw-bg-theme-switch-light dark:tw-bg-theme-switch-dark",
            "tw-shadow-ls-theme-switch-light"
          )}
        />
        {theme === "light" ? (
          <div className="tw-flex tw-relative tw-w-full tw-justify-end">
            <Clouds />
            <Sun />
          </div>
        ) : (
          <div className="tw-flex tw-items-center tw-justify-between tw-relative tw-w-full">
            <Moon />
            <Stars />
          </div>
        )}
      </div>
    </button>
  );
};
