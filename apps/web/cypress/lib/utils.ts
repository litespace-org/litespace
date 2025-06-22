export function wait<T>(chainable: Cypress.Chainable<T>): Promise<T> {
  return new Promise((resolve) => chainable.then(resolve));
}
