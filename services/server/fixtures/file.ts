import { Readable } from "stream";

export const getMockFile = (options?: {
  size?: number;
}): Express.Multer.File => ({
  filename: "mockfile",
  fieldname: "mockfield",
  originalname: "mockname",
  encoding: "testing",
  mimetype: "testing",
  size: options?.size || 1,
  stream: new Readable(),
  destination: "empty",
  path: "/tmp",
  buffer: Buffer.from([]),
});
