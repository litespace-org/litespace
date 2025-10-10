class MockS3Client {
  constructor() {}
  send() {
    return {
      Contents: "",
    };
  }
}

class MockPutObjectCommand {
  constructor() {}
}

class MockGetObjectCommand {
  constructor() {}
}

class MockListObjectsV2Command {
  constructor() {}
}

function mockGetSignedUrl(): string {
  return "https://example.com/";
}

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: MockS3Client,
  PutObjectCommand: MockPutObjectCommand,
  GetObjectCommand: MockGetObjectCommand,
  ListObjectsV2Command: MockListObjectsV2Command,
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: mockGetSignedUrl,
}));
