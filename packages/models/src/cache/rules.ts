import { CacheBase } from "@/cache/base";
import { IRule } from "@litespace/types";
import { isEmpty } from "lodash";

export class Rules extends CacheBase {
  readonly key = "rules";
  readonly ttl = 60 * 60 * 24; // 24 hours

  async setOne({ tutor, rule, events }: IRule.Cache) {
    const exists = await this.exists();
    const filed = this.asField({ tutor, rule });
    const value = this.encode(events);

    if (exists) return await this.client.hSet(this.key, filed, value);

    await this.client
      .multi()
      .hSet(this.key, filed, value)
      .expire(this.key, this.ttl)
      .exec();
  }

  async getOne({
    tutor,
    rule,
  }: {
    tutor: number;
    rule: number;
  }): Promise<IRule.RuleEvent[] | null> {
    const result = await this.client.hGet(
      this.key,
      this.asField({ tutor, rule })
    );
    if (!result) return null;
    return this.decode(result);
  }

  async deleteOne({ tutor, rule }: { tutor: number; rule: number }) {
    await this.client.hDel(this.key, this.asField({ tutor, rule }));
  }

  async setMany(payload: IRule.Cache[]) {
    const cache: Record<string, string> = {};
    for (const { tutor, rule, events } of payload) {
      cache[this.asField({ tutor, rule })] = this.encode(events);
    }

    if (isEmpty(cache)) return;
    await this.client
      .multi()
      .hSet(this.key, cache)
      .expire(this.key, this.ttl)
      .exec();
  }

  async getAll(): Promise<IRule.Cache[]> {
    const result = await this.client.hGetAll(this.key);
    const rules: IRule.Cache[] = [];

    for (const [key, value] of Object.entries(result)) {
      const [tutor, rule] = key.split(":");
      rules.push({
        tutor: Number(tutor),
        rule: Number(rule),
        events: this.decode(value),
      });
    }

    return rules;
  }

  async exists(): Promise<boolean> {
    const output = await this.client.exists(this.key);
    return !!output;
  }

  asField({ tutor, rule }: { tutor: number; rule: number }): string {
    return `${tutor}:${rule}`;
  }
}
