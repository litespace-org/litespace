import { Web } from "@litespace/utils/routes";
import { IUser } from "@litespace/types";

describe("Student Dashboard", () => {
  beforeEach(() => {
    cy.flush();
    cy.execute("users:create", {
      role: IUser.Role.Student,
      email: "test@litespace.org",
      password: "Password@9",
    }).as("student");
    cy.login("test@litespace.org", "Password@9");
  });

  it("should visit the student dashboard", () => {
    cy.get("body").should("be.visible");
  });

  it("should navigate to the plans page", () => {
    cy.get("[data-test-id='sidebar-link-plans-promo']").click();
    cy.url().should("include", Web.Plans);
  });

  it("should navigate to the root page", () => {
    cy.get("[data-test-id='sidebar-link-root']").click();
    cy.url().should("include", Web.StudentDashboard);
  });

  it("should navigate to the tutors page", () => {
    cy.get("[data-test-id='sidebar-link-tutors']").click();
    cy.url().should("include", Web.Tutors);
  });

  it("should navigate to the lessons schedule page", () => {
    cy.get("[data-test-id='sidebar-link-lessons-schedule']").click();
    cy.url().should("include", Web.LessonsSchedule);
  });

  it("should navigate to the chat page", () => {
    cy.get("[data-test-id='sidebar-link-chat']").click();
    cy.url().should("include", Web.Chat);
  });

  it("should navigate to the plans page from sidebar", () => {
    cy.get("[data-test-id='sidebar-link-plans']").click();
    cy.url().should("include", Web.Plans);
  });

  it("should update stats for tutors", () => {
    cy.get("[data-test-id='student-dashboard.overview.teachers']").should(
      "have.text",
      "0"
    );

    cy.get("@student").then((student: any) => {
      cy.execute("db:tutor", {}).then((tutor: any) => {
        cy.execute("db:lesson", {
          tutor: tutor.id,
          student: student.id,
        });

        cy.reload();
        cy.get("[data-test-id='student-dashboard.overview.teachers']").should(
          "have.text",
          "1"
        );
      });
    });
  });

  it.only("should update stats for lessons", () => {
    cy.get("[data-test-id='student-dashboard-lessons-count']").should(
      "have.text",
      "0"
    );

    cy.get("@student").then((student: any) => {
      cy.execute("db:tutor", {}).then((tutor: any) => {
        cy.execute("db:lesson", {
          tutor: tutor.id,
          student: student.id,
        }).then(() => {
          cy.reload();
          cy.get("[data-test-id='student-dashboard-lessons-count']").should(
            "have.text",
            "1"
          );
        });
      });
    });
  });
});
