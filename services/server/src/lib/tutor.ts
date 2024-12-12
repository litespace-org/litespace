import { IRule, ITutor } from "@litespace/types";
import dayjs, { Dayjs } from "dayjs";
import { Knex } from "knex";
import {
  rules,
  tutors,
  knex,
  lessons,
  topics,
  ratings,
} from "@litespace/models";
import { entries, first, flatten, groupBy, orderBy } from "lodash";
import { unpackRules } from "@litespace/sol/rule";
import { cache } from "@/lib/cache";
import { selectTutorRuleEvents } from "./events";
import { Gender } from "@litespace/types/dist/esm/user";

export type TutorsCache = {
  tutors: ITutor.Cache[];
  rules: IRule.Cache[];
};

export async function constructTutorsCache(date: Dayjs): Promise<TutorsCache> {
  // create the cache for the next month starting from `date`
  const start = date.startOf("day");
  const end = start.add(30, "days").endOf("day");

  const [
    onboardedTutors,
    tutorsRules,
    tutorsTopics,
    tutorsRatings,
    tutorsLessonsCount,
    tutorsStudentsCount,
  ] = await knex.transaction(async (tx: Knex.Transaction) => {
    const onboardedTutors = await tutors.findOnboardedTutors(tx);
    const tutorIds = onboardedTutors.map((tutor) => tutor.id);

    return await Promise.all([
      onboardedTutors,
      rules.findActivatedRules(tutorIds, start.toISOString(), tx),
      topics.findUserTopics({ users: tutorIds }),
      ratings.findAvgRatings(tutorIds),
      lessons.countLessonsBatch({ users: tutorIds, canceled: false }),
      lessons.countCounterpartMembersBatch({
        users: tutorIds,
        canceled: false,
      }),
    ]);
  });

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

  // restruct tutors list to match ITutor.Cache[]
  const cacheTutors: ITutor.Cache[] = onboardedTutors.map((tutor) => {
    const filteredTopics = tutorsTopics
      ?.filter((item) => item.userId === tutor.id)
      .map((item) => item.name.ar);

    return {
      id: tutor.id,
      name: tutor.name,
      image: tutor.image,
      video: tutor.video,
      bio: tutor.bio,
      about: tutor.about,
      gender: tutor.gender,
      online: tutor.online,
      notice: tutor.notice,
      topics: filteredTopics,
      avgRating:
        tutorsRatings.find((rating) => rating.user === tutor.id)?.avg || 0,
      studentCount:
        tutorsStudentsCount.find((item) => item.userId === tutor.id)?.count ||
        0,
      lessonCount:
        tutorsLessonsCount.find((item) => item.userId === tutor.id)?.count || 0,
    };
  });

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

/**
 *  @deprecated should be removed in favor of {@link isOnboard}
 */
export function isPublicTutor(
  tutor?: ITutor.FullTutor | null
): tutor is ITutor.FullTutor {
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
export function orderTutors({
  tutors,
  rules,
  userGender,
}: {
  tutors: ITutor.Cache[];
  rules: IRule.Cache[];
  userGender?: Gender;
}): ITutor.Cache[] {
  const iteratees = [
    // sort in ascending order by the first availablity
    (tutor: ITutor.Cache) => {
      const events = selectTutorRuleEvents(rules, tutor);
      const event = first(events);
      if (!event) return Infinity;
      return dayjs.utc(event.start).unix();
    },
    (tutor: ITutor.Cache) => {
      if (!userGender) return 0; // disable ordering by gender if user is not logged in or gender is unkown
      if (!tutor.gender) return Infinity;
      const same = userGender === tutor.gender;
      return same ? 0 : 1;
    },
    "online",
    "notice",
  ];

  const orders: Array<"asc" | "desc"> = ["asc", "asc", "desc", "asc"];
  const ordered = orderBy(tutors, iteratees, orders);

  return ordered;
}

/**
 * Return these info about the tutor
 * - topics
 * - avg. rating
 * - student count
 * - lesson count
 */
async function findTutorCacheMeta(tutorId: number) {
  const [tutorTopics, avgRatings, studentCount, lessonCount] =
    await Promise.all([
      topics.findUserTopics({ users: [tutorId] }),
      ratings.findAvgRatings([tutorId]),
      lessons.countCounterpartMembers({ user: tutorId }),
      lessons.countLessons({
        users: [tutorId],
        canceled: false,
        ratified: true,
      }),
    ]);

  return {
    topics: tutorTopics.map((topic) => topic.name.ar),
    avgRating: first(avgRatings)?.avg || 0,
    studentCount,
    lessonCount,
  };
}

export async function joinTutorCache(
  tutor: ITutor.FullTutor,
  cache: ITutor.Cache | null
): Promise<ITutor.Cache> {
  const meta = cache
    ? {
        topics: cache.topics,
        avgRating: cache.avgRating,
        studentCount: cache.studentCount,
        lessonCount: cache.lessonCount,
      }
    : await findTutorCacheMeta(tutor.id);

  return {
    id: tutor.id,
    name: tutor.name,
    image: tutor.image,
    video: tutor.video,
    bio: tutor.bio,
    about: tutor.about,
    gender: tutor.gender,
    online: tutor.online,
    notice: tutor.notice,
    ...meta,
  };
}

/*
 * check whether a tutor is activated (onboard) or not.
 */
export function isOnboard(tutor: ITutor.FullTutor): boolean {
  return (
    tutor.activated === true &&
    tutor.verified === true &&
    tutor.activatedBy !== null &&
    tutor.image !== null &&
    tutor.video !== null &&
    tutor.gender !== null &&
    tutor.name !== null &&
    tutor.birthYear !== null &&
    tutor.about !== null &&
    tutor.bio !== null &&
    tutor.phoneNumber !== null
  );
}

export function asTutorInfoResponseBody(
  ctutor: ITutor.Cache
): ITutor.FindTutorInfoApiResponse {
  return {
    id: ctutor.id,
    name: ctutor.name,
    bio: ctutor.bio,
    about: ctutor.about,
    image: ctutor.image,
    video: ctutor.video,
    topics: ctutor.topics,
    studentCount: ctutor.studentCount,
    lessonCount: ctutor.lessonCount,
    avgRating: ctutor.avgRating,
    notice: ctutor.notice,
  };
}
