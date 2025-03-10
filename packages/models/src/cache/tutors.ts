import { CacheBase } from "@/cache/base";
import { ITutor } from "@litespace/types";
import { isEmpty } from "lodash";

export class Tutors extends CacheBase {
  readonly key = "tutors";
  readonly ttl = 60 * 60 * 24; // 24 hours

  async setOne(tutor: ITutor.Cache) {
    const exists = await this.exists();
    const key = this.key;
    const field = this.asField(tutor.id);
    const value = this.encode(tutor);

    if (exists) return await this.client.hSet(key, field, value);

    await this.client
      .multi()
      .hSet(key, field, value)
      .expire(this.key, this.ttl)
      .exec();
  }

  async getOne(id: number): Promise<ITutor.Cache | null> {
    const result = await this.client.hGet(this.key, this.asField(id));
    if (!result) return null;
    return this.decode(result);
  }

  async setMany(tutors: ITutor.Cache[]) {
    const cache: Record<string, string> = {};

    for (const tutor of tutors) {
      cache[this.asField(tutor.id)] = this.encode(tutor);
    }

    if (isEmpty(cache)) return;
    await this.client
      .multi()
      .hSet(this.key, cache)
      .expire(this.key, this.ttl)
      .exec();
  }

  async getAll(): Promise<ITutor.Cache[]> {
    const result = await this.client.hGetAll(this.key);
    const tutors = Object.values(result);
    return tutors.map((tutor) => this.decode(tutor));
  }

  async exists(): Promise<boolean> {
    const output = await this.client.exists(this.key);
    return !!output;
  }

  async removeOne(id: number): Promise<void> {
    await this.client.hDel(this.key, this.asField(id));
  }

  asField(id: number): string {
    return id.toString();
  }
}
