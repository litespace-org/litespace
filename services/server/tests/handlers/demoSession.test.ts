import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import handlers from "@/handlers/demoSession";
import { IDemoSession } from "@litespace/types";
import { nameof } from "@litespace/utils";

const findDemoSession = mockApi<
  IDemoSession.FindApiPayload,
  object,
  object,
  IDemoSession.FindApiResponse
>(handlers.find);

const createDemoSession = mockApi<
  IDemoSession.CreateApiPayload,
  object,
  object,
  IDemoSession.CreateApiResponse
>(handlers.create);

const updateDemoSession = mockApi<
  IDemoSession.UpdateApiPayload,
  object,
  object,
  IDemoSession.UpdateApiResponse
>(handlers.update);

describe("/api/v1/demo-session/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  // @mk @TODO: write test suite for this function.
  // @galal @TODO: unskip this suite and ensure it passes.
  describe(nameof(findDemoSession), () => {
    it("", () => {
      expect(true);
    });
  });

  // @mk @TODO: write test suite for this function.
  // @galal @TODO: unskip this suite and ensure it passes.
  describe(nameof(createDemoSession), () => {
    it("", () => {
      expect(true);
    });
  });

  // @moehab @TODO: write test suite for this function.
  // @mk @TODO: unskip this suite and ensure it passes.
  describe(nameof(updateDemoSession), () => {
    it("", () => {
      expect(true);
    });
  });
});
