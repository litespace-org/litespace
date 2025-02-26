import { Dashboard, Landing, Web } from "@/routes/route";
import { Env, IUser } from "@litespace/types";
import { clients } from "@/routes/clients";

function isStrictMatch(
  base: Web | Landing | Dashboard,
  target: string
): boolean {
  const regex = new RegExp(base);
  return regex.test(target);
}

function withUrl({
  client,
  app,
  route,
}: {
  client: Env.Client;
  app: Env.App;
  route: string;
}): string {
  const base = clients[client][app];
  const url = new URL(route, base);
  return url.href;
}

function withParams(
  route: Web | Landing | Dashboard,
  params?: Record<string, string | number>
): string {
  if (!params) return route;

  let result: string = route;

  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, value.toString());
  }

  return result;
}

function withQuery<T extends Record<string, string> | string>(
  route: string,
  query: T
): string {
  const encoded = new URLSearchParams(query);
  return `${route}?${encoded}`;
}

type WithProp<U, T> = U extends U ? U & T : never;

type BasePayload = {
  /**
   * Add full url prefix to the provided route e.g., `https://app.litespace.org/t/1`
   */
  full?: boolean;
  query?: Record<string, string> | string;
};

type WebPayload =
  | {
      route: Web.TutorProfile | Web.Lesson;
      id: number;
    }
  | {
      route: Web.Register;
      role: IUser.Role.Student | IUser.Role.Tutor;
    }
  | {
      route: Exclude<Web, Web.TutorProfile | Web.Lesson | Web.Register>;
    };

type LandingPayload =
  | {
      route: Landing.FaqRole;
      role: IUser.Role.Student | IUser.Role.Tutor;
    }
  | {
      route: Exclude<Landing, Landing.FaqRole>;
    };

type DashboardPayload =
  | {
      route: Dashboard.User;
      id: number;
    }
  | {
      route: Exclude<Dashboard, Dashboard.User>;
    };

export class RoutesManager {
  constructor(public readonly client: Env.Client) {}

  public readonly isMatch = {
    web(base: Web, target: string): boolean {
      // https://regex101.com/r/INHWi0/1
      if (base === Web.Register)
        return /\/(tutor|student)\/register\/?/.test(target);
      // https://regex101.com/r/a1B4Dw/1
      if (Web.TutorProfile) return /\/?t\/([^/]+)\/?/.test(target);
      // https://regex101.com/r/jbiJh7/1
      if (Web.Lesson) return /\/?lesson\/([^/]+)\/?/.test(target);
      return isStrictMatch(base, target);
    },
    landing(base: Landing, target: string): boolean {
      return isStrictMatch(base, target);
    },
    dashboard(base: Dashboard, target: string): boolean {
      // https://regex101.com/r/20073X/1
      if (base === Dashboard.User) return /\/?user\/([^/]+)\/?/.test(target);
      return isStrictMatch(base, target);
    },
  };

  private make({
    full,
    route,
    query,
    app,
    ...params
  }: BasePayload &
    (
      | WithProp<WebPayload, { app: "web" }>
      | WithProp<LandingPayload, { app: "landing" }>
      | WithProp<DashboardPayload, { app: "dashboard" }>
    )) {
    const populated = withParams(route, params);
    const updated = query ? withQuery(populated, query) : populated;
    if (full) return withUrl({ client: this.client, app, route: updated });
    return updated;
  }

  web(payload: BasePayload & WebPayload) {
    return this.make({ ...payload, app: "web" });
  }

  landing(payload: BasePayload & LandingPayload) {
    return this.make({ ...payload, app: "landing" });
  }

  dashboard(payload: BasePayload & DashboardPayload) {
    return this.make({ ...payload, app: "dashboard" });
  }
}

export function isValidRoute(route: string): boolean {
  try {
    new URL(route, "https://example.com");
    return true;
  } catch (_error) {
    return false;
  }
}
