/// <reference types="cypress" />

import { router } from "@cy/lib/router";
import { ILesson, ITutor, IUser, Paginated } from "@litespace/types";
import { InputProps } from "@litespace/ui/Input";
import { Web } from "@litespace/utils/routes";

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

export type TasksParamsMap = {
  "users:find": IUser.FindModelQuery;
  "users:create": IUser.CreatePayload;
  "db:flush": void;
  "db:tutor": {
    userPayload?: Partial<IUser.CreatePayload>;
    tutorPayload?: Partial<ITutor.UpdatePayload>;
  };
  "db:student": void;
  "db:lesson": Partial<ILesson.CreatePayload> & {
    timing?: "future" | "past";
    canceled?: boolean;
  };
};

export type TasksResultMap = {
  "users:find": Paginated<IUser.Self>;
  "users:create": IUser.Self;
  "db:flush": null;
  "db:tutor": ITutor.Self;
  "db:student": IUser.Self;
  "db:lesson": {
    lesson: ILesson.Self;
    members: ILesson.Member[];
  };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      checkInputState(
        selector: string,
        state?: InputProps["state"] | "idle"
      ): Chainable<void>;
      checkErroredInputsCount(count: number): Chainable<void>;
      execute<T extends keyof TasksParamsMap>(
        event: T,
        params: TasksParamsMap[T]
      ): Chainable<TasksResultMap[T]>;
      flush(): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit(router.web({ route: Web.Login }));
  cy.get("input[id=email]").clear().type(email);
  cy.get("input[id=password]").clear().type(password);
  cy.get("form").submit();
});

Cypress.Commands.add(
  "checkInputState",
  (selector: string, state?: InputProps["state"] | "idle") => {
    if (!state || state === "idle")
      cy.get(selector).should("not.have.attr", "data-state");
    else cy.get(selector).should("have.attr", "data-state", state);
  }
);

Cypress.Commands.add("checkErroredInputsCount", (count: number) => {
  cy.get("input[data-state=error]").should("have.length", count);
});

Cypress.Commands.add("execute", (task, payload) => {
  cy.task(task, payload);
});

Cypress.Commands.add("flush", () => {
  cy.execute("db:flush", undefined);
});

export {};