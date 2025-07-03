import fixtures from "@fixtures/db";
import { nameof } from "@litespace/utils/utils";
import { demoSessions } from "@/demoSessions";

describe("DemoSessions", () => {
  beforeEach(async () => {
    await fixtures.flush();
  });

  // @moehab @TODO: write unit tests for demoSession.create function
  // @galal @TODO: unskip this test suite and ensure it does pass
  describe.skip(nameof(demoSessions.create), () => {
    it("", () => {
      expect(true);
    });
  });

  // @moehab @TODO: write unit tests for demoSession.update function
  // @galal @TODO: unskip this test suite and ensure it does pass
  describe.skip(nameof(demoSessions.update), () => {
    it("", () => {
      expect(true);
    });
  });

  // @moehab @TODO: write unit tests for demoSession.find function
  // @mk @TODO: unskip this test suite and ensure it does pass
  describe.skip(nameof(demoSessions.find), () => {
    it("", () => {
      expect(true);
    });
  });
});
