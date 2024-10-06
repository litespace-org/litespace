import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import cn from "classnames";
import { Link, useLocation } from "react-router-dom";
import { messages, Spinner, toaster } from "@litespace/luna";
import { Clock, CreditCard, Home, LogOut, Settings, User } from "react-feather";
import { useMutation } from "react-query";
import { atlas } from "@/lib/atlas";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { profileSelector, resetUserProfile } from "@/redux/user/me";
import { resetTutorMeta } from "@/redux/user/tutor";
import { Route, RoutePatterns } from "@/types/routes";
import UrlPattern from "url-pattern";
import { IUser } from "@litespace/types";

const Sidebar: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const profile = useAppSelector(profileSelector);

  const logout = useMutation({
    mutationFn: () => atlas.auth.logout(),
    mutationKey: "logout",
    onSuccess() {
      dispatch(resetUserProfile());
      dispatch(resetTutorMeta());
    },
    onError(error) {
      toaster.error({
        title: intl.formatMessage({ id: messages["error.logout.failed"] }),
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const tutor = useMemo(
    () => profile?.role === IUser.Role.Tutor,
    [profile?.role]
  );

  const student = useMemo(
    () => profile?.role === IUser.Role.Student,
    [profile?.role]
  );

  const pages = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: messages["sidebar.home"] }),
        Icon: Home,
        to: Route.Dashboard,
        pattern: RoutePatterns.Dashboard,
        show: !!profile,
      },
      {
        label: intl.formatMessage({ id: messages["sidebar.profile"] }),
        Icon: User,
        to: Route.Profile,
        pattern: RoutePatterns.Profile,
        show: !!profile,
      },
      {
        label: intl.formatMessage({ id: messages["sidebar.schedule"] }),
        pattern: RoutePatterns.Schedule,
        to: Route.Schedule,
        Icon: Clock,
        show: tutor,
      },
      {
        label: intl.formatMessage({ id: messages["sidebar.subscription"] }),
        pattern: RoutePatterns.Subscription,
        to: Route.Subscription,
        Icon: CreditCard,
        show: student,
      },
      {
        label: intl.formatMessage({ id: messages["sidebar.payments"] }),
        pattern: RoutePatterns.Payments,
        to: Route.Payments,
        Icon: CreditCard,
        show: tutor,
      },
      {
        label: intl.formatMessage({ id: messages["sidebar.settings"] }),
        pattern: RoutePatterns.Settings,
        to: Route.Settings,
        Icon: Settings,
        show: !!profile,
      },
      {
        label: intl.formatMessage({ id: messages["global.labels.logout"] }),
        Icon: LogOut,
        onClick: () => logout.mutate(),
        loading: logout.isLoading,
        to: location.pathname,
        show: !!profile,
      },
    ],
    [intl, location.pathname, logout, profile, student, tutor]
  );

  return (
    <div>
      <nav
        className={cn(
          "border-l h-full bg-dash-sidebar border-border hover:border-border-alternative shadow-2xl",
          "w-[15rem] pt-[48px]",
          "flex flex-col justify-start items-center text-right px-2 gap-y-1"
        )}
      >
        {pages
          .filter((page) => page.show)
          .map(({ label, Icon, loading, to, pattern, onClick }) => {
            const current =
              pattern && new UrlPattern(pattern).match(location.pathname);

            return (
              <Link
                role="button"
                to={loading ? location.pathname : to || location.pathname}
                onClick={onClick}
                key={label}
                className={cn(
                  "cursor-pointer transition-colors duration-200 relative",
                  "hover:text-foreground h-10 px-2 gap-x-3.5",
                  "flex flex-row items-center w-full rounded-md space-x-2",
                  {
                    "text-foreground bg-selection hover:bg-selection": current,
                    "text-foreground-light hover:bg-surface-200 ": !current,
                    "opacity-50 pointer-events-none": loading,
                  }
                )}
              >
                {loading ? (
                  <Spinner className="w-[20px] h-[20px]" />
                ) : (
                  <Icon className="w-[20px] h-[20px]" />
                )}
                <span>{label}</span>
              </Link>
            );
          })}
      </nav>
    </div>
  );
};

export default Sidebar;
