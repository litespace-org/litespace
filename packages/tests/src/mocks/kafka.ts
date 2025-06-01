class Producer {
  constructor() {}
  send() {}
  connect() {}
}

class Consumer {
  constructor() {}
  subscribe() {}
  run() {}
}

jest.mock("@litespace/kafka", () => ({
  Producer,
  Consumer,
}));
