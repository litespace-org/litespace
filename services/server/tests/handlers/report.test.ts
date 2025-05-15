import db, { faker } from "@fixtures/db";
import handlers from "@/handlers/report";
import { IReport, IUser } from "@litespace/types";
import { mockApi } from "@fixtures/mockApi";
import { forbidden, notfound } from "@/lib/error";
import { expect } from "chai";
import { reports } from "@litespace/models";
import { first } from "lodash";

const find = mockApi<
  IReport.FindApiPayload,
  object,
  object,
  IReport.FindApiResponse
>(handlers.find);
const update = mockApi<IReport.UpdateApiPayload, { id: number }>(
  handlers.update
);
const create = mockApi<IReport.CreateApiPayload>(handlers.create);

describe("/api/v1/report/", () => {
  beforeEach(async () => {
    await db.flush();
  });

  describe("GET /api/v1/report/list", () => {
    it("should respond with forbidden in case the user is not an admin", async () => {
      const student = await db.student();
      const res = await find({
        body: { users: [student.id] },
        user: student,
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with a paginated object of reports of specific user", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      const student = await db.student();
      const newReports = await Promise.all([
        db.report({ userId: student.id }),
        db.report({ userId: student.id }),
        db.report({ userId: student.id }),
        db.report(),
      ]);

      const res = await find({
        body: { users: [student.id] },
        user: admin,
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body?.total).to.eq(3);
      expect(res.body?.list).to.deep.eq(newReports.slice(0, 3));
    });

    it("should respond with a paginated object of unresolved reports", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      const student = await db.student();
      const newReports = await Promise.all([
        db.report({ userId: student.id }),
        db.report({ userId: student.id }),
        db.report({ userId: student.id }),
        db.report(),
      ]);

      await reports.update(newReports[0].id, { resolved: true });

      const res = await find({
        user: admin,
        body: {
          users: [student.id],
          resolved: false,
        },
      });

      expect(res).to.not.be.instanceof(Error);
      expect(res.body?.total).to.eq(2);
      expect(res.body?.list).to.deep.eq(newReports.slice(1, 3));
    });
  });

  describe("POST /api/v1/report", () => {
    it("should respond with forbidden in case the requester is not a user", async () => {
      const res = await create({
        user: undefined,
        body: {
          title: faker.lorem.words(5),
          description: faker.lorem.words(15),
        },
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with OK and successfully create a report", async () => {
      const student = await db.student();

      const title = faker.lorem.words(5);
      const description = faker.lorem.words(15);

      await create({
        user: student,
        body: { title, description },
      });

      const res = await reports.find({ users: [student.id] });
      expect(res.total).to.eq(1);

      const report = first(res.list);
      expect(report).to.exist;
      expect(report?.title).to.eq(title);
      expect(report?.description).to.eq(description);
      expect(report?.screenshot).to.be.null;
      expect(report?.log).to.be.null;
    });
  });

  describe("PUT /api/v1/report/:id", () => {
    it("should respond with forbidden in case the user is not an admin", async () => {
      const student = await db.student();
      const res = await update({
        params: { id: 1 },
        body: { resolved: true },
        user: student,
      });
      expect(res).to.deep.eq(forbidden());
    });

    it("should respond with notfound in case the report id does not exist", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      const res = await update({
        params: { id: 1 },
        body: { resolved: true },
        user: admin,
      });

      expect(res).to.deep.eq(notfound.report());
    });

    it("should respond with OK and update the report resolved value", async () => {
      const admin = await db.user({ role: IUser.Role.RegularAdmin });

      const created = await db.report();

      await update({
        params: { id: created.id },
        body: { resolved: true },
        user: admin,
      });

      const updated = await reports.findById(created.id);

      expect(updated?.resolved).to.be.true;
    });
  });
});
