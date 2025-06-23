jest.mock("fs", () => ({
  readFileSync: () => "",
  existsSync: () => true,
  rmSync: () => true,
}));
