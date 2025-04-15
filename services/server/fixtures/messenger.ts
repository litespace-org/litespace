class Messenger {
  public readonly telegram: {
    resolvePhone: ({ phone }: { phone: string }) => boolean;
  };

  constructor() {
    this.telegram = {
      resolvePhone({ phone }: { phone: string }) {
        // this if statement is used to test if phone is unresolved
        if (phone === "01018303124") return false;
        return true;
      },
    };
  }
}

jest.mock("@litespace/atlas", () => {
  const originalModules = jest.requireActual("@litespace/atlas");
  return { ...originalModules, Messenger };
});
