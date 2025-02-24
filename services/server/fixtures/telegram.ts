class Telegram {
  sendMessage() {}
}

jest.mock("@litespace/radio/telegram", () => ({
  ...jest.requireActual("@litespace/radio/telegram"),
  Telegram,
}));
