import { CacheBase } from "@/cache/base";
import { IRule } from "@litespace/types";

export class Rules extends CacheBase {
  readonly key = "rules";

  async setOne({ tutor, rule, events }: IRule.Cache) {
    await this.client.hSet(
      this.key,
      this.asField({ tutor, rule }),
      this.encode(events)
    );
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

  async setMany(payload: IRule.Cache[]) {
    const cache: Record<string, string> = {};
    for (const { tutor, rule, events } of payload) {
      cache[this.asField({ tutor, rule })] = this.encode(events);
    }

    await this.client.hSet(this.key, cache);
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
