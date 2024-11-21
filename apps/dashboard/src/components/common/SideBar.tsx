import React, { useRef } from "react";
import { Moon, Sidebar, Sun, User } from "react-feather";
import { Button, ButtonSize, ButtonType } from "@litespace/luna/Button";
import { Switch } from "@litespace/luna/Switch";
import { useTheme, Theme } from "@litespace/luna/hooks/theme";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useClosableRef } from "@litespace/luna/hooks/dom";
import cn from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { SideBarAccordion } from "@/components/common/SideBarAccordion";
import { NavAccordionItem, NavOption } from "@/types/navbar";
import SideBarItem from "@/components/common/SideBarItem";
import { ButtonVariant } from "@litespace/luna/Button";
import { useUser } from "@litespace/headless/user-ctx";

const framerSidebarBackground = {
  initial: { x: "30rem", y: "0rem" },
  animate: { x: "0rem", y: "0rem" },
  exit: { x: "20rem", y: "0rem" },
  transition: { duration: 0.2 },
};

const SidebarNav: React.FC<{
  options: (NavOption | NavAccordionItem)[];
}> = ({ options }) => {
  const intl = useFormatMessage();
  const { user, logout } = useUser();

  const button = useRef<HTMLDivElement>(null);
  const { toggle: toggleTheme, theme } = useTheme();
  const {
    toggle: toggleMenu,
    open,
    ref,
    hide,
  } = useClosableRef<HTMLUListElement>(button.current);

  return (
    <nav className="relative">
      <div
        ref={button}
        className="fixed flex flex-col items-center justify-between h-screen p-2 border-l border-border-strong"
      >
        <Button
          onClick={toggleMenu}
          type={ButtonType.Main}
          variant={ButtonVariant.Primary}
          className="!w-14 !h-14"
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
                "bg-background-dialog h-full w-72 justify-between",
                "border-l border-border-overlay rounded-l-md shadow-lg",
                "flex flex-col items-center p-6"
              )}
              ref={ref}
            >
              <div className="flex items-start w-full gap-2 p-1 border rounded-md border-border-strong">
                <div>
                  {user?.image ? (
                    <div className="overflow-hidden border-2 border-white rounded-full">
                      <img src={user.image} className="w-8 h-8 rounded-full" />
                    </div>
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div className="grow">
                  <h3>{user?.name}</h3>
                  <p className="text-foreground-light">{user?.email}</p>
                </div>
              </div>

              <div className="flex flex-col w-full gap-1 mt-6 text-3xl grow">
                {options.map((option) => {
                  if ("label" in option)
                    return (
                      <SideBarItem
                        key={option.label}
                        option={option}
                        onClick={toggleMenu}
                      />
                    );

                  return (
                    <SideBarAccordion
                      key={option.title}
                      onClick={toggleMenu}
                      item={option}
                    />
                  );
                })}
              </div>
              <div className="flex flex-col items-center justify-center w-full gap-4">
                <div className="flex gap-1">
                  <Sun />
                  <Switch
                    checked={theme === Theme.Dark}
                    onChange={toggleTheme}
                  />
                  <Moon />
                </div>
                <Button
                  onClick={() => {
                    logout();
                    hide();
                  }}
                  className="w-full"
                  size={ButtonSize.Small}
                  type={ButtonType.Error}
                  variant={ButtonVariant.Secondary}
                >
                  {intl("navbar.logout")}
                </Button>
              </div>
            </motion.ul>
          </div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
};

export default SidebarNav;
