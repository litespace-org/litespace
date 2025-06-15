import { Web } from "@litespace/utils/routes";

describe("registration", () => {
  beforeEach(() => {
    cy.visit(Web.Register.replace(":role", "student"));
    cy.get("input[id=email]").clear();
    cy.get("input[id=password]").clear();
    cy.get("input[id=confirmPassword]").clear();
  });

  it("should display the registration form", () => {
    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[id=email]").should("be.visible");
    cy.get("input[id=password]").should("be.visible");
    cy.get("input[id=confirmPassword]").should("be.visible");
    cy.get("button[type=submit]").should("be.visible");
  });

  it("should register with all 3 fields empty", () => {
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 3);
    cy.get("input[id=email]").should("have.attr", "data-state", "error");
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with email filled and other 2 empty", () => {
    cy.get("input[id=email]").type("test@example.com");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 2);
    cy.get("input[id=email]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with only password filled and other 2 empty", () => {
    cy.get("input[id=password]").type("Password@123");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 2);
    cy.get("input[id=email]").should("have.attr", "data-state", "error");
    cy.get("input[id=password]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with only confirm password filled and other 2 empty", () => {
    cy.get("input[id=confirmPassword]").type("Password@123");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 2);
    cy.get("input[id=email]").should("have.attr", "data-state", "error");
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "not.have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with email and password filled, confirm password empty", () => {
    cy.get("input[id=email]").type("test@example.com");
    cy.get("input[id=password]").type("Password@123");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 1);
    cy.get("input[id=email]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=password]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with email and confirm password filled, password empty", () => {
    cy.get("input[id=email]").type("test@example.com");
    cy.get("input[id=confirmPassword]").type("Password@123");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 1);
    cy.get("input[id=email]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "not.have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with password and confirm password filled, email empty", () => {
    cy.get("input[id=password]").type("Password@123");
    cy.get("input[id=confirmPassword]").type("Password@123");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 1);
    cy.get("input[id=email]").should("have.attr", "data-state", "error");
    cy.get("input[id=password]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "not.have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with incorrect email format", () => {
    cy.get("input[id=email]").type("invalid-email");
    cy.get("input[id=password]").type("Password@123");
    cy.get("input[id=confirmPassword]").type("Password@123");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 1);
    cy.get("input[id=email]").should("have.attr", "data-state", "error");
    cy.get("input[id=password]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "not.have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with very short password", () => {
    cy.get("input[id=email]").type("test@example.com");
    cy.get("input[id=password]").type("123");
    cy.get("input[id=confirmPassword]").type("123");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 1);
    cy.get("input[id=email]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "not.have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with password without numbers", () => {
    cy.get("input[id=email]").type("test@example.com");
    cy.get("input[id=password]").type("Password@");
    cy.get("input[id=confirmPassword]").type("Password@");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 1);
    cy.get("input[id=email]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "not.have.attr",
      "data-state",
      "error"
    );
  });

  it("should register with password without capital letters", () => {
    cy.get("input[id=email]").type("test@example.com");
    cy.get("input[id=password]").type("password@123");
    cy.get("input[id=confirmPassword]").type("password@123");
    cy.get("form").submit();

    cy.url().should("include", Web.Register.replace(":role", "student"));
    cy.get("input[data-state=error]").should("have.length", 1);
    cy.get("input[id=email]").should("not.have.attr", "data-state", "error");
    cy.get("input[id=password]").should("have.attr", "data-state", "error");
    cy.get("input[id=confirmPassword]").should(
      "not.have.attr",
      "data-state",
      "error"
    );
  });
});
