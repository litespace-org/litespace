import { expect } from "chai";
import backup from "@/jobs/backup";

describe("Backup Job", () => {
  it("should successfully backup the database", async () => {
    expect(await backup.start()).to.be.true;
  });
});
