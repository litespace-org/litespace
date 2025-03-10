import { ITutor, IUser } from "@litespace/types";
import { Knex } from "knex";
import { tutors, knex, lessons, topics, ratings } from "@litespace/models";
import { first, orderBy } from "lodash";
import { cache } from "@/lib/cache";
import { Gender } from "@litespace/types/dist/esm/user";
import { withImageUrl } from "@/lib/user";

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
    const onboarded = list.filter((tutor) => isOnboard(tutor));
    const tutorIds = onboarded.map((tutor) => tutor.id);

    return await Promise.all([
      list,
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
  userGender,
}: {
  tutors: ITutor.Cache[];
  userGender?: Gender;
}): ITutor.Cache[] {
  const iteratees = [
    (tutor: ITutor.Cache) => {
      if (!userGender) return 0; // disable ordering by gender if user is not logged in or gender is unkown
      if (!tutor.gender) return Infinity;
      const same = userGender === tutor.gender;
      return same ? 0 : 1;
    },
    "notice",
  ];
  const orders: Array<"asc" | "desc"> = ["asc", "asc"];
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
  tutor: ITutor.FullTutor,
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
    thumbnail: tutor.thumbnail,
    video: tutor.video,
    bio: tutor.bio,
    about: tutor.about,
    gender: tutor.gender,
    notice: tutor.notice,
    ...meta,
  };
}

/*
 * check whether a tutor is activated (onboard) or not.
 */
export function isOnboard({
  activated,
  activatedBy,
  verifiedEmail,
  verifiedPhone,
  video,
  image,
  thumbnail,
  name,
  birthYear,
  about,
  bio,
  phone,
  role,
  city,
  studioId,
}: ITutor.FullTutor): boolean {
  const base =
    !!verifiedEmail &&
    !!verifiedPhone &&
    !!image &&
    !!name &&
    !!about &&
    !!bio &&
    !!phone &&
    !!city;

  if (role === IUser.Role.TutorManager) return base;

  return (
    base &&
    !!activated &&
    !!activatedBy &&
    !!video &&
    !!thumbnail &&
    !!birthYear &&
    !!studioId
  );
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
    studentCount: ctutor.studentCount,
    lessonCount: ctutor.lessonCount,
    avgRating: ctutor.avgRating,
    notice: ctutor.notice,
    ...assets,
  };
}
