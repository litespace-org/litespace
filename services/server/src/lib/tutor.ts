import { ICall, IRule, ITutor } from "@litespace/types";
import { Dayjs } from "dayjs";
import { Knex } from "knex";
import { calls, rules, tutors, knex } from "@litespace/models";
import { entries, flatten, groupBy } from "lodash";
import { unpackRules } from "@litespace/sol";
import { cache } from "@/lib/cache";

export type TutorsCache = {
  tutors: ITutor.FullTutor[];
  rules: IRule.Cache[];
};

export async function constructTutorsCache(date: Dayjs): Promise<TutorsCache> {
  // create the cache for the next month starting from `date`
  const start = date.startOf("day");
  const end = start.add(30, "days").endOf("day");

  const [onboardedTutors, tutorsRules, ruleCalls] = await knex.transaction(
    async (
      tx: Knex.Transaction
    ): Promise<[ITutor.FullTutor[], IRule.Self[], ICall.Self[]]> => {
      const onboardedTutors = await tutors.findOnboardedTutors(tx);
      const tutorIds = onboardedTutors.map((tutor) => tutor.id);

      // find all tutors "rules" and "lessons"
      const [tutorsRules, ruleCalls] = await Promise.all([
        // find all tutors rules that are available
        rules.findActivatedRules(tutorIds, start.toISOString(), tx),
        calls.findMemberCalls({
          userIds: tutorIds,
          between: { start: start.toISOString(), end: end.toISOString() },
          ignoreCanceled: true,
          tx,
        }),
      ]);
      return [onboardedTutors, tutorsRules, ruleCalls];
    }
  );

  const tutorCallsMap = groupBy<ICall.Self>(ruleCalls, "hostId");
  const tutorRulesMap = groupBy<IRule.Self>(tutorsRules, "userId");
  const rulesCachePayload = entries<IRule.Self[]>(tutorRulesMap).map(
    ([tutor, rules]): IRule.Cache[] => {
      const calls = tutorCallsMap[tutor] || [];
      return rules.map((rule) => {
        const ruleCalls = calls.filter((call) => call.ruleId === rule.id);
        return {
          tutor: Number(tutor),
          rule: rule.id,
          events: unpackRules({
            rules: [rule],
            calls: ruleCalls,
            start: start.toISOString(),
            end: end.toISOString(),
          }),
        };
      });
    }
  );

  return {
    tutors: onboardedTutors,
    rules: flatten(rulesCachePayload),
  };
}

export async function cacheTutors(start: Dayjs): Promise<TutorsCache> {
  const cachePayload = await constructTutorsCache(start);
  await Promise.all([
    cache.tutors.setMany(cachePayload.tutors),
    cache.rules.setMany(cachePayload.rules),
  ]);
  return cachePayload;
}

export function isPublicTutor(
  tutor?: ITutor.FullTutor | null
): tutor is ITutor.FullTutor & { image: string; video: string } {
  return (
    !!tutor &&
    !!tutor.activated &&
    !!tutor.activatedBy &&
    !!tutor.image &&
    !!tutor.video
  );
}
