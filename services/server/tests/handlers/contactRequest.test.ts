import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import { safe } from "@litespace/utils";
import { expect } from "chai";
import handlers from "@/handlers/contactRequest";
import { FieldError, IContactRequest } from "@litespace/types";
import { AxiosError } from "axios";
import { apierror } from "@/lib/error";

const createContactRequest =
  mockApi<IContactRequest.CreateContactRequestApiPayload>(handlers.create);

describe("/api/v1/topic/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  it("should respond with bad request in case the name is invalid", async () => {
    const res1 = await safe(() =>
      createContactRequest({
        body: {
          name: "a",
          email: "core@litespace.com",
          title: "Testing Litespace Server Component",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res1).to.deep.eq(apierror(FieldError.ShortName, 400));

    const res2 = await safe(() =>
      createContactRequest({
        body: {
          name: "a".repeat(51),
          email: "core@litespace.com",
          title: "Testing Litespace Server Component",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res2).to.deep.eq(apierror(FieldError.LongName, 400));

    const res3 = await safe(() =>
      createContactRequest({
        body: {
          name: "Name150",
          email: "core@litespace.com",
          title: "Testing Litespace Server Component",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res3).to.deep.eq(apierror(FieldError.InvalidName, 400));
  });

  it("should succeffully insert new contact request in the database", async () => {
    const res = await safe(() =>
      createContactRequest({
        body: {
          name: "Litespace Test Suites",
          email: "core@litespace.com",
          title: "Testing Litespace Server Component",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    // ignore telegram (not found) error
    if (res instanceof AxiosError) return expect(res.status).to.eq(404);
    expect(res).to.not.be.instanceof(Error);
    if (!(res instanceof Error)) expect(res.status).to.eq(200);
  });
});
