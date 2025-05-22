import { RoutesManager } from "@/routes";
import { Dashboard, Landing, Web } from "@/routes/route";
import { asRegex } from "@/routes/utils";
import { nameof } from "@/utils";
import { expect } from "chai";

describe(nameof(RoutesManager), () => {
  it("should populate url route with the required params", () => {
    const routes = new RoutesManager("local");
    expect(routes.web({ route: Web.Register, role: "student" })).to.be.eq(
      "/register/student"
    );

    expect(routes.web({ route: Web.Register, role: "tutor" })).to.be.eq(
      "/register/tutor"
    );

    expect(routes.web({ route: Web.Lesson, id: 1 })).to.be.eq("/lesson/1");

    expect(routes.dashboard({ route: Dashboard.User, id: 1 })).to.be.eq(
      "/user/1"
    );
  });

  it("should prefix the route with the full url", () => {
    const routes = new RoutesManager("production");
    expect(
      routes.web({
        route: Web.Register,
        role: "student",
        full: true,
      })
    ).to.be.eq("https://app.litespace.org/register/student");

    expect(routes.landing({ route: Landing.Terms, full: true })).to.be.eq(
      "https://litespace.org/terms"
    );

    expect(
      routes.dashboard({ route: Dashboard.User, id: 1, full: true })
    ).to.be.eq("https://dashboard.litespace.org/user/1");
  });

  it("should include url queries", () => {
    const routes = new RoutesManager("production");
    expect(
      routes.web({
        route: Web.Register,
        role: "student",
        query: { src: "fb" },
        full: true,
      })
    ).to.be.eq("https://app.litespace.org/register/student?src=fb");

    expect(
      routes.web({ route: Web.Login, query: { redirect: Web.Plans } })
    ).to.be.eq("/login?redirect=%2plans");
    expect(
      routes.landing({
        query: { role: "tutor" },
        route: Landing.Terms,
        full: true,
      })
    ).to.be.eq("https://litespace.org/terms?role=tutor");

    expect(
      routes.dashboard({
        route: Dashboard.User,
        query: { key: "value" },
        full: true,
        id: 1,
      })
    ).to.be.eq("https://dashboard.litespace.org/user/1?key=value");
  });
});

describe(nameof(asRegex), () => {
  it("should convert url path to regex", () => {
    expect(asRegex("/test/:id/:session")).to.be.deep.eq(
      /^\/?test\/([^/]+)\/([^/]+)\/?$/
    );

    expect(asRegex("test/:id/:session")).to.be.deep.eq(
      /^\/?test\/([^/]+)\/([^/]+)\/?$/
    );

    expect(asRegex("test/:id/:session/")).to.be.deep.eq(
      /^\/?test\/([^/]+)\/([^/]+)\/?$/
    );

    expect(asRegex(Web.Checkout)).to.be.deep.eq(
      /^\/?checkout\/([^/]+)\/([^/]+)\/?$/
    );

    expect(asRegex(Web.Lesson)).to.be.deep.eq(/^\/?lesson\/([^/]+)\/?$/);
  });
});
