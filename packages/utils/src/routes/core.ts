import { Dashboard, Landing, StudentSettingsTabId, Web } from "@/routes/route";
import { Env, IPlan, ISession, IShortUrl } from "@litespace/types";
import { clients } from "@/routes/clients";
import { asRegex } from "@/routes/utils";

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
  route: Web | Landing | Dashboard | Exclude<string, Web | Landing | Dashboard>,
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

type BaseQuery = Record<string, string> | string;

type BasePayload = {
  /**
   * Add full url prefix with the provided route e.g., `https://app.litespace.org/t/1`
   */
  full?: boolean;
};

type GenericPayload = {
  route: Exclude<string, Web | Landing | Dashboard>;
  query?: BaseQuery;
};

type WebPayload =
  | {
      route: Web.Lesson;
      id: number;
      query?: BaseQuery;
    }
  | {
      route: Web.TutorProfile;
      id: number;
      query?: BaseQuery;
    }
  | {
      route: Web.Register;
      role: "student" | "tutor";
      query?: BaseQuery;
    }
  | {
      route: Web.Session;
      query: {
        type: ISession.Type;
        id: string;
      };
    }
  | {
      route: Web.Checkout;
      planId: number;
      period: IPlan.PeriodLiteral;
      query?: BaseQuery;
    }
  | {
      route: Web.StudentSettings;
      query?: {
        tab?: StudentSettingsTabId;
      };
    }
  | {
      route: Exclude<
        Web,
        | Web.TutorProfile
        | Web.Lesson
        | Web.Register
        | Web.Session
        | Web.Checkout
        | Web.StudentSettings
      >;
      query?: BaseQuery;
    };

type LandingPayload =
  | {
      route: Landing.FaqRole;
      role: "student" | "tutor";
      query?: BaseQuery;
    }
  | {
      route: Landing.ShortUrl;
      name: IShortUrl.Id;
      query?: BaseQuery;
    }
  | {
      route: Exclude<Landing, Landing.FaqRole | Landing.ShortUrl>;
      query?: BaseQuery;
    };

type DashboardPayload =
  | {
      route: Dashboard.User;
      id: number;
      query?: BaseQuery;
    }
  | {
      route: Dashboard.PhotoSession;
      tutorId: number;
      query?: BaseQuery;
    }
  | {
      route: Dashboard.Tutor;
      id: number;
      query?: BaseQuery;
    }
  | {
      route: Exclude<Dashboard, Dashboard.User>;
      query?: BaseQuery;
    };

export type PayloadOf<T extends Web | Landing | Dashboard> = Extract<
  WebPayload | DashboardPayload | LandingPayload,
  { route: T }
>;

export type UrlParamsOf<T extends Web | Landing | Dashboard> = Omit<
  PayloadOf<T>,
  "query" | "route"
>;

export class RoutesManager {
  constructor(public readonly client: Env.Client) {}

  match(base: Web | Dashboard | Landing, path: string): boolean {
    return asRegex(base).test(path);
  }

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
      | WithProp<GenericPayload, { app: "noapp" }>
    )) {
    const populated = withParams(route, params);
    const updated = query ? withQuery(populated, query) : populated;
    if (full && app !== "noapp")
      return withUrl({ client: this.client, app, route: updated });
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

  generic(payload: BasePayload & GenericPayload) {
    return this.make({ ...payload, app: "noapp" });
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
