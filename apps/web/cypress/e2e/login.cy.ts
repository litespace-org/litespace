import { Web } from "@litespace/utils/routes";

describe("login", () => {
  it("should login as a student", () => {
    cy.visit(Web.Login);
    cy.get("input[id=email]").clear().type("student-1@litespace.org");
    cy.get("input[id=password]").clear().type("Password@8");
    cy.get("form").submit();
  });

  it("should handle login with empty email and password", () => {
    cy.visit(Web.Login);
    cy.get("form").submit();
    
    cy.url().should("include", "/login");
  });

  it("should handle login with empty email", () => {
    cy.visit(Web.Login);
    cy.get("input[id=password]").clear().type("Password@8");
    cy.get("form").submit();
    
    cy.url().should("include", "/login");
  });

  it("should handle login with empty password", () => {
    cy.visit(Web.Login);
    cy.get("input[id=email]").clear().type("student-1@litespace.org");
    cy.get("form").submit();
    
    cy.url().should("include", "/login");
  });

  it("should handle login with non-existent user", () => {
    cy.visit(Web.Login);
    cy.get("input[id=email]").clear().type("galal@email");
    cy.get("input[id=password]").clear().type("ValidPassword@123");
    cy.get("form").submit();
    
    cy.url().should("include", "/login");
  });

  it("should handle login with incorrect password", () => {
    cy.visit(Web.Login);
    cy.get("input[id=email]").clear().type("student-1@litespace.org");
    cy.get("input[id=password]").clear().type("WrongPassword@123");
    cy.get("form").submit();
    
    cy.url().should("include", "/login");
  });

  it("should handle login with invalid email format", () => {
    cy.visit(Web.Login);
    cy.get("input[id=email]").clear().type("invalid-email");
    cy.get("input[id=password]").clear().type("Password@8");
    cy.get("form").submit();
    
    cy.url().should("include", "/login");
  });
});
