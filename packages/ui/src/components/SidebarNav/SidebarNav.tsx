import React, { useRef } from "react";
import { Sidebar } from "react-feather";
import { Button } from "@/components/Button";
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
    <nav className="tw-relative">
      <div ref={button}>
        <Button
          onClick={toggle}
          size={"small"}
          type={"main"}
          variant={"secondary"}
          className="!tw-p-2"
        >
          <Sidebar className="tw-w-6 tw-h-6" />
        </Button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <div
            className={cn(
              "tw-fixed tw-right-0 tw-top-0 tw-h-screen tw-w-screen tw-backdrop-blur-sm tw-z-[1000]"
            )}
          >
            <motion.ul
              {...framerSidebarBackground}
              className={cn(
                "tw-flex tw-flex-row tw-gap-4 tw-bg-background-dialog tw-h-full tw-w-96",
                "tw-border-l tw-border-border-overlay tw-rounded-l-md tw-shadow-lg",
                "tw-flex tw-flex-col tw-items-center tw-p-6"
              )}
              ref={ref}
            >
              {options.map((option) => {
                return (
                  <li key={option.label} className="tw-w-full">
                    <Link
                      to={option.route}
                      onClick={toggle}
                      className="tw-w-full tw-inline-block"
                    >
                      <Button
                        onClick={option.onClick}
                        loading={option.loading}
                        disabled={option.disabled}
                        className={cn(
                          "!w-full",
                          location.pathname === option.route && "bg-surface-200"
                        )}
                        size={"small"}
                        type={"main"}
                        variant={"secondary"}
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
