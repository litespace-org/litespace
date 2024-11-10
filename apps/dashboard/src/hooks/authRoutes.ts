import { Route } from "@/lib/route";
import { useAppSelector } from "@/redux/store";
import { profileSelectors } from "@/redux/user/profile";
import { IUser } from "@litespace/types";
import { concat, entries, isEmpty } from "lodash";
import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type RouteConfig = {
  whitelist?: IUser.Role[];
  blacklist?: IUser.Role[];
  isActiveRoute?: (pathname: string) => boolean;
};

const superAdmin = IUser.Role.SuperAdmin;
const regularAdmin = IUser.Role.RegularAdmin;
const mediaProvider = IUser.Role.MediaProvider;
const interviewer = IUser.Role.Interviewer;
const tutor = IUser.Role.Tutor;
const student = IUser.Role.Student;

const BASE_WHITELIST = [superAdmin] as const;
const BASE_BALACKLIST = [tutor, student, interviewer] as const;

/**
 * @note Super Admin is included by default in all whitelists.
 * @note Tutor Manager, Tutor, and Student are included by default in all balcklists.
 */
const routeConfigMap: Record<Route, RouteConfig> = {
  [Route.Root]: {},
  [Route.Login]: {},
  [Route.Users]: {
    whitelist: [regularAdmin],
  },
  [Route.User]: {
    whitelist: [superAdmin, regularAdmin],
    isActiveRoute(pathname) {
      return pathname.startsWith(Route.User.replace(":id", ""));
    },
  },
  [Route.Invoices]: {
    whitelist: [regularAdmin],
  },
  [Route.Media]: {
    whitelist: [regularAdmin, mediaProvider],
  },
  [Route.Plans]: {
    whitelist: [regularAdmin],
  },
  [Route.Interviews]: {
    whitelist: [regularAdmin],
  },
  [Route.Lessons]: {
    whitelist: [regularAdmin],
  },
  [Route.ServerStats]: {
    whitelist: [regularAdmin],
  },
};

export function useAuthRoutes() {
  const profile = useAppSelector(profileSelectors.user);
  const navigate = useNavigate();
  const location = useLocation();

  const config = useMemo(() => {
    const pathname = location.pathname;

    for (const [route, config] of entries(routeConfigMap)) {
      const active =
        (config.isActiveRoute && config.isActiveRoute(pathname)) ||
        route === pathname;
      if (active) return config;
    }

    return null;
  }, [location.pathname]);

  useEffect(() => {
    if (!config)
      return console.warn(`No route config found for ${location.pathname}`);

    if (isEmpty(config.whitelist) && isEmpty(config.blacklist)) return;
    const role = profile?.role;

    const whitelist = concat(config.whitelist || [], BASE_WHITELIST);
    const blacklist = concat(config.blacklist || [], BASE_BALACKLIST);

    const allowed = role && whitelist.includes(role);
    const disallowed = role && blacklist.includes(role);

    if (!allowed || disallowed) return navigate(Route.Root);
  }, [navigate, profile?.role, config, location.pathname]);
}
