import { down } from "./shared";
import { knex } from "@litespace/models";

export default async function teardown() {
  await down();
  await knex.destroy();
}
