import React, { useCallback, useMemo } from "react";
import {
  Button,
  ButtonSize,
  ButtonType,
  SidebarNav,
  Switch,
  Theme,
  toaster,
  useFormatMessage,
  // LiteSpace,
  Icons,
} from "@litespace/luna";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelector, resetUserProfile } from "@/redux/user/me";
import { IUser, Void } from "@litespace/types";
import { Route } from "@/types/routes";
import { Link, useLocation } from "react-router-dom";
import cn from "classnames";
import { useMutation } from "@tanstack/react-query";
import { atlas } from "@/lib/atlas";
import { resetTutorMeta } from "@/redux/user/tutor";

const Navbar: React.FC<{
  toggleTheme: () => void;
  theme: Theme | null;
}> = ({ toggleTheme, theme }) => {
  const intl = useFormatMessage();
  const profile = useAppSelector(profileSelector);
  const location = useLocation();
  const dispatch = useAppDispatch();

  const onSuccess = useCallback(() => {
    dispatch(resetUserProfile());
    dispatch(resetTutorMeta());
  }, [dispatch]);

  const onError = useCallback(
    (error: Error | null) => {
      toaster.error({
        title: intl("error.logout.failed"),
        description: error?.message,
      });
    },
    [intl]
  );

  const logout = useMutation({
    mutationFn: () => atlas.auth.logout(),
    mutationKey: ["logout"],
    onSuccess,
    onError,
  });

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
      onClick: () => logout.mutate(),
      loading: logout.isPending,
      disabled: logout.isPending,
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
          <Icons.LiteSpace className="h-10 w-10" />
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