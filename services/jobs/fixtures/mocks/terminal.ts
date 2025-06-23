jest.mock("@/lib/terminal", () => ({
  execute: (_: string) => {},
}));
