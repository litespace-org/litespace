import { calls } from "@/calls";
import { flush } from "@fixtures/db";
import { nameof } from "@litespace/sol/utils";

describe("Calls", () => {
  beforeEach(async () => {
    await flush();
  });

  describe(nameof(calls.create), () => {
    it("should insert new call row", async () => {
      const call = await calls.create();
    });
  });
});
