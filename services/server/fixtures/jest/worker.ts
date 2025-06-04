class MockWorker {
  postMessage() {}
}

jest.mock("node:worker_threads", () => ({
  ...jest.requireActual("node:worker_threads"),
  Worker: MockWorker,
}));
