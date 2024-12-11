import { flush } from "@fixtures/db";

describe("/api/v1/rule/", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("GET /api/v1/rule/slots/:userId", () => {
    it("should get rules and slots of a specific tutor user", async () => {});
    it("should get only rules that lay fully or partially between {after} and {before} params", async () => {});
    it("should NOT get deleted or cancelled rules", async () => {});
    it("should NOT include cancelled lessons and interviews in the slots", async () => {});
    it("should response with 400 status code when {after} - {before} > 60 days", async () => {});
    it("should response with 404 if {userId} param is not for a tutor or tutor-manager", async () => {});
    it("should response with 404 if the tutor is not onboard", async () => {});
  });
});
