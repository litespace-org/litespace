import React, { useCallback, useMemo } from "react";
import {
  Button,
  ButtonSize,
  ButtonType,
  SidebarNav,
  Switch,
  Theme,
  useFormatMessage,
  removeToken,
} from "@litespace/luna";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelectors, resetUserProfile } from "@/redux/user/profile";
import { IUser, Void } from "@litespace/types";
import { Route } from "@/types/routes";
import { Link, useLocation } from "react-router-dom";
import cn from "classnames";
import { resetTutorMeta } from "@/redux/user/tutor";
import Logo from "@litespace/assets/logo.svg";

const Navbar: React.FC<{
  toggleTheme: () => void;
  theme: Theme | null;
}> = ({ toggleTheme, theme }) => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelectors.user);
  const location = useLocation();
  const dispatch = useAppDispatch();

  const logout = useCallback(() => {
    removeToken();
    dispatch(resetUserProfile());
    dispatch(resetTutorMeta());
  }, [dispatch]);

  const links = useMemo((): Array<{
    label: string;
    route: string;
    onClick?: Void;
    loading?: boolean;
    disabled?: boolean;
  }> => {
    const role = profile?.role;
    const student = role === IUser.Role.Student;
    const tutor = role === IUser.Role.Tutor;
    const interviewer = role === IUser.Role.Interviewer;

    const logoutOption = {
      label: intl("navbar.logout"),
      route: "",
      onClick: logout,
    };

    if (student)
      return [
        {
          label: intl("navbar.lessons"),
          route: Route.Lessons,
        },
        {
          label: intl("navbar.tutors"),
          route: Route.Tutors,
        },
        {
          label: intl("navbar.subscription"),
          route: Route.Subscription,
        },
        {
          label: intl("navbar.settings"),
          route: Route.Settings,
        },
        logoutOption,
      ];

    if (tutor)
      return [
        {
          label: intl("navbar.lessons"),
          route: Route.Lessons,
        },
        {
          label: intl("navbar.schedule"),
          route: Route.Schedule,
        },
        {
          label: intl("navbar.invoices"),
          route: Route.Invoices,
        },
        {
          label: intl("navbar.settings"),
          route: Route.Settings,
        },
        logoutOption,
      ];

    if (interviewer)
      return [
        {
          label: intl("navbar.interviews"),
          route: Route.Interviews,
        },
        {
          label: intl("navbar.schedule"),
          route: Route.Schedule,
        },
        {
          label: intl("navbar.settings"),
          route: Route.Settings,
        },
        logoutOption,
      ];

    return [];
  }, [intl, logout, profile?.role]);

  return (
    <nav className="border-b border-border-overlay h-16">
      <div className={cn("px-6 flex flex-row items-center gap-6 h-full")}>
        <div
          data-empty={links.length === 0}
          className="block data-[empty=true]:hidden md:hidden"
        >
          <SidebarNav options={links} />
        </div>

        <div>
          <Logo className="h-10 w-10" />
        </div>

        <ul className="hidden md:flex flex-row gap-4">
          {links.map((link) => {
            return (
              <li key={link.label}>
                <Link to={link.route}>
                  <Button
                    onClick={link.onClick}
                    loading={link.loading}
                    disabled={link.disabled}
                    className={cn(
                      location.pathname === link.route && "bg-surface-200"
                    )}
                    size={ButtonSize.Small}
                    type={ButtonType.Text}
                  >
                    {link.label}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mr-auto">
          <Switch checked={theme === Theme.Dark} onChange={toggleTheme} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
