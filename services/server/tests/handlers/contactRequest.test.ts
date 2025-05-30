import { mockApi } from "@fixtures/mockApi";
import db from "@fixtures/db";
import { safe } from "@litespace/utils";
import { expect } from "chai";
import handlers from "@/handlers/contactRequest";
import { FieldError, IContactRequest } from "@litespace/types";
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
          phone: "core@litespace.com",
          title: "Testing Litespace Server Component",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res1).to.deep.eq(apierror(FieldError.ShortUserName, 400));

    const res2 = await safe(() =>
      createContactRequest({
        body: {
          name: "a".repeat(51),
          phone: "core@litespace.com",
          title: "Testing Litespace Server Component",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res2).to.deep.eq(apierror(FieldError.LongUserName, 400));

    const res3 = await safe(() =>
      createContactRequest({
        body: {
          name: "Name150",
          phone: "core@litespace.com",
          title: "Testing Litespace Server Component",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res3).to.deep.eq(apierror(FieldError.InvalidUserName, 400));
  });

  it("should respond with bad request in case the phone is invalid", async () => {
    const res1 = await safe(() =>
      createContactRequest({
        body: {
          name: "Steve Adams",
          phone: "010",
          title: "Testing Litespace Server Component",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res1).to.deep.eq(apierror(FieldError.InvalidPhone, 400));
  });

  it("should respond with bad request in case the title is invalid", async () => {
    const res1 = await safe(() =>
      createContactRequest({
        body: {
          name: "Steve Adams",
          phone: "01002832217",
          title: "a",
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res1).to.deep.eq(apierror(FieldError.ShortContactRequestTitle, 400));

    const res2 = await safe(() =>
      createContactRequest({
        body: {
          name: "Steve Adams",
          phone: "01002832217",
          title: "a".repeat(129),
          message:
            "This message has been automatically sent by litespace test suites.",
        },
      })
    );
    expect(res2).to.deep.eq(apierror(FieldError.LongContactRequestTitle, 400));
  });

  it("should respond with bad request in case the message is invalid", async () => {
    const res1 = await safe(() =>
      createContactRequest({
        body: {
          name: "Steve Adams",
          phone: "01002832217",
          title: "Just a nice title",
          message: "a",
        },
      })
    );
    expect(res1).to.deep.eq(
      apierror(FieldError.ShortContactRequestMessage, 400)
    );

    const res2 = await safe(() =>
      createContactRequest({
        body: {
          name: "Steve Adams",
          phone: "01002832217",
          title: "Just a nice title",
          message: "a".repeat(1001),
        },
      })
    );
    expect(res2).to.deep.eq(
      apierror(FieldError.LongContactRequestMessage, 400)
    );
  });

  it("should succeffully insert new contact request in the database", async () => {
    const res = await createContactRequest({
      body: {
        name: "Litespace Test Suites",
        phone: "01002832217",
        title: "Testing Litespace Server Component",
        message:
          "This message has been automatically sent by litespace test suites.",
      },
    });

    expect(res.status).to.eq(200);
  });

  it("should accept an arabic name", async () => {
    const res = await createContactRequest({
      body: {
        name: "محمود إيهاب",
        phone: "01002832217",
        title: "Testing Litespace Server Component",
        message:
          "This message has been automatically sent by litespace test suites.",
      },
    });

    expect(res.status).to.eq(200);
  });
});
