import { router } from "@cy/lib/router";
import { Web } from "@litespace/utils/routes";

const SELECTORS = {
  emailInput: "input[id=email]",
  passwordInput: "input[id=password]",
  confirmPasswordInput: "input[id=confirmPassword]",
  submitButton: "button[type=submit]",
  form: "form",
  errorInput: "input[data-state=error]",
};

const REGISTER_URL_STUDENT = router.web({
  route: Web.Register,
  role: "student",
});

function checkInputErrorState(selector: string, hasError: boolean) {
  cy.get(selector).should(
    hasError ? "have.attr" : "not.have.attr",
    "data-state",
    "error"
  );
}

describe("student registration page", () => {
  beforeEach(() => {
    cy.visit(router.web({ route: Web.Register, role: "student" }));
  });

  it("should correctly display all registration form elements", () => {
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get("input[id=email]").should("be.visible");
    cy.get("input[id=password]").should("be.visible");
    cy.get("input[id=confirmPassword]").should("be.visible");
    cy.get("button[type=submit]").should("be.visible");
  });

  it("should display validation errors for all fields when submitting an empty form", () => {
    cy.get("form").submit();
    cy.checkInputState("input[id=email]", "error");
    cy.checkInputState("input[id=password]", "error");
    cy.checkInputState("input[id=confirmPassword]", "error");
  });

  it("should display validation errors for password and confirm password when only email is provided", () => {
    cy.get("input[id=email]").type("test@email.com");
    cy.get("form").submit();
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get("input[data-state=error]").should("have.length", 2);
    cy.checkInputState("input[id=password]", "error");
    cy.checkInputState("input[id=confirmPassword]", "error");
  });

  it("should display validation errors for email and confirm password when only password is provided", () => {
    cy.get("input[id=password]").type("Password@8");
    cy.get("form").submit();
    cy.checkErroredInputsCount(2);
    cy.checkInputState("input[id=email]", "error");
    cy.checkInputState("input[id=password]", "idle");
    cy.checkInputState("input[id=confirmPassword]", "error");
  });

  it("should display validation errors for all inputs incase only the confirm password is provided", () => {
    cy.get("input[id=confirmPassword]").type("Password@8");
    cy.get("form").submit();
    cy.checkErroredInputsCount(3);
    cy.checkInputState("input[id=email]", "error");
    cy.checkInputState("input[id=password]", "error");
    cy.checkInputState("input[id=confirmPassword]", "error");
  });

  it.skip("should display a validation error for confirm password when email and password are provided but confirm password is not", () => {
    cy.get(SELECTORS.emailInput).type("test@email.com");
    cy.get(SELECTORS.passwordInput).type("Password@8");
    cy.get(SELECTORS.form).submit();
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get(SELECTORS.errorInput).should("have.length", 1);
    checkInputErrorState(SELECTORS.emailInput, false);
    checkInputErrorState(SELECTORS.passwordInput, false);
    checkInputErrorState(SELECTORS.confirmPasswordInput, true);
  });

  it.skip("should display a validation error for password when email and confirm password are provided but password is not", () => {
    cy.get(SELECTORS.emailInput).type("test@email.com");
    cy.get(SELECTORS.confirmPasswordInput).type("Password@8");
    cy.get(SELECTORS.form).submit();
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get(SELECTORS.errorInput).should("have.length", 1);
    checkInputErrorState(SELECTORS.emailInput, false);
    checkInputErrorState(SELECTORS.passwordInput, true);
    checkInputErrorState(SELECTORS.confirmPasswordInput, false);
  });

  it.skip("should display a validation error for email when password and confirm password are provided but email is not", () => {
    cy.get(SELECTORS.passwordInput).type("Password@8");
    cy.get(SELECTORS.confirmPasswordInput).type("Password@8");
    cy.get(SELECTORS.form).submit();
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get(SELECTORS.errorInput).should("have.length", 1);
    checkInputErrorState(SELECTORS.emailInput, true);
    checkInputErrorState(SELECTORS.passwordInput, false);
    checkInputErrorState(SELECTORS.confirmPasswordInput, false);
  });

  it.skip("should display a validation error for email when an invalid email format is used", () => {
    cy.get(SELECTORS.emailInput).type("invalid-email");
    cy.get(SELECTORS.passwordInput).type("Password@8");
    cy.get(SELECTORS.confirmPasswordInput).type("Password@8");
    cy.get(SELECTORS.form).submit();
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get(SELECTORS.errorInput).should("have.length", 1);
    checkInputErrorState(SELECTORS.emailInput, true);
    checkInputErrorState(SELECTORS.passwordInput, false);
    checkInputErrorState(SELECTORS.confirmPasswordInput, false);
  });

  it.skip("should display a validation error for password when the provided password is too short", () => {
    cy.get(SELECTORS.emailInput).type("test@email.com");
    cy.get(SELECTORS.passwordInput).type("123");
    cy.get(SELECTORS.confirmPasswordInput).type("123");
    cy.get(SELECTORS.form).submit();
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get(SELECTORS.errorInput).should("have.length", 1);
    checkInputErrorState(SELECTORS.emailInput, false);
    checkInputErrorState(SELECTORS.passwordInput, true);
    checkInputErrorState(SELECTORS.confirmPasswordInput, false);
  });

  it.skip("should display a validation error for password when the password does not contain numbers", () => {
    cy.get(SELECTORS.emailInput).type("test@email.com");
    cy.get(SELECTORS.passwordInput).type("Password@");
    cy.get(SELECTORS.confirmPasswordInput).type("Password@");
    cy.get(SELECTORS.form).submit();
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get(SELECTORS.errorInput).should("have.length", 1);
    checkInputErrorState(SELECTORS.emailInput, false);
    checkInputErrorState(SELECTORS.passwordInput, true);
    checkInputErrorState(SELECTORS.confirmPasswordInput, false);
  });

  it.skip("should display a validation error for password when the password does not contain capital letters", () => {
    cy.get(SELECTORS.emailInput).type("test@email.com");
    cy.get(SELECTORS.passwordInput).type("password@8");
    cy.get(SELECTORS.confirmPasswordInput).type("password@8");
    cy.get(SELECTORS.form).submit();
    cy.url().should("include", REGISTER_URL_STUDENT);
    cy.get(SELECTORS.errorInput).should("have.length", 1);
    checkInputErrorState(SELECTORS.emailInput, false);
    checkInputErrorState(SELECTORS.passwordInput, true);
    checkInputErrorState(SELECTORS.confirmPasswordInput, false);
  });
});
