import React, { useRef } from "react";
import { Sidebar } from "react-feather";
import { Button, ButtonSize, ButtonType } from "@/components/Button";
import { NavOption } from "@/components/SidebarNav/types";
import { useClosableRef } from "@/hooks";
import cn from "classnames";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const framerSidebarBackground = {
  initial: { x: "30rem", y: "0rem" },
  animate: { x: "0rem", y: "0rem" },
  exit: { x: "20rem", y: "0rem" },
  transition: { duration: 0.2 },
};

const SidebarNav: React.FC<{
  options: NavOption[];
}> = ({ options }) => {
  const button = useRef<HTMLDivElement>(null);
  const { toggle, open, ref } = useClosableRef<HTMLUListElement>(
    button.current
  );

  return (
    <nav className="relative">
      <div ref={button}>
        <Button
          onClick={toggle}
          size={ButtonSize.Small}
          type={ButtonType.Text}
          className="!p-2"
        >
          <Sidebar className="w-6 h-6" />
        </Button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <div
            className={cn(
              "fixed right-0 top-0 h-screen w-screen backdrop-blur-sm z-[1000]"
            )}
          >
            <motion.ul
              {...framerSidebarBackground}
              className={cn(
                "flex flex-row gap-4 bg-background-dialog h-full w-96",
                "border-l border-border-overlay rounded-l-md shadow-lg",
                "flex flex-col items-center p-6"
              )}
              ref={ref}
            >
              {options.map((option) => {
                return (
                  <li key={option.label} className="w-full">
                    <Link
                      to={option.route}
                      onClick={toggle}
                      className="w-full inline-block"
                    >
                      <Button
                        onClick={option.onClick}
                        loading={option.loading}
                        disabled={option.disabled}
                        className={cn(
                          "!w-full",
                          location.pathname === option.route && "bg-surface-200"
                        )}
                        size={ButtonSize.Small}
                        type={ButtonType.Text}
                      >
                        {option.label}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </motion.ul>
          </div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
};

export default SidebarNav;
