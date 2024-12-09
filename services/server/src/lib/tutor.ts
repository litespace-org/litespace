import { ILesson, IRule, ITutor } from "@litespace/types";
import dayjs, { Dayjs } from "dayjs";
import { Knex } from "knex";
import { rules, tutors, knex, lessons, topics, ratings } from "@litespace/models";
import { entries, first, flatten, groupBy, orderBy } from "lodash";
import { unpackRules } from "@litespace/sol/rule";
import { cache } from "@/lib/cache";
import { selectRuleEventsForTutor } from "./events";
import { Gender } from "@litespace/types/dist/esm/user";

export type TutorsCache = {
  tutors: ITutor.Cache[];
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

      // find all tutors "rules" and "lessons"
      const tutorIds = onboardedTutors.map((tutor) => tutor.id);
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
      return rules.map((rule) => ({
        tutor: Number(tutor),
        rule: rule.id,
        events: unpackRules({
          rules: [rule],
          slots: [],
          start: start.toISOString(),
          end: end.toISOString(),
        }),
      }));
    }
  );

  // retrieve required data for ITutor.Cache from db
  const tutorsIds = onboardedTutors.map(t => t.id);
  const tutorsTopics = await topics.findTopicsOfTutors({ tutorsIds })
  const tutorsRatings = await ratings.findAvgRatings(tutorsIds)
  const tutorsLessonsCount = await lessons.findLessonsCountOfUsers({ ids: tutorsIds })
  const tutorsStudentsCount = await tutors.findStudentsCount(tutorsIds)

  // restruct tutors list to match ITutor.Cache[]
  const cacheTutors: ITutor.Cache[] = onboardedTutors.map(t => {
    const filteredTopics = 
      tutorsTopics?.filter(item => item.userId === t.id)
        .map(item => [item.name.ar, item.name.en]);

    return {
      id: t.id,
      name: t.name,
      gender: t.gender,
      online: t.online,
      notice: t.notice,
      topics: flatten(filteredTopics),
      avgRating: tutorsRatings.find(r => r.user === t.id)?.avg || 0,
      studentCount: tutorsStudentsCount.find(item => item.tutorId === t.id)?.count || 0,
      lessonCount: tutorsLessonsCount.find(item => item.userId === t.id)?.count || 0,
    }
  })

  return {
    tutors: cacheTutors,
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

/*
 * an ancillary function used in 'findOnboardedTutors' user handler
 */
export function orderTutors(
  tutors: ITutor.FullTutor[], 
  rules: IRule.Cache[],
  userGender?: Gender,
): ITutor.FullTutor[] {

  const iteratees = [
    // sort in ascending order by the first availablity
    (tutor: ITutor.FullTutor) => {
      const events = selectRuleEventsForTutor(rules, tutor)
      const event = first(events);
      if (!event) return Infinity;
      return dayjs.utc(event.start).unix();
    },
    (tutor: ITutor.FullTutor) => {
      if (!userGender) return 0; // disable ordering by gender if user is not logged in or gender is unkown
      if (!tutor.gender) return Infinity;
      const same = userGender === tutor.gender;
      return same ? 0 : 1;
    },
    "online",
    "notice",
  ];

  const orders: Array<"asc" | "desc"> = ["asc", "asc", "desc", "asc"];
  const filtered = tutors.filter((tutor) => isPublicTutor(tutor));
  const ordered = orderBy(filtered, iteratees, orders);

  return ordered;
}
