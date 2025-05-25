import { Web } from "@litespace/utils/routes";

describe("login", () => {
  it("should login as a student", () => {
    cy.visit(Web.Login);
    cy.get("input[id=email]").clear().type("student-1@litespace.org");
    cy.get("input[id=password]").clear().type("Password@8");
    cy.get("form").submit();
  });
});
