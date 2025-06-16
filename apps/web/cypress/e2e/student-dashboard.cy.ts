import { Web } from "@litespace/utils/routes";
import arEg from "@packages/ui/src/locales/ar-eg.json";

describe("Student Dashboard", () => {
  beforeEach(() => {
    cy.visit(Web.Login);
    cy.get("input[id=email]").clear();
    cy.get("input[id=email]").type("student@litespace.org");
    cy.get("input[id=password]").clear();
    cy.get("input[id=password]").type("Password@8");
    cy.get("form").submit();
    cy.url().should("include", Web.StudentDashboard);
  });

  it("should visit the student dashboard", () => {
    cy.get("body").should("be.visible");
  });

  it("should make sure student dashboard components are all visible", () => {
    // Verify main titles are visible
    cy.contains("h1", arEg["student-dashboard.overview.title"]).should(
      "be.visible"
    );

    // Verify overview statistics are visible
    cy.contains("h1", arEg["student-dashboard.overview.total-lessons"]).should(
      "be.visible"
    );
    cy.contains(
      "h1",
      arEg["student-dashboard.overview.completed-lessons"]
    ).should("be.visible");
    cy.contains(
      "h1",
      arEg["student-dashboard.overview.total-learning-time"]
    ).should("be.visible");
    cy.contains("h1", arEg["student-dashboard.overview.teachers"]).should(
      "be.visible"
    );

    // Verify section titles are visible
    cy.contains("h2", arEg["student-dashboard.upcoming-lessons.title"]).should(
      "be.visible"
    );
    cy.contains("h1", arEg["student-dashboard.past-lessons.title"]).should(
      "be.visible"
    );
    cy.contains("h2", arEg["student-dashboard.chat.title"]).should(
      "be.visible"
    );

    // Verify key action buttons are visible
    // cy.contains("button",arEg["student-dashboard.button.show-all-lessons"]).should("be.visible");
    // cy.contains("button", arEg["student-dashboard.button.find-chats"]).should("be.visible");
  });

  it("should navigate to the browse tutors page when 'Browse Tutors' is clicked", () => {
    cy.get("[data-testid=browse-tutors-link]").click();
    cy.url().should("include", Web.Tutors);
  });

  it("should be responsive on mobile and desktop", () => {
    cy.viewport(375, 667);
    cy.get(".flex-col").should("be.visible");
    cy.viewport(1280, 720);
    cy.get(".lg\\:flex-row").should("be.visible");
  });
});
