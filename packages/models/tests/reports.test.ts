import fixtures from "@fixtures/db";
import { nameof } from "@litespace/utils/utils";
import { expect } from "chai";
import { reports } from "@/index";
import { first } from "lodash";

describe("Reports", () => {
  beforeEach(async () => {
    return await fixtures.flush();
  });

  describe(nameof(reports.create), () => {
    it("should successfully create a report", async () => {
      const user = await fixtures.student();

      const report = await reports.create({
        userId: user.id,
        title: "My First Report",
        description: "empty description",
      });

      expect(report).to.exist;
      expect(report.userId).to.eq(user.id);
      expect(report.title).to.eq("My First Report");
      expect(report.description).eq("empty description");
      expect(report.screenshot).to.be.null;
      expect(report.log).to.be.null;
      expect(report.resolved).to.be.false;
      expect(report.createdAt).to.exist;
      expect(report.updatedAt).to.exist;
    });

    it("should successfully create a report with log and screenshot", async () => {
      const user = await fixtures.student();

      const report = await reports.create({
        userId: user.id,
        title: "My First Report",
        description: "empty description",
        log: "empty",
        screenshot: "dump",
      });

      expect(report).to.exist;
      expect(report.userId).to.eq(user.id);
      expect(report.title).to.eq("My First Report");
      expect(report.description).eq("empty description");
      expect(report.screenshot).to.eq("dump");
      expect(report.log).to.eq("empty");
      expect(report.resolved).to.be.false;
      expect(report.createdAt).to.exist;
      expect(report.updatedAt).to.exist;
    });
  });

  describe(nameof(reports.update), () => {
    it("should successfully update reports resolved attribute", async () => {
      const created = await fixtures.report();
      await reports.update({ id: created.id, resolved: true });
      const updated = await reports.findById(created.id);
      expect(updated?.resolved).to.be.true;
    });
  });

  describe(nameof(reports.find), () => {
    it("should find a report by its id", async () => {
      const created = await Promise.all([
        fixtures.report(),
        fixtures.report(),
        fixtures.report(),
      ]);

      const { list } = await reports.find({
        ids: [created[1].id],
      });

      expect(created[1]).to.deep.eq(first(list));
    });

    it("should find reports for a speific user", async () => {
      const student = await fixtures.student();

      const created = await Promise.all([
        fixtures.report({ userId: student.id }),
        fixtures.report({ userId: student.id }),
        fixtures.report({ userId: student.id }),
        fixtures.report(),
        fixtures.report(),
      ]);

      const { list, total } = await reports.find({
        users: [student.id],
      });

      expect(total).to.eq(3);
      expect(list).to.deep.members(created.slice(0, 3));
    });
  });
});
