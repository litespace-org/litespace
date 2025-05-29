class S3Client {
  name = "litespace";
  constructor() {}

  send() {}
}

class PutObjectCommand {
  constructor() {}
}

class GetObjectCommand {
  constructor() {}
}

function getSignedUrl(): string {
  return "https://example.com/";
}

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
}));

jest.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl,
}));
