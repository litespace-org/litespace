class MockProducer {
  constructor() {}
  send() {}
  connect() {}
}

class MockConsumer {
  constructor() {}
  subscribe() {}
  run() {}
}

jest.mock("@litespace/kafka", () => ({
  Producer: MockProducer,
  Consumer: MockConsumer,
}));
