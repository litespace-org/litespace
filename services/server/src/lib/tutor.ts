import { ICall, ILesson, IRule, ITutor } from "@litespace/types";
import { Dayjs } from "dayjs";
import { Knex } from "knex";
import { calls, rules, tutors, knex, lessons } from "@litespace/models";
import { entries, flatten, groupBy } from "lodash";
import { unpackRules } from "@litespace/sol/rule";
import { cache } from "@/lib/cache";

export type TutorsCache = {
  tutors: ITutor.FullTutor[];
  rules: IRule.Cache[];
};

export async function constructTutorsCache(date: Dayjs): Promise<TutorsCache> {
  // create the cache for the next month starting from `date`
  const start = date.startOf("day");
  const end = start.add(30, "days").endOf("day");

  const [onboardedTutors, tutorsRules, tutorLessons] = await knex.transaction(
    async (
      tx: Knex.Transaction
    ): Promise<[ITutor.FullTutor[], IRule.Self[], ILesson.Self[]]> => {
      const onboardedTutors = await tutors.findOnboardedTutors(tx);
      const tutorIds = onboardedTutors.map((tutor) => tutor.id);

      // find all tutors "rules" and "lessons"
      const [tutorsRules, tutorLessons] = await Promise.all([
        // find all tutors rules that are available
        rules.findActivatedRules(tutorIds, start.toISOString(), tx),
        lessons.find({
          users: tutorIds,
          after: start.toISOString(),
          before: end.toISOString(),
          canceled: false,
          full: true,
          tx,
        }),
      ]);
      return [
        onboardedTutors,
        tutorsRules,
        // todo: disable pagiation for this query
        tutorLessons.list,
      ];
    }
  );

  //! todo: filter lessons by tutor id
  // const tutorCallsMap = groupBy<ILesson.Self>(tutorLessons, l => l.);
  const tutorRulesMap = groupBy<IRule.Self>(tutorsRules, "userId");
  const rulesCachePayload = entries<IRule.Self[]>(tutorRulesMap).map(
    ([tutor, rules]): IRule.Cache[] => {
      // const calls = tutorCallsMap[tutor] || [];
      return rules.map((rule) => {
        return {
          tutor: Number(tutor),
          rule: rule.id,
          events: unpackRules({
            rules: [rule],
            slots: [],
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
