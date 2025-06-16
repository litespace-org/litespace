class MockTelegramBot {
  sendMessage() {}
}

jest.mock("@litespace/radio/telegram/bot", () => ({
  ...jest.requireActual("@litespace/radio/telegram/bot"),
  TelegramBot: MockTelegramBot,
}));
