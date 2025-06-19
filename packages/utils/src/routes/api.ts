import { ApiRoutes } from "@/routes/route";

type ApiBase = keyof typeof ApiRoutes;

type RouteDescriptor<
  BASE extends ApiBase,
  SUB extends keyof (typeof ApiRoutes)[BASE]["routes"],
> = {
  base: BASE;
  subRoute?: SUB;
};

export class ApiRoutesManager {
  private readonly apiBasePath: string;

  constructor() {
    this.apiBasePath = "/api/v1";
  }

  private replaceParams<Path extends string>(
    path: Path,
    params: Record<string, string | number>
  ): string {
    return path.replace(/:([a-zA-Z0-9]+)/g, (_, key) => {
      const value = params[key];
      if (value === undefined) {
        throw new Error(`Missing parameter: ${key}`);
      }
      return value.toString();
    });
  }

  generateUrl<
    BASE extends ApiBase,
    SUB extends keyof (typeof ApiRoutes)[BASE]["routes"],
  >({
    route,
    params = {},
    type = "full",
  }: {
    route: RouteDescriptor<BASE, SUB>;
    params?: Record<string, string | number>;
    type?: "full" | "base";
  }): string {
    const baseRoute = ApiRoutes[route.base].base;
    const subPath = route.subRoute
      ? ApiRoutes[route.base].routes[route.subRoute]
      : "";

    let pathSegment = "";
    switch (type) {
      case "full":
        pathSegment = `${baseRoute}${subPath}`;
        break;
      case "base":
        pathSegment = baseRoute;
        break;
    }

    const replacedPath = this.replaceParams(pathSegment, params);
    return `${this.apiBasePath}${replacedPath}`;
  }
}
