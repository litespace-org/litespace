import { RoutesManager } from "@/routes";
import { Dashboard, Landing, Web } from "@/routes/route";
import { expect } from "chai";

describe("Routes", () => {
  it("should populate url route with the required params", () => {
    const routes = new RoutesManager("local");
    expect(routes.web({ route: Web.Register, role: "student" })).to.be.eq(
      "/student/register"
    );

    expect(routes.web({ route: Web.Register, role: "tutor" })).to.be.eq(
      "/tutor/register"
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
    ).to.be.eq("https://app.litespace.org/student/register");

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
    ).to.be.eq("https://app.litespace.org/student/register?src=fb");

    expect(
      routes.web({ route: Web.Login, query: { redirect: Web.VerifyEmail } })
    ).to.be.eq("/login?redirect=%2Fverify-email");
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
