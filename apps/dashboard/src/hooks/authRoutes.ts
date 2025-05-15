import { router } from "@/lib/route";
import { useUserContext } from "@litespace/headless/context/user";
import { IUser } from "@litespace/types";
import { Dashboard } from "@litespace/utils/routes";
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
const studio = IUser.Role.Studio;
const tutorManager = IUser.Role.TutorManager;
const tutor = IUser.Role.Tutor;
const student = IUser.Role.Student;

const BASE_WHITELIST = [superAdmin] as const;
const BASE_BALACKLIST = [tutor, student, tutorManager] as const;

/**
 * @note Super Admin is included by default in all whitelists.
 * @note Tutor Manager, Tutor, and Student are included by default in all balcklists.
 */
const routeConfigMap: Record<Dashboard, RouteConfig> = {
  [Dashboard.Root]: {},
  [Dashboard.Login]: {},
  [Dashboard.Users]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.User]: {
    whitelist: [superAdmin, regularAdmin],
  },
  [Dashboard.Invoices]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.Media]: {
    whitelist: [regularAdmin, studio],
  },
  [Dashboard.Plans]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.Interviews]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.Lessons]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.ServerStats]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.PlatformSettings]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.Topics]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.UserSetting]: {
    whitelist: [regularAdmin, studio],
  },
  [Dashboard.PhotoSession]: {
    whitelist: [regularAdmin, studio],
  },
  [Dashboard.PhotoSessions]: {
    whitelist: [regularAdmin, studio],
  },
  [Dashboard.Tutor]: {
    whitelist: [regularAdmin],
  },
  [Dashboard.Tutors]: {
    whitelist: [superAdmin, regularAdmin],
  },
};

export function useAuthRoutes() {
  const { user } = useUserContext();
  const navigate = useNavigate();
  const location = useLocation();

  const config = useMemo(() => {
    const pathname = location.pathname;

    for (const [route, config] of entries(routeConfigMap)) {
      const active = router.match(route as Dashboard, pathname);
      if (active) return config;
    }

    return null;
  }, [location.pathname]);

  useEffect(() => {
    if (!config)
      return console.warn(`No route config found for ${location.pathname}`);
    if (isEmpty(config.whitelist) && isEmpty(config.blacklist)) return;

    const role = user?.role;

    const whitelist = concat(config.whitelist || [], BASE_WHITELIST);
    const blacklist = concat(config.blacklist || [], BASE_BALACKLIST);

    const allowed = role && whitelist.includes(role);
    const disallowed = role && blacklist.includes(role);

    if (!allowed || disallowed) return navigate(Dashboard.Root);
  }, [navigate, config, location.pathname, user?.role]);
}
