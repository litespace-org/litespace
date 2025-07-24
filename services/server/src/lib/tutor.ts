import { ILesson, ITutor, IUser } from "@litespace/types";
import { Knex } from "knex";
import { tutors, knex, lessons, topics, ratings } from "@litespace/models";
import { first, orderBy } from "lodash";
import { cache } from "@/lib/cache";
import { withImageUrl } from "@/lib/user";
import { isOnboarded } from "@litespace/utils/tutor";

export type TutorsCache = ITutor.Cache[];

export async function constructTutorsCache(): Promise<TutorsCache> {
  // create the cache for the next month starting from `date`
  const [
    onboardedTutors,
    tutorsTopics,
    tutorsRatings,
    tutorsLessonsCount,
    tutorsStudentsCount,
  ] = await knex.transaction(async (tx: Knex.Transaction) => {
    const { list } = await tutors.find({ tx, full: true });
    const onboarded = list.filter(isOnboarded);
    const tutorIds = onboarded.map((tutor) => tutor.id);

    return await Promise.all([
      onboarded,
      topics.findUserTopics({ users: tutorIds, tx }),
      ratings.findAvgRatings({ users: tutorIds, tx }),
      lessons.countLessonsBatch({ users: tutorIds, canceled: false, tx }),
      lessons.countCounterpartMembersBatch({
        users: tutorIds,
        canceled: false,
        tx,
      }),
    ]);
  });

  // restruct tutors list to match ITutor.Cache[]
  const tutorsCache: ITutor.Cache[] = onboardedTutors.map((tutor) => {
    const filteredTopics = tutorsTopics
      ?.filter((item) => item.userId === tutor.id)
      .map((item) => item.name.ar);

    return {
      id: tutor.id,
      name: tutor.name,
      image: tutor.image,
      video: tutor.video,
      thumbnail: tutor.thumbnail,
      bio: tutor.bio,
      about: tutor.about,
      role: tutor.role,
      gender: tutor.gender,
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

  return tutorsCache;
}

export async function cacheTutors(): Promise<TutorsCache> {
  const tutorsCache = await constructTutorsCache();
  await cache.tutors.setMany(tutorsCache);
  return tutorsCache;
}

/**
 *  @deprecated should be removed in favor of {@link isOnboard}
 */
export function isPublicTutor(
  tutor?: ITutor.Full | null
): tutor is ITutor.Full {
  return !!tutor && !!tutor.activated && !!tutor.image && !!tutor.video;
}

/*
 * an ancillary function used in 'findOnboardedTutors' user handler
 */
export function orderTutors({
  tutors,
  userGender,
  subscribed,
}: {
  tutors: ITutor.Cache[];
  userGender?: IUser.Gender;
  subscribed?: boolean;
}): ITutor.Cache[] {
  const iteratees = [
    "role",
    (tutor: ITutor.Cache) => {
      if (!userGender) return 0; // disable ordering by gender if user is not logged in or gender is unkown
      if (!tutor.gender) return Infinity;
      const same = userGender === tutor.gender;
      return same ? 0 : 1;
    },
    "notice",
  ];
  const orders: Array<"asc" | "desc"> = [
    subscribed ? "asc" : "desc",
    "asc",
    "asc",
  ];
  return orderBy(tutors, iteratees, orders);
}

/**
 * Return these info about the tutor
 * - topics
 * - avg. rating
 * - student count
 * - lesson count
 */
async function findTutorCacheMeta(tutorId: number) {
  const [tutorTopics, avgRatings, studentCount, lessonCount, online] =
    await Promise.all([
      topics.findUserTopics({ users: [tutorId] }),
      ratings.findAvgRatings({ users: [tutorId] }),
      lessons.countCounterpartMembers({ user: tutorId }),
      lessons.countLessons({
        users: [tutorId],
        canceled: false,
        ratified: true,
      }),
      cache.onlineStatus.isOnline(tutorId),
    ]);

  return {
    topics: tutorTopics.map((topic) => topic.name.ar),
    avgRating: first(avgRatings)?.avg || 0,
    studentCount,
    lessonCount,
    online,
  };
}

export async function joinTutorCache(
  tutor: ITutor.Full,
  cacheData: ITutor.Cache | null
): Promise<ITutor.Cache> {
  const meta = cacheData
    ? {
        topics: cacheData.topics,
        avgRating: cacheData.avgRating,
        studentCount: cacheData.studentCount,
        lessonCount: cacheData.lessonCount,
      }
    : await findTutorCacheMeta(tutor.id);

  return {
    id: tutor.id,
    name: tutor.name,
    image: tutor.image,
    role: tutor.role,
    thumbnail: tutor.thumbnail,
    video: tutor.video,
    bio: tutor.bio,
    about: tutor.about,
    gender: tutor.gender,
    notice: tutor.notice,
    ...meta,
  };
}

export async function asTutorInfoResponseBody(
  ctutor: ITutor.Cache
): Promise<ITutor.FindTutorInfoApiResponse> {
  const assets = await withImageUrl({
    image: ctutor.image,
    video: ctutor.video,
    thumbnail: ctutor.thumbnail,
  });
  return {
    id: ctutor.id,
    name: ctutor.name,
    bio: ctutor.bio,
    about: ctutor.about,
    topics: ctutor.topics,
    role: ctutor.role,
    studentCount: ctutor.studentCount,
    lessonCount: ctutor.lessonCount,
    avgRating: ctutor.avgRating,
    notice: ctutor.notice,
    ...assets,
  };
}

export async function getTutoringMinutes(
  data: ILesson.Self[]
): Promise<ITutor.FindTutoringMinutesApiResponse> {
  // from tutorId to tutorMinutes
  const tutoringMap = new Map<number, number>();

  const lessonIds = data.map((lesson) => lesson.id);
  const allLessonMembers = await lessons.findLessonMembers(lessonIds);

  // from lessonId to tutorId
  const lessonsTutorMap = new Map<number, number>();
  allLessonMembers.forEach((member) => {
    if ([IUser.Role.Tutor, IUser.Role.TutorManager].includes(member.role))
      lessonsTutorMap.set(member.lessonId, member.userId);
  });

  for (const lesson of data) {
    const tutor = lessonsTutorMap.get(lesson.id);
    if (!tutor) continue;

    // Accumulate tutoring minutes for each tutor
    const currentMinutes = tutoringMap.get(tutor) || 0;
    tutoringMap.set(tutor, currentMinutes + lesson.duration);
  }

  return Array.from(tutoringMap.entries())
    .map(([tutorId, tutoringMinutes]) => ({ tutorId, tutoringMinutes }))
    .sort((a, b) => b.tutoringMinutes - a.tutoringMinutes);
}
