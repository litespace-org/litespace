import { ICall, IRule, ITutor } from "@litespace/types";
import { Dayjs } from "dayjs";
import dayjs from "@/lib/dayjs";
import { knex } from "@/models/query";
import { Knex } from "knex";
import { calls, rules, tutors } from "@/models";
import { entries, groupBy, map, reduce } from "lodash";
import { Schedule, unpackRules } from "@litespace/sol";
import { availableTutorsCache } from "@/redis/tutor";

export async function constructAvailableTutorsCache(
  date: Dayjs
): Promise<ITutor.Cache> {
  // create the cache for the next month starting from `start`
  const start = date.startOf("day");
  const end = start.add(45, "days").endOf("day");

  const [activatedTutors, tutorsRules, ruleCalls] = await knex.transaction(
    async (
      tx: Knex.Transaction
    ): Promise<[ITutor.FullTutor[], IRule.Self[], ICall.Self[]]> => {
      const activatedTutors = await tutors.findActivatedTutors(tx);
      const tutorIds = map(activatedTutors, "id");

      // find all active tutors "rules" and "lessons"
      const [tutorsRules, ruleCalls] = await Promise.all([
        // find all tutors rules that are available "after" "start"
        rules.findTutorsActivatedRules(tutorIds, start.toISOString(), tx),
        // find tutors lesson for the upcoming month. It will be used to mask
        // the tutor rules.
        calls.findHostsCallsByRange({
          userIds: tutorIds,
          start: start.toISOString(),
          end: end.toISOString(),
          tx,
        }),
      ]);
      return [activatedTutors, tutorsRules, ruleCalls];
    }
  );

  const tutorCallsMap = groupBy<ICall.Self>(ruleCalls, "hostId");
  const tutorRulesMap = groupBy<IRule.Self>(tutorsRules, "userId");
  const unpackedRules = entries<IRule.Self[]>(tutorRulesMap).map(
    ([tutorId, rules]): { tutorId: string; rules: IRule.RuleEvent[] } => {
      const calls = tutorCallsMap[tutorId] || [];
      return {
        tutorId,
        rules: Schedule.order(
          unpackRules({
            rules,
            calls,
            start: start.toISOString(),
            end: end.toISOString(),
          }),
          "asc"
        ),
      };
    }
  );

  // map from tutor id to its unpacked rules {tutorId => rules[]}
  const tutorsUnpackedRulesMap = reduce(
    unpackedRules,
    (acc: ITutor.Cache["unpackedRules"], { tutorId, rules }) => {
      acc[tutorId] = rules;
      return acc;
    },
    {}
  );

  return {
    start: start.toISOString(),
    end: end.toISOString(),
    tutors: activatedTutors,
    unpackedRules: tutorsUnpackedRulesMap,
  };
}

export async function cacheAvailableTutors(
  start: Dayjs
): Promise<ITutor.Cache> {
  const cache = await constructAvailableTutorsCache(start);
  await Promise.all([
    availableTutorsCache.setDates({
      start: dayjs.utc(cache.start),
      end: dayjs.utc(cache.end),
    }),
    availableTutorsCache.setTutors(cache.tutors),
    availableTutorsCache.setRules(cache.unpackedRules),
  ]);

  return cache;
}
