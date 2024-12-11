import { bad, notfound } from "@/lib/error";
import { Api } from "@fixtures/api";
import db, { flush } from "@fixtures/db";
import { interviews, rules } from "@litespace/models";
import { safe } from "@litespace/sol";
import { IUser } from "@litespace/types";
import { expect } from "chai";
import dayjs from "dayjs";
import { first } from "lodash";

describe("/api/v1/rule/", () => {
  beforeEach(async () => {
    await flush();
  });

  describe("GET /api/v1/rule/slots/:userId", () => {
    // NOTE: related lessons and rules can have different userId!
    // TODO: put some thought on the above note.
    it("should get rules and slots of a specific tutor user", async () => {
      const newAdmin = await db.user({ role: IUser.Role.SuperAdmin });
      const newTutor = await db.onBoardTutor();

      const newRule = await db.activatedRule({ 
        userId: newTutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      const newLesson = await db.lesson({ 
        rule: newRule.id,
        tutor: newTutor.id, 
        start: dayjs().add(1, "day").toISOString(),
        duration: 30,
      });
      
      const newInterview = await db.interview({ 
        rule: newRule.id,
        interviewer: newAdmin.id, 
        interviewee: newTutor.id, 
        start: dayjs().add(2, "day").toISOString(),
      });

      const studentApi = await Api.forStudent();
      const res = await studentApi.atlas.rule.findUserRulesWithSlots(
        newTutor.id,
        dayjs.utc().toISOString(),
        dayjs.utc().add(3, "day").toISOString()
      );

      expect(res.rules).to.have.length(1);
      expect(res.slots).to.have.length(2);
      expect(first(res.rules)).to.deep.eq(newRule);

      const slotStartDates = res.slots.map(s => s.start);
      expect(slotStartDates).to.contains(newLesson.lesson.start);
      expect(slotStartDates).to.contains(newInterview.start);
    });

    it("should get only rules that lay fully or partially between {after} and {before} params", async () => {
      const newTutor = await db.onBoardTutor();

      // partial left
      const rule1 = await db.activatedRule({ 
        userId: newTutor.id,
        start: dayjs.utc().subtract(1, "day").toISOString(),
        end: dayjs.utc().add(2, "hours").toISOString(),
      });

      // partial right
      const rule2 = await db.activatedRule({ 
        userId: newTutor.id,
        start: dayjs.utc().add(1, "day").startOf("day").toISOString(),
        end: dayjs.utc().add(3, "days").toISOString(),
      });

      // full
      const rule3 = await db.activatedRule({ 
        userId: newTutor.id,
        start: dayjs.utc().subtract(1, "day").toISOString(),
        end: dayjs.utc().add(3, "days").toISOString(),
      });

      // not included
      const rule4 = await db.activatedRule({ 
        userId: newTutor.id,
        start: dayjs.utc().add(3, "day").toISOString(),
        end: dayjs.utc().add(7, "days").toISOString(),
      });

      // lesson 1 (in scope)
      await db.lesson({ 
        rule: rule1.id,
        tutor: newTutor.id, 
        start: dayjs().add(1, "day").toISOString(),
        duration: 30,
      });

      // lesson 2 (out of scope)
      await db.lesson({ 
        rule: rule4.id,
        tutor: newTutor.id, 
        start: dayjs().add(1, "day").toISOString(),
        duration: 30,
      });

      const studentApi = await Api.forStudent();
      const res = await studentApi.atlas.rule.findUserRulesWithSlots(
        newTutor.id,
        dayjs.utc().toISOString(),
        dayjs.utc().add(2, "day").toISOString()
      );

      expect(res.rules).to.have.length(3);
      expect(res.slots).to.have.length(1);

      const ruleIds = res.rules.map(r => r.id);
      expect(ruleIds).to.contains(rule1.id);
      expect(ruleIds).to.contains(rule2.id);
      expect(ruleIds).to.contains(rule3.id);
    });

    it("should NOT get deleted or cancelled rules", async () => {
      const newTutor = await db.onBoardTutor();

      const newRule = await db.rule({ 
        userId: newTutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });
      await rules.update(newRule.id, { deleted: true });

      const studentApi = await Api.forStudent();
      const res = await studentApi.atlas.rule.findUserRulesWithSlots(
        newTutor.id,
        dayjs.utc().toISOString(),
        dayjs.utc().add(1, "day").toISOString()
      );

      expect(res.rules).to.have.length(0);
    });

    it("should NOT include cancelled lessons and interviews in the slots", async () => {
      const newAdmin = await db.user({ role: IUser.Role.SuperAdmin });
      const newTutor = await db.onBoardTutor();

      const newRule = await db.activatedRule({ 
        userId: newTutor.id,
        start: dayjs.utc().startOf("day").toISOString(),
        end: dayjs.utc().add(10, "days").toISOString(),
      });

      await db.lesson({ 
        rule: newRule.id,
        tutor: newTutor.id, 
        start: dayjs().add(1, "day").toISOString(),
        duration: 30,
        canceled: true,
      });

      const newInterview = await db.interview({ 
        rule: newRule.id,
        interviewer: newAdmin.id, 
        interviewee: newTutor.id, 
        start: dayjs().add(2, "day").toISOString(),
      });
      await interviews.update(newInterview.ids.self, {
        canceledAt: dayjs.utc().toISOString(),
        canceledBy: newAdmin.id
      });

      const studentApi = await Api.forStudent();
      const res = await studentApi.atlas.rule.findUserRulesWithSlots(
        newTutor.id,
        dayjs.utc().toISOString(),
        dayjs.utc().add(3, "day").toISOString()
      );

      expect(res.rules).to.have.length(1);
      expect(res.slots).to.have.length(0);
    });

    it("should response with 400 status code when {after} - {before} > 60 days", async () => {
      const newTutor = await db.onBoardTutor();

      const studentApi = await Api.forStudent();
      const res = await safe(async () => studentApi.atlas.rule.findUserRulesWithSlots(
        newTutor.id,
        dayjs.utc().toISOString(),
        dayjs.utc().add(61, "day").toISOString()
      ));

      expect(res).to.be.deep.eq(bad());
    });

    it("should response with 404 if {userId} param is not for a tutor or tutor-manager", async () => {
      const newUser = await db.user();

      const studentApi = await Api.forStudent();
      const res = await safe(async () => studentApi.atlas.rule.findUserRulesWithSlots(
        newUser.id,
        dayjs.utc().toISOString(),
        dayjs.utc().add(5, "day").toISOString()
      ));

      expect(res).to.be.deep.eq(notfound.tutor());
    });

    it("should response with 404 if the tutor is not onboard", async () => {
      const newTutor = await db.tutor();

      const studentApi = await Api.forStudent();
      const res = await safe(async () => studentApi.atlas.rule.findUserRulesWithSlots(
        newTutor.id,
        dayjs.utc().toISOString(),
        dayjs.utc().add(5, "day").toISOString()
      ));

      expect(res).to.be.deep.eq(notfound.tutor());
    });
  });
});
