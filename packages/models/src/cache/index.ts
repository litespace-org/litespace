import { createClient } from "redis";
import { Tutors } from "@/cache/tutors";
import { Rules } from "@/cache/rules";

export class Cache {
  public tutors: Tutors;
  public rules: Rules;

  constructor(url: string) {
    const client = createClient({ url });
    this.tutors = new Tutors(client);
    this.rules = new Rules(client);
  }
}
