import { CacheBase } from "@/cache/base";
import { ITutor } from "@litespace/types";

const ttl = 60 * 60 * 24; // 24 hours

export class Tutors extends CacheBase {
  readonly key = "tutors";

  async setOne(tutor: ITutor.FullTutor) {
    await this.client.hSet(
      this.key,
      this.asField(tutor.id),
      this.encode(tutor)
    );
  }

  async getOne(id: number): Promise<ITutor.FullTutor | null> {
    const result = await this.client.hGet(this.key, this.asField(id));
    if (!result) return null;
    // todo: validate the result schema using zod.
    return this.decode(result);
  }

  async setMany(tutors: ITutor.FullTutor[]) {
    const cache: Record<string, string> = {};

    for (const tutor of tutors) {
      cache[this.asField(tutor.id)] = this.encode(tutor);
    }

    await this.client.hSet(this.key, cache);
  }

  async getAll(): Promise<ITutor.FullTutor[]> {
    const result = await this.client.hGetAll(this.key);
    const tutors = Object.values(result);
    return tutors.map((tutor) => this.decode(tutor));
  }

  async exists(): Promise<boolean> {
    const output = await this.client.exists(this.key);
    return !!output;
  }

  asField(id: number): string {
    return id.toString();
  }
}
