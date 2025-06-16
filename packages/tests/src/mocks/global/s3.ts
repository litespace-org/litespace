class MockS3Client {
  constructor() {}
  send() {}
}

class MockPutObjectCommand {
  constructor() {}
}

class MockGetObjectCommand {
  constructor() {}
}

function mockGetSignedUrl(): string {
  return "https://example.com/";
}

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: MockS3Client,
  PutObjectCommand: MockPutObjectCommand,
  GetObjectCommand: MockGetObjectCommand,
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mockGetSignedUrl,
}));
