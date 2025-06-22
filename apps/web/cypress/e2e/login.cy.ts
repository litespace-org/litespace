import { Web } from "@litespace/utils/routes";
import { IUser } from "@litespace/types";
import { wait } from "@cy/lib/utils";

describe("login page", () => {
  beforeEach(() => {
    cy.flush();
    cy.visit(Web.Login);
    cy.get("input[id=email]").clear();
    cy.get("input[id=password]").clear();
  });

  it("should login as a student", () => {
    cy.get("input[id=email]").type("student@litespace.org");
    cy.get("input[id=password]").type("Password@8");
    cy.get("form").submit();
  });

  it("should handle login with empty email and password", () => {
    cy.get("form").submit();
    cy.url().should("include", Web.Login);
    cy.get("input[id=email]").should("have.attr", "data-state", "error");
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
  });

  it("should handle login with empty email", () => {
    cy.get("input[id=password]").type("Password@8");
    cy.get("form").submit();
    cy.url().should("include", Web.Login);
    cy.get("input[id=email]").should("have.attr", "data-state", "error");
  });

  it("should handle login with empty password", () => {
    cy.get("input[id=email]").type("student-1@litespace.org");
    cy.get("form").submit();
    cy.url().should("include", Web.Login);
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
  });

  it("should handle login with non-existent user", () => {
    cy.get("input[id=email]").type("x@test.com");
    cy.get("input[id=password]").type("ValidPassword@123");
    cy.get("form").submit();
    cy.url().should("include", Web.Login);
    cy.get('[data-state="open"]').should("be.visible");
  });

  it("should handle login with incorrect password", () => {
    cy.get("input[id=email]").type("student-1@litespace.org");
    cy.get("input[id=password]").type("WrongPassword@123");
    cy.get("form").submit();
    cy.url().should("include", Web.Login);
    cy.get('[data-state="open"]').should("be.visible");
  });

  it("should handle login with invalid email format", () => {
    cy.get("input[id=email]").type("invalid-email");
    cy.get("input[id=password]").type("Password@8");
    cy.get("form").submit();
    cy.url().should("include", Web.Login);
  });

  it("should login using a user that was just created", async () => {
    await wait(
      cy.execute("users:create", {
        role: IUser.Role.Student,
        email: "test@litespace.org",
        password: "Password@9",
      })
    );

    cy.login("test@litespace.org", "Password@9");
    cy.url().should("include", Web.StudentDashboard);
  });
});
