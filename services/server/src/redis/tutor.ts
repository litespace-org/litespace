import { client } from "@/redis/client";
import { CacheKey } from "@/redis/keys";
import { ITutor } from "@litespace/types";
import dayjs from "@/lib/dayjs";

const ttl = 60 * 60 * 24 * 15; // (seconds * minutes * hours * days)

export const availableTutorsCache = {
  async getDates() {
    const [start, end] = await Promise.all([
      client.get(CacheKey.TutorListCacheStart),
      client.get(CacheKey.TutorListCacheEnd),
    ]);
    return {
      start: start ? dayjs.utc(start) : null,
      end: end ? dayjs.utc(end) : null,
    };
  },

  async set({ start, end, tutors, unpackedRules }: ITutor.Cache) {
    await client
      .multi()
      .set(CacheKey.TutorListCacheStart, start, { EX: ttl })
      .set(CacheKey.TutorListCacheEnd, end, { EX: ttl })
      .set(CacheKey.TutorList, JSON.stringify(tutors), { EX: ttl })
      .set(CacheKey.TutorListUnpackedRules, JSON.stringify(unpackedRules), {
        EX: ttl,
      })
      .exec();
  },

  async setTutors(tutors: ITutor.Cache["tutors"]): Promise<void> {
    await client.set(CacheKey.TutorList, JSON.stringify(tutors), { EX: ttl });
  },

  async getTutors(): Promise<ITutor.Cache["tutors"] | null> {
    const tutors = await client.get(CacheKey.TutorList);
    return tutors ? JSON.parse(tutors) : null;
  },

  async setRules(rules: ITutor.Cache["unpackedRules"]) {
    await client.set(CacheKey.TutorListUnpackedRules, JSON.stringify(rules), {
      EX: ttl,
    });
  },

  async getRules(): Promise<ITutor.Cache["unpackedRules"] | null> {
    const rules = await client.get(CacheKey.TutorListUnpackedRules);
    return rules ? JSON.parse(rules) : null;
  },

  async exists() {
    const [tutors, rules] = await Promise.all([
      client.exists(CacheKey.TutorList),
      client.exists(CacheKey.TutorListUnpackedRules),
    ]);
    return !!tutors && !!rules;
  },
};
