import React, { useRef, useCallback } from "react";
import { Moon, Sidebar, Sun, User } from "react-feather";
import { Button, ButtonSize, ButtonType } from "@litespace/luna/Button";
import { Switch } from "@litespace/luna/Switch";
import { removeToken } from "@litespace/luna/cache";
import { useTheme, Theme } from "@litespace/luna/hooks/theme";
import { useFormatMessage } from "@litespace/luna/hooks/intl";
import { useClosableRef } from "@litespace/luna/hooks/dom";
import cn from "classnames";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelectors, resetUserProfile } from "@/redux/user/profile";
import { Route } from "@/lib/route";
import { SideBarAccordion } from "@/components/common/SideBarAccordion";
import { NavAccordionItem, NavOption } from "@/types/navbar";
import SideBarItem from "@/components/common/SideBarItem";

const framerSidebarBackground = {
  initial: { x: "30rem", y: "0rem" },
  animate: { x: "0rem", y: "0rem" },
  exit: { x: "20rem", y: "0rem" },
  transition: { duration: 0.2 },
};

const SidebarNav: React.FC<{
  options: (NavOption | NavAccordionItem)[];
}> = ({ options }) => {
  const dispatch = useAppDispatch();
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.user);

  const button = useRef<HTMLDivElement>(null);
  const { toggle: toggleTheme, theme } = useTheme();
  const navigate = useNavigate();
  const {
    toggle: toggleMenu,
    open,
    ref,
    show,
    hide,
  } = useClosableRef<HTMLUListElement>(button.current);

  const logout = useCallback(() => {
    removeToken();
    dispatch(resetUserProfile());
    navigate(Route.Login);
  }, [dispatch, navigate]);

  return (
    <nav className="relative">
      <div
        ref={button}
        className="fixed flex flex-col items-center justify-between h-screen p-2 border-l border-border-strong"
        onMouseEnter={show}
      >
        <Button onClick={toggleMenu} type={ButtonType.Text} className="!p-2">
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
              onMouseLeave={hide}
              ref={ref}
            >
              <div className="flex items-start border border-border-strong rounded-md p-1 w-full gap-2">
                <div>
                  {profile?.image ? (
                    <div className="overflow-hidden border-2 border-white rounded-full">
                      <img
                        src={profile.image}
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div className="grow">
                  <h3>{profile?.name}</h3>
                  <p className="text-foreground-light">{profile?.email}</p>
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
              <div className="flex flex-row items-center justify-center w-full gap-4">
                <div className="flex gap-1">
                  <Sun />
                  <Switch
                    checked={theme === Theme.Dark}
                    onChange={toggleTheme}
                  />
                  <Moon />
                </div>
                <Button
                  onClick={logout}
                  className="w-full"
                  size={ButtonSize.Small}
                  type={ButtonType.Secondary}
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
