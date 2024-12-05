import { Api, unexpectedApiSuccess } from "@fixtures/api";
import fixtures from "@fixtures/db";
import { flush } from "@fixtures/shared";
import { calls } from "@litespace/models";
import { expect } from "chai";
import { cache } from "@/lib/cache";

describe("/api/v1/call", () => {
  beforeEach(async () => {
    await flush();
    await cache.flush();
  });

  it("should retrieve call by callId", async () => {
    // insert data in the database
    const call = await calls.create();

    // send request to the api
    const adminApi = await Api.forSuperAdmin();
    const res = await adminApi.atlas.call.findById(call.id)

    // test results
    expect(res.call).deep.equal(call);
  });
  
  it("should retrieve call members by callId", async () => {
    // insert data in the database
    const call = await calls.create();
    const tutor = await fixtures.tutor();
    await cache.call.addMember({
      callId: call.id,
      userId: tutor.id
    })

    // send request to the api
    const adminApi = await Api.forSuperAdmin();
    const membersIds = await adminApi.atlas.call.findCallMembers(call.id, "lesson");

    // test results
    expect(membersIds).to.have.length(1);
    expect(membersIds).to.contains(call.id);
    expect(membersIds).to.contains(tutor.id);
  });

  it("should NOT retrieve call data for an uneligable user", async () => {
    // insert data in the database
    const call = await calls.create();

    // send request to the api & test the response
    const studentApi = await Api.forStudent();
    await studentApi.atlas.call.findById(call.id)
        .then(unexpectedApiSuccess)
        .catch((error) =>
          // @TODO: add these hardcoded error messages in a global contant file
          expect(error.message).to.be.eq("Unauthorized access")
        );
  });
});
